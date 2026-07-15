// The physical model for the module. Everything the learner measures traces
// back to these numbers, so there is a single honest source of truth: the
// station coordinates and the true epicentre. Distances are Euclidean on a
// flat local km grid (fine for a regional network), and the S-minus-P gap
// follows the classic teaching rule of thumb, distance ≈ (S−P seconds) × 8.

export interface Station {
  id: string        // short code, e.g. "MRA"
  name: string      // place name
  x: number         // km, map east
  y: number         // km, map south (screen down)
}

// The exercise map is a 560 km square. Stations are spread so their three
// range circles cross cleanly at the epicentre.
export const MAP_KM = 560

export const EPICENTRE = { x: 296, y: 322 }

export const STATIONS: Station[] = [
  { id: 'HLM', name: 'Hollowmere', x: 118, y: 128 },
  { id: 'KRS', name: 'Karst Ridge', x: 470, y: 158 },
  { id: 'DVP', name: 'Deepvale', x: 300, y: 502 }
]

// Rule of thumb taught in the module: km ≈ (S−P seconds) × 8.
export const KM_PER_SECOND = 8

export function distanceKm(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function trueDistance(station: Station): number {
  return distanceKm(station, EPICENTRE)
}

/** The genuine S−P gap for a station, in seconds, derived from its true distance. */
export function trueSpSeconds(station: Station): number {
  return trueDistance(station) / KM_PER_SECOND
}

/** Convert a measured S−P gap (seconds) into a distance (km) via the rule of thumb. */
export function spToDistance(spSeconds: number): number {
  return spSeconds * KM_PER_SECOND
}

// ── Seismogram timing ──────────────────────────────────────────────────────
// Each trace shows a fixed time window. P arrives at a fixed offset; S arrives
// S−P seconds later. The learner reads the gap off the time axis.
export const TRACE_WINDOW_S = 64
export const P_ARRIVAL_S = 9

export function sArrivalS(station: Station): number {
  return P_ARRIVAL_S + trueSpSeconds(station)
}

// ── Grading tolerances ─────────────────────────────────────────────────────
export const SP_TOLERANCE_S = 2.2      // measured S−P within ±2.2 s counts as read correctly
export const EPICENTRE_TOLERANCE_KM = 45 // final placement within 45 km counts as located
