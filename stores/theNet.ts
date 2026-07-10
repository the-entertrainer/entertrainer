import { defineStore } from 'pinia'

// Cross-scene state for "The Net". The one value that must survive from
// scene 1 to the end is the learner's committed choice — the fruit they
// called ripest before any explanation existed. The marker stays pinned to
// exactly this index through the reveal.
//
// Scenes: 1 Pick · 2 Reveal · 3 Proof · 4 Mechanism · 5 In the wild · 6 Takeaway
export type NetScene = 1 | 2 | 3 | 4 | 5 | 6

export const useTheNetStore = defineStore('the-net', {
  state: () => ({
    scene: 1 as NetScene,
    chosenIndex: null as number | null
  }),
  actions: {
    choose(i: number) {
      if (this.chosenIndex === null) this.chosenIndex = i
    },
    goTo(s: NetScene) {
      this.scene = s
    },
    reset() {
      this.scene = 1
      this.chosenIndex = null
    }
  }
})
