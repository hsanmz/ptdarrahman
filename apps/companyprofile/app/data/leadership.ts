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
      { name: 'Indra Setiawan', position: 'Pembina', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763717/ptdarrahman/pengurus_indra-setiawan.webp' },
      { name: 'Tri Indra Basoeki', position: 'Pembina' },
      { name: 'Rini Widiastuti Rahayu', position: 'Pengawas', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763722/ptdarrahman/pengurus_rini-widiastuti.webp' },
      { name: 'Eko Santoso', position: 'Ketua', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763715/ptdarrahman/pengurus_eko-santoso.webp' },
      { name: 'Chandra Sari Nugraheni', position: 'Bendahara', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763711/ptdarrahman/pengurus_chandra-sari.webp' },
      { name: 'Noor Kartika Muliawati', position: 'Sekretaris', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763720/ptdarrahman/pengurus_noor-kartika.webp' },
      { name: 'Rachmania Kurniawati', position: 'Sekretaris', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763721/ptdarrahman/pengurus_rachmania-kurniawati.webp' },
    ],
  },
  {
    board: 'islamic-center',
    title: BOARD_TITLES['islamic-center'],
    members: [
      { name: 'Chandra Sari Nugraheni', position: 'President Director', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763711/ptdarrahman/pengurus_chandra-sari.webp' },
      { name: 'Fathya Irsalina M', position: 'AVP Performance Management', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763716/ptdarrahman/pengurus_fathya-irsalina.webp' },
      { name: 'Mira Susanti', position: 'AVP Internal Auditor', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763718/ptdarrahman/pengurus_mira-susanti.webp' },
      { name: 'Leo Latul Agusta', position: 'Director of Education Center', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763717/ptdarrahman/pengurus_leo-latul.webp' },
      { name: 'Ahmad Mahfud', position: 'Director of Support & Development', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763710/ptdarrahman/pengurus_ahmad-mahfud.webp' },
      { name: 'Dewi Nareswari', position: 'Vice President of Branding & Development', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763713/ptdarrahman/pengurus_dewi-nareswari.webp' },
      { name: 'Dahniar', position: 'Vice President of Finance & Support', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763712/ptdarrahman/pengurus_dahniar.webp' },
      { name: 'Ruswandri', position: 'Head of Lembaga Pengelolaan Ziswaf', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763723/ptdarrahman/pengurus_ruswandri.webp' },
      { name: 'Silvi Laeli Kodaria', position: 'Head of Sekolah Alam Qurani Ar Rahman', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763724/ptdarrahman/pengurus_silvi-laeli.webp' },
      {
        name: 'Ziyad Khairy',
        position: "Head of Pesantren Tahfidz Qur'an dan Digital Ar-Rahman",
        image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763727/ptdarrahman/pengurus_ustd-ziyad.webp',
      },
      { name: 'Ahmad Khaeruddin', position: 'Head of Lembaga Pendidikan Al Quran', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763726/ptdarrahman/pengurus_ustd-ahmad.webp' },
      { name: 'Susilawati', position: 'Head of Lembaga Pembinaan Masyarakat', image: 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763725/ptdarrahman/pengurus_susilawati.webp' },
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
