'use client'

import { type ReactNode, useEffect } from 'react'
import { useBrand } from '@repo/ui'
import { getApiBase } from '@/app/lib/api'

export function Providers({ children }: { children: ReactNode }) {
  const { faviconUrl } = useBrand(getApiBase?.() ?? '')

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (faviconUrl && link) {
      link.href = faviconUrl
      link.type = ''
    }
  }, [faviconUrl])

  return <>{children}</>
}
