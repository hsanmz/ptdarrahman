'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Matikan pemulihan scroll otomatis bawaan browser yang sering memaksa scroll ke footer
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Jika tidak ada hash di URL, pastikan viewport selalu berada di paling atas
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      // Jalankan ulang pada frame berikutnya untuk menangani late layout shift saat gambar dimuat
      requestAnimationFrame(() => {
        if (!window.location.hash && window.scrollY > 0) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        }
      })
    }
  }, [pathname])

  return null
}
