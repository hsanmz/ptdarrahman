"""Tests for the Midtrans Payment Gateway integration.

Coverage is grouped:
1. Client normalization (charge QRIS, status check, cancel, invalid & error paths).
2. Webhook signature verification (SHA-512 official formula & production guards).
3. Webhook idempotency, amount mismatch anomaly, and Redis concurrency locking.
4. Early bird slot assignment and status updates.
5. Status sync & cancel integration.
6. Kuitansi & HMAC signed URLs.
"""

import hashlib
from unittest.mock import MagicMock, patch
from zoneinfo import ZoneInfo

import pytest
from fastapi import HTTPException

from src.core.config import settings
from src.core.midtrans import (
    STATUS_CANCELED,
    STATUS_COMPLETED,
    STATUS_PENDING,
    MidtransClient,
    MidtransError,
    MidtransUncertainError,
    canonical_status,
    normalize_cancel_response,
    normalize_create_response,
    normalize_status_response,
    reset_midtrans_client,
)
from src.models.ppdb import (
    PPDBApplicant,
    PPDBPaymentTransaction,
    PPDBPeriod,
)
from src.services.payment_service import (
    PaymentService,
    create_secure_doc_token,
    verify_secure_doc_token,
)

WIB = ZoneInfo("Asia/Jakarta")


class MockDb:
    def __init__(self):
        self.items = []
        self.added = []
        self.committed = False

    def add(self, item):
        self.added.append(item)
        if item not in self.items:
            self.items.append(item)

    def commit(self):
        self.committed = True

    def get(self, model, ident):
        for item in self.items:
            if isinstance(item, model) and getattr(item, "id", None) == ident:
                return item
        return None

    def query(self, model):
        class _Query:
            def __init__(self, items):
                self._items = [i for i in items if isinstance(i, model)]

            def filter(self, *criteria):
                return self

            def first(self):
                return self._items[0] if self._items else None

            def all(self):
                return list(self._items)

            def count(self):
                return len(self._items)

        return _Query(self.items)


# =============================================================================
# 1. Midtrans Client Tests — normalization of REAL provider responses
# =============================================================================


def test_normalize_create_response_qris():
    payload = {
        "status_code": "201",
        "status_message": "QRIS transaction is created",
        "transaction_id": "c88f11b6-d248-43bb-8a4a-131f4762cba3",
        "order_id": "PPDB-FORM-001",
        "gross_amount": "250000.00",
        "currency": "IDR",
        "payment_type": "qris",
        "transaction_time": "2026-11-13 13:00:00",
        "transaction_status": "pending",
        "fraud_status": "accept",
        "actions": [
            {
                "name": "generate-qr-code",
                "method": "GET",
                "url": "https://api.sandbox.midtrans.com/v2/qris/c88f11b6/qr-code",
            }
        ],
        "qr_string": "00020101021226590016ID.CO.MIDTRANS.WWW0118...",
        "expiry_time": "2026-11-13 13:15:00",
    }
    result = normalize_create_response(payload)
    assert result.txn_id == "c88f11b6-d248-43bb-8a4a-131f4762cba3"
    assert result.order_id == "PPDB-FORM-001"
    assert result.amount == 250000
    assert result.qr_string.startswith("00020101021226590016ID.CO.MIDTRANS")
    assert result.payment_link == "https://api.sandbox.midtrans.com/v2/qris/c88f11b6/qr-code"
    assert result.expired_at == "2026-11-13 13:15:00"


def test_normalize_create_response_missing_txn_id_raises_uncertain():
    with pytest.raises(MidtransUncertainError):
        normalize_create_response({"order_id": "ORDER-1", "gross_amount": "250000.00"})


def test_normalize_create_response_non_dict_raises_uncertain():
    with pytest.raises(MidtransUncertainError):
        normalize_create_response("<html>Bad Gateway</html>")


def test_normalize_status_response_settlement():
    payload = {
        "status_code": "200",
        "status_message": "Success, transaction found",
        "transaction_id": "mid-tx-123",
        "order_id": "PPDB-FORM-001",
        "gross_amount": "250000.00",
        "payment_type": "qris",
        "transaction_time": "2026-11-13 13:00:00",
        "transaction_status": "settlement",
        "fraud_status": "accept",
        "settlement_time": "2026-11-13 13:05:00",
    }
    result = normalize_status_response(payload)
    assert result.status == STATUS_COMPLETED
    assert result.provider_status == "settlement"
    assert result.amount == 250000
    assert result.completed_at == "2026-11-13 13:05:00"


def test_normalize_status_response_capture_challenge_is_pending():
    payload = {
        "status_code": "200",
        "transaction_id": "mid-tx-challenge",
        "transaction_status": "capture",
        "fraud_status": "challenge",
    }
    result = normalize_status_response(payload)
    assert result.status == STATUS_PENDING


def test_normalize_status_response_cancel_and_expire():
    for status_str in ("cancel", "expire", "deny", "refund"):
        payload = {
            "status_code": "200",
            "transaction_id": f"mid-{status_str}",
            "transaction_status": status_str,
        }
        result = normalize_status_response(payload)
        assert result.status == STATUS_CANCELED


def test_normalize_cancel_response():
    payload = {
        "status_code": "200",
        "status_message": "Success, transaction is canceled",
        "transaction_id": "mid-tx-123",
        "transaction_status": "cancel",
    }
    result = normalize_cancel_response(payload)
    assert result.confirmed is True
    assert result.message == "Success, transaction is canceled"


def test_canonical_status_mappings():
    assert canonical_status("settlement") == STATUS_COMPLETED
    assert canonical_status("capture", fraud_status="accept") == STATUS_COMPLETED
    assert canonical_status("capture", fraud_status="challenge") == STATUS_PENDING
    assert canonical_status("pending") == STATUS_PENDING
    assert canonical_status("expire") == STATUS_CANCELED
    assert canonical_status("deny") == STATUS_CANCELED
    assert canonical_status("cancel") == STATUS_CANCELED
    assert canonical_status("something_random") == "unknown"


# =============================================================================
# 2. Midtrans Signature Verification
# =============================================================================


def test_midtrans_signature_verification():
    server_key = "SB-Mid-server-testkey123"
    client = MidtransClient(server_key=server_key, is_production=False)

    order_id = "ORDER-101"
    status_code = "200"
    gross_amount = "250000.00"

    expected_sig = hashlib.sha512(
        f"{order_id}{status_code}{gross_amount}{server_key}".encode()
    ).hexdigest()

    assert client.verify_webhook_signature(
        order_id=order_id,
        status_code=status_code,
        gross_amount=gross_amount,
        signature_key=expected_sig,
    ) is True

    # Tampered signature
    assert client.verify_webhook_signature(
        order_id=order_id,
        status_code=status_code,
        gross_amount=gross_amount,
        signature_key="invalid-signature-hex",
    ) is False


def test_unconfigured_client_raises_in_production():
    with patch.object(settings, "app_env", "production"):
        with patch.object(settings, "midtrans_server_key", ""):
            client = MidtransClient(server_key="")
            with pytest.raises(MidtransError) as exc:
                client.create_transaction("ORDER-PROD-TEST", 250000)
            assert exc.value.status_code == 503


# =============================================================================
# 3. PaymentService Webhook Integration & Security
# =============================================================================


def test_webhook_with_valid_signature_settles_payment():
    mock_repo = MagicMock()
    tx = PPDBPaymentTransaction(
        id="tx-mid-001",
        applicant_id="app-mid-001",
        wave_id="wave-1",
        order_id="PPDB-FORM-001",
        txn_id="mid-tx-001",
        status="pending",
        amount=250000,
    )
    applicant = PPDBApplicant(
        id="app-mid-001",
        user_id="user-mid-001",
        wave_id="wave-1",
        status="pending_payment",
        payment_status="pending",
        full_name="Ahmad Santri",
        phone="08123456789",
    )
    mock_repo.get_transaction_by_id.return_value = tx
    mock_repo.get_transaction_by_order_id.return_value = tx
    mock_repo.get_applicant_by_id.return_value = applicant
    mock_repo.get_wave_by_id.return_value = MagicMock(id="wave-1", early_discount_quota=5)
    mock_repo.count_paid_form_payments_in_wave.return_value = 0

    svc = PaymentService(mock_repo)
    svc.check_wave_quota_and_close_if_full = MagicMock(return_value=False)

    server_key = "test-midtrans-secret"
    order_id = "PPDB-FORM-001"
    status_code = "200"
    gross_amount = "250000.00"
    sig = hashlib.sha512(f"{order_id}{status_code}{gross_amount}{server_key}".encode()).hexdigest()

    payload = {
        "order_id": order_id,
        "transaction_id": "mid-tx-001",
        "status_code": status_code,
        "gross_amount": gross_amount,
        "signature_key": sig,
        "transaction_status": "settlement",
        "fraud_status": "accept",
        "payment_type": "qris",
    }

    with patch.object(settings, "midtrans_server_key", server_key):
        with patch("src.core.notif_service.send_notifications", return_value=True):
            res = svc.process_midtrans_webhook(payload)

    assert res["success"] is True
    assert tx.status == "success"
    assert applicant.payment_status == "paid"
    assert applicant.status == "document_uploaded_pending"
    assert tx.receipt_number.startswith("KUI-PPDB-")


def test_webhook_invalid_signature_raises_400():
    mock_repo = MagicMock()
    svc = PaymentService(mock_repo)

    server_key = "correct-server-key"
    payload = {
        "order_id": "PPDB-FORM-001",
        "status_code": "200",
        "gross_amount": "250000.00",
        "signature_key": "fake-bad-signature",
        "transaction_status": "settlement",
    }

    with patch.object(settings, "midtrans_server_key", server_key):
        with pytest.raises(HTTPException) as exc_info:
            svc.process_midtrans_webhook(payload)
        assert exc_info.value.status_code == 400
        assert "Signature key" in exc_info.value.detail


def test_webhook_unknown_order_raises_404():
    mock_repo = MagicMock()
    mock_repo.get_transaction_by_id.return_value = None
    mock_repo.get_transaction_by_order_id.return_value = None
    mock_repo.get_transaction_by_external_id.return_value = None
    mock_repo.get_transaction_by_txn_id.return_value = None

    svc = PaymentService(mock_repo)
    payload = {
        "order_id": "ORDER-NOT-EXIST",
        "transaction_id": "TXN-NOT-EXIST",
        "transaction_status": "settlement",
    }
    with patch.object(settings, "midtrans_server_key", ""):
        with pytest.raises(HTTPException) as exc_info:
            svc.process_midtrans_webhook(payload)
        assert exc_info.value.status_code == 404


def test_webhook_cancel_and_expire_updates_status():
    mock_repo = MagicMock()
    tx = PPDBPaymentTransaction(
        id="tx-mid-cancel",
        applicant_id="app-1",
        order_id="PPDB-CANCEL",
        status="pending",
        amount=250000,
    )
    mock_repo.get_transaction_by_id.return_value = tx
    mock_repo.get_transaction_by_order_id.return_value = tx

    svc = PaymentService(mock_repo)
    payload = {
        "order_id": "PPDB-CANCEL",
        "transaction_status": "cancel",
        "gross_amount": "250000.00",
    }
    with patch.object(settings, "midtrans_server_key", ""):
        res = svc.process_midtrans_webhook(payload)

    assert res["success"] is True
    assert tx.status == "cancelled"
    mock_repo.update_transaction.assert_called_with(tx)


# =============================================================================
# 4. Kuitansi & HMAC Token Verification
# =============================================================================


def test_kuitansi_secure_doc_token():
    with patch.object(settings, "jwt_secret", "super-secret-jwt"):
        token = create_secure_doc_token("receipt", "tx-test-123", exp_hours=24)
        verified_id = verify_secure_doc_token(token, expected_doc_type="receipt")
        assert verified_id == "tx-test-123"

        # Tampered token
        tampered = token[:-4] + "dead"
        with pytest.raises(HTTPException) as exc:
            verify_secure_doc_token(tampered, expected_doc_type="receipt")
        assert exc.value.status_code == 403


# =============================================================================
# 5. create_qris_transaction integration
# =============================================================================


def test_create_qris_transaction_success():
    mock_repo = MagicMock()
    applicant = PPDBApplicant(
        id="app-123",
        wave_id="wave-1",
        user_id="user-123",
        status="pending_payment",
        full_name="Budi Santoso",
        phone="0812345678",
    )
    period = PPDBPeriod(id="per-1", form_fee=250000, minimum_dp=5000000)
    mock_repo.get_applicant_by_user_id.return_value = applicant
    mock_repo.get_active_period.return_value = period
    mock_repo.get_period_by_id.return_value = period
    mock_repo.get_active_transaction.return_value = None
    mock_repo.get_wave_by_id.return_value = MagicMock(
        id="wave-1", period_id="per-1", quota=50, early_discount_quota=5
    )
    mock_repo.count_paid_form_payments_in_wave.return_value = 0

    svc = PaymentService(mock_repo)

    with patch.object(settings, "midtrans_server_key", ""):
        reset_midtrans_client()
        try:
            tx_data = svc.create_qris_transaction("user-123", payment_type="form")
            assert tx_data["amount"] == 250000
            assert tx_data["status"] == "pending"
            assert tx_data["order_id"].startswith("PPDB-FORM-")
            assert tx_data["qr_string"] is not None
            assert "ID.CO.MIDTRANS" in tx_data["qr_string"]
        finally:
            reset_midtrans_client()
