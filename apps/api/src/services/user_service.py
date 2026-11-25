import logging
import random
import string
import uuid
from datetime import datetime
from typing import Any, cast
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from src.core.cache import invalidate_user_cache
from src.core.config import settings
from src.core.events import user_hubs
from src.core.notif_service import send_notifications
from src.core.security import hash_password
from src.models.auth import Role, User
from src.repositories.user_repository import UserRepository

logger = logging.getLogger("ptdarrahman.users")


class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository
        self.wib = ZoneInfo("Asia/Jakarta")

    def _generate_password(self, length: int = 8) -> str:
        chars = string.ascii_letters + string.digits
        return "".join(random.choice(chars) for _ in range(length))

    def _login_link_for(self, user_type: str) -> str:
        if user_type == "applicant":
            return settings.ppdb_frontend_url + "/auth/login"
        return settings.superadmin_frontend_url + "/auth/login"

    @staticmethod
    def _normalize_optional(value: Any) -> str | None:
        if value is None:
            return None
        if isinstance(value, str):
            stripped = value.strip()
            return stripped if stripped else None
        return str(value)

    def _validate_role_id(self, role_id: str | None) -> str | None:
        normalized = self._normalize_optional(role_id)
        if not normalized:
            return None
        role = self.repository.db.query(Role).filter(Role.id == normalized).first()
        if not role:
            raise HTTPException(status_code=400, detail="Role tidak ditemukan")
        return normalized

    def _send_credentials(
        self, event_key: str, user: User, raw_password: str = ""
    ) -> None:
        try:
            send_notifications(
                [
                    (
                        event_key,
                        {
                            "username": user.username,
                            "email": user.email or "",
                            "phone": user.phone or "",
                            "password": raw_password,
                            "link_login": self._login_link_for(
                                user.user_type or "admin"
                            ),
                        },
                    )
                ],
                user.id,
                user_row={
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email or "",
                    "username": user.username,
                    "phone": user.phone,
                },
            )
        except Exception:
            logger.exception("send credential notification failed")

    def get_users_paginated(self, search: str, page: int, per_page: int) -> dict:
        users, total = self.repository.get_users_paginated(search, page, per_page)

        # Convert to dict for legacy compatibility with existing frontend schema
        data = []
        for u in users:
            data.append(
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "full_name": u.full_name,
                    "phone": u.phone,
                    "user_type": u.user_type,
                    "role_id": u.role_id,
                    "is_active": u.is_active,
                    "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S")
                    if u.created_at
                    else None,
                }
            )

        return {
            "data": data,
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    def get_user(self, user_id: str) -> dict:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "user_type": user.user_type,
            "role_id": user.role_id,
            "is_active": user.is_active,
            "avatar_url": getattr(user, "avatar_url", "") or "",
            "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if user.created_at
            else None,
        }

    def create_user(self, data: dict) -> dict:
        username = (data.get("username") or "").strip()
        if not username:
            raise HTTPException(status_code=400, detail="Username wajib diisi")

        email = self._normalize_optional(data.get("email"))
        phone = self._normalize_optional(data.get("phone"))
        user_type = (data.get("user_type") or "admin").strip() or "admin"
        role_id = (
            None
            if user_type == "superadmin"
            else self._validate_role_id(data.get("role_id"))
        )
        full_name = (data.get("full_name") or "").strip()

        if self.repository.get_by_username(username):
            raise HTTPException(status_code=400, detail="Username sudah digunakan")
        if email and self.repository.get_by_email(email):
            raise HTTPException(status_code=400, detail="Email sudah digunakan")

        raw_password = data.get("password") or self._generate_password()
        generated = not data.get("password")

        now = datetime.now(self.wib)
        new_user = User(
            id=str(uuid.uuid4()),
            username=username,
            password_hash=hash_password(raw_password),
            email=email,
            phone=phone,
            full_name=full_name,
            role_id=role_id,
            user_type=user_type,
            is_active=True,
            created_at=now,
            updated_at=now,
        )

        try:
            created_user = self.repository.create(new_user)
        except IntegrityError:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=400, detail="Username atau email sudah digunakan"
            )

        self._send_credentials("user_created", created_user, raw_password)

        response = {
            "id": created_user.id,
            "username": created_user.username,
            "email": created_user.email,
            "role_id": created_user.role_id,
            "user_type": created_user.user_type,
        }
        if generated:
            response["_generated_password"] = raw_password

        return response

    def update_user(self, user_id: str, data: dict) -> dict:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        original_username = user.username
        original_email = user.email or ""
        original_phone = user.phone or ""

        if "username" in data and data.get("username") is not None:
            new_username = str(data["username"]).strip()
            if not new_username:
                raise HTTPException(status_code=400, detail="Username wajib diisi")
            existing = self.repository.get_by_username(new_username)
            if existing and existing.id != user.id:
                raise HTTPException(status_code=400, detail="Username sudah digunakan")
            user.username = new_username
        if "email" in data:
            new_email = self._normalize_optional(data.get("email"))
            if new_email:
                existing = self.repository.get_by_email(new_email)
                if existing and existing.id != user.id:
                    raise HTTPException(
                        status_code=400, detail="Email sudah digunakan"
                    )
            user.email = new_email
        if "phone" in data:
            user.phone = self._normalize_optional(data.get("phone"))
        if "full_name" in data and data.get("full_name") is not None:
            user.full_name = str(data["full_name"]).strip()
        if data.get("password"):
            user.password_hash = hash_password(data["password"])

        next_user_type = (
            (data.get("user_type") or user.user_type or "admin").strip()
            if "user_type" in data and data.get("user_type") is not None
            else user.user_type
        )
        if (
            self._is_superadmin_user(user)
            and next_user_type != "superadmin"
            and self._count_superadmins() <= 1
        ):
            raise HTTPException(
                status_code=400,
                detail="Tidak bisa mengubah tipe superadmin terakhir",
            )
        user.user_type = next_user_type

        if "role_id" in data:
            user.role_id = (
                None
                if next_user_type == "superadmin"
                else self._validate_role_id(data.get("role_id"))
            )
        if data.get("is_active") is not None:
            is_active = bool(data["is_active"])
            if (
                not is_active
                and self._is_superadmin_user(user)
                and self._count_superadmins() <= 1
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Tidak bisa menonaktifkan superadmin terakhir",
                )
            user.is_active = is_active

        user.updated_at = datetime.now(self.wib)

        try:
            updated_user = self.repository.update(user)
        except IntegrityError:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=400, detail="Username atau email sudah digunakan"
            )

        # Invalidate Redis cache so next request re-fetches fresh data
        invalidate_user_cache(user_id)

        account_fields_changed = (
            user.username != original_username
            or (user.email or "") != original_email
            or (user.phone or "") != original_phone
        )
        if data.get("password"):
            self._send_credentials("password_reset", updated_user, data["password"])
        if account_fields_changed:
            self._send_credentials("account_updated", updated_user)

        return {
            "id": updated_user.id,
            "username": updated_user.username,
            "email": updated_user.email,
            "role_id": updated_user.role_id,
            "user_type": updated_user.user_type,
        }

    def delete_user(self, user_id: str, current_user_id: str | None = None) -> None:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if current_user_id and user_id == current_user_id:
            raise HTTPException(
                status_code=400, detail="Tidak bisa menghapus akun sendiri"
            )
        if self._is_superadmin_user(user) and self._count_superadmins() <= 1:
            raise HTTPException(
                status_code=400,
                detail="Tidak bisa menghapus superadmin terakhir",
            )
        if user.user_type == "applicant" or self.repository.has_applicant(user_id):
            raise HTTPException(
                status_code=400,
                detail="Akun pendaftar harus dihapus melalui menu Data Pendaftar.",
            )
        try:
            self.repository.delete(user)
            invalidate_user_cache(user_id)
        except IntegrityError:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=409,
                detail="User tidak dapat dihapus karena masih direferensikan oleh data lain.",
            )

    def _is_superadmin_user(self, user) -> bool:
        if (user.user_type or "") == "superadmin":
            return True
        if user.role_id:
            role = (
                self.repository.db.query(Role).filter(Role.id == user.role_id).first()
            )
            return bool(role and role.is_superadmin)
        return False

    def _count_superadmins(self) -> int:
        from sqlalchemy import or_

        return cast(
            int,
            (
                self.repository.db.query(User)
                .filter(
                    or_(
                        User.user_type == "superadmin",
                        User.role_id.in_(
                            self.repository.db.query(Role.id).filter(
                                Role.is_superadmin.is_(True)
                            )
                        ),
                    )
                )
                .count()
            ),
        )

    def get_page_permissions(self, user_id: str) -> dict:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        page_ids = self.repository.get_page_permissions(user_id)
        permissions = self.repository.get_page_permissions_detail(user_id)
        return {"user_id": user_id, "page_ids": page_ids, "permissions": permissions}

    def update_page_permissions(
        self, user_id: str, items: list[str] | list[dict[str, Any]] | list[Any]
    ) -> dict:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        self.repository.set_page_permissions(user_id, items)
        # Invalidate cache so re-fetched user has updated page_permissions
        invalidate_user_cache(user_id)
        page_keys, crud_keys = self.repository.get_page_keys_and_crud(user_id)
        user_hubs.broadcast(
            user_id,
            {
                "type": "page_permissions_changed",
                "page_keys": page_keys,
                "crud_keys": crud_keys,
            },
        )
        page_ids = self.repository.get_page_permissions(user_id)
        permissions = self.repository.get_page_permissions_detail(user_id)
        return {"user_id": user_id, "page_ids": page_ids, "permissions": permissions}
