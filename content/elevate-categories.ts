/**
 * Elevate article categories — fixed set.
 * M · U · S · T → Mind · Universe · Science · Technology
 */
export const ELEVATE_CATEGORIES = ['Mind', 'Universe', 'Science', 'Technology'] as const

export type ElevateCategory = (typeof ELEVATE_CATEGORIES)[number]

export const MUST_LETTERS = [
  { letter: 'M', category: 'Mind' as const },
  { letter: 'U', category: 'Universe' as const },
  { letter: 'S', category: 'Science' as const },
  { letter: 'T', category: 'Technology' as const }
] as const

export function isElevateCategory(value: string): value is ElevateCategory {
  return (ELEVATE_CATEGORIES as readonly string[]).includes(value)
}

/**
 * Map legacy / free-form labels onto the four MUST categories.
 * Prefer an explicit post.category (Mind|Universe|Science|Technology).
 * Do NOT infer Universe from bare "moon"/"moonly" in titles — those are often language pieces.
 */
export function normalizeElevateCategory(raw: string | undefined | null): ElevateCategory {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return 'Mind'
  if (isElevateCategory(trimmed)) return trimmed
  const titled = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  if (isElevateCategory(titled)) return titled
  const s = trimmed.toLowerCase()

  // Language / literature / morphology → Mind (before any astronomy-ish word heuristics)
  if (/\b(language|linguistic|literature|morpholog|etymolog|grammar|word|meaning|moonly)\b/.test(s)) return 'Mind'

  if (/\b(tech|ai|software|security|otp|machine|digital|code)\b/.test(s)) return 'Technology'
  // Universe: real space/cosmo cues — not bare "moon" (often English morphology)
  if (/\b(universe|cosmo|space|entropy|astronom|astrophys|galaxy|planet|laziness)\b/.test(s)) return 'Universe'
  if (/\b(science|physics|biology|sleep|math)\b/.test(s)) return 'Science'
  if (/\b(mind|cognition|psych|memory|learn|lie|intelligent|midpoint|time|brain)\b/.test(s)) return 'Mind'

  // Fallback heuristics by known legacy labels
  if (s.includes('tech') || s.includes('ai') || s.includes('security')) return 'Technology'
  if (s.includes('cosmo') || s.includes('universe') || s.includes('entropy') || s.includes('astronom')) return 'Universe'
  if (s.includes('physics') || s.includes('science') || s.includes('sleep')) return 'Science'
  return 'Mind'
}
