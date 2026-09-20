import test from "node:test";
import assert from "node:assert/strict";
import {
  snapshot,
  earthOrbit,
  rotationVelocity,
  magnitude,
  SOLAR_CMB_VECTOR,
  SOLAR_GALACTIC_VECTOR,
  CMB_SPEED_KM_S,
  advanceDistance,
  AU_KM,
} from "../../velocity/physics.ts";
import { formatDistance, speedValue } from "../../velocity/scales.ts";
const date = new Date("2026-09-20T12:00:00Z");
const close = (actual, expected, tolerance) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} ≠ ${expected} within ${tolerance}`,
  );
test("equatorial sidereal speed and polar limit", () => {
  close(magnitude(rotationVelocity(date, 0, 0)) * 3600, 1674.364, 0.01);
  assert.ok(magnitude(rotationVelocity(date, 90, 0)) < 1e-10);
  assert.ok(magnitude(rotationVelocity(date, -90, 0)) < 1e-10);
  close(
    magnitude(rotationVelocity(date, 45, 12)),
    magnitude(rotationVelocity(date, -45, -80)),
    1e-12,
  );
});
test("opposite longitudes have opposite spin vectors", () => {
  const a = rotationVelocity(date, 0, 0),
    b = rotationVelocity(date, 0, 180);
  for (let i = 0; i < 3; i++) close(a[i], -b[i], 1e-10);
});
test("Earth is faster and closer to the Sun in January than July", () => {
  const jan = earthOrbit(new Date("2026-01-03T00:00:00Z")),
    jul = earthOrbit(new Date("2026-07-04T00:00:00Z"));
  assert.ok(jan.radiusAU < 0.984 && jul.radiusAU > 1.016);
  assert.ok(magnitude(jan.velocity) > 30.2 && magnitude(jul.velocity) < 29.4);
  close(magnitude(jan.position) / AU_KM, jan.radiusAU, 1e-10);
});
test("orbital velocity agrees with finite-difference position", () => {
  const before = earthOrbit(new Date(date.getTime() - 10000)),
    after = earthOrbit(new Date(date.getTime() + 10000)),
    current = earthOrbit(date);
  for (let i = 0; i < 3; i++)
    close(
      (after.position[i] - before.position[i]) / 20,
      current.velocity[i],
      0.003,
    );
});
test("rotation of reference coordinates preserves measured speeds", () => {
  close(magnitude(SOLAR_CMB_VECTOR), CMB_SPEED_KM_S, 1e-6);
  close(magnitude(SOLAR_GALACTIC_VECTOR), Math.hypot(11.1, 241.24, 7.25), 1e-6);
});
test("reference speeds are norms of vector sums, not scalar totals", () => {
  const s = snapshot(date, 19.076, 72.8777);
  close(s.speeds.sun, magnitude(s.vectors.sun), 1e-12);
  assert.ok(Math.abs(s.speeds.cosmos - (CMB_SPEED_KM_S + s.speeds.sun)) > 1);
  for (let i = 0; i < 3; i++)
    close(s.vectors.cosmos[i] - s.vectors.sun[i], SOLAR_CMB_VECTOR[i], 1e-10);
  assert.ok(s.speeds.sun > 28.8 && s.speeds.sun < 31);
  assert.ok(s.speeds.galaxy > 210 && s.speeds.galaxy < 273);
  assert.ok(s.speeds.cosmos > 339 && s.speeds.cosmos < 401);
});
test("units never divide travelled kilometres by 3600", () => {
  assert.equal(formatDistance(3600, "km/s"), "3,600 km");
  assert.equal(formatDistance(3600, "km/h"), "3,600 km");
  assert.equal(formatDistance(1.609344, "mph"), "1 mi");
  close(speedValue(1, "km/h"), 3600, 1e-12);
  close(speedValue(1, "mph"), 2236.936292, 1e-6);
});
test("elapsed distance has separate frame counters and no animation-rate input", () => {
  const speeds = { earth: 0.4, sun: 30, galaxy: 240, cosmos: 370 },
    zero = { earth: 0, sun: 0, galaxy: 0, cosmos: 0 };
  const result = advanceDistance(zero, speeds, 10);
  assert.deepEqual(result, { earth: 4, sun: 300, galaxy: 2400, cosmos: 3700 });
  assert.deepEqual(advanceDistance(result, speeds, -1), result);
  assert.deepEqual(zero, { earth: 0, sun: 0, galaxy: 0, cosmos: 0 });
});
test("unsupported dates and invalid coordinates are rejected", () => {
  for (const input of ["1799-12-31", "2051-01-01", "invalid"])
    assert.throws(() => earthOrbit(new Date(input)), RangeError);
  assert.throws(() => snapshot(date, NaN, 0), RangeError);
});
