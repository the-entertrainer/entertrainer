import { defineStore } from 'pinia'

export type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', {
  state: () => ({ theme: 'dark' as Theme }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    _mqListener: null as ((e: MediaQueryListEvent) => void) | null,
    _mq: null as MediaQueryList | null,
    _animTimer: 0 as any,
    set(t: Theme, animate = true) {
      this.theme = t
      if (!import.meta.client) return
      const el = document.documentElement
      // Crossfade colours on a real switch (not the initial sync) so light/dark
      // is an experience, not a snap. The class is short-lived so it never adds
      // latency to ordinary interactions.
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (animate && !reduce) {
        el.classList.add('theme-anim')
        clearTimeout(this._animTimer)
        this._animTimer = window.setTimeout(() => el.classList.remove('theme-anim'), 520)
      }
      el.dataset.theme = t
    },
    init() {
      if (!import.meta.client) return
      localStorage.removeItem('et-theme')
      // Pinned dark, deliberately.
      //
      // The site is one art direction now — a monochrome black ground, bitmap
      // type, and a WebGL stage whose whole look is highlights blooming out of
      // near-black. Following the OS preference meant a visitor on a light
      // desktop got pale editorial pages either side of a stage that is always
      // dark, which read as two different websites rather than one. The light
      // palette is kept in the tokens and is still monochrome, so nothing is
      // lost if this is ever handed back to the OS.
      this.set('dark', false)
    },
    dispose() {
      if (this._mq && this._mqListener) {
        this._mq.removeEventListener('change', this._mqListener)
        this._mqListener = null
        this._mq = null
      }
    }
  }
})
