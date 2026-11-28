'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, Star, X, ArrowRight, CheckCircle2 } from 'lucide-react'
import ShapeDivider from '../ui/ShapeDivider'
import Marquee from '../ui/Marquee'
import type { Testimonial } from '@/app/lib/types'
import { resolveImageSrc } from '@/app/lib/image-file'

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'H. Bambang Sulistyo',
    child: 'Santri Angkatan 2024',
    content: {
      quote:
        'Alhamdulillah, perkembangan hafalan Al-Qur\'an dan kemandirian anak kami sangat pesat sejak masuk di PTDARRAHMAN. Penguasaan teknologi dan adab santrinya luar biasa.',
    },
    order: 1,
  },
  {
    id: 't-2',
    name: 'dr. Hj. Siti Rahmawati',
    child: 'Wali Santri Tahfidz Digital',
    content: {
      quote:
        'Kurikulum terpadu antara ilmu syar\'i, tahfidz, dan teknologi informasi modern sangat relevan dengan tantangan zaman. Lingkungan santri sangat kondusif.',
    },
    order: 2,
  },
  {
    id: 't-3',
    name: 'Ir. Ahmad Fadhil, M.T.',
    child: 'Santri Rekayasa Web & IoT',
    content: {
      quote:
        'Anak tidak hanya hafal Al-Qur\'an tapi juga mahir pemrograman web dan IoT. Metode pembelajaran modern dan bimbingan asatidz sangat intensif.',
    },
    order: 3,
  },
  {
    id: 't-4',
    name: 'Hj. Dewi Lestari, S.Pd.',
    child: 'Santri Program Bilingual',
    content: {
      quote:
        'Kemampuan komunikasi bahasa Arab dan Inggris anak kami meningkat drastis dalam setahun pertama. Karakter islami dan kedisiplinan santri terjaga dengan sangat baik.',
    },
    order: 4,
  },
]

function sortByOrder(items: Testimonial[]): Testimonial[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function TestimonialCard({
  t,
  onOpenDetail,
}: {
  t: Testimonial
  onOpenDetail: (t: Testimonial) => void
}) {
  const quote = t.content?.quote || t.content?.text || '—'
  const isLong = quote.length > 130
  const avatarUrl = t.image ? resolveImageSrc(t.image) : ''

  return (
    <div
      onClick={() => onOpenDetail(t)}
      className="glass-card rounded-2xl p-6 sm:p-7 w-[85vw] sm:w-[380px] max-w-[380px] flex-shrink-0 flex flex-col justify-between border border-[var(--border)] shadow-md transition-all duration-300 hover:shadow-xl hover:border-[var(--accent)]/40 hover:-translate-y-1 bg-white/85 backdrop-blur-md cursor-pointer group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <Quote className="w-7 h-7 text-[var(--accent)] opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic line-clamp-4">
          &ldquo;{quote}&rdquo;
        </p>

        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenDetail(t)
            }}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            <span>Baca Selengkapnya</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[var(--border)]/60">
        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[var(--accent)]/30 flex-shrink-0 bg-[var(--accent)]/15 flex items-center justify-center text-sm font-bold text-[var(--accent)] shadow-2xs">
          <span>{t.name?.charAt(0) || '?'}</span>
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt={t.name || 'Wali Santri'}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
        </div>
        <div className="overflow-hidden min-w-0">
          <div className="font-[var(--font-heading)] font-bold text-sm text-[var(--text)] truncate">
            {t.name}
          </div>
          {t.child && (
            <div className="text-xs text-[var(--accent)] font-medium truncate">
              {t.child}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TestimonialModal({
  testimonial,
  onClose,
}: {
  testimonial: Testimonial | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!testimonial) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [testimonial, onClose])

  if (!testimonial) return null

  const quote = testimonial.content?.quote || testimonial.content?.text || '—'
  const avatarUrl = testimonial.image ? resolveImageSrc(testimonial.image) : ''

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Aksen background dekoratif */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[var(--accent)]/5 rounded-full blur-2xl pointer-events-none" />

          {/* Tombol Tutup */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup testimoni"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Rating & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 pr-8 mb-5">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Wali Santri Terverifikasi
            </span>
          </div>

          {/* Kutipan Utuh */}
          <div className="relative mb-6">
            <Quote className="absolute -top-3 -left-2 w-8 h-8 text-[var(--accent)] opacity-15" />
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic whitespace-pre-line pl-3">
              &ldquo;{quote}&rdquo;
            </p>
          </div>

          {/* Identitas Wali Santri */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--accent)]/30 shrink-0 bg-[var(--accent)]/15 flex items-center justify-center text-base font-bold text-[var(--accent)] shadow-xs">
              <span>{testimonial.name?.charAt(0) || '?'}</span>
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt={testimonial.name || 'Wali Santri'}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h4 className="font-[var(--font-heading)] font-bold text-base text-slate-900 leading-tight">
                {testimonial.name}
              </h4>
              {testimonial.child && (
                <p className="text-xs sm:text-sm text-[var(--accent)] font-medium mt-0.5">
                  {testimonial.child}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [activeModal, setActiveModal] = useState<Testimonial | null>(null)

  const items = useMemo(() => {
    const sorted = sortByOrder(testimonials || [])
    return sorted.length > 0 ? sorted : DEFAULT_TESTIMONIALS
  }, [testimonials])

  return (
    <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 bg-[var(--bg-secondary)] overflow-hidden">
      <ShapeDivider fill="var(--bg)" tintStrength={0.2} />
      <div className="absolute inset-0 bg-pattern-grid opacity-[0.03]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-badge justify-center">{'TESTIMONI'}</span>
          <h2 className="section-title">{'Suara Keunggulan'}</h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            Amanah, kepuasan, dan pengalaman nyata para orang tua serta wali santri bersama PTDARRAHMAN.
          </p>
        </motion.div>
      </div>

      {/* Infinite Seamless Marquee */}
      <div className="relative z-10 w-full overflow-hidden">
        <Marquee direction="left" speed={35} className="py-4">
          {items.map((t, i) => (
            <TestimonialCard
              key={`${t.id || i}-${i}`}
              t={t}
              onOpenDetail={(item) => setActiveModal(item)}
            />
          ))}
        </Marquee>
      </div>

      {/* Modal Dialog Detail Testimoni */}
      {activeModal && (
        <TestimonialModal
          testimonial={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </section>
  )
}
