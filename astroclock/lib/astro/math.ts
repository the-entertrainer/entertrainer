import * as Astronomy from 'astronomy-engine';
import { DEG, RAD } from './constants';

/** Julian Day Number (UTC) from Date — Meeus */
export function julianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const D =
    date.getUTCDate() +
    (date.getUTCHours() +
      (date.getUTCMinutes() +
        (date.getUTCSeconds() + date.getUTCMilliseconds() / 1000) / 60) /
        60) /
      24;
  let Y = y;
  let M = m;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

/** Centuries from J2000.0 */
export function centuriesJ2000(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/** JD (UTC) → JS Date */
export function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

/** astronomy-engine time (handles UTC→TT / ΔT internally) */
export function astroTime(jd: number): Astronomy.AstroTime {
  return Astronomy.MakeTime(jdToDate(jd));
}

/**
 * Greenwich *apparent* sidereal time in hours (IAU 2006 ERA + equation of
 * the equinoxes, via astronomy-engine).
 */
export function gmst(jd: number): number {
  return Astronomy.SiderealTime(jdToDate(jd));
}

/** Local (apparent) Sidereal Time in hours */
export function lst(jd: number, lonDeg: number): number {
  return (((gmst(jd) + lonDeg / 15) % 24) + 24) % 24;
}

/** True obliquity of the ecliptic (degrees), IAU 2006 + nutation */
export function obliquity(jd: number): number {
  return Astronomy.e_tilt(astroTime(jd)).tobl;
}

/** Nutation in longitude Δψ (degrees) */
export function nutationLon(jd: number): number {
  return Astronomy.e_tilt(astroTime(jd)).dpsi / 3600;
}

/** IAU 2006 general precession in longitude p_A (arcsec), T in Julian centuries TT */
function generalPrecession(T: number): number {
  return (
    5028.796195 * T +
    1.1054348 * T * T +
    0.00007964 * T * T * T -
    0.000023857 * T * T * T * T
  );
}

/** Lahiri reference epoch (Swiss Ephemeris SE_SIDM_LAHIRI): 1956-09-22, 23°15'00.658" */
const LAHIRI_T0_JD = 2435553.5;
const LAHIRI_T0_AYA = 23.250182778;

/**
 * True Lahiri (Chitrapaksha) ayanamsha in degrees: mean value carried by
 * IAU 2006 precession from the 1956 Indian Ephemeris anchor, plus nutation
 * (so it subtracts cleanly from true-of-date longitudes).
 */
export function lahiriAyanamsha(jd: number): number {
  const T = centuriesJ2000(jd);
  const T0 = centuriesJ2000(LAHIRI_T0_JD);
  const mean = LAHIRI_T0_AYA + (generalPrecession(T) - generalPrecession(T0)) / 3600;
  return mean + nutationLon(jd);
}

export function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

export function shortestArc(a: number, b: number): number {
  let d = norm360(a - b);
  if (d > 180) d -= 360;
  return d;
}

export function absShortest(a: number, b: number): number {
  return Math.abs(shortestArc(a, b));
}

/** Tropical → sidereal */
export function toSidereal(tropLon: number, jd: number): number {
  return norm360(tropLon - lahiriAyanamsha(jd));
}

/**
 * Ascendant (tropical) from LST hours & latitude, then convert to sidereal.
 */
export function ascendant(
  lstHours: number,
  latDeg: number,
  jd: number,
): { tropical: number; sidereal: number } {
  const eps = obliquity(jd) * DEG;
  const ramc = lstHours * 15 * DEG;
  const phi = latDeg * DEG;
  const y = Math.cos(ramc);
  const x = -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps));
  let ascTrop = Math.atan2(y, x) * RAD;
  ascTrop = norm360(ascTrop);
  return {
    tropical: ascTrop,
    sidereal: toSidereal(ascTrop, jd),
  };
}

export function clamp(n: number, a: number, b: number): number {
  const v = Number.isFinite(n) ? n : a;
  return Math.max(a, Math.min(b, v));
}
