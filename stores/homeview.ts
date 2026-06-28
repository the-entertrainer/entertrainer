import { defineStore } from 'pinia'

export type HomeViewMode = 'spiral' | 'list'

export const useHomeViewStore = defineStore('homeview', {
  state: () => ({
    mode: 'spiral' as HomeViewMode,
    isHome: true,
    pendingBack: false,
    pendingHome: false
  }),
  actions: {
    setMode(mode: HomeViewMode) {
      this.mode = mode
    },
    toggle() {
      this.mode = this.mode === 'spiral' ? 'list' : 'spiral'
    },
    setIsHome(v: boolean) {
      this.isHome = v
    },
    triggerBack() {
      this.pendingBack = true
    },
    ackBack() {
      this.pendingBack = false
    },
    triggerHome() {
      this.pendingHome = true
    },
    ackHome() {
      this.pendingHome = false
    }
  }
})
