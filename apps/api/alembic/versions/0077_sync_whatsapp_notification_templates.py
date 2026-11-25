"""Sync canonical WhatsApp notification templates and normalize legacy channels.

Revision ID: 0077
Revises: 0076
Create Date: 2026-11-25
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op
from src.core.notification_templates import sync_notification_templates

revision: str = "0077"
down_revision: str | None = "0076"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if "notification_templates" not in sa.inspect(bind).get_table_names():
        return
    sync_notification_templates(bind, force=False)


def downgrade() -> None:
    # Template sync only backfills missing rows and normalizes channels to whatsapp.
    pass
