import type { Metadata } from 'next'
import { headers } from 'next/headers'
import PpdbClientView from './PpdbClientView'
import { fetchActivePpdbWave } from '@/app/lib/ppdb'
import { getPublicSettings } from '@/app/lib/server-settings'
import { getPpdbContentRows } from '@/app/lib/api'
import { resolvePortalUrl } from '@repo/ui'

export const metadata: Metadata = {
  title: 'Penerimaan Santri Baru (PPDB) | PTDARRAHMAN',
  description:
    "Penerimaan Peserta Didik Baru (PPDB) Pesantren Tahfidz Qur'an dan Digital Ar-Rahman. Memadukan hafalan Al-Qur'an mutqin 30 juz bersanad dengan keahlian rekayasa teknologi digital modern di Bekasi, Jawa Barat.",
  openGraph: {
    title: "PPDB Santri Baru | Pesantren Tahfidz Qur'an dan Digital Ar-Rahman",
    description:
      "Daftar PPDB santri baru PTDARRAHMAN. Informasi kuota real-time, kurikulum tahfidz 30 juz, rekayasa web & IoT, serta tahapan seleksi terpadu.",
    images: [
      {
        url: 'https://res.cloudinary.com/dunynusuh/image/upload/v1771353749/82ed87dd-4f99-46ca-b481-775f19b6b7c9.png',
        width: 512,
        height: 512,
        alt: 'Logo Pesantren Tahfidz Qur’an dan Digital Ar-Rahman',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "PPDB Santri Baru | PTDARRAHMAN",
    description:
      "Penerimaan Santri Baru Pesantren Tahfidz Qur'an dan Digital Ar-Rahman. Hafalan 30 Juz Bersanad & Ahli Teknologi Digital.",
    images: [
      'https://res.cloudinary.com/dunynusuh/image/upload/v1771353749/82ed87dd-4f99-46ca-b481-775f19b6b7c9.png',
    ],
  },
}

export default async function PPDBPage() {
  const [wave, settings, ppdbRows] = await Promise.all([
    fetchActivePpdbWave().catch(() => null),
    getPublicSettings().catch(() => ({} as Record<string, string>)),
    getPpdbContentRows().catch(() => []),
  ])

  const portalUrl = resolvePortalUrl(process.env.NEXT_PUBLIC_PORTAL_URL)

  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '') : ''
  if (!siteUrl) {
    try {
      const h = await headers()
      const host = h.get('x-forwarded-host') || h.get('host')
      const isLocalOrIp = host && (/^localhost(:\d+)?$/i.test(host) || /^(?:\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(host))
      const proto = h.get('x-forwarded-proto') || (isLocalOrIp ? 'http' : 'https')
      if (host) siteUrl = `${proto}://${host}`
    } catch {}
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: "Pesantren Tahfidz Qur'an dan Digital Ar-Rahman",
    alternateName: 'PTDARRAHMAN',
    url: siteUrl ? `${siteUrl}/ppdb` : '/ppdb',
    description:
      "Pesantren putra terpadu yang memadukan hafalan Al-Qur'an 30 juz bersanad dengan pendidikan teknologi digital modern.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bekasi',
      addressRegion: 'Jawa Barat',
      addressCountry: 'ID',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PpdbClientView
        wave={wave}
        settings={settings}
        portalUrl={portalUrl}
        ppdbRows={ppdbRows as any[]}
      />
    </>
  )
}
