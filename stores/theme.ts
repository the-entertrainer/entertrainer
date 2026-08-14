import { defineStore } from 'pinia'

export type Theme = 'dark' | 'light'

const KEY = 'et-theme'

/**
 * Light by default, because the publication is printed on paper.
 *
 * The previous version pinned dark and deleted any stored preference on every
 * boot — correct then, when the site was one dark WebGL stage and a light page
 * either side of it would have read as two different websites. The editorial
 * system has a real second printing (see [data-theme="dark"] in main.css), so
 * the choice goes back to the reader: OS preference on first visit, and an
 * explicit toggle that is remembered after that.
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({ theme: 'light' as Theme, explicit: false }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    _mq: null as MediaQueryList | null,
    _mqListener: null as ((e: MediaQueryListEvent) => void) | null,
    _animTimer: 0 as any,

    set(t: Theme, animate = true) {
      this.theme = t
      if (!import.meta.client) return
      const el = document.documentElement
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (animate && !reduce) {
        el.classList.add('theme-anim')
        clearTimeout(this._animTimer)
        this._animTimer = window.setTimeout(() => el.classList.remove('theme-anim'), 520)
      }
      el.dataset.theme = t
    },

    toggle() {
      this.explicit = true
      const next: Theme = this.theme === 'dark' ? 'light' : 'dark'
      if (import.meta.client) { try { localStorage.setItem(KEY, next) } catch {} }
      this.set(next)
    },

    init() {
      if (!import.meta.client) return
      let stored: string | null = null
      try { stored = localStorage.getItem(KEY) } catch {}

      if (stored === 'dark' || stored === 'light') {
        this.explicit = true
        this.set(stored, false)
      } else {
        this._mq = window.matchMedia('(prefers-color-scheme: dark)')
        this.set(this._mq.matches ? 'dark' : 'light', false)
        // Follow the OS until the reader states a preference of their own.
        this._mqListener = (e) => { if (!this.explicit) this.set(e.matches ? 'dark' : 'light') }
        this._mq.addEventListener('change', this._mqListener)
      }
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
