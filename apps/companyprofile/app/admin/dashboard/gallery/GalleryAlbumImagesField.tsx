'use client'

import { useState, useRef } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import {
  Upload,
  Plus,
  Trash2,
  Link2,
  Loader2,
  Images,
  AlertCircle,
} from 'lucide-react'
import * as api from '@/app/lib/api'
import { errorMessage } from '../_types'
import {
  GALLERY_IMAGE_ACCEPT,
  GALLERY_IMAGE_MAX_BYTES,
  validateGalleryImageFile,
  validateGalleryImageUrl,
  formatFileSize,
  resolveGalleryImageSrc,
} from './gallery-form'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
}

export function GalleryAlbumImagesField({ images, onChange, onUploadingChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const apiBase = api.getApiBase?.() ?? api.API_BASE

  function setUploadState(val: boolean) {
    setUploading(val)
    onUploadingChange?.(val)
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)
    if (files.length === 0) return

    setErrorMsg('')
    setUploadState(true)

    const newUploadedUrls: string[] = []
    let failedCount = 0
    let lastError = ''

    for (const file of files) {
      const err = validateGalleryImageFile(file)
      if (err) {
        failedCount++
        lastError = err
        continue
      }
      try {
        const url = await api.uploadImage(file, 'gallery')
        if (url) newUploadedUrls.push(url)
      } catch (e) {
        failedCount++
        lastError = errorMessage(e, '')
      }
    }

    setUploadState(false)

    if (newUploadedUrls.length > 0) {
      onChange([...images, ...newUploadedUrls])
    }

    if (failedCount > 0) {
      setErrorMsg(
        lastError
          ? `${failedCount} berkas gagal diunggah: ${lastError}`
          : `${failedCount} berkas gagal diunggah atau melebihi batas ${formatFileSize(GALLERY_IMAGE_MAX_BYTES)}.`,
      )
    }
  }

  function handleAddUrl() {
    setUrlError('')
    const clean = urlInput.trim()
    if (!clean) return

    const err = validateGalleryImageUrl(clean)
    if (err) {
      setUrlError(err)
      return
    }

    onChange([...images, clean])
    setUrlInput('')
    setShowUrlInput(false)
  }

  function removeImage(index: number) {
    onChange(images.filter((_, idx) => idx !== index))
  }

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-white/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-700">
            <Images className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
            Foto di Dalam Album
          </span>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
          {images.length} Foto
        </span>
      </div>

      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
        Tambahkan beberapa foto yang masuk ke dalam album ini. Pengunjung dapat melihat seluruh foto ini saat membuka album.
      </p>

      {/* Grid Thumbnail Foto di dalam Album */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 border border-zinc-200/80 rounded-xl bg-zinc-50/70">
          {images.map((src, index) => {
            const resolved = resolveGalleryImageSrc(src, apiBase)
            return (
              <div
                key={`${src}-${index}`}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolved}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Hapus foto ini dari album"
                  aria-label={`Hapus foto ${index + 1}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[9px] font-mono text-white">
                  #{index + 1}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Dropzone & Tombol Aksi Tambah */}
      <div
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center transition-colors ${
          dragging
            ? 'border-emerald-600 bg-emerald-50/50'
            : 'border-[var(--border)] bg-white/40 hover:bg-white/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={GALLERY_IMAGE_ACCEPT}
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />

        {uploading ? (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span>Sedang mengunggah foto ke album…</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Unggah Foto (Bisa Banyak)
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white hover:bg-zinc-50 text-[var(--text-secondary)] px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <Link2 className="h-3.5 w-3.5" />
              {showUrlInput ? 'Tutup URL' : 'Tambah via URL'}
            </button>
          </div>
        )}
      </div>

      {showUrlInput && (
        <div className="space-y-1.5 pt-1">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                if (urlError) setUrlError('')
              }}
              placeholder="https://... URL gambar"
              className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-white px-2.5 text-xs focus:border-emerald-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
            >
              Tambah
            </button>
          </div>
          {urlError && <p className="text-[11px] text-destructive">{urlError}</p>}
        </div>
      )}

      {errorMsg && (
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}
    </div>
  )
}
