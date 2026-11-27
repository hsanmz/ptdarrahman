"""File upload service.

`UPLOAD_PROVIDER=local` saves to a local folder.
`UPLOAD_PROVIDER=cloudinary` uploads to Cloudinary (falls back to local when
Cloudinary is not configured).
`UPLOAD_PROVIDER=db` stores the bytes in the `file_uploads.data` column (served
via `GET /uploads/{id}`).
"""

import logging
import uuid
from dataclasses import dataclass
from pathlib import Path

from fastapi import HTTPException, UploadFile

from src.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
}
ALLOWED_COMPANYPROFILE_TYPES = ALLOWED_IMAGE_TYPES | {"image/x-icon"}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# Magic bytes per allowed MIME type. Content-type header from the client is
# never trusted: the actual bytes are sniffed and validated against accepted types.
_MAGIC: dict[str, bytes] = {
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/webp": b"RIFF",
    "image/gif": b"GIF8",
    "image/x-icon": b"\x00\x00\x01\x00",
    "application/pdf": b"%PDF-",
}

# Safe extension derived from the *sniffed* type — never from the user-supplied
# filename (an attacker could name a file ".svg" to smuggle active content).
_TYPE_EXT: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/x-icon": ".ico",
    "application/pdf": ".pdf",
}

# Common MIME aliases sent by browsers/OS file pickers or third-party downloaders.
_MIME_ALIASES: dict[str, str] = {
    "image/jpg": "image/jpeg",
    "image/pjpeg": "image/jpeg",
    "image/x-png": "image/png",
    "image/x-webp": "image/webp",
    "image/vnd.microsoft.icon": "image/x-icon",
    "image/ico": "image/x-icon",
    "application/ico": "image/x-icon",
}
_GENERIC_MIMES = {"", "application/octet-stream", "binary/octet-stream"}
_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon"}
_SAFE_EXTENSIONS: set[str] = {
    ".jpg",
    ".jpeg",
    ".jfif",
    ".jpe",
    ".png",
    ".webp",
    ".gif",
    ".ico",
    ".pdf",
}

PUBLIC_ID_PREFIX = "uploads"


@dataclass
class UploadResult:
    public_url: str
    storage_path: str
    original_name: str
    mime_type: str
    size_bytes: int
    data: bytes | None = None


def _is_webp(content: bytes) -> bool:
    return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"


def _is_ico(content: bytes) -> bool:
    return (
        len(content) >= 6
        and content[:4] in (b"\x00\x00\x01\x00", b"\x00\x00\x02\x00")
        and content[4:6] != b"\x00\x00"
    )


def _normalize_mime(content_type: str | None) -> str:
    raw = (content_type or "").split(";", 1)[0].strip().lower()
    return _MIME_ALIASES.get(raw, raw)


def _safe_original_name(filename: str | None) -> str:
    raw = Path((filename or "file").strip()).name or "file"
    if len(raw) <= 255:
        return raw
    ext = Path(raw).suffix[:20]
    stem = raw[: len(raw) - len(ext)] if ext else raw
    return f"{stem[: 255 - len(ext)]}{ext}"


def _sniff_type(content: bytes) -> str | None:
    """Return the MIME type matching the file's magic bytes, or None."""
    for mime, magic in _MAGIC.items():
        if mime == "image/x-icon":
            if _is_ico(content):
                return mime
            continue
        if content.startswith(magic):
            if mime == "image/webp" and not _is_webp(content):
                continue
            return mime
    return None


def _validate(
    content: bytes,
    filename: str | None,
    content_type: str | None,
    allowed_types: set[str] | None = None,
) -> tuple[str, str]:
    """Validate sniffed magic bytes + safe extension + declared MIME compatibility.

    Returns ``(detected_mime, safe_extension)``.
    """
    if not content:
        raise HTTPException(status_code=400, detail="File kosong atau tidak valid")
    if not filename or not filename.strip():
        raise HTTPException(status_code=400, detail="No file uploaded")

    accepted_types = allowed_types or ALLOWED_IMAGE_TYPES
    ext = Path(filename.strip()).suffix.lower()
    if ext and ext not in _SAFE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Ekstensi file tidak diizinkan. "
                "Accepted: .jpg, .jpeg, .png, .webp, .gif, .ico, .pdf"
            ),
        )

    detected = _sniff_type(content)
    if detected is None:
        raise HTTPException(
            status_code=400,
            detail="Format atau isi file tidak didukung. Gunakan file gambar/PDF yang valid.",
        )
    if detected not in accepted_types:
        raise HTTPException(
            status_code=400,
            detail="File type not allowed. Accepted: "
            + ", ".join(sorted(accepted_types)),
        )

    declared = _normalize_mime(content_type)
    if declared not in _GENERIC_MIMES and declared != detected:
        # Browsers derive file.type from the filename extension, so a genuine
        # JPEG saved as `.png` sends declared=image/png while sniffing image/jpeg.
        # Allow interchangeable image formats when both are valid images, but
        # still reject document/active MIME mismatches.
        if not (declared in _IMAGE_MIMES and detected in _IMAGE_MIMES):
            raise HTTPException(
                status_code=400,
                detail="Isi file tidak sesuai dengan tipe yang dinyatakan",
            )

    return detected, _TYPE_EXT[detected]


async def _read_with_limit(file: UploadFile, max_size_bytes: int = MAX_SIZE_BYTES) -> bytes:
    content = await file.read(max_size_bytes + 1)
    if len(content) > max_size_bytes:
        max_size_mb = max_size_bytes / (1024 * 1024)
        raise HTTPException(status_code=400, detail=f"File too large (max {max_size_mb:g} MB)")
    return bytes(content)


def _upload_cloudinary(
    content: bytes, original_name: str, content_type: str
) -> UploadResult:
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=settings.cloudinary_secure,
        )
    except ImportError:
        raise HTTPException(status_code=500, detail="Upload provider not installed")

    folder = (
        f"{PUBLIC_ID_PREFIX}/{settings.cloudinary_folder.strip('/')}"
        if settings.cloudinary_folder
        else PUBLIC_ID_PREFIX
    )
    public_id = f"{folder}/{uuid.uuid4().hex}"
    upload_kwargs: dict[str, Any] = {
        "public_id": public_id,
        "folder": None,  # public_id already contains the folder path
        "resource_type": "auto",
        "use_filename": False,
        "overwrite": False,
    }
    if content_type.startswith("image/"):
        upload_kwargs["transformation"] = [
            {"width": 1920, "height": 1920, "crop": "limit"},
            {"quality": "auto"},
            {"fetch_format": "auto"},
        ]

    try:
        result = cloudinary.uploader.upload(content, **upload_kwargs)
    except Exception as exc:
        logger.exception("Cloudinary upload failed for %s", original_name)
        raise HTTPException(
            status_code=502,
            detail="Upload ke layanan penyimpanan gagal. Silakan coba lagi.",
        ) from exc

    public_url = (result or {}).get("secure_url") or (result or {}).get("url")
    storage_path = (result or {}).get("public_id") or public_id
    if not public_url:
        raise HTTPException(
            status_code=502,
            detail="Layanan penyimpanan tidak mengembalikan URL berkas.",
        )

    # Pastikan URL yang disimpan ke DB otomatis memakai f_auto,q_auto dari CDN
    if (
        content_type.startswith("image/")
        and "res.cloudinary.com" in str(public_url)
        and "/image/upload/" in str(public_url)
        and "/f_auto" not in str(public_url)
    ):
        public_url = str(public_url).replace(
            "/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1920/"
        )

    return UploadResult(
        public_url=str(public_url),
        storage_path=str(storage_path),
        original_name=original_name,
        mime_type=content_type,
        size_bytes=len(content),
    )


def _upload_local(
    content: bytes, original_name: str, content_type: str, safe_ext: str = ".bin"
) -> UploadResult:
    base = Path(settings.upload_dir)
    base.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{safe_ext}"
    (base / stored_name).write_bytes(content)
    return UploadResult(
        public_url=f"/uploads/{stored_name}",
        storage_path=str(base / stored_name),
        original_name=original_name,
        mime_type=content_type,
        size_bytes=len(content),
    )


def _upload_db(
    content: bytes, original_name: str, content_type: str, record_id: str
) -> UploadResult:
    return UploadResult(
        public_url=f"/uploads/{record_id}",
        storage_path=f"db://{record_id}",
        original_name=original_name,
        mime_type=content_type,
        size_bytes=len(content),
        data=content,
    )


async def upload_file(
    file: UploadFile,
    record_id: str | None = None,
    *,
    max_size_bytes: int = MAX_SIZE_BYTES,
    allowed_types: set[str] | None = None,
) -> UploadResult:
    content = await _read_with_limit(file, max_size_bytes)
    original_name = _safe_original_name(file.filename)
    detected_type, safe_ext = _validate(content, file.filename, file.content_type, allowed_types)

    provider = settings.upload_provider
    if provider == "cloudinary" and not settings.cloudinary_configured:
        logger.warning("Cloudinary not configured, falling back to local storage")
        provider = "local"

    if provider == "cloudinary":
        result = _upload_cloudinary(content, original_name, detected_type)
    elif provider == "db":
        if not record_id:
            raise HTTPException(
                status_code=500, detail="db upload requires a record id"
            )
        result = _upload_db(content, original_name, detected_type, record_id)
    else:
        result = _upload_local(content, original_name, detected_type, safe_ext)

    logger.info("Uploaded %s -> %s", original_name, result.public_url)
    return result


def delete_upload(storage_path: str) -> None:
    """Delete a previously uploaded asset (by Cloudinary public_id or local path)."""
    if not storage_path:
        return
    if storage_path.startswith("db://"):
        return
    if settings.upload_provider == "cloudinary" and settings.cloudinary_configured:
        try:
            import cloudinary
            import cloudinary.api

            cloudinary.config(
                cloud_name=settings.cloudinary_cloud_name,
                api_key=settings.cloudinary_api_key,
                api_secret=settings.cloudinary_api_secret,
                secure=settings.cloudinary_secure,
            )
            cloudinary.api.delete_resources([storage_path])
        except Exception:
            logger.exception("Cloudinary delete failed for %s", storage_path)
        return

    try:
        upload_root = Path(settings.upload_dir).resolve()
        target = Path(storage_path).resolve()
        if not target.is_relative_to(upload_root):
            logger.warning(
                "Security alert: blocked attempt to delete file outside upload directory: %s",
                storage_path,
            )
            return
        target.unlink(missing_ok=True)
    except OSError:
        logger.exception("Local delete failed for %s", storage_path)
