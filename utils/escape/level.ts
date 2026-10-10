/** Seeded layouts for Escape. Same seed + escape count → same room. */

export type RoomKind = 'flat' | 'cylinder' | 'rings'

export interface RingSpec {
  x: number
  z: number
  destX: number
  destZ: number
  yaw: number
  radius: number
}

export interface LevelSpec {
  kind: RoomKind
  hx: number
  hz: number
  /** Yaw added when a flat-room wall wraps the player. */
  yawKick: number
  door: { x: number; z: number; yaw: number }
  rings: RingSpec[]
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function mixSeed(seed: number, escapeCount: number) {
  return (seed ^ Math.imul(escapeCount + 1, 0x9e3779b9)) >>> 0
}

export function buildLevel(seed: number, escapeCount: number): LevelSpec {
  const rnd = mulberry32(mixSeed(seed, escapeCount))
  const kinds: RoomKind[] = ['flat', 'cylinder', 'rings']
  const kind = kinds[escapeCount % 3]!
  const hx = 6 + rnd() * 3.5
  const hz = kind === 'cylinder' ? 11 + rnd() * 5 : 6 + rnd() * 3.5
  const kicks = [0, Math.PI / 2, Math.PI] as const
  const yawKick = kicks[Math.floor(rnd() * kicks.length)]!
  const door = {
    x: (rnd() * 2 - 1) * hx * 0.42,
    z: (rnd() * 2 - 1) * hz * 0.42,
    yaw: rnd() * Math.PI * 2
  }
  const rings: RingSpec[] = []
  if (kind === 'rings') {
    const count = 2 + Math.floor(rnd() * 2)
    for (let i = 0; i < count; i++) {
      rings.push({
        x: (rnd() * 2 - 1) * hx * 0.55,
        z: (rnd() * 2 - 1) * hz * 0.55,
        destX: (rnd() * 2 - 1) * hx * 0.55,
        destZ: (rnd() * 2 - 1) * hz * 0.55,
        yaw: rnd() * Math.PI * 2,
        radius: 0.9 + rnd() * 0.35
      })
    }
  }
  return { kind, hx, hz, yawKick, door, rings }
}
