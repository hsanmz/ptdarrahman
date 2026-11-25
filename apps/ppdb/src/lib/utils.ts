import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Copy text safely in both HTTPS (navigator.clipboard) and plain-HTTP IP origins.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to legacy execCommand copy on restricted contexts
  }

  if (typeof document === 'undefined' || !document.body) return false

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)

  try {
    textarea.focus()
    textarea.select()
    return typeof document.execCommand === 'function'
      ? document.execCommand('copy')
      : false
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}
