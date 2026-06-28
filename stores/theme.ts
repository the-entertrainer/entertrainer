import { defineStore } from 'pinia'

export type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', {
  state: () => ({ theme: 'dark' as Theme }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    set(t: Theme) {
      this.theme = t
      if (import.meta.client) {
        document.documentElement.dataset.theme = t
      }
    },
    init() {
      if (!import.meta.client) return
      localStorage.removeItem('et-theme')
      const mq = window.matchMedia('(prefers-color-scheme: light)')
      this.set(mq.matches ? 'light' : 'dark')
      mq.addEventListener('change', (e) => {
        this.set(e.matches ? 'light' : 'dark')
      })
    }
  }
})
