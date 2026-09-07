/**
 * Site-wide visitor preferences (opening sound, motion, article list).
 * Persists under one localStorage key; SSR-safe defaults until client hydrate.
 */

export type ElevateSortPref = 'newest' | 'oldest' | 'title'

/** Stored opening-sound choice: off, or an ident id. */
export type OpeningSoundId =
  | 'off'
  | 'soft-chime'
  | 'warm-pulse'
  | 'bright-spark'
  | 'deep-note'
  | 'quiet-hush'
  | 'glass-tap'

export interface OpeningSoundOption {
  id: OpeningSoundId
  label: string
  /** Public path when id !== 'off' */
  src?: string
}

export const OPENING_SOUND_OPTIONS: OpeningSoundOption[] = [
  { id: 'off', label: 'Off' },
  { id: 'soft-chime', label: 'Soft chime', src: '/audio/idents/soft-chime.mp3' },
  { id: 'warm-pulse', label: 'Warm pulse', src: '/audio/idents/warm-pulse.mp3' },
  { id: 'bright-spark', label: 'Bright spark', src: '/audio/idents/bright-spark.mp3' },
  { id: 'deep-note', label: 'Deep note', src: '/audio/idents/deep-note.mp3' },
  { id: 'quiet-hush', label: 'Quiet hush', src: '/audio/idents/quiet-hush.mp3' },
  { id: 'glass-tap', label: 'Glass tap', src: '/audio/idents/glass-tap.mp3' }
]

const OPENING_SOUND_IDS = new Set(OPENING_SOUND_OPTIONS.map((o) => o.id))

export interface SiteSettings {
  /** Selected welcome/opening sound (replaces legacy logoSound boolean). */
  openingSound: OpeningSoundId
  reduceMotion: boolean
  hideElevateExcerpts: boolean
  elevateSort: ElevateSortPref
}

export const SITE_SETTINGS_KEY = 'entertrainer.settings'

const DEFAULT_OPENING: OpeningSoundId = 'soft-chime'

const defaults = (): SiteSettings => ({
  openingSound: DEFAULT_OPENING,
  reduceMotion: false,
  hideElevateExcerpts: false,
  elevateSort: 'newest'
})

function isOpeningSoundId(value: unknown): value is OpeningSoundId {
  return typeof value === 'string' && OPENING_SOUND_IDS.has(value as OpeningSoundId)
}

/** Resolve openingSound from stored JSON, migrating legacy `logoSound` boolean. */
function resolveOpeningSound(parsed: Record<string, unknown>): OpeningSoundId {
  if (isOpeningSoundId(parsed.openingSound)) return parsed.openingSound
  // Legacy: logoSound false → Off; true / missing → Soft chime
  if (parsed.logoSound === false) return 'off'
  return DEFAULT_OPENING
}

function parseStored(raw: string | null): SiteSettings {
  if (!raw) return defaults()
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const sort = parsed.elevateSort
    return {
      openingSound: resolveOpeningSound(parsed),
      reduceMotion: parsed.reduceMotion === true,
      hideElevateExcerpts: parsed.hideElevateExcerpts === true,
      elevateSort: sort === 'oldest' || sort === 'title' || sort === 'newest' ? sort : 'newest'
    }
  } catch {
    return defaults()
  }
}

export function openingSoundSrc(id: OpeningSoundId): string | null {
  const opt = OPENING_SOUND_OPTIONS.find((o) => o.id === id)
  return opt?.src ?? null
}

export function useSiteSettings() {
  const settings = useState<SiteSettings>('entertrainer-site-settings', () => defaults())
  const panelOpen = useState<boolean>('entertrainer-settings-panel', () => false)
  const hydrated = useState<boolean>('entertrainer-settings-hydrated', () => false)

  function persist() {
    if (!import.meta.client) return
    try {
      // Persist current schema only (no legacy logoSound key).
      localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings.value))
    } catch { /* private mode / quota */ }
  }

  function applyToDom() {
    if (!import.meta.client) return
    const el = document.documentElement
    if (settings.value.reduceMotion) el.setAttribute('data-reduce-motion', 'on')
    else el.removeAttribute('data-reduce-motion')
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    try {
      settings.value = parseStored(localStorage.getItem(SITE_SETTINGS_KEY))
    } catch {
      settings.value = defaults()
    }
    applyToDom()
    hydrated.value = true
  }

  function patch(partial: Partial<SiteSettings>) {
    settings.value = { ...settings.value, ...partial }
    hydrated.value = true
    persist()
    applyToDom()
  }

  function setOpeningSound(id: OpeningSoundId) { patch({ openingSound: id }) }
  function setReduceMotion(on: boolean) { patch({ reduceMotion: on }) }
  function setHideElevateExcerpts(on: boolean) { patch({ hideElevateExcerpts: on }) }
  function setElevateSort(sort: ElevateSortPref) { patch({ elevateSort: sort }) }

  function reset() {
    settings.value = defaults()
    hydrated.value = true
    persist()
    applyToDom()
  }

  function openPanel() { panelOpen.value = true }
  function closePanel() { panelOpen.value = false }
  function togglePanel() { panelOpen.value = !panelOpen.value }

  /** Effective reduced-motion: explicit pref OR OS preference. */
  function prefersReducedMotion(): boolean {
    if (settings.value.reduceMotion) return true
    if (!import.meta.client) return false
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  }

  const openingSoundOn = computed(() => settings.value.openingSound !== 'off')

  return {
    settings,
    panelOpen,
    hydrated,
    hydrate,
    persist,
    applyToDom,
    patch,
    setOpeningSound,
    setReduceMotion,
    setHideElevateExcerpts,
    setElevateSort,
    reset,
    openPanel,
    closePanel,
    togglePanel,
    prefersReducedMotion,
    openingSoundOn,
    defaults,
    OPENING_SOUND_OPTIONS,
    openingSoundSrc
  }
}
