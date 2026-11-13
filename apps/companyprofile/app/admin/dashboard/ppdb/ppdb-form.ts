/**
 * Logika murni form PPDB Landing (tanpa React) supaya mudah diuji.
 *
 * Kontrak backend yang dijaga:
 * - `POST/PUT /companyprofile/ppdb` menerima `section`, `order`, dan `content` (JSON string).
 * - `section` WAJIB saat create ('hero' | 'jalur' | 'pillar' | 'step' | 'faq' | 'cta').
 * - `order` integer non-negatif.
 */

import type { FormState } from '../_types'

export interface PpdbSectionMeta {
  key: string
  label: string
  description: string
  single?: boolean // Hanya butuh 1 item (hero, cta)
}

export const PPDB_SECTIONS: Record<string, PpdbSectionMeta> = {
  hero: {
    key: 'hero',
    label: 'Hero 3D Copy & Aksi',
    description: 'Judul besar, pembuka 3D, badge pembuktian, dan tombol pendaftaran.',
    single: true,
  },
  jalur: {
    key: 'jalur',
    label: 'Program Pembinaan Santri Baru',
    description: 'Kartu program santri (Reguler, Tahfidz, Sains & Digital, Beasiswa) dengan poin keunggulan.',
  },
  pillar: {
    key: 'pillar',
    label: 'Kurikulum Holistik Masa Depan',
    description: 'Pilar pendidikan utama pesantren (Tahfidz Bersanad, Coding, Karakter Qur\'ani, Sains).',
  },
  step: {
    key: 'step',
    label: 'Alur Pendaftaran PPDB',
    description: 'Tahapan pendaftaran resmi calon santri baru (1–6 langkah terpadu).',
  },
  faq: {
    key: 'faq',
    label: 'FAQ Calon Santri & Wali',
    description: 'Pertanyaan dan jawaban resmi seputar seleksi, beasiswa, asrama, dan biaya.',
  },
  cta: {
    key: 'cta',
    label: 'CTA Konsultasi Pendaftaran',
    description: 'Ajakan konsultasi WhatsApp panitia di bagian akhir halaman.',
    single: true,
  },
}

export const PPDB_SECTION_ORDER = ['hero', 'jalur', 'pillar', 'step', 'faq', 'cta']

export const PPDB_ACCENTS = [
  { value: 'emerald', label: 'Emerald (Hijau Pesantren)' },
  { value: 'amber', label: 'Gold / Amber (Keemasan)' },
  { value: 'sky', label: 'Sky Blue (Teknologi)' },
  { value: 'violet', label: 'Violet (Beasiswa)' },
  { value: 'rose', label: 'Rose (Karakter)' },
  { value: 'teal', label: 'Teal (Adab)' },
]

export const PPDB_ICONS = [
  'GraduationCap',
  'Award',
  'BookOpen',
  'Laptop',
  'Users',
  'ShieldCheck',
  'Sparkles',
  'Target',
  'Rocket',
  'Globe',
]

export interface PpdbFormValues {
  section: string
  order: number
  // Hero fields
  hero_title?: string
  hero_desc?: string
  hero_proof?: string
  hero_cta_label?: string
  hero_cta_href?: string
  hero_register_label?: string
  hero_register_href?: string
  jalur_title?: string
  jalur_desc?: string
  // Jalur & Pillar fields
  title?: string
  kicker?: string
  desc?: string
  items?: string[]
  accent?: string
  icon?: string
  cta_label?: string
  cta_href?: string
  // FAQ fields
  question?: string
  answer?: string
  category?: string
  // CTA fields
  cta_title?: string
  cta_desc?: string
  cta_primary_label?: string
  cta_primary_href?: string
}

export function readPpdbForm(
  formData: FormState,
  fallbackContent?: Record<string, unknown> | null,
): PpdbFormValues {
  const getStr = (key: string, fbKey?: string): string => {
    const val = formData[`_c_${key}`] ?? formData[key] ?? fallbackContent?.[fbKey || key]
    return typeof val === 'string' ? val : typeof val === 'number' ? String(val) : ''
  }

  const rawItems = formData._c_items ?? formData.items ?? fallbackContent?.items
  const items = Array.isArray(rawItems)
    ? rawItems.map(String).filter((s) => s.trim().length > 0)
    : typeof rawItems === 'string'
      ? rawItems.split('\n').map((s) => s.trim()).filter((s) => s.length > 0)
      : []

  const orderNum = Number(formData.order ?? fallbackContent?.order ?? 0)

  return {
    section: String(formData.section ?? fallbackContent?.section ?? 'jalur'),
    order: Number.isFinite(orderNum) ? orderNum : 0,
    // Hero
    hero_title: getStr('hero_title'),
    hero_desc: getStr('hero_desc'),
    hero_proof: getStr('hero_proof'),
    hero_cta_label: getStr('hero_cta_label'),
    hero_cta_href: getStr('hero_cta_href'),
    hero_register_label: getStr('hero_register_label'),
    hero_register_href: getStr('hero_register_href'),
    jalur_title: getStr('jalur_title'),
    jalur_desc: getStr('jalur_desc'),
    // Jalur / Pillar / Step
    title: getStr('title'),
    kicker: getStr('kicker'),
    desc: getStr('desc'),
    items,
    accent: getStr('accent') || 'emerald',
    icon: getStr('icon') || 'GraduationCap',
    cta_label: getStr('cta_label'),
    cta_href: getStr('cta_href'),
    // FAQ
    question: getStr('question'),
    answer: getStr('answer'),
    category: getStr('category'),
    // CTA
    cta_title: getStr('cta_title'),
    cta_desc: getStr('cta_desc'),
    cta_primary_label: getStr('cta_primary_label'),
    cta_primary_href: getStr('cta_primary_href'),
  }
}

export function validatePpdbForm(values: PpdbFormValues): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.section) {
    errors.section = 'Bagian konten wajib ditentukan'
  }

  if (values.section === 'hero') {
    if (!values.hero_title?.trim()) errors._c_hero_title = 'Judul Hero 3D wajib diisi'
    if (!values.hero_desc?.trim()) errors._c_hero_desc = 'Deskripsi Hero 3D wajib diisi'
  } else if (values.section === 'faq') {
    if (!values.question?.trim()) errors._c_question = 'Pertanyaan FAQ wajib diisi'
    if (!values.answer?.trim()) errors._c_answer = 'Jawaban FAQ wajib diisi'
  } else if (values.section === 'cta') {
    if (!values.cta_title?.trim()) errors._c_cta_title = 'Judul CTA wajib diisi'
  } else {
    // jalur, pillar, step
    if (!values.title?.trim()) errors._c_title = 'Judul kartu / langkah wajib diisi'
    if (!values.desc?.trim()) errors._c_desc = 'Deskripsi wajib diisi'
  }

  return errors
}

export function buildPpdbPayload({
  formData,
  existingContent,
}: {
  formData: FormState
  existingContent?: Record<string, unknown> | null
}): {
  section: string
  order: number
  content: string
} {
  const values = readPpdbForm(formData, existingContent)
  const content: Record<string, unknown> = {
    ...(existingContent ?? {}),
  }

  if (values.section === 'hero') {
    content.hero_title = values.hero_title
    content.hero_desc = values.hero_desc
    content.hero_proof = values.hero_proof
    content.hero_cta_label = values.hero_cta_label
    content.hero_cta_href = values.hero_cta_href
    content.hero_register_label = values.hero_register_label
    content.hero_register_href = values.hero_register_href
    content.jalur_title = values.jalur_title
    content.jalur_desc = values.jalur_desc
  } else if (values.section === 'faq') {
    content.question = values.question
    content.answer = values.answer
    content.category = values.category
  } else if (values.section === 'cta') {
    content.cta_title = values.cta_title
    content.cta_desc = values.cta_desc
    content.cta_primary_label = values.cta_primary_label
    content.cta_primary_href = values.cta_primary_href
  } else if (values.section === 'jalur') {
    content.title = values.title
    content.kicker = values.kicker
    content.desc = values.desc
    content.items = values.items
    content.accent = values.accent
    content.icon = values.icon
    content.cta_label = values.cta_label
    content.cta_href = values.cta_href
  } else if (values.section === 'pillar') {
    content.title = values.title
    content.desc = values.desc
    content.icon = values.icon
  } else if (values.section === 'step') {
    content.title = values.title
    content.desc = values.desc
  }

  return {
    section: values.section,
    order: values.order,
    content: JSON.stringify(content),
  }
}
