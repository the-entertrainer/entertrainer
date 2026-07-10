import { defineStore } from 'pinia'

// Cross-scene state for "The Net". The one value that has to survive from
// scene 1 all the way to scene 2 is the learner's choice — the fruit they
// committed to as "ripest" before they were allowed any explanation. The
// marker in scene 2 stays pinned to exactly this index.
export const useTheNetStore = defineStore('the-net', {
  state: () => ({
    scene: 1 as 1 | 2 | 3 | 4,
    chosenIndex: null as number | null
  }),
  actions: {
    choose(i: number) {
      if (this.chosenIndex === null) this.chosenIndex = i
    },
    goTo(s: 1 | 2 | 3 | 4) {
      this.scene = s
    },
    reset() {
      this.scene = 1
      this.chosenIndex = null
    }
  }
})
