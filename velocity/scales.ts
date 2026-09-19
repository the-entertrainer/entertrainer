export type ScaleId = 'earth' | 'sun' | 'galaxy' | 'cosmos' | 'helix'

export interface ScaleDef {
  id: ScaleId
  name: string
  kicker: string
  kms: number
  icon: string
  equivalent: (kms: number) => string
  story: string[]
}

const EQ_KM = 40075

export const SCALES: ScaleDef[] = [
  {
    id: 'earth',
    name: 'Earth spin',
    kicker: 'Surface rotation',
    kms: 1670,
    icon: 'spin',
    equivalent: (kms) => `${(kms / EQ_KM).toFixed(2)} equator lengths / hour`,
    story: [
      'The ground is already moving. At the equator the surface travels about 1,670 kilometres an hour. That number falls with the cosine of latitude.',
      'One blink, ten kilometres. You do not feel it because the room is on the same circle.',
    ],
  },
  {
    id: 'sun',
    name: 'Solar orbit',
    kicker: 'Earth around the Sun',
    kms: 107000,
    icon: 'orbit',
    equivalent: (kms) => `${(kms / EQ_KM).toFixed(1)} equator lengths / hour`,
    story: [
      'The planet is falling around the Sun at about 107,000 kilometres an hour. A year is that orbit.',
      'The seasons are a tilt, not a speed change.',
    ],
  },
  {
    id: 'galaxy',
    name: 'Galactic orbit',
    kicker: 'Sun around the core',
    kms: 828000,
    icon: 'arm',
    equivalent: (kms) => `${(kms / EQ_KM).toFixed(0)} equator lengths / hour`,
    story: [
      'The Sun rides the disc at about 828,000 kilometres an hour. One loop takes about 230 million years.',
      'The spiral is a reconstruction from motion and dust. We have no photograph from outside.',
    ],
  },
  {
    id: 'cosmos',
    name: 'CMB flow',
    kicker: 'Against leftover light',
    kms: 2200000,
    icon: 'dipole',
    equivalent: (kms) => `${(kms / 370).toFixed(0)} × 370 km/s rest-frame dipole`,
    story: [
      'The microwave sky is slightly warmer in one direction. That dipole is our motion relative to the early-universe rest frame — about 370 km/s.',
      'Warm trails mark the direction we are heading. Cool trails mark the direction we came from.',
    ],
  },
  {
    id: 'helix',
    name: 'Helical path',
    kicker: 'Sun through the disc',
    kms: 828000,
    icon: 'helix',
    equivalent: () => 'orbit + bob of the disc, drawn as a corkscrew',
    story: [
      'The Sun does not sit still in the galactic plane. It bobbs above and below as it orbits, so the path through space is a long, shallow helix.',
      'The corkscrew is the honest picture. The flat orbit is the projection.',
    ],
  },
]

export const NEXT_UNIT = { 'km/h': 'mph', mph: 'km/s', 'km/s': 'km/h' } as const
export type SpeedUnit = keyof typeof NEXT_UNIT

export function spinKms(latDeg: number): number {
  const lat = Math.max(-90, Math.min(90, latDeg))
  return 1670 * Math.cos((lat * Math.PI) / 180)
}

export function latHemisphere(lat: number): string {
  if (Math.abs(lat) < 0.4) return 'equator'
  return lat >= 0 ? `${lat.toFixed(1)}°N` : `${Math.abs(lat).toFixed(1)}°S`
}

export function formatSpeed(kms: number, unit: SpeedUnit, locale = 'en-US'): string {
  const n = unit === 'mph' ? kms * 0.621371 : unit === 'km/s' ? kms / 3600 : kms
  const digits = unit === 'km/s' ? (n >= 10 ? 0 : 2) : 0
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(n)} ${unit}`
}

export function speedForScale(id: ScaleId, lat: number): number {
  if (id === 'earth') return spinKms(lat)
  return SCALES.find((s) => s.id === id)?.kms ?? 0
}

export function formatDistance(km: number, unit: SpeedUnit): string {
  const n = unit === 'mph' ? km * 0.621371 : unit === 'km/s' ? km / 3600 : km
  const label = unit === 'mph' ? 'mi' : unit === 'km/s' ? 'km' : 'km'
  if (n > 1e6) return `${(n / 1e6).toFixed(3)} M${label}`
  if (n > 1000) return `${(n / 1000).toFixed(2)} k${label}`
  return `${n.toFixed(1)} ${label}`
}
