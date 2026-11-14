/**
 * Satya Space routes. No three.js. Reading Mode and RmError import this file
 * without loading the world engine.
 *
 * Anchor ids follow the design spec (§4.1): About Orbit is `story`, not `about`.
 * The shell proposal listed `about` as the id; the spec wins, and the label
 * stays "About".
 *
 * Dialogue's path is `/dialogue` with no trailing slash (spec §4.4 and §9.9).
 * `/learn`, `/work`, and `/archive` are the dock routes.
 */

export type WorldAnchorId =
  | 'nexus'
  | 'elevate'
  | 'empower'
  | 'engage'
  | 'learn'
  | 'work'
  | 'dialogue'
  | 'story'
  | 'archive'

export type WorldAnchorKind = 'nexus' | 'zone' | 'dock'

export interface WorldZoneLink {
  id: WorldAnchorId
  kind: WorldAnchorKind
  label: string
  route: string
}

export const WORLD_ANCHORS: readonly WorldZoneLink[] = [
  { id: 'nexus', kind: 'nexus', label: 'Nexus', route: '/' },
  { id: 'elevate', kind: 'zone', label: 'Elevate', route: '/elevate' },
  { id: 'empower', kind: 'zone', label: 'Empower', route: '/empower' },
  { id: 'engage', kind: 'zone', label: 'Engage', route: '/engage' },
  { id: 'learn', kind: 'dock', label: 'Learn', route: '/learn' },
  { id: 'work', kind: 'dock', label: 'Work', route: '/work' },
  { id: 'dialogue', kind: 'dock', label: 'Dialogue', route: '/dialogue' },
  { id: 'story', kind: 'dock', label: 'About', route: '/about' },
  { id: 'archive', kind: 'dock', label: 'Archive', route: '/archive' },
]

/**
 * Spec §4.4 calls this list ZoneLinks and shows `content/zone-links.ts` as
 * one place it could live. The export name and file here are the shell
 * contract: `{ id, label, route }` only, derived from WORLD_ANCHORS, no
 * three.js and no side effects. RmError and WorldFallbackPoster both use it.
 */
export const WORLD_ZONE_LINKS: readonly { id: WorldAnchorId, label: string, route: string }[] =
  WORLD_ANCHORS.map(({ id, label, route }) => ({ id, label, route }))

const BY_ID = new Map(WORLD_ANCHORS.map((link) => [link.id, link]))

const IDS = new Set<string>(WORLD_ANCHORS.map((link) => link.id))

export function isWorldAnchorId(value: unknown): value is WorldAnchorId {
  return typeof value === 'string' && IDS.has(value)
}

export function routeFor(id: WorldAnchorId): string {
  return BY_ID.get(id)?.route ?? '/'
}

/**
 * Reading Mode's "back to space" control. Unknown ids, and the nexus itself,
 * are plain `/`.
 */
export function worldReturnPath(id: unknown): string {
  if (!isWorldAnchorId(id) || id === 'nexus') return '/'
  return `/?at=${id}`
}

export const WORLD_ARRIVAL: Record<WorldAnchorId, string> = {
  nexus: 'Entering the Nexus.',
  elevate: 'Entering Observatory.',
  empower: 'Entering Workshop.',
  engage: 'Entering Play Sphere.',
  learn: 'Entering Learn Dock.',
  work: 'Entering Work Ring.',
  dialogue: 'Entering Dialogue Bay.',
  story: 'Entering About.',
  archive: 'Entering Archive.',
}

type TravelHandler = (id: WorldAnchorId) => void
type ExitHandler = (id: WorldAnchorId) => Promise<void>

let travelHandler: TravelHandler | null = null
let exitHandler: ExitHandler | null = null

/** The mounted shell registers these. Unmount clears them. */
export function bindWorldNavigation(handlers: { travelTo: TravelHandler, enterReading: ExitHandler }) {
  travelHandler = handlers.travelTo
  exitHandler = handlers.enterReading
  return () => {
    if (travelHandler === handlers.travelTo) travelHandler = null
    if (exitHandler === handlers.enterReading) exitHandler = null
  }
}

/**
 * `travelTo` moves the camera and leaves the route alone.
 * `enterReading` plays the exit, then opens that anchor's route.
 */
export function useWorldNavigation() {
  return {
    travelTo(id: WorldAnchorId) {
      if (!isWorldAnchorId(id)) return
      travelHandler?.(id)
    },
    async enterReading(id: WorldAnchorId) {
      if (!isWorldAnchorId(id)) return
      if (exitHandler) {
        await exitHandler(id)
        return
      }
      await navigateTo(routeFor(id))
    },
  }
}
