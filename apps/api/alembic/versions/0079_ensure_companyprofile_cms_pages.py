"""Ensure all 15 companyprofile CMS pages exist and backfill permissions.

Revision ID: 0079
Revises: 0078
Create Date: 2026-11-27
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa
from alembic import op

revision: str = "0079"
down_revision: str | None = "0078"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

CP_PAGES = [
    ("hero", "Hero Beranda", "Home", 5),
    ("ppdb", "PPDB Landing", "ClipboardList", 8),
    ("news", "Berita", "Newspaper", 10),
    ("programs", "Program", "BookOpen", 20),
    ("facilities", "Fasilitas", "Building2", 30),
    ("staff", "Staff", "Users", 40),
    ("about", "Tentang Kami", "Info", 42),
    ("faq", "FAQ", "HelpCircle", 44),
    ("leadership", "Struktur Organisasi", "Network", 46),
    ("achievements", "Prestasi", "Trophy", 50),
    ("gallery", "Galeri", "ImageIcon", 60),
    ("testimonials", "Testimoni", "MessageSquare", 70),
    ("social", "Tautan Sosial", "LinkIcon", 80),
    ("contact", "Info Kontak", "Phone", 90),
    ("settings", "Pengaturan", "Settings", 100),
]


def _table(bind: sa.engine.Connection, name: str) -> sa.Table:
    return sa.Table(name, sa.MetaData(), autoload_with=bind)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "modules" not in tables or "pages" not in tables:
        return

    modules = _table(bind, "modules")
    pages = _table(bind, "pages")

    mod_row = bind.execute(
        sa.select(modules.c.id).where(modules.c.key == "companyprofile")
    ).first()

    now = datetime.now()
    if not mod_row:
        mod_id = str(uuid4())
        bind.execute(
            modules.insert().values(
                id=mod_id,
                name="Company Profile",
                key="companyprofile",
                description="CMS Company Profile",
                is_active=True,
                created_at=now,
                updated_at=now,
            )
        )
    else:
        mod_id = mod_row.id

    # Upsert each of the 15 pages
    page_ids: dict[str, str] = {}
    for key, label, icon, sort_order in CP_PAGES:
        existing = bind.execute(
            sa.select(pages.c.id).where(
                pages.c.module_id == mod_id, pages.c.key == key
            )
        ).first()

        values = {
            "label": label,
            "icon": icon,
            "sort_order": sort_order,
            "has_crud": True,
            "updated_at": now,
        }

        if existing:
            bind.execute(
                pages.update().where(pages.c.id == existing.id).values(**values)
            )
            page_ids[key] = str(existing.id)
        else:
            new_id = str(uuid4())
            bind.execute(
                pages.insert().values(
                    id=new_id,
                    module_id=mod_id,
                    key=key,
                    created_at=now,
                    **values,
                )
            )
            page_ids[key] = new_id

    # Backfill user_page_permissions for users with companyprofile access
    if "user_page_permissions" in tables and "users" in tables and "roles" in tables:
        user_page_perms = _table(bind, "user_page_permissions")
        roles = _table(bind, "roles")
        users = _table(bind, "users")

        # 1. Users who already have at least one companyprofile page permission
        cp_page_id_list = list(page_ids.values())
        users_with_cp = {
            r[0]
            for r in bind.execute(
                sa.select(user_page_perms.c.user_id)
                .where(user_page_perms.c.page_id.in_(cp_page_id_list))
                .distinct()
            ).fetchall()
        }

        # 2. Users with AdminCP role or companyprofile permission in role
        admin_cp_users = {
            r[0]
            for r in bind.execute(
                sa.select(users.c.id)
                .join(roles, users.c.role_id == roles.c.id)
                .where(
                    sa.or_(
                        roles.c.name == "AdminCP",
                        roles.c.permissions.like("%companyprofile%"),
                    )
                )
            ).fetchall()
        }

        target_users = users_with_cp | admin_cp_users

        for u_id in target_users:
            for key, p_id in page_ids.items():
                existing_perm = bind.execute(
                    sa.select(user_page_perms.c.id, user_page_perms.c.can_crud).where(
                        user_page_perms.c.user_id == u_id,
                        user_page_perms.c.page_id == p_id,
                    )
                ).first()

                if not existing_perm:
                    bind.execute(
                        user_page_perms.insert().values(
                            id=str(uuid4()),
                            user_id=u_id,
                            page_id=p_id,
                            can_crud=True,
                            created_at=now,
                        )
                    )
                elif not existing_perm.can_crud:
                    bind.execute(
                        user_page_perms.update()
                        .where(user_page_perms.c.id == existing_perm.id)
                        .values(can_crud=True)
                    )


def downgrade() -> None:
    # Retain pages to prevent data loss in permissions
    pass
