/**
 * Data Resmi Statis PPDB Pesantren Tahfidz Qur'an dan Digital Ar-Rahman (PTDARRAHMAN)
 * Jenjang: SMK (Sekolah Menengah Kejuruan) — Target Calon Santri: Lulusan SMP / MTs / Sederajat
 * Mencakup:
 * 1. Program Harian Santri (18 Aktivitas)
 * 2. Prestasi Santri (Torehan Medali & Kejuaraan)
 * 3. Ekskul & Outing Class
 * 4. Biaya Pendidikan Resmi (5 Komponen Standar, Total Rp 25.000.000)
 * 5. Alur Pendaftaran (5 Tahap Utama)
 */

export const JENJANG_PPDB = {
  jenjang: 'SMK (Sekolah Menengah Kejuruan)',
  durasi: '3 Tahun (6 Semester)',
  kejuruan: 'Teknologi Informasi & Rekayasa Perangkat Lunak',
  targetLulusan: 'Lulusan SMP / MTs / Sederajat',
  keterangan: 'Penerimaan calon santri putra lulusan SMP / MTs / sederajat untuk jenjang kejuruan SMK Teknologi Digital (masa studi 3 tahun) dan Tahfidz 30 Juz Bersanad.',
}

export interface ProgramHarianItem {
  id: string
  number: number
  title: string
  timeRange: string
  timeCategory: 'Dini Hari' | 'Subuh' | 'Pagi' | 'Siang' | 'Sore' | 'Malam'
  desc: string
  tag: string
  iconName?: string
}

export interface PrestasiItem {
  id: string
  name: string
  medal: 'Emas' | 'Perak' | 'Perunggu'
  competitionField: string
  achievement: string
  eventTitle: string
  desc: string
  badgeBg: string
  badgeText: string
  iconColor: string
}

export interface EkskulItem {
  id: string
  name: string
  category: 'Olahraga' | 'Seni & Budaya' | 'Outing Class & Religi'
  desc: string
  badgeColor: string
}

export interface BiayaPendidikanItem {
  no: number
  name: string
  nominal: number
  periodicity: string
  desc: string
  regularDiscount: number
  earlyDiscount: number
}

export interface AlurPendaftaranItem {
  step: number
  title: string
  subtitle: string
  desc: string
  badge: string
  iconName: string
}

// ── 1. Program Harian Santri (18 Aktivitas) ─────────────────────────────────
export const PROGRAM_HARIAN: ProgramHarianItem[] = [
  {
    id: 'ph-1',
    number: 1,
    title: 'Tahajud',
    timeRange: '03.30 - 04.30 WIB',
    timeCategory: 'Dini Hari',
    desc: 'Bangun lebih awal untuk Qiyamul Lail, shalat Tahajud, istighfar fajar, dan pembinaan ruhiyah sebelum fajar.',
    tag: 'Ibadah Sunnah',
  },
  {
    id: 'ph-2',
    number: 2,
    title: 'Shalat Subuh',
    timeRange: '04.30 - 05.15 WIB',
    timeCategory: 'Subuh',
    desc: 'Shalat Subuh berjamaah tepat waktu di musholla, pembacaan wirid ma\'tsurat fajar, dan tilawah pembuka hari.',
    tag: 'Ibadah Wajib',
  },
  {
    id: 'ph-3',
    number: 3,
    title: 'Halaqoh Subuh',
    timeRange: '05.15 - 06.15 WIB',
    timeCategory: 'Pagi',
    desc: 'Halaqah Al-Qur\'an intensif bersama Muhaffidz mukim: setoran hafalan baru (ziyadah) dan tasmi\' kelancaran tajwid.',
    tag: 'Tahfidz Al-Qur\'an',
  },
  {
    id: 'ph-4',
    number: 4,
    title: 'Olahraga Pagi',
    timeRange: '06.15 - 06.45 WIB',
    timeCategory: 'Pagi',
    desc: 'Lari santai, pemanasan fisik, dan senam kebugaran jasmani santri untuk stamina belajar seharian.',
    tag: 'Kebugaran',
  },
  {
    id: 'ph-5',
    number: 5,
    title: 'Sarapan',
    timeRange: '06.45 - 07.15 WIB',
    timeCategory: 'Pagi',
    desc: 'Sarapan pagi bernutrisi seimbang bersama di ruang makan asrama, pembiasaan adab makan sunnah Rasulullah.',
    tag: 'Kemandirian',
  },
  {
    id: 'ph-6',
    number: 6,
    title: 'Shalat Dhuha, Dzikir Pagi, dan Ta\'lim Pagi',
    timeRange: '07.15 - 08.00 WIB',
    timeCategory: 'Pagi',
    desc: 'Menunaikan shalat sunnah Dhuha, dzikir pagi bersama, serta ta\'lim pembinaan adab santri oleh para asatidz.',
    tag: 'Adab & Ibadah',
  },
  {
    id: 'ph-7',
    number: 7,
    title: 'Halaqoh Dhuha',
    timeRange: '08.00 - 09.30 WIB',
    timeCategory: 'Pagi',
    desc: 'Halaqah kedua penguatan muroja\'ah berjenjang, tasmi\' pasangan santri (mutaba\'ah quran), dan tahsin makhraj.',
    tag: 'Tahfidz Al-Qur\'an',
  },
  {
    id: 'ph-8',
    number: 8,
    title: 'KBM Dirosah',
    timeRange: '09.30 - 10.45 WIB',
    timeCategory: 'Pagi',
    desc: 'Kegiatan Belajar Mengajar kurikulum Dirosah Islamiyah: Aqidah, Fiqih Ibadah, Hadits, dan Sirah Nabawiyah.',
    tag: 'Dirosah Islamiyah',
  },
  {
    id: 'ph-9',
    number: 9,
    title: 'KBM Lughoh',
    timeRange: '10.45 - 12.00 WIB',
    timeCategory: 'Siang',
    desc: 'Pembelajaran Bahasa Arab komunikatif (Muhadatsah, Nahwu-Shorof) dan Bahasa Inggris aktif bertaraf global.',
    tag: 'Bilingual Language',
  },
  {
    id: 'ph-10',
    number: 10,
    title: 'Shalat Dzuhur',
    timeRange: '12.00 - 12.45 WIB',
    timeCategory: 'Siang',
    desc: 'Shalat Dzuhur berjamaah di musholla, dzikir sesudah shalat, dan kultum santri secara bergantian.',
    tag: 'Ibadah Wajib',
  },
  {
    id: 'ph-11',
    number: 11,
    title: 'KBM Information Technology',
    timeRange: '12.45 - 14.00 WIB',
    timeCategory: 'Siang',
    desc: 'Praktikum teknologi modern di Lab Programming: Logika Algoritma, Rekayasa Web, Database, dan perakitan IoT.',
    tag: 'Teknologi & IT',
  },
  {
    id: 'ph-12',
    number: 12,
    title: 'Makan Siang dan Tidur Siang',
    timeRange: '14.00 - 15.00 WIB',
    timeCategory: 'Siang',
    desc: 'Makan siang asrama bergizi lengkap dilanjutkan Qailulah (istirahat tidur siang sunnah) untuk memulihkan energi.',
    tag: 'Kemandirian & Istirahat',
  },
  {
    id: 'ph-13',
    number: 13,
    title: 'Shalat Ashar & Dzikir Petang',
    timeRange: '15.00 - 15.45 WIB',
    timeCategory: 'Sore',
    desc: 'Shalat Ashar berjamaah di musholla pesantren dilanjutkan pembacaan dzikir petang al-ma\'tsurat secara khidmat.',
    tag: 'Ibadah Wajib',
  },
  {
    id: 'ph-14',
    number: 14,
    title: 'Halaqoh Ashar',
    timeRange: '15.45 - 17.00 WIB',
    timeCategory: 'Sore',
    desc: 'Halaqah pengulangan hafalan sore (Muroja\'ah Kubro), persiapan mutqin untuk tasmi\' mingguan dan bulanan.',
    tag: 'Tahfidz Al-Qur\'an',
  },
  {
    id: 'ph-15',
    number: 15,
    title: 'Olahraga Sore',
    timeRange: '17.00 - 17.45 WIB',
    timeCategory: 'Sore',
    desc: 'Aktivitas olahraga bebas santri: futsal, badminton, tenis meja, dan rekreasi kebugaran di rooftop/lapangan.',
    tag: 'Kebugaran & Ekskul',
  },
  {
    id: 'ph-16',
    number: 16,
    title: 'Shalat Maghrib, Makan Malam, dan Shalat Isya',
    timeRange: '17.45 - 19.45 WIB',
    timeCategory: 'Malam',
    desc: 'Shalat Maghrib berjamaah, tilawah mandiri ba\'da Maghrib, makan malam asrama bersama, dan Shalat Isya berjamaah.',
    tag: 'Ibadah Wajib',
  },
  {
    id: 'ph-17',
    number: 17,
    title: 'Muhadhoroh',
    timeRange: '19.45 - 20.45 WIB',
    timeCategory: 'Malam',
    desc: 'Latihan public speaking dan khitobah 3 bahasa (Indonesia, Arab, Inggris) melatih mental kepemimpinan santri.',
    tag: 'Public Speaking',
  },
  {
    id: 'ph-18',
    number: 18,
    title: 'Muthola\'ah',
    timeRange: '20.45 - 21.30 WIB',
    timeCategory: 'Malam',
    desc: 'Belajar mandiri terbimbing, review materi pelajaran harian, persiapan halaqah tahfidz esok hari, lalu istirahat malam.',
    tag: 'Belajar Mandiri',
  },
]

// ── 2. Prestasi Santri PTDARRAHMAN ──────────────────────────────────────────
export const PRESTASI_SANTRI: PrestasiItem[] = [
  {
    id: 'pres-1',
    name: 'Alvito Syarman S',
    medal: 'Emas',
    competitionField: 'Tafsir Al-Qur\'an & Hadits',
    achievement: 'Meraih Medali Emas',
    eventTitle: 'Olimpiade & Kejuaraan Tafsir Al-Qur\'an & Hadits',
    desc: 'Membuktikan keunggulan santri PTDARRAHMAN dalam kedalaman pemahaman tafsir ayat suci Al-Qur\'an dan sanad hadits nabawi tingkat nasional.',
    badgeBg: 'bg-amber-100 border-amber-300',
    badgeText: 'text-amber-900',
    iconColor: 'text-amber-600',
  },
  {
    id: 'pres-2',
    name: 'Rasyid Anwar Arief',
    medal: 'Perak',
    competitionField: 'Teknik Informatika',
    achievement: 'Meraih Medali Perak',
    eventTitle: 'Kompetisi Sains & Rekayasa Teknik Informatika',
    desc: 'Prestasi gemilang dalam kejuaraan komputasi digital, algoritma pemrograman, dan problem solving perangkat lunak modern.',
    badgeBg: 'bg-slate-100 border-slate-300',
    badgeText: 'text-slate-800',
    iconColor: 'text-slate-600',
  },
  {
    id: 'pres-3',
    name: 'Hudzaifah Ali Miftah',
    medal: 'Perunggu',
    competitionField: 'Teknik Informatika',
    achievement: 'Meraih Medali Perunggu',
    eventTitle: 'Kompetisi Pemrograman & Teknologi Informasi',
    desc: 'Keahlian teruji dalam perancangan aplikasi komputasi, pengembangan logika digital, dan implementasi teknologi tepat guna.',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800',
    iconColor: 'text-amber-700',
  },
  {
    id: 'pres-4',
    name: 'Rahmatullah Yusuf I',
    medal: 'Perunggu',
    competitionField: 'Bahasa Inggris',
    achievement: 'Meraih Medali Perunggu',
    eventTitle: 'Kompetisi Bahasa Inggris (English Olympiad & Speech)',
    desc: 'Kemampuan public speaking, debat, dan kecakapan literasi Bahasa Inggris aktif santri berdaya saing global.',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
]

// ── 3. Ekskul & Outing Class ────────────────────────────────────────────────
export const EKSKUL_OUTING: EkskulItem[] = [
  {
    id: 'ekskul-1',
    name: 'Futsal',
    category: 'Olahraga',
    desc: 'Pengembangan ketangkasan fisik, kerja sama tim, dan sportivitas santri di lapangan futsal.',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'ekskul-2',
    name: 'Badminton',
    category: 'Olahraga',
    desc: 'Latihan bulu tangkis rutin untuk melatih refleks, kelincahan, dan stamina prima santri.',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'ekskul-3',
    name: 'Hadroh',
    category: 'Seni & Budaya',
    desc: 'Kesenian rebana dan seni shalawat islami menyemarakkan syiar kecintaan kepada Rasulullah SAW.',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'ekskul-4',
    name: 'Hiking',
    category: 'Outing Class & Religi',
    desc: 'Tadabbur alam mendaki bukit dan perbukitan hijau guna menumbuhkan ketahanan mental serta kekaguman ciptaan Allah.',
    badgeColor: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'ekskul-5',
    name: 'Renang',
    category: 'Olahraga',
    desc: 'Olahraga sunnah renang untuk membangun kekuatan jasmani, paru-paru sehat, dan ketahanan tubuh santri.',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'ekskul-6',
    name: 'Car Free Day',
    category: 'Outing Class & Religi',
    desc: 'Sosialisasi sehat di ruang publik perkotaan, jalan pagi santai, dan interaksi masyarakat yang beradab.',
    badgeColor: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'ekskul-7',
    name: 'Mosque Tour',
    category: 'Outing Class & Religi',
    desc: 'Kunjungan edukasi sejarah dan arsitektur masjid-masjid agung bersejarah di wilayah Jabodetabek.',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'ekskul-8',
    name: 'Rihlah',
    category: 'Outing Class & Religi',
    desc: 'Perjalanan edukatif tahunan santri bersama para asatidz untuk refreshing, bonding ukhuwah, dan wawasan baru.',
    badgeColor: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'ekskul-9',
    name: 'Dan Kegiatan Ekskul Lainnya',
    category: 'Lainnya' as any,
    desc: 'Klub robotika dasar, podcast dakwah studio, kaligrafi Islam, dan jurnalistik santri digital.',
    badgeColor: 'bg-slate-100 text-slate-800',
  },
]

// ── 4. Biaya Pendidikan Resmi (5 Komponen, Total Rp 25.000.000) ─────────────
export const BIAYA_PENDIDIKAN: BiayaPendidikanItem[] = [
  {
    no: 1,
    name: 'Uang Pangkal',
    nominal: 15000000,
    periodicity: 'Satu Kali di Awal',
    desc: 'Investasi sarana asrama modern, ranjang mukim santri, loker pribadi, fasilitas laboratorium programming & musholla.',
    regularDiscount: 1500000,
    earlyDiscount: 2500000,
  },
  {
    no: 2,
    name: 'Uang Kegiatan (per tahun)',
    nominal: 6000000,
    periodicity: 'Per Tahun',
    desc: 'Mencakup seluruh kegiatan rihlah tahunan, ujian tasmi terbuka bil ghoib, kompetisi IT & olahraga, wisuda tahfidz, serta peringatan hari besar Islam.',
    regularDiscount: 500000,
    earlyDiscount: 1000000,
  },
  {
    no: 3,
    name: 'Uang SPP',
    nominal: 2000000,
    periodicity: 'Per Bulan',
    desc: 'Pendidikan terpadu tahfidz dan IT, makan bergizi 3x sehari, laundry pakaian santri, asuhan muhaffidz mukim, serta praktikum komputer intensif.',
    regularDiscount: 0,
    earlyDiscount: 0,
  },
  {
    no: 4,
    name: 'Uang Buku',
    nominal: 1000000,
    periodicity: 'Satu Kali Awal Tahun',
    desc: 'Paket mushaf tahfidz rasm utsmani standar pojok, modul pemrograman IT & rekayasa web, buku ajar dirosah islamiyah, dan kitab tajwid bersanad.',
    regularDiscount: 0,
    earlyDiscount: 0,
  },
  {
    no: 5,
    name: 'Uang Seragam',
    nominal: 1000000,
    periodicity: 'Satu Kali Awal Masuk',
    desc: 'Paket seragam lengkap santri: Gamis putih shalat, seragam batik resmi PTDARRAHMAN, seragam pramuka, kaos olahraga, dan jas santri resmi.',
    regularDiscount: 0,
    earlyDiscount: 0,
  },
]

export const TOTAL_ESTIMASI_BIAYA = 25000000

// ── 5. Alur Pendaftaran (5 Tahap Utama Resmi) ────────────────────────────────
export const ALUR_PENDAFTARAN: AlurPendaftaranItem[] = [
  {
    step: 1,
    title: 'Pendaftaran',
    subtitle: 'Registrasi Akun & Pengisian Data Lengkap',
    desc: 'Calon santri / orang tua membuat akun PPDB, mengisi biodata 6 bagian (identitas santri, data wali, domisili, kuesioner kesehatan mandiri 10 soal), dan melunasi biaya formulir pendaftaran via QRIS resmi.',
    badge: 'Tahap 1 — Online',
    iconName: 'UserPlus',
  },
  {
    step: 2,
    title: 'Verifikasi Berkas',
    subtitle: 'Pemeriksaan Dokumen Persyaratan',
    desc: 'Mengunggah 6 berkas persyaratan resmi (NISN, Kartu Keluarga, Akta Kelahiran, Pas Foto, KTP Orang Tua/Wali, dan 4 Rapor Terakhir) untuk diverifikasi kelayakannya oleh panitia penerimaan.',
    badge: 'Tahap 2 — Verifikasi',
    iconName: 'FileCheck',
  },
  {
    step: 3,
    title: 'Seleksi Penerimaan Santri Baru',
    subtitle: 'Ujian CBT, Tahfidz & Wawancara Terpadu',
    desc: 'Peserta mengikuti rangkaian seleksi terpadu: Ujian CBT Akademik, CBT Psikologi, Uji Tahfidz Al-Qur\'an (Tahsin & kelancaran tajwid), serta Wawancara Terpadu calon santri dan orang tua/wali.',
    badge: 'Tahap 3 — Seleksi Terpadu',
    iconName: 'Laptop',
  },
  {
    step: 4,
    title: 'Pengumuman',
    subtitle: 'Rilis Hasil Kelulusan & LoA Digital',
    desc: 'Panitia merilis status hasil seleksi santri. Calon santri yang dinyatakan diterima berhak mengunduh Letter of Acceptance (LoA) resmi bertanda tangan digital dan kode QR verifikasi HMAC.',
    badge: 'Tahap 4 — Pengumuman',
    iconName: 'Award',
  },
  {
    step: 5,
    title: 'Daftar Ulang',
    subtitle: 'Tanda Tangan LoA & Penyetoran Biaya Pendidikan',
    desc: 'Orang tua dan calon santri menandatangani LoA digital (status terkunci is_locked = true), menyelesaikan administrasi daftar ulang santri baru, dan memperoleh Nomor Registrasi resmi PTDARRAHMAN.',
    badge: 'Tahap 5 — Tuntas & Resmi',
    iconName: 'CheckCircle2',
  },
]
