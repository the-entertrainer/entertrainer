import * as THREE from "three";
import { stellarMaterial } from "./materials";
// Reproducible illustrative geometry, not a fabricated star catalogue.
function random(seed = 7219): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
export function createGalaxy(count = 48000): THREE.Group {
  const group = new THREE.Group(),
    rand = random(),
    positions = new Float32Array(count * 3),
    colors = new Float32Array(count * 3),
    sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const core = i < count * 0.26;
    const radius = core
      ? Math.pow(rand(), 1.6) * 1.9
      : Math.pow(rand(), 0.7) * 8.8 + 0.3;
    const arm = i % 4;
    const scatter =
      (rand() + rand() + rand() - 1.5) * (core ? Math.PI * 2 : 0.38);
    const angle = core
      ? rand() * Math.PI * 2
      : (arm * Math.PI) / 2 + Math.log(radius + 0.5) * 2.9 + scatter;
    const thickness = core ? 0.65 : 0.13 + radius * 0.012;
    let x = Math.cos(angle) * radius,
      z = Math.sin(angle) * radius;
    if (core) {
      x *= 1.5;
      z *= 0.58;
    }
    positions.set([x, (rand() + rand() - 1) * thickness, z], i * 3);
    const c = new THREE.Color();
    const warmth = Math.max(0, 1 - radius / 5);
    c.setRGB(0.38 + warmth * 0.52, 0.48 + warmth * 0.24, 0.72 - warmth * 0.24);
    if (rand() > 0.993) c.setRGB(0.92, 0.85, 0.72);
    colors.set([c.r, c.g, c.b], i * 3);
    sizes[i] = core ? 0.15 + rand() * 0.18 : 0.035 + rand() * 0.085;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  group.add(new THREE.Points(geometry, stellarMaterial()));
  return group;
}
export function createStarfield(): THREE.Points {
  const n = 1900,
    rand = random(113),
    pos = new Float32Array(n * 3),
    color = new Float32Array(n * 3),
    size = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const az = rand() * Math.PI * 2,
      z = rand() * 2 - 1,
      r = 60 + rand() * 35;
    pos.set(
      [
        r * Math.sqrt(1 - z * z) * Math.cos(az),
        r * z,
        r * Math.sqrt(1 - z * z) * Math.sin(az),
      ],
      i * 3,
    );
    const bright = 0.22 + rand() * 0.5;
    color.set([bright * 0.91, bright * 0.96, bright], i * 3);
    size[i] = 0.35 + rand() * 0.5;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(color, 3));
  g.setAttribute("size", new THREE.BufferAttribute(size, 1));
  return new THREE.Points(g, stellarMaterial());
}
