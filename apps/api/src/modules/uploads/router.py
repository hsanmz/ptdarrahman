"""Public file serving for DB-backed uploads (UPLOAD_PROVIDER=db).

Files are stored inside file_uploads.data and served from here so the API
works on serverless runtimes (Vercel) without Cloudinary or local disk.
"""

from pathlib import Path
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, RedirectResponse, Response

from src.core.config import settings
from src.core.database import get_by_id

router = APIRouter()

FALLBACK_IMAGE_URL = (
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop"
)


@router.get("/uploads/{file_id}")
def get_uploaded_file(file_id: str):
    clean_id = file_id.rsplit(".", 1)[0]
    record = get_by_id("file_uploads", file_id) or get_by_id("file_uploads", clean_id)
    if not record and len(clean_id) == 32:
        try:
            formatted_uuid = str(uuid.UUID(clean_id))
            record = get_by_id("file_uploads", formatted_uuid)
        except Exception:
            pass

    if record and record.get("data"):
        name = (record.get("original_name") or "file").replace("\r", "").replace("\n", "")
        return Response(
            content=record["data"],
            media_type=record.get("mime_type") or "application/octet-stream",
            headers={
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff",
                "Content-Disposition": f'inline; filename="{name}"',
            },
        )

    # Cek disk lokal jika ada
    local_path = Path(settings.upload_dir) / file_id
    if local_path.is_file():
        return FileResponse(local_path)

    # Fallback anggun jika berkas gambar tidak ditemukan di disk/DB (mencegah console error 404)
    lower = file_id.lower()
    if any(lower.endswith(ext) for ext in (".webp", ".jpg", ".jpeg", ".png", ".gif", ".svg")):
        return RedirectResponse(url=FALLBACK_IMAGE_URL, status_code=307)

    raise HTTPException(status_code=404, detail="File not found")
