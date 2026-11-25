'use client'

import { useEffect, useRef } from 'react'
import * as api from '@/app/lib/api'
import { eventBus } from '@/app/lib/event-bus'

export function useSSE(module: string) {
  const reconnectRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const maxReconnect = 5
    let es: EventSource | null = null

    function connect() {
      const apiBase = (api.getApiBase?.() ?? api.API_BASE).replace(/\/+$/, '')
      const url = `${apiBase}/companyprofile/events`
      es = new EventSource(url)

      const handler = () => {
        // Koneksi hidup → reset penghitung reconnect agar EventSource tidak
        // "mati permanen" hanya karena beberapa kali gagal sementara.
        reconnectRef.current = 0
        eventBus.emit(`${module}:refresh`)
      }

      es.addEventListener('change', handler)

      es.onerror = () => {
        // Tutup dulu sebelum reconnect, jangan biarkan koneksi gantung.
        es?.close()

        if (reconnectRef.current >= maxReconnect) return

        reconnectRef.current++
        timerRef.current = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      es?.close()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [module])
}
