#!/usr/bin/env python3
"""
Upload local company profile images to Cloudinary CDN and update mysql_cp_dump.json.
This ensures zero disk space is used on production VPS for media assets.
"""

import json
import os
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

import cloudinary
import cloudinary.uploader

# Cloudinary config
CLOUD_NAME = "dfwutfkbn"
API_KEY = "972511113942619"
API_SECRET = "_5nv6X8OEmTNCZsOokP0OXN_qAI"
FOLDER = "ptdarrahman"

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=API_KEY,
    api_secret=API_SECRET,
    secure=True,
)

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
CP_UPLOADS = ROOT_DIR / "apps" / "companyprofile" / "public" / "uploads"
API_UPLOADS = ROOT_DIR / "apps" / "api" / "uploads"
DUMP_FILE = ROOT_DIR / "apps" / "api" / "scripts" / "mysql_cp_dump.json"
MAPPING_FILE = ROOT_DIR / "apps" / "api" / "scripts" / "cloudinary_mapping.json"


def load_mapping() -> dict[str, str]:
    if MAPPING_FILE.exists():
        try:
            with open(MAPPING_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_mapping(mapping: dict[str, str]):
    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)


def upload_single_file(file_path: Path, mapping: dict[str, str]) -> tuple[str, str]:
    filename = file_path.name
    if filename in mapping:
        return filename, mapping[filename]

    print(f"Uploading {filename} ({file_path.stat().st_size // 1024} KB)...")
    try:
        res = cloudinary.uploader.upload(
            str(file_path),
            folder=FOLDER,
            public_id=filename,
            overwrite=False,
            resource_type="auto",
        )
        url = res.get("secure_url") or res.get("url")
        print(f"  -> {filename} uploaded: {url}")
        return filename, url
    except Exception as e:
        print(f"  [ERROR] {filename}: {e}")
        return filename, ""


def main():
    print("=== Migrasi Gambar Lokal ke Cloudinary CDN ===")
    all_files: dict[str, Path] = {}

    for src_dir in [CP_UPLOADS, API_UPLOADS]:
        if src_dir.exists():
            for f in src_dir.iterdir():
                if f.is_file() and not f.name.startswith("."):
                    all_files[f.name] = f

    print(f"Total file gambar unik ditemukan: {len(all_files)}")

    mapping = load_mapping()
    print(f"Cache mapping yang sudah ada: {len(mapping)} file")

    files_to_upload = [p for name, p in all_files.items() if name not in mapping]
    print(f"File yang perlu di-upload: {len(files_to_upload)}")

    if files_to_upload:
        # Gunakan 4 worker concurrency agar upload cepat & stabil
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_file = {
                executor.submit(upload_single_file, f, mapping): f
                for f in files_to_upload
            }
            for future in as_completed(future_to_file):
                fname, url = future.result()
                if url:
                    mapping[fname] = url
                    save_mapping(mapping)

    print(f"\nSelesai upload! Total mapping aktif: {len(mapping)}")

    # Update mysql_cp_dump.json
    if DUMP_FILE.exists():
        print("\nMemperbarui referensi URL di mysql_cp_dump.json...")
        with open(DUMP_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        replace_count = 0
        for fname, cdn_url in mapping.items():
            # Cari variasi URL lokal
            patterns = [
                f"http://localhost:8000/uploads/{fname}",
                f"/uploads/{fname}",
                f"uploads/{fname}",
            ]
            for p in patterns:
                if p in content:
                    content = content.replace(p, cdn_url)
                    replace_count += 1

        with open(DUMP_FILE, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"mysql_cp_dump.json berhasil diperbarui! ({replace_count} URL digantikan dengan Cloudinary CDN)")

    print("\n=== Migrasi Cloudinary Selesai ===")


if __name__ == "__main__":
    main()
