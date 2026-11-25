'use client'

/* eslint-disable @next/next/no-img-element -- preview memakai URL gambar CMS eksternal. */

import { useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react'
import * as api from '@/app/lib/api'
import { resolveImageSrc } from '@/app/lib/image-file'
import { cn } from '@/app/lib/utils'
import { isFormDirty, UNSAVED_CHANGES_CONFIRM } from '@/app/lib/form-dirty'
import { toast } from '@/app/components/ui/AdminToast'
import { confirm } from '@/app/components/ui/AdminConfirm'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Label } from '@/app/components/ui/Label'
import { Textarea } from '@/app/components/ui/Textarea'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/Dialog'
import type { FormState, RowRecord } from '../_types'
import { errorMessage } from '../_types'

interface Props {
  mode: 'create' | 'edit'
  editingItem: RowRecord | null
  formData: FormState
  setFormData: (fd: FormState) => void
  onClose: () => void
  onSaved: () => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/x-webp',
])
const ACCEPTED_EXTS = ['.jpg', '.jpeg', '.jfif', '.jpe', '.png', '.webp']
const FIELD_CLASS =
  'h-11 rounded-xl border-[var(--border)] bg-white/95 text-sm focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 focus-visible:ring-offset-0'

function heightMode(value: unknown): 'full' | 'peek' {
  return value === 'full' ? 'full' : 'peek'
}

export function HeroFormDialog({ mode, editingItem, formData, setFormData, onClose, onSaved }: Props) {
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [isReplacingImage, setIsReplacingImage] = useState(false)
  const [serverError, setServerError] = useState('')
  const [initialFormData] = useState<FormState>(formData)
  const isDirty = isFormDirty(formData, initialFormData)

  const image = String(formData.image ?? '')
  const selectedHeight = heightMode(formData._c_height_mode)
  const label = String(formData._c_label ?? '')
  const title = String(formData._c_title ?? '')
  const subtitle = String(formData._c_subtitle ?? '')
  const buttonLabel = String(formData._c_button_label ?? '')
  const buttonHref = String(formData._c_button_href ?? '')
  const order = formData.order === undefined ? '' : String(formData.order)

  function update(patch: Partial<FormState>) {
    setFormData({ ...formData, ...patch })
    if (serverError) setServerError('')
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const rawType = (file.type || '').split(';')[0].trim().toLowerCase()
    const lowerName = (file.name || '').trim().toLowerCase()
    const isAllowed = ACCEPTED_TYPES.has(rawType) || (!rawType && ACCEPTED_EXTS.some((ext) => lowerName.endsWith(ext)))
    if (!isAllowed) {
      toast('error', 'Format gambar harus JPG, PNG, atau WebP.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast('error', 'Ukuran gambar maksimal 5 MB.')
      return
    }

    setUploading(true)
    try {
      const url = await api.uploadImage(file, 'hero')
      update({ image: url })
      toast('success', 'Gambar banner berhasil diunggah. Tekan Simpan untuk menerapkan.')
    } catch (error) {
      toast('error', `Upload gagal: ${errorMessage(error)}`)
    } finally {
      setUploading(false)
    }
  }

  async function requestClose() {
    if (saving || uploading) return
    if (!isDirty || (await confirm(UNSAVED_CHANGES_CONFIRM))) onClose()
  }

  async function handleSave() {
    if (saving || uploading) return
    if (mode === 'create' && !image.trim()) {
      setServerError('Gambar banner wajib diisi. Upload file atau masukkan URL gambar.')
      return
    }
    if (/^https?:\/\//i.test(image)) {
      try {
        const parsed = new URL(image)
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
      } catch {
        setServerError('URL gambar tidak valid. Gunakan URL HTTP atau HTTPS.')
        return
      }
    }

    setSaving(true)
    try {
      const orderValue = order === '' ? 0 : Number(order)
      const contentObj: Record<string, unknown> = {
        height_mode: selectedHeight,
      }
      if (label.trim()) contentObj.label = label.trim()
      if (title.trim()) contentObj.title = title.trim()
      if (subtitle.trim()) contentObj.subtitle = subtitle.trim()
      if (buttonLabel.trim()) contentObj.button_label = buttonLabel.trim()
      if (buttonHref.trim()) contentObj.button_href = buttonHref.trim()

      const payload = {
        image: image.trim(),
        order: Number.isFinite(orderValue) ? orderValue : 0,
        content: JSON.stringify(contentObj),
      }

      if (mode === 'edit' && editingItem?.id) {
        await api.updateItem(`/hero-slides/${editingItem.id}`, payload)
      } else {
        await api.createItem('/hero-slides', payload)
      }
      onClose()
      onSaved()
      toast('success', mode === 'create' ? 'Banner hero berhasil dibuat' : 'Banner hero berhasil disimpan')
    } catch (error) {
      const message = errorMessage(error, 'Gagal menyimpan banner hero')
      setServerError(message)
      toast('error', message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) void requestClose() }}>
      <DialogContent
        className="flex h-[92dvh] max-h-[920px] w-[calc(100vw-2rem)] max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl border-white/70 bg-[var(--bg-elevated)] p-0 shadow-[0_24px_80px_-24px_rgba(15,60,40,0.45)]"
        aria-describedby="hero-form-description"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent-subtle)] via-white/70 to-[var(--accent-gold)]/15 px-6 py-4">
          <DialogTitle className="font-heading text-lg font-bold text-[var(--text)]">
            {mode === 'create' ? 'Tambah Slide Banner Hero' : 'Edit Slide Banner Hero'}
          </DialogTitle>
          <p id="hero-form-description" className="mt-1 text-xs text-[var(--text-secondary)]">
            Atur gambar banner utama, pilih ukuran tampilan (Full Screen atau Peek Effect), serta lengkapi badge, judul, dan tombol CTA.
          </p>
        </div>

        {/* Content Body */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg-secondary)]/35 lg:overflow-hidden">
          <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] lg:divide-x lg:divide-[var(--border)]/70">
            {/* Left Column: Form Fields */}
            <div className="space-y-5 overflow-y-auto px-6 py-5">
              {/* Image Section */}
              <section className="rounded-2xl border border-[var(--border)]/70 bg-white/90 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                    <ImageIcon className="h-4 w-4 text-[var(--accent)]" />
                    Gambar Banner Utama
                  </div>
                  <div className="flex items-center gap-2">
                    {image ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Sudah Terisi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        Belum Ada Gambar
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-rose-500">* Wajib</span>
                  </div>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                  Gunakan gambar horizontal resolusi tinggi (1920×1080 px, rasio 16:9). Gambar otomatis diberi overlay sinematik.
                </p>

                {/* Ketika gambar sudah terisi, ganti inputan dengan kartu preview terpadu & aksi ganti/hapus */}
                {image && !isReplacingImage ? (
                  <div className="mt-4 space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--border)] bg-black/5 shadow-xs">
                      <img
                        src={resolveImageSrc(image, api.getApiBase?.() ?? api.API_BASE)}
                        alt="Pratinjau banner"
                        className="h-full w-full object-cover object-center"
                      />
                      <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                        Gambar Banner Aktif
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)]/70 bg-white/70 p-3">
                      <p className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--text-secondary)]" title={image}>
                        {image}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsReplacingImage(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Ganti Gambar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            update({ image: '' })
                            setIsReplacingImage(false)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                          aria-label="Hapus gambar banner"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-secondary)] p-1">
                        {(['upload', 'url'] as const).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setImageMode(item)}
                            className={cn(
                              'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
                              imageMode === item
                                ? 'bg-white text-[var(--text)] shadow-xs'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                            )}
                          >
                            {item === 'upload' ? <Upload className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                            {item === 'upload' ? 'Upload File' : 'URL Gambar'}
                          </button>
                        ))}
                      </div>
                      {isReplacingImage ? (
                        <button
                          type="button"
                          onClick={() => setIsReplacingImage(false)}
                          className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
                        >
                          Batal Ganti
                        </button>
                      ) : null}
                    </div>

                    {imageMode === 'upload' ? (
                      <label className="group mt-3 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[var(--border)] bg-white/60 px-4 py-7 text-center transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--accent-subtle)]/60">
                        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
                          <Upload className={cn('h-5 w-5', uploading && 'animate-pulse')} />
                        </span>
                        <span className="text-sm font-semibold text-[var(--text)]">
                          {uploading ? 'Mengompresi ke WebP & Mengunggah...' : 'Pilih file banner'}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">Otomatis dioptimasi ke WebP · JPG, PNG, atau WebP maks 5 MB</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            void handleUpload(e)
                            setIsReplacingImage(false)
                          }}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    ) : (
                      <div className="relative mt-3">
                        <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                          className={cn(FIELD_CLASS, 'pl-9')}
                          type="url"
                          value={image}
                          onChange={(event) => update({ image: event.target.value })}
                          placeholder="https://images.unsplash.com/... atau URL gambar langsung"
                        />
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Ukuran Tampilan (2 Ukuran) */}
              <section className="rounded-2xl border border-[var(--border)]/70 bg-white/90 p-5 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-sm font-semibold text-[var(--text)]">Ukuran Tampilan Banner</Label>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Pilih format tinggi banner yang akan diterapkan pada layar pengunjung.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--accent)]">2 Opsi Tersedia</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: 'full' as const,
                      title: 'Opsi A — Full Screen',
                      subtitle: 'Layar Penuh (Tanpa Ruang Bawah)',
                      description: 'Banner mengisi seluruh tinggi layar secara imersif dan megah.',
                      tag: '100% Layar Bersih',
                    },
                    {
                      value: 'peek' as const,
                      title: 'Opsi B — Peek Effect',
                      subtitle: 'Ruang Bawah 10-15%',
                      description: 'Menampilkan sedikit intipan section berikutnya ("SIAPA KAMI") agar memancing scroll pengunjung.',
                      tag: 'Direkomendasikan (Scroll Cue)',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update({ _c_height_mode: option.value })}
                      className={cn(
                        'rounded-xl border p-4 text-left transition-all',
                        selectedHeight === option.value
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/70 ring-2 ring-[var(--accent)]/20'
                          : 'border-[var(--border)] bg-white hover:border-[var(--accent)]/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-bold text-[var(--text)]">{option.title}</span>
                          <span className="block text-xs font-medium text-[var(--accent)]">{option.subtitle}</span>
                        </div>
                        <span
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                            selectedHeight === option.value
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                              : 'border-[var(--border)]'
                          )}
                        >
                          {selectedHeight === option.value ? <Check className="h-3 w-3" /> : null}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{option.description}</p>
                      <span className="mt-2 inline-block rounded-md bg-white/80 px-2 py-0.5 font-mono text-[10px] text-[var(--text-muted)] border border-[var(--border)]/60">
                        {option.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Text & Action Controls (Optional) */}
              <section className="space-y-4 rounded-2xl border border-[var(--border)]/70 bg-white/90 p-5 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <Type className="h-4 w-4 text-[var(--accent)]" />
                  Teks, Tipografi & Tombol CTA (Opsional)
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  Bisa dikosongkan jika Anda ingin slide menampilkan gambar banner murni.
                </p>

                {/* Badge / Kicker */}
                <div>
                  <Label htmlFor="hero-label" className="text-xs font-semibold text-[var(--text)]">
                    Kicker / Badge Emas
                  </Label>
                  <Input
                    id="hero-label"
                    className={cn(FIELD_CLASS, 'mt-1.5')}
                    value={label}
                    onChange={(e) => update({ _c_label: e.target.value })}
                    placeholder="Contoh: Pesantren Tahfidz & Digital Khusus Putra • Berdiri Sejak 2021"
                  />
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    Pill kecil di atas judul dengan ikon bintang berkilau.
                  </p>
                </div>

                {/* Judul Slide */}
                <div>
                  <Label htmlFor="hero-title" className="text-xs font-semibold text-[var(--text)]">
                    Judul Utama Slide
                  </Label>
                  <Textarea
                    id="hero-title"
                    className="mt-1.5 min-h-[75px] rounded-xl border-[var(--border)] bg-white/95 text-sm focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20"
                    value={title}
                    onChange={(e) => update({ _c_title: e.target.value })}
                    placeholder="Mencetak Hafidz Al-Qur'an 30 Juz&#10;yang Ahli di Bidang Teknologi Digital"
                  />
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    Mendukung tombol Enter untuk baris baru.
                  </p>
                </div>

                {/* Subtitle / Deskripsi */}
                <div>
                  <Label htmlFor="hero-subtitle" className="text-xs font-semibold text-[var(--text)]">
                    Deskripsi / Subtitle
                  </Label>
                  <Textarea
                    id="hero-subtitle"
                    className="mt-1.5 min-h-[70px] rounded-xl border-[var(--border)] bg-white/95 text-sm focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20"
                    value={subtitle}
                    onChange={(e) => update({ _c_subtitle: e.target.value })}
                    placeholder="Pendidikan pesantren putra terpadu yang memadukan ketangguhan hafalan Al-Qur'an dengan teknologi modern..."
                  />
                </div>

                {/* Tombol CTA */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="hero-btn-label" className="text-xs font-semibold text-[var(--text)]">
                      Teks Tombol CTA Utama
                    </Label>
                    <Input
                      id="hero-btn-label"
                      className={cn(FIELD_CLASS, 'mt-1.5')}
                      value={buttonLabel}
                      onChange={(e) => update({ _c_button_label: e.target.value })}
                      placeholder="Contoh: Daftar PPDB Online"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-btn-href" className="text-xs font-semibold text-[var(--text)]">
                      Tautan Tombol CTA (URL / Path)
                    </Label>
                    <Input
                      id="hero-btn-href"
                      className={cn(FIELD_CLASS, 'mt-1.5')}
                      value={buttonHref}
                      onChange={(e) => update({ _c_button_href: e.target.value })}
                      placeholder="/ppdb atau /register"
                    />
                  </div>
                </div>

                {/* Urutan Tampilan */}
                <div className="pt-2 border-t border-[var(--border)]/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hero-order" className="text-xs font-semibold text-[var(--text)]">
                        Urutan Tampilan Slide
                      </Label>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Angka lebih kecil tampil lebih awal (contoh: 1, 2, 3...)
                      </p>
                    </div>
                    <Input
                      id="hero-order"
                      type="number"
                      className="h-10 w-24 rounded-xl text-center font-mono font-semibold"
                      value={order}
                      onChange={(e) => update({ order: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Live Interactive Preview & Rules */}
            <div className="space-y-5 overflow-y-auto bg-white/40 px-6 py-5">
              {/* Preview Box */}
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-slate-950 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <Eye className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                    Simulasi Pratinjau Tampilan Beranda
                  </div>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700">
                    {selectedHeight === 'full' ? 'Mode A (Full Screen)' : 'Mode B (Peek Effect)'}
                  </span>
                </div>

                {/* Simulated Screen Viewport */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 flex flex-col justify-between">
                  {/* Background Image & Overlays */}
                  {image ? (
                    <img
                      src={resolveImageSrc(image, api.API_BASE)}
                      alt="Preview banner hero"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 text-slate-400">
                      <ImageIcon className="h-8 w-8 text-slate-600" />
                      <span className="text-xs">Unggah atau masukkan URL gambar</span>
                    </div>
                  )}

                  {/* Multi-layer Overlays (Gradient & Islamic Dark Tone) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 z-10" />

                  {/* Overlay Content */}
                  <div className="relative z-20 flex-1 p-5 sm:p-6 flex flex-col justify-center max-w-[85%]">
                    {label ? (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 self-start rounded-full bg-[var(--accent-gold)]/20 border border-[var(--accent-gold)]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--accent-gold)]">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span className="truncate max-w-[200px]">{label}</span>
                      </div>
                    ) : null}

                    {title ? (
                      <h4 className="font-heading text-sm sm:text-base font-extrabold text-white leading-snug whitespace-pre-line drop-shadow-md">
                        {title}
                      </h4>
                    ) : (
                      <h4 className="font-heading text-xs font-semibold text-slate-400 italic">
                        [Banner Tanpa Teks Judul]
                      </h4>
                    )}

                    {subtitle ? (
                      <p className="mt-1.5 text-[11px] text-slate-300/90 line-clamp-2 leading-relaxed">
                        {subtitle}
                      </p>
                    ) : null}

                    <div className="mt-3 flex items-center gap-2">
                      {buttonLabel ? (
                        <div className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent-gold)] px-3 py-1.5 text-[10px] font-bold text-[#0E2E1D] shadow-xs">
                          <span>{buttonLabel}</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </div>
                      ) : null}
                      <div className="inline-flex items-center rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-[10px] font-medium text-white">
                        Tentang Pesantren
                      </div>
                    </div>
                  </div>

                  {/* Peek Indicator if Mode is 'peek' */}
                  {selectedHeight === 'peek' && (
                    <div className="relative z-20 border-t border-dashed border-emerald-500/40 bg-gradient-to-t from-emerald-950/60 to-slate-950/80 px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-300 font-medium">
                        <ChevronDown className="h-3 w-3 animate-bounce" />
                        <span>Ruang Intip 10-15% (Section &quot;SIAPA KAMI&quot; terlihat di bawah fold)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guidelines Card */}
              <div className="rounded-2xl border border-[var(--border)]/70 bg-white/90 p-5 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                  Panduan Ukuran & Desain Banner
                </div>
                <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--accent)]">•</span>
                    <span>
                      <strong>Format Gambar:</strong> JPG, PNG, atau WebP dengan rasio 16:9 (1920×1080 px).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--accent)]">•</span>
                    <span>
                      <strong>Opsi A (Full Screen):</strong> Mengisi 100% tinggi layar pengunjung tanpa memotong section berikutnya. Cocok untuk tampilan ultra-modern dan sinematik.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--accent)]">•</span>
                    <span>
                      <strong>Opsi B (Peek Effect):</strong> Mengatur tinggi banner ~78-82vh sehingga bagian atas section &ldquo;SIAPA KAMI&rdquo; terlihat mengintip di bawah layar, memancing pengunjung untuk scroll ke bawah.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--accent)]">•</span>
                    <span>
                      <strong>Fleksibilitas Konten:</strong> Anda bebas mengisi teks atau mengosongkannya. Jika teks dikosongkan, slide tampil sebagai banner visual bersih.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-[var(--border)]/70 bg-white/95 px-6 py-3.5">
          {serverError ? (
            <p
              role="alert"
              className="mb-3 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {serverError}
            </p>
          ) : null}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden items-center gap-1.5 text-xs text-[var(--text-muted)] sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              Perubahan tersinkronisasi otomatis pada beranda setelah disimpan.
            </p>
            <div className="flex w-full justify-end gap-2.5 sm:w-auto">
              <Button type="button" variant="ghost" onClick={() => void requestClose()} className="h-10 rounded-xl">
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => void handleSave()}
                loading={saving}
                disabled={saving || uploading}
                className="h-10 min-w-[160px] gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90"
              >
                {!saving && <Save className="h-4 w-4" />}
                {saving ? 'Menyimpan...' : 'Simpan Banner Hero'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
