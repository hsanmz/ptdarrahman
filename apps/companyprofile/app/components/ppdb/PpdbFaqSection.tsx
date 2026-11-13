'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import type { PpdbFaqItem } from '@/app/lib/types'

interface PpdbFaqSectionProps {
  faqs: PpdbFaqItem[]
  whatsappNumber?: string
  contactPhone?: string
}

export default function PpdbFaqSection({
  faqs,
  whatsappNumber,
  contactPhone,
}: PpdbFaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null)

  const toggle = (id: string) => {
    setOpenId((curr) => (curr === id ? null : id))
  }

  const cleanWa = (whatsappNumber || contactPhone || '').replace(/\D/g, '')
  const waTarget = cleanWa.startsWith('0') ? `62${cleanWa.slice(1)}` : cleanWa
  const waUrl = waTarget
    ? `https://wa.me/${waTarget}?text=${encodeURIComponent(
        'Assalamu’alaikum, saya ingin bertanya lebih lanjut mengenai PPDB PTDARRAHMAN.'
      )}`
    : '/contact'

  return (
    <section className="mt-24 md:mt-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
          <HelpCircle className="h-3.5 w-3.5 text-[#D4A853]" />
          Pusat Bantuan
        </span>
        <h3 className="mt-3 font-heading! text-2xl md:text-4xl font-bold tracking-tight text-emerald-950">
          Pertanyaan yang Sering Diajukan (FAQ)
        </h3>
        <p className="mt-3 text-sm md:text-base text-[var(--text-secondary)]">
          Jawaban komprehensif atas hal-hal yang paling sering ditanyakan oleh calon wali santri baru.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openId === faq.id
          return (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className={`rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? 'border-emerald-600/40 bg-[var(--bg-elevated)] shadow-md shadow-emerald-950/5'
                  : 'border-[var(--color-border)] bg-[var(--bg-secondary)] hover:border-emerald-600/30'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 select-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  {faq.category && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-700 border border-emerald-600/20">
                      {faq.category}
                    </span>
                  )}
                  <span className="font-heading! text-base sm:text-lg font-bold text-[var(--text)]">
                    {faq.question}
                  </span>
                </div>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                    isOpen
                      ? 'rotate-180 bg-emerald-700 text-white'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--color-border)]'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-sm leading-relaxed text-[var(--text-secondary)] border-t border-[var(--color-border)]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Still Have Questions Box */}
      <div className="mt-10 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          Masih memiliki pertanyaan lain seputar kehidupan santri dan pendaftaran?
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Konsultasikan langsung dengan Panitia PPDB
        </a>
      </div>
    </section>
  )
}
