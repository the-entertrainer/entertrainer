/**
 * Educational kinematics, not navigation telemetry. Units: km, seconds, radians.
 * Earth–Moon barycentre: JPL approximate elements (1800–2050).
 * Spin: WGS84 ellipsoid, sea level; UT1≈UTC, neglect precession/nutation.
 * Galaxy: Eilers+2019 circular speed + Schoenrich+2010 solar peculiar motion.
 * CMB: Planck 2018 solar dipole. See SOURCES.md for limits and provenance.
 */
import type { ScaleId } from "./scales";
export type Vec3 = [number, number, number];
export const DEG = Math.PI / 180;
export const AU_KM = 149597870.7;
export const C_KM_S = 299792.458;
export const SIDEREAL_DAY = 86164.0905;
export const EARTH_RADIUS_KM = 6378.137;
export const CMB_SPEED_KM_S = 369.82;
const OBLIQUITY = 23.43928 * DEG;
export const add = (...vectors: Vec3[]): Vec3 =>
  vectors.reduce<Vec3>(
    (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    [0, 0, 0],
  );
export const magnitude = (v: Vec3): number => Math.hypot(...v);
const scaleVector = (v: Vec3, k: number): Vec3 => [
  v[0] * k,
  v[1] * k,
  v[2] * k,
];
export function galacticToEquatorial(v: Vec3): Vec3 {
  // Transpose of the standard ICRS -> Galactic rotation matrix.
  return [
    -0.0548755604 * v[0] + 0.4941094279 * v[1] - 0.867666149 * v[2],
    -0.8734370902 * v[0] - 0.44482963 * v[1] - 0.1980763734 * v[2],
    -0.4838350155 * v[0] + 0.7469822445 * v[1] + 0.4559837762 * v[2],
  ];
}
export function sphericalVector(
  longitude: number,
  latitude: number,
  length = 1,
): Vec3 {
  const l = longitude * DEG,
    b = latitude * DEG;
  return [
    length * Math.cos(b) * Math.cos(l),
    length * Math.cos(b) * Math.sin(l),
    length * Math.sin(b),
  ];
}
export const SOLAR_CMB_VECTOR = galacticToEquatorial(
  sphericalVector(264.021, 48.253, CMB_SPEED_KM_S),
);
export const SOLAR_GALACTIC_VECTOR = galacticToEquatorial([
  11.1,
  229 + 12.24,
  7.25,
]);
export const julianDate = (date: Date): number =>
  date.getTime() / 86400000 + 2440587.5;
export function siderealAngle(date: Date): number {
  const d = julianDate(date) - 2451545,
    t = d / 36525;
  return (
    ((280.46061837 +
      360.98564736629 * d +
      0.000387933 * t * t -
      (t * t * t) / 38710000) %
      360) *
    DEG
  );
}
export function rotationVelocity(
  date: Date,
  latitude: number,
  longitude: number,
): Vec3 {
  const lat = Math.max(-90, Math.min(90, latitude)) * DEG;
  const eccentricitySquared = 6.69437999014e-3;
  const radius =
    (EARTH_RADIUS_KM /
      Math.sqrt(1 - eccentricitySquared * Math.sin(lat) ** 2)) *
    Math.cos(lat);
  const speed = (2 * Math.PI * radius) / SIDEREAL_DAY;
  const angle = siderealAngle(date) + longitude * DEG;
  return [-speed * Math.sin(angle), speed * Math.cos(angle), 0];
}
export interface OrbitState {
  position: Vec3;
  velocity: Vec3;
  radiusAU: number;
  trueLongitude: number;
  eccentricity: number;
  meanAnomaly: number;
}
export function earthOrbit(date: Date): OrbitState {
  const year = date.getUTCFullYear();
  if (year < 1800 || year > 2050 || !Number.isFinite(date.getTime()))
    throw new RangeError("The orbital model covers 1800–2050.");
  const t = (julianDate(date) - 2451545) / 36525;
  const a = 1.00000261 + 0.00000562 * t,
    e = 0.01671123 - 0.00004392 * t;
  const inclination = (-0.00001531 - 0.01294668 * t) * DEG;
  const peri = (102.93768193 + 0.32327364 * t) * DEG;
  const mean =
    ((100.46457166 + 35999.37244981 * t) * DEG - peri) % (2 * Math.PI);
  let eccentric = mean;
  for (let i = 0; i < 12; i++)
    eccentric -=
      (eccentric - e * Math.sin(eccentric) - mean) /
      (1 - e * Math.cos(eccentric));
  const x = a * (Math.cos(eccentric) - e),
    y = a * Math.sqrt(1 - e * e) * Math.sin(eccentric);
  const denominator = 1 - e * Math.cos(eccentric);
  const n = Math.sqrt(1.32712440018e11 / (a * AU_KM) ** 3);
  const vx = (-a * AU_KM * n * Math.sin(eccentric)) / denominator,
    vy =
      (a * AU_KM * n * Math.sqrt(1 - e * e) * Math.cos(eccentric)) /
      denominator;
  function rotate(x: number, y: number): Vec3 {
    const xe = Math.cos(peri) * x - Math.sin(peri) * y;
    const ye =
      (Math.sin(peri) * x + Math.cos(peri) * y) * Math.cos(inclination);
    const ze =
      (Math.sin(peri) * x + Math.cos(peri) * y) * Math.sin(inclination);
    return [
      xe,
      Math.cos(OBLIQUITY) * ye - Math.sin(OBLIQUITY) * ze,
      Math.sin(OBLIQUITY) * ye + Math.cos(OBLIQUITY) * ze,
    ];
  }
  return {
    position: scaleVector(rotate(x, y), AU_KM),
    velocity: rotate(vx, vy),
    radiusAU: Math.hypot(x, y),
    trueLongitude: Math.atan2(y, x) + peri,
    eccentricity: e,
    meanAnomaly: mean,
  };
}
export interface MotionSnapshot {
  speeds: Record<ScaleId, number>;
  vectors: Record<ScaleId, Vec3>;
  orbit: OrbitState;
  timestamp: number;
}
export function snapshot(
  date: Date,
  latitude: number,
  longitude: number,
): MotionSnapshot {
  if (![latitude, longitude].every(Number.isFinite))
    throw new RangeError("Choose a valid location.");
  const orbit = earthOrbit(date),
    spin = rotationVelocity(date, latitude, longitude);
  const solar = add(orbit.velocity, spin);
  const vectors: Record<ScaleId, Vec3> = {
    earth: spin,
    sun: solar,
    galaxy: add(SOLAR_GALACTIC_VECTOR, solar),
    cosmos: add(SOLAR_CMB_VECTOR, solar),
  };
  return {
    vectors,
    speeds: {
      earth: magnitude(spin),
      sun: magnitude(solar),
      galaxy: magnitude(vectors.galaxy),
      cosmos: magnitude(vectors.cosmos),
    },
    orbit,
    timestamp: date.getTime(),
  };
}
/** Clock integration stays separate from animation speed and unit preference. */
export function advanceDistance(
  previous: Record<ScaleId, number>,
  speeds: Record<ScaleId, number>,
  elapsedSeconds: number,
): Record<ScaleId, number> {
  const dt = Math.max(0, elapsedSeconds);
  return {
    earth: previous.earth + speeds.earth * dt,
    sun: previous.sun + speeds.sun * dt,
    galaxy: previous.galaxy + speeds.galaxy * dt,
    cosmos: previous.cosmos + speeds.cosmos * dt,
  };
}
