import type { Connection, StoryCard } from '~/types/story'
import type { IdModel } from './idModels'
import { lastInSequence, orderCards } from './storyGraph'

export const NODE_W = 256
export const NODE_H = 168

// Where a curve leaves a card. MCQ cards expose one output per answer
// option, stacked down the right edge at 20/40/60/80% height; every other
// kind has a single centered output.
export function outPortPoint(card: StoryCard, fromPort?: string): { x: number; y: number } {
  if (card.kind === 'mcq' && fromPort?.startsWith('opt-')) {
    const i = Math.max(0, Math.min(3, Number(fromPort.slice(4)) || 0))
    return { x: card.x + NODE_W, y: card.y + NODE_H * ((i + 1) / 5) }
  }
  return { x: card.x + NODE_W, y: card.y + NODE_H / 2 }
}

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

// Model-aware tidy: one horizontal lane per stage, in the model's stage
// order, cards sequenced within their lane. Unassigned cards get a final
// lane of their own. This is how "the tool transforms" around a framework.
export function laneLayout(cards: StoryCard[], connections: Connection[], model: IdModel) {
  if (!model.stages.length) { tidyPositions(cards, connections); return }
  const ordered = orderCards(cards, connections)
  const laneOf = new Map<string, number>(model.stages.map((s, i) => [s.id, i]))
  const laneCounts = new Map<number, number>()
  const LANE_H = NODE_H + 96
  const unassignedLane = model.stages.length

  for (const card of ordered) {
    const lane = laneOf.get(card.stage) ?? unassignedLane
    const col = laneCounts.get(lane) ?? 0
    laneCounts.set(lane, col + 1)
    card.x = 60 + col * (NODE_W + GAP_X)
    card.y = 60 + lane * LANE_H
  }
}
