import * as THREE from 'three';

const ease = t => t * t * (3 - 2 * t);

function composeShot(x, z, kind) {
  const side = x >= 0 ? 1 : -1;
  if (kind === 'low') {
    return {
      pos: new THREE.Vector3(x - side * 1.05, 0.36, z + 0.62),
      look: new THREE.Vector3(x, 0.1, z),
    };
  }
  if (kind === 'high') {
    return {
      pos: new THREE.Vector3(x + side * 0.28, 1.42, z + 1.22),
      look: new THREE.Vector3(x, 0.04, z),
    };
  }
  return {
    pos: new THREE.Vector3(x + side * 0.68, 0.52, z + 0.88),
    look: new THREE.Vector3(x, 0.14, z),
  };
}

export function createCameraDirector(camera) {
  const home = new THREE.Vector3();
  const lookHome = new THREE.Vector3(0, 0, -0.1);
  const fromPos = new THREE.Vector3();
  const fromLook = new THREE.Vector3();
  const shotPos = new THREE.Vector3();
  const shotLook = new THREE.Vector3();
  const look = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const drift = new THREE.Vector3();
  const playCam = camera.clone();
  let shot = null;
  let shake = 0;
  let heat = 0;
  let kindIndex = 0;
  const kinds = ['impact', 'low', 'high'];

  function restPose() {
    camera.position.copy(home).add(drift);
    camera.lookAt(lookHome);
  }

  return {
    setHome(position, lookAt) {
      home.copy(position);
      if (lookAt) lookHome.copy(lookAt);
      playCam.position.copy(home);
      playCam.quaternion.copy(camera.quaternion);
    },
    note(x, z, amount = 0.35) {
      focus.lerp(new THREE.Vector3(x, 0, z), 0.45);
      heat = Math.min(1, heat + amount);
    },
    impulse(amount) { shake = Math.max(shake, amount); },
    trigger(x, z, length = 0.82) {
      if (shot && shot.t < shot.duration * 0.35) return false;
      const kind = kinds[kindIndex++ % kinds.length];
      const framed = composeShot(x, z, kind);
      fromPos.copy(camera.position);
      fromLook.set(0, 0, -0.1).applyQuaternion(camera.quaternion).add(camera.position);
      // Recover a stable look by sampling current forward is noisy; use last look target.
      fromLook.copy(lookHome);
      shotPos.copy(framed.pos);
      shotLook.copy(framed.look);
      shot = { t: 0, duration: length, leaving: false };
      focus.set(x, 0, z);
      heat = Math.min(1, heat + 0.4);
      return true;
    },
    cancel() {
      shot = null;
      restPose();
    },
    update(dt, { held = false, placing = false, elapsed = 0 } = {}) {
      heat = Math.max(0, heat - dt * 0.55);
      shake = Math.max(0, shake - dt);
      const blocked = held || placing;

      if (shot) {
        if (blocked && !shot.leaving) {
          shot.leaving = true;
          shot.t = Math.max(shot.t, shot.duration * 0.64);
          fromPos.copy(camera.position);
        }
        shot.t += dt;
        const u = Math.min(1, shot.t / shot.duration);
        let posT;
        let lookT;
        if (u < 0.2) {
          posT = lookT = ease(u / 0.2);
          camera.position.lerpVectors(fromPos, shotPos, posT);
        } else if (u < 0.62 && !shot.leaving) {
          camera.position.copy(shotPos);
          camera.position.y += Math.sin((u - 0.2) * 10) * 0.01;
          posT = lookT = 1;
        } else {
          const out = ease((u - 0.62) / 0.38);
          camera.position.lerpVectors(shotPos, home, out);
          posT = 1 - out;
          lookT = 1 - out;
        }
        look.lerpVectors(lookHome, shotLook, lookT);
        camera.lookAt(look);
        if (u >= 1) {
          shot = null;
          restPose();
          return false;
        }
        return true;
      }

      const lean = blocked ? 0 : heat;
      drift.set(
        focus.x * 0.16 * lean + Math.sin(elapsed * 0.17) * 0.04 * lean,
        -0.18 * lean,
        focus.z * 0.08 * lean + 0.22 * lean
      );
      camera.position.copy(home).add(drift);
      if (shake > 0) {
        camera.position.x += Math.sin(elapsed * 113) * shake * 0.28;
        camera.position.z += Math.cos(elapsed * 97) * shake * 0.18;
      }
      look.copy(lookHome);
      if (lean > 0.04) look.x += focus.x * 0.12 * lean;
      camera.lookAt(look);
      return false;
    },
    syncPlay(aspect, fov, near, far) {
      playCam.position.copy(home);
      playCam.aspect = aspect;
      playCam.fov = fov;
      playCam.near = near;
      playCam.far = far;
      playCam.updateProjectionMatrix();
      playCam.lookAt(lookHome);
      playCam.updateMatrixWorld();
      return playCam;
    },
    get active() { return !!shot; },
    get time() { return shot ? shot.t : 0; },
    get playCam() { return playCam; },
  };
}
