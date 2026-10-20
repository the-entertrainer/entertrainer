import {
  ASPECT_ANGLES,
  ASPECT_ORB,
  DEG,
  GRAHAS,
  type GrahaId,
  type LonMap,
  type MeanKey,
  type PlanetMap,
  type SpeedMap,
  NAKSHATRAS,
  RASHIS,
  TITHI_NAMES,
} from './constants';
import * as Astronomy from 'astronomy-engine';
import {
  absShortest,
  astroTime,
  lahiriAyanamsha,
  norm360,
  shortestArc,
} from './math';

export interface MeanElements {
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  rahu: number;
  ketu: number;
}

/**
 * Geocentric apparent tropical ecliptic longitudes (true equinox of date), degrees.
 * Sun, Moon and the five planets come from astronomy-engine (VSOP87 / ELP
 * truncations, light-time + aberration corrected, arcsecond-level accuracy).
 * Rahu/Ketu use the mean lunar node (Meeus 47.7), the common Vedic default.
 */
export function meanElements(jd: number): MeanElements {
  const time = astroTime(jd);
  const geo = (body: Astronomy.Body) =>
    norm360(Astronomy.Ecliptic(Astronomy.GeoVector(body, time, true)).elon);
  const T = time.tt / 36525;
  const Omega = norm360(
    125.0445479 -
      1934.1362891 * T +
      0.0020754 * T * T +
      (T * T * T) / 467441 -
      (T * T * T * T) / 60616000,
  );
  return {
    sun: norm360(Astronomy.SunPosition(time).elon),
    moon: norm360(Astronomy.EclipticGeoMoon(time).lon),
    mercury: geo(Astronomy.Body.Mercury),
    venus: geo(Astronomy.Body.Venus),
    mars: geo(Astronomy.Body.Mars),
    jupiter: geo(Astronomy.Body.Jupiter),
    saturn: geo(Astronomy.Body.Saturn),
    rahu: Omega,
    ketu: norm360(Omega + 180),
  };
}

/** All graha sidereal longitudes + tropical for reference */
export function computePlanets(jd: number): PlanetMap {
  const el = meanElements(jd);
  const aya = lahiriAyanamsha(jd);
  const out = {} as PlanetMap;
  for (const g of GRAHAS) {
    const trop = el[g.meanKey as MeanKey];
    out[g.id] = {
      tropical: trop,
      sidereal: norm360(trop - aya),
    };
  }
  return out;
}

/** Speed °/day via finite difference (~1 hour) */
export function computeSpeeds(jd: number): SpeedMap {
  const dt = 1 / 24;
  const p0 = computePlanets(jd);
  const p1 = computePlanets(jd + dt);
  const speeds = {} as SpeedMap;
  for (const g of GRAHAS) {
    const dLon = shortestArc(p1[g.id].sidereal, p0[g.id].sidereal);
    speeds[g.id] = dLon * 24;
  }
  if (speeds.Rahu > 0) speeds.Rahu = -Math.abs(speeds.Rahu);
  if (speeds.Ketu > 0) speeds.Ketu = -Math.abs(speeds.Ketu);
  return speeds;
}

export function rashiIndex(sidLon: number): number {
  return Math.floor(norm360(sidLon) / 30) % 12;
}

export function rashiName(sidLon: number): string {
  return RASHIS[rashiIndex(sidLon)].sa;
}

export function nakshatraInfo(sidLon: number): {
  index: number;
  name: string;
  pada: number;
} {
  const lon = norm360(sidLon);
  const span = 360 / 27;
  const idx = Math.floor(lon / span) % 27;
  const pada = Math.floor((lon % span) / (span / 4)) + 1;
  return { index: idx, name: NAKSHATRAS[idx], pada };
}

export function computeTithi(
  moonSid: number,
  sunSid: number,
): { num: number; name: string; paksha: string; label: string } {
  const diff = norm360(moonSid - sunSid);
  const num = Math.floor(diff / 12) + 1;
  const paksha = num <= 15 ? 'Shukla' : 'Krishna';
  const name = TITHI_NAMES[num - 1];
  return { num, name, paksha, label: `${paksha} ${name}` };
}

/** Whole-sign house 1–12 from planet sidereal & Lagna sidereal */
export function wholeSignHouse(planetSid: number, lagnaSid: number): number {
  const pSign = rashiIndex(planetSid);
  const lSign = rashiIndex(lagnaSid);
  return ((pSign - lSign + 12) % 12) + 1;
}

/** Harmonic Resonance Score 0–100 from aspect density + angular harmony */
export function harmonicScore(planets: PlanetMap): number {
  const ids = GRAHAS.map((g) => g.id);
  let score = 40;
  let soft = 0;
  let hard = 0;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const d = absShortest(planets[ids[i]].sidereal, planets[ids[j]].sidereal);
      for (const a of ASPECT_ANGLES) {
        if (Math.abs(d - a) <= ASPECT_ORB) {
          if (a === 60 || a === 120 || a === 0) soft++;
          else hard++;
          const tight = 1 - Math.abs(d - a) / ASPECT_ORB;
          score += tight * (a === 0 || a === 120 ? 4 : a === 60 ? 3 : 2);
        }
      }
    }
  }
  score += soft * 1.5 - hard * 0.5;
  const ms = absShortest(planets.Moon.sidereal, planets.Sun.sidereal);
  if (Math.abs(ms - 180) < 8 || ms < 8) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function lonMapFromPlanets(planets: PlanetMap): LonMap {
  const next = {} as LonMap;
  for (const g of GRAHAS) next[g.id] = planets[g.id].sidereal;
  return next;
}

export function findAspect(
  a: number,
  b: number,
): { angle: number; tight: number } | null {
  const d = absShortest(a, b);
  for (const ang of ASPECT_ANGLES) {
    if (Math.abs(d - ang) <= ASPECT_ORB) {
      return { angle: ang, tight: 1 - Math.abs(d - ang) / ASPECT_ORB };
    }
  }
  return null;
}

export type { GrahaId, LonMap, PlanetMap, SpeedMap };
