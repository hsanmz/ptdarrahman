import type { LeadershipBoard, LeadershipMember } from '@/app/lib/types'

/**
 * Struktur organisasi khusus halaman `/about` — menampilkan seluruh pengurus Yayasan
 * Generasi Cerdas Akhlak Mulia serta jajaran pimpinan & manajemen lembaga PTDARRAHMAN.
 */

export const BOARD_TITLES: Record<string, string> = {
  yayasan: 'Susunan Pengurus Yayasan Generasi Cerdas Akhlak Mulia',
  'islamic-center': 'Pimpinan & Manajemen Lembaga PTDARRAHMAN',
  manajemen: 'Pimpinan & Manajemen Lembaga PTDARRAHMAN',
}

/** Urutan grup pada halaman: Yayasan dulu, lalu Pimpinan & Manajemen Lembaga. */
const BOARD_ORDER = ['yayasan', 'islamic-center', 'manajemen']

export const fallbackLeadershipBoards: LeadershipBoard[] = [
  {
    board: 'yayasan',
    title: BOARD_TITLES.yayasan,
    members: [
      { name: 'Indra Setiawan', position: 'Pembina', image: '/images/pengurus/indra-setiawan.png' },
      { name: 'Tri Indra Basoeki', position: 'Pembina' },
      { name: 'Rini Widiastuti Rahayu', position: 'Pengawas', image: '/images/pengurus/rini-widiastuti.png' },
      { name: 'Eko Santoso', position: 'Ketua', image: '/images/pengurus/eko-santoso.png' },
      { name: 'Chandra Sari Nugraheni', position: 'Bendahara', image: '/images/pengurus/chandra-sari.png' },
      { name: 'Noor Kartika Muliawati', position: 'Sekretaris', image: '/images/pengurus/noor-kartika.png' },
      { name: 'Rachmania Kurniawati', position: 'Sekretaris', image: '/images/pengurus/rachmania-kurniawati.png' },
    ],
  },
  {
    board: 'islamic-center',
    title: BOARD_TITLES['islamic-center'],
    members: [
      { name: 'Chandra Sari Nugraheni', position: 'President Director', image: '/images/pengurus/chandra-sari.png' },
      { name: 'Fathya Irsalina M', position: 'AVP Performance Management', image: '/images/pengurus/fathya-irsalina.png' },
      { name: 'Mira Susanti', position: 'AVP Internal Auditor', image: '/images/pengurus/mira-susanti.png' },
      { name: 'Leo Latul Agusta', position: 'Director of Education Center', image: '/images/pengurus/leo-latul.png' },
      { name: 'Ahmad Mahfud', position: 'Director of Support & Development', image: '/images/pengurus/ahmad-mahfud.png' },
      { name: 'Dewi Nareswari', position: 'Vice President of Branding & Development', image: '/images/pengurus/dewi-nareswari.png' },
      { name: 'Dahniar', position: 'Vice President of Finance & Support', image: '/images/pengurus/dahniar.png' },
      { name: 'Ruswandri', position: 'Head of Lembaga Pengelolaan Ziswaf', image: '/images/pengurus/ruswandri.png' },
      { name: 'Silvi Laeli Kodaria', position: 'Head of Sekolah Alam Qurani Ar Rahman', image: '/images/pengurus/silvi-laeli.png' },
      {
        name: 'Ziyad Khairy',
        position: "Head of Pesantren Tahfidz Qur'an dan Digital Ar-Rahman",
        image: '/images/pengurus/ustd-ziyad.png',
      },
      { name: 'Ahmad Khaeruddin', position: 'Head of Lembaga Pendidikan Al Quran', image: '/images/pengurus/ustd-ahmad.png' },
      { name: 'Susilawati', position: 'Head of Lembaga Pembinaan Masyarakat', image: '/images/pengurus/susilawati.png' },
      { name: 'Ustadz Mahrozal Mizan', position: 'Administrator Pesantren' },
      { name: 'Ustadz Murtadho Tumari', position: 'Kepala Kepegawaian' },
      { name: 'Ustadz Ian', position: 'Guru IT & Pemrograman' },
      { name: 'Ustadz Nur Fatoni', position: 'Musrif & Pengajar Bahasa Arab' },
    ],
  },
]

function humanizeBoard(board: string): string {
  return board
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Mengubah baris CMS (`leadership_members`) menjadi kelompok siap render.
 * Urutan anggota mengikuti `order_index` ASC; tanpa kolom itu urutan baris
 * CMS dipertahankan apa adanya.
 */
export function groupLeadership(items: LeadershipMember[]): LeadershipBoard[] {
  const buckets = new Map<
    string,
    { title: string; members: Array<{ name: string; position: string; image?: string; order: number }> }
  >()
  items.forEach((item) => {
    const content = item.content ?? {}
    const name = String(content.name ?? '').trim()
    if (!name) return
    const key = (item.board || '').trim() || 'lainnya'
    const bucket = buckets.get(key) ?? {
      title: BOARD_TITLES[key] ?? (key === 'lainnya' ? 'Pengurus Lainnya' : humanizeBoard(key)),
      members: [],
    }
    bucket.members.push({
      name,
      position: String(content.position ?? '').trim(),
      image: typeof content.image === 'string' ? content.image : undefined,
      order: typeof item.order === 'number' ? item.order : bucket.members.length,
    })
    buckets.set(key, bucket)
  })

  const knownFirst = BOARD_ORDER.filter((k) => buckets.has(k))
  const rest = [...buckets.keys()].filter((k) => !BOARD_ORDER.includes(k))
  return [...knownFirst, ...rest].map((board) => {
    const bucket = buckets.get(board)!
    const members = bucket.members
      .map((m, i) => ({ m, i }))
      .sort((a, b) => a.m.order - b.m.order || a.i - b.i)
      .map(({ m }) => ({ name: m.name, position: m.position, image: m.image }))
    return { board, title: bucket.title, members }
  })
}
