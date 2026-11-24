/**
 * Konten statis landing PPDB halaman `/ppdb` (copy hero 3D + seksi di bawah hero).
 *
 * Kartu Program Pembinaan, Pilar Kurikulum, langkah Alur Pendaftaran, dan
 * teks seksi/CTA ditulis langsung di sini (mengikuti kit copywriting PTDARRAHMAN).
 * Data dinamis gelombang aktif PPDB diambil dari backend PPDB (`fetchActivePpdbWave`).
 */

import type {
  PpdbCopyContent,
  PpdbJalurCard,
  PpdbPillar,
  PpdbStep,
  PpdbFaqItem,
} from './types'

export interface PpdbContent {
  jalur: PpdbJalurCard[]
  pillars: PpdbPillar[]
  steps: PpdbStep[]
  copy: PpdbCopyContent
  faqs: PpdbFaqItem[]
}

/**
 * Mengambil URL absolut portal PPDB (Vite app), mis. 'http://localhost:5174/register'.
 * Mencegah broken link 404 jika tombol pendaftaran diarahkan ke route internal Next.js.
 */
export function getPortalUrl(path = ''): string {
  const base = (
    process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:5174'
  ).replace(/\/+$/, '')
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  return `${base}${cleanPath}`
}

// ── Ikon & warna aksen ───────────────────────────────────────────────────

/** Nama ikon lucide yang dipetakan halaman publik. Di luar daftar ini → Sparkles. */
export const PPDB_ICON_NAMES = [
  'Award',
  'GraduationCap',
  'BookOpen',
  'Laptop',
  'Users',
  'ShieldCheck',
  'Sparkles',
  'Target',
  'Rocket',
  'Globe',
] as const

export type PpdbIconName = (typeof PPDB_ICON_NAMES)[number]

/** Cocokkan nama ikon tanpa peduli huruf besar/kecil. */
export function resolveIconName(value: unknown): PpdbIconName {
  if (typeof value === 'string') {
    const wanted = value.trim().toLowerCase()
    const found = PPDB_ICON_NAMES.find((name) => name.toLowerCase() === wanted)
    if (found) return found
  }
  return 'Sparkles'
}

export const ACCENT_KEYS = ['emerald', 'amber', 'sky', 'violet', 'rose', 'teal'] as const

export type AccentKey = (typeof ACCENT_KEYS)[number]

export function pickAccent(value: unknown): AccentKey {
  if (typeof value === 'string') {
    const wanted = value.trim().toLowerCase()
    const found = ACCENT_KEYS.find((key) => key === wanted)
    if (found) return found
  }
  return 'emerald'
}

// ── Konten statis ────────────────────────────────────────────────────────

export const STATIC_PPDB_COPY: PpdbCopyContent = {
  hero_title: `Hafidz 30 Juz\nAhli Teknologi`,
  hero_desc:
    "Pendidikan pesantren jenjang SMK khusus lulusan SMP / MTs sederajat: memadukan hafalan Al-Qur'an mutqin 30 juz bersanad dengan kejuruan rekayasa perangkat lunak dan teknologi digital modern.",
  hero_proof: 'Jenjang SMK | Lulusan SMP/MTs | 30 Juz Bersanad | IT & Coding',
  hero_cta_label: 'Daftar Online Sekarang',
  hero_cta_href: '/register',
  hero_register_label: 'Daftar PPDB',
  hero_register_href: '/register',
  jalur_title: 'Program Pembinaan Santri Baru',
  jalur_desc:
    "Pesantren Tahfidz Qur'an dan Digital Ar-Rahman membina santri melalui program terpadu tahfidz, sains teknologi terapan, dan karakter islami yang kokoh.",
  kurikulum_title: 'Kurikulum Holistik Masa Depan',
  kurikulum_desc:
    'Keseimbangan paripurna antara penguasaan ilmu ukhrawi dan kecakapan teknologi kontemporer',
  alur_kicker: 'Langkah Terpadu',
  alur_title: 'Alur Pendaftaran PPDB Resmi',
  cta_title: 'Konsultasi Pendaftaran Santri Baru?',
  cta_desc:
    'Tim panitia PPDB siap melayani pertanyaan mengenai kurikulum, program beasiswa, dan kunjungan kampus pesantren.',
  cta_primary_label: 'Hubungi Panitia (WhatsApp)',
  cta_primary_href: '/contact',
  cta_secondary_label: 'Masuk Portal Peserta',
  cta_secondary_href: '/login',
}

const STATIC_JALUR: PpdbJalurCard[] = [
  {
    id: 'static-jalur-1',
    icon: 'GraduationCap',
    content: {
      order: 1,
      accent: 'emerald',
      kicker: 'Pembinaan Karakter & Sains',
      title: 'Program Reguler Terpadu',
      desc: 'Bagi calon santri putra yang siap mengikuti pembinaan terpadu tahfidz 30 juz dan teknologi informasi dari tingkat dasar hingga mahir.',
      items: [
        "Halaqah Tahfidz harian target mutqin",
        "Dasar pemrograman & logika komputasi",
        "Pembiasaan adab & kemandirian asrama",
      ],
      cta_label: 'Daftar Sekarang',
      cta_href: '/register',
    },
  },
  {
    id: 'static-jalur-2',
    icon: 'Award',
    content: {
      order: 2,
      accent: 'amber',
      kicker: 'Uji Tahfidz Unggulan',
      title: 'Program Tahfidz Intensif',
      desc: "Bagi calon santri putra yang telah memiliki bekal hafalan Al-Qur'an dan siap mengikuti percepatan tasmi' bersama asatidz penguji.",
      items: [
        "Bimbingan khusus tahsin & tajwid bersanad",
        "Target tasmi' 10 & 30 juz bil ghoib",
        "Integrasi literasi digital islami",
      ],
      cta_label: 'Daftar Sekarang',
      cta_href: '/register',
    },
  },
  {
    id: 'static-jalur-3',
    icon: 'Laptop',
    content: {
      order: 3,
      accent: 'sky',
      kicker: 'Eksplorasi Teknologi Terapan',
      title: 'Program Sains & Digital',
      desc: 'Bagi calon santri putra yang memiliki minat kuat di bidang pemrograman web, perakitan Internet of Things (IoT), dan kecerdasan buatan.',
      items: [
        "Praktik langsung di Lab Programming",
        "Pengembangan web modern & database",
        "Proyek riset IoT & dakwah digital",
      ],
      cta_label: 'Daftar Sekarang',
      cta_href: '/register',
    },
  },
  {
    id: 'static-jalur-4',
    icon: 'Users',
    content: {
      order: 4,
      accent: 'violet',
      kicker: 'Dukungan Orang Tua Asuh',
      title: 'Program Beasiswa / Yatim Dhuafa',
      desc: "Dukungan pendidikan bagi calon santri putra yatim atau dhuafa berprestasi yang memiliki tekad kuat menghafal Al-Qur'an 30 juz di PTDARRAHMAN.",
      items: [
        "Bantuan biaya pendidikan terarah",
        "Pembinaan intensif tahfidz & teknologi",
        "Monitoring prestasi berkala",
      ],
      cta_label: 'Daftar Sekarang',
      cta_href: '/register',
    },
  },
]

const STATIC_PILLARS: PpdbPillar[] = [
  {
    id: 'static-pillar-1',
    icon: 'BookOpen',
    content: {
      order: 1,
      title: "Tahfidz Al-Qur'an Bersanad",
      desc: "Pembinaan tahsin, ziyadah, dan muraja'ah harian hingga ujian terbuka Tasmi' 10 Juz & 30 Juz Bil Ghoib serta kajian Tafsir Al-Qur'an.",
    },
  },
  {
    id: 'static-pillar-2',
    icon: 'Laptop',
    content: {
      order: 2,
      title: 'Teknologi Digital & Coding',
      desc: 'Praktik langsung di Ruang Programming mencakup pengembangan web modern (Next.js), basis data, dan perakitan Internet of Things (IoT).',
    },
  },
  {
    id: 'static-pillar-3',
    icon: 'Users',
    content: {
      order: 3,
      title: 'Bilingual (Arab & Inggris)',
      desc: 'Pembiasaan komunikasi aktif dwibahasa dan pelatihan pidato (khitobah) Bahasa Arab serta Inggris untuk kompetisi maupun literasi global.',
    },
  },
  {
    id: 'static-pillar-4',
    icon: 'ShieldCheck',
    content: {
      order: 4,
      title: 'Kepemimpinan & Karakter',
      desc: 'Pembentukan adab santri, kemandirian asrama melalui Gerakan Lingkungan Indah (GLI), olahraga sunnah, dan dakwah di Ruang Podcast.',
    },
  },
]

const STATIC_STEPS: PpdbStep[] = [
  {
    id: 'static-step-1',
    content: {
      order: 1,
      title: 'Pendaftaran',
      desc: 'Pengisian biodata santri & data orang tua/wali lengkap, 10 kuesioner kesehatan mandiri, dan pembayaran biaya formulir via QRIS resmi.',
    },
  },
  {
    id: 'static-step-2',
    content: {
      order: 2,
      title: 'Verifikasi Berkas',
      desc: 'Pemeriksaan 6 berkas persyaratan wajib (NISN, KK, Akta Kelahiran, Pas Foto, KTP Wali, dan 4 rapor semester terakhir) oleh panitia.',
    },
  },
  {
    id: 'static-step-3',
    content: {
      order: 3,
      title: 'Seleksi Penerimaan Santri Baru',
      desc: 'Pelaksanaan ujian seleksi terpadu CBT (Akademik & Psikologi), tes hafalan Al-Qur’an (Tahfidz & Tahsin), dan wawancara santri & wali.',
    },
  },
  {
    id: 'static-step-4',
    content: {
      order: 4,
      title: 'Pengumuman',
      desc: 'Penerbitan hasil kelulusan resmi, pengunduhan Letter of Acceptance (LoA) digital resmi ber-QR verifikasi HMAC.',
    },
  },
  {
    id: 'static-step-5',
    content: {
      order: 5,
      title: 'Daftar Ulang',
      desc: 'Penandatanganan digital LoA resmi bersama orang tua/wali, penyetoran biaya pendidikan masuk resmi, dan terbit Nomor Registrasi santri baru.',
    },
  },
]

export const STATIC_PPDB_FAQS: PpdbFaqItem[] = [
  {
    id: 'faq-1',
    question: 'Apa saja materi ujian seleksi masuk santri baru?',
    answer:
      'Seleksi terpadu terdiri dari 3 tahapan utama: (1) CBT Akademik (Penalaran Matematika & Literasi), (2) CBT Psikologi (Karakter & Potensi Belajar), serta (3) Uji Tahfidz Al-Qur’an (Tahsin, kelancaran tajwid, dan daya tangkap hafalan baru).',
    category: 'Seleksi',
  },
  {
    id: 'faq-2',
    question: 'Apakah santri diperbolehkan membawa gadget / smartphone pribadi?',
    answer:
      'Santri tidak diperkenankan membawa smartphone pribadi demi menjaga kekhusyukan ibadah, hafalan Al-Qur’an, dan interaksi sosial asrama. Seluruh pembelajaran teknologi, coding, dan riset digital difasilitasi penuh di Ruang Programming Lab dengan pengawasan asatidz.',
    category: 'Kehidupan Santri',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana jika calon santri belum memiliki banyak hafalan Al-Qur’an?',
    answer:
      'Santri dengan hafalan awal sedikit tetap dapat mendaftar. Penilaian utama tahap tahfidz adalah kelancaran membaca Al-Qur’an sesuai kaidah tajwid (tahsin) serta tekad belajar. Terdapat program matrikulasi dan bimbingan halaqah intensif untuk mengejar target hafalan.',
    category: 'Tahfidz',
  },
  {
    id: 'faq-4',
    question: 'Bagaimana mekanisme ujian seleksi (Online atau Offline)?',
    answer:
      'Pesantren menyediakan opsi ujian CBT & wawancara secara daring (Zoom) untuk calon santri luar daerah/pulau, serta luring langsung di Lab CBT Pesantren Tahfidz Qur’an dan Digital Ar-Rahman.',
    category: 'Seleksi',
  },
  {
    id: 'faq-5',
    question: 'Kapan batas penutupan pendaftaran tiap batch ujian seleksi?',
    answer:
      'Jadwal seleksi dibagi per batch/kloter. Batas akhir pendaftaran kloter (cutoff) ditutup otomatis oleh sistem 24 jam (H-1) sebelum pelaksanaan ujian kloter tersebut dimulai, disertai automated reminder WhatsApp.',
    category: 'Pendaftaran',
  },
  {
    id: 'faq-6',
    question: 'Bagaimana ketentuan pembayaran biaya pendidikan?',
    answer:
      'Di dalam portal PPDB, pendaftar hanya menyelesaikan biaya formulir pendaftaran via QRIS. Biaya pendidikan resmi (uang pangkal, SPP, dll.) disetorkan di luar sistem via transfer ke rekening resmi PTDARRAHMAN setelah calon santri dinyatakan lulus dan menandatangani LoA.',
    category: 'Biaya',
  },
]

export const STATIC_PPDB_CONTENT: PpdbContent = {
  jalur: STATIC_JALUR,
  pillars: STATIC_PILLARS,
  steps: STATIC_STEPS,
  copy: STATIC_PPDB_COPY,
  faqs: STATIC_PPDB_FAQS,
}
