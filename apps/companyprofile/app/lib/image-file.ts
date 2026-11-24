/**
 * Aturan unggah gambar yang dipakai bersama oleh form admin.
 *
 * Nilai di sini sengaja mencerminkan `apps/api/src/core/uploads.py` supaya
 * admin melihat batas yang sama dengan yang ditegakkan backend:
 * JPEG/PNG/WebP/GIF, maksimal 10 MB, dan URL kolom `image` selebar 255 karakter.
 */

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024 // 10 MB — samakan dengan uploads.py
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',')
export const IMAGE_URL_MAX_LENGTH = 255

/** Validasi file sebelum dikirim ke `/companyprofile/upload`. */
export function validateImageFile(file: File): string | null {
  if (!file) return 'Pilih file gambar terlebih dahulu.'
  if (!file.size) return 'File gambar kosong atau tidak valid.'

  if (!IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number])) {
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
 * URL gambar boleh absolut (http/https) atau path unggahan lokal (`/uploads/...`).
 * Path relatif diterima karena `UPLOAD_PROVIDER=local|db` mengembalikan URL
 * seperti itu, dan data lama mungkin sudah memakainya.
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

/**
 * Gambar `/uploads/...` disajikan oleh API, bukan origin frontend. Untuk
 * pratinjau admin, path tersebut perlu diarahkan ke API agar tidak 404.
 * Nilai yang disimpan tetap apa adanya.
 */
export function resolveImageSrc(value: string, apiBase: string): string {
  const src = (value ?? '').trim()
  if (!src) return ''

  // Ganti domain lama webbackend.arrahmanic.org yang sudah tidak aktif dengan foto Unsplash relevan
  if (src.includes('webbackend.arrahmanic.org')) {
    if (src.includes('t8idWMDX2JDprjytRu9tCET1vAMlOpds88w1PzTx')) {
      return 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop'
    }
    if (src.includes('ATZokVGOucW8UiBgBRDOTanvHK13qY0jrHzRhsrQ')) {
      return 'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1200&auto=format&fit=crop'
    }
    if (src.includes('BezTw4HF4lyumoRlvhj8fXNPTlGYCmy3U59ymwP1')) {
      return 'https://images.unsplash.com/photo-1576767475305-ce65f5cbb67e?q=80&w=1200&auto=format&fit=crop'
    }
    if (src.includes('FOTesK9LtJ3rG9UjZRpyFFTRaokHNVrRmS2UGWt8')) {
      return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop'
    }
    if (src.includes('wt1ZWCPtapJxmpARdm9QifHpC0c8lynN6UESaV97')) {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop'
    }
    if (src.includes('MUdyERwyKU5FmT5tP0O7p1b6EA0yrAbPZWBK883k')) {
      return 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop'
    }
    return 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop'
  }

  if (src.startsWith('/') && !src.startsWith('//')) {
    return `${apiBase.replace(/\/+$/, '')}${src}`
  }
  return src
}

/**
 * Pratinjau lokal via Object URL — fitur standar browser, tetapi TIDAK ada di
 * jsdom. Bila API tidak tersedia, kembalikan string kosong supaya form tetap
 * berfungsi (berkas tetap terunggah; hanya pratinjau instan yang tidak tampil)
 * daripada melempar error saat admin memilih berkas.
 */
export function createObjectPreviewUrl(file: File): string {
  try {
    if (typeof URL.createObjectURL !== 'function') return ''
    return URL.createObjectURL(file)
  } catch {
    return ''
  }
}

/** Lepas pratinjau Object URL — aman dipanggil untuk string kosong/jadul. */
export function disposeObjectPreviewUrl(url: string): void {
  if (!url) return
  try {
    if (typeof URL.revokeObjectURL !== 'function') return
    URL.revokeObjectURL(url)
  } catch {
    // Buang diam-diam: pembersihan tidak boleh mengganggu form.
  }
}
