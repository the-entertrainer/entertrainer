/** All model speeds are km/s. Formatting never changes stored distances. */
export type ScaleId = "earth" | "sun" | "galaxy" | "cosmos";
export type SpeedUnit = "km/h" | "km/s" | "mph";
export interface ScaleDef {
  id: ScaleId;
  name: string;
  label: string;
  headline: string;
  reference: string;
  description: string;
  sceneNote: string;
  period: string;
  animation: string;
  fact: string;
}
export const SCALES: ScaleDef[] = [
  {
    id: "earth",
    name: "Earth",
    label: "The ground beneath you",
    headline: "Standing still. Still moving.",
    reference: "Earth’s centre · non-rotating frame",
    description:
      "Earth turns, carrying you with it. Near the equator you travel farther with every turn. At the poles, that circle shrinks to almost nothing.",
    sceneNote:
      "Earth surface textures · illustrative clouds · accelerated rotation",
    period: "One turn ≈ 23 h 56 min",
    animation: "One Earth turn / 48 seconds",
    fact: "You, the ground and most of the air are moving together. You do not feel speed itself; you feel changes in motion.",
  },
  {
    id: "sun",
    name: "Sun",
    label: "Our yearly journey",
    headline: "A whole planet. In motion.",
    reference: "The Sun",
    description:
      "While Earth spins, it also moves around the Sun. Its orbit is slightly oval, so our speed changes through the year. Your local rotation adds a smaller motion.",
    sceneNote:
      "Orbital shape retained · bodies enlarged · distances compressed",
    period: "One orbit ≈ 365.26 days",
    animation: "One Earth orbit / 60 seconds",
    fact: "Earth moves faster near the Sun in January and slower in July. Seasons mostly come from the tilt of Earth’s axis.",
  },
  {
    id: "galaxy",
    name: "Milky Way",
    label: "Our neighbourhood moves too",
    headline: "The Sun comes along.",
    reference: "The centre of the Milky Way",
    description:
      "The Sun carries its planets around our galaxy. Earth’s orbit and your local spin change your speed relative to the galactic centre a little throughout the year.",
    sceneNote:
      "Illustrative barred-spiral reconstruction · not an outside photograph",
    period: "One circuit ≈ 210 million years in this model",
    animation: "One galactic circuit / 90 seconds",
    fact: "We live inside the Milky Way. Its outside appearance is reconstructed from observations, not photographed from beyond it.",
  },
  {
    id: "cosmos",
    name: "Ancient light",
    label: "A wider reference",
    headline: "Even this view is moving.",
    reference: "The cosmic microwave background (CMB)",
    description:
      "Ancient light fills the sky. It looks a little warmer in the direction our solar system is moving. That gives us another way to measure motion.",
    sceneNote:
      "Exaggerated temperature dipole · a reference sky, not a shell in space",
    period: "Solar-system baseline ≈ 370 km/s",
    animation: "Fixed CMB dipole · drag to inspect",
    fact: "There is no single absolute speed through the Universe. Each number answers “moving relative to what?” These speeds must not simply be added.",
  },
];
export const NEXT_UNIT = {
  "km/h": "km/s",
  "km/s": "mph",
  mph: "km/h",
} as const;
export function speedValue(kmPerSecond: number, unit: SpeedUnit): number {
  return unit === "km/s"
    ? kmPerSecond
    : kmPerSecond * (unit === "mph" ? 3600 / 1.609344 : 3600);
}
export function formatSpeed(
  speed: number,
  unit: SpeedUnit,
  approximate = false,
): string {
  const n = speedValue(speed, unit);
  const digits = unit === "km/s" ? (n < 1 ? 3 : 1) : 0;
  const value =
    approximate && unit !== "km/s" ? Math.round(n / 1000) * 1000 : n;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(Math.max(0, value));
}
export function formatDistance(km: number, unit: SpeedUnit): string {
  const value = Math.max(0, km) / (unit === "mph" ? 1.609344 : 1);
  const label = unit === "mph" ? "mi" : "km";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: value < 10 ? 2 : 0 }).format(value)} ${label}`;
}
export function latHemisphere(lat: number): string {
  return `${Math.abs(lat).toFixed(1)}°${lat < 0 ? "S" : "N"}`;
}
export const LOCATIONS = [
  { name: "Equator · example", lat: 0, lon: 0 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "North Pole", lat: 90, lon: 0 },
];
