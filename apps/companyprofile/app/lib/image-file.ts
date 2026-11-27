/**
 * Aturan unggah gambar yang dipakai bersama oleh form admin dan utilitas
 * resolusi gambar publik di seluruh Company Profile.
 */

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024 // 10 MB — samakan dengan uploads.py
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',')
export const IMAGE_URL_MAX_LENGTH = 255

/** Koleksi gambar fallback berkualitas tinggi resmi bertema Pesantren Tahfidz & Digital */
export const FALLBACK_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop',
  about: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
  program: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
  facility: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=1200&auto=format&fit=crop',
  news: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop',
  achievement: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
  gallery: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
  staff: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  testimonial: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
} as const

export const PROGRAM_FALLBACK_IMAGES: Record<string, string> = {
  'tahfidz-al-quran': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
  'tahfidz': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
  'teknologi-digital': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
  'digital': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
  bilingual: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
  'akademi-kepemimpinan': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop',
  leadership: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop',
  'dirasah-islamiyah': 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop',
}

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'image/x-webp': 'image/webp',
}

function inferImageMimeFromName(name: string): string {
  const lower = name.trim().toLowerCase()
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.jfif')) return 'image/jpeg'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return ''
}

/** Validasi file sebelum dikirim ke `/companyprofile/upload`. */
export function validateImageFile(file: File): string | null {
  if (!file) return 'Pilih file gambar terlebih dahulu.'
  if (!file.size) return 'File gambar kosong atau tidak valid.'

  const rawType = (file.type || '').split(';')[0].trim().toLowerCase()
  const normalizedType = MIME_ALIASES[rawType] || rawType || inferImageMimeFromName(file.name || '')

  if (!IMAGE_TYPES.includes(normalizedType as (typeof IMAGE_TYPES)[number])) {
    return 'Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return `Ukuran gambar terlalu besar (${formatFileSize(file.size)}). Maksimal 10 MB.`
  }
  return null
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Kompresi dan konversi file gambar ke format `.webp` secara client-side.
 * Otomatis mempertahankan format file asli jika:
 * - Sudah berekstensi/tipe .webp
 * - Icon/Favicon (.ico)
 * - GIF animasi (.gif)
 * - Bukan di browser environment atau canvas tidak tersedia
 */
export async function convertToWebP(file: File, quality = 0.85): Promise<File> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return file
  if (!file || !file.size) return file

  const type = (file.type || '').split(';')[0].trim().toLowerCase()
  const name = (file.name || '').trim().toLowerCase()

  // Lewati file yang sudah WebP, ICO/Favicon, atau GIF
  if (type === 'image/webp' || name.endsWith('.webp')) return file
  if (type.includes('icon') || name.endsWith('.ico')) return file
  if (type === 'image/gif' || name.endsWith('.gif')) return file

  try {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk konversi WebP'))
      img.src = objectUrl
    })

    // Batasi dimensi maksimum jika foto sangat besar (misal kamera HP 4K/8K)
    let width = img.naturalWidth || img.width
    let height = img.naturalHeight || img.height
    const maxDimension = 2048
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width)
        width = maxDimension
      } else {
        width = Math.round((width * maxDimension) / height)
        height = maxDimension
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, width)
    canvas.height = Math.max(1, height)
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      URL.revokeObjectURL(objectUrl)
      return file
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(objectUrl)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', quality)
    })

    if (!blob) return file

    const baseName = file.name.replace(/\.[^/.]+$/, '')
    const newFileName = `${baseName || 'image'}.webp`

    return new File([blob], newFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } catch {
    // Jika canvas atau kompresi gagal di environment tertentu (misal JSDOM test), fallback aman ke file asli
    return file
  }
}

/**
 * URL gambar boleh absolut (http/https) atau path unggahan lokal (`/uploads/...`).
 */
export function validateImageUrl(value: string): string | null {
  const url = value.trim()
  if (!url) return null

  if (url.length > IMAGE_URL_MAX_LENGTH) {
    return `URL gambar maksimal ${IMAGE_URL_MAX_LENGTH} karakter.`
  }

  if (url.startsWith('/') && !url.startsWith('//')) return null

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'URL gambar harus diawali http:// atau https://.'
    }
    return null
  } catch {
    return 'URL gambar tidak valid.'
  }
}

export const PENGURUS_CDN: Record<string, string> = {
  'ahmad-mahfud': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763710/ptdarrahman/pengurus_ahmad-mahfud.webp',
  'chandra-sari': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763711/ptdarrahman/pengurus_chandra-sari.webp',
  'dahniar': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763712/ptdarrahman/pengurus_dahniar.webp',
  'dewi-nareswari': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763713/ptdarrahman/pengurus_dewi-nareswari.webp',
  'eko-santoso': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763715/ptdarrahman/pengurus_eko-santoso.webp',
  'fathya-irsalina': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763716/ptdarrahman/pengurus_fathya-irsalina.webp',
  'indra-setiawan': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763717/ptdarrahman/pengurus_indra-setiawan.webp',
  'leo-latul': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763717/ptdarrahman/pengurus_leo-latul.webp',
  'mira-susanti': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763718/ptdarrahman/pengurus_mira-susanti.webp',
  'noor-kartika': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763720/ptdarrahman/pengurus_noor-kartika.webp',
  'rachmania-kurniawati': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763721/ptdarrahman/pengurus_rachmania-kurniawati.webp',
  'rini-widiastuti': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763722/ptdarrahman/pengurus_rini-widiastuti.webp',
  'ruswandri': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763723/ptdarrahman/pengurus_ruswandri.webp',
  'silvi-laeli': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763724/ptdarrahman/pengurus_silvi-laeli.webp',
  'susilawati': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763725/ptdarrahman/pengurus_susilawati.webp',
  'ustd-ahmad': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763726/ptdarrahman/pengurus_ustd-ahmad.webp',
  'ustd-ziyad': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763727/ptdarrahman/pengurus_ustd-ziyad.webp',
}

export const NEWS_CDN: Record<string, string> = {
  'seminar-kristologi': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763735/ptdarrahman/news_seminar-kristologi.jpg',
  'lomba-hut-ri-80': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763729/ptdarrahman/news_lomba-hut-ri-80.jpg',
  'upacara-hut-ri-80': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763738/ptdarrahman/news_upacara-hut-ri-80.jpg',
  'porseni-pontren-2025': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763730/ptdarrahman/news_porseni-pontren-2025.jpg',
  'sharing-session-gojek': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763736/ptdarrahman/news_sharing-session-gojek.jpg',
  'ramadhan-gotong-royong': 'https://res.cloudinary.com/dfwutfkbn/image/upload/v1795763733/ptdarrahman/news_ramadhan-gotong-royong.png',
}

/**
 * Optimalkan URL Cloudinary dengan menyuntikkan transformasi format & kompresi otomatis (f_auto,q_auto).
 * Cloudinary CDN akan otomatis mengonversi ke WebP/AVIF modern dan merampingkan ukuran gambar
 * 70%–90% lebih kecil tanpa membebani CPU atau RAM server kita sama sekali.
 */
export function optimizeCloudinaryUrl(url: string, maxWidth = 1200): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  if (url.includes('/f_auto') || url.includes('/q_auto')) return url

  const uploadSegment = '/image/upload/'
  const uploadIdx = url.indexOf(uploadSegment)
  if (uploadIdx === -1) return url

  const before = url.slice(0, uploadIdx + uploadSegment.length)
  const after = url.slice(uploadIdx + uploadSegment.length)

  return `${before}f_auto,q_auto,c_limit,w_${maxWidth}/${after}`
}

/**
 * Normalisasi dan resolusi URL gambar untuk seluruh aplikasi Company Profile.
 * Menangani path relatif, domain nonaktif (arrahmanic.org), migrasi Cloudinary CDN, dan localhost mismatch.
 */
export function resolveImageSrc(value: string | null | undefined, apiBase = ''): string {
  const src = (value ?? '').trim()
  if (!src || src === 'null' || src === 'undefined') return ''

  // Resolusi path lokal /images/pengurus/ ke Cloudinary CDN
  if (src.includes('/images/pengurus/')) {
    for (const [key, cdnUrl] of Object.entries(PENGURUS_CDN)) {
      if (src.includes(key)) return optimizeCloudinaryUrl(cdnUrl)
    }
  }

  // Resolusi path lokal /images/news/ ke Cloudinary CDN
  if (src.includes('/images/news/')) {
    for (const [key, cdnUrl] of Object.entries(NEWS_CDN)) {
      if (src.includes(key)) return optimizeCloudinaryUrl(cdnUrl)
    }
  }

  // Petakan domain lama arrahmanic.org / webbackend.arrahmanic.org ke Cloudinary CDN
  if (src.includes('arrahmanic.org')) {
    // Berita
    if (src.includes('t8idWMDX2JDprjytRu9tCET1vAMlOpds88w1PzTx')) return optimizeCloudinaryUrl(NEWS_CDN['seminar-kristologi'])
    if (src.includes('BezTw4HF4lyumoRlvhj8fXNPTlGYCmy3U59ymwP1')) return optimizeCloudinaryUrl(NEWS_CDN['lomba-hut-ri-80'])
    if (src.includes('ATZokVGOucW8UiBgBRDOTanvHK13qY0jrHzRhsrQ')) return optimizeCloudinaryUrl(NEWS_CDN['upacara-hut-ri-80'])
    if (src.includes('wt1ZWCPtapJxmpARdm9QifHpC0c8lynN6UESaV97')) return optimizeCloudinaryUrl(NEWS_CDN['porseni-pontren-2025'])
    if (src.includes('FOTesK9LtJ3rG9UjZRpyFFTRaokHNVrRmS2UGWt8')) return optimizeCloudinaryUrl(NEWS_CDN['sharing-session-gojek'])
    if (src.includes('MUdyERwyKU5FmT5tP0O7p1b6EA0yrAbPZWBK883k')) return optimizeCloudinaryUrl(NEWS_CDN['ramadhan-gotong-royong'])

    // Pengurus Yayasan & Manajemen Lembaga
    const lower = decodeURIComponent(src).toLowerCase()
    if (lower.includes('indra setiawan')) return optimizeCloudinaryUrl(PENGURUS_CDN['indra-setiawan'])
    if (lower.includes('rini widiastuti')) return optimizeCloudinaryUrl(PENGURUS_CDN['rini-widiastuti'])
    if (lower.includes('eko')) return optimizeCloudinaryUrl(PENGURUS_CDN['eko-santoso'])
    if (lower.includes('chandra')) return optimizeCloudinaryUrl(PENGURUS_CDN['chandra-sari'])
    if (lower.includes('noor')) return optimizeCloudinaryUrl(PENGURUS_CDN['noor-kartika'])
    if (lower.includes('rachmania')) return optimizeCloudinaryUrl(PENGURUS_CDN['rachmania-kurniawati'])
    if (lower.includes('fathya')) return optimizeCloudinaryUrl(PENGURUS_CDN['fathya-irsalina'])
    if (lower.includes('mira')) return optimizeCloudinaryUrl(PENGURUS_CDN['mira-susanti'])
    if (lower.includes('leo')) return optimizeCloudinaryUrl(PENGURUS_CDN['leo-latul'])
    if (lower.includes('mahfud')) return optimizeCloudinaryUrl(PENGURUS_CDN['ahmad-mahfud'])
    if (lower.includes('dewi')) return optimizeCloudinaryUrl(PENGURUS_CDN['dewi-nareswari'])
    if (lower.includes('niar') || lower.includes('dahniar')) return optimizeCloudinaryUrl(PENGURUS_CDN['dahniar'])
    if (lower.includes('ruswandri')) return optimizeCloudinaryUrl(PENGURUS_CDN['ruswandri'])
    if (lower.includes('silvi')) return optimizeCloudinaryUrl(PENGURUS_CDN['silvi-laeli'])
    if (lower.includes('ziyad')) return optimizeCloudinaryUrl(PENGURUS_CDN['ustd-ziyad'])
    if (lower.includes('ahmad')) return optimizeCloudinaryUrl(PENGURUS_CDN['ustd-ahmad'])
    if (lower.includes('susi') || lower.includes('susilawati')) return optimizeCloudinaryUrl(PENGURUS_CDN['susilawati'])

    if (src.includes('news') || src.includes('berita')) {
      return optimizeCloudinaryUrl(NEWS_CDN['seminar-kristologi'])
    }
    if (src.includes('staff') || src.includes('guru') || src.includes('ustadz')) {
      return optimizeCloudinaryUrl(PENGURUS_CDN['ustd-ziyad'])
    }
    return ''
  }

  // Normalisasi URL /uploads/... dari host manapun (localhost, IP server, atau path relatif)
  let normalized = src
  if (normalized.startsWith('uploads/')) {
    normalized = `/${normalized}`
  }
  const uploadsIdx = normalized.indexOf('/uploads/')
  if (uploadsIdx !== -1) {
    const uploadPath = normalized.slice(uploadsIdx)
    const cleanBase = apiBase.trim().replace(/\/+$/, '')
    return cleanBase ? `${cleanBase}${uploadPath}` : uploadPath
  }

  return optimizeCloudinaryUrl(src)
}

/** Ambil URL gambar aman dengan fallback otomatis per kategori jika nilai kosong atau gagal */
export function getSafeImageSrc(
  value: string | null | undefined,
  category: keyof typeof FALLBACK_IMAGES = 'about',
  apiBase = ''
): string {
  const resolved = resolveImageSrc(value, apiBase)
  return resolved || FALLBACK_IMAGES[category]
}

/** Handler onError standar untuk elemen <img> agar beralih mulus ke gambar fallback */
export function handleImageFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string
): void {
  const target = event.currentTarget
  if (target && target.src !== fallbackSrc) {
    target.src = fallbackSrc
  }
}

/**
 * Pratinjau lokal via Object URL.
 */
export function createObjectPreviewUrl(file: File): string {
  try {
    if (typeof URL.createObjectURL !== 'function') return ''
    return URL.createObjectURL(file)
  } catch {
    return ''
  }
}

/** Lepas pratinjau Object URL. */
export function disposeObjectPreviewUrl(url: string): void {
  if (!url) return
  try {
    if (typeof URL.revokeObjectURL !== 'function') return
    URL.revokeObjectURL(url)
  } catch {
    // Buang diam-diam
  }
}
