import * as THREE from "three";
import type { Collider, Hotspot } from "./types";
import type { GameTextures } from "./textures";
import { makeVessel, type Vessel } from "./entity";

export const ROOM = {
  bed: { minX: -2.3, maxX: 2.3, minZ: -2.5, maxZ: 2.62 },
  study: { minX: 2.28, maxX: 6.05, minZ: -2.5, maxZ: 2.05 },
  court: { minX: -4.05, maxX: 4.05, minZ: 2.58, maxZ: 8.45 },
  granary: { minX: -7.35, maxX: -4.0, minZ: 3.0, maxZ: 7.45 },
  outside: { minX: -2.4, maxX: 3.2, minZ: 8.4, maxZ: 13.2 },
};

const H = 2.62;

export type WorldRefs = {
  group: THREE.Group;
  colliders: Collider[];
  hotspots: Hotspot[];
  entity: Vessel;
  father: Vessel;
  parentA: Vessel;
  parentB: Vessel;
  lampMesh: THREE.Mesh;
  flame: THREE.PointLight;
  lampSpot: THREE.SpotLight;
  lightning: THREE.DirectionalLight;
  fill: THREE.AmbientLight;
  rain: THREE.Points;
  rainCount: number;
  cup: THREE.Object3D;
  sickle: THREE.Object3D;
  viewLamp: THREE.Group;
  windowZ: number;
  shedPos: THREE.Vector3;
};

function lambert(tex: THREE.Texture, color: number, opts?: { roughness?: number }) {
  return new THREE.MeshLambertMaterial({
    map: tex,
    color,
    ...opts,
  });
}

export function buildWorld(tex: GameTextures): WorldRefs {
  const group = new THREE.Group();
  const colliders: Collider[] = [];
  const wood = lambert(tex.wood, 0xffffff);
  const plaster = lambert(tex.plaster, 0xdedede);
  const darkWood = lambert(tex.wood, 0xbababa);
  const black = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const water = new THREE.MeshLambertMaterial({ color: 0x1a1c22 });
  const brass = new THREE.MeshLambertMaterial({ color: 0x8a7040 });

  const addBox = (
    mat: THREE.Material,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    collide = false,
    extra?: Partial<Collider>,
  ): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    group.add(m);
    if (collide) {
      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
        ...extra,
      });
    }
    return m;
  };

  const wallSeg = (
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    extra?: Partial<Collider>,
  ) => {
    const w = Math.abs(x1 - x0) || 0.14;
    const d = Math.abs(z1 - z0) || 0.14;
    const x = (x0 + x1) / 2;
    const z = (z0 + z1) / 2;
    const thickX = Math.abs(x1 - x0) < 0.2;
    addBox(plaster, thickX ? 0.14 : w, H, thickX ? d : 0.14, x, H / 2, z, true, extra);
  };

  // Bedroom floor / ceiling
  addBox(wood, 4.7, 0.08, 5.2, 0, -0.04, 0.05);
  addBox(plaster, 4.7, 0.08, 5.2, 0, H, 0.05);

  // Bedroom walls
  wallSeg(-2.3, -2.5, 2.3, -2.5); // south
  wallSeg(-2.3, -2.5, -2.3, 2.62); // west
  // east with door gap z -0.45..0.45
  wallSeg(2.3, -2.5, 2.3, -0.48);
  wallSeg(2.3, 0.48, 2.3, 2.62);
  addBox(darkWood, 0.14, 1.85, 0.92, 2.3, 0.92, 0, true, { nightMax: 1, tag: "bed-door" });

  // north: window gap x -0.55..0.85, passage x 1.45..2.2
  wallSeg(-2.3, 2.62, -0.58, 2.62);
  wallSeg(0.88, 2.62, 1.42, 2.62);
  wallSeg(2.22, 2.62, 2.3, 2.62);
  addBox(plaster, 0.78, H, 0.14, 1.82, H / 2, 2.62, true, { nightMax: 2, tag: "court-door" });
  // sill under window so you cannot walk out
  addBox(plaster, 1.5, 0.82, 0.14, 0.15, 0.41, 2.62, true);

  // Study
  addBox(wood, 3.85, 0.08, 4.6, 4.15, -0.04, -0.22);
  addBox(plaster, 3.85, 0.08, 4.6, 4.15, H, -0.22);
  wallSeg(2.3, -2.5, 6.05, -2.5);
  wallSeg(6.05, -2.5, 6.05, 2.05);
  wallSeg(2.3, 2.05, 6.05, 2.05);
  wallSeg(2.3, 0.48, 2.3, 2.05);

  // Courtyard
  addBox(water, 8.2, 0.06, 6.0, 0, -0.18, 5.5);
  // rim walkway
  addBox(wood, 8.2, 0.08, 0.7, 0, 0.0, 2.95);
  addBox(wood, 8.2, 0.08, 0.7, 0, 0.0, 8.15);
  addBox(wood, 0.7, 0.08, 6.0, -3.7, 0.0, 5.5);
  addBox(wood, 0.7, 0.08, 6.0, 3.7, 0.0, 5.5);

  wallSeg(-4.05, 2.58, -4.05, 8.45);
  wallSeg(4.05, 2.58, 4.05, 8.45);
  wallSeg(-4.05, 8.45, -0.5, 8.45);
  wallSeg(1.7, 8.45, 4.05, 8.45);
  addBox(plaster, 2.2, H, 0.14, 0.6, H / 2, 8.45, true, { nightMax: 4, tag: "shed-gate" });

  // Granary west of court — door in west wall z 4.8..5.7
  wallSeg(-4.05, 3.0, -4.05, 4.75);
  wallSeg(-4.05, 5.75, -4.05, 7.45);
  addBox(wood, 3.4, 0.08, 4.5, -5.7, -0.04, 5.22);
  addBox(plaster, 3.4, 0.08, 4.5, -5.7, H, 5.22);
  wallSeg(-7.35, 3.0, -4.0, 3.0);
  wallSeg(-7.35, 7.45, -4.0, 7.45);
  wallSeg(-7.35, 3.0, -7.35, 7.45);

  // Outside / shed yard
  addBox(new THREE.MeshLambertMaterial({ color: 0x080808 }), 10, 0.05, 6.5, 0.4, -0.2, 11.0);
  const shedBody = addBox(darkWood, 1.9, 1.5, 1.6, 0.85, 0.75, 11.4);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.72, 4), darkWood);
  roof.position.set(0.85, 1.85, 11.4);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  void shedBody;

  // Pillars
  for (const [x, z] of [
    [-2.2, 4.2],
    [2.2, 4.2],
    [-2.2, 6.8],
    [2.2, 6.8],
  ] as const) {
    addBox(wood, 0.28, 2.4, 0.28, x, 1.2, z, true, { tag: "pillar" });
  }

  // Furniture
  addBox(darkWood, 1.15, 0.3, 1.95, -1.05, 0.2, 0.15);
  addBox(black, 1.05, 0.1, 1.85, -1.05, 0.4, 0.15);
  addBox(darkWood, 0.72, 0.4, 0.44, 1.15, 0.22, -1.55);
  const lampMesh = addBox(brass, 0.08, 0.16, 0.08, 1.15, 0.52, -1.55);
  lampMesh.geometry = new THREE.CylinderGeometry(0.045, 0.07, 0.16, 10);

  const cup = addBox(black, 0.1, 0.08, 0.1, -0.35, 0.5, -1.7);
  cup.geometry = new THREE.CylinderGeometry(0.05, 0.042, 0.08, 10);
  addBox(darkWood, 0.22, 0.28, 0.22, 1.7, 0.2, -1.85); // oil jar

  const desk = addBox(darkWood, 1.35, 0.08, 0.58, 4.35, 0.74, -0.4);
  void desk;
  addBox(darkWood, 0.08, 0.7, 0.08, 3.75, 0.35, -0.55);
  addBox(darkWood, 0.08, 0.7, 0.08, 4.95, 0.35, -0.55);
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.42), new THREE.MeshLambertMaterial({ map: tex.photo }));
  photo.position.set(4.15, 1.05, -0.68);
  group.add(photo);
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), new THREE.MeshLambertMaterial({ map: tex.chart }));
  chart.position.set(4.62, 1.02, -0.68);
  group.add(chart);

  // bookshelves
  addBox(darkWood, 1.6, 1.8, 0.28, 5.55, 0.95, 0.4);

  // granary sacks + palm leaf
  addBox(wood, 0.7, 0.45, 0.5, -5.4, 0.25, 4.2);
  addBox(wood, 0.6, 0.4, 0.45, -6.2, 0.22, 4.4);
  const leafMat = new THREE.MeshLambertMaterial({
    map: tex.palm ?? tex.chart,
    color: 0xbbbbbb,
  });
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.22), leafMat);
  palm.position.set(-5.85, 0.82, 5.9);
  palm.rotation.y = 0.4;
  group.add(palm);

  const sickle = addBox(new THREE.MeshLambertMaterial({ color: 0x3a3a3a }), 0.04, 0.02, 0.55, 1.55, 0.12, 10.55);
  sickle.rotation.z = 0.4;

  // Window bars
  const windowGroup = new THREE.Group();
  windowGroup.position.set(0.15, 1.18, 2.54);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(1.22, 0.92),
    new THREE.MeshLambertMaterial({ color: 0x101218, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
  );
  windowGroup.add(glass);
  const barMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
  for (let i = -2; i <= 2; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.92, 0.04), barMat);
    bar.position.set(i * 0.22, 0, 0.02);
    windowGroup.add(bar);
  }
  for (let i = -1; i <= 1; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.03, 0.04), barMat);
    bar.position.set(0, i * 0.28, 0.02);
    windowGroup.add(bar);
  }
  group.add(windowGroup);

  // Lights
  const flame = new THREE.PointLight(0xffd4a0, 0, 5.5, 1.6);
  flame.position.set(1.15, 0.64, -1.55);
  group.add(flame);
  const lampSpot = new THREE.SpotLight(0xffe1b0, 0, 11, Math.PI / 3.6, 0.45, 1.1);
  lampSpot.position.copy(flame.position);
  group.add(lampSpot);
  const lightning = new THREE.DirectionalLight(0xf4f0ff, 0);
  lightning.position.set(-3, 10, 14);
  group.add(lightning);
  const fill = new THREE.AmbientLight(0x3a3a44, 0.22);
  group.add(fill);

  // Rain
  const rainCount = 520;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 16;
    rainPos[i * 3 + 1] = Math.random() * 7;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 16 + 4;
  }
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.Points(
    rainGeo,
    new THREE.PointsMaterial({ color: 0x8899aa, size: 0.018, transparent: true, opacity: 0.55 }),
  );
  group.add(rain);

  const entity = makeVessel("entity");
  entity.visible = false;
  entity.position.set(0.9, 0.95, 11.2);
  group.add(entity);

  const father = makeVessel("adult");
  father.visible = false;
  father.position.set(0, 0.95, 5.5);
  group.add(father);

  const parentA = makeVessel("adult");
  parentA.visible = false;
  parentA.position.set(-0.55, 0.35, 5.6);
  parentA.scale.set(1.02, 1.15, 1);
  group.add(parentA);
  const parentB = makeVessel("adult");
  parentB.visible = false;
  parentB.position.set(0.55, 0.35, 5.85);
  parentB.scale.set(1.0, 1.12, 1);
  group.add(parentB);

  const viewLamp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.032, 0.08, 10), brass);
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    brass,
  );
  bowl.position.y = 0.04;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.005, 6, 12, Math.PI), brass);
  handle.rotation.y = Math.PI / 2;
  handle.position.set(0.028, 0.01, 0);
  const wick = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xc9a56a, emissive: 0x4a3518, emissiveIntensity: 0.6 }),
  );
  wick.position.y = 0.07;
  wick.name = "wick";
  viewLamp.add(body, bowl, handle, wick);
  viewLamp.visible = false;

  const hotspots: Hotspot[] = [
    { id: "lamp", x: 1.15, y: 0.52, z: -1.55, r: 1.2, nightMin: 1, nightMax: 5 },
    { id: "door", x: 2.25, y: 0.9, z: 0, r: 1.25, nightMin: 1, nightMax: 3 },
    { id: "cup", x: -0.35, y: 0.5, z: -1.7, r: 1.15, nightMin: 2, nightMax: 2 },
    { id: "oil", x: 1.7, y: 0.2, z: -1.85, r: 1.05, nightMin: 1, nightMax: 5 },
    { id: "photo", x: 4.15, y: 1.05, z: -0.68, r: 1.25, nightMin: 2, nightMax: 3 },
    { id: "chart", x: 4.62, y: 1.02, z: -0.68, r: 1.2, nightMin: 2, nightMax: 3 },
    { id: "pact", x: -5.85, y: 0.82, z: 5.9, r: 1.35, nightMin: 3, nightMax: 3 },
    { id: "hatch", x: -1.05, y: 0.2, z: 0.15, r: 1.2, nightMin: 4, nightMax: 4 },
    { id: "ritual", x: 0, y: 0.4, z: 5.7, r: 2.4, nightMin: 4, nightMax: 4 },
    { id: "sickle", x: 1.55, y: 0.12, z: 10.55, r: 1.4, nightMin: 5, nightMax: 5 },
    { id: "shed", x: 0.85, y: 0.7, z: 11.4, r: 1.8, nightMin: 5, nightMax: 5 },
    { id: "parents", x: 0, y: 0.5, z: 5.7, r: 2.2, nightMin: 5, nightMax: 5 },
  ];

  return {
    group,
    colliders,
    hotspots,
    entity,
    father,
    parentA,
    parentB,
    lampMesh,
    flame,
    lampSpot,
    lightning,
    fill,
    rain,
    rainCount,
    cup,
    sickle,
    viewLamp,
    windowZ: 2.54,
    shedPos: new THREE.Vector3(0.85, 0.7, 11.4),
  };
}

export function resolveCircle(
  x: number,
  z: number,
  r: number,
  colliders: Collider[],
  night: number,
): { x: number; z: number } {
  let px = x;
  let pz = z;
  for (const c of colliders) {
    if (c.nightMin != null && night < c.nightMin) continue;
    if (c.nightMax != null && night > c.nightMax) continue;
    const nearestX = Math.max(c.minX, Math.min(px, c.maxX));
    const nearestZ = Math.max(c.minZ, Math.min(pz, c.maxZ));
    let dx = px - nearestX;
    let dz = pz - nearestZ;
    const dist = Math.hypot(dx, dz);
    if (dist === 0) {
      const left = px - c.minX;
      const right = c.maxX - px;
      const top = pz - c.minZ;
      const bot = c.maxZ - pz;
      const m = Math.min(left, right, top, bot);
      if (m === left) px = c.minX - r;
      else if (m === right) px = c.maxX + r;
      else if (m === top) pz = c.minZ - r;
      else pz = c.maxZ + r;
      continue;
    }
    if (dist < r) {
      const push = (r - dist) / dist;
      px += dx * push;
      pz += dz * push;
    }
  }
  return { x: px, z: pz };
}
