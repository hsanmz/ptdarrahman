'use client'

/* eslint-disable @next/next/no-img-element -- gambar banner berasal dari URL CMS yang dapat memakai domain eksternal. */

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronDown, Sparkles, ArrowRight } from 'lucide-react'
import type { HeroSlide } from '@/app/lib/types'
import { API_BASE } from '@/app/lib/api'
import { resolveImageSrc } from '@/app/lib/image-file'
import { prefersReducedMotion } from '@/app/lib/motion'
import { resolvePortalUrl } from '@repo/ui'

const AUTOPLAY_MS = 6000

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'hero-fallback-1',
    order: 1,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop',
    content: {
      height_mode: 'peek',
      label: 'Pesantren Tahfidz & Digital Khusus Putra • Berdiri Sejak 2021',
      title: "Mencetak Hafidz\nAl-Qur'an 30 Juz\nyang Ahli di Bidang\nTeknologi Digital",
      subtitle:
        'Pendidikan pesantren putra terpadu yang memadukan ketangguhan hafalan lewat tradisi Tasmi\' 30 Juz Bil Ghoib dengan penguasaan rekayasa perangkat lunak modern (Next.js, Basis Data, IoT & Cloud).',
      button_label: 'Daftar PPDB Online',
      button_href: '/ppdb',
    },
  },
  {
    id: 'hero-fallback-2',
    order: 2,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1920&auto=format&fit=crop',
    content: {
      height_mode: 'peek',
      label: 'Terbukti Melahirkan Hafidz 30 Juz & Juara Nasional',
      title: "Dari Majelis Tasmi' Bil Ghoib\nhingga Ruang Programming\nBersama Praktisi Industri",
      subtitle:
        'Santri PTDARRAHMAN ditempa menyetorkan hafalan 10 hingga 30 juz sekali duduk, menjuarai berbagai kompetisi sains dan tahfidz, sekaligus belajar teknologi web langsung bersama praktisi industri teknologi.',
      button_label: 'Lihat Jejak Prestasi',
      button_href: '/achievements',
    },
  },
  {
    id: 'hero-fallback-3',
    order: 3,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1920&auto=format&fit=crop',
    content: {
      height_mode: 'peek',
      label: 'PPDB Pesantren Tahfidz Qur\'an dan Digital Ar-Rahman Dibuka',
      title: "Daftarkan Putra Anda\nSecara 100% Online\nMelalui Portal Resmi",
      subtitle:
        'Proses seleksi terintegrasi mulai dari pendaftaran akun calon santri, pembayaran QRIS dinamis, ujian seleksi terpadu CBT & Tahfidz, hingga terbit LoA digital resmi.',
      button_label: 'Mulai Pendaftaran PPDB',
      button_href: '/ppdb',
    },
  },
  {
    id: 'hero-fallback-4',
    order: 4,
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop',
    content: {
      height_mode: 'peek',
      label: 'Ekosistem Pesantren Asri & Pendampingan 24 Jam',
      title: "Membina Akidah, Adab Asrama,\ndan Kemandirian Santri\ndalam Fasilitas Modern",
      subtitle:
        'Lingkungan mukim representatif dengan pendampingan asatidz dan musyrif 24 jam, pembiasaan ibadah berjamaah di masjid, laboratorium komputer modern, asrama nyaman, serta sarana olahraga kebugaran santri.',
      button_label: 'Jelajahi Fasilitas',
      button_href: '/facilities',
    },
  },
]

export default function HeroSection({ slides = [] }: { slides?: HeroSlide[] }) {
  const items = useMemo(() => {
    const valid = slides.filter(
      (slide) => typeof slide.image === 'string' && slide.image.trim() !== '',
    )
    return valid.length > 0 ? valid : FALLBACK_SLIDES
  }, [slides])

  const [active, setActive] = useState(0)
  const [isHoveredControls, setIsHoveredControls] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goToNext = useCallback(() => {
    if (items.length <= 1) return
    setActive((curr) => (curr + 1) % items.length)
  }, [items.length])

  const goToPrev = useCallback(() => {
    if (items.length <= 1) return
    setActive((curr) => (curr - 1 + items.length) % items.length)
  }, [items.length])

  // Autoplay berganti otomatis secara berkala
  useEffect(() => {
    if (items.length <= 1 || isHoveredControls || prefersReducedMotion()) return

    timerRef.current = setInterval(() => {
      goToNext()
    }, AUTOPLAY_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [items.length, isHoveredControls, goToNext, active])

  // Handle Touch Gesture untuk mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHoveredControls(false)
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHoveredControls(false)
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToNext()
      else goToPrev()
    }
    touchStartX.current = null
  }

  const current = items[Math.min(active, items.length - 1)]
  // 2 Mode Ukuran Sesuai Konfigurasi Dashboard CP:
  // - 'full': Opsi A — Full Screen (layar penuh tanpa ruang intip bawah)
  // - 'peek': Opsi B — Ruang Bawah 10-15% (menampilkan intipan section 'SIAPA KAMI' di bawahnya)
  const heightMode = current?.content?.height_mode === 'full' ? 'full' : 'peek'

  return (
    <section
      aria-label="Banner utama beranda"
      className={`relative mt-16 md:mt-20 w-full overflow-hidden select-none bg-slate-950 transition-all duration-500 ${
        heightMode === 'full'
          ? 'h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5rem)] min-h-[580px] lg:min-h-[680px]'
          : 'h-[75dvh] sm:h-[78dvh] md:h-[82dvh] min-h-[520px] lg:min-h-[580px]'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides Track with Crossfade */}
      <div className="absolute inset-0 w-full h-full">
        {items.map((slide, index) => {
          const isCurrent = index === active
          const imageUrl = resolveImageSrc(String(slide.image), API_BASE)

          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {/* Background Image with Zoom Effect on Active */}
              <img
                src={imageUrl}
                alt="Banner Pesantren Tahfidz Qur'an dan Digital Ar-Rahman"
                className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                  isCurrent ? 'scale-105' : 'scale-100'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  const target = e.currentTarget
                  if (!target.src.includes('unsplash.com')) {
                    const fallbackImg = FALLBACK_SLIDES[index % FALLBACK_SLIDES.length]?.image
                    if (fallbackImg) target.src = fallbackImg
                  }
                }}
              />

              {/* Multi-layer Gradient Overlay for Contrast & Islamic Tech Aesthetics */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/35 z-10" />
              <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-pattern-grid opacity-[0.035] z-10 pointer-events-none" />
            </div>
          )
        })}
      </div>

      {/* Foreground Content: Typography, Badges, & Action Buttons */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-20 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={`slide-content-${current.id || active}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl py-8 sm:py-12"
            >
              {/* Pill / Kicker Badge */}
              {current.content?.label ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md mb-4 sm:mb-5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0 animate-pulse" />
                  <span className="truncate max-w-xs sm:max-w-none">{current.content.label}</span>
                </div>
              ) : null}

              {/* Slide Title */}
              {current.content?.title ? (
                <h1 className="font-[var(--font-heading)] text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.12] tracking-tight whitespace-pre-line drop-shadow-lg mb-4 sm:mb-5">
                  {current.content.title}
                </h1>
              ) : null}

              {/* Subtitle / Description */}
              {current.content?.subtitle ? (
                <p className="text-sm sm:text-base lg:text-lg text-slate-200/90 leading-relaxed max-w-2xl drop-shadow mb-6 sm:mb-8 font-normal whitespace-pre-line">
                  {current.content.subtitle}
                </p>
              ) : null}

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                {current.content?.button_label ? (() => {
                  const rawHref = current.content.button_href || '/ppdb'
                  const isRegister = rawHref === '/register' || rawHref === 'register'
                  const finalHref = isRegister ? `${resolvePortalUrl()}/register` : rawHref
                  const isExternal = finalHref.startsWith('http://') || finalHref.startsWith('https://')

                  if (isExternal) {
                    return (
                      <a
                        href={finalHref}
                        target={isRegister ? '_blank' : undefined}
                        rel={isRegister ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--accent-gold)] to-[#E5BE64] text-[#0E2E1D] shadow-[0_10px_25px_-5px_rgba(212,168,83,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(212,168,83,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>{current.content.button_label}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </a>
                    )
                  }

                  return (
                    <Link
                      href={finalHref}
                      className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--accent-gold)] to-[#E5BE64] text-[#0E2E1D] shadow-[0_10px_25px_-5px_rgba(212,168,83,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(212,168,83,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>{current.content.button_label}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  )
                })() : null}

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md transition-all cursor-pointer"
                >
                  <span>Tentang Pesantren</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Carousel Navigation Controls */}
      {items.length > 1 ? (
        <>
          {/* Desktop Floating Arrows */}
          <button
            type="button"
            onClick={goToPrev}
            onMouseEnter={() => setIsHoveredControls(true)}
            onMouseLeave={() => setIsHoveredControls(false)}
            aria-label="Banner sebelumnya"
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-slate-900/50 hover:bg-slate-900/85 text-white border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            onMouseEnter={() => setIsHoveredControls(true)}
            onMouseLeave={() => setIsHoveredControls(false)}
            aria-label="Banner berikutnya"
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-slate-900/50 hover:bg-slate-900/85 text-white border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Bottom Navigation Bar: Integrated Mobile Arrows + Dots Progress & Counter */}
          <div
            onMouseEnter={() => setIsHoveredControls(true)}
            onMouseLeave={() => setIsHoveredControls(false)}
            className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-3 bg-slate-950/70 backdrop-blur-md border border-white/15 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl"
          >
            {/* Mobile Previous Button */}
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Banner sebelumnya"
              className="md:hidden flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Slide Dots / Progress */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {items.map((slide, index) => {
                const isCurrent = index === active
                return (
                  <button
                    key={slide.id || index}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`Tampilkan banner ${index + 1}`}
                    aria-current={isCurrent}
                    className={`relative h-2 rounded-full transition-all duration-500 overflow-hidden cursor-pointer ${
                      isCurrent ? 'w-8 sm:w-10 bg-white/30' : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  >
                    {isCurrent && (
                      <span
                        key={`progress-${active}`}
                        className="absolute inset-0 bg-[var(--accent-gold)] rounded-full animate-hero-progress origin-left"
                        style={{
                          animationDuration: `${AUTOPLAY_MS}ms`,
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <span className="text-[11px] font-mono font-medium text-white/70 pl-2 border-l border-white/20 select-none">
              0{active + 1} / 0{items.length}
            </span>

            {/* Mobile Next Button */}
            <button
              type="button"
              onClick={goToNext}
              aria-label="Banner berikutnya"
              className="md:hidden flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </>
      ) : null}

      {/* Peek Indicator if Mode is 'peek' (Opsi B) */}
      {heightMode === 'peek' && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-0.5 text-white/50 pointer-events-none animate-bounce">
          <span className="text-[10px] uppercase tracking-widest font-medium">Jelajahi ke bawah</span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
        </div>
      )}
    </section>
  )
}
