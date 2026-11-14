export type WorldAnchorId =
  | 'elevate'
  | 'empower'
  | 'engage'
  | 'learn'
  | 'story'
  | 'work'
  | 'dialogue'
  | 'archive'
  | 'about'

export interface WorldZoneLink {
  id: WorldAnchorId
  label: string
  route: string
}

export const WORLD_ZONE_LINKS: WorldZoneLink[] = [
  { id: 'elevate', label: 'Elevate', route: '/elevate' },
  { id: 'empower', label: 'Empower', route: '/empower' },
  { id: 'engage', label: 'Engage', route: '/engage' },
  { id: 'learn', label: 'Learn', route: '/learn' },
  { id: 'story', label: 'About', route: '/about' },
  { id: 'work', label: 'Work', route: '/work' },
  { id: 'dialogue', label: 'Dialogue', route: '/dialogue' },
  { id: 'archive', label: 'Archive', route: '/archive' },
  { id: 'about', label: 'About', route: '/about' }
]
