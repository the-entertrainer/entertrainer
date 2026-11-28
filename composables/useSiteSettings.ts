/**
 * Site-wide visitor preferences (opening sound, article list, word puzzle).
 * Persists under one localStorage key; SSR-safe defaults until client hydrate.
 * Motion: Full / Calm / Off. Off (or the OS reduce preference) sets
 * html[data-reduce-motion="on"]; Calm sets html[data-motion="calm"], which
 * halves distances and durations. The preloader keeps reading the OS only.
 */

export type MotionPref = 'full' | 'calm' | 'off'

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
  /** Quiet AstroClock gear/escapement clicks. */
  astroclockGearSound: boolean
  /** Show the Word of the Day (WOTD) button in the masthead. */
  wordOfTheDay: boolean
  hideElevateExcerpts: boolean
  elevateSort: ElevateSortPref
  /** Site motion level. Default full; the OS reduce preference still wins. */
  motion: MotionPref
  /** Soft paper and press sounds for taps and toggles. Off by default. */
  uiSound: boolean
}

export const SITE_SETTINGS_KEY = 'entertrainer.settings'

const DEFAULT_OPENING: OpeningSoundId = 'on'

const defaults = (): SiteSettings => ({
  openingSound: DEFAULT_OPENING,
  astroclockGearSound: true,
  wordOfTheDay: true,
  hideElevateExcerpts: false,
  elevateSort: 'newest',
  motion: 'full',
  uiSound: false
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
      astroclockGearSound: parsed.astroclockGearSound !== false,
      wordOfTheDay: parsed.wordOfTheDay !== false,
      hideElevateExcerpts: parsed.hideElevateExcerpts === true,
      elevateSort: sort === 'oldest' || sort === 'title' || sort === 'newest' ? sort : 'newest',
      motion: parsed.motion === 'calm' || parsed.motion === 'off' ? parsed.motion : 'full',
      uiSound: parsed.uiSound === true
    }
  } catch {
    return defaults()
  }
}

/** Src for the single brand ident when sound is on; null when off. */
export function openingSoundSrc(id: OpeningSoundId): string | null {
  return id === 'on' ? OPENING_SOUND_SRC : null
}

let motionListenerBound = false

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

  function applyOsReduceMotion() {
    if (!import.meta.client) return
    const el = document.documentElement
    let reduce = false
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch { /* ignore */ }
    const pref = settings.value.motion
    if (reduce || pref === 'off') el.setAttribute('data-reduce-motion', 'on')
    else el.removeAttribute('data-reduce-motion')
    if (!reduce && pref === 'calm') el.setAttribute('data-motion', 'calm')
    else el.removeAttribute('data-motion')
    el.setAttribute('data-ui-sound', settings.value.uiSound ? 'on' : 'off')
  }

  function bindOsReduceMotion() {
    if (!import.meta.client || motionListenerBound) return
    motionListenerBound = true
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onChange = () => applyOsReduceMotion()
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange)
      else mq.addListener(onChange)
    } catch { /* ignore */ }
  }

  function applyToDom() {
    applyOsReduceMotion()
    bindOsReduceMotion()
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    try {
      settings.value = parseStored(localStorage.getItem(SITE_SETTINGS_KEY))
      const gear = localStorage.getItem('entertrainer.astroclock.gearSound')
      if (gear === 'off' || gear === '0' || gear === 'false') {
        settings.value = { ...settings.value, astroclockGearSound: false }
      } else if (gear === 'on' || gear === '1' || gear === 'true') {
        settings.value = { ...settings.value, astroclockGearSound: true }
      }
    } catch {
      settings.value = defaults()
    }
    // Drop legacy reduceMotion from stored JSON on next save
    persist()
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
  function setAstroclockGearSound(on: boolean) {
    patch({ astroclockGearSound: on })
    if (import.meta.client) {
      try {
        localStorage.setItem('entertrainer.astroclock.gearSound', on ? 'on' : 'off')
        window.dispatchEvent(new CustomEvent('astroclock-gear-sound', { detail: { on } }))
      } catch { /* ignore */ }
    }
  }
  function setWordOfTheDay(on: boolean) { patch({ wordOfTheDay: on }) }
  function setHideElevateExcerpts(on: boolean) { patch({ hideElevateExcerpts: on }) }
  function setElevateSort(sort: ElevateSortPref) { patch({ elevateSort: sort }) }
  function setMotion(motion: MotionPref) { patch({ motion }) }
  function setUiSound(on: boolean) { patch({ uiSound: on }) }

  function reset() {
    settings.value = defaults()
    hydrated.value = true
    persist()
    applyToDom()
    if (import.meta.client) {
      try {
        localStorage.setItem('entertrainer.astroclock.gearSound', 'on')
        window.dispatchEvent(new CustomEvent('astroclock-gear-sound', { detail: { on: true } }))
      } catch { /* ignore */ }
    }
  }

  function openPanel() { panelOpen.value = true }
  function closePanel() { panelOpen.value = false }
  function togglePanel() { panelOpen.value = !panelOpen.value }

  /** OS prefers-reduced-motion only. */
  function prefersReducedMotion(): boolean {
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
    setAstroclockGearSound,
    setWordOfTheDay,
    setHideElevateExcerpts,
    setElevateSort,
    setMotion,
    setUiSound,
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
