#!/usr/bin/env python3
"""Idempotent WhatsApp notification templates seeder for PTDARRAHMAN.

Run from the ``apps/api`` directory:
    python -m scripts.seed_notifications            # Insert missing & normalize channel
    python -m scripts.seed_notifications --force    # Reset all 23 templates to defaults
    python -m scripts.seed_notifications --sql      # Print MySQL upsert SQL to stdout

Or from the monorepo root:
    pnpm run seed:notif
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.core.database import execute_raw, get_engine  # noqa: E402
from src.core.notification_templates import (  # noqa: E402
    WHATSAPP_TEMPLATES,
    render_mysql_upsert_sql,
    sync_notification_templates,
)


def _table_exists(table_name: str) -> bool:
    try:
        execute_raw(f"SELECT 1 FROM `{table_name}` LIMIT 1")
        return True
    except Exception:
        return False


def seed_notification_templates(*, force: bool = False) -> dict[str, int]:
    """Seed canonical WhatsApp templates into ``notification_templates``."""
    if not _table_exists("notification_templates"):
        print(
            "Table 'notification_templates' does not exist yet. "
            "Run 'alembic upgrade heads' first."
        )
        return {"created": 0, "updated": 0, "unchanged": 0}

    with get_engine().begin() as conn:
        stats = sync_notification_templates(conn, force=force)

    print(
        f"  notification_templates: {len(WHATSAPP_TEMPLATES)} canonical "
        f"(created={stats['created']}, updated={stats['updated']}, "
        f"unchanged={stats['unchanged']})"
    )
    return stats


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        description="Seed / sync canonical WhatsApp notification templates."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Timpa semua template yang ada dengan teks dan label kanonikal.",
    )
    parser.add_argument(
        "--sql",
        action="store_true",
        help="Cetak SQL MySQL (INSERT ... ON DUPLICATE KEY UPDATE) tanpa menyentuh DB.",
    )
    args = parser.parse_args(argv)

    if args.sql:
        print(render_mysql_upsert_sql())
        return

    print("Seeding WhatsApp notification templates...")
    seed_notification_templates(force=args.force)
    print("Done.")


if __name__ == "__main__":
    main()
