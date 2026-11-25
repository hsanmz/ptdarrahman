import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyToClipboard } from './utils'

describe('copyToClipboard', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand')

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard)
    } else {
      delete (navigator as { clipboard?: unknown }).clipboard
    }
    if (originalExecCommand) {
      Object.defineProperty(document, 'execCommand', originalExecCommand)
    } else {
      delete (document as { execCommand?: unknown }).execCommand
    }
  })

  it('uses navigator.clipboard.writeText when available in secure context', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    await expect(copyToClipboard('rahasia123')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('rahasia123')
  })

  it('falls back to document.execCommand when navigator.clipboard is undefined (HTTP IP)', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    })

    await expect(copyToClipboard('secret-http')).resolves.toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
  })

  it('falls back to execCommand when navigator.clipboard.writeText rejects', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) },
    })
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    })

    await expect(copyToClipboard('fallback-ok')).resolves.toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
  })

  it('returns false when text is empty', async () => {
    await expect(copyToClipboard('')).resolves.toBe(false)
  })
})
