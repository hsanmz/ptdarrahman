'use client'

import React from 'react'
import Link from 'next/link'
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  QrCode,
  AlertCircle,
  MessageCircle,
} from 'lucide-react'
import type { ActivePpdbWave } from '@/app/lib/ppdb'
import { formatTanggalIndo, parseApiDate } from '@/app/lib/ppdb'

interface LiveWaveStatusBarProps {
  wave: ActivePpdbWave | null
  portalUrl?: string
  whatsappNumber?: string
  contactPhone?: string
}

export default function LiveWaveStatusBar({
  wave,
  portalUrl = 'http://localhost:5174',
  whatsappNumber,
  contactPhone,
}: LiveWaveStatusBarProps) {
  const isOpen = Boolean(wave?.active || wave?.registration_open)
  const isQuotaReached = wave?.registration_status === 'quota_reached'
  const isClosed = wave?.registration_status === 'closed' || (!isOpen && !isQuotaReached)

  const quotaTotal = wave?.quota && wave.quota > 0 ? wave.quota : 30
  const quotaPaid = wave?.paid_count || 0
  const quotaRemaining = Math.max(0, quotaTotal - quotaPaid)
  const quotaPercent = Math.min(100, Math.round((quotaPaid / quotaTotal) * 100))

  const startDate = formatTanggalIndo(parseApiDate(wave?.registration_start_date))
  const endDate = formatTanggalIndo(parseApiDate(wave?.registration_end_date))
  const dateRange = startDate && endDate ? `${startDate} – ${endDate}` : 'Jadwal diumumkan segera'

  // Format rupiah
  const formFeeText = wave?.form_fee
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(wave.form_fee)
    : 'Rp 250.000'

  // WhatsApp link generator
  const cleanWa = (whatsappNumber || contactPhone || '').replace(/\D/g, '')
  const waTarget = cleanWa.startsWith('0') ? `62${cleanWa.slice(1)}` : cleanWa
  const waUrl = waTarget
    ? `https://wa.me/${waTarget}?text=${encodeURIComponent(
        'Assalamu’alaikum Panitia PPDB PTDARRAHMAN, saya ingin berkonsultasi mengenai pendaftaran santri baru.'
      )}`
    : '/contact'

  const registerUrl = `${portalUrl.replace(/\/+$/, '')}/register`

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12 -mt-8 sm:-mt-12 md:-mt-16 z-20">
      <div className="overflow-hidden rounded-3xl border border-emerald-600/20 bg-[var(--bg-elevated)] shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
        {/* Top Accent Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-[#D4A853] to-emerald-700" />

        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
            {/* Status & Wave Title */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {isOpen ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                    </span>
                    Pendaftaran Dibuka
                  </span>
                ) : isQuotaReached ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 border border-amber-500/20">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Kuota Terpenuhi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-3.5 py-1 text-xs font-semibold text-zinc-600 border border-zinc-500/20">
                    <Clock className="h-3.5 w-3.5" />
                    Gelombang Ditutup
                  </span>
                )}

                {wave?.academic_year && (
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Tahun Ajaran {wave.academic_year}
                  </span>
                )}
              </div>

              <h3 className="mt-3 font-heading! text-2xl md:text-3xl font-bold tracking-tight text-emerald-950">
                {wave?.name || 'Penerimaan Santri Baru'}
              </h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Periode Pendaftaran: <strong>{dateRange}</strong></span>
              </p>
            </div>

            {/* Form Fee & Quick Perks */}
            <div className="flex flex-wrap items-center gap-4 bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--color-border)]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Biaya Formulir
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading! text-xl sm:text-2xl font-bold text-emerald-800">
                    {formFeeText}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.5">
                    <QrCode className="h-3 w-3" /> QRIS Instan
                  </span>
                </div>
              </div>

              {Boolean(wave?.early_discount_quota && wave.early_discount_quota > 0) && (
                <div className="border-l border-[var(--color-border)] pl-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8791F]">
                    Diskon Pendaftar Awal
                  </span>
                  <div className="text-sm font-semibold text-[var(--text)] flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#C5963B]" />
                    Kuota {wave?.early_discount_quota} Santri Pertama
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quota Progress Meter */}
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-700 shrink-0" />
                <span className="text-sm font-semibold text-[var(--text)]">
                  Kuota Penerimaan Santri:
                </span>
                <span className="text-sm font-bold text-emerald-800">
                  {quotaPaid} dari {quotaTotal} santri terisi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {isOpen ? `Tersisa ${quotaRemaining} Kursi` : 'Pendaftaran Penuh'}
                </span>
                <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                  {quotaPercent}%
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-3 w-full rounded-full bg-zinc-200/80 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-[#D4A853] transition-all duration-700 ease-out"
                style={{ width: `${Math.max(5, quotaPercent)}%` }}
              />
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[var(--text-secondary)]">
                {isOpen
                  ? '⚡ Kuota terisi secara atomik saat pembayaran formulir terkonfirmasi.'
                  : 'Pendaftaran gelombang ini sedang tidak menerima entri baru. Silakan hubungi kami untuk informasi gelombang berikutnya.'}
              </p>

              <div className="flex items-center gap-3 shrink-0">
                {isOpen ? (
                  <a
                    href={registerUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-7 py-3 text-sm transition-all shadow-md shadow-emerald-900/15 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Daftar Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-3 text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Hubungi Panitia (Waiting List)
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
