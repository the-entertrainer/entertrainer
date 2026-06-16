import { defineStore } from 'pinia'

export type HomeViewMode = 'spiral' | 'list'

export const useHomeViewStore = defineStore('homeview', {
  state: () => ({
    mode: 'spiral' as HomeViewMode,
    isHome: true,
    pendingBack: false
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
    }
  }
})
