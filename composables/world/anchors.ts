/**
 * Satya Space graph. Nexus at the origin. Three zones sit on a 120 degree
 * ring: Elevate forward and up, Empower to starboard, Engage to port.
 * Learn sits between Elevate and Empower. Work nests under Elevate.
 * Dialogue is a short step past Empower. About (`story`) is a long spine behind.
 * Archive hangs below, dimmer.
 *
 * Degrees: 0 is forward (−Z). Positive degrees turn to starboard (+X).
 * Routes live in worldRoutes.ts so this file is not required to read a path.
 */

import { routeFor, type WorldAnchorId } from './worldRoutes'

export type AnchorId = WorldAnchorId

export interface Anchor {
  id: AnchorId
  label: string
  kind: 'nexus' | 'zone' | 'dock'
  /** Degrees on the orbital ring. Null for the nexus and the lower vault. */
  bearing: number | null
  /** Map radius as a fraction of the sheet, 0–0.46. */
  mapRadius: number
  x: number
  y: number
  z: number
  /** Docked camera position. */
  cx: number
  cy: number
  cz: number
  /** Look target. */
  lx: number
  ly: number
  lz: number
  /** Existing site path the full build would open. Empty when there is nowhere to go yet. */
  href: string
  readingTitle: string
  readingDek: string
  readingBody: string
}

export function polar(deg: number, radius: number, y: number): { x: number, y: number, z: number } {
  const a = (deg * Math.PI) / 180
  return {
    x: Math.sin(a) * radius,
    y,
    z: -Math.cos(a) * radius,
  }
}

function cameraFor(
  place: { x: number, y: number, z: number },
  back: number,
  lift: number,
): Pick<Anchor, 'cx' | 'cy' | 'cz' | 'lx' | 'ly' | 'lz'> {
  const len = Math.hypot(place.x, place.z) || 1
  return {
    cx: place.x - (place.x / len) * back,
    cy: place.y + lift,
    cz: place.z - (place.z / len) * back,
    lx: place.x,
    ly: place.y + 0.35,
    lz: place.z,
  }
}

function dock(
  id: AnchorId,
  label: string,
  kind: Anchor['kind'],
  bearing: number | null,
  mapRadius: number,
  place: { x: number, y: number, z: number },
  back: number,
  lift: number,
  readingTitle: string,
  readingDek: string,
  readingBody: string,
): Anchor {
  return {
    id,
    label,
    kind,
    bearing,
    mapRadius,
    x: place.x,
    y: place.y,
    z: place.z,
    ...cameraFor(place, back, lift),
    href: routeFor(id),
    readingTitle,
    readingDek,
    readingBody,
  }
}

const elevate = polar(0, 8.2, 2.4)
const empower = polar(120, 8.2, 0.2)
const engage = polar(-120, 8.2, 0.2)
const learn = polar(60, 5.6, 1.05)
const work = polar(18, 4.8, -0.15)
const dialogue = polar(148, 6.1, 0.25)
const story = polar(180, 16.5, 0.4)
const archive = polar(214, 7.4, -2.8)

export const ANCHORS: readonly Anchor[] = [
  {
    id: 'nexus',
    label: 'Nexus',
    kind: 'nexus',
    bearing: null,
    mapRadius: 0,
    x: 0,
    y: 0,
    z: 0,
    cx: 0,
    cy: 4.8,
    cz: 13.5,
    lx: 0,
    ly: 1.35,
    lz: -1.2,
    href: routeFor('nexus'),
    readingTitle: 'Nexus',
    readingDek: 'Truth alone triumphs.',
    readingBody: 'The still centre of Satya Space. The motto stays in the page, in type you can select. The sculpture in front of you is only the wayfinding mark.',
  },
  dock(
    'elevate',
    'Elevate',
    'zone',
    0,
    0.36,
    elevate,
    7.2,
    1.8,
    'Elevate',
    'Essays from the observatory.',
    'This sheet is the handoff. On the full site the essay index opens here, with the same headings and the same measure as the publication. The world stays behind the paper. Nothing you need to read is painted into the scene.',
  ),
  dock(
    'empower',
    'Empower',
    'zone',
    120,
    0.36,
    empower,
    7.2,
    1.7,
    'Empower',
    'Everyday tools for clearer thinking and work.',
    'The workshop’s tools open in this sheet, not as panels floating in the bay. They run in the browser. This spike only proves the door: the paper, the type, and the way back to the scene.',
  ),
  dock(
    'engage',
    'Engage',
    'zone',
    -120,
    0.36,
    engage,
    7.2,
    1.7,
    'Engage',
    'Short games in the play sphere.',
    'Stack, Mind Reader, and AstroClock keep their own canvases. This sheet is the door into that list. Closing it returns you to the sphere you just docked at.',
  ),
  dock(
    'learn',
    'Learn',
    'dock',
    60,
    0.28,
    learn,
    6.2,
    1.5,
    'Learn',
    'Lessons and courses for people who teach.',
    'Instructional Design, the AI Atlas, and Strong belong on /learn. This sheet is the stub. The link below uses that path.',
  ),
  dock(
    'work',
    'Work',
    'dock',
    16,
    0.24,
    work,
    5.6,
    1.4,
    'Work',
    'Selected projects, starting with SEWA Chronicles.',
    'Case studies stay in Reading Mode. The ring outside is the dock, not the portfolio. The link below goes to /work.',
  ),
  dock(
    'dialogue',
    'Dialogue',
    'dock',
    148,
    0.27,
    dialogue,
    5.8,
    1.35,
    'Dialogue',
    'Pocket comics.',
    'Dialogue keeps its own app chrome. The bay is only the approach. The link below goes to /dialogue, with no trailing slash.',
  ),
  dock(
    'story',
    'About',
    'dock',
    180,
    0.44,
    story,
    8.5,
    1.6,
    'About',
    'Naveen’s route, and the colophon.',
    'The long spine is About. The narrative itself is this sheet, then the about page: ordinary headings, ordinary paragraphs, the same cream paper as an essay.',
  ),
  dock(
    'archive',
    'Archive',
    'dock',
    210,
    0.3,
    archive,
    6.4,
    1.5,
    'Archive',
    'Downloads, the lab, and other side rooms.',
    'The vault is dim on purpose. The link below goes to /archive. Lab and the composer stay unlisted side rooms of that index.',
  ),
]

const BY_ID = new Map(ANCHORS.map((anchor) => [anchor.id, anchor]))

export function anchorById(id: AnchorId): Anchor {
  const found = BY_ID.get(id)
  if (!found) throw new Error(`Unknown anchor: ${id}`)
  return found
}

/** Screen position for the 2D map. Forward (0°) is up. */
export function mapPosition(anchor: Anchor): { left: string, top: string } {
  if (anchor.id === 'nexus') return { left: '50%', top: '50%' }
  const deg = anchor.bearing ?? 0
  const a = (deg * Math.PI) / 180
  const r = anchor.mapRadius * 100
  const left = 50 + Math.sin(a) * r
  const top = 50 - Math.cos(a) * r
  return { left: `${left}%`, top: `${top}%` }
}
