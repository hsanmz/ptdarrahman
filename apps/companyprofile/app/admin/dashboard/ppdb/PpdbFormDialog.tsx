'use client'

import React, { useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Save,
  ShieldCheck,
  Eye,
  Award,
  Laptop,
  Users,
  Sparkles,
  Target,
  Rocket,
  Globe,
  ListOrdered,
  HelpCircle,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'
import * as api from '@/app/lib/api'
import { cn } from '@/app/lib/utils'
import { isFormDirty, UNSAVED_CHANGES_CONFIRM } from '@/app/lib/form-dirty'
import { toast } from '@/app/components/ui/AdminToast'
import { confirm } from '@/app/components/ui/AdminConfirm'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Textarea } from '@/app/components/ui/Textarea'
import { Label } from '@/app/components/ui/Label'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/Dialog'
import { errorMessage } from '../_types'
import type { FormState, RowRecord } from '../_types'
import {
  PPDB_SECTIONS,
  PPDB_ACCENTS,
  PPDB_ICONS,
  readPpdbForm,
  validatePpdbForm,
  buildPpdbPayload,
} from './ppdb-form'

function PpdbField({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-[var(--text)]">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  )
}

interface Props {
  mode: 'create' | 'edit'
  editingItem: RowRecord | null
  formData: FormState
  setFormData: (fd: FormState) => void
  onClose: () => void
  onSaved: () => void
}

const FIELD_CLASS =
  'h-11 rounded-xl border-[var(--border)] bg-white/95 text-sm focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:ring-offset-0'
const TEXTAREA_CLASS =
  'min-h-[6.5rem] resize-y rounded-xl border-[var(--border)] bg-white/95 leading-relaxed focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:ring-offset-0'

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  Award,
  BookOpen,
  Laptop,
  Users,
  ShieldCheck,
  Sparkles,
  Target,
  Rocket,
  Globe,
}

const SECTION_HEADER_ICONS: Record<string, LucideIcon> = {
  hero: Sparkles,
  jalur: GraduationCap,
  pillar: BookOpen,
  step: ListOrdered,
  faq: HelpCircle,
  cta: Megaphone,
}

export function PpdbFormDialog({
  mode,
  editingItem,
  formData,
  setFormData,
  onClose,
  onSaved,
}: Props) {
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [initialFormData] = useState<FormState>(formData)
  const isDirty = isFormDirty(formData, initialFormData)

  const existingContent =
    editingItem && typeof editingItem.content === 'object' && editingItem.content !== null
      ? (editingItem.content as Record<string, unknown>)
      : null

  const values = readPpdbForm(formData, existingContent)
  const section = values.section || 'jalur'
  const sectionMeta = PPDB_SECTIONS[section] ?? {
    key: section,
    label: section,
    description: 'Bagian PPDB',
  }
  const HeaderIcon = SECTION_HEADER_ICONS[section] ?? GraduationCap

  function update(patch: Partial<FormState>) {
    setFormData({ ...formData, ...patch })
    if (serverError) setServerError('')
  }

  function clearFieldError(name: string) {
    setFieldErrors((prev) => {
      if (!(name in prev)) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  function setField(name: string, val: string | string[]) {
    update({ [`_c_${name}`]: val })
    clearFieldError(`_c_${name}`)
  }

  async function requestClose() {
    if (saving) return
    if (!isDirty) {
      onClose()
      return
    }
    if (await confirm(UNSAVED_CHANGES_CONFIRM)) onClose()
  }

  async function handleSave() {
    if (saving) return

    const errors = validatePpdbForm(values)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast('error', 'Periksa kolom yang ditandai merah.')
      return
    }

    setSaving(true)
    try {
      const payload = buildPpdbPayload({ formData, existingContent })
      if (mode === 'edit' && editingItem?.id) {
        await api.updateItem(`/ppdb/${editingItem.id}`, payload)
      } else {
        await api.createItem('/ppdb', payload)
      }
      onClose()
      onSaved()
      toast(
        'success',
        mode === 'create'
          ? `Konten ${sectionMeta.label} berhasil ditambahkan`
          : `Konten ${sectionMeta.label} berhasil disimpan`,
      )
    } catch (err) {
      const message = errorMessage(err, 'Gagal menyimpan konten PPDB')
      setServerError(message)
      toast('error', message)
    } finally {
      setSaving(false)
    }
  }

  // Selected icon for preview
  const SelectedIcon = ICON_MAP[values.icon || 'GraduationCap'] ?? GraduationCap

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) void requestClose()
      }}
    >
      <DialogContent
        className="flex h-[90dvh] max-h-[920px] w-[calc(100vw-2rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-white/70 bg-[var(--bg-elevated)] p-0 shadow-[0_24px_80px_-24px_rgba(15,60,40,0.45)] backdrop-blur-xl"
        aria-describedby="ppdb-form-description"
      >
        {/* Header Tetap */}
        <div className="relative shrink-0 overflow-hidden border-b border-[var(--border)]/70 bg-gradient-to-r from-emerald-900/10 via-white/60 to-amber-500/10 px-6 py-4">
          <div className="pointer-events-none absolute -top-10 -right-8 h-28 w-28 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative flex items-center gap-3.5 pr-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-md">
              <HeaderIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate font-heading text-lg font-bold leading-tight text-[var(--text)]">
                {mode === 'create'
                  ? `Tambah ${sectionMeta.label}`
                  : `Edit ${sectionMeta.label}`}
              </DialogTitle>
              <p
                id="ppdb-form-description"
                className="mt-0.5 truncate text-xs text-[var(--text-secondary)]"
              >
                {sectionMeta.description}
              </p>
            </div>
          </div>
        </div>

        {/* Body 2 Kolom */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg-secondary)]/30 lg:overflow-hidden">
          <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] lg:divide-x lg:divide-[var(--border)]/70">
            {/* Kolom Kiri: Form Input */}
            <div className="h-auto space-y-4 overflow-y-auto px-6 py-5 lg:h-full">
              {/* Seksi & Urutan */}
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <PpdbField label="Bagian Konten" htmlFor="ppdb-section" required>
                  <select
                    id="ppdb-section"
                    value={section}
                    disabled={mode === 'edit'}
                    onChange={(e) => update({ section: e.target.value })}
                    className={cn(
                      FIELD_CLASS,
                      'w-full border px-3 text-[var(--text)] focus:outline-none disabled:opacity-60',
                    )}
                  >
                    {Object.entries(PPDB_SECTIONS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </PpdbField>
                <PpdbField label="Nomor Urut" htmlFor="ppdb-order">
                  <Input
                    id="ppdb-order"
                    type="number"
                    value={String(formData.order ?? values.order ?? 0)}
                    onChange={(e) => update({ order: e.target.value })}
                    className={FIELD_CLASS}
                    placeholder="1"
                  />
                </PpdbField>
              </div>

              {/* Form Input Dinamis Berdasarkan Bagian */}
              {section === 'hero' && (
                <div className="space-y-4">
                  <PpdbField label="Judul Besar Hero 3D" htmlFor="ppdb-hero-title" required error={fieldErrors._c_hero_title}>
                    <Textarea
                      id="ppdb-hero-title"
                      value={values.hero_title ?? ''}
                      onChange={(e) => setField('hero_title', e.target.value)}
                      rows={2}
                      className={TEXTAREA_CLASS}
                      placeholder="Hafidz 30 Juz&#10;Ahli Teknologi"
                    />
                  </PpdbField>
                  <PpdbField label="Deskripsi Hero 3D" htmlFor="ppdb-hero-desc" required error={fieldErrors._c_hero_desc}>
                    <Textarea
                      id="ppdb-hero-desc"
                      value={values.hero_desc ?? ''}
                      onChange={(e) => setField('hero_desc', e.target.value)}
                      rows={3}
                      className={TEXTAREA_CLASS}
                      placeholder="Pendidikan pesantren putra terpadu: memadukan hafalan Al-Qur'an mutqin..."
                    />
                  </PpdbField>
                  <PpdbField label="Poin Bukti Hero (Pisahkan dengan |)" htmlFor="ppdb-hero-proof">
                    <Input
                      id="ppdb-hero-proof"
                      value={values.hero_proof ?? ''}
                      onChange={(e) => setField('hero_proof', e.target.value)}
                      className={FIELD_CLASS}
                      placeholder="30 Juz Bersanad | Coding & Web | Asrama Modern"
                    />
                  </PpdbField>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PpdbField label="Label Tombol Utama" htmlFor="ppdb-hero-cta-label">
                      <Input
                        id="ppdb-hero-cta-label"
                        value={values.hero_cta_label ?? ''}
                        onChange={(e) => setField('hero_cta_label', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Pelajari Program"
                      />
                    </PpdbField>
                    <PpdbField label="Tautan Tombol Utama" htmlFor="ppdb-hero-cta-href">
                      <Input
                        id="ppdb-hero-cta-href"
                        value={values.hero_cta_href ?? ''}
                        onChange={(e) => setField('hero_cta_href', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="#info-section"
                      />
                    </PpdbField>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PpdbField label="Label Tombol Daftar" htmlFor="ppdb-hero-reg-label">
                      <Input
                        id="ppdb-hero-reg-label"
                        value={values.hero_register_label ?? ''}
                        onChange={(e) => setField('hero_register_label', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Daftar PPDB Online"
                      />
                    </PpdbField>
                    <PpdbField label="Tautan Tombol Daftar" htmlFor="ppdb-hero-reg-href">
                      <Input
                        id="ppdb-hero-reg-href"
                        value={values.hero_register_href ?? ''}
                        onChange={(e) => setField('hero_register_href', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="/register"
                      />
                    </PpdbField>
                  </div>
                </div>
              )}

              {section === 'jalur' && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PpdbField label="Kicker / Label Kecil" htmlFor="ppdb-kicker">
                      <Input
                        id="ppdb-kicker"
                        value={values.kicker ?? ''}
                        onChange={(e) => setField('kicker', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Pembinaan Karakter & Sains"
                      />
                    </PpdbField>
                    <PpdbField label="Warna Aksen" htmlFor="ppdb-accent">
                      <select
                        id="ppdb-accent"
                        value={values.accent ?? 'emerald'}
                        onChange={(e) => setField('accent', e.target.value)}
                        className={cn(FIELD_CLASS, 'w-full border px-3 text-[var(--text)]')}
                      >
                        {PPDB_ACCENTS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </PpdbField>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
                    <PpdbField label="Judul Program" htmlFor="ppdb-title" required error={fieldErrors._c_title}>
                      <Input
                        id="ppdb-title"
                        value={values.title ?? ''}
                        onChange={(e) => setField('title', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Program Reguler Terpadu"
                      />
                    </PpdbField>
                    <PpdbField label="Ikon Kartu" htmlFor="ppdb-icon">
                      <select
                        id="ppdb-icon"
                        value={values.icon ?? 'GraduationCap'}
                        onChange={(e) => setField('icon', e.target.value)}
                        className={cn(FIELD_CLASS, 'w-full border px-3 text-[var(--text)]')}
                      >
                        {PPDB_ICONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </PpdbField>
                  </div>

                  <PpdbField label="Deskripsi Program" htmlFor="ppdb-desc" required error={fieldErrors._c_desc}>
                    <Textarea
                      id="ppdb-desc"
                      value={values.desc ?? ''}
                      onChange={(e) => setField('desc', e.target.value)}
                      rows={3}
                      className={TEXTAREA_CLASS}
                      placeholder="Bagi calon santri putra yang siap mengikuti pembinaan terpadu..."
                    />
                  </PpdbField>

                  <PpdbField
                    label="Poin-Poin Keunggulan (Satu item per baris)"
                    htmlFor="ppdb-items"
                  >
                    <Textarea
                      id="ppdb-items"
                      value={(values.items ?? []).join('\n')}
                      onChange={(e) => setField('items', e.target.value)}
                      rows={4}
                      className={TEXTAREA_CLASS}
                      placeholder="Halaqah Tahfidz harian target mutqin&#10;Dasar pemrograman & logika komputasi&#10;Pembiasaan adab & kemandirian asrama"
                    />
                  </PpdbField>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <PpdbField label="Label Tombol" htmlFor="ppdb-cta-label">
                      <Input
                        id="ppdb-cta-label"
                        value={values.cta_label ?? 'Daftar Sekarang'}
                        onChange={(e) => setField('cta_label', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Daftar Sekarang"
                      />
                    </PpdbField>
                    <PpdbField label="Tautan Tombol" htmlFor="ppdb-cta-href">
                      <Input
                        id="ppdb-cta-href"
                        value={values.cta_href ?? '/register'}
                        onChange={(e) => setField('cta_href', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="/register"
                      />
                    </PpdbField>
                  </div>
                </div>
              )}

              {section === 'pillar' && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
                    <PpdbField label="Judul Pilar Kurikulum" htmlFor="ppdb-title" required error={fieldErrors._c_title}>
                      <Input
                        id="ppdb-title"
                        value={values.title ?? ''}
                        onChange={(e) => setField('title', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Tahfidz Al-Qur'an Bersanad"
                      />
                    </PpdbField>
                    <PpdbField label="Ikon Pilar" htmlFor="ppdb-icon">
                      <select
                        id="ppdb-icon"
                        value={values.icon ?? 'BookOpen'}
                        onChange={(e) => setField('icon', e.target.value)}
                        className={cn(FIELD_CLASS, 'w-full border px-3 text-[var(--text)]')}
                      >
                        {PPDB_ICONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </PpdbField>
                  </div>

                  <PpdbField label="Deskripsi Pilar" htmlFor="ppdb-desc" required error={fieldErrors._c_desc}>
                    <Textarea
                      id="ppdb-desc"
                      value={values.desc ?? ''}
                      onChange={(e) => setField('desc', e.target.value)}
                      rows={4}
                      className={TEXTAREA_CLASS}
                      placeholder="Pembinaan tahsin, ziyadah, dan muraja'ah harian..."
                    />
                  </PpdbField>
                </div>
              )}

              {section === 'step' && (
                <div className="space-y-4">
                  <PpdbField label="Judul Langkah Alur" htmlFor="ppdb-title" required error={fieldErrors._c_title}>
                    <Input
                      id="ppdb-title"
                      value={values.title ?? ''}
                      onChange={(e) => setField('title', e.target.value)}
                      className={FIELD_CLASS}
                      placeholder="Pendaftaran Akun & Data Lengkap"
                    />
                  </PpdbField>
                  <PpdbField label="Deskripsi Langkah Alur" htmlFor="ppdb-desc" required error={fieldErrors._c_desc}>
                    <Textarea
                      id="ppdb-desc"
                      value={values.desc ?? ''}
                      onChange={(e) => setField('desc', e.target.value)}
                      rows={4}
                      className={TEXTAREA_CLASS}
                      placeholder="Pembuatan akun resmi calon santri secara mandiri..."
                    />
                  </PpdbField>
                </div>
              )}

              {section === 'faq' && (
                <div className="space-y-4">
                  <PpdbField label="Kategori FAQ" htmlFor="ppdb-category">
                    <Input
                      id="ppdb-category"
                      value={values.category ?? ''}
                      onChange={(e) => setField('category', e.target.value)}
                      className={FIELD_CLASS}
                      placeholder="Persyaratan & Seleksi / Biaya & Beasiswa"
                    />
                  </PpdbField>
                  <PpdbField label="Pertanyaan Calon Santri & Wali" htmlFor="ppdb-question" required error={fieldErrors._c_question}>
                    <Textarea
                      id="ppdb-question"
                      value={values.question ?? ''}
                      onChange={(e) => setField('question', e.target.value)}
                      rows={2}
                      className={TEXTAREA_CLASS}
                      placeholder="Apa saja materi yang diujikan dalam Seleksi PPDB?"
                    />
                  </PpdbField>
                  <PpdbField label="Jawaban Resmi Panitia" htmlFor="ppdb-answer" required error={fieldErrors._c_answer}>
                    <Textarea
                      id="ppdb-answer"
                      value={values.answer ?? ''}
                      onChange={(e) => setField('answer', e.target.value)}
                      rows={4}
                      className={TEXTAREA_CLASS}
                      placeholder="Seleksi calon santri baru terdiri dari tiga bagian terpadu..."
                    />
                  </PpdbField>
                </div>
              )}

              {section === 'cta' && (
                <div className="space-y-4">
                  <PpdbField label="Judul CTA Konsultasi" htmlFor="ppdb-cta-title" required error={fieldErrors._c_cta_title}>
                    <Input
                      id="ppdb-cta-title"
                      value={values.cta_title ?? ''}
                      onChange={(e) => setField('cta_title', e.target.value)}
                      className={FIELD_CLASS}
                      placeholder="Konsultasi Pendaftaran Santri Baru?"
                    />
                  </PpdbField>
                  <PpdbField label="Deskripsi Ajakan" htmlFor="ppdb-cta-desc">
                    <Textarea
                      id="ppdb-cta-desc"
                      value={values.cta_desc ?? ''}
                      onChange={(e) => setField('cta_desc', e.target.value)}
                      rows={3}
                      className={TEXTAREA_CLASS}
                      placeholder="Tim panitia PPDB siap melayani pertanyaan mengenai kurikulum..."
                    />
                  </PpdbField>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PpdbField label="Label Tombol Kontak" htmlFor="ppdb-cta-pri-label">
                      <Input
                        id="ppdb-cta-pri-label"
                        value={values.cta_primary_label ?? ''}
                        onChange={(e) => setField('cta_primary_label', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="Hubungi Panitia (WhatsApp)"
                      />
                    </PpdbField>
                    <PpdbField label="Tautan Tombol Kontak" htmlFor="ppdb-cta-pri-href">
                      <Input
                        id="ppdb-cta-pri-href"
                        value={values.cta_primary_href ?? ''}
                        onChange={(e) => setField('cta_primary_href', e.target.value)}
                        className={FIELD_CLASS}
                        placeholder="/contact"
                      />
                    </PpdbField>
                  </div>
                </div>
              )}
            </div>

            {/* Kolom Kanan: Pratinjau Live Kartu */}
            <div className="min-h-0 overflow-y-auto bg-stone-50/60 px-6 py-5">
              <div className="sticky top-0 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <Eye className="h-4 w-4 text-emerald-700" />
                  Pratinjau Live di Web Publik
                </div>

                {/* Pratinjau Sesuai Seksi */}
                {section === 'jalur' && (
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <SelectedIcon className="h-5 w-5" />
                      </span>
                      <div>
                        {values.kicker && (
                          <span className="text-[11px] font-semibold text-emerald-700 block">
                            {values.kicker}
                          </span>
                        )}
                        <h4 className="font-heading font-bold text-base text-[var(--text)]">
                          {values.title || 'Judul Program Pembinaan'}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {values.desc || 'Deskripsi program pembinaan santri baru...'}
                    </p>
                    {values.items && values.items.length > 0 && (
                      <ul className="mt-4 space-y-2 border-t border-[var(--border)]/60 pt-3 text-xs text-[var(--text-secondary)]">
                        {values.items.map((it, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-5 pt-3 border-t border-[var(--border)]/40 flex justify-end">
                      <span className="text-xs font-semibold text-emerald-800">
                        {values.cta_label || 'Daftar Sekarang'} →
                      </span>
                    </div>
                  </div>
                )}

                {section === 'hero' && (
                  <div className="rounded-2xl border border-[var(--border)] bg-emerald-950 p-6 text-white shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853]">
                      Hero 3D Preview
                    </span>
                    <h3 className="mt-2 text-xl font-bold whitespace-pre-line text-white">
                      {values.hero_title || 'Judul Hero 3D'}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-emerald-100/80">
                      {values.hero_desc || 'Deskripsi Hero 3D...'}
                    </p>
                    {values.hero_proof && (
                      <div className="mt-3 inline-block rounded-md bg-emerald-900/80 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                        {values.hero_proof}
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <span className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
                        {values.hero_register_label || 'Daftar PPDB'}
                      </span>
                      <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white">
                        {values.hero_cta_label || 'Pelajari'}
                      </span>
                    </div>
                  </div>
                )}

                {section === 'pillar' && (
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <SelectedIcon className="h-5 w-5" />
                      </span>
                      <h4 className="font-heading font-bold text-base text-[var(--text)]">
                        {values.title || 'Judul Pilar'}
                      </h4>
                    </div>
                    <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {values.desc || 'Deskripsi pilar kurikulum holistik...'}
                    </p>
                  </div>
                )}

                {section === 'step' && (
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-[11px] font-bold text-white">
                        {values.order || 1}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-[var(--text)]">
                        {values.title || 'Langkah Alur'}
                      </h4>
                    </div>
                    <p className="mt-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {values.desc || 'Deskripsi tahapan langkah alur...'}
                    </p>
                  </div>
                )}

                {section === 'faq' && (
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                    {values.category && (
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                        {values.category}
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-[var(--text)]">
                      {values.question || 'Pertanyaan FAQ?'}
                    </h4>
                    <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)]/60 pt-2">
                      {values.answer || 'Jawaban resmi panitia penerimaan santri baru...'}
                    </p>
                  </div>
                )}

                {section === 'cta' && (
                  <div className="rounded-2xl border border-emerald-600/30 bg-emerald-900 p-6 text-white shadow-sm">
                    <h4 className="font-heading font-bold text-base text-white">
                      {values.cta_title || 'Konsultasi PPDB?'}
                    </h4>
                    <p className="mt-2 text-xs text-emerald-100/80 leading-relaxed">
                      {values.cta_desc || 'Deskripsi ajakan konsultasi panitia...'}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#D4A853] px-3.5 py-2 text-xs font-bold text-emerald-950">
                      {values.cta_primary_label || 'Hubungi WhatsApp'} →
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-emerald-600/20 bg-emerald-50/50 p-4 text-[11px] text-emerald-900 leading-relaxed">
                  💡 <strong>Tips:</strong> Simpan perubahan untuk memutakhirkan halaman publik secara seketika (*instant live sync*).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tetap */}
        <div className="shrink-0 border-t border-[var(--border)]/70 bg-white/95 px-6 py-3.5">
          {serverError && (
            <div className="mb-2.5">
              <p
                role="alert"
                className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {serverError}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {isDirty ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                Perubahan belum disimpan
              </p>
            ) : (
              <p className="hidden items-center gap-1.5 text-xs text-[var(--text-muted)] sm:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Konten tersinkron otomatis ke landing PPDB publik.
              </p>
            )}
            <div className="flex w-full justify-end gap-2.5 sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => void requestClose()}
                className="h-10 rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => void handleSave()}
                loading={saving}
                disabled={saving}
                className="h-10 min-w-[150px] gap-2 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900"
              >
                {!saving && <Save className="h-4 w-4" />}
                {saving
                  ? 'Menyimpan...'
                  : mode === 'create'
                    ? 'Simpan Konten'
                    : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
