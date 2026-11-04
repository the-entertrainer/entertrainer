/**
 * Routes for Satya Space. No three.js imports: nav, the poster, and RmError
 * can import this file without pulling the world engine into their chunks.
 *
 * Paths are bare. The site does not use trailing slashes. The id for About
 * stays `story` (About Orbit). `/learn`, `/work`, and `/archive` are real
 * routes owned by the shell work; this module does not create those pages.
 *
 * The shell PR mounts the world at `/` and calls `enterReading(id)`, which
 * plays the exit and then `navigateTo(route)`. Return to the world is
 * `/?at=<id>`. Unknown ids fall back to `/`.
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

export interface WorldZoneLink {
  id: WorldAnchorId
  label: string
  /** Bare path. No trailing slash. */
  route: string
}

/**
 * Nexus, Elevate, Empower, Engage, Learn, Work, Dialogue, About, Archive.
 * WorldFallbackPoster and RmError both render this list.
 */
export const WORLD_ANCHORS: readonly WorldZoneLink[] = [
  { id: 'nexus', label: 'Nexus', route: '/' },
  { id: 'elevate', label: 'Elevate', route: '/elevate' },
  { id: 'empower', label: 'Empower', route: '/empower' },
  { id: 'engage', label: 'Engage', route: '/engage' },
  { id: 'learn', label: 'Learn', route: '/learn' },
  { id: 'work', label: 'Work', route: '/work' },
  { id: 'dialogue', label: 'Dialogue', route: '/dialogue' },
  { id: 'story', label: 'About', route: '/about' },
  { id: 'archive', label: 'Archive', route: '/archive' },
]

export const WORLD_ZONE_LINKS: readonly WorldZoneLink[] = WORLD_ANCHORS.map((link) => ({
  id: link.id,
  label: link.label,
  route: link.route,
}))

const BY_ID = new Map(WORLD_ANCHORS.map((link) => [link.id, link]))

export function routeFor(id: WorldAnchorId): string {
  return BY_ID.get(id)?.route ?? '/'
}

/** Screen-reader line when a dock finishes. Not updated per camera frame. */
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
