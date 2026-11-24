/**
 * Utility untuk resolusi URL dan Host/Origin dinamis across monorepo
 * (Company Profile, PPDB Portal, Superadmin).
 *
 * Mencegah hardcode static domain (misal ptdarrahman.sch.id).
 * Menyesuaikan otomatis jika dibuka via:
 * 1. IP VPS / Local LAN (misal: 103.55.37.77:3000, 103.55.37.77:5174, 103.55.37.77:5173)
 * 2. Localhost dev (localhost:3000, localhost:5174, localhost:5173)
 * 3. Custom domain via port (misal: youtsasf.xyz:3000, youtsasf.xyz:5174, youtsasf.xyz:5173)
 * 4. Custom domain atau domain resmi via subdomain reverse proxy (misal: youtsasf.xyz, ppdb.youtsasf.xyz, admin.youtsasf.xyz)
 */

export function isIpAddress(hostname: string): boolean {
  if (!hostname) return false
  // IPv4: 4 blok angka 0-255 dipisah titik
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return true
  // IPv6: mengandung setidaknya 2 titik dua atau dibungkus bracket
  if (hostname.includes(':') && (hostname.split(':').length >= 3 || /^\[?[a-fA-F0-9:]+\]?$/.test(hostname))) return true
  return false
}

export function isLocalOrIp(hostname: string): boolean {
  if (!hostname) return false
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || isIpAddress(hostname)
}

/**
 * Base URL situs publik (company profile), untuk action "Lihat Situs" di dashboard
 * atau navigasi antar-modul.
 */
export function resolveCompanyProfileUrl(configured?: string): string {
  if (configured) return configured.replace(/\/+$/, '')

  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location
    if (isLocalOrIp(hostname)) {
      return `${protocol}//${hostname}:3000`
    }
    const rootHost = hostname.replace(/^(?:ppdb|superadmin|admin|portal|www)\./i, '')
    // Topologi IP/port atau custom domain port
    if (port === '3000' || port === '5173' || port === '5174') {
      return `${protocol}//${rootHost}:3000`
    }
    const portPart = port && port !== '80' && port !== '443' ? `:${port}` : ''
    return `${protocol}//${rootHost}${portPart}`
  }

  return 'http://localhost:3000'
}

/**
 * Dynamic PPDB portal URL resolver based on current active domain/host.
 */
export function resolvePortalUrl(configured?: string): string {
  if (configured) return configured.replace(/\/+$/, '')

  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location
    if (isLocalOrIp(hostname)) {
      return `${protocol}//${hostname}:5174`
    }
    const rootHost = hostname.replace(/^(?:ppdb|superadmin|admin|portal|www)\./i, '')
    // Topologi port mandiri
    if (port === '3000' || port === '5173' || port === '5174') {
      return `${protocol}//${rootHost}:5174`
    }
    if (/^ppdb\./i.test(hostname)) {
      const portPart = port && port !== '80' && port !== '443' ? `:${port}` : ''
      return `${protocol}//${hostname}${portPart}`
    }
    const portPart = port && port !== '80' && port !== '443' ? `:${port}` : ''
    return `${protocol}//ppdb.${rootHost}${portPart}`
  }

  return 'http://localhost:5174'
}

/**
 * Dynamic Superadmin panel URL resolver based on current active domain/host.
 */
export function resolveSuperadminUrl(configured?: string): string {
  if (configured) return configured.replace(/\/+$/, '')

  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location
    if (isLocalOrIp(hostname)) {
      return `${protocol}//${hostname}:5173`
    }
    const rootHost = hostname.replace(/^(?:ppdb|superadmin|admin|portal|www)\./i, '')
    // Topologi port mandiri
    if (port === '3000' || port === '5173' || port === '5174') {
      return `${protocol}//${rootHost}:5173`
    }
    if (/^(?:superadmin|admin)\./i.test(hostname)) {
      const portPart = port && port !== '80' && port !== '443' ? `:${port}` : ''
      return `${protocol}//${hostname}${portPart}`
    }
    const portPart = port && port !== '80' && port !== '443' ? `:${port}` : ''
    return `${protocol}//admin.${rootHost}${portPart}`
  }

  return 'http://localhost:5173'
}

/**
 * Ambil host aktif (misal: 'localhost:5174', '103.55.37.77:5174', 'ppdb.youtsasf.xyz')
 */
export function resolveActiveHost(fallback: string = 'localhost:5174'): string {
  if (typeof window !== 'undefined' && window.location.host) {
    return window.location.host
  }
  return fallback
}

/**
 * Ambil origin aktif (misal: 'http://localhost:5174', 'http://103.55.37.77:5174', 'https://youtsasf.xyz')
 */
export function resolveActiveOrigin(fallback: string = 'http://localhost:5174'): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }
  return fallback
}
