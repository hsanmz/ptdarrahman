"""Regression tests for Superadmin user, role, and applicant operations.

Validates:
- Trailing slash handling on /users, /roles, /modules
- Nullable/empty user email creation without collisions
- Username and email duplicate validation (clean 400)
- Superadmin protection and cascading user deletion
- Role creation with 'crud' and legacy 'access' normalization
- Duplicate role rejection and protected role deletion safeguards (400, 409)
- Notification recipients lightweight endpoint
- Applicant permanent deletion without StaleDataError
"""

import json
import uuid

import pytest
from fastapi.testclient import TestClient

from src.core.database import create_record, execute_raw
from src.core.security import hash_password
from src.main import app


@pytest.fixture(scope="module")
def client() -> TestClient:
    with TestClient(app) as c:
        # Login as superadmin to obtain session cookie
        resp = c.post("/auth/login", json={"username": "superadmin", "password": "SuperAdmin123!."})
        assert resp.status_code == 200, resp.text
        yield c


def test_trailing_slash_route_resolution(client: TestClient) -> None:
    """Verifies that routes work seamlessly with or without trailing slash."""
    for path in ["/users", "/users/", "/roles", "/roles/", "/modules", "/modules/"]:
        resp = client.get(path)
        assert resp.status_code == 200, f"Failed accessing {path}: {resp.status_code} - {resp.text}"


def test_user_create_with_null_and_empty_emails(client: TestClient) -> None:
    """Multiple users with empty or None email must not collide on unique constraint."""
    role_id = execute_raw("SELECT id FROM roles WHERE name = 'Admin PPDB' LIMIT 1")[0]["id"]
    u1_name = f"test_user_null_{uuid.uuid4().hex[:6]}"
    u2_name = f"test_user_empty_{uuid.uuid4().hex[:6]}"

    # User 1: email is None / null
    res1 = client.post("/users", json={
        "username": u1_name,
        "password": "Password123!.",
        "full_name": "Test User Null Email",
        "email": None,
        "role_id": role_id,
        "user_type": "admin",
        "is_active": True,
    })
    assert res1.status_code == 201, res1.text
    u1_data = res1.json()
    assert u1_data["email"] is None

    # User 2: email is empty string "" -> normalized to None
    res2 = client.post("/users", json={
        "username": u2_name,
        "password": "Password123!.",
        "full_name": "Test User Empty Email",
        "email": "   ",
        "role_id": role_id,
        "user_type": "admin",
        "is_active": True,
    })
    assert res2.status_code == 201, res2.text
    u2_data = res2.json()
    assert u2_data["email"] is None

    # Clean up
    client.delete(f"/users/{u1_data['id']}")
    client.delete(f"/users/{u2_data['id']}")


def test_user_duplicate_username_and_email_rejected(client: TestClient) -> None:
    """Ensures clean 400 responses for duplicate usernames and emails."""
    role_id = execute_raw("SELECT id FROM roles WHERE name = 'Admin PPDB' LIMIT 1")[0]["id"]
    u_name = f"test_dup_{uuid.uuid4().hex[:6]}"
    u_email = f"{u_name}@ptdarrahman.sch.id"

    # Create initial user
    res = client.post("/users", json={
        "username": u_name,
        "password": "Password123!.",
        "full_name": "Duplicate Test",
        "email": u_email,
        "role_id": role_id,
        "user_type": "admin",
        "is_active": True,
    })
    assert res.status_code == 201, res.text
    user_id = res.json()["id"]

    try:
        # Duplicate username
        res_dup_uname = client.post("/users", json={
            "username": u_name,
            "password": "Password123!.",
            "full_name": "Duplicate Name",
            "email": f"other_{u_email}",
            "role_id": role_id,
            "user_type": "admin",
            "is_active": True,
        })
        assert res_dup_uname.status_code == 400
        assert "Username sudah digunakan" in res_dup_uname.json()["detail"]

        # Duplicate email
        res_dup_email = client.post("/users", json={
            "username": f"other_{u_name}",
            "password": "Password123!.",
            "full_name": "Duplicate Email",
            "email": u_email,
            "role_id": role_id,
            "user_type": "admin",
            "is_active": True,
        })
        assert res_dup_email.status_code == 400
        assert "Email sudah digunakan" in res_dup_email.json()["detail"]

    finally:
        client.delete(f"/users/{user_id}")


def test_last_superadmin_protection_and_user_deletion(client: TestClient) -> None:
    """Superadmin self-deletion is prevented, and standard users can be deleted cleanly."""
    superadmin_row = execute_raw("SELECT id FROM users WHERE username = 'superadmin' LIMIT 1")
    assert superadmin_row, "superadmin user should exist"
    sa_id = superadmin_row[0]["id"]

    # Self deletion prevention
    del_resp = client.delete(f"/users/{sa_id}")
    assert del_resp.status_code == 400
    assert "Tidak bisa menghapus akun sendiri" in del_resp.json()["detail"]

    # Regular user creation and deletion
    role_id = execute_raw("SELECT id FROM roles WHERE name = 'Admin PPDB' LIMIT 1")[0]["id"]
    temp_name = f"temp_del_{uuid.uuid4().hex[:6]}"
    create_resp = client.post("/users", json={
        "username": temp_name,
        "password": "Password123!.",
        "full_name": "Temporary User",
        "role_id": role_id,
        "user_type": "admin",
        "is_active": True,
    })
    assert create_resp.status_code == 201
    temp_id = create_resp.json()["id"]

    del_temp = client.delete(f"/users/{temp_id}")
    assert del_temp.status_code == 200

    # User no longer exists
    get_res = client.get(f"/users/{temp_id}")
    assert get_res.status_code == 404


def test_roles_crud_and_legacy_permission_normalization(client: TestClient) -> None:
    """Verifies role creation with 'access' legacy alias maps to 'crud'."""
    role_name = f"Test Role {uuid.uuid4().hex[:6]}"
    res = client.post("/roles", json={
        "name": role_name,
        "description": "Role for regression test",
        "permissions": {
            "ppdb": "access",          # Legacy alias
            "companyprofile": "view",  # Legacy alias -> read
        },
    })
    assert res.status_code == 201, res.text
    role_data = res.json()
    role_id = role_data["id"]

    try:
        # Permissions should be normalized
        perms = json.loads(role_data["permissions"]) if isinstance(role_data["permissions"], str) else role_data["permissions"]
        assert perms["ppdb"] == "crud"
        assert perms["companyprofile"] == "read"

        # Duplicate role name rejected
        res_dup = client.post("/roles", json={
            "name": role_name,
            "description": "Another",
            "permissions": {"ppdb": "crud"},
        })
        assert res_dup.status_code == 400
        assert "sudah ada" in res_dup.json()["detail"]

        # Cannot delete system roles
        sa_role = execute_raw("SELECT id FROM roles WHERE name = 'Superadmin' LIMIT 1")[0]["id"]
        res_sa_del = client.delete(f"/roles/{sa_role}")
        assert res_sa_del.status_code in (400, 403)

        # Cannot delete role in use
        user_res = client.post("/users", json={
            "username": f"user_in_role_{uuid.uuid4().hex[:6]}",
            "password": "Password123!.",
            "full_name": "User Bound to Custom Role",
            "role_id": role_id,
            "user_type": "admin",
            "is_active": True,
        })
        assert user_res.status_code == 201
        temp_user_id = user_res.json()["id"]

        try:
            res_del_in_use = client.delete(f"/roles/{role_id}")
            assert res_del_in_use.status_code == 409
            assert "masih digunakan" in res_del_in_use.json()["detail"]
        finally:
            client.delete(f"/users/{temp_user_id}")

        # Now deletion succeeds
        res_del_ok = client.delete(f"/roles/{role_id}")
        assert res_del_ok.status_code == 200

    finally:
        # Ensure cleanup if failed midway
        execute_raw("DELETE FROM roles WHERE id = :id", {"id": role_id})


def test_notification_recipients_endpoint(client: TestClient) -> None:
    """Verifies that GET /notifications/recipients returns list of targetable users/applicants."""
    res = client.get("/notifications/recipients")
    assert res.status_code == 200, res.text
    body = res.json()
    assert "data" in body
    data = body["data"]
    assert isinstance(data, list)
    # At least the admin users should be among recipients
    assert any(r.get("type") == "Admin" for r in data)


def test_applicant_permanent_deletion(client: TestClient) -> None:
    """Verifies that deleting an applicant cascades and cleans up without StaleDataError."""
    u_id = f"app_user_{uuid.uuid4().hex[:8]}"
    app_id = f"app_{uuid.uuid4().hex[:8]}"
    u_name = f"santri_{uuid.uuid4().hex[:6]}"

    create_record("users", {
        "id": u_id,
        "username": u_name,
        "password_hash": hash_password("SantriPass123!."),
        "email": f"{u_name}@santri.sch.id",
        "phone": "08123456789",
        "full_name": "Calon Santri Test",
        "user_type": "applicant",
        "avatar_url": "",
        "is_active": 1,
        "failed_login_attempts": 0,
    })

    # Pick or create a wave
    wave_row = execute_raw("SELECT id FROM ppdb_waves LIMIT 1")
    if not wave_row:
        p_id = f"p_{uuid.uuid4().hex[:8]}"
        w_id = f"w_{uuid.uuid4().hex[:8]}"
        create_record("ppdb_periods", {
            "id": p_id,
            "name": "Periode Test",
            "academic_year": "2026/2027",
            "form_fee": 0,
            "minimum_dp": 0,
            "status": "active",
        })
        create_record("ppdb_waves", {
            "id": w_id,
            "period_id": p_id,
            "name": "Gelombang Test",
            "wave_number": 1,
            "quota": 100,
            "early_discount_quota": 0,
            "status": "active",
        })
        wave_id = w_id
    else:
        wave_id = wave_row[0]["id"]

    create_record("ppdb_applicants", {
        "id": app_id,
        "user_id": u_id,
        "wave_id": wave_id,
        "registration_number": f"REG-TEST-{uuid.uuid4().hex[:4].upper()}",
        "full_name": "Calon Santri Test",
        "email": f"{u_name}@santri.sch.id",
        "phone": "08123456789",
        "status": "pending_payment",
        "payment_status": "pending",
        "is_loa_signed": 0,
        "early_discount_eligible": 0,
        "dp_status": "pending",
    })

    # Call delete applicant endpoint
    del_res = client.delete(f"/ppdb/applicants/{app_id}")
    assert del_res.status_code == 200, del_res.text

    # Both applicant and user should be deleted
    rem_app = execute_raw("SELECT id FROM ppdb_applicants WHERE id = :id", {"id": app_id})
    assert len(rem_app) == 0
    rem_user = execute_raw("SELECT id FROM users WHERE id = :id", {"id": u_id})
    assert len(rem_user) == 0


def test_whatsapp_endpoints_graceful_handling(client: TestClient) -> None:
    """Verifies WhatsApp endpoints return 200 with clear status/error payloads even when offline."""
    # Status endpoint
    res_status = client.get("/whatsapp/status")
    assert res_status.status_code == 200
    status_body = res_status.json()
    assert "status" in status_body
    assert "configured" in status_body

    # Queue endpoint
    res_queue = client.get("/whatsapp/queue")
    assert res_queue.status_code == 200
    queue_body = res_queue.json()
    assert queue_body.get("success") is True
    assert "data" in queue_body

    # Logs endpoint
    res_logs = client.get("/whatsapp/logs?page=1&perPage=15")
    assert res_logs.status_code == 200
    logs_body = res_logs.json()
    assert logs_body.get("success") is True
    assert "data" in logs_body
    assert isinstance(logs_body["data"], list)

    # Connect endpoint returns graceful response (not 400 or 503 crash)
    res_conn = client.post("/whatsapp/connect")
    assert res_conn.status_code == 200
    conn_body = res_conn.json()
    assert "success" in conn_body

