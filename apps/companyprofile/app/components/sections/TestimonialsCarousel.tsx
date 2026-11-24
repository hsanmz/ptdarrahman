'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
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

function TestimonialCard({ t }: { t: Testimonial }) {
  const quote = t.content?.quote || t.content?.text || '—'

  return (
    <div
      className="glass-card rounded-2xl p-6 sm:p-7 w-[85vw] sm:w-[380px] max-w-[380px] flex-shrink-0 flex flex-col justify-between border border-[var(--border)] shadow-md transition-all duration-300 hover:shadow-xl hover:border-[var(--accent)]/40 hover:-translate-y-1 bg-white/85 backdrop-blur-md"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <Quote className="w-7 h-7 text-[var(--accent)] opacity-30" />
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5 italic line-clamp-4">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]/60">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[var(--accent)]/30 flex-shrink-0 relative bg-[var(--bg-secondary)] flex items-center justify-center">
          {t.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={resolveImageSrc(t.image)}
              alt={t.name || 'Wali Santri'}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
          <div className="w-full h-full bg-[var(--accent)]/15 flex items-center justify-center text-sm font-bold text-[var(--accent)]">
            {t.name?.charAt(0) || '?'}
          </div>
        </div>
        <div className="overflow-hidden">
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

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
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
            <TestimonialCard key={`${t.id || i}-${i}`} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  )
}
