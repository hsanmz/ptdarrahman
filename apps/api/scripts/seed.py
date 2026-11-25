"""Idempotent database seeder.

Run from the `api/` directory:
    python -m scripts.seed

Creates (only if missing):
  - modules & pages for the permission system
  - default roles ("Superadmin", "Pendaftar", "Admin PPDB", "AdminCP")
  - default site_settings keys
  - default notification templates
  - a default superadmin account (only when none exists)

Permission-module model:
  - `ppdb`          — satu module yang mencakup seluruh sistem PPDB
    (dashboard admin, pendaftar, pembayaran, seleksi, notifikasi).
  - `companyprofile` — module terpisah untuk CMS konten website.

Safe to run repeatedly.
"""

import json
import os
import sys
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.core.config import settings  # noqa: E402
from src.core.database import (  # noqa: E402
    create_record,
    execute_raw,
    get_by_column,
    update_record,
)
from src.core.notification_templates import NOTIF_TEMPLATES  # noqa: E402, F401
from src.core.security import hash_password  # noqa: E402

MODULES = {
    "ppdb": "PPDB",
    "companyprofile": "Company Profile",
}

# Key halaman adalah kontrak antar app: harus SAMA dengan key yang
# diturunkan dari URL di app PPDB (href `/admin/<key>`) dan key tab di
# app Company Profile (`tab.key`). Jangan ubah tanpa menyesuaikan
# `apps/ppdb/src/layouts/AdminLayout.tsx` dan
# `apps/companyprofile/app/admin/dashboard/page.tsx`.
PAGES = {
    "ppdb": [
        ("dashboard", "Dashboard Admin", "LayoutDashboard", 5),
        ("data-pendaftar", "Data Pendaftar", "Users", 10),
        ("verifikasi-dokumen", "Verifikasi Dokumen", "ClipboardCheck", 20),
        ("pembayaran-formulir", "Pembayaran Formulir", "Wallet", 30),
        ("sessions", "Jadwal Seleksi", "Calendar", 40),
        ("penilaian", "Hasil Pendaftaran", "Award", 45),
        ("review-loa", "Review LoA", "FileCheck2", 50),
        ("periods", "Periode PPDB", "CalendarDays", 55),
        ("pengumuman", "Preview LoA", "FileText", 60),
        ("rubrik", "Rubrik Penilaian", "CheckSquare", 65),
        ("arsip", "Arsip Pendaftar", "Archive", 75),
        ("notifications", "Notifikasi", "Bell", 80),
    ],
    "companyprofile": [
        ("hero", "Hero Beranda", "Home", 5),
        ("news", "Berita", "Newspaper", 10),
        ("programs", "Program", "BookOpen", 20),
        ("facilities", "Fasilitas", "Building2", 30),
        ("staff", "Staff", "Users", 40),
        ("achievements", "Prestasi", "Trophy", 50),
        ("gallery", "Galeri", "ImageIcon", 60),
        ("testimonials", "Testimoni", "MessageSquare", 70),
        ("social", "Tautan Sosial", "LinkIcon", 80),
        ("contact", "Info Kontak", "Phone", 90),
        ("settings", "Pengaturan", "Settings", 100),
    ],
}

DEFAULT_ROLES = [
    {
        "name": "Superadmin",
        "description": "Full access to everything.",
        "is_superadmin": True,
        "is_system": True,
        "permissions": {},
    },
    {
        "name": "Pendaftar",
        "description": "Default role for PPDB applicants.",
        "is_superadmin": False,
        "is_system": True,
        "permissions": {
            "ppdb": "dashboard",
        },
    },
    {
        "name": "Admin PPDB",
        "description": (
            "Mengelola seluruh sistem PPDB (pendaftar, pembayaran, seleksi, "
            "notifikasi)."
        ),
        "is_superadmin": False,
        "is_system": False,
        "permissions": {
            "ppdb": "crud",
        },
    },
    {
        "name": "AdminCP",
        "description": "Mengelola konten website (Company Profile).",
        "is_superadmin": False,
        "is_system": False,
        "permissions": {
            "companyprofile": "crud",
        },
    },
]

DEFAULT_USERS = [
    {
        "username": "superadmin",
        "full_name": "Superadmin",
        "email": "superadmin@ptdarrahman.com",
        "password": "SuperAdmin123!.",
        "role_name": "Superadmin",
        "user_type": "superadmin",
    },
    {
        "username": "adminppdb",
        "full_name": "Admin PPDB",
        "email": "adminppdb@ptdarrahman.com",
        "password": "adminppdb123!.",
        "role_name": "Admin PPDB",
        "user_type": "admin",
    },
    {
        "username": "admincp",
        "full_name": "Admin Company Profile",
        "email": "admincp@ptdarrahman.com",
        "password": "admincp123!.",
        "role_name": "AdminCP",
        "user_type": "admin",
    },
]

DEFAULT_SUPERADMIN_PASSWORD = os.getenv("SEED_SUPERADMIN_PASSWORD", "SuperAdmin123!.")

SITE_SETTINGS = [
    (
        "site_description",
        "Membentuk generasi Qurani yang tangguh dan adaptif di era digital.",
    ),
    (
        "favicon",
        "https://res.cloudinary.com/dunynusuh/image/upload/v1782693726/download_cxdfqr.png",
    ),
    (
        "logo",
        "https://res.cloudinary.com/dunynusuh/image/upload/v1755771459/Logo-Ar-Rahman_fm4mgg.png",
    ),
    ("whatsapp", ""),
    ("whatsapp_number", ""),
    ("whatsapp_message", ""),
    ("whatsapp_message_id", ""),
    ("whatsapp_message_en", ""),
    ("to_email", ""),
]


def _now() -> str:
    from src.core.database import utcnow

    return str(utcnow())


def ensure_modules_and_pages() -> None:
    now = _now()
    for key, name in MODULES.items():
        mod = get_by_column("modules", "key", key)
        if not mod:
            mod = create_record(
                "modules",
                {
                    "id": str(uuid4()),
                    "key": key,
                    "name": name,
                    "created_at": now,
                    "updated_at": now,
                },
            )
            print(f"  module created: {key}")
        else:
            print(f"  module exists:   {key}")

        for page_key, label, icon, sort_order in PAGES.get(key, []):
            existing = execute_raw(
                "SELECT id FROM pages WHERE module_id = :mid AND `key` = :k",
                {"mid": mod["id"], "k": page_key},
            )
            if not existing:
                create_record(
                    "pages",
                    {
                        "id": str(uuid4()),
                        "module_id": mod["id"],
                        "key": page_key,
                        "label": label,
                        "icon": icon,
                        "sort_order": sort_order,
                        "has_crud": True,
                        "created_at": now,
                        "updated_at": now,
                    },
                )
                print(f"  page created:    {page_key}")


def ensure_roles() -> None:
    """Create or reconcile every default role to match the seed definition."""
    for role in DEFAULT_ROLES:
        existing = get_by_column("roles", "name", role["name"])
        if existing:
            stored_perms = json.loads(existing.get("permissions") or "{}")
            if (
                stored_perms != role["permissions"]
                or existing.get("description") != role["description"]
                or bool(existing.get("is_superadmin")) != role["is_superadmin"]
                or bool(existing.get("is_system")) != role.get("is_system", False)
            ):
                update_record(
                    "roles",
                    existing["id"],
                    {
                        "description": role["description"],
                        "is_superadmin": 1 if role["is_superadmin"] else 0,
                        "is_system": 1 if role.get("is_system", False) else 0,
                        "permissions": json.dumps(
                            role["permissions"], ensure_ascii=False
                        ),
                    },
                )
                print(f"  role updated:    {role['name']}")
            else:
                print(f"  role exists:     {role['name']}")
            continue
        create_record(
            "roles",
            {
                "id": str(uuid4()),
                "name": role["name"],
                "description": role["description"],
                "is_superadmin": 1 if role["is_superadmin"] else 0,
                "is_system": 1 if role.get("is_system", False) else 0,
                "permissions": json.dumps(role["permissions"], ensure_ascii=False),
            },
        )
        print(f"  role created:    {role['name']}")


def ensure_applicant_roles() -> None:
    """Assign the default 'Pendaftar' role to applicant users missing a role."""
    role = get_by_column("roles", "name", "Pendaftar")
    if not role:
        return
    rows = execute_raw(
        "SELECT id FROM users WHERE user_type = 'applicant' AND role_id IS NULL"
    )
    for row in rows:
        update_record("users", row["id"], {"role_id": role["id"]})
        print(f"  applicant role:  {row['id']} -> Pendaftar")


def ensure_site_settings() -> None:
    defaults = dict(SITE_SETTINGS)
    for key, value in SITE_SETTINGS:
        existing = get_by_column("site_settings", "key", key)
        if not existing:
            create_record("site_settings", {"key": key, "value": value})
            print(f"  setting created: {key}")
        elif not (existing.get("value") or "").strip() and defaults.get(key):
            update_record("site_settings", existing["key"], {"value": value})
            print(f"  setting backfilled: {key}")


def ensure_notification_templates() -> None:
    from scripts.seed_notifications import seed_notification_templates

    seed_notification_templates()


def ensure_default_users() -> None:
    """Create default system users (Superadmins, Admin PPDB, AdminCP) if missing."""
    now = _now()

    for u in DEFAULT_USERS:
        existing = get_by_column("users", "username", u["username"])
        if existing:
            print(f"  user exists: '{u['username']}' (kept as-is)")
            continue

        role = get_by_column("roles", "name", u["role_name"])
        role_id = role["id"] if role else None
        user_id = str(uuid4())
        pwd = u.get("password", DEFAULT_SUPERADMIN_PASSWORD)

        create_record(
            "users",
            {
                "id": user_id,
                "username": u["username"],
                "full_name": u["full_name"],
                "password_hash": hash_password(pwd),
                "email": u["email"],
                "phone": "",
                "user_type": u["user_type"],
                "role_id": role_id,
                "avatar_url": "",
                "is_active": 1,
                "failed_login_attempts": 0,
                "created_at": now,
                "updated_at": now,
            },
        )
        print(f"  user created: '{u['username']}' ({u['role_name']})")


def main() -> None:
    print("Seeding database...")
    print("  Using DATABASE_URL:", settings.database_url)
    ensure_modules_and_pages()
    ensure_roles()
    ensure_applicant_roles()
    ensure_site_settings()
    ensure_notification_templates()
    ensure_default_users()

    # Seed Company Profile production content
    try:
        from scripts.seed_companyprofile import seed_all_companyprofile
        seed_all_companyprofile()
    except Exception as exc:
        print(f"  [WARN] Company Profile seeder encountered an error: {exc}")

    print("Done.")


if __name__ == "__main__":
    main()
