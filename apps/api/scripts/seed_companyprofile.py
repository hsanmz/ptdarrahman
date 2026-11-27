"""Idempotent database seeder for Company Profile (PTDARRAHMAN).

Seeds official production content for:
  - news_articles (Berita & Acara resmi dengan foto asli)
  - programs (Program pendidikan unggulan & kurikulum)
  - facilities (Fasilitas pesantren)
  - staff (Asatidz & Staff struktural)
  - leadership_members (Struktur organisasi Yayasan & Manajemen Lembaga)
  - achievements (Prestasi santri)
  - gallery_items (Dokumentasi galeri foto kegiatan)
  - testimonials (Testimoni wali santri)
  - social_links (Media sosial resmi)
  - hero_slides (Slide banner beranda)
  - about_content (Blok konten halaman Tentang Kami & preview beranda)
  - faq_items (FAQ resmi PPDB & Pesantren)
  - contact_info (Info kontak & alamat kampus)
  - ppdb_content (Konten landing page PPDB)
  - site_settings (Home CTA, about text, logo, favicon)

Safe to run repeatedly.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.core.database import (  # noqa: E402
    create_record,
    execute_raw,
    get_by_column,
    get_by_id,
    get_by_slug,
    update_record,
    utcnow,
)


def _table_exists(table_name: str) -> bool:
    try:
        execute_raw(f"SELECT 1 FROM `{table_name}` LIMIT 1")
        return True
    except Exception:
        return False


_DUMP_PATH = Path(__file__).resolve().parent / "mysql_cp_dump.json"
_LOCAL_MYSQL_DUMP: dict = {}
if _DUMP_PATH.exists():
    try:
        with open(_DUMP_PATH, encoding="utf-8") as _df:
            _LOCAL_MYSQL_DUMP = json.load(_df)
    except Exception:
        _LOCAL_MYSQL_DUMP = {}


# ============================================================================
# 1. NEWS ARTICLES (Berita Resmi)
# ============================================================================

NEWS_ARTICLES = [
    {
        "slug": "seminar-keislaman-ustaz-ahmad-kainama-kupas-kristologi-dan-perbandingan-agama",
        "category": "Tahfidz & Syar'i",
        "date": "2025-03-10",
        "image": "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop",
        "title": "Seminar Keislaman: Ustaz Ahmad Kainama Kupas Kristologi dan Perbandingan Agama",
        "excerpt": "Kajian Kristologi diadakan di Pesantren Tahfidz Qur'an dan Digital Ar-Rahman menghadirkan Ustadz Ahmad Kainama untuk memperdalam ilmu agama dan perbandingan keyakinan.",
        "author": "Humas PTDARRAHMAN",
        "body": (
            "BEKASI - Kajian Kristologi diadakan di Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) "
            "pada Hari Minggu (10/3/2025) tepatnya di mushola gedung Pesantren Tahfidz Qur'an dan Digital Ar-Rahman, "
            "Jatimulya, Tambun Selatan, Kota Bekasi.\n\n"
            "Tempat ini menjadi wadah bagi para santri dan ustadz untuk memperdalam ilmu agama serta berdiskusi tentang berbagai topik keislaman.\n\n"
            "Kajian kali ini menghadirkan Ustadz Ahmad Kainama, seorang pendakwah yang aktif dalam diskusi lintas agama, khususnya di bidang Kristologi dan perbandingan agama. Dalam ceramahnya, beliau membahas Kristologi dari perspektif Islam guna meningkatkan pemahaman umat Muslim terhadap ajaran agama lain serta mencegah mereka dari pengaruh yang dapat menyebabkan perpindahan keyakinan.\n\n"
            "Kajian berlangsung dengan penuh antusias. Para santri dan ustadz tampak fokus mendengarkan penjelasan dari Ustadz Ahmad Kainama. Beberapa santri mencatat poin-poin penting, sementara yang lain sesekali mengajukan pertanyaan untuk memperjelas pemahaman. Diskusi berjalan dengan penuh semangat namun tetap dalam suasana santun dan ilmiah.\n\n"
            "Kristologi penting untuk dipelajari oleh umat Islam karena beberapa alasan:\n"
            "- Memperkuat Pemahaman Agama: Dengan memahami ajaran agama lain, umat Islam bisa lebih yakin terhadap keyakinannya sendiri.\n"
            "- Memudahkan Dakwah: Pengetahuan tentang Kristologi membantu umat Islam dalam menyampaikan dakwah dengan lebih baik.\n"
            "- Mencegah Kesalahpahaman: Memahami dasar ajaran membantu menghindari kesalahpahaman dalam perbandingan agama.\n"
            "- Menjaga Keimanan: Dengan mengetahui konsep agama lain, umat Islam tidak mudah terpengaruh keyakinan lain.\n\n"
            "Kajian ini menjadi langkah penting dalam memperkuat keimanan serta meningkatkan wawasan santri dalam memahami ajaran Islam."
        ),
    },
    {
        "slug": "upacara-hut-kemerdekaan-ke-80-di-ptd-arrahman",
        "category": "Kegiatan Santri",
        "date": "2025-08-17",
        "image": "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1200&auto=format&fit=crop",
        "title": "Upacara HUT Kemerdekaan ke-80 di PTDARRAHMAN",
        "excerpt": "Peringatan Hari Ulang Tahun (HUT) Kemerdekaan Republik Indonesia ke-80 berlangsung khidmat dan penuh semangat di Pesantren Tahfidz Qur'an dan Digital Ar-Rahman.",
        "author": "Kesiswaan PTDARRAHMAN",
        "body": (
            "BEKASI – Peringatan Hari Ulang Tahun (HUT) Kemerdekaan Republik Indonesia ke-80 berlangsung khidmat dan penuh semangat di Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) pada Minggu (17/08/2025). Upacara detik-detik proklamasi digelar mulai pukul 08:00 hingga 09:00 WIB dengan suasana tertib dan penuh penghormatan.\n\n"
            "Jajaran pimpinan pendidikan PTDARRAHMAN bertindak sebagai Pembina Upacara didampingi oleh seluruh Dewan Asatidz. Jalannya upacara dipimpin oleh perwakilan santri bersama para santri lain yang mengemban tugas masing-masing.\n\n"
            "Dalam amanatnya, Pembina Upacara menyampaikan rasa syukur atas nikmat kemerdekaan yang diperjuangkan para pahlawan bangsa. Beliau menegaskan bahwa salah satu wujud nyata dari kemerdekaan adalah kebebasan dalam beragama dan menuntut ilmu.\n\n"
            "Setelah upacara, rangkaian acara dilanjutkan dengan pidato tiga bahasa (Bahasa Indonesia, Bahasa Arab, dan Bahasa Inggris) yang disampaikan oleh perwakilan santri. Kegiatan ini menjadi ajang untuk melatih keberanian, kemampuan komunikasi, sekaligus menunjukkan semangat santri dalam menguasai bahasa dunia.\n\n"
            "Acara kemudian berlanjut dengan presentasi progres pengembangan project web oleh tim santri. Dalam kesempatan tersebut, mereka memaparkan hasil kerja dan inovasi yang telah dicapai sebagai bentuk kontribusi nyata dalam bidang teknologi.\n\n"
            "Sebagai penutup, suasana kembali meriah dengan digelarnya berbagai perlombaan kemerdekaan yang diikuti oleh seluruh santri."
        ),
    },
    {
        "slug": "ptd-ar-rahman-gelar-lomba-hut-ri-ke-80",
        "category": "Kegiatan Santri",
        "date": "2025-08-17",
        "image": "https://images.unsplash.com/photo-1576767475305-ce65f5cbb67e?q=80&w=1200&auto=format&fit=crop",
        "title": "PTDARRAHMAN Gelar Semarak Lomba Kemerdekaan HUT RI ke-80",
        "excerpt": "Dalam rangka memeriahkan HUT RI ke-80, Pesantren Tahfidz Qur'an dan Digital Ar-Rahman menggelar serangkaian perlombaan seru yang memupuk sportivitas dan ukhuwah santri.",
        "author": "Kesiswaan PTDARRAHMAN",
        "body": (
            "BEKASI – Dalam rangka memeriahkan Hari Ulang Tahun (HUT) Kemerdekaan Republik Indonesia ke-80, Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) menggelar serangkaian perlombaan seru yang diikuti oleh seluruh santri. Kegiatan ini berlangsung pada Ahad (17/08/2025) dengan penuh antusias dan keceriaan.\n\n"
            "Terdapat beragam perlombaan yang dipertandingkan, mulai dari lomba tradisional hingga lomba kreatif, di antaranya balap kardus, estafet sarung, tarik tambang, dan cerdas cermat kemerdekaan. Semua santri bersemangat mengikuti jalannya perlombaan, terlihat dari sorak-sorai dan tawa yang menghiasi suasana pesantren sejak pagi hari.\n\n"
            "Acara berlangsung dari pagi hingga sore hari dengan jeda istirahat dan sholat berjamaah. Tidak hanya sekadar bermain dan berkompetisi, melalui perlombaan ini para santri belajar arti kebersamaan, sportivitas, dan kerja sama tim.\n\n"
            "Dengan penuh keceriaan, kegiatan perlombaan ditutup dengan doa bersama dan pembagian hadiah bagi para pemenang lomba."
        ),
    },
    {
        "slug": "sharing-session-ptd-arrahman-hadirkan-senior-engineer-gojek-kupas-tuntas-next-js",
        "category": "Teknologi Digital",
        "date": "2025-09-14",
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
        "title": "Sharing Session PTDARRAHMAN Hadirkan Senior Engineer Gojek, Kupas Tuntas Next.js",
        "excerpt": "Senior Software Engineer Gojek berbagi wawasan praktis seputar arsitektur Next.js modern, optimasi aplikasi skala industri, dan integrasi API kepada santri PTDARRAHMAN.",
        "author": "Tim IT PTDARRAHMAN",
        "body": (
            "Bekasi – Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) kembali menggelar kegiatan Sharing Session yang penuh inspirasi pada Ahad (14/09/2025). Kali ini, acara menghadirkan Mas Hendiri Sudianto, seorang profesional berpengalaman dari Gojek yang telah berkarya selama 9 tahun di perusahaan teknologi ternama tersebut.\n\n"
            "Dalam kesempatan ini, Mas Hendiri membawakan materi seputar Next.js, framework modern berbasis React yang banyak digunakan dalam pengembangan aplikasi web berskala besar. Ia menjelaskan konsep dasar, best practice, hingga tips praktis yang bisa diterapkan langsung oleh para santri.\n\n"
            "“Next.js itu bukan sekadar framework, tapi fondasi penting untuk membangun aplikasi web yang cepat, efisien, dan scalable. Penguasaan framework ini akan membuka peluang besar di dunia kerja teknologi,” ungkap Mas Hendiri dalam sesi presentasinya.\n\n"
            "Antusiasme peserta terlihat dari banyaknya pertanyaan yang muncul, mulai dari cara optimasi performa website hingga integrasi Next.js dengan API. Mas Hendiri pun menjawab dengan lugas, sembari membagikan pengalaman nyata selama hampir satu dekade di industri.\n\n"
            "Kegiatan ini menjadi momen berharga bagi santri PTDARRAHMAN untuk belajar langsung dari praktisi industri, memperkuat motivasi untuk terus mengasah kemampuan coding dan siap menghadapi tantangan dunia digital."
        ),
    },
    {
        "slug": "santri-ptd-ar-rahman-tunjukkan-semangat-juang-di-porseni-pontren-2025-kabupaten-bekasi",
        "category": "Prestasi",
        "date": "2025-10-16",
        "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
        "title": "Santri PTDARRAHMAN Tunjukkan Semangat Juang di PORSENI PONTREN 2025 Kabupaten Bekasi",
        "excerpt": "Sebanyak 19 santri delegasi PTDARRAHMAN bertanding pada 6 cabang perlombaan di PORSENI PONTREN 2025 tingkat Kabupaten Bekasi bersama 73 pesantren.",
        "author": "Kesiswaan PTDARRAHMAN",
        "body": (
            "BEKASI – Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) kembali menunjukkan semangatnya dalam ajang Pekan Olahraga dan Seni Pondok Pesantren (PORSENI PONTREN) Tahun 2025 tingkat Kabupaten Bekasi yang digelar pada Kamis (16/10/2025) di Pesantren Darul Azhar, Kecamatan Setu, Bekasi.\n\n"
            "Kegiatan tahunan ini diikuti oleh sekitar 73 Pondok Pesantren se-Kabupaten Bekasi dengan lebih dari 2.100 santri sebagai peserta utama dalam beragam kompetisi olahraga dan seni.\n\n"
            "PTDARRAHMAN mengirimkan wakil terbaiknya untuk mengikuti enam cabang lomba, yaitu badminton, futsal, kaligrafi, tenis meja, serta pidato bahasa Arab, bahasa Inggris, dan bahasa Indonesia.\n\n"
            "Sebanyak 19 santri PTDARRAHMAN hadir ke lokasi perlombaan dengan semangat sportivitas dan ukhuwah islamiyah yang tinggi.\n\n"
            "“Menang atau kalah bukan hal utama, yang terpenting adalah pengalaman dan pembelajaran berharga yang didapat oleh para santri,” tutur pembimbing asatidz PTDARRAHMAN.\n\n"
            "Semangat para santri PTDARRAHMAN bukan hanya untuk membawa pulang medali, tapi juga membawa pulang pelajaran tentang perjuangan, kebersamaan, dan keikhlasan dalam setiap langkah."
        ),
    },
    {
        "slug": "menjemput-keberkahan-ramadhan-santri-ptd-ar-rahman-gotong-royong-bersihkan-pesantren",
        "category": "Kehidupan Pesantren",
        "date": "2025-02-27",
        "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop",
        "title": "Menjemput Keberkahan Ramadhan, Santri PTDARRAHMAN Gotong Royong Bersihkan Pesantren",
        "excerpt": "Menyambut bulan suci Ramadhan, santri dan asatidz PTDARRAHMAN melaksanakan Gerakan Lingkungan Indah (GLI) membersihkan seluruh area asrama dan fasilitas belajar.",
        "author": "Humas PTDARRAHMAN",
        "body": (
            "Bekasi – Menyambut datangnya bulan Ramadhan, Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) mengadakan kegiatan bersih-bersih lingkungan pesantren. Kegiatan bertajuk Gerakan Lingkungan Indah (GLI) ini berlangsung pada Kamis (27/02/2025) ba’da shalat Dhuha, melibatkan para santri dan dewan asatidz.\n\n"
            "Fokus utama kegiatan ini adalah membersihkan area yang rawan kotor, seperti toilet, ruang makan, kamar santri, ruang kelas, laboratorium komputer, hingga rooftop dan dapur.\n\n"
            "Partisipasi aktif para santri dan ustadz dalam kegiatan ini mencerminkan kekompakan serta semangat gotong royong dalam menjaga kebersihan lingkungan pesantren. Dengan adanya Gerakan Lingkungan Indah (GLI), diharapkan suasana pesantren menjadi lebih nyaman dan kondusif dalam menyambut ibadah di bulan suci Ramadhan."
        ),
    },
]


def seed_news_articles() -> None:
    if not _table_exists("news_articles"):
        return
    now = utcnow()
    dump_news = _LOCAL_MYSQL_DUMP.get("news_articles")
    if dump_news:
        for item in dump_news:
            existing = get_by_slug("news_articles", item["slug"])
            c_val = item.get("content")
            c_json = c_val if isinstance(c_val, str) else json.dumps(c_val or {}, ensure_ascii=False)
            g_val = item.get("gallery")
            if isinstance(g_val, str):
                g_json = g_val
            elif isinstance(g_val, list):
                g_json = json.dumps(g_val, ensure_ascii=False)
            else:
                g_json = json.dumps([], ensure_ascii=False)
            payload = {
                "slug": item["slug"],
                "category": item.get("category") or "news",
                "date": item.get("date") or "",
                "image": item.get("image"),
                "content": c_json,
                "gallery": g_json,
                "updated_at": now,
            }
            if existing:
                update_record("news_articles", existing["id"], payload)
            else:
                payload["id"] = item.get("id") or f"news-seed-{uuid4().hex[:12]}"
                payload["created_at"] = now
                create_record("news_articles", payload)
        print(f"  news seeded from local MySQL: {len(dump_news)} items")
        return

    for item in NEWS_ARTICLES:
        existing = get_by_slug("news_articles", item["slug"])
        content_obj = {
            "title": item["title"],
            "excerpt": item["excerpt"],
            "body": item["body"],
            "author": item["author"],
        }
        content_json = json.dumps(content_obj, ensure_ascii=False)
        payload = {
            "slug": item["slug"],
            "category": item["category"],
            "date": item["date"],
            "image": item["image"],
            "content": content_json,
            "gallery": json.dumps([], ensure_ascii=False),
            "updated_at": now,
        }
        if existing:
            update_record("news_articles", existing["id"], payload)
            print(f"  news updated:    {item['slug']}")
        else:
            payload["id"] = f"news-seed-{uuid4().hex[:12]}"
            payload["created_at"] = now
            create_record("news_articles", payload)
            print(f"  news created:    {item['slug']}")


# ============================================================================
# 2. PROGRAMS (Program Pendidikan Unggulan)
# ============================================================================

PROGRAMS = [
    {
        "slug": "tahfidz-al-quran",
        "icon": "BookOpen",
        "order": 1,
        "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Tahfidz Al-Qur'an 30 Juz & Ulumul Qur'an",
            "tagline": "Dari Tahsin Bacaan hingga Ujian Terbuka Tasmi' 30 Juz Bil Ghoib",
            "desc": (
                "Program inti yang membimbing santri putra menghafal 30 juz Al-Qur'an secara bertahap, "
                "terukur, dan terjaga sanad bacaannya. Setiap santri mengikuti halaqah harian ba'da Subuh "
                "dan waktu-waktu utama, dievaluasi melalui Sumatif Akhir Semester (SAS) Tahfidz, serta "
                "diuji ketahanan hafalannya melalui sidang Tasmi' 10 Juz Sekali Duduk hingga Tasmi' 30 Juz Bil Ghoib."
            ),
            "duration": "Program Terpadu 6 Tahun",
            "level": "30 Juz Mutqin",
            "highlights": [
                "Tradisi Tasmi' Bil Ghoib Terbuka: Uji hafalan 10 juz sekali duduk hingga 30 juz penuh bersiaran langsung.",
                "Pendalaman Tafsir Al-Qur'an: Membekali santri pemahaman ayat hingga berprestasi di olimpiade tafsir nasional.",
                "Halaqah Intensif Bersama Muhaffidz Bersanad: Bimbingan ziyadah harian dan muraja'ah berjenjang.",
                "Wisuda Khotmul Qur'an: Apresiasi resmi bagi santri perampung setoran 30 juz mutqin.",
            ],
            "curriculum": [
                "Tahsin & Tajwid Terapan Bersanad",
                "Ziyadah & Muraja'ah Harian",
                "Tasmi' Berjenjang (5, 10, 15, 30 Juz Sekali Duduk)",
                "Tafsir Ayat Pilihan & Ulumul Qur'an",
            ],
            "outcomes": [
                "Hafal 30 juz Al-Qur'an secara mutqin, memahami tafsir ayat pilihan, dan siap menjadi imam serta kader da'i Al-Qur'an.",
            ],
        },
    },
    {
        "slug": "teknologi-digital",
        "icon": "Cpu",
        "order": 2,
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Rekayasa Teknologi Digital, Web & IoT",
            "tagline": "Menguasai Pemrograman Modern, Basis Data, dan Internet of Things di Lab Komputer Pesantren",
            "desc": (
                "Program keahlian teknologi digital yang melampaui kurikulum komputer umum. Santri mendalami "
                "rekayasa perangkat lunak modern (Next.js, Python), manajemen basis data, Internet of Things (IoT), "
                "hingga dasar AI di laboratorium komputer modern bersama mentor praktisi industri ternama."
            ),
            "duration": "Program Terpadu 6 Tahun",
            "level": "Praktik Lab & Industri",
            "highlights": [
                "Kurikulum Web Modern (Next.js & Basis Data): Mempelajari arsitektur web scalable dan integrasi API.",
                "Praktikum Internet of Things (IoT): Merakit sensor cerdas, mikrokontroler, dan otomasi perangkat keras.",
                "Mentoring Praktisi Industri: Sharing session rutin bersama senior engineer dari startup & tech giant.",
                "Portofolio Digital Nyata: Setiap santri melahirkan produk aplikasi karya mandiri.",
            ],
            "curriculum": [
                "Algoritma & Pemrograman Web (HTML, CSS, TypeScript, React, Next.js)",
                "Perancangan & Manajemen Basis Data Relasional",
                "Perakitan Sensor Cerdas & Pemrograman Mikrokontroler IoT",
                "Dasar Kecerdasan Buatan (AI) & Produksi Konten Digital",
            ],
            "outcomes": [
                "Mampu membangun aplikasi web fungsional, membuat prototipe perangkat pintar IoT, dan memiliki portofolio proyek teknologi nyata.",
            ],
        },
    },
    {
        "slug": "bilingual",
        "icon": "Globe",
        "order": 3,
        "image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Program Bilingual (Bahasa Arab & Inggris Aktif)",
            "tagline": "Cakap Berkomunikasi Global dan Percaya Diri di Panggung Pidato Tiga Bahasa",
            "desc": (
                "Program pembiasaan komunikasi aktif Bahasa Arab dan Bahasa Inggris di lingkungan asrama pesantren. "
                "Mendukung pemahaman literatur keislaman klasik (kitab kuning) sekaligus dokumentasi teknis pemrograman "
                "global, serta pelatihan public speaking khitobah 3 bahasa."
            ),
            "duration": "Program Terpadu 6 Tahun",
            "level": "Komunikasi & Khitobah Aktif",
            "highlights": [
                "Pelatihan Pidato 3 Bahasa (Arab, Inggris, Indonesia): Pembinaan intensif retorika khitobah dan public speaking.",
                "Bahasa Arab Studi Qur'an & Turats: Penguasaan nahwu-sharaf terapan untuk memahami kitab turats.",
                "Bahasa Inggris Teknologi: Membiasakan santri membaca dokumentasi software engineering berbahasa Inggris.",
                "Delegasi Lomba Bahasa: Aktif berlaga di kompetisi pidato tingkat pesantren regional dan nasional.",
            ],
            "curriculum": [
                "Muhadatsah Harian & Kaidah Bahasa Arab",
                "English for Communication & Tech Documentation",
                "Retorika Public Speaking & Debat Dwibahasa",
                "Seni Kaligrafi Arab & Literasi Islam",
            ],
            "outcomes": [
                "Mampu berpidato dan bercakap aktif dalam Bahasa Arab dan Inggris, serta siap menelaah referensi keislaman dan IT global.",
            ],
        },
    },
    {
        "slug": "akademi-kepemimpinan",
        "icon": "Award",
        "order": 4,
        "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Akademi Kepemimpinan, Karakter & Kemandirian Santri",
            "tagline": "Membentuk Pemimpin Muda yang Mandiri, Disiplin, Sportif, dan Peduli Lingkungan",
            "desc": (
                "Pendidikan kepribadian dan karakter muslim tangguh melalui kultur asrama yang terstruktur 24 jam. "
                "Santri dilatih bertanggung jawab lewat Gerakan Lingkungan Indah (GLI), olahraga prestasi (futsal, "
                "badminton, tenis meja), dakwah digital di studio podcast, serta latihan dasar kepemimpinan (LDK)."
            ),
            "duration": "Program Terpadu 6 Tahun",
            "level": "Karakter Asrama & Organisasi",
            "highlights": [
                "Budaya Kemandirian & Gerakan Lingkungan Indah (GLI): Tanggung jawab terorganisir merawat fasilitas pesantren.",
                "Pembinaan Olahraga & Sportivitas: Latihan futsal, badminton, dan tenis meja untuk ajang kompetisi santri.",
                "Studio Podcast & Dakwah Kreatif: Mengasah kepemimpinan opini dan komunikasi publik lewat media digital.",
                "Ukhuwah & Rihlah Alam: Kegiatan tadabbur alam, peringatan Hari Santri, dan pembentukan jiwa kepemimpinan.",
            ],
            "curriculum": [
                "Adab Penuntut Ilmu & Akhlak Keseharian",
                "Manajemen Waktu & Organisasi Santri",
                "Dakwah Digital & Produksi Podcast Santri",
                "Olahraga Prestasi & Kepanduan",
            ],
            "outcomes": [
                "Pribadi muslim berakhlak mulia, disiplin, mandiri, berfisik sehat, dan memiliki kepekaan kepemimpinan di masyarakat.",
            ],
        },
    },
    {
        "slug": "dirasah-islamiyah",
        "icon": "BookOpen",
        "order": 5,
        "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Dirasah Islamiyah (Studi Keislaman)",
            "tagline": "Memperkokoh Dasar Akidah, Fiqih, Akhlak, dan Pembacaan Kitab Turats",
            "desc": (
                "Program pendalaman ilmu-ilmu syar'i secara berjenjang meliputi akidah tauhid, fiqih ibadah dan muamalah, "
                "akhlak tasawuf, tarikh islam, serta ilmu hadits sebagai pondasi keagamaan santri penghafal Al-Qur'an."
            ),
            "duration": "Program Terpadu 6 Tahun",
            "level": "Studi Keislaman Berjenjang",
            "highlights": [
                "Pembelajaran Berjenjang: Kurikulum akidah dan fiqih disusun sistematis sesuai usia dan perkembangan santri.",
                "Pondasi Ilmu Kitab: Pengenalan dasar membaca kitab kuning dengan kaidah nahwu-sharaf.",
                "Integrasi Adab & Amal: Setiap kajian ilmu syar'i langsung dipraktikkan dalam ibadah keseharian.",
                "Evaluasi Rutin: Pengujian berkala hafalan matan dan pemahaman materi keislaman.",
            ],
            "curriculum": [
                "Akidah Ahlussunnah wal Jama'ah",
                "Fiqih Ibadah Praktis & Muamalah",
                "Hadits Pilihan & Ilmu Hadits",
                "Tarikh & Sirah Nabawiyyah",
            ],
            "outcomes": [
                "Santri memiliki wawasan keislaman yang lurus, pemahaman hukum ibadah yang kokoh, serta kecintaan terhadap sunnah Rasulullah SAW.",
            ],
        },
    },
]


def seed_programs() -> None:
    if not _table_exists("programs"):
        return
    now = utcnow()
    for item in PROGRAMS:
        existing = get_by_slug("programs", item["slug"])
        content_json = json.dumps(item["content"], ensure_ascii=False)
        payload = {
            "slug": item["slug"],
            "icon": item["icon"],
            "image": item["image"],
            "order": item["order"],
            "content": content_json,
            "updated_at": now,
        }
        if existing:
            update_record("programs", existing["id"], payload)
            print(f"  program updated: {item['slug']}")
        else:
            payload["id"] = f"prog-seed-{uuid4().hex[:12]}"
            payload["created_at"] = now
            create_record("programs", payload)
            print(f"  program created: {item['slug']}")


# ============================================================================
# 3. FACILITIES (Fasilitas Kampus)
# ============================================================================

FACILITIES = [
    {
        "category": "Akomodasi & Asrama",
        "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Asrama Santri & Kamar Ber-AC",
            "desc": (
                "Kamar santri dirancang ber-AC dengan sirkulasi udara optimal, ranjang bertingkat kokoh, "
                "loker pribadi yang rapi, dan sistem pengawasan asatidz musrif 24 jam demi kenyamanan istirahat santri."
            ),
            "highlights": [
                "Pendingin Ruangan (AC) di setiap kamar",
                "Loker & Tempat Tidur Pribadi",
                "Pendampingan Musrif Asrama 24 Jam",
                "Kebersihan Terjadwal via Gerakan Lingkungan Indah",
            ],
        },
    },
    {
        "category": "Laboratorium & Teknologi",
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Laboratorium Komputer & Rekayasa Perangkat Lunak",
            "desc": (
                "Ruang praktikum komputer modern dilengkapi perangkat PC spesifikasi tinggi, jaringan internet "
                "terproteksi, perangkat praktikum IoT mikrokontroler, dan layar presentasi interaktif."
            ),
            "highlights": [
                "PC Programming Spek Tinggi & Monitor Luas",
                "Jaringan Internet Filter Edukasi Aman",
                "Modul Praktikum Internet of Things (IoT)",
                "Ruang Kolaborasi Coding Tim Santri",
            ],
        },
    },
    {
        "category": "Ibadah & Spiritual",
        "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Masjid Kampus & Halaqah Al-Qur'an",
            "desc": (
                "Pusat kegiatan spiritual dan tahfidz santri. Menjadi tempat sholat berjamaah lima waktu, qiyamul lail, "
                "halaqah tasmi' 30 juz, serta kajian keislaman bersama para asatidz."
            ),
            "highlights": [
                "Kapasitas Luas & Karpet Bersih Nyaman",
                "Pusat Halaqah Ziyadah Subuh & Ashar",
                "Kajian Rutin Hadits & Tafsir Al-Qur'an",
                "Suasana Tenang untuk Muroja'ah Mandiri",
            ],
        },
    },
    {
        "category": "Media & Kreativitas",
        "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Studio Podcast & Multimedia Kreatif",
            "desc": (
                "Fasilitas produksi konten kreatif yang dilengkapi mikrofon kondenser profesional, lighting studio, "
                "dan kamera perekam untuk melatih santri dalam dakwah digital dan public speaking."
            ),
            "highlights": [
                "Peredam Suara Akustik Berkualitas",
                "Peralatan Mikrofon & Audio Interface Standar Broadcast",
                "Wadah Latihan Public Speaking & Dakwah Digital",
                "Pelatihan Editing Audio & Video Kreatif",
            ],
        },
    },
    {
        "category": "Akademik & Pembelajaran",
        "image": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Ruang Kelas Digital Interaktif",
            "desc": (
                "Ruang kelas ber-AC dengan proyektor cerdas dan tata letak ergonomis, menciptakan atmosfer "
                "belajar yang kondusif untuk pengajaran materi akademik dan bahasa internasional."
            ),
            "highlights": [
                "Ruang Ber-AC & Meja Kursi Ergonomis",
                "Smart Projector & Layar Interaktif",
                "Rasio Santri per Kelas Ideal & Fokus",
                "Papan Tulis Ganda untuk Pengajaran Dinamis",
            ],
        },
    },
    {
        "category": "Fasilitas Penunjang",
        "image": "https://images.unsplash.com/photo-1567521464027-f127ff144326?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Kantin & Ruang Makan Terpadu",
            "desc": (
                "Area makan santri yang bersih dan higienis, menyediakan menu katering halal bergizi seimbang "
                "tiga kali sehari untuk menunjang kesehatan fisik dan stamina santri."
            ),
            "highlights": [
                "Makanan Sehat & Bergizi 3 Kali Sehari",
                "Penyajian Makanan Higienis & Teratur",
                "Area Meja Makan Bersih & Nyaman",
                "Pembiasaan Adab Makan Islami",
            ],
        },
    },
]


def seed_facilities() -> None:
    if not _table_exists("facilities"):
        return
    now = utcnow()
    existing_rows = execute_raw("SELECT id, content FROM facilities")
    existing_titles = set()
    for row in existing_rows:
        try:
            c = json.loads(row.get("content") or "{}")
            if c.get("title"):
                existing_titles.add(c["title"])
        except Exception:
            pass

    for fac in FACILITIES:
        title = fac["content"]["title"]
        if title in existing_titles:
            continue
        content_json = json.dumps(fac["content"], ensure_ascii=False)
        create_record(
            "facilities",
            {
                "id": f"fac-seed-{uuid4().hex[:12]}",
                "category": fac["category"],
                "image": fac["image"],
                "content": content_json,
                "created_at": now,
                "updated_at": now,
            },
        )
        print(f"  facility created: {title}")


# ============================================================================
# 4. STAFF & DEWAN ASATIDZ (staff)
# ============================================================================

STAFF_MEMBERS = [
    {"role": "Mudir", "name": "Ustadz Ziyad Khairy", "level": 1, "image": None},
    {
        "role": "Administrator",
        "name": "Ustadz Mahrozal Mizan",
        "level": 2,
        "image": None,
    },
    {
        "role": "Kepala Kepegawaian",
        "name": "Ustadz Murtadho Tumari",
        "level": 2,
        "image": None,
    },
    {"role": "Guru IT & Pemrograman", "name": "Ustadz Ian", "level": 3, "image": None},
    {
        "role": "Musrif & Pengajar Bahasa Arab",
        "name": "Ustadz Nur Fatoni",
        "level": 3,
        "image": None,
    },
]


def seed_staff() -> None:
    if not _table_exists("staff"):
        return
    now = utcnow()
    dump_staff = _LOCAL_MYSQL_DUMP.get("staff")
    if dump_staff:
        for s in dump_staff:
            existing = get_by_id("staff", s["id"])
            c_val = s.get("content")
            c_json = c_val if isinstance(c_val, str) else json.dumps(c_val or {}, ensure_ascii=False)
            payload = {
                "role": s.get("role") or "teacher",
                "image": s.get("image") or "",
                "content": c_json,
                "updated_at": now,
            }
            if existing:
                update_record("staff", s["id"], payload)
            else:
                payload["id"] = s["id"]
                payload["created_at"] = now
                create_record("staff", payload)
        print(f"  staff seeded from local MySQL: {len(dump_staff)} items")
        return

    for s in STAFF_MEMBERS:
        existing = get_by_column("staff", "role", s["role"])
        content_json = json.dumps(
            {"name": s["name"], "level": s["level"]}, ensure_ascii=False
        )
        payload = {
            "role": s["role"],
            "image": s["image"],
            "content": content_json,
            "updated_at": now,
        }
        if existing:
            update_record("staff", existing["id"], payload)
            print(f"  staff updated:   {s['role']} ({s['name']})")
        else:
            payload["id"] = f"staff-seed-{uuid4().hex[:12]}"
            payload["created_at"] = now
            create_record("staff", payload)
            print(f"  staff created:   {s['role']} ({s['name']})")


# ============================================================================
# 5. LEADERSHIP MEMBERS (Struktur Organisasi Yayasan & Lembaga)
# ============================================================================

LEADERSHIP_MEMBERS = [
    # Dewan Pembina & Pengawas Yayasan
    {
        "board": "yayasan",
        "order": 1,
        "name": "Indra Setiawan",
        "position": "Pembina Yayasan",
        "image": None,
    },
    {
        "board": "yayasan",
        "order": 2,
        "name": "Tri Indra Basoeki",
        "position": "Pembina Yayasan",
        "image": None,
    },
    {
        "board": "yayasan",
        "order": 3,
        "name": "Rini Widiastuti Rahayu",
        "position": "Pengawas Yayasan",
        "image": None,
    },
    {
        "board": "yayasan",
        "order": 4,
        "name": "Eko Santoso",
        "position": "Ketua Yayasan",
        "image": "/images/pak-eko.jpg",
    },
    {
        "board": "yayasan",
        "order": 5,
        "name": "Chandra Sari Nugraheni",
        "position": "Bendahara Yayasan",
        "image": None,
    },
    {
        "board": "yayasan",
        "order": 6,
        "name": "Noor Kartika Muliawati",
        "position": "Sekretaris Yayasan",
        "image": None,
    },
    {
        "board": "yayasan",
        "order": 7,
        "name": "Rachmania Kurniawati",
        "position": "Sekretaris Yayasan",
        "image": None,
    },
    # Pimpinan & Manajemen Lembaga PTDARRAHMAN
    {
        "board": "islamic-center",
        "order": 1,
        "name": "Chandra Sari Nugraheni",
        "position": "President Director",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 2,
        "name": "Fathya Irsalina M",
        "position": "AVP Performance Management",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 3,
        "name": "Mira Susanti",
        "position": "AVP Internal Auditor",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 4,
        "name": "Leo Latul Agusta",
        "position": "Director of Education Center",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 5,
        "name": "Ahmad Mahfud",
        "position": "Director of Support & Development",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 6,
        "name": "Dewi Nareswari",
        "position": "Vice President of Branding & Development",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 7,
        "name": "Dahniar",
        "position": "Vice President of Finance & Support",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 8,
        "name": "Ruswandri",
        "position": "Head of Lembaga Pengelolaan Ziswaf",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 9,
        "name": "Silvi Laeli Kodaria",
        "position": "Head of Sekolah Alam Qurani Ar Rahman",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 10,
        "name": "Ziyad Khairy",
        "position": "Head of Pesantren Tahfidz Qur'an dan Digital Ar-Rahman",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 11,
        "name": "Ahmad Khaeruddin",
        "position": "Head of Lembaga Pendidikan Al Quran",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 12,
        "name": "Susilawati",
        "position": "Head of Lembaga Pembinaan Masyarakat",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 13,
        "name": "Ustadz Mahrozal Mizan",
        "position": "Administrator Pesantren",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 14,
        "name": "Ustadz Murtadho Tumari",
        "position": "Kepala Kepegawaian",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 15,
        "name": "Ustadz Ian",
        "position": "Guru IT & Pemrograman",
        "image": None,
    },
    {
        "board": "islamic-center",
        "order": 16,
        "name": "Ustadz Nur Fatoni",
        "position": "Musrif & Pengajar Bahasa Arab",
        "image": None,
    },
]


def seed_leadership_members() -> None:
    if not _table_exists("leadership_members"):
        return
    now = utcnow()
    dump_lead = _LOCAL_MYSQL_DUMP.get("leadership_members")
    if dump_lead:
        for m in dump_lead:
            existing = get_by_id("leadership_members", m["id"])
            c_val = m.get("content")
            c_json = c_val if isinstance(c_val, str) else json.dumps(c_val or {}, ensure_ascii=False)
            payload = {
                "board": m.get("board") or "yayasan",
                "order": int(m.get("order") or 0),
                "image": m.get("image") or None,
                "content": c_json,
                "updated_at": now,
            }
            if existing:
                update_record("leadership_members", m["id"], payload)
            else:
                payload["id"] = m["id"]
                payload["created_at"] = now
                create_record("leadership_members", payload)
        print(f"  leadership seeded from local MySQL: {len(dump_lead)} items")
        return

    existing_rows = execute_raw(
        "SELECT id, board, `order`, content FROM leadership_members"
    )
    existing_map = {}
    for row in existing_rows:
        try:
            c = json.loads(row.get("content") or "{}")
            existing_map[(row.get("board"), c.get("name"))] = row["id"]
        except Exception:
            pass

    for mem in LEADERSHIP_MEMBERS:
        key = (mem["board"], mem["name"])
        content_obj = {"name": mem["name"], "position": mem["position"]}
        if mem["image"]:
            content_obj["image"] = mem["image"]
        content_json = json.dumps(content_obj, ensure_ascii=False)
        payload = {
            "board": mem["board"],
            "order": mem["order"],
            "content": content_json,
            "updated_at": now,
        }
        if key in existing_map:
            update_record("leadership_members", existing_map[key], payload)
            print(f"  leadership updated: {mem['name']} ({mem['position']})")
        else:
            payload["id"] = f"lead-seed-{uuid4().hex[:12]}"
            payload["created_at"] = now
            create_record("leadership_members", payload)
            print(f"  leadership created: {mem['name']} ({mem['position']})")


# ============================================================================
# 6. ACHIEVEMENTS (Prestasi Santri)
# ============================================================================

ACHIEVEMENTS = [
    {
        "year": 2025,
        "image": "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Alvito Syarman S — Meraih Medali Emas (Bidang Lomba: Tafsir Al-Qur'an & Hadits)",
            "desc": (
                "Santri PTDARRAHMAN berhasil meraih Medali Emas pada ajang Kejuaraan Tafsir Al-Qur'an & Hadits, "
                "membuktikan kedalaman pemahaman ayat suci dan sanad hadits nabawi."
            ),
            "category": "Tahfidz & Tafsir Al-Qur'an",
        },
    },
    {
        "year": 2025,
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Rasyid Anwar Arief — Meraih Medali Perak (Bidang Lomba: Teknik Informatika)",
            "desc": (
                "Prestasi gemilang santri PTDARRAHMAN meraih Medali Perak dalam kompetisi sains dan komputasi rekayasa teknik informatika."
            ),
            "category": "Teknik Informatika & Coding",
        },
    },
    {
        "year": 2025,
        "image": "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Hudzaifah Ali Miftah — Meraih Medali Perunggu (Bidang Lomba: Teknik Informatika)",
            "desc": (
                "Meraih Medali Perunggu dalam kejuaraan teknologi informasi dan logika pemrograman komputer terapan."
            ),
            "category": "Teknik Informatika & Coding",
        },
    },
    {
        "year": 2025,
        "image": "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Rahmatullah Yusuf I — Meraih Medali Perunggu (Bidang Lomba: Bahasa Inggris)",
            "desc": (
                "Meraih Medali Perunggu dalam kompetisi Bahasa Inggris (English Olympiad & Speech Contest) berdaya saing global."
            ),
            "category": "Bilingual & Bahasa Asing",
        },
    },
    {
        "year": 2024,
        "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Tasmi' 30 Juz Bil Ghoib & Khotmul Qur'an Santri Angkatan Pertama",
            "desc": (
                "Dua santri putra PTDARRAHMAN, Alvito Syarman Siregar dan Muhammad Ardan Sunda, "
                "menuntaskan ujian setoran hafalan 30 Juz Bil Ghoib sekali duduk, disiarkan langsung dan disaksikan dewan asatidz."
            ),
            "category": "Tahfidz Al-Qur'an",
        },
    },
]


def seed_achievements() -> None:
    if not _table_exists("achievements"):
        return
    now = utcnow()
    existing_rows = execute_raw("SELECT id, content FROM achievements")
    existing_titles = set()
    for row in existing_rows:
        try:
            c = json.loads(row.get("content") or "{}")
            if c.get("title"):
                existing_titles.add(c["title"])
        except Exception:
            pass

    for ach in ACHIEVEMENTS:
        title = ach["content"]["title"]
        if title in existing_titles:
            continue
        create_record(
            "achievements",
            {
                "id": f"ach-seed-{uuid4().hex[:12]}",
                "year": ach["year"],
                "image": ach["image"],
                "content": json.dumps(ach["content"], ensure_ascii=False),
                "created_at": now,
                "updated_at": now,
            },
        )
        print(f"  achievement created: {title}")


# ============================================================================
# 7. GALLERY ITEMS (Dokumentasi Foto Kegiatan)
# ============================================================================

GALLERY_SEEDS = [
    {
        "id": "gallery-kit-01-kampus",
        "category": "Fasilitas & Lingkungan",
        "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Lingkungan Kampus Hijau & Nyaman",
            "desc": (
                "Kawasan kampus PTDARRAHMAN yang asri dan tenang di Mangunjaya, Tambun Selatan, "
                "dirancang khusus mendukung konsentrasi santri dalam menghafal Al-Qur'an dan eksplorasi teknologi digital."
            ),
        },
    },
    {
        "id": "gallery-kit-02-tahfidz",
        "category": "Kegiatan Tahfidz & Al-Qur'an",
        "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Halaqah Tahfidz & Setoran Ziyadah",
            "desc": (
                "Suasana khidmat halaqah Al-Qur'an ba'da Subuh dan Ashar, di mana santri menyetorkan hafalan baru "
                "(ziyadah) serta muroja'ah berjenjang dengan bimbingan langsung asatidz hafizh bersanad."
            ),
        },
    },
    {
        "id": "gallery-kit-03-lab-komputer",
        "category": "Kegiatan Akademik",
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Praktikum Laboratorium Komputer & Rekayasa Perangkat Lunak",
            "desc": (
                "Santri mendalami ilmu rekayasa teknologi informasi, pengkodean (coding), dasar AI, "
                "dan literasi digital modern di laboratorium komputer berstandar industri."
            ),
        },
    },
    {
        "id": "gallery-kit-04-kegiatan",
        "category": "Kehidupan Santri",
        "image": "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Kegiatan Kebersamaan & Ekstrakurikuler Santri",
            "desc": (
                "Momen pembinaan karakter santri melalui olahraga futsal, badminton, kegiatan gotong royong "
                "Gerakan Lingkungan Indah (GLI), dan peringatan hari besar Islam."
            ),
        },
    },
    {
        "id": "gallery-kit-05-prestasi",
        "category": "Prestasi & Acara",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
        "content": {
            "title": "Upacara & Apresiasi Prestasi Santri",
            "desc": (
                "Pemberian sertifikat hafalan Al-Qur'an dan penghargaan medali bagi santri berprestasi "
                "dalam perlombaan tahfidz, sains teknologi, dan olahraga tingkat pesantren."
            ),
        },
    },
]


def seed_gallery_items() -> None:
    if not _table_exists("gallery_items"):
        return
    now = utcnow()
    dump_gallery = _LOCAL_MYSQL_DUMP.get("gallery_items")
    if dump_gallery:
        for g in dump_gallery:
            existing = get_by_id("gallery_items", g["id"])
            c_val = g.get("content")
            c_json = c_val if isinstance(c_val, str) else json.dumps(c_val or {}, ensure_ascii=False)
            payload = {
                "category": g.get("category") or "Kegiatan",
                "image": g.get("image") or "",
                "content": c_json,
                "updated_at": now,
            }
            if existing:
                update_record("gallery_items", g["id"], payload)
            else:
                payload["id"] = g["id"]
                payload["created_at"] = now
                create_record("gallery_items", payload)
        print(f"  gallery items seeded from local MySQL: {len(dump_gallery)} items")
        return

    for g in GALLERY_SEEDS:
        existing = get_by_id("gallery_items", g["id"])
        content_json = json.dumps(g["content"], ensure_ascii=False)
        payload = {
            "category": g["category"],
            "image": g["image"],
            "content": content_json,
            "updated_at": now,
        }
        if existing:
            update_record("gallery_items", g["id"], payload)
            print(f"  gallery updated: {g['id']}")
        else:
            payload["id"] = g["id"]
            payload["created_at"] = now
            create_record("gallery_items", payload)
            print(f"  gallery created: {g['id']}")


# ============================================================================
# 8. TESTIMONIALS (Testimoni Wali Santri)
# ============================================================================

TESTIMONIALS = [
    {
        "id": "testi-wali-1",
        "name": "H. Ahmad Fauzi",
        "child": "Muhammad Rizky · Santri",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=640&auto=format&fit=crop",
        "order": 1,
        "content": {
            "quote": (
                "Alhamdulillah, perkembangan ananda sangat membanggakan di PTDARRAHMAN. Selain hafalannya terus bergerak maju, "
                "ananda kini cakap membuat website dan percaya diri presentasi. Keseimbangan Qur'an dan teknologi benar-benar nyata."
            ),
        },
    },
    {
        "id": "testi-wali-2",
        "name": "Ibu Siti Rahayu",
        "child": "Aisyah Putri · Santri",
        "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=640&auto=format&fit=crop",
        "order": 2,
        "content": {
            "quote": (
                "Pola asuh di asrama sangat tertib dan penuh kekeluargaan. Para asatidz membimbing dengan sabar dan telaten. "
                "Anak kami menjadi lebih mandiri, sholat tepat waktu, dan adab kesehariannya makin santun."
            ),
        },
    },
    {
        "id": "testi-wali-3",
        "name": "Bapak Dedi Kurniawan",
        "child": "Fathurrahman · Santri",
        "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=640&auto=format&fit=crop",
        "order": 3,
        "content": {
            "quote": (
                "Tradisi Tasmi' Bil Ghoib terbuka sekali duduk menjadi bukti transparansi mutu pendidikan tahfidz di sini. "
                "Kami sebagai orang tua bisa menyaksikan langsung putra kami menyetorkan hafalan dengan lancar."
            ),
        },
    },
    {
        "id": "testi-wali-4",
        "name": "Ibu Nurul Hidayati",
        "child": "Salma Aulia · Santri",
        "image": "https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=640&auto=format&fit=crop",
        "order": 4,
        "content": {
            "quote": (
                "Program bilingual bahasa Arab dan Inggrisnya sangat aplikatif. Putra kami terbiasa membaca referensi teknologi berbahasa Inggris "
                "tanpa melupakan kajian kitab keislaman. Sangat kami rekomendasikan bagi calon wali santri."
            ),
        },
    },
    {
        "id": "testi-wali-5",
        "name": "Bapak Hendra Wijaya",
        "child": "Abizar · Santri",
        "image": "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=640&auto=format&fit=crop",
        "order": 5,
        "content": {
            "quote": (
                "Fasilitas laboratorium komputernya sangat representatif dan dibimbing mentor praktisi industri yang berpengalaman. "
                "Anak kami diajarkan membuat karya nyata yang bermanfaat. Suatu perpaduan kurikulum yang luar biasa."
            ),
        },
    },
]


def seed_testimonials() -> None:
    if not _table_exists("testimonials"):
        return
    now = utcnow()
    for t in TESTIMONIALS:
        existing = get_by_id("testimonials", t["id"])
        content_json = json.dumps(t["content"], ensure_ascii=False)
        payload = {
            "name": t["name"],
            "child": t["child"],
            "image": t["image"],
            "order": t["order"],
            "content": content_json,
            "updated_at": now,
        }
        if existing:
            update_record("testimonials", t["id"], payload)
            print(f"  testi updated:   {t['id']}")
        else:
            payload["id"] = t["id"]
            payload["created_at"] = now
            create_record("testimonials", payload)
            print(f"  testi created:   {t['id']}")


# ============================================================================
# 9. SOCIAL LINKS (Media Sosial Resmi)
# ============================================================================

SOCIAL_LINKS = [
    {
        "label": "Instagram",
        "href": "https://www.instagram.com/ptdar_rahman",
        "path": "M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.258 1.228.6 1.79 1.162.562.561.904 1.13 1.162 1.79.248.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122s-.01 3.056-.06 4.122c-.05 1.065-.217 1.79-.465 2.428a4.837 4.837 0 0 1-1.162 1.79c-.562.562-1.13.904-1.79 1.162-.637.248-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06s-3.056-.01-4.122-.06c-1.065-.05-1.79-.217-2.428-.465a4.837 4.837 0 0 1-1.79-1.162 4.837 4.837 0 0 1-1.162-1.79c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12s.01-3.056.06-4.122c.05-1.065.217-1.79.465-2.428a4.837 4.837 0 0 1 1.162-1.79A4.837 4.837 0 0 1 5.472 2.66c.637-.248 1.363-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
    },
    {
        "label": "YouTube",
        "href": "https://www.youtube.com/@ptdarrahman",
        "path": "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    },
    {
        "label": "WhatsApp",
        "href": "https://wa.me/6281283612352",
        "path": "M12.032.021c-6.626 0-12 5.373-12 12 0 2.116.552 4.107 1.518 5.858l-1.513 5.514 5.668-1.474c1.692.974 3.62 1.534 5.667 1.534 6.627 0 12-5.373 12-12s-5.373-12-12-12zm6.728 16.858c-.278.78-1.377 1.427-2.377 1.627-.591.118-1.362.212-3.95-1.146-3.314-1.737-5.184-5.226-5.338-5.465-.155-.239-1.283-1.706-1.283-3.254 0-1.548.81-2.31 1.096-2.626.286-.316.624-.395.832-.395.208 0 .416 0 .598.01.192.01.46-.074.72.55.26.624.89 2.154.97 2.31.078.156.13.338.026.546-.104.208-.156.338-.312.524-.156.186-.327.416-.468.558-.156.156-.318.326-.136.638.182.312.812 1.339 1.741 2.17 1.196 1.068 2.206 1.4 2.522 1.558.312.156.494.13.676-.078.182-.208.78-.91.988-1.222.208-.312.416-.26.702-.156.286.104 1.82.858 2.132 1.014.312.156.52.234.598.364.078.13.078.754-.2 1.534z",
    },
    {
        "label": "Facebook",
        "href": "https://www.facebook.com/ptdarrahman",
        "path": "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/company/ptdarrahman",
        "path": "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
]


def seed_social_links() -> None:
    if not _table_exists("social_links"):
        return
    now = utcnow()
    for s in SOCIAL_LINKS:
        existing = get_by_column("social_links", "label", s["label"])
        payload = {
            "label": s["label"],
            "href": s["href"],
            "path": s["path"],
            "updated_at": now,
        }
        if existing:
            update_record("social_links", existing["id"], payload)
            print(f"  social updated:  {s['label']}")
        else:
            payload["id"] = f"soc-seed-{uuid4().hex[:12]}"
            payload["created_at"] = now
            create_record("social_links", payload)
            print(f"  social created:  {s['label']}")


# ============================================================================
# 10. HERO SLIDES (Banner Beranda)
# ============================================================================

HERO_SLIDES = [
    {
        "id": "heroslide-1",
        "order": 1,
        "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop",
        "content": {
            "label": "Pesantren Tahfidz & Digital Khusus Putra • Berdiri Sejak 2021",
            "title": "Mencetak Hafidz\nAl-Qur'an 30 Juz\nyang Ahli di Bidang\nTeknologi Digital",
            "subtitle": (
                "Pendidikan pesantren putra terpadu 6 tahun yang memadukan ketangguhan hafalan lewat "
                "tradisi Tasmi' 30 Juz Bil Ghoib dengan penguasaan rekayasa perangkat lunak modern (Next.js, Basis Data, IoT)."
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
                "Olimpiade Tafsir Nasional, sekaligus belajar teknologi web langsung bersama Senior Software Engineer industri."
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
            "title": "Daftarkan Putra Anda\nSecara 100% Online\ndari Rumah",
            "subtitle": (
                "Proses seleksi terintegrasi mulai dari pendaftaran akun, pembayaran QRIS instan, "
                "ujian terpadu CBT & Tahfidz, wawancara bersama orang tua, hingga penerbitan LoA digital resmi."
            ),
            "button_label": "Mulai Pendaftaran",
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


def seed_hero_slides() -> None:
    if not _table_exists("hero_slides"):
        return
    now = utcnow()
    for h in HERO_SLIDES:
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
            print(f"  hero slide up:   {h['id']}")
        else:
            payload["id"] = h["id"]
            payload["created_at"] = now
            create_record("hero_slides", payload)
            print(f"  hero slide new:  {h['id']}")


# ============================================================================
# 11. ABOUT CONTENT (Halaman Tentang Kami & Preview Beranda)
# ============================================================================

ABOUT_SEEDS = [
    {
        "id": "about-hero",
        "section": "hero",
        "order": 0,
        "content": {
            "page_title": "Tentang Kami",
            "badge": "PROFIL INSTITUSI",
            "kicker": "Iman, ilmu, dan karya",
            "title": "Pendidikan yang menyiapkan hati dan masa depan.",
            "subtitle": "Kami memadukan pembinaan Al-Qur'an dengan teknologi, bahasa, dan kepemimpinan dalam keseharian santri yang terarah.",
            "image": "/images/pak-eko.jpg",
            "image_alt": "Eko Santoso, Ketua Yayasan Generasi Cerdas Akhlak Mulia",
            "image_name": "Eko Santoso",
            "image_role": "Ketua Yayasan Generasi Cerdas Akhlak Mulia",
            "cta_label": "Kenali perjalanan kami",
            "cta_href": "#perjalanan",
            "secondary_cta_label": "Pendaftaran PPDB",
        },
    },
    {
        "id": "about-story-heading",
        "section": "story-heading",
        "order": 0,
        "content": {
            "eyebrow": "Perjalanan kami",
            "title": "Bertumbuh dengan arah yang jelas.",
            "body": "Dari keyakinan sederhana, lahir ikhtiar pendidikan yang terus disempurnakan bersama keluarga besar pesantren.",
        },
    },
    {
        "id": "about-story-1",
        "section": "story",
        "order": 1,
        "content": {
            "kicker": "Latar belakang",
            "title": "Berawal dari kebutuhan generasi masa depan.",
            "body": (
                "Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) didirikan di bawah naungan "
                "Yayasan Generasi Cerdas Akhlak Mulia dengan tekad menjawab tantangan zaman: menghadirkan "
                "lingkungan pendidikan yang menjaga kemurnian hafalan Al-Qur'an sekaligus membekali santri "
                "dengan keterampilan teknologi digital yang relevan."
            ),
        },
    },
    {
        "id": "about-story-2",
        "section": "story",
        "order": 2,
        "content": {
            "kicker": "Menjawab kegelisahan",
            "title": "Bukan sekadar pilihan antara dunia atau akhirat.",
            "body": (
                "Banyak orang tua khawatir anak mereka tertinggal dalam penguasaan sains dan teknologi "
                "ketika masuk pesantren, atau sebaliknya kehilangan adab dan Al-Qur'an di sekolah umum. "
                "PTDARRAHMAN menyatukan keduanya secara seimbang: Al-Qur'an sebagai pedoman hati, "
                "dan teknologi sebagai instrumen kemanfaatan dakwah."
            ),
        },
    },
    {
        "id": "about-story-3",
        "section": "story",
        "order": 3,
        "content": {
            "kicker": "Pondasi yang kokoh",
            "title": "Tradisi Qur'ani mutqin bersanad.",
            "body": (
                "Di PTDARRAHMAN, kualitas hafalan diuji lewat tradisi Tasmi' 30 Juz Bil Ghoib sekali duduk "
                "secara transparan di hadapan penguji dan wali santri. Didukung asatidz hafizh bersanad "
                "dengan metode talaqqi dan muroja'ah berjenjang."
            ),
        },
    },
    {
        "id": "about-story-4",
        "section": "story",
        "order": 4,
        "content": {
            "kicker": "Terus melangkah",
            "title": "Laboratorium teknologi dan rekayasa digital terapan.",
            "body": (
                "Di ruang programming lantai 3, para santri belajar coding, AI, database, dan IoT bersama "
                "praktisi industri ternama, membuktikan bahwa seorang hafidz Al-Qur'an juga bisa menjadi "
                "software engineer yang tangguh dan solutif bagi umat."
            ),
        },
    },
    {
        "id": "about-vision",
        "section": "vision",
        "order": 0,
        "content": {
            "eyebrow": "Visi",
            "title": "Visi Lembaga",
            "body": (
                "Menjadi Lembaga Pendidikan Islam Terbaik yang mencetak generasi Qur'ani berakhlak mulia, "
                "berkepribadian tangguh, memiliki hafalan Al-Qur'an 30 juz mutqin, serta menguasai rekayasa "
                "teknologi informasi digital yang adaptif dan mandiri."
            ),
        },
    },
    {
        "id": "about-mission",
        "section": "mission",
        "order": 0,
        "content": {
            "eyebrow": "Misi",
            "title": "Misi Lembaga",
            "items": [
                "Menciptakan lingkungan pesantren islami yang bersih, nyaman, aman, dan kondusif bagi tumbuh kembang santri.",
                "Membina akidah yang lurus, akhlak karimah, dan kepribadian mandiri berbasis keteladanan salafus shalih.",
                "Mencetak generasi penghafal Al-Qur'an 30 Juz secara mutqin dengan standar tajwid dan makhraj bersanad.",
                "Membekali santri kecakapan rekayasa teknologi informasi, coding web modern, dan literasi digital terapan.",
                "Mengembangkan kemampuan komunikasi aktif dwi-bahasa (Arab dan Inggris) untuk kepemimpinan global.",
            ],
        },
    },
    {
        "id": "about-goals",
        "section": "goals",
        "order": 0,
        "content": {
            "eyebrow": "Sasaran",
            "title": "Sasaran Pendidikan",
            "items": [
                "Tercapainya target hafalan 30 Juz Al-Qur'an mutqin serta kelulusan ujian tasmi' berjenjang.",
                "Penguasaan kecakapan dasar dan menengah dalam rekayasa web, manajemen database, dan IoT.",
                "Kemandirian karakter, adab keseharian santri mukim, dan kedisiplinan ibadah lima waktu berjamaah.",
                "Kesiapan santri melanjutkan studi ke perguruan tinggi unggulan keislaman maupun sains teknologi nasional/internasional.",
            ],
        },
    },
    {
        "id": "about-core-values",
        "section": "core-values",
        "order": 0,
        "content": {
            "eyebrow": "Nilai Utama",
            "title": "Nilai Luhur PTDARRAHMAN",
            "items": [
                {
                    "title": "Qur'ani",
                    "desc": "Menjadikan Kalamullah sebagai ruh utama pembentukan karakter, etika, dan pola pikir santri.",
                },
                {
                    "title": "Adaptif",
                    "desc": "Cepat tanggap merespons perkembangan teknologi digital tanpa kehilangan prinsip dasar syariat.",
                },
                {
                    "title": "Integritas",
                    "desc": "Menjunjung kejujuran, amanah, dan komitmen tinggi dalam menuntut ilmu dan berkarya.",
                },
                {
                    "title": "Mandiri",
                    "desc": "Membina ketangguhan hidup, kepemimpinan pribadi, dan jiwa kewirausahaan islami.",
                },
            ],
        },
    },
    {
        "id": "about-legalitas",
        "section": "legalitas",
        "order": 0,
        "content": {
            "eyebrow": "Legalitas",
            "title": "Legalitas Lembaga",
            "items": [
                "SK Kemenag No. KD.10.16/5/PP.00.7/642/2021",
                "Akta Notaris Pendirian Yayasan Generasi Cerdas Akhlak Mulia No. 04 Tahun 2021",
                "SK Kemenkumham RI No. AHU-0012845.AH.01.04.Tahun 2021",
                "Izin Operasional Pondok Pesantren Kementerian Agama Kabupaten Bekasi",
            ],
        },
    },
    {
        "id": "about-home-preview",
        "section": "home-preview",
        "order": 0,
        "content": {
            "badge": "SIAPA KAMI",
            "title": "Mencetak Generasi Qur'ani yang Menguasai Teknologi",
            "subtitle": (
                "Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) adalah institusi pendidikan terpadu "
                "yang mengintegrasikan pembinaan hafalan 30 juz mutqin dengan kurikulum rekayasa teknologi digital "
                "terapan di lingkungan kampus asri Bekasi, Jawa Barat."
            ),
            "cta_label": "Pelajari Selengkapnya",
            "cta_href": "/about",
            "images": [
                "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop",
            ],
            "stat_1_value": 350,
            "stat_1_suffix": "+",
            "stat_1_label": "Santri Aktif",
            "stat_2_value": 40,
            "stat_2_suffix": "+",
            "stat_2_label": "Guru & Staff",
            "stat_3_value": 30,
            "stat_3_suffix": " Juz",
            "stat_3_label": "Hafalan Al-Quran",
            "stat_4_value": 15,
            "stat_4_suffix": "+",
            "stat_4_label": "Ekstrakurikuler",
        },
    },
]


def seed_about_content() -> None:
    if not _table_exists("about_content"):
        return
    now = utcnow()
    for a in ABOUT_SEEDS:
        existing = get_by_id("about_content", a["id"])
        content_json = json.dumps(a["content"], ensure_ascii=False)
        payload = {
            "section": a["section"],
            "order": a["order"],
            "content": content_json,
            "updated_at": now,
        }
        if existing:
            update_record("about_content", a["id"], payload)
            print(f"  about content up: {a['id']}")
        else:
            payload["id"] = a["id"]
            payload["created_at"] = now
            create_record("about_content", payload)
            print(f"  about content nw: {a['id']}")


# ============================================================================
# 12. FAQ ITEMS (Tanya Jawab Resmi)
# ============================================================================

FAQ_ITEMS = [
    {
        "id": "faq-01-keunggulan-lembaga",
        "question": "Apa itu PTDARRAHMAN dan apa yang membedakannya dari pesantren konvensional?",
        "answer": (
            "Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) adalah institusi pendidikan Islam modern "
            "yang mengintegrasikan pembelajaran Tahfidz Al-Qur'an bersanad, pembinaan akhlak mulia, dan penguasaan "
            "teknologi digital mutakhir. Santri tidak hanya dibimbing menghafal Al-Qur'an 30 juz dan memahami ilmu "
            "syar'i secara mendalam, tetapi juga dibekali keahlian digital terapan seperti rekayasa perangkat lunak "
            "(coding), kecerdasan buatan (AI), robotika IoT, serta komunikasi bilingual (Bahasa Arab dan Inggris)."
        ),
        "category": "Umum",
        "order": 1,
    },
    {
        "id": "faq-02-tahapan-ppdb",
        "question": "Bagaimana tahapan pendaftaran dan seleksi calon santri baru di PTDARRAHMAN?",
        "answer": (
            "Pendaftaran santri baru dilaksanakan secara terpadu melalui portal online PPDB PTDARRAHMAN: "
            "(1) Membuat akun dan mengisi formulir biodata serta kuesioner kesehatan mandiri; "
            "(2) Melakukan pembayaran biaya formulir pendaftaran via QRIS dinamis resmi sistem; "
            "(3) Mengunggah berkas persyaratan (NISN, KK, Akta Kelahiran, KTP orang tua, dan 4 rapor terakhir); "
            "(4) Mengikuti ujian seleksi terpadu CBT (akademik & psikologi) dan tes hafalan Tahfidz; "
            "(5) Mengikuti wawancara terpadu calon santri beserta orang tua/wali; "
            "(6) Pengumuman hasil seleksi dan penandatanganan Letter of Acceptance (LoA) digital."
        ),
        "category": "Pendaftaran",
        "order": 2,
    },
    {
        "id": "faq-03-metode-tahfidz",
        "question": "Berapa target hafalan Al-Qur'an santri dan bagaimana metode bimbingan Tahfidz di PTDARRAHMAN?",
        "answer": (
            "Target utama bimbingan adalah pencapaian hafalan hingga 30 Juz secara mutqin dengan standar tajwid "
            "dan makhraj yang teruji. Pembelajaran Al-Qur'an dibimbing langsung oleh para asatidz hafizh bersanad "
            "menggunakan metode talaqqi, musyafahah, ziyadah (hafalan baru harian), muroja'ah berjenjang "
            "(harian, pekanan, dan bulanan), serta tasmi' terbuka di hadapan penguji dan wali santri."
        ),
        "category": "Tahfidz & Syar'i",
        "order": 3,
    },
    {
        "id": "faq-04-kurikulum-digital",
        "question": "Keterampilan teknologi digital apa saja yang dipelajari santri di PTDARRAHMAN?",
        "answer": (
            "Kurikulum digital PTDARRAHMAN dirancang aplikatif dari tingkat fundamental hingga proyek industri, "
            "mencakup pemrograman web dan mobile, pengenalan logika algoritma, kecerdasan buatan (Artificial "
            "Intelligence & Machine Learning), robotika berbasis IoT, dasar-dasar cyber security, serta UI/UX design. "
            "Santri diarahkan untuk menghasilkan produk karya digital nyata yang bermanfaat bagi kemaslahatan umat."
        ),
        "category": "Kurikulum Digital",
        "order": 4,
    },
    {
        "id": "faq-05-biaya-dan-pembayaran",
        "question": "Bagaimana ketentuan biaya pendidikan dan mekanisme pembayarannya?",
        "answer": (
            "Rincian master komponen biaya pendidikan (seperti uang pangkal, seragam, matrikulasi, sarana, dan "
            "SPP bulanan) beserta potongan diskon gelombang/early bird disajikan secara transparan pada dokumen "
            "resmi Letter of Acceptance (LoA) bagi calon santri yang dinyatakan lulus seleksi. Pembayaran biaya "
            "formulir pendaftaran dilakukan langsung melalui QRIS di portal PPDB, sedangkan penyetoran biaya masuk "
            "dilakukan di luar sistem melalui transfer rekening resmi PTDARRAHMAN atau tunai di kantor bendahara pesantren."
        ),
        "category": "Biaya & Pembayaran",
        "order": 5,
    },
    {
        "id": "faq-06-kehidupan-asrama",
        "question": "Bagaimana pola kehidupan harian santri di asrama dan aturan penggunaan gawai/laptop?",
        "answer": (
            "Santri menjalani rutinitas harian yang seimbang dan disiplin selama 24 jam, mulai dari sholat berjamaah "
            "tepat waktu, qiyamul lail, halaqah tahfidz shubuh dan ashar, kegiatan kelas formal, hingga olahraga "
            "dan pembinaan karakter di sore hari. Perangkat komputer dan gawai untuk kebutuhan praktikum digital "
            "digunakan secara terpimpin dan terjadwal di laboratorium komputer atau ruang kelas dengan pengawasan jaringan ketat."
        ),
        "category": "Kehidupan Santri",
        "order": 6,
    },
    {
        "id": "faq-07-fasilitas-pesantren",
        "question": "Fasilitas apa saja yang disediakan pesantren untuk mendukung kenyamanan belajar santri?",
        "answer": (
            "PTDARRAHMAN menyediakan sarana penunjang yang representatif, meliputi ruang asrama bersih ber-AC, "
            "masjid jami' kampus, laboratorium komputer spesifikasi tinggi dengan koneksi internet terproteksi, "
            "ruang kelas interaktif ber-AC, studio podcast multimedia, sarana olahraga, katering makanan halal "
            "bergizi 3 kali sehari, serta pendampingan kesehatan santri."
        ),
        "category": "Fasilitas",
        "order": 7,
    },
]


def seed_faq_items() -> None:
    if not _table_exists("faq_items"):
        return
    now = utcnow()
    for f in FAQ_ITEMS:
        existing = get_by_id("faq_items", f["id"])
        payload = {
            "question": f["question"],
            "answer": f["answer"],
            "category": f["category"],
            "order": f["order"],
            "updated_at": now,
        }
        if existing:
            update_record("faq_items", f["id"], payload)
            print(f"  faq updated:     {f['id']}")
        else:
            payload["id"] = f["id"]
            payload["created_at"] = now
            create_record("faq_items", payload)
            print(f"  faq created:     {f['id']}")


# ============================================================================
# 13. CONTACT INFO (Info Kontak & Alamat)
# ============================================================================

CONTACT_DATA = {
    "address": (
        "Jl. H. Nawawi RT 03/01, Mangunjaya, Tambun Selatan, Kabupaten Bekasi, "
        "Jawa Barat 17510 (Kampus PTDARRAHMAN)"
    ),
    "phone_primary": "+62 812-8361-2352",
    "phone_secondary": "+62 813-8080-1234",
    "whatsapp": "081283612352",
    "email_primary": "info@arrahmanic.org",
    "email_admission": "admission@arrahmanic.org",
    "office_hours": "Senin - Sabtu: 08:00 - 16:00 WIB",
    "maps_embed": (
        '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.082729315809!2d107.05436667503792!3d-6.252831293735623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698f1f7d5c5cf1%3A0x7d6f5f8b9e6b6f7!2sPesantren%20Tahfidz%20Qur%27an%20dan%20Digital%20Ar-Rahman!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" '
        'width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
    ),
}


def seed_contact_info() -> None:
    if not _table_exists("contact_info"):
        return
    now = utcnow()
    existing = execute_raw("SELECT id FROM contact_info LIMIT 1")
    if existing:
        row_id = existing[0]["id"]
        update_record("contact_info", row_id, {**CONTACT_DATA, "updated_at": now})
        print(f"  contact updated: {row_id}")
    else:
        create_record(
            "contact_info",
            {
                "id": f"contact-seed-{uuid4().hex[:12]}",
                **CONTACT_DATA,
                "created_at": now,
                "updated_at": now,
            },
        )
        print("  contact created: default contact info")


# ============================================================================
# 14. PPDB CONTENT (Landing Page PPDB)
# ============================================================================

PPDB_CONTENT_SEEDS = [
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
    {
        "section": "jalur",
        "order": 1,
        "content": {
            "title": "Program Reguler Terpadu",
            "kicker": "Pembinaan Karakter & Sains",
            "desc": "Bagi calon santri putra yang siap mengikuti pembinaan terpadu tahfidz 30 juz dan teknologi informasi dari tingkat dasar hingga mahir.",
            "accent": "emerald",
            "tag": "Pilihan Utama",
            "featured": True,
            "target": "Hafalan 30 Juz & Mahir Coding Web",
            "features": [
                "Target mutqin 30 Juz bersanad",
                "Praktikum coding dan web development (Next.js)",
                "Asrama representatif ber-AC",
                "Ibadah terjadwal & pembiasaan qiyamul lail",
            ],
            "action_label": "Daftar Program Ini",
            "action_href": "/register",
        },
    },
    {
        "section": "jalur",
        "order": 2,
        "content": {
            "title": "Program Tahfidz Intensif",
            "kicker": "Spesialisasi Al-Qur'an & Bahasa",
            "desc": "Program akselerasi hafalan Al-Qur'an disertai pendalaman bahasa Arab aktif dan kajian kitab turats secara berjenjang.",
            "accent": "amber",
            "tag": "Khusus Tahfidz",
            "featured": False,
            "target": "Akselerasi 30 Juz & Khitobah 3 Bahasa",
            "features": [
                "Target setoran lebih intensif",
                "Kajian nahwu, sharaf, dan tafsir Al-Qur'an",
                "Pelatihan pidato dan komunikasi bahasa Arab",
                "Simulasi ujian tasmi' bil ghoib terbuka",
            ],
            "action_label": "Daftar Program Ini",
            "action_href": "/register",
        },
    },
    {
        "section": "copy",
        "order": 1,
        "content": {
            "alur_title": "Alur Seleksi Penerimaan Santri Baru",
            "alur_desc": "Proses seleksi dilakukan secara transparan, objektif, dan terintegrasi melalui portal online PPDB PTDARRAHMAN.",
            "pillars_title": "Empat Pilar Keunggulan Santri",
            "pillars_desc": "Kurikulum terpadu PTDARRAHMAN dibangun di atas empat pilar fondasi utama.",
            "cta_title": "Siap Menjadi Bagian dari Generasi Qur'ani Digital?",
            "cta_desc": "Kuota pendaftaran terbatas pada gelombang yang sedang aktif. Daftarkan putra Anda sekarang juga.",
            "cta_btn_primary": "Daftar Sekarang",
            "cta_btn_secondary": "Hubungi Panitia",
        },
    },
]


def seed_ppdb_content() -> None:
    if not _table_exists("ppdb_content"):
        return
    now = utcnow()
    existing_rows = execute_raw("SELECT id, section, `order` FROM ppdb_content")
    existing_keys = {(r.get("section"), r.get("order")): r["id"] for r in existing_rows}

    for p in PPDB_CONTENT_SEEDS:
        key = (p["section"], p["order"])
        content_json = json.dumps(p["content"], ensure_ascii=False)
        payload = {
            "section": p["section"],
            "order": p["order"],
            "content": content_json,
            "updated_at": now,
        }
        if key in existing_keys:
            update_record("ppdb_content", existing_keys[key], payload)
            print(f"  ppdb content up: {p['section']}:{p['order']}")
        else:
            payload["id"] = f"ppdb-content-{uuid4().hex[:12]}"
            payload["created_at"] = now
            create_record("ppdb_content", payload)
            print(f"  ppdb content nw: {p['section']}:{p['order']}")


# ============================================================================
# 15. SITE SETTINGS BACKFILL (Home CTA, About Text, Branding)
# ============================================================================

COMPANY_SETTINGS = [
    (
        "home_cta",
        json.dumps(
            {
                "enabled": True,
                "badge": "PENDAFTARAN SANTRI BARU",
                "title": "Mulai Perjalanan Menjadi Generasi Qur'ani Berwawasan Teknologi",
                "description": (
                    "Bergabunglah bersama Pesantren Tahfidz Qur'an dan Digital Ar-Rahman. "
                    "Tempa diri menjadi hafidz 30 juz yang unggul dalam rekayasa teknologi informasi."
                ),
                "button_text": "Daftar PPDB Sekarang",
                "button_url": "/ppdb",
            },
            ensure_ascii=False,
        ),
    ),
    (
        "about_text",
        (
            "Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN) adalah institusi pendidikan putra "
            "terpadu 6 tahun di Bekasi yang mengintegrasikan hafalan Al-Qur'an 30 juz mutqin dengan rekayasa teknologi "
            "perangkat lunak modern, Internet of Things (IoT), dan kecakapan bahasa internasional."
        ),
    ),
    (
        "site_description",
        "Pesantren Tahfidz Qur'an dan Digital Ar-Rahman — Membentuk generasi Qur'ani yang tangguh dan adaptif di era digital.",
    ),
    (
        "whatsapp_number",
        "081283612352",
    ),
    (
        "to_email",
        "info@arrahmanic.org",
    ),
]


def seed_company_settings() -> None:
    if not _table_exists("site_settings"):
        return
    now = utcnow()
    for key, value in COMPANY_SETTINGS:
        existing = get_by_column("site_settings", "key", key)
        if not existing:
            create_record(
                "site_settings",
                {"key": key, "value": value, "created_at": now, "updated_at": now},
            )
            print(f"  setting created: {key}")
        elif not (existing.get("value") or "").strip():
            update_record(
                "site_settings", existing["key"], {"value": value, "updated_at": now}
            )
            print(f"  setting backfilled: {key}")


# ============================================================================
# MASTER FUNCTION
# ============================================================================


def seed_all_companyprofile() -> None:
    print("\n--- Seeding Company Profile Official Production Content ---")
    seed_news_articles()
    seed_programs()
    seed_facilities()
    seed_staff()
    seed_leadership_members()
    seed_achievements()
    seed_gallery_items()
    seed_testimonials()
    seed_social_links()
    seed_hero_slides()
    seed_about_content()
    seed_faq_items()
    seed_contact_info()
    seed_ppdb_content()
    seed_company_settings()
    print("--- Company Profile Seeding Complete ---\n")


def main() -> None:
    seed_all_companyprofile()


if __name__ == "__main__":
    main()
