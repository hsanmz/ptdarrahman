import { apiFetch } from '@/api/client'

export interface FeeItemPublic {
  id: string
  name: string
  nominal: number
  description?: string | null
  order_index?: number
  discount_type?: 'nominal' | 'percent' | null
  discount_value?: number
  early_discount_type?: 'nominal' | 'percent' | null
  early_discount_value?: number
}

export interface PublicFeesResponse {
  active: boolean
  wave_id?: string
  wave_name?: string
  period_id?: string
  period_name?: string | null
  academic_year?: string | null
  form_fee: number
  minimum_dp: number
  early_discount_quota: number
  items: FeeItemPublic[]
}

export interface CalculatedFeeItem extends FeeItemPublic {
  regularDiscountAmount: number
  regularFinalPrice: number
  earlyDiscountAmount: number
  earlyFinalPrice: number
}

export interface FeesSummary {
  formFee: number
  minimumDp: number
  totalOriginal: number
  totalRegularDiscount: number
  totalRegularFinal: number
  totalEarlyDiscount: number
  totalEarlyFinal: number
  items: CalculatedFeeItem[]
  earlyDiscountQuota: number
  waveName: string
  academicYear: string
  active: boolean
}

export const FALLBACK_FEES_SUMMARY: FeesSummary = {
  formFee: 350000,
  minimumDp: 5000000,
  totalOriginal: 25000000,
  totalRegularDiscount: 2000000,
  totalRegularFinal: 23000000,
  totalEarlyDiscount: 3500000,
  totalEarlyFinal: 21500000,
  earlyDiscountQuota: 10,
  waveName: 'Gelombang 1',
  academicYear: '2026/2027',
  active: true,
  items: [
    {
      id: 'item-1',
      name: 'Uang Pangkal',
      nominal: 15000000,
      description: 'Investasi sarana asrama modern, ranjang mukim santri, loker pribadi, fasilitas laboratorium programming & musholla.',
      discount_type: 'nominal',
      discount_value: 1500000,
      early_discount_type: 'nominal',
      early_discount_value: 2500000,
      regularDiscountAmount: 1500000,
      regularFinalPrice: 13500000,
      earlyDiscountAmount: 2500000,
      earlyFinalPrice: 12500000,
    },
    {
      id: 'item-2',
      name: 'Uang Kegiatan (per tahun)',
      nominal: 6000000,
      description: 'Mencakup seluruh kegiatan rihlah tahunan, ujian tasmi terbuka bil ghoib, kompetisi IT & olahraga, wisuda tahfidz, serta peringatan hari besar Islam.',
      discount_type: 'nominal',
      discount_value: 500000,
      early_discount_type: 'nominal',
      early_discount_value: 1000000,
      regularDiscountAmount: 500000,
      regularFinalPrice: 5500000,
      earlyDiscountAmount: 1000000,
      earlyFinalPrice: 5000000,
    },
    {
      id: 'item-3',
      name: 'Uang SPP',
      nominal: 2000000,
      description: 'Pendidikan terpadu tahfidz dan IT, makan bergizi 3x sehari, laundry pakaian santri, asuhan muhaffidz mukim, serta praktikum komputer intensif.',
      discount_type: null,
      discount_value: 0,
      early_discount_type: null,
      early_discount_value: 0,
      regularDiscountAmount: 0,
      regularFinalPrice: 2000000,
      earlyDiscountAmount: 0,
      earlyFinalPrice: 2000000,
    },
    {
      id: 'item-4',
      name: 'Uang Buku',
      nominal: 1000000,
      description: 'Paket mushaf tahfidz rasm utsmani standar pojok, modul pemrograman IT & rekayasa web, buku ajar dirosah islamiyah, dan kitab tajwid bersanad.',
      discount_type: null,
      discount_value: 0,
      early_discount_type: null,
      early_discount_value: 0,
      regularDiscountAmount: 0,
      regularFinalPrice: 1000000,
      earlyDiscountAmount: 0,
      earlyFinalPrice: 1000000,
    },
    {
      id: 'item-5',
      name: 'Uang Seragam',
      nominal: 1000000,
      description: 'Paket seragam lengkap santri: Gamis putih shalat, seragam batik resmi PTDARRAHMAN, seragam pramuka, kaos olahraga, dan jas santri resmi.',
      discount_type: null,
      discount_value: 0,
      early_discount_type: null,
      early_discount_value: 0,
      regularDiscountAmount: 0,
      regularFinalPrice: 1000000,
      earlyDiscountAmount: 0,
      earlyFinalPrice: 1000000,
    },
  ],
}

export function computeFeeItem(item: FeeItemPublic): CalculatedFeeItem {
  const nominal = Number(item.nominal) || 0

  // Regular discount
  let regularDiscount = 0
  if (item.discount_type === 'percent') {
    const pct = Number(item.discount_value) || 0
    regularDiscount = Math.round((nominal * pct) / 100)
  } else if (item.discount_type === 'nominal') {
    regularDiscount = Number(item.discount_value) || 0
  }
  regularDiscount = Math.min(nominal, Math.max(0, regularDiscount))
  const regularFinal = nominal - regularDiscount

  // Early bird discount
  let earlyDiscount = 0
  if (item.early_discount_type === 'percent') {
    const pct = Number(item.early_discount_value) || 0
    earlyDiscount = Math.round((nominal * pct) / 100)
  } else if (item.early_discount_type === 'nominal') {
    earlyDiscount = Number(item.early_discount_value) || 0
  }
  earlyDiscount = Math.min(nominal, Math.max(0, earlyDiscount))
  const earlyFinal = nominal - earlyDiscount

  return {
    ...item,
    regularDiscountAmount: regularDiscount,
    regularFinalPrice: regularFinal,
    earlyDiscountAmount: earlyDiscount,
    earlyFinalPrice: earlyFinal,
  }
}

export async function fetchPublicFees(): Promise<FeesSummary> {
  try {
    const res = await apiFetch<PublicFeesResponse>('/ppdb/waves/active-public/fees')
    if (res && res.items && res.items.length > 0) {
      const calculatedItems = res.items.map(computeFeeItem)
      const totalOriginal = calculatedItems.reduce((acc, it) => acc + (Number(it.nominal) || 0), 0)
      const totalRegularDiscount = calculatedItems.reduce((acc, it) => acc + it.regularDiscountAmount, 0)
      const totalRegularFinal = calculatedItems.reduce((acc, it) => acc + it.regularFinalPrice, 0)
      const totalEarlyDiscount = calculatedItems.reduce((acc, it) => acc + it.earlyDiscountAmount, 0)
      const totalEarlyFinal = calculatedItems.reduce((acc, it) => acc + it.earlyFinalPrice, 0)

      return {
        formFee: Number(res.form_fee) || FALLBACK_FEES_SUMMARY.formFee,
        minimumDp: Number(res.minimum_dp) || FALLBACK_FEES_SUMMARY.minimumDp,
        totalOriginal,
        totalRegularDiscount,
        totalRegularFinal,
        totalEarlyDiscount,
        totalEarlyFinal,
        items: calculatedItems,
        earlyDiscountQuota: res.early_discount_quota || 0,
        waveName: res.wave_name || 'Gelombang Aktif',
        academicYear: res.academic_year || '2026/2027',
        active: res.active ?? true,
      }
    }
  } catch {
    // If backend doesn't have active fee items yet, fallback gracefully
  }

  return FALLBACK_FEES_SUMMARY
}
