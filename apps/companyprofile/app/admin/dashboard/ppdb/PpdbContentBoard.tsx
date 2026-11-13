'use client'

import React from 'react'
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ListOrdered,
  HelpCircle,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  type LucideIcon,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Card } from '@/app/components/ui/Card'
import { confirm } from '@/app/components/ui/AdminConfirm'
import { cn } from '@/app/lib/utils'
import type { RowRecord } from '../_types'
import { PPDB_SECTIONS, PPDB_SECTION_ORDER } from './ppdb-form'

interface Props {
  items: RowRecord[]
  canCrud: boolean
  detailLoading: string | null
  onCreate: (section: string) => void
  onEdit: (item: RowRecord) => void
  onDelete: (item: RowRecord) => void
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  hero: Sparkles,
  jalur: GraduationCap,
  pillar: BookOpen,
  step: ListOrdered,
  faq: HelpCircle,
  cta: Megaphone,
}

function valueOf(item: RowRecord, key: string): string {
  const content = item.content && typeof item.content === 'object' ? item.content : null
  const value = content ? (content as Record<string, unknown>)[key] : undefined
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function titleOf(item: RowRecord): string {
  if (item.section === 'hero') return valueOf(item, 'hero_title') || 'Hero 3D Copy'
  if (item.section === 'faq') return valueOf(item, 'question') || 'Pertanyaan FAQ'
  if (item.section === 'cta') return valueOf(item, 'cta_title') || 'CTA Konsultasi'
  return valueOf(item, 'title') || 'Item PPDB'
}

function previewOf(item: RowRecord): string {
  const content = item.content && typeof item.content === 'object' ? (item.content as Record<string, unknown>) : {}
  if (item.section === 'hero') {
    return typeof content.hero_desc === 'string' ? content.hero_desc : 'Deskripsi Hero 3D'
  }
  if (item.section === 'faq') {
    return typeof content.answer === 'string' ? content.answer : 'Jawaban FAQ'
  }
  if (item.section === 'cta') {
    return typeof content.cta_desc === 'string' ? content.cta_desc : 'Deskripsi CTA'
  }
  const desc = typeof content.desc === 'string' ? content.desc : ''
  const items = Array.isArray(content.items) ? `${content.items.length} poin keunggulan` : ''
  return desc || items || 'Belum ada ringkasan konten.'
}

export function PpdbContentBoard({
  items,
  canCrud,
  detailLoading,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  const grouped = new Map<string, RowRecord[]>()
  for (const item of items) {
    const section = item.section || 'jalur'
    const rows = grouped.get(section) ?? []
    rows.push(item)
    grouped.set(section, rows)
  }

  const sections = [
    ...PPDB_SECTION_ORDER,
    ...[...grouped.keys()].filter((s) => !PPDB_SECTIONS[s]),
  ]

  async function requestDelete(item: RowRecord) {
    const title = titleOf(item)
    if (
      await confirm({
        title: 'Hapus konten PPDB',
        message: `Yakin ingin menghapus "${title}"? Tindakan ini tidak bisa dibatalkan.`,
        confirmLabel: 'Ya, Hapus',
        cancelLabel: 'Batal',
        variant: 'danger',
      })
    ) {
      onDelete(item)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner Panduan */}
      <div className="rounded-2xl border border-emerald-600/20 bg-emerald-500/10 px-5 py-4 text-sm text-[var(--text-secondary)]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <p className="font-semibold text-emerald-950">
              Manajemen Konten Landing PPDB Terpadu
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-900/80">
              Kelola teks Hero 3D, Program Pembinaan Santri, Kurikulum Holistik, 6 Alur Pendaftaran, FAQ khusus wali santri, dan CTA konsultasi. Perubahan langsung ditampilkan di halaman publik <code>/ppdb</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((sectionKey) => {
          const meta = PPDB_SECTIONS[sectionKey] ?? {
            key: sectionKey,
            label: sectionKey,
            description: 'Bagian PPDB kustom.',
          }
          const Icon = SECTION_ICONS[sectionKey] ?? FileText
          const rows = (grouped.get(sectionKey) ?? [])
            .slice()
            .sort((a, b) => (Number(a.order ?? 0)) - (Number(b.order ?? 0)))
          const isSingle = meta.single
          const canAdd = canCrud && (!isSingle || rows.length === 0)

          return (
            <Card
              key={sectionKey}
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)]/70 bg-white/80 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {/* Header Seksi */}
              <div className="flex items-start justify-between gap-4 border-b border-[var(--border)]/60 bg-[var(--bg-secondary)]/50 px-5 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700/10 text-emerald-800">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-base font-bold text-[var(--text)]">
                        {meta.label}
                      </h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        {rows.length} {rows.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
                      {meta.description}
                    </p>
                  </div>
                </div>

                {canAdd && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onCreate(sectionKey)}
                    className="shrink-0 gap-1.5 rounded-lg px-2.5 text-xs border-emerald-700/30 text-emerald-800 hover:bg-emerald-50"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah
                  </Button>
                )}
              </div>

              {/* Daftar Item Seksi */}
              <div className="flex-1 divide-y divide-[var(--border)]/40 p-0">
                {rows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <p className="text-xs text-[var(--text-muted)]">
                      Belum ada konten pada bagian ini.
                    </p>
                    {canCrud && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onCreate(sectionKey)}
                        className="mt-2 text-xs text-emerald-700 hover:text-emerald-800"
                      >
                        + Tambah Sekarang
                      </Button>
                    )}
                  </div>
                ) : (
                  rows.map((row) => {
                    const title = titleOf(row)
                    const preview = previewOf(row)
                    const kicker = valueOf(row, 'kicker') || valueOf(row, 'category')
                    const accent = valueOf(row, 'accent')
                    const iconName = valueOf(row, 'icon')
                    const orderNum = row.order != null ? Number(row.order) : 0
                    const isLoading = detailLoading === (row.id ?? '')

                    return (
                      <div
                        key={row.id}
                        className="group flex items-start justify-between gap-4 p-4 transition-colors hover:bg-emerald-50/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {orderNum > 0 && (
                              <span className="inline-flex items-center rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-600">
                                #{orderNum}
                              </span>
                            )}
                            {kicker && (
                              <span className="text-[11px] font-semibold text-emerald-700">
                                {kicker}
                              </span>
                            )}
                            {accent && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 capitalize">
                                {accent}
                              </span>
                            )}
                            {iconName && (
                              <span className="text-[10px] text-stone-400">
                                • {iconName}
                              </span>
                            )}
                          </div>
                          <h4 className="mt-1 font-semibold text-sm text-[var(--text)] line-clamp-1">
                            {title}
                          </h4>
                          <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                            {preview}
                          </p>
                        </div>

                        {canCrud && (
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={isLoading}
                              onClick={() => onEdit(row)}
                              className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-emerald-800"
                              title="Edit item"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!isSingle && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => void requestDelete(row)}
                                className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-rose-600"
                                title="Hapus item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
