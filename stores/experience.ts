import { defineStore } from 'pinia'

export const useExperienceStore = defineStore('experience', {
  state: () => ({
    experience: null as any,
    progress: 0,
    targetProgress: 0,
    isReady: false,
    hasEntered: false
  }),
  actions: {
    setExperience(exp: any) {
      this.experience = exp
    },
    setProgress(value: number) {
      this.progress = value
    },
    setTargetProgress(value: number) {
      this.targetProgress = value
    },
    setReady() {
      this.isReady = true
    },
    setHasEntered() {
      this.hasEntered = true
    }
  }
})
