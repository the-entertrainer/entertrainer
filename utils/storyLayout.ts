import type { Connection, StoryCard } from '~/types/story'
import { lastInSequence, orderCards } from './storyGraph'

export const NODE_W = 256
export const NODE_H = 168

const GAP_X = 120
const BASE_Y = 160
const WAVE = 96

// New cards "snap" onto the end of the current chain — placed in a gentle
// flowing wave so the storyboard reads as one continuous path across the
// canvas instead of a rigid grid.
export function nextAutoPosition(cards: StoryCard[], connections: Connection[]): { x: number; y: number } {
  const last = lastInSequence(cards, connections)
  if (!last) return { x: 60, y: BASE_Y }
  const step = orderCards(cards, connections).length
  return { x: last.x + NODE_W + GAP_X, y: Math.max(40, BASE_Y + Math.sin(step * 0.7) * WAVE) }
}

// One-tap cleanup: re-lay every card along the wave in sequence order,
// keeping all connections intact.
export function tidyPositions(cards: StoryCard[], connections: Connection[]) {
  const ordered = orderCards(cards, connections)
  ordered.forEach((card, i) => {
    card.x = 60 + i * (NODE_W + GAP_X)
    card.y = Math.max(40, BASE_Y + Math.sin(i * 0.7) * WAVE)
  })
}
