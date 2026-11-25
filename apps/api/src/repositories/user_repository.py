import uuid
from typing import Any, cast

from sqlalchemy import or_
from sqlalchemy.orm import Session

from src.models.auth import AuditLog, Page, RefreshToken, User, UserPagePermission
from src.models.ppdb import NotificationLog, PPDBApplicant


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_users_paginated(
        self, search: str, page: int, per_page: int
    ) -> tuple[list[User], int]:
        query = self.db.query(User).filter(
            or_(User.user_type.is_(None), User.user_type != "applicant")
        )

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.username.ilike(search_term),
                    User.email.ilike(search_term),
                    User.full_name.ilike(search_term),
                )
            )

        total = query.count()
        users = (
            query.order_by(User.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        return users, total

    def get_by_id(self, user_id: str) -> User | None:
        return cast(User | None, self.db.query(User).filter(User.id == user_id).first())

    def get_by_username(self, username: str) -> User | None:
        return cast(
            User | None, self.db.query(User).filter(User.username == username).first()
        )

    def get_by_email(self, email: str) -> User | None:
        return cast(
            User | None, self.db.query(User).filter(User.email == email).first()
        )

    def has_applicant(self, user_id: str) -> bool:
        return (
            self.db.query(PPDBApplicant.id)
            .filter(PPDBApplicant.user_id == user_id)
            .first()
            is not None
        )

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete(
            synchronize_session=False
        )
        self.db.query(UserPagePermission).filter(
            UserPagePermission.user_id == user.id
        ).delete(synchronize_session=False)
        self.db.query(AuditLog).filter(AuditLog.user_id == user.id).update(
            {"user_id": None}, synchronize_session=False
        )
        self.db.query(NotificationLog).filter(
            NotificationLog.recipient_user_id == user.id
        ).update({"recipient_user_id": None}, synchronize_session=False)
        self.db.flush()
        self.db.delete(user)
        self.db.commit()

    def get_page_permissions(self, user_id: str) -> list[str]:
        perms = (
            self.db.query(UserPagePermission)
            .filter(UserPagePermission.user_id == user_id)
            .all()
        )
        return [p.page_id for p in perms]

    def get_page_permissions_detail(self, user_id: str) -> list[dict[str, Any]]:
        perms = (
            self.db.query(UserPagePermission)
            .filter(UserPagePermission.user_id == user_id)
            .all()
        )
        return [{"page_id": p.page_id, "can_crud": bool(p.can_crud)} for p in perms]

    def get_page_keys(self, user_id: str) -> list[str]:
        rows = (
            self.db.query(Page.key)
            .join(UserPagePermission, UserPagePermission.page_id == Page.id)
            .filter(UserPagePermission.user_id == user_id)
            .all()
        )
        return [r[0] for r in rows]

    def get_page_keys_and_crud(self, user_id: str) -> tuple[list[str], list[str]]:
        rows = (
            self.db.query(Page.key, UserPagePermission.can_crud)
            .join(UserPagePermission, UserPagePermission.page_id == Page.id)
            .filter(UserPagePermission.user_id == user_id)
            .all()
        )
        page_keys = [r[0] for r in rows]
        crud_keys = [r[0] for r in rows if r[1]]
        return page_keys, crud_keys

    def set_page_permissions(
        self, user_id: str, items: list[str] | list[dict[str, Any]] | list[Any]
    ) -> None:
        # Delete existing
        self.db.query(UserPagePermission).filter(
            UserPagePermission.user_id == user_id
        ).delete()

        from datetime import datetime
        from zoneinfo import ZoneInfo

        now = datetime.now(ZoneInfo("Asia/Jakarta"))

        # Insert new
        new_perms = []
        for item in items:
            if isinstance(item, str):
                page_id = item
                can_crud = True
            elif isinstance(item, dict):
                page_id = item.get("page_id", "")
                can_crud = bool(item.get("can_crud", True))
            else:
                # Pydantic model
                page_id = getattr(item, "page_id", "")
                can_crud = bool(getattr(item, "can_crud", True))

            if not page_id:
                continue

            new_perms.append(
                UserPagePermission(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    page_id=page_id,
                    can_crud=can_crud,
                    created_at=now,
                )
            )

        if new_perms:
            self.db.add_all(new_perms)

        self.db.commit()
