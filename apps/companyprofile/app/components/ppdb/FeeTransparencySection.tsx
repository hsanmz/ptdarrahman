'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Building,
  Utensils,
  BookOpen,
  QrCode,
} from 'lucide-react'

interface FeeTransparencySectionProps {
  portalUrl?: string
  formFee?: number
  earlyDiscountQuota?: number
}

export default function FeeTransparencySection({
  portalUrl = 'http://localhost:5174',
  formFee = 250000,
  earlyDiscountQuota,
}: FeeTransparencySectionProps) {
  const formFeeFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(formFee)

  const feeCards = [
    {
      icon: Building,
      title: 'Uang Pangkal',
      badge: 'Satu Kali di Awal',
      desc: 'Investasi sarana asrama modern, ranjang mukim santri, laboratorium programming, dan fasilitas pesantren.',
      detail: 'Rp 15.000.000',
      subDetail: 'Investasi fasilitas asrama & lab komputer',
      color: 'emerald',
    },
    {
      icon: Sparkles,
      title: 'Uang Kegiatan (per tahun)',
      badge: 'Rutin Per Tahun',
      desc: 'Rihlah tahunan, tasmi bil ghoib terbuka, kompetisi teknologi & olahraga santri, serta wisuda tahfidz.',
      detail: 'Rp 6.000.000',
      subDetail: 'Kegiatan santri 1 tahun penuh',
      color: 'amber',
    },
    {
      icon: Utensils,
      title: 'Uang SPP',
      badge: 'Rutin Per Bulan',
      desc: 'Pendidikan tahfidz 30 juz, asuhan muhaffidz, makan bergizi 3x sehari, laundry pakaian, dan praktikum IT.',
      detail: 'Rp 2.000.000',
      subDetail: 'Per bulan lengkap konsumsi 3x & asrama',
      color: 'sky',
    },
    {
      icon: BookOpen,
      title: 'Uang Buku',
      badge: 'Satu Kali Awal Tahun',
      desc: 'Mushaf Al-Qur\'an standar pojok, modul pemrograman IT & rekayasa web, dan kitab kajian dirosah islamiyah.',
      detail: 'Rp 1.000.000',
      subDetail: 'Paket mushaf tajwid & modul koding',
      color: 'violet',
    },
    {
      icon: ShieldCheck,
      title: 'Uang Seragam',
      badge: 'Satu Kali Awal Masuk',
      desc: 'Paket gamis putih shalat, seragam batik resmi PTDARRAHMAN, pramuka, kaos olahraga, dan jas santri resmi.',
      detail: 'Rp 1.000.000',
      subDetail: 'Paket 5 pasang seragam lengkap',
      color: 'teal',
    },
  ]

  return (
    <section className="mt-24 md:mt-32">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A853]" aria-hidden />
          Transparansi Finansial
        </span>
        <h3 className="mt-3 font-heading! text-2xl md:text-4xl font-bold tracking-tight text-emerald-950">
          Struktur Biaya Pendidikan Transparan & Akuntabel
        </h3>
        <p className="mt-4 text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
          Pesantren Tahfidz Qur’an dan Digital Ar-Rahman menjunjung tinggi transparansi tanpa biaya tersembunyi.
          Total estimasi biaya pendidikan santri baru adalah <strong>Rp 25.000.000</strong> yang terbagi ke dalam 5 komponen resmi berikut.
        </p>
      </motion.div>

      {/* Grid 5 Kartu Komponen Biaya */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {feeCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--bg-elevated)] p-6 transition-all duration-300 hover:border-emerald-600/40 hover:shadow-lg hover:shadow-emerald-950/5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--color-border)]">
                  {card.badge}
                </span>
              </div>

              <h4 className="text-base font-bold text-[var(--text)]">
                {card.title}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)] flex-1">
                {card.desc}
              </p>

              <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                <div className="font-heading! text-lg font-bold text-emerald-900">
                  {card.detail}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {card.subDetail}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Early Bird Callout & Official Compliance Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 p-6 md:p-8 text-white shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A853]/20 px-3 py-1 text-xs font-semibold text-[#E9C377] border border-[#D4A853]/30 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Benefit Diskon Pendaftar Awal (Early Bird)
            </div>
            <h4 className="text-xl md:text-2xl font-bold tracking-tight">
              Potongan Biaya Pendidikan untuk Kuota Pendaftar Tercepat
            </h4>
            <p className="mt-2 text-xs md:text-sm text-emerald-100/80 leading-relaxed">
              Santri yang menyelesaikan registrasi dan pembayaran formulir lebih awal berhak memperoleh potongan biaya masuk.
              Penyetoran biaya pendidikan disalurkan langsung via transfer rekening resmi PTDARRAHMAN setelah terbitnya LoA resmi.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={`${portalUrl.replace(/\/+$/, '')}/biaya-beasiswa`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white text-emerald-950 px-6 py-3 text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-md"
            >
              Lihat Rincian Biaya Lengkap
              <ArrowRight className="h-4 w-4 text-emerald-700" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
