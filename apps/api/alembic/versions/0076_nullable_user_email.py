"""Make users.email nullable and convert blank emails to NULL.

Revision ID: 0076
Revises: 0075
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0076"
down_revision: str | None = "0075"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "users" not in set(inspector.get_table_names()):
        return

    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("users") as batch:
            batch.alter_column(
                "email",
                existing_type=sa.String(length=255),
                nullable=True,
                existing_nullable=False,
            )
    else:
        op.alter_column(
            "users",
            "email",
            existing_type=sa.String(length=255),
            nullable=True,
        )

    bind.execute(
        sa.text("UPDATE users SET email = NULL WHERE TRIM(COALESCE(email, '')) = ''")
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "users" not in set(inspector.get_table_names()):
        return

    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("users") as batch:
            batch.alter_column(
                "email",
                existing_type=sa.String(length=255),
                nullable=False,
                existing_nullable=True,
            )
    else:
        op.alter_column(
            "users",
            "email",
            existing_type=sa.String(length=255),
            nullable=False,
        )
