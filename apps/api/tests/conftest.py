"""Test bootstrap.

Runs the API test-suite against a throwaway SQLite database unless the
caller already provided `DATABASE_URL`. The database is migrated to `head`
and seeded (modules, pages, roles, superadmin, templates) so endpoint tests
work against a fully populated schema.

Run from `apps/api/`:

    python -m pytest tests/ -v
"""

import os
import subprocess
import sys
import tempfile
import warnings
from pathlib import Path

# Filter unavoidable third-party and sqlite3 adapter deprecations in test runner
warnings.filterwarnings("ignore", message=".*Using `httpx` with `starlette.testclient`.*")
warnings.filterwarnings("ignore", message=".*You should not use the 'timeout' argument with the TestClient.*")
warnings.filterwarnings("ignore", message=".*The default datetime adapter is deprecated.*")

API_DIR = Path(__file__).resolve().parent.parent

_TMP_ROOT = Path(tempfile.gettempdir()) / "ptdarrahman_api_tests"
_TMP_ROOT.mkdir(exist_ok=True)
_TMP_DB = _TMP_ROOT / f"test_{os.getpid()}.db"


def _run(cmd: list[str]) -> None:
    result = subprocess.run(
        cmd,
        cwd=str(API_DIR),
        env=os.environ,
        check=False,
        capture_output=True,
    )
    if result.returncode != 0:
        stderr = result.stderr.decode("utf-8", "replace")
        stdout = result.stdout.decode("utf-8", "replace")
        raise RuntimeError(
            f"Bootstrapping test DB failed: {' '.join(cmd)} "
            f"(exit {result.returncode}).\nSTDOUT:\n{stdout}\nSTDERR:\n{stderr}"
        )


def _bootstrap_env() -> None:
    if not os.environ.get("DATABASE_URL"):
        db_url = f"sqlite:///{_TMP_DB.as_posix()}"
        os.environ["DATABASE_URL"] = db_url
        if _TMP_DB.exists():
            _TMP_DB.unlink()
        _run([sys.executable, "-m", "alembic", "upgrade", "head"])
        _run([sys.executable, "-m", "scripts.seed"])

    from src.core.config import settings

    settings.database_url_override = os.environ["DATABASE_URL"]
    settings.upload_provider = "local"
    settings.upload_dir = str(_TMP_ROOT / "uploads")


_bootstrap_env()
