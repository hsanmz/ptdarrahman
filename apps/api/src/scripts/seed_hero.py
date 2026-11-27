#!/usr/bin/env python3
"""Seed / update hero slides for PTDARRAHMAN Company Profile.

Run from the `apps/api` directory:
    python -m src.scripts.seed_hero

Or directly:
    python src/scripts/seed_hero.py
"""

from __future__ import annotations

import json
import sys
from datetime import UTC, datetime
from pathlib import Path

# Adjust import path to repository root / apps/api
sys.path.append(str(Path(__file__).resolve().parents[2]))

from sqlalchemy.orm import Session

from src.core.database import get_engine
from src.models.content import HeroSlide

HERO_SLIDES_DATA = [
    {
        "id": "heroslide-1",
        "order": 1,
        "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop",
        "content": {
            "label": "Pesantren Tahfidz & Digital Khusus Putra • Berdiri Sejak 2021",
            "title": "Mencetak Hafidz\nAl-Qur'an 30 Juz\nyang Ahli di Bidang\nTeknologi Digital",
            "subtitle": (
                "Pendidikan pesantren jenjang SMK 3 tahun yang memadukan ketangguhan hafalan lewat "
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


def upsert_hero_slide(session: Session, record: dict) -> None:
    existing = session.query(HeroSlide).filter(HeroSlide.id == record["id"]).first()
    content_json = json.dumps(record["content"], ensure_ascii=False)
    now = datetime.now(UTC).replace(tzinfo=None)

    if existing:
        existing.order = record["order"]
        existing.image = record["image"]
        existing.content = content_json
        existing.updated_at = now
        session.add(existing)
        print(f"  hero slide updated: {record['id']} (order: {record['order']})")
    else:
        slide = HeroSlide(
            id=record["id"],
            order=record["order"],
            image=record["image"],
            content=content_json,
            created_at=now,
            updated_at=now,
        )
        session.add(slide)
        print(f"  hero slide created: {record['id']} (order: {record['order']})")


def main() -> None:
    engine = get_engine()
    print("Seeding Hero Slides for PTDARRAHMAN Company Profile...")
    with Session(engine) as session:
        for rec in HERO_SLIDES_DATA:
            upsert_hero_slide(session, rec)
        session.commit()
    print(f"Successfully seeded {len(HERO_SLIDES_DATA)} hero slides.")


if __name__ == "__main__":
    main()
