import type { Face, StoryCard } from './cards'

export type Mood = 'scheme' | 'heat'
export type Scene =
  | 'rally' | 'studio' | 'office' | 'court' | 'street'
  | 'ashram' | 'market' | 'dome' | 'tent' | 'colony'

const FACE_SCENE: Record<Face, Scene> = {
  pinky: 'office',
  nandini: 'studio',
  baba: 'ashram',
  lalaji: 'market',
  chintu: 'studio',
  kisan: 'street',
  mausi: 'colony',
  hakim: 'office',
  envoy: 'tent',
  captain: 'dome',
  justice: 'court',
  netaji: 'rally'
}

const HEAT_IDS = new Set([
  'names_due', 'hole_due', 'tiger', 'committee', 'forty_stops',
  'vent_due', 'drain_due', 'hundred_due', 'immortal'
])

const SCENE_BY_ID: Record<string, Scene> = {
  oath_now: 'rally',
  oath_later: 'dome',
  committee: 'court',
  forty_stops: 'rally',
  tiger: 'street'
}

export function moodOf(card: StoryCard): Mood {
  return HEAT_IDS.has(card.id) ? 'heat' : 'scheme'
}

export function sceneOf(card: StoryCard): Scene {
  return SCENE_BY_ID[card.id] ?? FACE_SCENE[card.face] ?? 'office'
}

export function lookOf(card: StoryCard) {
  const mood = moodOf(card)
  return {
    src: `/netagiri/cast/${card.face}-${mood}.png`,
    scene: sceneOf(card),
    mood
  }
}
