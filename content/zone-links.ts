/**
 * Spec §4.4 ZoneLinks. One list. Nav, footer, and (later) RmError read it.
 *
 * TODO: re-export WORLD_ZONE_LINKS from composables/world/worldRoutes.ts
 * once PR #78 lands. Do not hand-copy these rows into a component.
 * About Orbit's id is `story` (spec §4.1). The label stays "About".
 */
export type WorldZoneId =
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
  id: WorldZoneId
  label: string
  route: string
}

export const WORLD_ZONE_LINKS: readonly WorldZoneLink[] = [
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

export function zoneLink(id: WorldZoneId): WorldZoneLink {
  const link = WORLD_ZONE_LINKS.find((item) => item.id === id)
  if (!link) throw new Error(`Unknown zone ${id}`)
  return link
}
