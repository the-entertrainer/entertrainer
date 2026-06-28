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
    set(t: Theme) {
      this.theme = t
      if (import.meta.client) {
        document.documentElement.dataset.theme = t
      }
    },
    init() {
      if (!import.meta.client) return
      localStorage.removeItem('et-theme')
      this._mq = window.matchMedia('(prefers-color-scheme: light)')
      this.set(this._mq.matches ? 'light' : 'dark')
      this._mqListener = (e: MediaQueryListEvent) => {
        this.set(e.matches ? 'light' : 'dark')
      }
      this._mq.addEventListener('change', this._mqListener)
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
