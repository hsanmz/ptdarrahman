import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  readPpdbForm,
  validatePpdbForm,
  buildPpdbPayload,
} from '../admin/dashboard/ppdb/ppdb-form'
import { PpdbContentBoard } from '../admin/dashboard/ppdb/PpdbContentBoard'
import type { RowRecord } from '../admin/dashboard/_types'

describe('PPDB Admin CRUD — Form Logic & Schemas', () => {
  it('membaca nilai form kosong dengan default yang aman', () => {
    const values = readPpdbForm({})
    expect(values.section).toBe('jalur')
    expect(values.order).toBe(0)
    expect(values.accent).toBe('emerald')
    expect(values.icon).toBe('GraduationCap')
    expect(values.items).toEqual([])
  })

  it('memvalidasi field wajib per bagian konten', () => {
    // Jalur tanpa judul & deskripsi
    const errJalur = validatePpdbForm({ section: 'jalur', order: 1 })
    expect(errJalur._c_title).toBeDefined()
    expect(errJalur._c_desc).toBeDefined()

    // Hero tanpa hero_title
    const errHero = validatePpdbForm({ section: 'hero', order: 1 })
    expect(errHero._c_hero_title).toBeDefined()
    expect(errHero._c_hero_desc).toBeDefined()

    // FAQ tanpa question & answer
    const errFaq = validatePpdbForm({ section: 'faq', order: 1 })
    expect(errFaq._c_question).toBeDefined()
    expect(errFaq._c_answer).toBeDefined()
  })

  it('membangun payload JSON yang sesuai untuk section jalur', () => {
    const payload = buildPpdbPayload({
      formData: {
        section: 'jalur',
        order: '2',
        _c_title: 'Program Tahfidz Intensif',
        _c_kicker: 'Uji Unggulan',
        _c_desc: 'Deskripsi program',
        _c_items: 'Item 1\nItem 2',
        _c_accent: 'amber',
        _c_icon: 'Award',
      },
    })

    expect(payload.section).toBe('jalur')
    expect(payload.order).toBe(2)
    const content = JSON.parse(payload.content)
    expect(content.title).toBe('Program Tahfidz Intensif')
    expect(content.accent).toBe('amber')
    expect(content.icon).toBe('Award')
    expect(content.items).toEqual(['Item 1', 'Item 2'])
  })

  it('membangun payload JSON untuk hero 3D copy', () => {
    const payload = buildPpdbPayload({
      formData: {
        section: 'hero',
        order: '1',
        _c_hero_title: 'Hafidz 30 Juz\nAhli Teknologi',
        _c_hero_desc: 'Pendidikan terpadu',
        _c_hero_proof: '30 Juz | Web | Asrama',
        _c_hero_cta_label: 'Pelajari',
        _c_hero_cta_href: '#info',
        _c_hero_register_label: 'Daftar',
        _c_hero_register_href: '/register',
      },
    })

    expect(payload.section).toBe('hero')
    const content = JSON.parse(payload.content)
    expect(content.hero_title).toBe('Hafidz 30 Juz\nAhli Teknologi')
    expect(content.hero_proof).toBe('30 Juz | Web | Asrama')
  })
})

describe('PPDB Admin CRUD — PpdbContentBoard Component', () => {
  const sampleItems: RowRecord[] = [
    {
      id: 'ppdb-1',
      section: 'jalur',
      order: 1,
      content: {
        title: 'Program Reguler Terpadu',
        desc: 'Pembinaan santri tahfidz dan teknologi',
        accent: 'emerald',
        icon: 'GraduationCap',
        items: ['Poin A', 'Poin B'],
      },
    },
    {
      id: 'ppdb-2',
      section: 'step',
      order: 1,
      content: {
        title: 'Pendaftaran Akun & Data Lengkap',
        desc: 'Pengisian 6 bagian pendaftaran dan kuesioner',
      },
    },
  ]

  it('merender seksi-seksi PPDB utama pada board', () => {
    const onCreate = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <PpdbContentBoard
        items={sampleItems}
        canCrud={true}
        detailLoading={null}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    // Heading seksi
    expect(screen.getByText('Program Pembinaan Santri Baru')).toBeInTheDocument()
    expect(screen.getByText('Alur Pendaftaran PPDB')).toBeInTheDocument()
    expect(screen.getByText('Hero 3D Copy & Aksi')).toBeInTheDocument()
    expect(screen.getByText('Kurikulum Holistik Masa Depan')).toBeInTheDocument()
    expect(screen.getByText('FAQ Calon Santri & Wali')).toBeInTheDocument()
    expect(screen.getByText('CTA Konsultasi Pendaftaran')).toBeInTheDocument()

    // Item row
    expect(screen.getByText('Program Reguler Terpadu')).toBeInTheDocument()
    expect(screen.getByText('Pendaftaran Akun & Data Lengkap')).toBeInTheDocument()
  })

  it('memanggil onEdit saat tombol pensil diklik', () => {
    const onCreate = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <PpdbContentBoard
        items={sampleItems}
        canCrud={true}
        detailLoading={null}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    const editBtns = screen.getAllByTitle('Edit item')
    expect(editBtns.length).toBeGreaterThan(0)
    fireEvent.click(editBtns[0])

    expect(onEdit).toHaveBeenCalledWith(sampleItems[0])
  })
})
