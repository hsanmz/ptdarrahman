"""Ensure programs.order column exists.

Revision ID: 0078
Revises: 0077
Create Date: 2026-11-25
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0078"
down_revision: str | None = "0077"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "programs" in set(inspector.get_table_names()):
        cols = {column["name"] for column in inspector.get_columns("programs")}
        if "order" not in cols:
            op.add_column(
                "programs",
                sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
            )
            op.alter_column("programs", "order", server_default=None)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "programs" in set(inspector.get_table_names()):
        cols = {column["name"] for column in inspector.get_columns("programs")}
        if "order" in cols:
            op.drop_column("programs", "order")
