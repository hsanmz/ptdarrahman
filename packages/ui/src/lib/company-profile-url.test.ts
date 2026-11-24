import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  isIpAddress,
  isLocalOrIp,
  resolveCompanyProfileUrl,
  resolvePortalUrl,
  resolveSuperadminUrl,
  resolveActiveHost,
  resolveActiveOrigin,
} from './company-profile-url'

describe('company-profile-url utils', () => {
  const originalWindow = (globalThis as any).window

  afterEach(() => {
    if (originalWindow !== undefined) {
      ;(globalThis as any).window = originalWindow
    } else {
      delete (globalThis as any).window
    }
  })

  function mockLocation(protocol: string, hostname: string, port: string) {
    const host = port ? `${hostname}:${port}` : hostname
    const origin = `${protocol}//${host}`
    ;(globalThis as any).window = {
      location: {
        protocol,
        hostname,
        port,
        host,
        origin,
        search: '',
        pathname: '/',
      },
    }
  }

  describe('isIpAddress & isLocalOrIp', () => {
    it('detects IPv4 addresses', () => {
      expect(isIpAddress('103.55.37.77')).toBe(true)
      expect(isIpAddress('192.168.1.1')).toBe(true)
      expect(isIpAddress('127.0.0.1')).toBe(true)
      expect(isIpAddress('localhost')).toBe(false)
      expect(isIpAddress('ptdarrahman.sch.id')).toBe(false)
      expect(isIpAddress('youtsasf.xyz')).toBe(false)
    })

    it('detects IPv6 addresses', () => {
      expect(isIpAddress('::1')).toBe(true)
      expect(isIpAddress('2001:db8::1')).toBe(true)
    })

    it('detects local or IP hosts', () => {
      expect(isLocalOrIp('localhost')).toBe(true)
      expect(isLocalOrIp('127.0.0.1')).toBe(true)
      expect(isLocalOrIp('103.55.37.77')).toBe(true)
      expect(isLocalOrIp('youtsasf.xyz')).toBe(false)
    })
  })

  describe('Fallback when window is undefined', () => {
    it('returns default fallback URLs when window is not defined', () => {
      delete (globalThis as any).window
      expect(resolveCompanyProfileUrl()).toBe('http://localhost:3000')
      expect(resolvePortalUrl()).toBe('http://localhost:5174')
      expect(resolveSuperadminUrl()).toBe('http://localhost:5173')
      expect(resolveActiveHost('fallback.host')).toBe('fallback.host')
      expect(resolveActiveOrigin('http://fallback.origin')).toBe('http://fallback.origin')
    })
  })

  describe('IP & Port based topology (e.g. VPS IDCloudHost IP)', () => {
    it('resolves URLs dynamically when opened on IP address', () => {
      mockLocation('http:', '103.55.37.77', '5174') // User opens PPDB
      expect(resolveCompanyProfileUrl()).toBe('http://103.55.37.77:3000')
      expect(resolvePortalUrl()).toBe('http://103.55.37.77:5174')
      expect(resolveSuperadminUrl()).toBe('http://103.55.37.77:5173')
      expect(resolveActiveHost()).toBe('103.55.37.77:5174')
      expect(resolveActiveOrigin()).toBe('http://103.55.37.77:5174')
    })

    it('resolves URLs dynamically when opened on Company Profile via IP', () => {
      mockLocation('http:', '103.55.37.77', '3000') // User opens Company Profile
      expect(resolveCompanyProfileUrl()).toBe('http://103.55.37.77:3000')
      expect(resolvePortalUrl()).toBe('http://103.55.37.77:5174')
      expect(resolveSuperadminUrl()).toBe('http://103.55.37.77:5173')
    })
  })

  describe('Custom domain on ports (e.g. youtsasf.xyz:3000)', () => {
    it('adapts across ports for custom domain', () => {
      mockLocation('http:', 'youtsasf.xyz', '3000')
      expect(resolveCompanyProfileUrl()).toBe('http://youtsasf.xyz:3000')
      expect(resolvePortalUrl()).toBe('http://youtsasf.xyz:5174')
      expect(resolveSuperadminUrl()).toBe('http://youtsasf.xyz:5173')
    })
  })

  describe('Custom domain with subdomains (e.g. youtsasf.xyz, ppdb.youtsasf.xyz)', () => {
    it('resolves subdomains dynamically for custom domains', () => {
      mockLocation('https:', 'ppdb.youtsasf.xyz', '')
      expect(resolveCompanyProfileUrl()).toBe('https://youtsasf.xyz')
      expect(resolvePortalUrl()).toBe('https://ppdb.youtsasf.xyz')
      expect(resolveSuperadminUrl()).toBe('https://admin.youtsasf.xyz')
      expect(resolveActiveHost()).toBe('ppdb.youtsasf.xyz')
      expect(resolveActiveOrigin()).toBe('https://ppdb.youtsasf.xyz')
    })

    it('resolves from root custom domain to portal subdomain', () => {
      mockLocation('https:', 'youtsasf.xyz', '')
      expect(resolveCompanyProfileUrl()).toBe('https://youtsasf.xyz')
      expect(resolvePortalUrl()).toBe('https://ppdb.youtsasf.xyz')
      expect(resolveSuperadminUrl()).toBe('https://admin.youtsasf.xyz')
    })
  })

  describe('Explicit configured URL parameter', () => {
    it('uses configured value when supplied', () => {
      mockLocation('http:', 'localhost', '3000')
      expect(resolvePortalUrl('https://custom-portal.com/')).toBe('https://custom-portal.com')
      expect(resolveCompanyProfileUrl('https://custom-cp.com/')).toBe('https://custom-cp.com')
    })
  })
})
