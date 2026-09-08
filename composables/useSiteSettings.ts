/**
 * Site-wide visitor preferences (opening sound, motion, article list, word puzzle).
 * Persists under one localStorage key; SSR-safe defaults until client hydrate.
 */

export type ElevateSortPref = 'newest' | 'oldest' | 'title'

/** Opening sound: on (brand ident) or off. */
export type OpeningSoundId = 'on' | 'off'

/** Legacy multi-ident ids — migrate to "on". */
const LEGACY_IDENT_IDS = new Set([
  'soft-chime',
  'warm-pulse',
  'bright-spark',
  'deep-note',
  'quiet-hush',
  'glass-tap',
  'on'
])

/** Brand opening music — user-provided track with Sanskrit lyric lines (~8.93s). */
export const OPENING_SOUND_SRC = '/audio/idents/opening.mp3'

export interface SiteSettings {
  /** Welcome tone on tap-to-enter: "on" | "off". */
  openingSound: OpeningSoundId
  /** Show the Word of the Day (WOTD) button in the masthead. */
  wordOfTheDay: boolean
  reduceMotion: boolean
  hideElevateExcerpts: boolean
  elevateSort: ElevateSortPref
}

export const SITE_SETTINGS_KEY = 'entertrainer.settings'

const DEFAULT_OPENING: OpeningSoundId = 'on'

const defaults = (): SiteSettings => ({
  openingSound: DEFAULT_OPENING,
  wordOfTheDay: true,
  reduceMotion: false,
  hideElevateExcerpts: false,
  elevateSort: 'newest'
})

function isOpeningSoundId(value: unknown): value is OpeningSoundId {
  return value === 'on' || value === 'off'
}

/** Resolve openingSound from stored JSON, migrating legacy logoSound / ident ids. */
function resolveOpeningSound(parsed: Record<string, unknown>): OpeningSoundId {
  const raw = parsed.openingSound
  if (raw === 'off' || parsed.logoSound === false) return 'off'
  if (raw === 'on') return 'on'
  if (typeof raw === 'string' && LEGACY_IDENT_IDS.has(raw)) return 'on'
  // Legacy: logoSound true / missing → on
  return DEFAULT_OPENING
}

function parseStored(raw: string | null): SiteSettings {
  if (!raw) return defaults()
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const sort = parsed.elevateSort
    return {
      openingSound: resolveOpeningSound(parsed),
      wordOfTheDay: parsed.wordOfTheDay !== false,
      reduceMotion: parsed.reduceMotion === true,
      hideElevateExcerpts: parsed.hideElevateExcerpts === true,
      elevateSort: sort === 'oldest' || sort === 'title' || sort === 'newest' ? sort : 'newest'
    }
  } catch {
    return defaults()
  }
}

/** Src for the single brand ident when sound is on; null when off. */
export function openingSoundSrc(id: OpeningSoundId): string | null {
  return id === 'on' ? OPENING_SOUND_SRC : null
}

export function useSiteSettings() {
  const settings = useState<SiteSettings>('entertrainer-site-settings', () => defaults())
  const panelOpen = useState<boolean>('entertrainer-settings-panel', () => false)
  const hydrated = useState<boolean>('entertrainer-settings-hydrated', () => false)

  function persist() {
    if (!import.meta.client) return
    try {
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
  function setWordOfTheDay(on: boolean) { patch({ wordOfTheDay: on }) }
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

  const openingSoundOn = computed(() => settings.value.openingSound === 'on')

  return {
    settings,
    panelOpen,
    hydrated,
    hydrate,
    persist,
    applyToDom,
    patch,
    setOpeningSound,
    setWordOfTheDay,
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
    openingSoundSrc,
    OPENING_SOUND_SRC
  }
}
