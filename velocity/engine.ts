import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { ScaleId } from "./scales";
import { earthOrbit, siderealAngle, DEG } from "./physics";
import {
  earthMaterial,
  atmosphere,
  sunHalo,
  dipoleMaterial,
} from "./materials";
import { createGalaxy, createStarfield } from "./galaxy";
export type Quality = "balanced" | "high";
export interface CreateEngineOpts {
  canvas: HTMLCanvasElement;
  lat: number;
  lon: number;
  scale: ScaleId;
  paused: boolean;
  quality: Quality;
  onReady: () => void;
  onProgress: (loaded: number, total: number) => void;
  onError: (message: string) => void;
}
export interface VelocityEngine {
  setScale: (scale: ScaleId) => void;
  setLocation: (lat: number, lon: number) => void;
  setPaused: (paused: boolean) => void;
  setRate: (rate: number) => void;
  resetView: () => void;
  focusLocation: () => void;
  dispose: () => void;
}
const CAMERAS: Record<ScaleId, [number, number, number]> = {
  earth: [3.1, 1.1, 3.6],
  sun: [6, 6.8, 11],
  galaxy: [11, 12, 15],
  cosmos: [7, 3, 9],
};
const RANGES: Record<ScaleId, [number, number]> = {
  earth: [2.4, 8],
  sun: [6, 26],
  galaxy: [8, 44],
  cosmos: [6, 24],
};
const textureRoot = "/velocity/textures/";
function ring(radius: number, color: number, opacity = 0.4): THREE.LineLoop {
  const points = Array.from(
    { length: 256 },
    (_, i) =>
      new THREE.Vector3(
        radius * Math.cos((i / 256) * Math.PI * 2),
        0,
        radius * Math.sin((i / 256) * Math.PI * 2),
      ),
  );
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}
function badge(text: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext("2d")!;
  context.font = "500 28px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(3,7,14,.85)";
  context.fillRect(0, 0, 512, 96);
  context.fillStyle = "#fff1bd";
  context.fillText(text, 256, 48);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  sprite.scale.set(1.3, 0.244, 1);
  return sprite;
}
export function createEngine(opts: CreateEngineOpts): VelocityEngine {
  let disposed = false,
    frame: ScaleId = opts.scale,
    paused = opts.paused,
    rate = 1,
    time = 0,
    lat = opts.lat,
    lon = opts.lon,
    dirty = true,
    lastFrame = 0,
    lastTime = performance.now();
  const initialDate = new Date(),
    initialOrbit = earthOrbit(initialDate),
    initialSidereal = siderealAngle(initialDate);
  const renderer = new THREE.WebGLRenderer({
    canvas: opts.canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  const dpr = Math.min(
    window.devicePixelRatio || 1,
    opts.quality === "high" ? 2 : 1.35,
  );
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor("#02050b");
  renderer.debug.onShaderError = () =>
    opts.onError(
      "The 3D shader could not run on this device. Speed estimates remain available.",
    );
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
  const controls = new OrbitControls(camera, opts.canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.65;
  controls.addEventListener("change", () => {
    dirty = true;
  });
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.25, 0.45, 1.2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const groups: Record<ScaleId, THREE.Group> = {
    earth: new THREE.Group(),
    sun: new THREE.Group(),
    galaxy: new THREE.Group(),
    cosmos: new THREE.Group(),
  };
  Object.values(groups).forEach((group) => scene.add(group));
  const sky = createStarfield();
  scene.add(sky);
  const sunDirection = new THREE.Vector3(
    -initialOrbit.position[0],
    -initialOrbit.position[2],
    initialOrbit.position[1],
  ).normalize();
  const sunlight = new THREE.DirectionalLight(0xfff5eb, 3.2);
  sunlight.position.copy(sunDirection).multiplyScalar(30);
  scene.add(sunlight);
  const ambient = new THREE.AmbientLight(0x657a9c, 0.055);
  scene.add(ambient);
  const textures = new Set<THREE.Texture>(),
    manager = new THREE.LoadingManager(),
    loader = new THREE.TextureLoader(manager);
  manager.onProgress = (_url, loaded, total) => {
    if (!disposed) opts.onProgress(loaded, total);
  };
  manager.onError = () => {
    if (!disposed)
      opts.onError(
        "Some surface details could not load. Reconnect and reload for full detail.",
      );
  };
  manager.onLoad = () => {
    if (!disposed) {
      dirty = true;
      opts.onReady();
    }
  };
  function texture(name: string, color = false): THREE.Texture {
    const t = loader.load(textureRoot + name, (loaded) => {
      if (disposed) loaded.dispose();
      else dirty = true;
    });
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    textures.add(t);
    return t;
  }
  const maps = {
    day: texture(
      opts.quality === "high" && renderer.capabilities.maxTextureSize >= 8192
        ? "earth_daymap-hd.webp"
        : "earth_daymap.webp",
      true,
    ),
    night: texture("earth_nightmap.webp", true),
    clouds: texture("earth_clouds.webp"),
    normal: texture("earth_normal.jpg"),
    specular: texture("earth_specular.jpg"),
  };
  const earthMat = earthMaterial(maps, sunDirection);
  const earthGeometry = new THREE.SphereGeometry(
    1,
    opts.quality === "high" ? 192 : 128,
    96,
  );
  const earthPivot = new THREE.Group(),
    surface = new THREE.Mesh(earthGeometry, earthMat);
  surface.scale.y = 0.99664719;
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(1.008, 96, 64),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      alphaMap: maps.clouds,
      transparent: true,
      opacity: 0.74,
      depthWrite: false,
      roughness: 1,
    }),
  );
  const atmosphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.025, 96, 64),
    atmosphere(sunDirection),
  );
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffd43b, toneMapped: false }),
  );
  const latitudeRing = ring(1.012, 0xffd43b, 0.5);
  const markerLabel = badge("YOUR SELECTED LATITUDE");
  markerLabel.scale.set(0.74, 0.139, 1);
  earthPivot.add(surface, clouds, marker, latitudeRing, markerLabel);
  groups.earth.add(earthPivot, atmosphereMesh);
  // Equatorial reference and rotation axis remain fixed while the surface rotates.
  const equator = ring(1.035, 0xb7c9d9, 0.13);
  groups.earth.add(equator);
  const axis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.24, 0),
      new THREE.Vector3(0, 1.24, 0),
    ]),
    new THREE.LineDashedMaterial({
      color: 0x7b8da2,
      dashSize: 0.045,
      gapSize: 0.035,
      transparent: true,
      opacity: 0.45,
    }),
  );
  axis.computeLineDistances();
  groups.earth.add(axis);
  function placeMarker() {
    const phi = lat * DEG,
      theta = lon * DEG;
    marker.position
      .set(
        Math.cos(phi) * Math.cos(theta),
        Math.sin(phi) * 0.996647,
        -Math.cos(phi) * Math.sin(theta),
      )
      .multiplyScalar(1.018);
    latitudeRing.position.y = Math.sin(phi) * 0.996647;
    latitudeRing.scale.set(
      Math.max(0.00001, Math.cos(phi)),
      1,
      Math.max(0.00001, Math.cos(phi)),
    );
    latitudeRing.visible = Math.abs(lat) < 89.9;
    markerLabel.position.copy(marker.position).multiplyScalar(1.24);
  }
  placeMarker();
  const sunMap = texture("sun.webp", true);
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 96, 64),
    new THREE.MeshBasicMaterial({
      map: sunMap,
      color: new THREE.Color(1.75, 1.5, 1.18),
    }),
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 64, 48),
    sunHalo(),
  );
  groups.sun.add(sunMesh, halo);
  const solarLamp = new THREE.PointLight(0xfff4df, 100, 0, 2);
  groups.sun.add(solarLamp);
  const orbitRadius = 3.3,
    e = initialOrbit.eccentricity;
  const orbitPoints = Array.from({ length: 360 }, (_, i) => {
    const a = (i / 360) * Math.PI * 2;
    return new THREE.Vector3(
      orbitRadius * (Math.cos(a) - e),
      0,
      -orbitRadius * Math.sqrt(1 - e * e) * Math.sin(a),
    );
  });
  const orbitPath = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(orbitPoints),
    new THREE.LineBasicMaterial({
      color: 0x8297ad,
      transparent: true,
      opacity: 0.4,
    }),
  );
  groups.sun.add(orbitPath);
  const orbitEarth = new THREE.Mesh(
    earthGeometry,
    new THREE.MeshStandardMaterial({ map: maps.day, roughness: 0.8 }),
  );
  orbitEarth.scale.setScalar(0.21);
  const orbitSunDirection = new THREE.Vector3();
  const orbitAtmo = new THREE.Mesh(
    new THREE.SphereGeometry(0.216, 48, 32),
    atmosphere(orbitSunDirection),
  );
  const orbitLabel = badge("EARTH · YOU ARE HERE");
  orbitLabel.scale.set(1.65, 0.309, 1);
  const sunLabel = badge("SUN");
  sunLabel.position.set(0, -1.0, 0);
  sunLabel.scale.set(1.1, 0.206, 1);
  const arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(),
    0.65,
    0xffd43b,
    0.13,
    0.07,
  );
  groups.sun.add(orbitEarth, orbitAtmo, orbitLabel, sunLabel, arrow);
  const galaxy = createGalaxy(opts.quality === "high" ? 80000 : 48000);
  groups.galaxy.add(galaxy);
  const solarRadius = 4.3,
    solarOrbit = ring(solarRadius, 0xffd43b, 0.35);
  groups.galaxy.add(solarOrbit);
  const solarMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffd43b, toneMapped: false }),
  );
  groups.galaxy.add(solarMarker);
  const solarLabel = badge("OUR SOLAR SYSTEM");
  solarLabel.scale.set(3.0, 0.5625, 1);
  groups.galaxy.add(solarLabel);
  const centreLabel = badge("GALACTIC CENTRE");
  centreLabel.position.set(0, 0.6, 0);
  centreLabel.scale.set(2.6, 0.4875, 1);
  groups.galaxy.add(centreLabel);
  const galaxyArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(),
    1.1,
    0xffd43b,
    0.2,
    0.09,
  );
  groups.galaxy.add(galaxyArrow);
  // CMB dipole is intentionally a conceptual sphere. Its colour is exaggerated.
  const cmb = new THREE.Mesh(
    new THREE.SphereGeometry(2.65, 96, 64),
    dipoleMaterial(),
  );
  groups.cosmos.add(cmb);
  const warmLabel = badge("WARMER · TOWARDS");
  warmLabel.position.set(3.1, 0, 0);
  warmLabel.scale.set(2.4, 0.45, 1);
  const coldLabel = badge("COOLER · AWAY");
  coldLabel.position.set(-3.1, 0, 0);
  coldLabel.scale.set(2.2, 0.4125, 1);
  const cmbArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-0.9, 0, 3),
    1.8,
    0xffd43b,
    0.25,
    0.13,
  );
  groups.cosmos.add(warmLabel, coldLabel, cmbArrow);
  function resetView() {
    const v = CAMERAS[frame];
    camera.position.set(...v).multiplyScalar(Math.max(1, 0.8 / camera.aspect));
    controls.target.set(0, 0, 0);
    controls.minDistance = RANGES[frame][0];
    controls.maxDistance = RANGES[frame][1];
    controls.update();
    dirty = true;
  }
  function show(next: ScaleId) {
    frame = next;
    Object.entries(groups).forEach(([id, group]) => {
      group.visible = id === next;
    });
    sunlight.visible = next === "earth";
    ambient.intensity = next === "earth" ? 0.055 : 0.06;
    bloom.strength = next === "galaxy" ? 0.34 : next === "sun" ? 0.38 : 0.2;
    bloom.threshold = next === "galaxy" ? 0.65 : 1.15;
    resetView();
    time = 0;
  }
  show(frame);
  function resize() {
    const width = opts.canvas.clientWidth,
      height = opts.canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    const oldFit = Math.max(1, 0.8 / camera.aspect);
    camera.aspect = width / height;
    camera.position.multiplyScalar(Math.max(1, 0.8 / camera.aspect) / oldFit);
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(opts.canvas);
  resize();
  function onLost(event: Event) {
    event.preventDefault();
    opts.onError(
      "The graphics connection was interrupted. Reload the scene to continue.",
    );
    paused = true;
  }
  opts.canvas.addEventListener("webglcontextlost", onLost);
  const onVisible = () => {
    lastTime = performance.now();
    dirty = true;
  };
  document.addEventListener("visibilitychange", onVisible);
  function draw(now: number) {
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    if (document.hidden) return;
    if (!paused) time += dt * rate;
    controls.update();
    if (now - lastFrame < (opts.quality === "high" ? 15 : 30)) return;
    if (paused && !dirty) return;
    lastFrame = now;
    dirty = false;
    if (frame === "earth") {
      earthPivot.rotation.y = initialSidereal + (time * Math.PI * 2) / 48;
      markerLabel.visible =
        marker.getWorldPosition(new THREE.Vector3()).dot(camera.position) > 0;
    } else if (frame === "sun") {
      const mean = initialOrbit.meanAnomaly + (time * Math.PI * 2) / 60;
      let E = mean;
      for (let i = 0; i < 5; i++)
        E -= (E - e * Math.sin(E) - mean) / (1 - e * Math.cos(E));
      orbitEarth.position.set(
        orbitRadius * (Math.cos(E) - e),
        0,
        -orbitRadius * Math.sqrt(1 - e * e) * Math.sin(E),
      );
      orbitEarth.rotation.y = time * 0.6;
      orbitSunDirection.copy(orbitEarth.position).negate().normalize();
      orbitAtmo.position.copy(orbitEarth.position);
      orbitLabel.position
        .copy(orbitEarth.position)
        .add(new THREE.Vector3(0, 0.65, 0));
      arrow.position.copy(orbitEarth.position);
      arrow.setDirection(
        new THREE.Vector3(
          -Math.sin(E),
          0,
          -Math.sqrt(1 - e * e) * Math.cos(E),
        ).normalize(),
      );
      sunMesh.rotation.y = time * 0.035;
    } else if (frame === "galaxy") {
      const angle = 0.8 + (time * Math.PI * 2) / 90;
      solarMarker.position.set(
        solarRadius * Math.cos(angle),
        0.06,
        -solarRadius * Math.sin(angle),
      );
      solarLabel.position
        .copy(solarMarker.position)
        .add(new THREE.Vector3(0, 0.7, 0));
      galaxyArrow.position.copy(solarMarker.position);
      galaxyArrow.setDirection(
        new THREE.Vector3(-Math.sin(angle), 0, -Math.cos(angle)),
      );
    }
    composer.render();
  }
  renderer.setAnimationLoop(draw);
  return {
    setScale: show,
    setLocation(a, b) {
      lat = a;
      lon = b;
      placeMarker();
      dirty = true;
    },
    setPaused(value) {
      paused = value;
      dirty = true;
    },
    setRate(value) {
      rate = value;
    },
    resetView,
    focusLocation() {
      if (frame !== "earth") show("earth");
      const world = marker.getWorldPosition(new THREE.Vector3()).normalize();
      camera.position.copy(world.multiplyScalar(4.5));
      controls.target.set(0, 0, 0);
      controls.update();
      dirty = true;
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      document.removeEventListener("visibilitychange", onVisible);
      opts.canvas.removeEventListener("webglcontextlost", onLost);
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) geometries.add(mesh.geometry);
        if (mesh.material)
          (Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]
          ).forEach((material) => materials.add(material));
      });
      for (const material of materials) {
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) textures.add(value);
        material.dispose();
      }
      geometries.forEach((g) => g.dispose());
      textures.forEach((t) => t.dispose());
      composer.passes.forEach((pass) => pass.dispose());
      composer.dispose();
      renderer.dispose();
    },
  };
}
