"""apps/api/src/core/midtrans.py

Midtrans Core API & Snap client + centralized response normalization.

Official documentation reference:
- Core API Charge (QRIS): https://docs.midtrans.com/reference/charge-payment
- Transaction Status: https://docs.midtrans.com/reference/check-transaction-status
- Cancel Transaction: https://docs.midtrans.com/reference/cancel-transaction
- HTTP Notification Webhook: https://docs.midtrans.com/docs/https-notification-webhooks

Homogenisasi error:
- ``MidtransError``          → kegagalan pasti (ditolak gateway / kredensial
  belum diatur di production). Aman untuk tidak menyimpan transaksi.
- ``MidtransUncertainError`` → hasil tidak pasti (timeout, 5xx, body rusak).
  Pemanggil harus melakukan rekonsiliasi, bukan menganggap gagal.
"""

from __future__ import annotations

import base64
import datetime
import hashlib
import hmac
import logging
from dataclasses import dataclass, field
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from src.core.config import settings

logger = logging.getLogger("ptdarrahman.midtrans")
WIB = ZoneInfo("Asia/Jakarta")

# ── Canonical status provider ────────────────────────────────────────────────
STATUS_PENDING = "pending"
STATUS_COMPLETED = "completed"
STATUS_CANCELED = "canceled"
STATUS_UNKNOWN = "unknown"

_SUCCESS_STATUSES = {"completed", "paid", "success", "settlement", "lunas"}
_PENDING_STATUSES = {"pending", "unpaid", "waiting", "menunggu", "processing", "authorize"}
_CANCELED_STATUSES = {
    "canceled",
    "cancelled",
    "failed",
    "expired",
    "expire",
    "gagal",
    "batal",
    "denied",
    "deny",
    "refund",
    "partial_refund",
}

_MAX_LOGGED_BODY = 500


class MidtransError(Exception):
    """Kegagalan pasti dari gateway (permintaan ditolak / salah konfigurasi)."""

    def __init__(self, message: str, status_code: int = 502, details: Any = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class MidtransUncertainError(MidtransError):
    """Hasil gateway tidak dapat dipastikan → wajib rekonsiliasi.

    Dipakai untuk timeout jaringan, respons 5xx, atau body yang tidak lengkap.
    Semantik penting: transaksi bisa saja sudah dibuat di sisi provider, jadi
    pemanggil TIDAK boleh menandainya gagal/expired tanpa verifikasi.
    """


# ── Dataclasses hasil normalisasi ───────────────────────────────────────────


@dataclass(frozen=True)
class CreateTransactionResult:
    txn_id: str
    order_id: str | None
    amount: int | None
    fee: int | None
    total_payment: int | None
    payment_method: str | None
    qr_string: str | None
    payment_link: str | None
    va_number: str | None
    expired_at: str | None
    is_sandbox: bool
    raw: dict[str, Any] = field(repr=False)


@dataclass(frozen=True)
class TransactionStatusResult:
    txn_id: str | None
    order_id: str | None
    amount: int | None
    status: str  # canonical: pending | completed | canceled | unknown
    provider_status: str  # nilai mentah dari provider (lowercase)
    completed_at: str | None
    is_sandbox: bool
    raw: dict[str, Any] = field(repr=False)


@dataclass(frozen=True)
class CancelTransactionResult:
    confirmed: bool
    message: str | None
    raw: dict[str, Any] = field(repr=False)


# ── Helpers normalisasi ─────────────────────────────────────────────────────


def _redact(text: str) -> str:
    """Buang kredensial dari teks yang akan di-log/di-request-detail."""
    for secret in (settings.midtrans_server_key, settings.midtrans_client_key):
        if secret:
            text = text.replace(secret, "***")
    return text


def _safe_body(resp: httpx.Response | None) -> str:
    if resp is None:
        return ""
    try:
        text = resp.text or ""
    except Exception:
        return ""
    return _redact(text)[:_MAX_LOGGED_BODY]


def _safe_dump(value: Any) -> str:
    try:
        import json

        return _redact(json.dumps(value, default=str))[:_MAX_LOGGED_BODY]
    except Exception:
        return _redact(str(value))[:_MAX_LOGGED_BODY]


def _as_dict(value: Any) -> dict[str, Any] | None:
    return value if isinstance(value, dict) else None


def _as_str(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _as_int(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        # Handles "150000.00" string as well
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _unwrap_response(raw: Any) -> dict[str, Any]:
    """Terima format datar Midtrans maupun format dictionary standar."""
    data = _as_dict(raw)
    if data is None:
        raise MidtransUncertainError(
            "Respons gateway bukan objek JSON yang valid",
            details=_safe_dump(raw),
        )
    nested = data.get("data")
    if isinstance(nested, dict):
        return nested
    return data


def canonical_status(raw: Any, fraud_status: str | None = None) -> str:
    """Petakan status mentah provider ke himpunan kanonik Midtrans."""
    value = str(raw or "").strip().lower()
    fraud = str(fraud_status or "").strip().lower()

    if value == "capture":
        if fraud == "challenge":
            return STATUS_PENDING
        return STATUS_COMPLETED
    if value in _SUCCESS_STATUSES:
        return STATUS_COMPLETED
    if value in _CANCELED_STATUSES:
        return STATUS_CANCELED
    if value in _PENDING_STATUSES:
        return STATUS_PENDING
    return STATUS_UNKNOWN


def normalize_create_response(raw: Any) -> CreateTransactionResult:
    """Normalisasi respons create/charge transaction; wajib memuat ``txn_id``."""
    data = _unwrap_response(raw)

    txn_id = _as_str(data.get("transaction_id") or data.get("txn_id"))
    if not txn_id:
        raise MidtransUncertainError(
            "Respons create-transaction tidak memuat transaction_id",
            details=_safe_dump(raw),
        )

    # Ekstrak qr_string dan payment_link dari data atau actions
    qr_string = _as_str(data.get("qr_string") or data.get("payment_number"))
    payment_link = _as_str(data.get("payment_link") or data.get("redirect_url"))

    actions = data.get("actions")
    if isinstance(actions, list):
        for act in actions:
            if isinstance(act, dict):
                act_name = str(act.get("name") or "").lower()
                act_url = act.get("url")
                if not payment_link and act_name in ("generate-qr-code", "deeplink-redirect"):
                    payment_link = act_url
                if not qr_string and act_name == "generate-qr-code" and act.get("qr_string"):
                    qr_string = act.get("qr_string")

    amount = _as_int(data.get("gross_amount") or data.get("amount"))
    expired_at = _as_str(data.get("expiry_time") or data.get("expired_at"))

    return CreateTransactionResult(
        txn_id=txn_id,
        order_id=_as_str(data.get("order_id")),
        amount=amount,
        fee=_as_int(data.get("fee")),
        total_payment=amount,
        payment_method=_as_str(data.get("payment_type") or data.get("payment_method") or "qris"),
        qr_string=qr_string,
        payment_link=payment_link,
        va_number=_as_str(data.get("va_number")),
        expired_at=expired_at,
        is_sandbox=bool(data.get("is_sandbox", not settings.midtrans_is_production)),
        raw=data,
    )


def normalize_status_response(raw: Any) -> TransactionStatusResult:
    """Normalisasi respons transaction-status; wajib memuat ``status``."""
    data = _unwrap_response(raw)
    provider_status = _as_str(
        data.get("transaction_status") or data.get("status") or data.get("payment_status")
    )
    if not provider_status:
        raise MidtransUncertainError(
            "Respons status transaksi tidak memuat field transaction_status",
            details=_safe_dump(raw),
        )
    fraud_status = _as_str(data.get("fraud_status"))
    return TransactionStatusResult(
        txn_id=_as_str(data.get("transaction_id") or data.get("txn_id")),
        order_id=_as_str(data.get("order_id")),
        amount=_as_int(data.get("gross_amount") or data.get("amount")),
        status=canonical_status(provider_status, fraud_status=fraud_status),
        provider_status=provider_status.lower(),
        completed_at=_as_str(
            data.get("settlement_time") or data.get("completed_at") or data.get("transaction_time")
        ),
        is_sandbox=bool(data.get("is_sandbox", not settings.midtrans_is_production)),
        raw=data,
    )


def normalize_cancel_response(raw: Any) -> CancelTransactionResult:
    data = _unwrap_response(raw)
    status_code = str(data.get("status_code") or "")
    tx_status = str(data.get("transaction_status") or data.get("status") or "").lower()

    confirmed = status_code in ("200", "412") or tx_status in ("cancel", "canceled", "cancelled")
    message = _as_str(data.get("status_message") or data.get("message"))
    return CancelTransactionResult(confirmed=confirmed, message=message, raw=data)


# ── Sandbox Deterministic Generator ──────────────────────────────────────────


def _sandbox_create_result(
    order_id: str, amount: int, method: str = "qris"
) -> CreateTransactionResult:
    """Mock respons QRIS Midtrans deterministik untuk local dev / CI tanpa API key."""
    now = datetime.datetime.now(WIB)
    expired_at = now + datetime.timedelta(minutes=15)
    txn_id = f"midtrans-sandbox-{order_id}"

    qr_raw = (
        f"00020101021226590016ID.CO.MIDTRANS.WWW0118936000020110000000"
        f"0215{order_id:0<15}51440014ID.CO.QRIS.WWW0215{order_id:0<15}"
        f"520458125303360540{len(str(amount)):02d}{amount}5802ID5911PTDARRAHMAN"
        f"6006BOGOR61051661062070703A016304"
    )
    crc = hashlib.md5(f"{order_id}-{amount}".encode()).hexdigest()[:4].upper()
    qr_string = f"{qr_raw}{crc}"

    data = {
        "status_code": "201",
        "status_message": "QRIS transaction is created",
        "transaction_id": txn_id,
        "order_id": order_id,
        "gross_amount": f"{amount:.2f}",
        "currency": "IDR",
        "payment_type": method,
        "transaction_time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "transaction_status": "pending",
        "fraud_status": "accept",
        "qr_string": qr_string,
        "actions": [
            {
                "name": "generate-qr-code",
                "method": "GET",
                "url": f"https://api.sandbox.midtrans.com/v2/qris/{txn_id}/qr-code",
            }
        ],
        "expiry_time": expired_at.strftime("%Y-%m-%d %H:%M:%S"),
        "is_sandbox": True,
    }
    return normalize_create_response(data)


# ── Midtrans Client ──────────────────────────────────────────────────────────


class MidtransClient:
    def __init__(
        self,
        server_key: str | None = None,
        client_key: str | None = None,
        is_production: bool | None = None,
    ):
        self.server_key = (
            server_key if server_key is not None else settings.midtrans_server_key
        ).strip()
        self.client_key = (
            client_key if client_key is not None else settings.midtrans_client_key
        ).strip()
        self.is_production = (
            is_production
            if is_production is not None
            else bool(settings.midtrans_is_production)
        )
        self.base_url = (
            "https://api.midtrans.com/v2"
            if self.is_production
            else "https://api.sandbox.midtrans.com/v2"
        )

    @property
    def configured(self) -> bool:
        return bool(self.server_key)

    def _auth_header(self) -> str:
        token = base64.b64encode(f"{self.server_key}:".encode("utf-8")).decode("utf-8")
        return f"Basic {token}"

    def _headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.server_key:
            headers["Authorization"] = self._auth_header()
        return headers

    def _guard_unconfigured(self, action: str) -> None:
        """Production tidak boleh diam-diam memakai mode sandbox tanpa kredensial."""
        if self.server_key:
            return
        if settings.is_production:
            raise MidtransError(
                f"MIDTRANS_SERVER_KEY belum dikonfigurasi — {action} ditolak "
                "di mode production.",
                status_code=503,
            )
        logger.warning(
            "MIDTRANS_SERVER_KEY tidak diset — %s memakai mode sandbox "
            "(hanya untuk non-production).",
            action,
        )

    def verify_webhook_signature(
        self,
        order_id: str,
        status_code: str,
        gross_amount: str,
        signature_key: str,
    ) -> bool:
        """Verifikasi signature key webhook resmi Midtrans (SHA-512).

        Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
        """
        if not self.server_key:
            if settings.is_production:
                return False
            # Di dev tanpa key, izinkan bila signature tidak diperiksa ketat
            return True

        raw_str = f"{order_id}{status_code}{gross_amount}{self.server_key}"
        expected_sig = hashlib.sha512(raw_str.encode("utf-8")).hexdigest()
        return hmac.compare_digest(expected_sig.lower(), str(signature_key).lower())

    def create_transaction(
        self,
        order_id: str,
        amount: int,
        method: str = "qris",
        item_name: str = "Biaya Formulir PPDB",
        customer_details: dict[str, Any] | None = None,
    ) -> CreateTransactionResult:
        """Charge transaksi QRIS Midtrans (find-or-create).

        POST /charge dengan payment_type="qris".
        """
        if amount <= 0:
            raise ValueError("Amount must be greater than 0")

        if not self.server_key:
            self._guard_unconfigured("create-transaction")
            return _sandbox_create_result(order_id, amount, method)

        url = f"{self.base_url}/charge"
        payload: dict[str, Any] = {
            "payment_type": "qris",
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": int(amount),
            },
            "item_details": [
                {
                    "id": "form_fee",
                    "price": int(amount),
                    "quantity": 1,
                    "name": item_name,
                }
            ],
            "qris": {
                "acquirer": "gopay",
            },
        }
        if customer_details:
            payload["customer_details"] = customer_details

        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.post(url, headers=self._headers(), json=payload)
        except httpx.RequestError as exc:
            logger.error("Midtrans create_transaction network error: %s", exc)
            raise MidtransUncertainError(
                f"Koneksi ke gateway Midtrans gagal: {exc}"
            ) from exc

        if resp.status_code >= 500:
            logger.error(
                "Midtrans create_transaction server error: %s - %s",
                resp.status_code,
                _safe_body(resp),
            )
            raise MidtransUncertainError(
                f"Gateway Midtrans membalas error server ({resp.status_code})",
                status_code=resp.status_code,
                details=_safe_body(resp),
            )

        # Jika order_id sudah pernah dibuat (406 duplicate), coba pulihkan via status
        if resp.status_code in (406, 400):
            try:
                body_check = resp.json()
                msg = str(body_check.get("status_message") or "").lower()
                if "order_id" in msg and ("used" in msg or "duplicate" in msg or "exist" in msg):
                    logger.info("Order ID %s sudah ada di Midtrans, memulihkan status...", order_id)
                    st = self.get_transaction_status(order_id)
                    return CreateTransactionResult(
                        txn_id=st.txn_id or f"midtrans-{order_id}",
                        order_id=order_id,
                        amount=st.amount or amount,
                        fee=None,
                        total_payment=st.amount or amount,
                        payment_method="qris",
                        qr_string=None,
                        payment_link=None,
                        va_number=None,
                        expired_at=None,
                        is_sandbox=st.is_sandbox,
                        raw=st.raw,
                    )
            except Exception:
                pass

        if resp.status_code >= 400:
            logger.warning(
                "Midtrans create_transaction rejected: %s - %s",
                resp.status_code,
                _safe_body(resp),
            )
            raise MidtransError(
                f"Midtrans menolak pembuatan transaksi ({resp.status_code})",
                status_code=resp.status_code,
                details=_safe_body(resp),
            )

        try:
            raw = resp.json()
        except ValueError as exc:
            raise MidtransUncertainError(
                "Body respons create-transaction bukan JSON yang valid",
                status_code=502,
                details=_safe_body(resp),
            ) from exc

        return normalize_create_response(raw)

    def get_transaction_status(
        self, order_id_or_txn_id: str
    ) -> TransactionStatusResult:
        """GET /{order_id_or_txn_id}/status."""
        if not order_id_or_txn_id:
            raise ValueError("order_id_or_txn_id must not be empty")

        if not self.server_key:
            self._guard_unconfigured("get-transaction-status")
            now = datetime.datetime.now(WIB)
            return normalize_status_response(
                {
                    "status_code": "200",
                    "status_message": "Success, mock status",
                    "transaction_id": f"midtrans-sandbox-{order_id_or_txn_id}",
                    "order_id": order_id_or_txn_id,
                    "gross_amount": "250000.00",
                    "transaction_status": "pending",
                    "fraud_status": "accept",
                    "transaction_time": now.strftime("%Y-%m-%d %H:%M:%S"),
                    "is_sandbox": True,
                }
            )

        url = f"{self.base_url}/{order_id_or_txn_id}/status"
        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.get(url, headers=self._headers())
        except httpx.RequestError as exc:
            logger.error("Midtrans get_transaction_status network error: %s", exc)
            raise MidtransUncertainError(
                f"Koneksi ke gateway Midtrans gagal: {exc}"
            ) from exc

        if resp.status_code >= 500:
            logger.error(
                "Midtrans get_transaction_status server error: %s - %s",
                resp.status_code,
                _safe_body(resp),
            )
            raise MidtransUncertainError(
                f"Gateway Midtrans membalas error server ({resp.status_code})",
                status_code=resp.status_code,
                details=_safe_body(resp),
            )

        if resp.status_code >= 400:
            logger.warning(
                "Midtrans get_transaction_status rejected: %s - %s",
                resp.status_code,
                _safe_body(resp),
            )
            raise MidtransError(
                f"Midtrans menolak pengecekan status ({resp.status_code})",
                status_code=resp.status_code,
                details=_safe_body(resp),
            )

        try:
            raw = resp.json()
        except ValueError as exc:
            raise MidtransUncertainError(
                "Body respons transaction-status bukan JSON yang valid",
                status_code=502,
                details=_safe_body(resp),
            ) from exc

        return normalize_status_response(raw)

    def cancel_transaction(
        self, order_id_or_txn_id: str
    ) -> CancelTransactionResult:
        """POST /{order_id_or_txn_id}/cancel."""
        if not order_id_or_txn_id:
            raise ValueError("order_id_or_txn_id must not be empty")

        if not self.server_key:
            self._guard_unconfigured("cancel-transaction")
            return normalize_cancel_response(
                {
                    "status_code": "200",
                    "status_message": "Success, mock cancel",
                    "transaction_status": "cancel",
                }
            )

        url = f"{self.base_url}/{order_id_or_txn_id}/cancel"
        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.post(url, headers=self._headers())
        except httpx.RequestError as exc:
            logger.error("Midtrans cancel_transaction network error: %s", exc)
            raise MidtransUncertainError(
                f"Koneksi ke gateway Midtrans gagal: {exc}"
            ) from exc

        if resp.status_code >= 500:
            logger.error(
                "Midtrans cancel_transaction server error: %s - %s",
                resp.status_code,
                _safe_body(resp),
            )
            raise MidtransUncertainError(
                f"Gateway Midtrans membalas error server ({resp.status_code})",
                status_code=resp.status_code,
                details=_safe_body(resp),
            )

        # 412 Precondition Failed biasa dikembalikan Midtrans bila transaksi
        # sudah tidak bisa dicancel (mis. sudah expired / canceled)
        if resp.status_code not in (200, 201, 412) and resp.status_code >= 400:
            logger.warning(
                "Midtrans cancel_transaction rejected: %s - %s",
                resp.status_code,
                _safe_body(resp),
            )
            raise MidtransError(
                f"Midtrans menolak pembatalan transaksi ({resp.status_code})",
                status_code=resp.status_code,
                details=_safe_body(resp),
            )

        try:
            raw = resp.json()
        except ValueError as exc:
            raise MidtransUncertainError(
                "Body respons cancel-transaction bukan JSON yang valid",
                status_code=502,
                details=_safe_body(resp),
            ) from exc

        return normalize_cancel_response(raw)


_default_client: MidtransClient | None = None


def get_midtrans_client() -> MidtransClient:
    global _default_client
    if _default_client is None:
        _default_client = MidtransClient()
    return _default_client


def reset_midtrans_client() -> None:
    global _default_client
    _default_client = None
