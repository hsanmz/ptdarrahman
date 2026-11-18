"""Create ppdb_content table and seed default landing sections for company profile.

Revision ID: 0073
Revises: 0072
Create Date: 2026-11-05
"""

from __future__ import annotations

import json
import uuid
from collections.abc import Sequence
from datetime import datetime

import sqlalchemy as sa
from alembic import op

revision: str = "0073"
down_revision: str | None = "0072"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLE_NAME = "ppdb_content"

INITIAL_SEEDS = [
    # ── Section: Hero ────────────────────────────────────────────────────────
    {
        "section": "hero",
        "order": 1,
        "content": {
            "hero_title": "Hafidz 30 Juz\nAhli Teknologi",
            "hero_desc": "Pendidikan pesantren putra terpadu: memadukan hafalan Al-Qur'an mutqin 30 juz bersanad dengan rekayasa teknologi digital modern.",
            "hero_proof": "30 Juz Bersanad | Coding & Web | Asrama Modern",
            "hero_cta_label": "Pelajari Program",
            "hero_cta_href": "#info-section",
            "hero_register_label": "Daftar PPDB Online",
            "hero_register_href": "/register",
            "jalur_title": "Program Pembinaan Santri Baru",
            "jalur_desc": "Pesantren Tahfidz Qur'an dan Digital Ar-Rahman membina santri melalui program terpadu tahfidz, sains teknologi terapan, dan karakter islami yang kokoh.",
        },
    },
    # ── Section: Jalur / Program Pembinaan ──────────────────────────────────
    {
        "section": "jalur",
        "order": 1,
        "content": {
            "title": "Program Reguler Terpadu",
            "kicker": "Pembinaan Karakter & Sains",
            "desc": "Bagi calon santri putra yang siap mengikuti pembinaan terpadu tahfidz 30 juz dan teknologi informasi dari tingkat dasar hingga mahir.",
            "accent": "emerald",
            "icon": "GraduationCap",
            "items": [
                "Halaqah Tahfidz harian target mutqin",
                "Dasar pemrograman & logika komputasi",
                "Pembiasaan adab & kemandirian asrama",
            ],
            "cta_label": "Daftar Sekarang",
            "cta_href": "/register",
        },
    },
    {
        "section": "jalur",
        "order": 2,
        "content": {
            "title": "Program Tahfidz Intensif",
            "kicker": "Uji Tahfidz Unggulan",
            "desc": "Bagi calon santri putra yang telah memiliki bekal hafalan Al-Qur'an dan siap mengikuti percepatan tasmi' bersama asatidz penguji.",
            "accent": "amber",
            "icon": "Award",
            "items": [
                "Bimbingan khusus tahsin & tajwid bersanad",
                "Target tasmi' 10 & 30 juz bil ghoib",
                "Integrasi literasi digital islami",
            ],
            "cta_label": "Daftar Sekarang",
            "cta_href": "/register",
        },
    },
    {
        "section": "jalur",
        "order": 3,
        "content": {
            "title": "Program Sains & Digital",
            "kicker": "Eksplorasi Teknologi Terapan",
            "desc": "Bagi calon santri putra yang memiliki minat kuat di bidang pemrograman web, perakitan Internet of Things (IoT), dan kecerdasan buatan.",
            "accent": "sky",
            "icon": "Laptop",
            "items": [
                "Praktik langsung di Lab Programming",
                "Pengembangan web modern & database",
                "Proyek riset IoT & dakwah digital",
            ],
            "cta_label": "Daftar Sekarang",
            "cta_href": "/register",
        },
    },
    {
        "section": "jalur",
        "order": 4,
        "content": {
            "title": "Program Beasiswa / Yatim Dhuafa",
            "kicker": "Dukungan Orang Tua Asuh",
            "desc": "Dukungan pendidikan bagi calon santri putra yatim atau dhuafa berprestasi yang memiliki tekad kuat menghafal Al-Qur'an 30 juz di PTDARRAHMAN.",
            "accent": "violet",
            "icon": "Users",
            "items": [
                "Bantuan biaya pendidikan terarah",
                "Pembinaan intensif tahfidz & teknologi",
                "Monitoring prestasi berkala",
            ],
            "cta_label": "Daftar Sekarang",
            "cta_href": "/register",
        },
    },
    # ── Section: Kurikulum Holistik / Pilar ──────────────────────────────────
    {
        "section": "pillar",
        "order": 1,
        "content": {
            "title": "Tahfidz Al-Qur'an Bersanad",
            "desc": "Pembinaan tahsin, ziyadah, dan muraja'ah harian hingga ujian terbuka Tasmi' 10 Juz & 30 Juz Bil Ghoib serta kajian Tafsir Al-Qur'an.",
            "icon": "BookOpen",
        },
    },
    {
        "section": "pillar",
        "order": 2,
        "content": {
            "title": "Teknologi Digital & Coding",
            "desc": "Praktik langsung di Ruang Programming mencakup pengembangan web modern (Next.js), basis data, dan perakitan Internet of Things (IoT).",
            "icon": "Laptop",
        },
    },
    {
        "section": "pillar",
        "order": 3,
        "content": {
            "title": "Karakter Qur'ani & Adab",
            "desc": "Penanaman akhlaq mulia, kemandirian santri melalui adab asrama 24 jam, kepemimpinan (qiyadah), dan pembiasaan ibadah yaumiyah.",
            "icon": "ShieldCheck",
        },
    },
    {
        "section": "pillar",
        "order": 4,
        "content": {
            "title": "Sains & Bahasa Asing",
            "desc": "Penguatan sains terapan, matematika nalar, serta percakapan harian Bahasa Arab dan Bahasa Inggris untuk wawasan global santri.",
            "icon": "Globe",
        },
    },
    # ── Section: Alur Pendaftaran (6 Langkah Baku) ──────────────────────────
    {
        "section": "step",
        "order": 1,
        "content": {
            "title": "Pendaftaran Akun & Data Lengkap",
            "desc": "Pembuatan akun resmi calon santri secara mandiri dengan mengisi 6 bagian data diri, orang tua/wali, kontak darurat, serta 10 kuesioner kesehatan.",
        },
    },
    {
        "section": "step",
        "order": 2,
        "content": {
            "title": "Pembayaran Formulir Instan (QRIS)",
            "desc": "Penyelesaian biaya administrasi formulir via QRIS dinamis otomatis (Midtrans) dengan bukti kuitansi digital berstempel HMAC resmi.",
        },
    },
    {
        "section": "step",
        "order": 3,
        "content": {
            "title": "Unggah 6 Dokumen Persyaratan",
            "desc": "Pengunggahan scan berkas NISN, Kartu Keluarga, Akta Kelahiran, Pas Foto terbaru, KTP Orang Tua/Wali, dan 4 rapor terakhir untuk verifikasi panitia.",
        },
    },
    {
        "section": "step",
        "order": 4,
        "content": {
            "title": "Ujian Seleksi Terpadu (CBT & Tahfidz)",
            "desc": "Pelaksanaan ujian CBT Akademik, CBT Psikologi, dan uji kelancaran Tahfidz Al-Qur'an secara objektif sesuai jadwal kloter batch yang ditentukan.",
        },
    },
    {
        "section": "step",
        "order": 5,
        "content": {
            "title": "Wawancara Terpadu (Santri & Wali)",
            "desc": "Wawancara pendalaman kesiapan calon santri dan komitmen pendidikan bersama orang tua/wali dalam satu jadwal terpadu.",
        },
    },
    {
        "section": "step",
        "order": 6,
        "content": {
            "title": "Pengumuman Kelulusan & LoA Digital",
            "desc": "Rilis hasil kelulusan seleksi dan penerbitan Letter of Acceptance (LoA) resmi ber-QR Code dengan tanda tangan digital santri & wali sebagai tuntas PPDB.",
        },
    },
    # ── Section: FAQ Khusus PPDB ─────────────────────────────────────────────
    {
        "section": "faq",
        "order": 1,
        "content": {
            "category": "Persyaratan & Seleksi",
            "question": "Apa saja materi yang diujikan dalam Seleksi PPDB PTDARRAHMAN?",
            "answer": "Seleksi calon santri baru terdiri dari tiga bagian terpadu: (1) Ujian CBT Akademik (Penalaran Dasar & Matematika), (2) Ujian CBT Psikologi (Kesiapan Belajar & Minat), dan (3) Uji Tahfidz Al-Qur'an (Kelancaran membaca, makhraj, tajwid, dan hafalan yang sudah dimiliki), dilanjutkan sesi wawancara terpadu calon santri bersama orang tua/wali.",
        },
    },
    {
        "section": "faq",
        "order": 2,
        "content": {
            "category": "Kehidupan Pesantren",
            "question": "Apakah santri diperbolehkan membawa gadget atau smartphone pribadi?",
            "answer": "Tidak. Demi menjaga fokus halaqah hafalan Al-Qur'an dan pembiasaan adab islami, seluruh santri tidak diperkenankan membawa gadget pribadi ke lingkungan pesantren. Seluruh kegiatan belajar teknologi dan coding dilaksanakan di Laboratorium Komputer & Programming resmi pesantren di bawah bimbingan asatidz instruktur.",
        },
    },
    {
        "section": "faq",
        "order": 3,
        "content": {
            "category": "Persyaratan & Seleksi",
            "question": "Bagaimana jika calon santri belum memiliki hafalan Al-Qur'an yang banyak?",
            "answer": "Pendaftaran terbuka bagi seluruh calon santri putra lulusan SD/MI/Sederajat yang memiliki tekad kuat dan niat ikhlas menghafal Al-Qur'an 30 juz. Dalam seleksi tahfidz, panitia mengutamakan kelancaran membaca Al-Qur'an, makhraj huruf, tajwid dasar, serta daya tangkap hafalan baru (ziyadah), bukan semata-mata jumlah juz yang telah dihafal sebelumnya.",
        },
    },
    {
        "section": "faq",
        "order": 4,
        "content": {
            "category": "Persyaratan & Seleksi",
            "question": "Apakah ujian seleksi dapat diikuti secara daring (online) bagi peserta luar kota?",
            "answer": "Ya. PTDARRAHMAN memfasilitasi ujian seleksi daring melalui Computer-Based Test (CBT) terawasi kamera Zoom serta tes tahfidz virtual via video call bagi calon santri dan orang tua/wali yang berdomisili di luar wilayah Jabodetabek.",
        },
    },
    {
        "section": "faq",
        "order": 5,
        "content": {
            "category": "Jadwal & Gelombang",
            "question": "Kapan batas akhir pendaftaran dan penetapan jadwal ujian batch?",
            "answer": "Pendaftaran akun dan pembayaran formulir dapat dilakukan selama gelombang aktif masih membuka kuota. Penjadwalan ujian dilaksanakan berkala per batch, dengan batas waktu penutupan berkas (cutoff) paling lambat 24 jam (H-1) sebelum hari ujian kloter batch yang dipilih.",
        },
    },
    {
        "section": "faq",
        "order": 6,
        "content": {
            "category": "Biaya & Beasiswa",
            "question": "Bagaimana skema pembayaran biaya pendidikan dan program beasiswa?",
            "answer": "Di dalam portal PPDB, pendaftar hanya menyelesaikan biaya formulir pendaftaran via QRIS. Biaya pendidikan resmi (uang pangkal, SPP, dll.) disetorkan di luar sistem via transfer ke rekening resmi PTDARRAHMAN setelah calon santri dinyatakan lulus dan menandatangani LoA. Tersedia program beasiswa tahfidz dan dukungan orang tua asuh bagi santri yatim atau dhuafa berprestasi.",
        },
    },
    # ── Section: CTA Konsultasi ──────────────────────────────────────────────
    {
        "section": "cta",
        "order": 1,
        "content": {
            "cta_title": "Konsultasi Pendaftaran Santri Baru?",
            "cta_desc": "Tim panitia PPDB siap melayani pertanyaan mengenai kurikulum, program beasiswa, dan kunjungan kampus pesantren.",
            "cta_primary_label": "Hubungi Panitia (WhatsApp)",
            "cta_primary_href": "/contact",
        },
    },
]


def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    existing_tables = insp.get_table_names()

    if TABLE_NAME not in existing_tables:
        op.create_table(
            TABLE_NAME,
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("section", sa.String(50), nullable=False),
            sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("content", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )

    # Seed initial rows if empty
    res = conn.execute(sa.text(f"SELECT COUNT(*) FROM {TABLE_NAME}")).scalar()
    if not res:
        now = datetime.utcnow()
        for seed in INITIAL_SEEDS:
            conn.execute(
                sa.text(
                    f"INSERT INTO {TABLE_NAME} (id, section, `order`, content, created_at, updated_at) "
                    "VALUES (:id, :section, :order, :content, :created_at, :updated_at)"
                ),
                {
                    "id": str(uuid.uuid4()),
                    "section": seed["section"],
                    "order": seed["order"],
                    "content": json.dumps(seed["content"], ensure_ascii=False),
                    "created_at": now,
                    "updated_at": now,
                },
            )


def downgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    if TABLE_NAME in insp.get_table_names():
        op.drop_table(TABLE_NAME)
