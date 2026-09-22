import { defineStore } from 'pinia'

export type Theme = 'dark' | 'light'

/** Lasting key — cleared on init so reopen always follows the OS. */
const LEGACY_KEY = 'et-theme'
/** Explicit override for this tab/session only. */
const SESSION_KEY = 'et-theme-session'

/** Non-reactive MediaQuery handles — must not live on the Pinia actions object. */
let mq: MediaQueryList | null = null
let mqListener: ((e: MediaQueryListEvent) => void) | null = null
let animTimer = 0 as ReturnType<typeof setTimeout> | number

/**
 * Theme follows the OS on every fresh open / new tab.
 * A manual toggle sticks only for the browsing session (sessionStorage),
 * then reopen resets to prefers-color-scheme.
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({ theme: 'light' as Theme, explicit: false }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    set(t: Theme, animate = true) {
      this.theme = t
      if (!import.meta.client) return
      const el = document.documentElement
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (animate && !reduce) {
        el.classList.add('theme-anim')
        clearTimeout(animTimer)
        animTimer = window.setTimeout(() => el.classList.remove('theme-anim'), 520)
      }
      el.dataset.theme = t
    },

    toggle() {
      this.explicit = true
      const next: Theme = this.theme === 'dark' ? 'light' : 'dark'
      if (import.meta.client) {
        try { sessionStorage.setItem(SESSION_KEY, next) } catch {}
        try { localStorage.removeItem(LEGACY_KEY) } catch {}
      }
      this.set(next)
      // Keep following OS only when not explicit — once toggled, session owns it.
      this._detachMq()
    },

    _detachMq() {
      if (mq && mqListener) {
        try {
          if (typeof mq.removeEventListener === 'function') {
            mq.removeEventListener('change', mqListener)
          } else if (typeof (mq as any).removeListener === 'function') {
            ;(mq as any).removeListener(mqListener)
          }
        } catch { /* ignore broken matchMedia mocks */ }
      }
      mqListener = null
      mq = null
    },

    _attachMq() {
      this._detachMq()
      if (!window.matchMedia) return
      mq = window.matchMedia('(prefers-color-scheme: dark)')
      mqListener = (e) => {
        if (!this.explicit) this.set(e.matches ? 'dark' : 'light')
      }
      try {
        if (typeof mq.addEventListener === 'function') {
          mq.addEventListener('change', mqListener)
        } else if (typeof (mq as any).addListener === 'function') {
          ;(mq as any).addListener(mqListener)
        }
      } catch {
        mqListener = null
        mq = null
      }
    },

    init() {
      if (!import.meta.client) return
      // Migrate: never restore lasting localStorage preference.
      try { localStorage.removeItem(LEGACY_KEY) } catch {}

      let session: string | null = null
      try { session = sessionStorage.getItem(SESSION_KEY) } catch {}

      if (session === 'dark' || session === 'light') {
        this.explicit = true
        this.set(session, false)
        return
      }

      this.explicit = false
      this._attachMq()
      const dark = mq?.matches ?? false
      this.set(dark ? 'dark' : 'light', false)
    },

    dispose() {
      this._detachMq()
    }
  }
})
