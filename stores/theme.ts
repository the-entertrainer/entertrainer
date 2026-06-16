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
        localStorage.setItem('et-theme', t)
      }
    },
    init() {
      if (!import.meta.client) return
      const saved = localStorage.getItem('et-theme') as Theme | null
      if (saved) { this.set(saved); return }
      const preferLight = window.matchMedia('(prefers-color-scheme: light)').matches
      this.set(preferLight ? 'light' : 'dark')
    }
  }
})
