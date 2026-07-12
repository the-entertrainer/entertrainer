import { defineStore } from 'pinia'

// ============================================================
// DOOMBOX — top-level state machine for the module.
// ============================================================
//
// The game is a Doom-style first-person hunt through a live email server.
// The learner is an antispam/antivirus officer; the objective is to
// neutralise 10 threats. A "neutralise" is never automatic — shooting a
// threat opens an inspection puzzle (spot the giveaway), and only a correct
// answer removes it. Clear all 10 and the server is secured.
//
// Screens: title → playing → debrief. (A 'lobby' screen is reserved for the
// coop/room-code path, which is feature-flagged and built last.)
export type DoomScreen = 'title' | 'lobby' | 'playing' | 'debrief'
export type DoomMode = 'solo' | 'host' | 'join'

export const TOTAL_THREATS = 10

export const useDoomboxStore = defineStore('doombox', {
  state: () => ({
    screen: 'title' as DoomScreen,
    mode: 'solo' as DoomMode,
    roomCode: null as string | null,

    // objective progress — which specimen ids have been cleared
    cleared: [] as number[],
    // running tally the debrief reports on
    shotsFired: 0,
    wrongAnswers: 0,
    startedAt: 0 as number,
    endedAt: 0 as number
  }),

  getters: {
    neutralised: (s) => s.cleared.length,
    complete: (s) => s.cleared.length >= TOTAL_THREATS,
    // accuracy over the puzzles, not the trigger — a teaching metric
    accuracy: (s) => {
      const answered = s.cleared.length + s.wrongAnswers
      return answered === 0 ? 1 : s.cleared.length / answered
    },
    elapsedMs: (s) => (s.endedAt || Date.now()) - (s.startedAt || Date.now())
  },

  actions: {
    startRun(mode: DoomMode = 'solo', roomCode: string | null = null) {
      this.mode = mode
      this.roomCode = roomCode
      this.cleared = []
      this.shotsFired = 0
      this.wrongAnswers = 0
      this.startedAt = Date.now()
      this.endedAt = 0
      this.screen = 'playing'
    },
    registerShot() {
      this.shotsFired++
    },
    clearThreat(id: number) {
      if (!this.cleared.includes(id)) this.cleared.push(id)
      if (this.complete) {
        this.endedAt = Date.now()
        this.screen = 'debrief'
      }
    },
    registerWrong() {
      this.wrongAnswers++
    },
    goTitle() {
      this.screen = 'title'
    },
    reset() {
      this.$reset()
    }
  }
})
