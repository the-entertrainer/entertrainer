import { defineStore } from 'pinia'
import type { MailItem } from '~/utils/inboxdefender/items'

// ============================================================
// INBOX DEFENDER — module state.
// ============================================================
//
// One round = the whole deck of mail, shuffled. The engine reports every
// resolved item (shot or delivered, right or wrong) and the current inbox
// integrity; the store keeps score and a log the debrief learns from. Run
// ends two ways: the deck is cleared (debrief) or integrity hits zero
// (gameover).

export type IdScreen = 'title' | 'playing' | 'debrief' | 'gameover'
export const MAX_INTEGRITY = 100

export type ResolveAction = 'quarantined' | 'delivered' | 'wrongshot' | 'breach'
export interface ResolveEvent {
  item: MailItem
  action: ResolveAction
  correct: boolean
}

export const useInboxDefenderStore = defineStore('inbox-defender', {
  state: () => ({
    screen: 'title' as IdScreen,
    integrity: MAX_INTEGRITY,
    score: 0,
    log: [] as ResolveEvent[],
    startedAt: 0,
    endedAt: 0
  }),

  getters: {
    handled: (s) => s.log.length,
    correct: (s) => s.log.filter((e) => e.correct).length,
    accuracy(s): number {
      return s.log.length === 0 ? 1 : s.log.filter((e) => e.correct).length / s.log.length
    },
    accuracyPct(): number {
      return Math.round(this.accuracy * 100)
    },
    threatsStopped: (s) => s.log.filter((e) => e.item.malicious && e.correct).length,
    integrityPct: (s) => Math.round((s.integrity / MAX_INTEGRITY) * 100),
    // the tells the learner slipped on — what the debrief tells them to watch
    missed(s): { category: string; detail: string }[] {
      const seen = new Set<string>()
      const out: { category: string; detail: string }[] = []
      for (const e of s.log) {
        if (!e.correct && !seen.has(e.item.category)) {
          seen.add(e.item.category)
          out.push({ category: e.item.category, detail: e.item.detail })
        }
      }
      return out
    },
    elapsedMs: (s) => (s.endedAt || Date.now()) - (s.startedAt || Date.now())
  },

  actions: {
    startRun() {
      this.integrity = MAX_INTEGRITY
      this.score = 0
      this.log = []
      this.startedAt = Date.now()
      this.endedAt = 0
      this.screen = 'playing'
    },
    resolve(evt: ResolveEvent) {
      this.log.push(evt)
      if (evt.action === 'quarantined') this.score += 100
      else if (evt.action === 'delivered') this.score += 60
    },
    setIntegrity(v: number) {
      this.integrity = Math.max(0, Math.min(MAX_INTEGRITY, v))
    },
    end(outcome: 'cleared' | 'breached') {
      this.endedAt = Date.now()
      this.screen = outcome === 'cleared' ? 'debrief' : 'gameover'
    },
    goTitle() {
      this.screen = 'title'
    },
    reset() {
      this.$reset()
    }
  }
})
