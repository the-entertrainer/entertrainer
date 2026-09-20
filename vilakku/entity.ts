import * as THREE from "three";
import type { EntityMode } from "./types";

type Bone = THREE.Mesh;

export type Vessel = THREE.Group & {
  userData: {
    mode: EntityMode;
    snapT: number;
    head: Bone;
    jaw: Bone;
    spine: Bone;
    chest: Bone;
    armsL: Bone[];
    armsR: Bone[];
    legsL: Bone[];
    legsR: Bone[];
  };
};

function box(w: number, h: number, d: number, mat: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = false;
  return m;
}

export function makeVessel(kind: "entity" | "adult" = "entity"): Vessel {
  const root = new THREE.Group() as Vessel;
  const bone = new THREE.MeshLambertMaterial({ color: kind === "entity" ? 0x0b0b0b : 0x14110c });
  const wet = new THREE.MeshLambertMaterial({ color: kind === "entity" ? 0x1a1a1a : 0x1c1812 });
  const rune = new THREE.MeshLambertMaterial({ color: 0x9a3b2a });

  const pelvis = box(0.28, 0.16, 0.16, bone);
  const spine = box(0.14, 0.42, 0.12, bone);
  spine.position.y = 0.28;
  const chest = box(0.32, 0.22, 0.16, wet);
  chest.position.y = 0.52;
  const neck = box(0.08, 0.16, 0.08, bone);
  neck.position.y = 0.68;
  const head = box(kind === "entity" ? 0.2 : 0.18, kind === "entity" ? 0.24 : 0.2, 0.18, wet);
  head.position.y = 0.86;
  const jaw = box(0.16, 0.06, 0.14, bone);
  jaw.position.set(0, 0.74, 0.04);

  const arm = (side: number) => {
    const shoulder = box(0.1, 0.1, 0.1, bone);
    shoulder.position.set(0.22 * side, 0.56, 0);
    const upper = box(0.07, kind === "entity" ? 0.38 : 0.32, 0.07, bone);
    upper.position.set(0.28 * side, 0.34, 0.02);
    const extra = box(0.06, kind === "entity" ? 0.28 : 0.22, 0.06, bone);
    extra.position.set(0.34 * side, 0.08, 0.08);
    const hand = box(0.08, 0.16, 0.06, wet);
    hand.position.set(0.38 * side, -0.12, 0.14);
    return [shoulder, upper, extra, hand];
  };

  const leg = (side: number) => {
    const thigh = box(0.1, 0.42, 0.1, bone);
    thigh.position.set(0.1 * side, -0.28, 0);
    const shin = box(0.08, 0.4, 0.08, bone);
    shin.position.set(0.12 * side, -0.66, 0.04);
    const foot = box(0.1, 0.06, 0.22, wet);
    foot.position.set(0.12 * side, -0.88, 0.08);
    return [thigh, shin, foot];
  };

  const armsL = arm(-1);
  const armsR = arm(1);
  const legsL = leg(-1);
  const legsR = leg(1);

  [pelvis, spine, chest, neck, head, jaw, ...armsL, ...armsR, ...legsL, ...legsR].forEach((p) => root.add(p));

  if (kind === "adult") {
    const mark = box(0.06, 0.28, 0.02, rune);
    mark.position.set(0, 0.5, 0.09);
    root.add(mark);
  }

  root.userData = {
    mode: "window",
    snapT: 1.4,
    head,
    jaw,
    spine,
    chest,
    armsL,
    armsR,
    legsL,
    legsR,
  };

  if (kind === "entity") root.scale.set(1.15, 1.38, 1.05);
  else root.scale.set(1.05, 1.2, 1.0);
  return root;
}

export function poseVessel(ent: Vessel, t: number, dt: number, mode: EntityMode): boolean {
  const p = ent.userData;
  const shiver = Math.sin(t * 17) * 0.02;
  p.head.rotation.z = shiver * 3;
  p.head.rotation.y = Math.sin(t * 0.7) * 0.25;
  p.jaw.position.y = 0.74 + Math.abs(Math.sin(t * 2.2)) * 0.03;
  p.spine.rotation.x = Math.sin(t * 1.3) * 0.08;
  p.chest.rotation.y = Math.sin(t * 2.4) * 0.04;

  const crawl = mode === "window" || mode === "hunt" ? 1 : mode === "rafter" ? 0.15 : 0.4;
  p.armsL[1].rotation.z = 0.45 + Math.sin(t * 2.1) * 0.35;
  p.armsR[1].rotation.z = -0.45 + Math.cos(t * 1.9) * 0.35;
  p.armsL[2].rotation.x = Math.sin(t * 3.0) * 0.55;
  p.armsR[2].rotation.x = Math.cos(t * 2.6) * 0.55;
  p.armsL[3].rotation.z = Math.sin(t * 5.0) * 0.45;
  p.armsR[3].rotation.z = Math.cos(t * 4.6) * 0.45;

  // crude two-bone reach: extra joint hyperextends toward the viewer
  const reach = mode === "window" ? 0.5 : 0.15;
  p.armsL[2].position.z = 0.08 + Math.sin(t * 1.7) * reach;
  p.armsR[2].position.z = 0.08 + Math.cos(t * 1.5) * reach;

  p.legsL[0].rotation.x = Math.sin(t * 1.4) * 0.22 * crawl;
  p.legsR[0].rotation.x = Math.cos(t * 1.4) * 0.22 * crawl;
  p.legsL[1].rotation.x = Math.sin(t * 1.4 + 0.4) * 0.18 * crawl;
  p.legsR[1].rotation.x = Math.cos(t * 1.4 + 0.4) * 0.18 * crawl;

  if (mode === "rafter") {
    ent.rotation.z = Math.PI;
    ent.rotation.x = Math.sin(t * 0.8) * 0.1;
  } else {
    ent.rotation.z = 0;
    if (mode !== "hunt") ent.rotation.x = 0;
  }

  p.snapT -= dt;
  if (p.snapT <= 0 && Math.random() < 0.018) {
    p.head.rotation.y += Math.random() > 0.5 ? 0.85 : -0.85;
    p.armsL[2].rotation.y += 1.1;
    p.armsR[1].rotation.x -= 0.7;
    p.snapT = 1.1 + Math.random() * 2.4;
    return true;
  }
  return false;
}

export function poseAdult(ent: Vessel, t: number, walking: boolean) {
  const p = ent.userData;
  const gait = walking ? t * 3.2 : t * 0.6;
  p.spine.rotation.x = Math.sin(gait) * (walking ? 0.06 : 0.02);
  p.armsL[1].rotation.x = Math.sin(gait) * (walking ? 0.4 : 0.05);
  p.armsR[1].rotation.x = -Math.sin(gait) * (walking ? 0.4 : 0.05);
  p.legsL[0].rotation.x = Math.sin(gait) * (walking ? 0.45 : 0.04);
  p.legsR[0].rotation.x = -Math.sin(gait) * (walking ? 0.45 : 0.04);
  p.head.rotation.y = Math.sin(t * 0.5) * 0.15;
}
