import type { Staff } from './types'

export interface StaffTreeNode {
  staff: Staff
  children: StaffTreeNode[]
}

export function deduplicateStaff(staff: Staff[]): Staff[] {
  const byName = new Map<string, Staff>()
  for (const s of staff) {
    const rawName = (s.content?.name || s.name || '').trim().toLowerCase()
    if (!rawName) {
      byName.set(s.id, s)
      continue
    }
    const existing = byName.get(rawName)
    if (!existing) {
      byName.set(rawName, s)
    } else {
      // Prioritaskan entri yang memiliki gambar, parentId, atau bio terlengkap
      const existingScore =
        (existing.image ? 4 : 0) +
        (existing.content?.parentId ? 2 : 0) +
        (existing.content?.bio ? 1 : 0)
      const currentScore =
        (s.image ? 4 : 0) +
        (s.content?.parentId ? 2 : 0) +
        (s.content?.bio ? 1 : 0)
      if (currentScore > existingScore) {
        byName.set(rawName, s)
      }
    }
  }
  return Array.from(byName.values())
}

export function buildStaffTree(staffList: Staff[]): StaffTreeNode[] {
  const staff = deduplicateStaff(staffList)
  const byId = new Map(staff.map((s) => [s.id, s]))
  const childrenOf = new Map<string, Staff[]>()
  const roots: Staff[] = []

  for (const s of staff) {
    const pid = s.content?.parentId
    if (pid && byId.has(pid) && pid !== s.id) {
      const arr = childrenOf.get(pid) ?? []
      arr.push(s)
      childrenOf.set(pid, arr)
    } else {
      roots.push(s)
    }
  }

  const sortByOrder = (a: Staff, b: Staff) =>
    (a.content?.order ?? 0) - (b.content?.order ?? 0) ||
    (a.content?.name ?? '').localeCompare(b.content?.name ?? '')

  const build = (s: Staff, seen: Set<string>): StaffTreeNode => {
    const next = new Set(seen).add(s.id)
    const kids = (childrenOf.get(s.id) ?? [])
      .filter((k) => !next.has(k.id))
      .sort(sortByOrder)
      .map((k) => build(k, next))
    return { staff: s, children: kids }
  }

  return [...roots].sort(sortByOrder).map((s) => build(s, new Set()))
}
