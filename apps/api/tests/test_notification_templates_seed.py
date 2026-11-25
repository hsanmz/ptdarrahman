"""Tests for canonical WhatsApp notification templates seeding & sync."""

from __future__ import annotations

import re
from datetime import datetime

import sqlalchemy as sa

from scripts.seed_notifications import seed_notification_templates
from src.core.database import get_engine
from src.core.notif_service import _render_template
from src.core.notification_templates import (
    LEGACY_SEED_BODIES,
    WHATSAPP_TEMPLATES,
    render_mysql_upsert_sql,
    sync_notification_templates,
)


def test_all_canonical_whatsapp_templates_present_after_migration():
    """Migration + seed harus menyemai seluruh 23 template WhatsApp resmi."""
    with get_engine().connect() as conn:
        rows = (
            conn.execute(
                sa.text(
                    "SELECT id, event_key, label, channel, email_subject, body, "
                    "is_active FROM notification_templates"
                )
            )
            .mappings()
            .all()
        )

    by_key = {row["event_key"]: dict(row) for row in rows}
    expected_keys = {tpl.event_key for tpl in WHATSAPP_TEMPLATES}

    assert expected_keys.issubset(by_key.keys())
    for key in expected_keys:
        row = by_key[key]
        assert len(str(row["id"])) <= 36
        assert row["channel"] == "whatsapp"
        assert row["email_subject"] is None
        assert bool(row["is_active"]) is True
        body_lower = str(row["body"]).lower()
        assert "yayasan pesantren ar-rahman" not in body_lower
        assert "pesantren ar-rahman" not in body_lower


def test_sync_preserves_custom_edits_and_upgrades_legacy_seed_rows():
    """Non-force mode backfills missing rows without overwriting custom edits."""
    with get_engine().begin() as conn:
        # Simulasikan 1 baris hilang dan 1 baris custom admin
        conn.execute(
            sa.text(
                "DELETE FROM notification_templates WHERE event_key = 'loa_signed'"
            )
        )
        conn.execute(
            sa.text(
                "UPDATE notification_templates "
                "SET body = 'Custom Admin Text {nama_peserta}' "
                "WHERE event_key = 'documents_submitted'"
            )
        )
        # Simulasikan 1 baris stale dari seed.py lama (channel='both' & copy email)
        conn.execute(
            sa.text(
                "UPDATE notification_templates SET channel = 'both', "
                "email_subject = 'Dokumen PPDB Anda Disetujui', "
                "body = :legacy_body, updated_at = :now "
                "WHERE event_key = 'document_approved'"
            ),
            {
                "legacy_body": LEGACY_SEED_BODIES["document_approved"][0],
                "now": datetime.now(),
            },
        )

        stats = sync_notification_templates(conn, force=False)
        assert stats["created"] == 1
        assert stats["updated"] >= 1

        loa = (
            conn.execute(
                sa.text(
                    "SELECT channel, is_active FROM notification_templates "
                    "WHERE event_key = 'loa_signed'"
                )
            )
            .mappings()
            .first()
        )
        assert loa is not None and loa["channel"] == "whatsapp"

        docs = (
            conn.execute(
                sa.text(
                    "SELECT body FROM notification_templates "
                    "WHERE event_key = 'documents_submitted'"
                )
            )
            .mappings()
            .first()
        )
        assert docs is not None and docs["body"] == "Custom Admin Text {nama_peserta}"

        approved = (
            conn.execute(
                sa.text(
                    "SELECT channel, email_subject, body FROM notification_templates "
                    "WHERE event_key = 'document_approved'"
                )
            )
            .mappings()
            .first()
        )
        assert approved is not None
        assert approved["channel"] == "whatsapp"
        assert approved["email_subject"] is None
        assert "melalui email dan WhatsApp" not in approved["body"]

    # Force mode mengembalikan teks kanonikal
    forced = seed_notification_templates(force=True)
    assert forced["updated"] == len(WHATSAPP_TEMPLATES)


def test_account_updated_placeholders_and_mysql_sql_export():
    """Variabel account_updated ter-render utuh & SQL export mencakup semua key."""
    account_tpl = next(
        t for t in WHATSAPP_TEMPLATES if t.event_key == "account_updated"
    )
    _, rendered = _render_template(
        {"email_subject": "", "body": account_tpl.body},
        {
            "nama_peserta": "Ahmad",
            "username": "ahmad24",
            "email": "ahmad@example.com",
            "phone": "081234567890",
        },
    )
    assert not re.findall(r"\{(\w+)\}", rendered)

    sql_dump = render_mysql_upsert_sql()
    for tpl in WHATSAPP_TEMPLATES:
        assert f"'{tpl.event_key}'" in sql_dump
    assert "ON DUPLICATE KEY UPDATE" in sql_dump


def test_scripts_seed_ensure_notification_templates_delegates_all():
    """scripts.seed.ensure_notification_templates menyemai seluruh 23 template."""
    from scripts.seed import ensure_notification_templates

    with get_engine().begin() as conn:
        conn.execute(sa.text("DELETE FROM notification_templates"))

    ensure_notification_templates()

    with get_engine().connect() as conn:
        count = conn.execute(
            sa.text("SELECT COUNT(*) FROM notification_templates")
        ).scalar()
    assert count == len(WHATSAPP_TEMPLATES)
