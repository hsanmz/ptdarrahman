'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/app/lib/motion'
import type { AboutContentData } from '@/app/lib/types'

interface StatItem {
  value: number
  suffix: string
  label: string
}

const DEFAULT_STATS: StatItem[] = [
  { value: 350, suffix: '+', label: 'Santri Aktif' },
  { value: 40, suffix: '+', label: 'Guru & Staff' },
  { value: 30, suffix: ' Juz', label: 'Hafalan Al-Quran' },
  { value: 15, suffix: '+', label: 'Ekstrakurikuler' },
]

function AnimatedCounter({ target, suffix, isVisible }: { target: number; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? target : 0))
  const countRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(target)
      return
    }

    if (!isVisible) return

    const startTime = performance.now()
    const duration = 1800 // 1.8s

    let animFrame: number

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Ease out quad
      const eased = 1 - Math.pow(1 - progress, 2)
      const current = Math.round(eased * target)

      if (countRef.current !== current) {
        countRef.current = current
        setCount(current)
      }

      if (progress < 1) {
        animFrame = requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    animFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animFrame)
  }, [target, isVisible])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

export default function StatsSection({ content = null }: { settings?: Record<string, string>; content?: AboutContentData | null }) {
  const rootRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const parsedStats: StatItem[] = Array.from({ length: 4 }, (_, index) => {
    const position = index + 1
    const rawValue = content?.[`stat_${position}_value`]
    const rawLabel = content?.[`stat_${position}_label`]
    const value = rawValue === undefined || rawValue === '' ? Number.NaN : Number(rawValue)
    if (!Number.isFinite(value) || typeof rawLabel !== 'string' || !rawLabel.trim()) return null
    return {
      value,
      suffix: String(content?.[`stat_${position}_suffix`] ?? ''),
      label: rawLabel,
    }
  }).filter((stat): stat is StatItem => stat !== null)

  const displayStats = parsedStats.length > 0 ? parsedStats : DEFAULT_STATS

  useEffect(() => {
    const el = rootRef.current
    if (!el) {
      setIsVisible(true)
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={rootRef} className="py-16 sm:py-20 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayStats.map((s) => (
            <div
              key={s.label}
              data-card
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 text-center shadow-xs transition-all duration-300 hover:shadow-md hover:border-[var(--accent)]/30"
            >
              <p className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--accent)] tracking-tight">
                <AnimatedCounter target={s.value} suffix={s.suffix} isVisible={isVisible} />
              </p>
              <p className="mt-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
