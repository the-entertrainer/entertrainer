import * as THREE from "three";
import { AudioWorld } from "./audio";
import { poseAdult, poseVessel } from "./entity";
import { TouchInput, clampPitch } from "./input";
import { clamp, expDamp, forwardFromYaw, lerp, rightFromYaw } from "./math";
import { COMPOSITE_FRAG, COMPOSITE_VERT } from "./shaders";
import {
  CHART_INSPECT,
  COPY,
  NIGHT_TITLES,
  PACT_INSPECT,
  PHOTO_INSPECT,
  advanceReady,
  emptyFlags,
  loadSave,
  objectiveFor,
  writeSave,
} from "./story";
import { mountOverlay, type OverlayActions } from "./overlay";
import { loadGameTextures } from "./textures";
import type { Hotspot, LampMode, Night, Phase } from "./types";
import { buildWorld, resolveCircle } from "./world";

const STAND_Y = 1.02;
const CROUCH_Y = 0.58;
const BED_Y = 0.72;
const CRAWL_Y = 0.34;
const PLAYER_R = 0.22;

type SeqStep = { at: number; fn: () => void; done: boolean };

export type VilakkuHandle = {
  start: (opts?: { continueSave?: boolean; qa?: boolean }) => Promise<void>;
  toggleLamp: () => void;
  toggleCrouch: () => void;
  interact: () => void;
  closeInspect: () => void;
  chooseEnding: (kind: "burn" | "redirect") => void;
  restart: () => void;
  dispose: () => void;
};

export async function createVilakku(host: HTMLElement): Promise<VilakkuHandle> {
  const textures = await loadGameTextures();
  const world = buildWorld(textures);
  const audio = new AudioWorld();
  const input = new TouchInput(host);
  const api: OverlayActions = {};
  const overlay = mountOverlay(host, api);

  const state = {
    night: 1 as Night,
    phase: "title" as Phase,
    flags: emptyFlags(),
    yaw: Math.PI,
    pitch: 0.06,
    lookLocked: true,
    canMove: false,
    terror: 0.2,
    flash: 0,
    shake: 0,
    time: 0,
    oil: 1,
    lampMode: "off" as LampMode,
    crouching: false,
    crawling: false,
    disposed: false,
    started: false,
    speed: 0,
    bob: 0,
    footT: 0,
    subtitle: "",
    prompt: "",
    promptAlt: null as string | null,
    inspect: null as { title: string; body: string; image: string | null } | null,
    seq: [] as SeqStep[],
    hudAcc: 0,
    fatherT: 0,
    entityHunt: 0,
    _raf: 0 as number,
    seqClock: 0,
  };

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.autoClear = true;
  renderer.domElement.className = "vk-canvas";
  renderer.domElement.tabIndex = 0;
  host.insertBefore(renderer.domElement, host.firstChild);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.042);
  scene.add(world.group);

  const camera = new THREE.PerspectiveCamera(62, Math.max(host.clientWidth, 1) / Math.max(host.clientHeight, 1), 0.05, 60);
  camera.position.set(-0.72, BED_Y, 0.35);
  camera.rotation.order = "YXZ";
  scene.add(camera);

  world.viewLamp.position.set(0.26, -0.3, -0.52);
  world.viewLamp.rotation.set(0.18, 0.55, 0.08);
  world.viewLamp.scale.setScalar(0.85);
  world.viewLamp.layers.set(1);
  camera.add(world.viewLamp);
  camera.layers.enable(0);

  const rt = new THREE.WebGLRenderTarget(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1), {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
  const composerScene = new THREE.Scene();
  const composerCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    tDiffuse: { value: rt.texture },
    uTime: { value: 0 },
    uFlash: { value: 0 },
    uGrain: { value: 0.16 },
    uTrack: { value: 0.18 },
    uShake: { value: 0 },
    uThreshold: { value: 0.22 },
    uInk: { value: 0.62 },
    uFear: { value: 0.2 },
    uPlayable: { value: 1 },
    uRes: { value: new THREE.Vector2(host.clientWidth, host.clientHeight) },
  };
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms, vertexShader: COMPOSITE_VERT, fragmentShader: COMPOSITE_FRAG }),
  );
  composerScene.add(quad);

  let sayTimer = 0;
  function say(text: string, ms = 4400) {
    state.subtitle = text;
    audio.whisper(text.length);
    window.clearTimeout(sayTimer);
    sayTimer = window.setTimeout(() => {
      if (state.subtitle === text) state.subtitle = "";
    }, ms);
    pushHud();
  }

  function pushHud() {
    overlay.update({
      phase: state.phase,
      night: state.night,
      nightTitle: NIGHT_TITLES[state.night],
      subtitle: state.subtitle,
      objective: objectiveFor(state.night, state.flags, state.canMove),
      prompt: state.prompt,
      promptAlt: state.promptAlt,
      oil: state.oil,
      fear: state.terror,
      lampMode: state.lampMode,
      crouching: state.crouching || state.crawling,
      canMove: state.canMove,
      lookLocked: state.lookLocked,
      inspect: state.inspect,
      ending: state.flags.ending,
      started: state.started,
    });
  }

  function persist() {
    writeSave({ v: 1, night: state.night, flags: { ...state.flags }, oil: state.oil });
  }

  function lightningStrike(power = 1) {
    state.flash = power;
    world.lightning.intensity = 2.8 * power;
    audio.thunder(0.5 + power * 0.45);
  }

  function applyLampVisuals() {
    const held = state.flags.lamp && state.lampMode !== "off" && state.oil > 0.01;
    const dim = state.lampMode === "dim";
    const intensity = !held ? 0 : dim ? 1.8 : 3.4;
    world.flame.intensity = intensity;
    world.lampSpot.intensity = held ? (dim ? 2.6 : 5.2) : 0;
    world.viewLamp.visible = state.flags.lamp;
    const wick = world.viewLamp.getObjectByName("wick") as THREE.Mesh | undefined;
    if (wick) wick.visible = held;
    world.lampMesh.material = new THREE.MeshLambertMaterial({ color: held ? 0x6a5420 : 0x2a2110 });
    uniforms.uThreshold.value = held ? (dim ? 0.11 : 0.08) : 0.16;
    world.fill.intensity = held ? 0.16 : 0.2;
  }

  function cycleLamp() {
    if (!state.flags.lamp || state.phase !== "explore") return;
    if (state.oil <= 0.01) {
      state.lampMode = "off";
      say("The wick is dry.");
      applyLampVisuals();
      return;
    }
    state.lampMode = state.lampMode === "off" ? "dim" : state.lampMode === "dim" ? "bright" : "off";
    applyLampVisuals();
    pushHud();
  }

  function placeInBed() {
    camera.position.set(-0.72, BED_Y, 0.35);
    state.yaw = Math.PI;
    state.pitch = 0.08;
    state.crawling = false;
    state.crouching = false;
  }

  function queueNight1() {
    const t0 = performance.now() / 1000;
    const steps: SeqStep[] = [
      {
        at: t0 + 3.2,
        done: false,
        fn: () => {
          lightningStrike(1);
          say(COPY.flash1);
        },
      },
      {
        at: t0 + 8.2,
        done: false,
        fn: () => {
          world.entity.visible = true;
          world.entity.userData.mode = "window";
          world.entity.position.set(0.9, 0.95, 11.15);
          world.entity.lookAt(camera.position);
          lightningStrike(1.05);
          audio.bassDrop();
          state.terror = 0.64;
          say(COPY.flash2);
        },
      },
      {
        at: t0 + 11.8,
        done: false,
        fn: () => {
          world.entity.visible = false;
          uniforms.uTrack.value = 0.62;
          say("…");
        },
      },
      {
        at: t0 + 15.4,
        done: false,
        fn: () => {
          world.entity.visible = true;
          world.entity.position.set(0.15, 1.08, 2.35);
          world.entity.scale.set(1.4, 1.6, 1.15);
          world.entity.lookAt(camera.position);
          lightningStrike(1.4);
          audio.stinger();
          state.shake = 1;
          state.terror = 0.94;
          say(COPY.flash3, 2800);
        },
      },
      {
        at: t0 + 19.0,
        done: false,
        fn: () => {
          world.entity.scale.set(1.15, 1.38, 1.05);
          world.entity.position.set(0.9, 0.95, 11.2);
          world.entity.visible = false;
          state.lookLocked = false;
          state.canMove = true;
          state.phase = "explore";
          uniforms.uTrack.value = 0.18;
          state.terror = 0.42;
          say(COPY.free, 5200);
          persist();
          pushHud();
        },
      },
    ];
    state.seq = steps;
  }

  function beginNight(n: Night) {
    state.night = n;
    state.prompt = "";
    state.promptAlt = null;
    state.inspect = null;
    state.flags.ending = n === 5 ? state.flags.ending : null;
    world.parentA.visible = n === 4 || n === 5;
    world.parentB.visible = n === 4 || n === 5;
    world.father.visible = n === 4;
    audio.setRain(n === 5 ? 0.2 : 0.13);

    if (n === 1) {
      state.phase = "n1_hold";
      state.lookLocked = true;
      state.canMove = false;
      placeInBed();
      world.entity.visible = false;
      world.entity.position.set(0.9, 0.95, 11.2);
      state.lampMode = "off";
      applyLampVisuals();
      say(COPY.wake, 5000);
      queueNight1();
    } else if (n === 2) {
      state.phase = "explore";
      state.lookLocked = false;
      state.canMove = true;
      camera.position.set(-0.4, STAND_Y, 0.2);
      if (state.flags.lamp) state.lampMode = state.lampMode === "off" ? "dim" : state.lampMode;
      applyLampVisuals();
      say(COPY.n2start);
    } else if (n === 3) {
      state.phase = "explore";
      state.lookLocked = false;
      state.canMove = true;
      world.entity.visible = true;
      world.entity.userData.mode = "rafter";
      world.entity.position.set(0.15, 2.28, 0.4);
      say(COPY.rafter, 5000);
    } else if (n === 4) {
      state.phase = "explore";
      state.lookLocked = false;
      state.canMove = true;
      world.entity.visible = false;
      say(COPY.hatch, 5200);
    } else {
      state.phase = "explore";
      state.lookLocked = false;
      state.canMove = true;
      world.entity.visible = true;
      world.entity.userData.mode = "shed";
      world.entity.position.set(0.85, 0.95, 11.15);
      world.parentA.position.set(-0.45, 0.4, 11.05);
      world.parentB.position.set(0.55, 0.38, 11.2);
      say(COPY.amavasi, 5600);
    }
    persist();
    pushHud();
  }

  function nearestHotspot(): Hotspot | null {
    if (state.phase !== "explore") return null;
    const p = camera.position;
    const fwd = forwardFromYaw(state.yaw);
    let best: Hotspot | null = null;
    let bestScore = 99;
    for (const h of world.hotspots) {
      if (state.night < h.nightMin || state.night > h.nightMax) continue;
      const dx = h.x - p.x;
      const dz = h.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d > h.r) continue;
      const look = dx * fwd.x + dz * fwd.z;
      const score = d - look * 0.35;
      if (score < bestScore) {
        best = h;
        bestScore = score;
      }
    }
    return best;
  }

  function labelFor(h: Hotspot): string {
    const f = state.flags;
    switch (h.id) {
      case "lamp":
        return f.lamp ? "" : "Take the vilakku";
      case "door":
        return "Try the door";
      case "cup":
        return f.dumped ? "" : "Dump the kashayam";
      case "oil":
        return "Refill the wick";
      case "photo":
        return f.photo ? "Look again" : "Look at the photograph";
      case "chart":
        return f.chart ? "Look again" : "Read the chart";
      case "pact":
        return f.pact ? "Read again" : "Read the palm leaf";
      case "hatch":
        return f.sawRitual ? "Climb back" : "Lift the floorboard";
      case "ritual":
        return f.sawRitual ? "" : "Watch";
      case "sickle":
        return f.sickle ? "" : "Take the sickle";
      case "shed":
        return f.sickle ? "Step into the shed" : "";
      case "parents":
        return f.sickle && f.lamp ? "Turn the lamp on them" : "";
      default:
        return "";
    }
  }

  function tryInteract() {
    if (state.inspect) {
      state.inspect = null;
      state.phase = "explore";
      pushHud();
      return;
    }
    if (state.phase === "ending") {
      if (state.prompt.startsWith("Again")) resetRun();
      return;
    }
    const hs = nearestHotspot();
    if (!hs) {
      const adv = advanceReady(state.night, state.flags);
      if (adv && state.prompt === adv) {
        beginNight((state.night + 1) as Night);
      }
      return;
    }
    const f = state.flags;
    if (hs.id === "lamp" && !f.lamp) {
      f.lamp = true;
      state.lampMode = "dim";
      applyLampVisuals();
      say(COPY.lamp);
    } else if (hs.id === "door") {
      f.doorTried = true;
      say(COPY.door);
      audio.snap();
    } else if (hs.id === "cup" && !f.dumped) {
      f.dumped = true;
      world.cup.visible = false;
      audio.pour();
      say(COPY.dumped);
    } else if (hs.id === "oil") {
      state.oil = 1;
      say(COPY.oil);
    } else if (hs.id === "photo") {
      f.photo = true;
      state.inspect = { ...PHOTO_INSPECT, image: null };
      state.phase = "inspect";
      say(COPY.photo, 6200);
    } else if (hs.id === "chart") {
      f.chart = true;
      state.inspect = { ...CHART_INSPECT, image: null };
      state.phase = "inspect";
      say(COPY.chart, 6200);
    } else if (hs.id === "pact") {
      f.pact = true;
      state.inspect = { ...PACT_INSPECT, image: "/textures/palmleaf.jpg" };
      state.phase = "inspect";
      say(COPY.granary, 7200);
    } else if (hs.id === "hatch") {
      if (!f.sawRitual) {
        state.crawling = true;
        camera.position.set(-0.2, CRAWL_Y, 2.35);
        state.yaw = 0;
        say("The nadumuttam opens like a black mouth.");
      } else {
        state.crawling = false;
        camera.position.set(-0.9, STAND_Y, 0.2);
        say("The floor closes over the chant.");
      }
    } else if (hs.id === "ritual" && !f.sawRitual) {
      f.sawRitual = true;
      camera.position.set(0.15, 0.42, 3.15);
      state.yaw = Math.PI;
      state.crawling = true;
      state.terror = 0.72;
      say(COPY.ritual, 7000);
    } else if (hs.id === "sickle" && !f.sickle) {
      f.sickle = true;
      world.sickle.visible = false;
      say(COPY.sickle);
    } else if (hs.id === "shed" && f.sickle) {
      offerEnding();
    } else if (hs.id === "parents" && f.sickle && f.lamp) {
      finish("redirect");
    }
    persist();
    pushHud();
  }

  function offerEnding() {
    state.prompt = "Burn the shed";
    state.promptAlt = "Turn the lamp on them";
    say(COPY.n5choice, 6400);
    pushHud();
  }

  function finish(kind: "burn" | "redirect") {
    state.flags.ending = kind;
    state.phase = "ending";
    state.lookLocked = true;
    state.canMove = false;
    state.prompt = "";
    state.promptAlt = null;
    lightningStrike(1.25);
    say(kind === "burn" ? COPY.burn : COPY.redirect, 8200);
    persist();
    pushHud();
    window.setTimeout(() => {
      state.prompt = "Again, from the window";
      pushHud();
    }, 5200);
  }

  function resetRun() {
    state.flags = emptyFlags();
    state.oil = 1;
    state.lampMode = "off";
    world.cup.visible = true;
    world.sickle.visible = true;
    applyLampVisuals();
    beginNight(1);
  }

  function catchPlayer() {
    state.phase = "caught";
    state.canMove = false;
    audio.stinger();
    state.shake = 0.7;
    say(COPY.caught, 3600);
    window.setTimeout(() => {
      camera.position.set(-0.9, CRAWL_Y, 0.1);
      state.crawling = true;
      state.phase = "explore";
      state.canMove = true;
      state.lookLocked = false;
      pushHud();
    }, 1400);
  }

  const tmpFwd = { x: 0, z: 0 };
  const tmpRight = { x: 0, z: 0 };

  function movePlayer(dt: number) {
    const { dx, dy } = input.consumeLook();
    if (!state.lookLocked) {
      state.yaw -= dx * input.lookSens;
      state.pitch = clampPitch(state.pitch - dy * input.lookSens * 0.82);
    }

    const edges = input.consumeEdges();
    if (edges.interact) tryInteract();
    if (edges.lamp) cycleLamp();
    if (edges.crouchToggle) state.crouching = !state.crouching;

    const wantCrouch = input.holdingCrouch() || state.crouching || state.crawling;
    if (state.night === 4 && camera.position.z > 2.5) state.crawling = true;

    let targetY = STAND_Y;
    if (!state.canMove && state.night === 1) targetY = BED_Y;
    else if (state.crawling) targetY = CRAWL_Y;
    else if (wantCrouch) targetY = CROUCH_Y;

    camera.position.y = expDamp(camera.position.y, targetY, 9, dt);

    if (!state.canMove) {
      state.speed = 0;
      return;
    }

    const mv = input.sampleMove();
    tmpFwd.x = forwardFromYaw(state.yaw).x;
    tmpFwd.z = forwardFromYaw(state.yaw).z;
    tmpRight.x = rightFromYaw(state.yaw).x;
    tmpRight.z = rightFromYaw(state.yaw).z;

    const speed = (state.crawling ? 0.55 : wantCrouch ? 0.72 : 1.28) * (state.lampMode === "bright" ? 1 : 1);
    const vx = (tmpFwd.x * -mv.y + tmpRight.x * mv.x) * speed;
    const vz = (tmpFwd.z * -mv.y + tmpRight.z * mv.x) * speed;
    state.speed = Math.hypot(vx, vz);

    let nx = camera.position.x + vx * dt;
    let nz = camera.position.z + vz * dt;
    const resolved = resolveCircle(nx, nz, PLAYER_R, world.colliders, state.night);
    nx = resolved.x;
    nz = resolved.z;
    camera.position.x = nx;
    camera.position.z = nz;

    if (state.speed > 0.15) {
      state.bob += dt * (state.crawling ? 7 : 9.5) * state.speed;
      state.footT += dt * state.speed;
      if (state.footT > 0.42) {
        state.footT = 0;
        audio.foot(wantCrouch);
        if (Math.random() < 0.12) audio.woodCreak();
      }
    } else {
      state.bob = expDamp(state.bob, 0, 6, dt);
    }
  }

  function updateEntity(dt: number) {
    if (!world.entity.visible) return;
    const mode = world.entity.userData.mode;
    const snapped = poseVessel(world.entity, state.time, dt, mode);
    if (snapped) audio.snap();

    if (state.night === 3 && mode === "rafter") {
      const path = 0.5 + Math.sin(state.time * 0.35) * 0.5;
      world.entity.position.x = lerp(-1.6, 1.8, path);
      world.entity.position.z = lerp(-1.2, 4.8, (Math.sin(state.time * 0.22) + 1) / 2);
      world.entity.position.y = 2.28;
      const dx = world.entity.position.x - camera.position.x;
      const dz = world.entity.position.z - camera.position.z;
      const dist = Math.hypot(dx, dz);
      const lampHeat = state.lampMode === "bright" ? 1.4 : state.lampMode === "dim" ? 0.7 : 0.25;
      const hide = state.crouching || state.crawling ? 0.55 : 1;
      const detect = (1 / Math.max(dist, 0.4)) * lampHeat * hide;
      audio.setNear(clamp(detect, 0, 1));
      if (detect > 0.85) {
        world.entity.userData.mode = "hunt";
        world.entity.position.y = 1.05;
        say(COPY.seen, 3000);
        state.terror = 0.9;
        audio.stinger();
      }
      state.terror = expDamp(state.terror, clamp(0.35 + detect * 0.4, 0, 1), 1.2, dt);
    }

    if (mode === "hunt") {
      const p = camera.position;
      world.entity.position.x = expDamp(world.entity.position.x, p.x, 1.6, dt);
      world.entity.position.z = expDamp(world.entity.position.z, p.z, 1.6, dt);
      world.entity.position.y = 1.05;
      world.entity.lookAt(p.x, 1.0, p.z);
      const d = world.entity.position.distanceTo(p);
      if (state.lampMode !== "bright" && (state.crouching || d > 3.2)) {
        state.entityHunt += dt;
        if (state.entityHunt > 2.2) {
          world.entity.userData.mode = "rafter";
          world.entity.position.y = 2.28;
          state.entityHunt = 0;
        }
      } else {
        state.entityHunt = 0;
      }
    }

    if (state.night === 5) {
      world.entity.lookAt(camera.position);
      const d = world.entity.position.distanceTo(camera.position);
      state.terror = expDamp(state.terror, clamp(0.4 + (4 - d) * 0.12, 0.3, 0.95), 1.4, dt);
      audio.setNear(clamp(1.6 / Math.max(d, 0.5), 0, 1));
    }
  }

  function updateFather(dt: number) {
    if (world.parentA.visible) {
      poseAdult(world.parentA, state.time, false);
      poseAdult(world.parentB, state.time + 0.7, false);
      world.parentA.position.y = (state.night === 5 ? 0.4 : 0.32) + Math.sin(state.time * 1.3) * 0.02;
      world.parentB.position.y = (state.night === 5 ? 0.38 : 0.3) + Math.sin(state.time * 1.1) * 0.02;
    }
    if (!world.father.visible) return;
    state.fatherT += dt;
    const t = state.fatherT;
    const wx = [-2.4, 2.4, 2.4, -2.4];
    const wz = [3.4, 3.4, 7.6, 7.6];
    const seg = Math.floor(t * 0.18) % 4;
    const local = (t * 0.18) % 1;
    const a = seg;
    const b = (seg + 1) % 4;
    const x = lerp(wx[a], wx[b], local);
    const z = lerp(wz[a], wz[b], local);
    world.father.position.x = x;
    world.father.position.z = z;
    world.father.position.y = 0.95;
    const heading = Math.atan2(wx[b] - wx[a], wz[b] - wz[a]);
    world.father.rotation.y = heading;
    poseAdult(world.father, state.time, true);

    if (state.phase !== "explore" || !state.canMove) return;
    if (camera.position.z < 2.7) return;
    const toP = new THREE.Vector2(camera.position.x - x, camera.position.z - z);
    const dist = toP.length();
    const facing = new THREE.Vector2(Math.sin(heading), Math.cos(heading));
    const cone = dist > 0.001 ? toP.normalize().dot(facing) : 1;
    const hidden = state.crouching || state.crawling;
    if (dist < 3.4 && cone > 0.35 && !hidden) catchPlayer();
  }

  function updateHotspotPrompt() {
    if (state.phase === "ending") return;
    if (state.phase !== "explore") {
      if (!state.prompt.startsWith("Again")) state.prompt = "";
      return;
    }
    const adv = advanceReady(state.night, state.flags);
    if (adv) {
      state.prompt = adv;
      state.promptAlt = null;
      return;
    }
    const hs = nearestHotspot();
    const lab = hs ? labelFor(hs) : "";
    state.prompt = lab;
    if (hs?.id !== "shed") state.promptAlt = null;
  }

  function resize() {
    const w = Math.max(host.clientWidth, 1);
    const h = Math.max(host.clientHeight, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    rt.setSize(w, h);
    uniforms.uRes.value.set(w, h);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  let last = performance.now();
  function frame(now: number) {
    if (state.disposed) return;
    state._raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!state.started) {
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(composerScene, composerCam);
      return;
    }
    state.time += dt;

    const wall = now / 1000;
    for (const s of state.seq) {
      if (!s.done && wall >= s.at) {
        s.done = true;
        s.fn();
      }
    }

    state.flash = lerp(state.flash, 0, 1 - Math.pow(0.08, dt));
    world.lightning.intensity = state.flash * 3.0;
    state.shake = lerp(state.shake, 0, 1 - Math.pow(0.002, dt));
    if (state.phase === "n1_hold" && Math.random() < dt * 0.12) lightningStrike(0.25);

    if (state.flags.lamp && state.lampMode !== "off") {
      const drain = state.lampMode === "bright" ? 0.018 : 0.007;
      state.oil = clamp(state.oil - drain * dt, 0, 1);
      if (state.oil <= 0.01) {
        state.lampMode = "off";
        say("The vilakku starves.");
      }
      world.flame.intensity = (state.lampMode === "bright" ? 3.2 : 1.7) + Math.sin(state.time * 11) * 0.2;
      world.lampSpot.intensity = state.lampMode === "bright" ? 5.0 : 2.5;
      world.lampSpot.position.copy(camera.position);
      world.lampSpot.target.position.set(
        camera.position.x + forwardFromYaw(state.yaw).x,
        camera.position.y,
        camera.position.z + forwardFromYaw(state.yaw).z,
      );
      if (!world.lampSpot.target.parent) scene.add(world.lampSpot.target);
    }

    const rainArr = world.rain.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < world.rainCount; i++) {
      rainArr[i * 3 + 1] -= (7 + (i % 5)) * dt;
      if (rainArr[i * 3 + 1] < -0.2) rainArr[i * 3 + 1] = 6.2;
    }
    world.rain.geometry.attributes.position.needsUpdate = true;

    movePlayer(dt);
    updateEntity(dt);
    updateFather(dt);
    updateHotspotPrompt();

    const breathe = state.lookLocked ? Math.sin(state.time * 1.3) * 0.012 : 0;
    const bobY = Math.abs(Math.sin(state.bob)) * 0.028 * (state.crawling ? 0.4 : 1);
    const bobX = Math.sin(state.bob * 0.5) * 0.012;
    const shakeX = (Math.random() - 0.5) * state.shake * 0.1;
    const shakeY = (Math.random() - 0.5) * state.shake * 0.08;
    camera.rotation.y = state.yaw + shakeX + bobX;
    camera.rotation.x = state.pitch + shakeY + bobY + breathe;

    uniforms.uTime.value = state.time;
    uniforms.uFlash.value = state.flash;
    uniforms.uShake.value = state.shake;
    uniforms.uGrain.value = 0.11 + state.terror * 0.14;
    uniforms.uFear.value = state.terror;
    audio.setTerror(state.terror);

    renderer.setRenderTarget(rt);
    renderer.clear();
    camera.layers.set(0);
    renderer.render(scene, camera);
    renderer.clearDepth();
    camera.layers.set(1);
    renderer.render(scene, camera);
    camera.layers.set(0);
    renderer.setRenderTarget(null);
    renderer.render(composerScene, composerCam);

    state.hudAcc += dt;
    if (state.hudAcc > 0.12) {
      state.hudAcc = 0;
      pushHud();
    }
  }
  state._raf = requestAnimationFrame(frame);

  const probe = {
    getYaw: () => state.yaw,
    getSpeed: () => state.speed,
    setKeys: (codes: string[]) => input.setForced(codes),
    setSteer: (v: number) => {
      // FPS: steer is unused; A/D strafe. Keep for the probe contract.
      void v;
    },
    getPosition: () => ({ x: camera.position.x, y: camera.position.y, z: camera.position.z }),
  };
  window.__controlsTest = probe;
  window.__vilakku = {
    beginNight,
    getState: () => ({
      night: state.night,
      phase: state.phase,
      yaw: state.yaw,
      x: camera.position.x,
      z: camera.position.z,
      canMove: state.canMove,
    }),
    setYaw: (y: number) => {
      state.yaw = y;
    },
  };

  async function start(opts?: { continueSave?: boolean; qa?: boolean }) {
    await audio.unlock();
    state.started = true;
    const qa = opts?.qa || /(?:\?|&)qa=1(?:&|$)/.test(window.location.search);
    if (qa) {
      state.flags.lamp = true;
      state.lampMode = "dim";
      applyLampVisuals();
      state.lookLocked = false;
      state.canMove = true;
      state.phase = "explore";
      camera.position.set(0, STAND_Y, 0);
      state.yaw = Math.PI;
      say("QA path. The house is open.");
      pushHud();
      return;
    }
    if (opts?.continueSave) {
      const save = loadSave();
      if (save) {
        state.flags = { ...emptyFlags(), ...save.flags };
        state.oil = save.oil;
        applyLampVisuals();
        beginNight(save.night === 1 ? 2 : save.night);
        return;
      }
    }
    beginNight(1);
  }

  function dispose() {
    state.disposed = true;
    cancelAnimationFrame(state._raf);
    ro.disconnect();
    overlay.dispose();
    input.dispose();
    audio.dispose();
    rt.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  pushHud();

  const handle: VilakkuHandle = {
    start,
    toggleLamp: cycleLamp,
    toggleCrouch: () => {
      state.crouching = !state.crouching;
      pushHud();
    },
    interact: tryInteract,
    closeInspect: () => {
      state.inspect = null;
      if (state.phase === "inspect") state.phase = "explore";
      pushHud();
    },
    chooseEnding: (kind) => {
      if (kind === "burn") finish("burn");
      else finish("redirect");
    },
    restart: resetRun,
    dispose,
  };
  Object.assign(api, handle);
  return handle;
}


