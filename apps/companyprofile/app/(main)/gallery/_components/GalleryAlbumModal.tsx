'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  X,
  Images,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
} from 'lucide-react'
import type { GalleryItem } from '@/app/lib/types'
import { resolveImageSrc, FALLBACK_IMAGES, handleImageFallback } from '@/app/lib/image-file'
import { galleryCategoryLabel } from '@/app/lib/gallery-categories'

interface GalleryAlbumModalProps {
  album: GalleryItem
  onClose: () => void
}

export default function GalleryAlbumModal({ album, onClose }: GalleryAlbumModalProps) {
  // Seluruh foto dalam album: gabungan foto cover (bila ada) + foto-foto di content.images
  const albumImages = React.useMemo(() => {
    const list: string[] = []
    if (album.image) {
      list.push(resolveImageSrc(album.image) || FALLBACK_IMAGES.gallery)
    }
    if (Array.isArray(album.content?.images)) {
      for (const img of album.content.images) {
        if (img) {
          const resolved = resolveImageSrc(img) || FALLBACK_IMAGES.gallery
          if (!list.includes(resolved)) {
            list.push(resolved)
          }
        }
      }
    }
    return list.length > 0 ? list : [FALLBACK_IMAGES.gallery]
  }, [album])

  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)

  // Body lock saat album view terbuka
  useEffect(() => {
    const scrollY = window.scrollY
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePhotoIndex !== null) {
          setActivePhotoIndex(null)
        } else {
          onClose()
        }
      }
      if (activePhotoIndex !== null) {
        if (e.key === 'ArrowRight' && activePhotoIndex < albumImages.length - 1) {
          setActivePhotoIndex(activePhotoIndex + 1)
        }
        if (e.key === 'ArrowLeft' && activePhotoIndex > 0) {
          setActivePhotoIndex(activePhotoIndex - 1)
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', onKey)
    }
  }, [activePhotoIndex, albumImages.length, onClose])

  const title = album.content?.title?.trim() || 'Album Dokumentasi Kegiatan'
  const desc = album.content?.desc?.trim() || ''
  const category = galleryCategoryLabel(album.category)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[120] flex flex-col bg-slate-950/95 backdrop-blur-2xl text-white overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Album ${title}`}
    >
      {/* ── STICKY TOP NAV BAR ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3.5 sm:px-8 backdrop-blur-md">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs sm:text-sm font-semibold transition-all hover:-translate-x-0.5 cursor-pointer shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Galeri</span>
        </button>

        <div className="flex items-center gap-2">
          {category && (
            <span className="hidden sm:inline-flex rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
              {category}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A853]/20 border border-[#D4A853]/30 px-3 py-1 text-xs font-semibold text-[#E9C377]">
            <Images className="h-3.5 w-3.5" />
            <span>{albumImages.length} Foto</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer ml-1"
            aria-label="Tutup Album"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── ALBUM HEADER BANNER ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
            <Images className="h-4 w-4 text-[#D4A853]" />
            <span>Koleksi Album Dokumentasi</span>
          </div>

          <h1 className="font-heading! text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>

          {desc && (
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-300/90 whitespace-pre-line">
              {desc}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span>Kategori: <strong className="text-white">{category || 'Umum'}</strong></span>
            <span>•</span>
            <span>Jumlah Dokumentasi: <strong className="text-white">{albumImages.length} Foto</strong></span>
          </div>
        </div>
      </div>

      {/* ── PHOTO GRID DI DALAM ALBUM ── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-20 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {albumImages.map((src, idx) => (
            <motion.div
              key={`${src}-${idx}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
            >
              <button
                type="button"
                onClick={() => setActivePhotoIndex(idx)}
                className="group relative block w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 bg-zinc-900 shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={`Buka foto ke-${idx + 1} dari album ${title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${title} - Foto ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                  onError={(e) => handleImageFallback(e, FALLBACK_IMAGES.gallery)}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-xl group-hover:scale-110 transition-transform">
                    <Maximize2 className="h-5 w-5" />
                  </div>
                </div>

                <span className="absolute bottom-2.5 left-3 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono font-semibold text-white/90">
                  Foto {idx + 1} / {albumImages.length}
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ── LIGHTBOX FOTO DI DALAM ALBUM ── */}
      <AnimatePresence>
        {activePhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl p-4"
            onClick={() => setActivePhotoIndex(null)}
          >
            <div
              className="relative w-full max-w-5xl h-[84vh] flex flex-col justify-between rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gambar Full Preview */}
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={albumImages[activePhotoIndex]}
                  alt={`${title} - Foto ${activePhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => handleImageFallback(e, FALLBACK_IMAGES.gallery)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              </div>

              {/* Header Lightbox */}
              <div className="relative z-30 flex items-center justify-between p-4 sm:p-5 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-slate-900 border border-white/60 shadow-md">
                    {title}
                  </span>
                  <span className="rounded-full bg-black/50 border border-white/20 px-3 py-1 text-xs font-mono text-white/90">
                    {activePhotoIndex + 1} / {albumImages.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(null)}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl border border-white/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Tutup Foto"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Next & Prev Buttons */}
              {activePhotoIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(activePhotoIndex - 1)}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl border border-white/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Foto Sebelumnya"
                >
                  <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
                </button>
              )}

              {activePhotoIndex < albumImages.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(activePhotoIndex + 1)}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl border border-white/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Foto Selanjutnya"
                >
                  <ChevronRight className="h-6 w-6 stroke-[2.5]" />
                </button>
              )}

              {/* Bottom Thumbnail Strip */}
              <div className="relative z-30 p-3 sm:p-5 flex justify-center">
                <div className="flex gap-2 overflow-x-auto max-w-2xl p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
                  {albumImages.map((src, i) => (
                    <button
                      key={`strip-${src}-${i}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(i)}
                      className={`relative h-12 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activePhotoIndex
                          ? 'border-emerald-400 scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Thumb ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageFallback(e, FALLBACK_IMAGES.gallery)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
