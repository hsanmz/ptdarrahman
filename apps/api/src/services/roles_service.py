import json
import uuid
from datetime import datetime
from typing import Any, cast
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from src.core.cache import invalidate_user_cache
from src.models.auth import Role, User
from src.repositories.roles_repository import RolesRepository

_LEGACY_LEVEL_MAP: dict[str, str] = {
    "access": "crud",
    "full": "crud",
    "view": "read",
}


class RolesService:
    def __init__(self, repository: RolesRepository):
        self.repository = repository
        self.wib = ZoneInfo("Asia/Jakarta")

    @staticmethod
    def _normalize_permissions(raw: object) -> str | None:
        if raw is None:
            return None
        parsed: dict | None = None
        if isinstance(raw, dict):
            parsed = raw
        elif isinstance(raw, str):
            stripped = raw.strip()
            if not stripped:
                return None
            try:
                candidate = json.loads(stripped)
                if isinstance(candidate, dict):
                    parsed = candidate
            except (json.JSONDecodeError, TypeError):
                return raw
        if parsed is None:
            return str(raw)
        normalized: dict[str, object] = {}
        for mod, lvl in parsed.items():
            if isinstance(lvl, str):
                clean_lvl = lvl.strip().lower()
                normalized[mod] = _LEGACY_LEVEL_MAP.get(clean_lvl, clean_lvl)
            else:
                normalized[mod] = lvl
        return json.dumps(normalized, ensure_ascii=False)

    def _invalidate_role_users_cache(self, role_id: str) -> None:
        user_ids = (
            self.repository.db.query(User.id).filter(User.role_id == role_id).all()
        )
        for (uid,) in user_ids:
            invalidate_user_cache(uid)

    def _serialize_role(self, role: Role) -> dict:
        return {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "is_superadmin": bool(role.is_superadmin),
            "is_system": bool(role.is_system),
            "permissions": role.permissions,
            "created_at": role.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if role.created_at
            else None,
            "updated_at": role.updated_at.strftime("%Y-%m-%d %H:%M:%S")
            if role.updated_at
            else None,
        }

    def get_roles(self):
        roles = self.repository.get_all()
        return [self._serialize_role(r) for r in roles]

    def get_role(self, role_id: str):
        role = self.repository.get_by_id(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return self._serialize_role(role)

    def create_role(self, data: dict):
        name = (data.get("name") or "").strip()
        if not name:
            raise HTTPException(status_code=400, detail="Nama role wajib diisi")
        permissions = self._normalize_permissions(data.get("permissions"))

        now = datetime.now(self.wib)
        new_role = Role(
            id=str(uuid.uuid4()),
            name=name,
            description=data.get("description"),
            is_superadmin=bool(data.get("is_superadmin", False)),
            is_system=False,
            permissions=permissions,
            created_at=now,
            updated_at=now,
        )

        try:
            created = self.repository.create(new_role)
        except IntegrityError:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=400, detail="Role dengan nama tersebut sudah ada"
            )

        return self._serialize_role(created)

    def update_role(self, role_id: str, data: dict):
        role = self.repository.get_by_id(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        if role.is_system:
            raise HTTPException(
                status_code=403, detail="Role sistem tidak dapat diubah"
            )

        if data.get("name") is not None:
            name = str(data["name"]).strip()
            if not name:
                raise HTTPException(status_code=400, detail="Nama role wajib diisi")
            role.name = name
        if "description" in data:
            role.description = data["description"]
        if data.get("is_superadmin") is not None:
            role.is_superadmin = bool(data["is_superadmin"])

        permissions = self._normalize_permissions(data.get("permissions"))
        if permissions is not None:
            role.permissions = cast(Any, permissions)

        role.updated_at = datetime.now(self.wib)

        try:
            updated = self.repository.update(role)
        except IntegrityError:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=400, detail="Role dengan nama tersebut sudah ada"
            )

        self._invalidate_role_users_cache(role_id)
        return self._serialize_role(updated)

    def delete_role(self, role_id: str):
        role = self.repository.get_by_id(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        if role.is_system:
            raise HTTPException(
                status_code=403, detail="Role sistem tidak dapat dihapus"
            )
        if role.is_superadmin:
            raise HTTPException(
                status_code=400, detail="Role superadmin tidak dapat dihapus"
            )

        in_use_count = (
            self.repository.db.query(User.id).filter(User.role_id == role_id).count()
        )
        if in_use_count > 0:
            raise HTTPException(
                status_code=409,
                detail=(
                    f'Role "{role.name}" tidak dapat dihapus karena masih '
                    f"digunakan oleh {in_use_count} pengguna"
                ),
            )

        try:
            self.repository.delete(role)
        except IntegrityError:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=409,
                detail="Role tidak dapat dihapus karena masih digunakan oleh pengguna",
            )
