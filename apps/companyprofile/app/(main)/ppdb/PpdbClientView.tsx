'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Globe,
  Sparkles,
  ArrowRight,
  Rocket,
  ShieldCheck,
  Target,
  Award,
  CheckCircle2,
  Laptop,
  Users,
  LogIn,
  MessageCircle,
  Trophy,
  Star,
  Clock,
  Compass,
  type LucideIcon,
} from 'lucide-react'

import type { ActivePpdbWave } from '@/app/lib/ppdb'
import { buildSchedule } from '@/app/lib/ppdb'
import {
  STATIC_PPDB_CONTENT,
  pickAccent,
  resolveIconName,
  type AccentKey,
  type PpdbIconName,
} from '@/app/lib/ppdbContent'
import ShapeDividerDiagonal from '@/app/components/ui/ShapeDividerDiagonal'
import LiveWaveStatusBar from '@/app/components/ppdb/LiveWaveStatusBar'
import FeeTransparencySection from '@/app/components/ppdb/FeeTransparencySection'
import PpdbFaqSection from '@/app/components/ppdb/PpdbFaqSection'
import { resolvePortalUrl } from '@repo/ui'

const ICON_MAP: Record<PpdbIconName, LucideIcon> = {
  Award,
  GraduationCap,
  BookOpen,
  Laptop,
  Users,
  ShieldCheck,
  Sparkles,
  Target,
  Rocket,
  Globe,
}

const ACCENT_STYLES: Record<
  AccentKey,
  { chip: string; kicker: string; check: string; link: string }
> = {
  emerald: {
    chip: 'bg-emerald-600/10 text-emerald-700',
    kicker: 'text-emerald-700',
    check: 'text-emerald-600',
    link: 'text-emerald-800 hover:text-emerald-900',
  },
  amber: {
    chip: 'bg-[#D4A853]/15 text-[#A8791F]',
    kicker: 'text-[#A8791F]',
    check: 'text-[#C5963B]',
    link: 'text-[#8C681D] hover:text-[#6E5015]',
  },
  sky: {
    chip: 'bg-emerald-600/10 text-emerald-700',
    kicker: 'text-emerald-700',
    check: 'text-emerald-600',
    link: 'text-emerald-800 hover:text-emerald-900',
  },
  violet: {
    chip: 'bg-amber-500/10 text-[#A8791F]',
    kicker: 'text-[#A8791F]',
    check: 'text-[#C5963B]',
    link: 'text-[#8C681D] hover:text-[#6E5015]',
  },
  rose: {
    chip: 'bg-emerald-600/10 text-emerald-700',
    kicker: 'text-emerald-700',
    check: 'text-emerald-600',
    link: 'text-emerald-800 hover:text-emerald-900',
  },
  teal: {
    chip: 'bg-amber-500/10 text-[#A8791F]',
    kicker: 'text-[#A8791F]',
    check: 'text-[#C5963B]',
    link: 'text-[#8C681D] hover:text-[#6E5015]',
  },
}

// Dynamic 3D Hero
const PPDBHero = dynamic(
  () => import('@/components/ui/orbit-delivery-hero'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-[var(--bg)] text-emerald-900">
        <div className="w-12 h-12 border-3 border-emerald-600 border-t-[#D4A853] rounded-full animate-spin mb-4" />
        <p className="font-medium text-sm tracking-widest uppercase text-emerald-800/80 animate-pulse">
          Menyiapkan Dunia 3D Ar-Rahman…
        </p>
      </div>
    ),
  }
)

interface PpdbClientViewProps {
  wave: ActivePpdbWave | null
  settings: Record<string, string>
  portalUrl?: string
  ppdbRows?: Array<Record<string, any>>
}

export default function PpdbClientView({
  wave,
  settings,
  portalUrl: propPortalUrl,
  ppdbRows = [],
}: PpdbClientViewProps) {
  const portalUrl = propPortalUrl || resolvePortalUrl(process.env.NEXT_PUBLIC_PORTAL_URL)
  const ppdb = buildSchedule(wave)

  const content = useMemo(() => {
    if (!ppdbRows || ppdbRows.length === 0) return STATIC_PPDB_CONTENT

    const heroRow = ppdbRows.find((r) => r.section === 'hero')
    const jalurRows = ppdbRows
      .filter((r) => r.section === 'jalur')
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    const pillarRows = ppdbRows
      .filter((r) => r.section === 'pillar')
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    const stepRows = ppdbRows
      .filter((r) => r.section === 'step')
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    const faqRows = ppdbRows
      .filter((r) => r.section === 'faq')
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    const ctaRow = ppdbRows.find((r) => r.section === 'cta')

    const heroContent =
      heroRow?.content && typeof heroRow.content === 'object'
        ? (heroRow.content as Record<string, unknown>)
        : {}
    const ctaContent =
      ctaRow?.content && typeof ctaRow.content === 'object'
        ? (ctaRow.content as Record<string, unknown>)
        : {}

    const copy = {
      ...STATIC_PPDB_CONTENT.copy,
      ...(heroContent as Record<string, string>),
      ...(ctaContent as Record<string, string>),
    }

    const jalur =
      jalurRows.length > 0
        ? jalurRows.map((r, idx) => ({
            id: r.id || `jalur-${idx}`,
            icon: r.content?.icon || 'GraduationCap',
            content: {
              order: r.order ?? idx + 1,
              accent: r.content?.accent || 'emerald',
              kicker: r.content?.kicker || '',
              title: r.content?.title || '',
              desc: r.content?.desc || '',
              items: Array.isArray(r.content?.items) ? r.content.items : [],
              cta_label: r.content?.cta_label || 'Daftar Sekarang',
              cta_href: r.content?.cta_href || `${portalUrl.replace(/\/+$/, '')}/register`,
            },
          }))
        : STATIC_PPDB_CONTENT.jalur

    const pillars =
      pillarRows.length > 0
        ? pillarRows.map((r, idx) => ({
            id: r.id || `pillar-${idx}`,
            icon: r.content?.icon || 'BookOpen',
            content: {
              order: r.order ?? idx + 1,
              title: r.content?.title || '',
              desc: r.content?.desc || '',
            },
          }))
        : STATIC_PPDB_CONTENT.pillars

    const steps =
      stepRows.length > 0
        ? stepRows.map((r, idx) => ({
            id: r.id || `step-${idx}`,
            content: {
              order: r.order ?? idx + 1,
              title: r.content?.title || '',
              desc: r.content?.desc || '',
            },
          }))
        : STATIC_PPDB_CONTENT.steps

    const faqs =
      faqRows.length > 0
        ? faqRows.map((r, idx) => ({
            id: r.id || `faq-${idx}`,
            question: r.content?.question || '',
            answer: r.content?.answer || '',
            category: r.content?.category || '',
          }))
        : STATIC_PPDB_CONTENT.faqs

    return {
      copy,
      jalur,
      pillars,
      steps,
      faqs,
    }
  }, [ppdbRows, portalUrl])

  // General contact number from settings
  const contactPhone = settings.phone || settings.contact_phone || ''
  const whatsappNumber = settings.whatsapp || contactPhone
  const cleanWa = whatsappNumber.replace(/\D/g, '')
  const waTarget = cleanWa.startsWith('0') ? `62${cleanWa.slice(1)}` : cleanWa
  const waConsultUrl = waTarget
    ? `https://wa.me/${waTarget}?text=${encodeURIComponent(
        'Assalamu’alaikum Panitia PPDB PTDARRAHMAN, saya ingin berkonsultasi mengenai pendaftaran santri baru.'
      )}`
    : '/contact'

  const registerPortalUrl = `${portalUrl.replace(/\/+$/, '')}/register`
  const loginPortalUrl = `${portalUrl.replace(/\/+$/, '')}/login`

  // Override hero CTA to link to portal register
  const heroCopy = {
    ...content.copy,
    hero_cta_href: '#info-section',
    hero_cta_label: 'Pelajari Program',
    hero_register_href: registerPortalUrl,
    hero_register_label: 'Daftar PPDB Online',
  }

  return (
    <div className="w-full min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* 3D Interactive Hero */}
      <section className="relative w-full">
        <PPDBHero
          theme="auto"
          academicYear={ppdb.academicYear}
          copy={heroCopy}
          shirtColor={null}
          pantsColor={null}
          showBag={false}
          showStrap={false}
          showCap={true}
        />
      </section>

      {/* Visual Tear-off Divider */}
      <div className="relative" aria-hidden>
        <ShapeDividerDiagonal fill="var(--bg-secondary)" />
      </div>

      {/* Live Wave & Quota Status Bar */}
      <LiveWaveStatusBar
        wave={wave}
        portalUrl={portalUrl}
        whatsappNumber={whatsappNumber}
        contactPhone={contactPhone}
      />

      {/* Info Section */}
      <section
        id="info-section"
        className="pt-20 md:pt-28 pb-20 md:pb-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto"
      >
        {/* Section Heading: Program Pembinaan Santri Baru */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 text-fade-breathe">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4A853]" aria-hidden />
            {ppdb.academicYear ? `PPDB ${ppdb.academicYear}` : 'PPDB PTDARRAHMAN'}
          </span>
          <h2 className="mt-4 font-heading! text-3xl md:text-5xl font-bold tracking-tight text-emerald-950">
            {content.copy.jalur_title}
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-base md:text-lg leading-relaxed whitespace-pre-line">
            {content.copy.jalur_desc}
          </p>
        </motion.div>

        {/* 4 Cards: Program Pembinaan Santri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {content.jalur.map((card, idx) => {
            const Icon = ICON_MAP[resolveIconName(card.icon)]
            const accent = ACCENT_STYLES[pickAccent(card.content?.accent)]
            return (
              <motion.article
                key={card.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.6, delay: (idx % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--bg-elevated)] p-7 md:p-9 transition-all duration-300 hover:border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-950/5"
              >
                <div className="mb-6 flex items-center gap-3.5">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {card.content?.kicker && (
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${accent.kicker}`}
                    >
                      {card.content.kicker}
                    </span>
                  )}
                </div>

                <h3 className="font-heading! text-xl md:text-2xl font-bold text-[var(--text)]">
                  {card.content?.title}
                </h3>

                <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                  {card.content?.desc}
                </p>

                {(card.content?.items?.length ?? 0) > 0 && (
                  <ul className="mt-6 space-y-3">
                    {(card.content?.items as string[])?.map((item: string) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
                      >
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${accent.check}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-7">
                  <a
                    href={registerPortalUrl}
                    className={`inline-flex items-center gap-2 text-sm font-semibold ${accent.link}`}
                  >
                    {card.content?.cta_label || 'Daftar Sekarang'}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* Kurikulum Holistik Masa Depan */}
        <div className="mt-20 md:mt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h3 className="font-heading! text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
              {content.copy.kurikulum_title}
            </h3>
            <p className="mt-3 text-sm md:text-base text-[var(--text-secondary)] whitespace-pre-line">
              {content.copy.kurikulum_desc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {content.pillars.map((pillar, idx) => {
              const Icon = ICON_MAP[resolveIconName(pillar.icon)]
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: (idx % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--bg-secondary)] p-6 transition-all duration-300 hover:border-emerald-700/30 hover:shadow-md"
                >
                  <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h4 className="text-base font-bold text-[var(--text)]">
                    {pillar.content?.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                    {pillar.content?.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* 6 Tahap Alur Pendaftaran PPDB Resmi */}
        <div className="mt-20 md:mt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-xl mx-auto mb-14"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 text-fade-breathe">
              {content.copy.alur_kicker}
            </span>
            <h3 className="mt-3 font-heading! text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
              {content.copy.alur_title}
            </h3>
            <p className="mt-2 text-xs md:text-sm text-[var(--text-secondary)]">
              Alur pendaftaran tuntas dan transparan, berakhir pada penandatanganan LoA digital resmi.
            </p>
          </motion.div>

          <ol className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {content.steps.map((step, idx) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.55, delay: (idx % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--bg-secondary)] p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-white font-mono text-xs font-bold tracking-wider">
                    {idx + 1}
                  </span>
                  <span className="h-px flex-1 bg-[var(--color-border)]" aria-hidden />
                </div>
                <h4 className="mt-4 text-base font-bold text-[var(--text)]">
                  {step.content?.title}
                </h4>
                <p className="mt-2 text-xs md:text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                  {step.content?.desc}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Fee Transparency Section */}
        <FeeTransparencySection
          portalUrl={portalUrl}
          formFee={wave?.form_fee}
          earlyDiscountQuota={wave?.early_discount_quota}
        />

        {/* Prestasi Santri Section */}
        <div className="mt-20 md:mt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-xl mx-auto mb-14"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              Torehan Prestasi Santri
            </span>
            <h3 className="mt-3 font-heading! text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
              Prestasi Kejuaraan Santri PTDARRAHMAN
            </h3>
            <p className="mt-2 text-xs md:text-sm text-[var(--text-secondary)]">
              Bukti nyata sinergi pendidikan tahfidz 30 juz, keahlian teknik informatika, dan kecakapan bahasa santri.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Alvito Syarman S',
                medal: 'Medali Emas',
                field: 'Tafsir Al-Qur\'an & Hadits',
                desc: 'Meraih Medali Emas membuktikan kedalaman hafalan dan pemahaman tafsir Al-Qur\'an serta hadits.',
                badge: 'bg-amber-100 text-amber-900 border-amber-300',
              },
              {
                name: 'Rasyid Anwar Arief',
                medal: 'Medali Perak',
                field: 'Teknik Informatika',
                desc: 'Meraih Medali Perak dalam kejuaraan sains komputer dan problem solving pemrograman digital.',
                badge: 'bg-slate-100 text-slate-800 border-slate-300',
              },
              {
                name: 'Hudzaifah Ali Miftah',
                medal: 'Medali Perunggu',
                field: 'Teknik Informatika',
                desc: 'Meraih Medali Perunggu dalam kompetisi logika pemrograman dan rekayasa teknologi digital.',
                badge: 'bg-amber-50 text-amber-800 border-amber-200',
              },
              {
                name: 'Rahmatullah Yusuf I',
                medal: 'Medali Perunggu',
                field: 'Bahasa Inggris',
                desc: 'Meraih Medali Perunggu dalam olimpiade kecakapan literasi dan pidato Bahasa Inggris bertaraf global.',
                badge: 'bg-blue-50 text-blue-800 border-blue-200',
              },
            ].map((p, idx) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--bg-elevated)] p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${p.badge}`}>
                      {p.medal}
                    </span>
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--text)]">
                    {p.name}
                  </h4>
                  <div className="text-xs font-semibold text-emerald-700 mt-1">
                    Bidang Lomba: {p.field}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Program Harian & Ekskul Section */}
        <div className="mt-20 md:mt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-xl mx-auto mb-14"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              Rutinitas Santri &amp; Eksplorasi Minat
            </span>
            <h3 className="mt-3 font-heading! text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
              18 Program Harian &amp; Ekstrakurikuler
            </h3>
            <p className="mt-2 text-xs md:text-sm text-[var(--text-secondary)]">
              Rutinitas harian teratur dari Tahajud hingga Muthola&apos;ah dipadu kegiatan olahraga dan outing class berkala.
            </p>
          </motion.div>

          {/* Ekskul Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              'Futsal', 'Badminton', 'Hadroh', 'Hiking', 'Renang',
              'Car Free Day', 'Mosque Tour', 'Rihlah', 'Dan Lain-lain'
            ].map((ek) => (
              <span
                key={ek}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--bg-secondary)] px-3.5 py-1.5 text-xs font-medium text-[var(--text)] shadow-xs"
              >
                <Compass className="h-3.5 w-3.5 text-emerald-600" />
                {ek}
              </span>
            ))}
          </div>

          {/* Program Harian Grid Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { num: 1, name: 'Tahajud' },
              { num: 2, name: 'Shalat Subuh' },
              { num: 3, name: 'Halaqoh Subuh' },
              { num: 4, name: 'Olahraga Pagi' },
              { num: 5, name: 'Sarapan' },
              { num: 6, name: 'Dhuha & Ta\'lim' },
              { num: 7, name: 'Halaqoh Dhuha' },
              { num: 8, name: 'KBM Dirosah' },
              { num: 9, name: 'KBM Lughoh' },
              { num: 10, name: 'Shalat Dzuhur' },
              { num: 11, name: 'KBM IT & Coding' },
              { num: 12, name: 'Makan & Tidur Siang' },
              { num: 13, name: 'Ashar & Dzikir' },
              { num: 14, name: 'Halaqoh Ashar' },
              { num: 15, name: 'Olahraga Sore' },
              { num: 16, name: 'Maghrib & Isya' },
              { num: 17, name: 'Muhadhoroh' },
              { num: 18, name: 'Muthola\'ah' },
            ].map((ph) => (
              <div
                key={ph.num}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--bg-elevated)] p-3 text-center shadow-xs"
              >
                <span className="inline-block text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                  #{ph.num}
                </span>
                <div className="text-xs font-bold text-[var(--text)] line-clamp-1">
                  {ph.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <PpdbFaqSection
          faqs={content.faqs}
          whatsappNumber={whatsappNumber}
          contactPhone={contactPhone}
        />

        {/* Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 md:mt-28 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 px-7 py-10 text-white md:px-14 md:py-14 shadow-2xl"
        >
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A853]/20 px-3 py-1 text-xs font-semibold text-[#E9C377] border border-[#D4A853]/30 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Layanan Informasi Calon Santri
              </span>
              <h3 className="font-heading! text-2xl md:text-3xl font-bold tracking-tight">
                {content.copy.cta_title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-100/80 md:text-base whitespace-pre-line">
                {content.copy.cta_desc}
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto">
              <a
                href={waConsultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-emerald-950 transition-colors shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                Hubungi Panitia (WhatsApp)
              </a>

              <a
                href={loginPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <LogIn className="h-4 w-4" />
                Masuk Portal Santri
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
