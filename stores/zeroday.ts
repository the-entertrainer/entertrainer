import { defineStore } from 'pinia'

// ============================================================
// ZERO DAY — module state.
// ============================================================
//
// A Contra-style run-and-gun, cyber-safety reskinned: you are an incident
// responder running the kill chain through a breached subnet, gunning down
// malware to reach the patch node. Screens: title/brief → playing → debrief
// (extracted) or gameover (flatlined).

export type ZScreen = 'title' | 'playing' | 'debrief' | 'gameover'
export const MAX_HP = 5

export const useZeroDayStore = defineStore('zero-day', {
  state: () => ({
    screen: 'title' as ZScreen,
    hp: MAX_HP,
    kills: 0,
    progress: 0, // 0..1 along the level
    shield: 0, // seconds of firewall left (for HUD)
    startedAt: 0,
    endedAt: 0
  }),
  getters: {
    hpPct: (s) => Math.round((s.hp / MAX_HP) * 100),
    progressPct: (s) => Math.round(s.progress * 100),
    elapsedMs: (s) => (s.endedAt || Date.now()) - (s.startedAt || Date.now())
  },
  actions: {
    startRun() {
      this.hp = MAX_HP
      this.kills = 0
      this.progress = 0
      this.shield = 0
      this.startedAt = Date.now()
      this.endedAt = 0
      this.screen = 'playing'
    },
    setHp(v: number) {
      this.hp = Math.max(0, Math.min(MAX_HP, v))
      if (this.hp <= 0 && this.screen === 'playing') {
        this.endedAt = Date.now()
        this.screen = 'gameover'
      }
    },
    addKill() {
      this.kills++
    },
    setProgress(p: number) {
      this.progress = Math.max(this.progress, Math.min(1, p))
    },
    setShield(s: number) {
      this.shield = s
    },
    extract() {
      this.endedAt = Date.now()
      this.screen = 'debrief'
    },
    goTitle() {
      this.screen = 'title'
    },
    reset() {
      this.$reset()
    }
  }
})
