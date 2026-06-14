import { defineStore } from 'pinia'

export type HomeViewMode = 'spiral' | 'list'

export const useHomeViewStore = defineStore('homeview', {
  state: () => ({
    mode: 'spiral' as HomeViewMode
  }),
  actions: {
    setMode(mode: HomeViewMode) {
      this.mode = mode
    },
    toggle() {
      this.mode = this.mode === 'spiral' ? 'list' : 'spiral'
    }
  }
})
