import * as THREE from 'three';

const WALL = { x: 2.9, z: 3.15 };
const GRAVITY = 9.2;
const FLOOR_Y = 0.05;

function reflect(vx, vy, vz, nx, ny, nz, bounce, friction) {
  const dot = vx * nx + vy * ny + vz * nz;
  return {
    vx: (vx - 2 * dot * nx) * bounce,
    vy: (vy - 2 * dot * ny) * bounce,
    vz: (vz - 2 * dot * nz) * bounce,
    fx: 1 - friction,
  };
}

export function createBattle(scene) {
  const bulletGeo = new THREE.SphereGeometry(0.028, 8, 8);
  const tracerGeo = new THREE.CylinderGeometry(0.01, 0.004, 1, 6);
  tracerGeo.rotateX(Math.PI / 2);
  const flashGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const slashGeo = new THREE.PlaneGeometry(1, 0.07);
  const sparkGeo = new THREE.OctahedronGeometry(0.026, 0);
  const bulletMat = new THREE.MeshStandardMaterial({ color: '#ffe27a', emissive: '#ffbf3b', emissiveIntensity: 2.2, roughness: 0.22, metalness: 0.45 });
  const hotMat = new THREE.MeshBasicMaterial({ color: '#fff3b0' });
  const flashMat = new THREE.MeshBasicMaterial({ color: '#fff4c4', transparent: true, opacity: 0.9 });
  const slashMat = new THREE.MeshBasicMaterial({ color: '#f4fff0', transparent: true, opacity: 0.88, side: THREE.DoubleSide, depthWrite: false });
  const sparkMat = new THREE.MeshBasicMaterial({ color: '#ffd36a' });
  const ribbonMat = new THREE.MeshBasicMaterial({ color: '#f7ffe8', transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false });

  function pool(n, geo, mat, cloneMat = false) {
    return Array.from({ length: n }, () => {
      const mesh = new THREE.Mesh(geo, cloneMat ? mat.clone() : mat);
      mesh.visible = false;
      mesh.castShadow = false;
      mesh.userData.fx = true;
      scene.add(mesh);
      return { mesh, life: 0, vx: 0, vy: 0, vz: 0 };
    });
  }

  const bullets = Array.from({ length: 36 }, () => {
    const mesh = new THREE.Mesh(bulletGeo, bulletMat);
    const tracer = new THREE.Mesh(tracerGeo, hotMat);
    mesh.visible = tracer.visible = false;
    mesh.castShadow = false;
    mesh.userData.fx = tracer.userData.fx = true;
    scene.add(mesh);
    scene.add(tracer);
    return { mesh, tracer, life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, damage: 0.7, bounced: 0 };
  });
  const flashes = pool(6, flashGeo, flashMat, true);
  const slashes = pool(10, slashGeo, slashMat, true);
  const sparks = pool(40, sparkGeo, sparkMat);

  const ribbonMax = 18;
  const ribbonPositions = new Float32Array(ribbonMax * 2 * 3);
  const ribbonGeo = new THREE.BufferGeometry();
  ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPositions, 3));
  ribbonGeo.setDrawRange(0, 0);
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon.frustumCulled = false;
  ribbon.userData.fx = true;
  scene.add(ribbon);
  const trailPts = [];

  function take(list) {
    for (const item of list) if (item.life <= 0) return item;
    return null;
  }

  function sparkBurst(x, y, z, count = 6) {
    let n = 0;
    for (const s of sparks) {
      if (s.life > 0) continue;
      s.life = 0.16 + Math.random() * 0.14;
      s.mesh.visible = true;
      s.mesh.position.set(x, y, z);
      s.vx = (Math.random() - 0.5) * 4.2;
      s.vy = 1.2 + Math.random() * 3.2;
      s.vz = (Math.random() - 0.5) * 4.2;
      if (++n >= count) break;
    }
  }

  function writeRibbon() {
    const count = trailPts.length;
    if (count < 2) {
      ribbonGeo.setDrawRange(0, 0);
      return;
    }
    let i = 0;
    for (let p = 0; p < count; p++) {
      const prev = trailPts[Math.max(0, p - 1)];
      const next = trailPts[Math.min(count - 1, p + 1)];
      let dx = next.x - prev.x, dz = next.z - prev.z;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len; dz /= len;
      const fade = p / (count - 1);
      const half = (0.018 + fade * 0.055) * (0.65 + Math.min(1.4, trailPts[p].speed));
      ribbonPositions[i++] = trailPts[p].x - dz * half;
      ribbonPositions[i++] = 0.075;
      ribbonPositions[i++] = trailPts[p].z + dx * half;
      ribbonPositions[i++] = trailPts[p].x + dz * half;
      ribbonPositions[i++] = 0.075;
      ribbonPositions[i++] = trailPts[p].z - dx * half;
    }
    const verts = count * 2;
    const index = [];
    for (let p = 0; p < count - 1; p++) {
      const a = p * 2, b = a + 1, c = a + 2, d = a + 3;
      index.push(a, b, c, b, d, c);
    }
    ribbonGeo.setIndex(index);
    ribbonGeo.attributes.position.needsUpdate = true;
    ribbonGeo.setDrawRange(0, index.length);
    ribbonMat.opacity = 0.82;
  }

  return {
    slash(x, z, angle, length = 1) {
      const s = take(slashes);
      if (!s) return;
      s.life = 0.16;
      s.mesh.visible = true;
      s.mesh.position.set(x, 0.17, z);
      s.mesh.rotation.set(-0.55, angle, 0);
      s.mesh.scale.set(0.7 + length * 0.7, 1, 1);
      s.mesh.material.opacity = 0.95;
    },
    trailPush(x, z) {
      const last = trailPts[trailPts.length - 1];
      const speed = last ? Math.hypot(x - last.x, z - last.z) * 14 : 0.4;
      if (last && speed < 0.012) return;
      trailPts.push({ x, z, speed });
      if (trailPts.length > ribbonMax) trailPts.shift();
      writeRibbon();
    },
    trailClear() {
      trailPts.length = 0;
      ribbonGeo.setDrawRange(0, 0);
    },
    muzzle(x, y, z) {
      const f = take(flashes);
      if (!f) return;
      f.life = 0.055;
      f.mesh.visible = true;
      f.mesh.position.set(x, y, z);
      f.mesh.scale.setScalar(1);
    },
    fire(x, y, z, tx, ty, tz, damage, spread = 0.03) {
      const b = take(bullets);
      if (!b) return false;
      const dx = tx - x, dy = ty - y, dz = tz - z;
      const dist = Math.hypot(dx, dy, dz) || 1;
      const speed = 17.5 + Math.random() * 2.2;
      b.life = 0.9;
      b.bounced = 0;
      b.damage = damage;
      b.x = x; b.y = y; b.z = z;
      b.vx = dx / dist * speed + (Math.random() - 0.5) * spread * 7;
      b.vy = dy / dist * speed + 0.08;
      b.vz = dz / dist * speed + (Math.random() - 0.5) * spread * 7;
      b.mesh.visible = b.tracer.visible = true;
      this.muzzle(x, y, z);
      sparkBurst(x, y, z, 2);
      return true;
    },
    step(dt, roaches, onHit, onRicochet) {
      for (const s of slashes) {
        if (s.life <= 0) continue;
        s.life -= dt;
        s.mesh.material.opacity = Math.max(0, s.life * 5.4);
        s.mesh.scale.x += dt * 4.5;
        if (s.life <= 0) s.mesh.visible = false;
      }
      for (const f of flashes) {
        if (f.life <= 0) continue;
        f.life -= dt;
        f.mesh.scale.setScalar(1 + (1 - f.life / 0.055) * 1.6);
        f.mesh.material.opacity = Math.max(0, f.life / 0.055);
        if (f.life <= 0) f.mesh.visible = false;
      }
      for (const s of sparks) {
        if (s.life <= 0) continue;
        s.life -= dt;
        s.vy -= 16 * dt;
        s.mesh.position.x += s.vx * dt;
        s.mesh.position.y += s.vy * dt;
        s.mesh.position.z += s.vz * dt;
        if (s.mesh.position.y < 0.03) {
          s.mesh.position.y = 0.03;
          s.vy = Math.abs(s.vy) * 0.26;
          s.vx *= 0.58;
          s.vz *= 0.58;
        }
        s.mesh.scale.setScalar(Math.max(0.18, s.life * 4.2));
        if (s.life <= 0) s.mesh.visible = false;
      }
      if (trailPts.length) {
        ribbonMat.opacity = Math.max(0, ribbonMat.opacity - dt * 2.1);
        if (ribbonMat.opacity <= 0) this.trailClear();
      }

      const steps = 3;
      const stepDt = dt / steps;
      for (const b of bullets) {
        if (b.life <= 0) continue;
        let alive = true;
        for (let s = 0; s < steps && alive; s++) {
          b.life -= stepDt;
          b.vy -= GRAVITY * stepDt;
          const ox = b.x, oy = b.y, oz = b.z;
          let nx = ox + b.vx * stepDt;
          let ny = oy + b.vy * stepDt;
          let nz = oz + b.vz * stepDt;
          let hit = false;
          for (const r of roaches) {
            if (!r.active || r.dying) continue;
            const radius = r.green ? 0.4 : 0.33;
            const dx = r.x - ox, dz = r.z - oz;
            const mx = nx - ox, mz = nz - oz;
            const span = mx * mx + mz * mz;
            const t = span ? Math.max(0, Math.min(1, (dx * mx + dz * mz) / span)) : 0;
            const px = ox + mx * t, pz = oz + mz * t;
            const py = oy + (ny - oy) * t;
            if (Math.hypot(px - r.x, pz - r.z) >= radius || py > 0.46 || py < 0.01) continue;
            const incomingX = b.vx, incomingY = b.vy, incomingZ = b.vz;
            const speed = Math.hypot(incomingX, incomingY, incomingZ) || 1;
            let nnx = px - r.x, nny = Math.max(0.08, py - 0.12), nnz = pz - r.z;
            const nl = Math.hypot(nnx, nny, nnz) || 1;
            nnx /= nl; nny /= nl; nnz /= nl;
            const approach = (incomingX * nnx + incomingY * nny + incomingZ * nnz) / speed;
            const glancing = approach > -0.48;
            if (r.green && glancing && b.bounced < 2 && speed > 5) {
              const bounced = reflect(incomingX, incomingY, incomingZ, nnx, nny, nnz, 0.58, 0.18);
              b.vx = bounced.vx;
              b.vy = Math.abs(bounced.vy) * 0.5 + 0.35;
              b.vz = bounced.vz;
              b.bounced++;
              b.damage *= 0.52;
              b.life = Math.min(b.life, 0.28);
              sparkBurst(px, py, pz, 7);
              onRicochet?.(px, pz, r);
            } else {
              sparkBurst(px, Math.max(0.12, py), pz, 9);
              onHit?.(r, b.damage, px, pz);
              b.life = 0;
              hit = true;
            }
            break;
          }
          if (hit || b.life <= 0) { alive = false; break; }
          if (ny < FLOOR_Y) {
            ny = FLOOR_Y;
            b.vy = Math.abs(b.vy) * 0.32;
            b.vx *= 0.7;
            b.vz *= 0.7;
            b.bounced++;
            sparkBurst(nx, FLOOR_Y, nz, 2);
            if (b.bounced > 3 || Math.hypot(b.vx, b.vy, b.vz) < 2) { b.life = 0; alive = false; }
          }
          if (Math.abs(nx) > WALL.x) {
            nx = Math.sign(nx) * WALL.x;
            b.vx *= -0.52;
            b.bounced++;
            onRicochet?.(nx, nz);
            sparkBurst(nx, ny, nz, 3);
          }
          if (Math.abs(nz) > WALL.z) {
            nz = Math.sign(nz) * WALL.z;
            b.vz *= -0.52;
            b.bounced++;
            onRicochet?.(nx, nz);
            sparkBurst(nx, ny, nz, 3);
          }
          b.x = nx; b.y = ny; b.z = nz;
        }
        if (b.life <= 0) {
          b.mesh.visible = b.tracer.visible = false;
          continue;
        }
        b.mesh.position.set(b.x, b.y, b.z);
        const spd = Math.hypot(b.vx, b.vy, b.vz) || 1;
        b.tracer.position.set(b.x - b.vx / spd * 0.16, b.y - b.vy / spd * 0.16, b.z - b.vz / spd * 0.16);
        b.tracer.lookAt(b.x + b.vx, b.y + b.vy, b.z + b.vz);
        b.tracer.scale.set(1, 1, 0.22 + Math.min(1.2, spd * 0.04));
      }
    },
    reset() {
      for (const b of bullets) { b.life = 0; b.mesh.visible = b.tracer.visible = false; }
      for (const s of slashes) { s.life = 0; s.mesh.visible = false; }
      for (const f of flashes) { f.life = 0; f.mesh.visible = false; }
      for (const s of sparks) { s.life = 0; s.mesh.visible = false; }
      this.trailClear();
    },
    get liveBullets() { return bullets.filter(b => b.life > 0).length; }
  };
}
