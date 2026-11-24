#!/usr/bin/env python3
"""Seed / update hero slides for PTDARRAHMAN Company Profile.

Run from the `apps/api` directory:
    python -m scripts.seed_hero

Or from the monorepo root:
    pnpm run seed:hero
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Adjust import path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.core.database import (  # noqa: E402
    create_record,
    execute_raw,
    get_by_id,
    update_record,
    utcnow,
)

HERO_SLIDES_DATA = [
    {
        "id": "heroslide-1",
        "order": 1,
        "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop",
        "content": {
            "label": "Pesantren Tahfidz & Digital Khusus Putra • Berdiri Sejak 2021",
            "title": "Mencetak Hafidz\nAl-Qur'an 30 Juz\nyang Ahli di Bidang\nTeknologi Digital",
            "subtitle": (
                "Pendidikan pesantren putra terpadu 6 tahun yang memadukan ketangguhan hafalan lewat "
                "tradisi Tasmi' 30 Juz Bil Ghoib dengan penguasaan rekayasa perangkat lunak modern (Next.js, Basis Data, IoT & Cloud)."
            ),
            "button_label": "Daftar PPDB Online",
            "button_href": "/ppdb",
        },
    },
    {
        "id": "heroslide-2",
        "order": 2,
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1920&auto=format&fit=crop",
        "content": {
            "label": "Terbukti Melahirkan Hafidz 30 Juz & Juara Nasional",
            "title": "Dari Majelis Tasmi' Bil Ghoib\nhingga Ruang Programming\nBersama Praktisi Industri",
            "subtitle": (
                "Santri PTDARRAHMAN ditempa menyetorkan hafalan 10 hingga 30 juz sekali duduk, menjuarai "
                "berbagai kompetisi sains dan tahfidz, sekaligus belajar teknologi digital langsung dari praktisi industri teknologi."
            ),
            "button_label": "Lihat Jejak Prestasi",
            "button_href": "/achievements",
        },
    },
    {
        "id": "heroslide-3",
        "order": 3,
        "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1920&auto=format&fit=crop",
        "content": {
            "label": "PPDB Pesantren Tahfidz Qur'an dan Digital Ar-Rahman Dibuka",
            "title": "Daftarkan Putra Anda\nSecara 100% Online\nMelalui Portal Resmi",
            "subtitle": (
                "Proses seleksi terintegrasi mulai dari registrasi akun calon santri, pembayaran QRIS dinamis, "
                "ujian seleksi terpadu CBT & Tahfidz, wawancara santri & orang tua, hingga Letter of Acceptance (LoA) resmi ber-HMAC."
            ),
            "button_label": "Mulai Pendaftaran PPDB",
            "button_href": "/register",
        },
    },
    {
        "id": "heroslide-4",
        "order": 4,
        "image": "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop",
        "content": {
            "label": "Ekosistem Pesantren Asri & Pendampingan 24 Jam",
            "title": "Membina Akidah, Adab Asrama,\ndan Kemandirian Santri\ndalam Fasilitas Modern",
            "subtitle": (
                "Lingkungan mukim representatif dengan pendampingan asatidz dan musyrif 24 jam, pembiasaan ibadah berjamaah di masjid, "
                "laboratorium komputer modern, asrama nyaman, serta sarana olahraga kebugaran santri."
            ),
            "button_label": "Jelajahi Fasilitas",
            "button_href": "/facilities",
        },
    },
]


def _table_exists(table_name: str) -> bool:
    try:
        execute_raw(f"SELECT 1 FROM `{table_name}` LIMIT 1")
        return True
    except Exception:
        return False


def seed_hero_slides() -> None:
    if not _table_exists("hero_slides"):
        print("Table 'hero_slides' does not exist yet. Please run migrations first.")
        return

    now = utcnow()
    print("Seeding Hero Slides for PTDARRAHMAN Company Profile...")
    for h in HERO_SLIDES_DATA:
        existing = get_by_id("hero_slides", h["id"])
        content_json = json.dumps(h["content"], ensure_ascii=False)
        payload = {
            "order": h["order"],
            "image": h["image"],
            "content": content_json,
            "updated_at": now,
        }
        if existing:
            update_record("hero_slides", h["id"], payload)
            print(f"  hero slide updated: {h['id']} (order: {h['order']})")
        else:
            payload["id"] = h["id"]
            payload["created_at"] = now
            create_record("hero_slides", payload)
            print(f"  hero slide created: {h['id']} (order: {h['order']})")
    print(f"Successfully seeded {len(HERO_SLIDES_DATA)} hero slides.")


def main() -> None:
    seed_hero_slides()


if __name__ == "__main__":
    main()
