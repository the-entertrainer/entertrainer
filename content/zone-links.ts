/**
 * Shared ZoneLinks list (design spec §4.4).
 *
 * RmError and Reading Mode import `WORLD_ZONE_LINKS` from this module.
 * Do not copy the rows into a component.
 *
 * Shape is `{ id, label, route }` with no trailing slash. About Orbit's id is
 * `story` (spec §4.1); the label stays "About" and the route is `/about`.
 *
 * TODO: re-export from the world shell once `composables/world/worldRoutes.ts`
 * is on this branch (PR #78). That file owns the same export name and shape.
 * Replace the array below with:
 *
 *   export { WORLD_ZONE_LINKS } from '~/composables/world/worldRoutes'
 *
 * Keep this module as the import path so error.vue does not need a second edit.
 */

export interface ZoneLink {
  id: 'nexus' | 'elevate' | 'empower' | 'engage' | 'learn' | 'work' | 'dialogue' | 'story' | 'archive'
  label: string
  route: string
}

export const WORLD_ZONE_LINKS: readonly ZoneLink[] = [
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
