/**
 * Site-wide reader preferences (logo sound, motion, Elevate list).
 * Persists under one localStorage key; SSR-safe defaults until client hydrate.
 */
export type ElevateSortPref = 'newest' | 'oldest' | 'title'

export interface SiteSettings {
  logoSound: boolean
  reduceMotion: boolean
  hideElevateExcerpts: boolean
  elevateSort: ElevateSortPref
}

export const SITE_SETTINGS_KEY = 'entertrainer.settings'

const defaults = (): SiteSettings => ({
  logoSound: true,
  reduceMotion: false,
  hideElevateExcerpts: false,
  elevateSort: 'newest'
})

function parseStored(raw: string | null): SiteSettings {
  if (!raw) return defaults()
  try {
    const parsed = JSON.parse(raw) as Partial<SiteSettings>
    const sort = parsed.elevateSort
    return {
      logoSound: parsed.logoSound !== false,
      reduceMotion: parsed.reduceMotion === true,
      hideElevateExcerpts: parsed.hideElevateExcerpts === true,
      elevateSort: sort === 'oldest' || sort === 'title' || sort === 'newest' ? sort : 'newest'
    }
  } catch {
    return defaults()
  }
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

  function setLogoSound(on: boolean) { patch({ logoSound: on }) }
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

  return {
    settings,
    panelOpen,
    hydrated,
    hydrate,
    persist,
    applyToDom,
    patch,
    setLogoSound,
    setReduceMotion,
    setHideElevateExcerpts,
    setElevateSort,
    reset,
    openPanel,
    closePanel,
    togglePanel,
    prefersReducedMotion,
    defaults
  }
}
