import type { Lane, Pattern } from './audio'
import { STEPS } from './audio'

export const LANES: { id: Lane; label: string; sound: string }[] = [
  { id: 'kick', label: 'Kick', sound: 'boom' },
  { id: 'snare', label: 'Snare', sound: 'crack' },
  { id: 'hat', label: 'Hat', sound: 'tss' }
]

// The four downbeats and the two backbeats, in 0-indexed steps. Used to
// highlight beat structure and to check the lesson interactions.
export const DOWNBEATS = [0, 4, 8, 12]
export const BACKBEATS = [4, 12]

// 'x' = hit, anything else = rest. Reads left to right across one bar.
function row(s: string): boolean[] {
  const out: boolean[] = []
  for (let i = 0; i < STEPS; i++) out.push(s[i] === 'x')
  return out
}
export function emptyRow(): boolean[] { return new Array(STEPS).fill(false) }
export function emptyPattern(): Pattern {
  return { kick: emptyRow(), snare: emptyRow(), hat: emptyRow() }
}
export function clonePattern(p: Pattern): Pattern {
  return { kick: [...p.kick], snare: [...p.snare], hat: [...p.hat] }
}
export function countHits(p: Pattern): number {
  return p.kick.filter(Boolean).length + p.snare.filter(Boolean).length + p.hat.filter(Boolean).length
}

// Three grooves built from the SAME three voices — only the placement differs.
// This is the module's central idea, so the patterns are chosen to make the
// contrast obvious by ear.
export const GROOVES: Record<'rock' | 'house' | 'break', Pattern> = {
  rock: {
    kick: row('x.......x.......'),
    snare: row('....x.......x...'),
    hat: row('x.x.x.x.x.x.x.x.')
  },
  house: {
    kick: row('x...x...x...x...'),
    snare: row('....x.......x...'),
    hat: row('..x...x...x...x.')
  },
  break: {
    kick: row('x.....x..x......'),
    snare: row('....x.......x..x'),
    hat: row('x.x.x.x.x.x.x.x.')
  }
}

// The groove the lesson assembles one lane at a time.
export const LESSON_GROOVE: Pattern = GROOVES.house

// The groove to recreate in Hands On (a boom-bap feel with one syncopated kick).
export const TARGET_GROOVE: Pattern = {
  kick: row('x.......x..x....'),
  snare: row('....x.......x...'),
  hat: row('x.x.x.x.x.x.x.x.')
}

/** Fraction of cells (0..1) where the two patterns agree, across all lanes. */
export function matchScore(a: Pattern, b: Pattern): number {
  let same = 0
  const total = LANES.length * STEPS
  for (const { id } of LANES) {
    for (let i = 0; i < STEPS; i++) if (!!a[id][i] === !!b[id][i]) same++
  }
  return same / total
}

/** Per-cell correctness against a target, for showing what to fix. */
export function diffPattern(user: Pattern, target: Pattern): Record<Lane, ('ok' | 'miss' | 'extra' | 'none')[]> {
  const out = {} as Record<Lane, ('ok' | 'miss' | 'extra' | 'none')[]>
  for (const { id } of LANES) {
    out[id] = user[id].map((u, i) => {
      const t = target[id][i]
      if (u && t) return 'ok'
      if (!u && t) return 'miss'
      if (u && !t) return 'extra'
      return 'none'
    })
  }
  return out
}

export const MATCH_PASS = 0.94 // at most ~3 cells off across 48
