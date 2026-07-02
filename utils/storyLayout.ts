import type { Connection, Scene } from '~/types/story'
import { lastInSequence, orderScenes } from './storyGraph'

export const NODE_W = 260
export const NODE_H = 176

// New scenes "snap" onto the end of the current chain — placed in a gentle
// flowing wave so a freshly generated storyboard reads as one continuous
// path across the canvas instead of a rigid grid.
export function nextAutoPosition(scenes: Scene[], connections: Connection[]): { x: number; y: number } {
  const GAP_X = 130
  const BASE_Y = 160
  const WAVE = 100
  const last = lastInSequence(scenes, connections)
  if (!last) return { x: 60, y: BASE_Y }
  const step = orderScenes(scenes, connections).length
  return { x: last.x + NODE_W + GAP_X, y: Math.max(40, BASE_Y + Math.sin(step * 0.7) * WAVE) }
}
