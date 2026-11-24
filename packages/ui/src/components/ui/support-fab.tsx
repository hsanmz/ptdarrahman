'use client'

import { useRef, useEffect, useState, type ComponentType } from 'react'
import { Phone, MessageCircle, Mail, X } from 'lucide-react'

export interface SupportFabProps {
  phone?: string
  whatsapp?: string
  email?: string
  whatsappMessage?: string
}

interface Option {
  icon: ComponentType<{ className?: string }>
  title: string
  subtitle: string
  href: string
  external?: boolean
}

export function SupportFab({
  phone = '6281283612352',
  whatsapp = '6281283612352',
  email = 'info@ptdarrahman.sch.id',
  whatsappMessage = 'Assalamualaikum! Saya ingin bertanya tentang PTDARRAHMAN.',
}: SupportFabProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent | MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handler)
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const telHref = `tel:${phone.replace(/[^0-9+]/g, '')}`
  const waHref = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
  const mailHref = `mailto:${email}`

  const options: Option[] = [
    { icon: Phone, title: 'Call Support', subtitle: phone, href: telHref },
    { icon: MessageCircle, title: 'WhatsApp', subtitle: `+${whatsapp.replace(/[^0-9]/g, '')}`, href: waHref, external: true },
    { icon: Mail, title: 'Email Support', subtitle: email, href: mailHref },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <div ref={containerRef} className="relative">
        <div
          id="support-fab-panel"
          role="dialog"
          aria-label="Butuh Bantuan?"
          aria-hidden={!open}
          className={[
            'absolute bottom-full right-0 mb-4 w-[300px] max-w-[calc(100vw-2.5rem)]',
            'origin-bottom-right overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800',
            'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl',
            'transition-all duration-300 ease-out',
            open ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-3 scale-95 pointer-events-none',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                Butuh Bantuan?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih cara menghubungi kami
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 -m-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup menu bantuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 py-2">
            {options.map((opt) => (
              <a
                key={opt.title}
                href={opt.href}
                {...(opt.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                  <opt.icon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{opt.title}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">{opt.subtitle}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Tutup menu bantuan' : 'Butuh Bantuan?'}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls="support-fab-panel"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#1A6B47] text-white transition-all hover:bg-[#15803D] hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A6B47] focus-visible:ring-offset-2 shadow-[0_10px_25px_-5px_rgba(26,107,71,0.4)] cursor-pointer"
        >
          <span
            className="relative flex items-center justify-center"
            style={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <MessageCircle
              className="w-6 h-6"
              aria-hidden="true"
              style={{
                opacity: open ? 0 : 1,
                transform: open ? 'scale(0.4) rotate(-90deg)' : 'scale(1)',
                transition: 'opacity 0.15s ease, transform 0.25s ease',
              }}
            />
            <X
              className="absolute w-6 h-6"
              aria-hidden="true"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'scale(1)' : 'scale(0.4) rotate(90deg)',
                transition: 'opacity 0.15s ease 0.05s, transform 0.25s ease 0.05s',
              }}
            />
          </span>
        </button>
      </div>
    </div>
  )
}

export default SupportFab
