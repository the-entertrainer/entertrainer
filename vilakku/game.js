/**
 * VILAKKU — mobile WebGL folk-horror engine
 * Pitch-black tharavadu, VHS/comic threshold, Rule-of-Three window.
 * Entity is a starved, joint-snapping vessel — never sexualized.
 */

import * as THREE from 'three'

const NIGHT_TITLES = {
  1: 'Night 1 — The Window',
  2: 'Night 2 — The Medicine',
  3: 'Night 3 — The Pact',
  4: 'Night 4 — The Betrayal',
  5: 'Night 5 — Amavasi'
}

const COPY = {
  wake: 'You cannot move. Rain hits the terracotta. The vilakku is out.',
  flash1: 'Lightning. The wood shed is empty.',
  flash2: 'Something is standing by the shed. It is looking at the window.',
  flash3: 'It is on the bars.',
  free: 'Breath returns. The door is still locked from the outside.',
  lamp: 'Brass. Warm. The only honest light in this house.',
  door: 'Padlocked. The bolt is on the other side. They do not want you walking.',
  kashayam: 'Mother’s kashayam. Bitter. Your tongue still remembers last night.',
  dumped: 'You pour it into the monsoon drain. The cup looks innocent again.',
  photo: '1958. A woman’s face is clawed out of the emulsion. Your birth star is inked in the margin.',
  rafter: 'It hangs from the rafters like wet rope that learned a spine.',
  granary: 'Palm leaf, 1958. Wealth for thirty-six years. Collateral: a starved aunt. Vessel: a boy born under Aslesha.',
  ritual: 'In the nadumuttam they stand in black water. Paint on skin. They are not praying for you.',
  amavasi: 'No one left in the rooms. The shed is waiting. The sickle is rusted. The lamp is not.',
  burn: 'You feed the pact to the flame. The shed takes the debt.',
  redirect: 'You turn the light on the ones who signed. The thing in the shed remembers who starved it.'
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uFlash;
  uniform float uGrain;
  uniform float uTrack;
  uniform float uShake;
  uniform float uThreshold;
  uniform float uInk;
  uniform vec2 uRes;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    float tear = sin(uv.y * 18.0 + uTime * 7.0) * uTrack * 0.012;
    uv.x += tear + uShake * (hash(vec2(uTime, uv.y)) - 0.5) * 0.04;
    uv.y += uShake * 0.01 * sin(uTime * 55.0);
    uv = clamp(uv, 0.0, 1.0);

    vec3 col = texture2D(tDiffuse, uv).rgb;
    float luma = dot(col, vec3(0.29, 0.58, 0.13));
    luma += uFlash * 0.55;

    float edge = 0.0;
    vec2 px = 1.0 / uRes;
    float n = dot(texture2D(tDiffuse, uv + vec2(0.0, px.y)).rgb, vec3(0.29, 0.58, 0.13));
    float s = dot(texture2D(tDiffuse, uv - vec2(0.0, px.y)).rgb, vec3(0.29, 0.58, 0.13));
    float e = dot(texture2D(tDiffuse, uv + vec2(px.x, 0.0)).rgb, vec3(0.29, 0.58, 0.13));
    float w = dot(texture2D(tDiffuse, uv - vec2(px.x, 0.0)).rgb, vec3(0.29, 0.58, 0.13));
    edge = abs(n - s) + abs(e - w);

    float ink = step(uThreshold, luma);
    float mid = step(uThreshold * 0.55, luma) * (1.0 - ink);
    float line = step(0.12, edge);
    float paper = ink * 0.96 + mid * 0.28 + line * uInk;

    float scan = 0.88 + 0.12 * step(0.5, fract(uv.y * uRes.y * 0.5 + uTime * 8.0));
    float grain = (hash(uv * uRes + uTime * 12.0) - 0.5) * uGrain;
    float vig = smoothstep(1.15, 0.28, length((uv - 0.5) * vec2(1.15, 1.35)));

    float outc = clamp(paper * scan * vig + grain, 0.0, 1.0);
    outc = mix(outc, 1.0, uFlash * 0.85);
    gl_FragColor = vec4(vec3(outc), 1.0);
  }
`

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
function lerp(a, b, t) { return a + (b - a) * t }

function el(tag, cls, text) {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (text != null) n.textContent = text
  return n
}

class AudioWorld {
  constructor() {
    this.ctx = null
    this.master = null
    this.terror = 0.15
    this._heartT = 0
    this._running = false
  }

  async unlock() {
    if (this.ctx) return
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0.55
    this.master.connect(ctx.destination)
    this._rain()
    this._running = true
    this._tick()
  }

  setTerror(t) { this.terror = clamp(t, 0, 1) }

  thunder(gain = 0.9) {
    if (!this.ctx) return
    const ctx = this.ctx
    const dur = 1.8
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2)
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'lowpass'
    bp.frequency.value = 280
    const g = ctx.createGain()
    g.gain.value = gain
    src.connect(bp); bp.connect(g); g.connect(this.master)
    src.start()
  }

  bassDrop() {
    if (!this.ctx) return
    const ctx = this.ctx
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(48, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 1.4)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.7, ctx.currentTime + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6)
    o.connect(g); g.connect(this.master)
    o.start(); o.stop(ctx.currentTime + 1.7)
  }

  stinger() {
    if (!this.ctx) return
    const ctx = this.ctx
    this.thunder(1)
    this.bassDrop()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(140, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.28)
    g.gain.setValueAtTime(0.2, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
    o.connect(g); g.connect(this.master)
    o.start(); o.stop(ctx.currentTime + 0.32)
    try { navigator.vibrate?.([40, 30, 80, 40, 180]) } catch {}
  }

  snap() {
    if (!this.ctx) return
    const ctx = this.ctx
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.value = 90 + Math.random() * 70
    g.gain.setValueAtTime(0.12, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07)
    o.connect(g); g.connect(this.master)
    o.start(); o.stop(ctx.currentTime + 0.08)
  }

  whisper(textLen = 8) {
    if (!this.ctx) return
    const ctx = this.ctx
    const dur = 0.6 + textLen * 0.04
    const buf = ctx.createBuffer(2, ctx.sampleRate * dur, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.25
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 900
    bp.Q.value = 2.2
    const g = ctx.createGain()
    g.gain.value = 0.08 + this.terror * 0.1
    src.connect(bp); bp.connect(g); g.connect(this.master)
    src.start()
  }

  _rain() {
    const ctx = this.ctx
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 800
    const g = ctx.createGain()
    g.gain.value = 0.12
    this._rainGain = g
    src.connect(hp); hp.connect(g); g.connect(this.master)
    src.start()
  }

  _tick() {
    if (!this._running || !this.ctx) return
    const ctx = this.ctx
    const bpm = 48 + this.terror * 70
    const interval = 60 / bpm
    this._heartT += 0.016
    if (this._heartT >= interval) {
      this._heartT = 0
      this._thump(0.09 + this.terror * 0.12)
      setTimeout(() => this._thump(0.05 + this.terror * 0.08), 90)
      if (this.terror > 0.55) {
        try { navigator.vibrate?.(Math.floor(18 + this.terror * 30)) } catch {}
      }
    }
    this._raf = requestAnimationFrame(() => this._tick())
  }

  _thump(amp) {
    const ctx = this.ctx
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.setValueAtTime(62, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.16)
    g.gain.setValueAtTime(amp, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
    o.connect(g); g.connect(this.master)
    o.start(); o.stop(ctx.currentTime + 0.2)
  }

  dispose() {
    this._running = false
    if (this._raf) cancelAnimationFrame(this._raf)
    try { this.ctx?.close() } catch {}
    this.ctx = null
  }
}

function matUnlit(hex, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color: hex,
    transparent: opacity < 1,
    opacity,
    side: THREE.DoubleSide
  })
}

function makeEntity() {
  const root = new THREE.Group()
  const bone = matUnlit(0x0a0a0a)
  const wet = matUnlit(0x1a1a1a)
  const boneMat = bone

  const parts = {}
  const box = (w, h, d, material = boneMat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
    return m
  }

  parts.pelvis = box(0.28, 0.16, 0.16)
  parts.spine = box(0.14, 0.42, 0.12)
  parts.spine.position.y = 0.28
  parts.chest = box(0.32, 0.22, 0.16, wet)
  parts.chest.position.y = 0.52
  parts.neck = box(0.08, 0.16, 0.08)
  parts.neck.position.y = 0.68
  parts.head = box(0.2, 0.24, 0.18, wet)
  parts.head.position.y = 0.86
  parts.jaw = box(0.16, 0.06, 0.14)
  parts.jaw.position.set(0, 0.74, 0.04)

  const arm = (side) => {
    const s = side
    const shoulder = box(0.1, 0.1, 0.1)
    shoulder.position.set(0.22 * s, 0.56, 0)
    const upper = box(0.07, 0.38, 0.07)
    upper.position.set(0.28 * s, 0.34, 0.02)
    const extra = box(0.06, 0.28, 0.06)
    extra.position.set(0.34 * s, 0.08, 0.08)
    const hand = box(0.08, 0.16, 0.06)
    hand.position.set(0.38 * s, -0.12, 0.14)
    return [shoulder, upper, extra, hand]
  }

  const leg = (side) => {
    const s = side
    const thigh = box(0.1, 0.42, 0.1)
    thigh.position.set(0.1 * s, -0.28, 0)
    const shin = box(0.08, 0.4, 0.08)
    shin.position.set(0.12 * s, -0.66, 0.04)
    const foot = box(0.1, 0.06, 0.22)
    foot.position.set(0.12 * s, -0.88, 0.08)
    return [thigh, shin, foot]
  }

  Object.values(parts).forEach((p) => root.add(p))
  parts.armsL = arm(-1); parts.armsR = arm(1)
  parts.legsL = leg(-1); parts.legsR = leg(1)
  ;[...parts.armsL, ...parts.armsR, ...parts.legsL, ...parts.legsR].forEach((p) => root.add(p))

  root.userData.parts = parts
  root.userData.snapT = 0
  root.scale.set(1.15, 1.35, 1.05)
  return root
}

function poseEntity(ent, t, mode) {
  const p = ent.userData.parts
  const shiver = Math.sin(t * 17.0) * 0.02
  p.head.rotation.z = shiver * 3
  p.head.rotation.y = Math.sin(t * 0.7) * 0.25
  p.jaw.position.y = 0.74 + Math.abs(Math.sin(t * 2.2)) * 0.03
  p.spine.rotation.x = Math.sin(t * 1.3) * 0.08

  const crawl = mode === 'window' ? 1 : mode === 'rafter' ? 0 : 0.4
  p.armsL[1].rotation.z = 0.4 + Math.sin(t * 2.1) * 0.3
  p.armsR[1].rotation.z = -0.4 + Math.cos(t * 1.9) * 0.3
  p.armsL[2].rotation.x = Math.sin(t * 3.0) * 0.5
  p.armsR[2].rotation.x = Math.cos(t * 2.6) * 0.5
  p.armsL[3].rotation.z = Math.sin(t * 5.0) * 0.4
  p.legsL[0].rotation.x = Math.sin(t * 1.4) * 0.2 * crawl
  p.legsR[0].rotation.x = Math.cos(t * 1.4) * 0.2 * crawl

  if (mode === 'rafter') {
    ent.rotation.z = Math.PI
    ent.rotation.x = Math.sin(t * 0.8) * 0.08
  } else {
    ent.rotation.z = 0
  }

  ent.userData.snapT -= 0.016
  if (ent.userData.snapT <= 0 && Math.random() < 0.01) {
    p.head.rotation.y += (Math.random() > 0.5 ? 0.7 : -0.7)
    p.armsL[2].rotation.y += 0.9
    ent.userData.snapT = 1.2 + Math.random() * 2.5
    return true
  }
  return false
}

export function createVilakku(host) {
  const state = {
    night: 1,
    phase: 'title',
    flags: {
      lamp: false,
      doorTried: false,
      dumped: false,
      photo: false,
      pact: false,
      sawRitual: false,
      sickle: false,
      ending: null
    },
    yaw: 0,
    pitch: 0.05,
    lookLocked: true,
    canMove: false,
    terror: 0.2,
    flash: 0,
    shake: 0,
    time: 0,
    seqAt: 0,
    disposed: false
  }

  const overlay = el('div', 'vk-overlay')
  const hud = el('div', 'vk-hud')
  const title = el('div', 'vk-title')
  title.innerHTML = `<div class="vk-mark">വിളക്ക്</div><h1>VILAKKU</h1><p>A tharavadu in the monsoon. Kerala, 1994.</p><p class="vk-warn">Folk horror. A child in a locked house. No cheap scream track — stay anyway.</p>`
  const startBtn = el('button', 'vk-btn', 'Light the lamp')
  title.appendChild(startBtn)
  const sub = el('div', 'vk-sub', '')
  const nightLabel = el('div', 'vk-night', '')
  const prompt = el('button', 'vk-prompt', '')
  prompt.hidden = true
  const stick = el('div', 'vk-stick')
  const knob = el('div', 'vk-knob')
  stick.appendChild(knob)
  stick.hidden = true
  const lookZone = el('div', 'vk-look')
  const back = el('a', 'vk-back', '← Engage')
  back.href = '/engage'
  hud.append(nightLabel, sub, prompt, stick, lookZone, back)
  overlay.append(title, hud)
  host.appendChild(overlay)
  injectCss()

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.setSize(host.clientWidth, host.clientHeight)
  renderer.setClearColor(0x000000, 1)
  renderer.domElement.className = 'vk-canvas'
  host.insertBefore(renderer.domElement, overlay)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.12)
  const camera = new THREE.PerspectiveCamera(52, host.clientWidth / Math.max(host.clientHeight, 1), 0.05, 80)
  camera.position.set(0.2, 0.72, 0.4)

  const world = new THREE.Group()
  scene.add(world)

  const roomW = 4.4, roomD = 5.2, roomH = 2.55
  const wallMat = matUnlit(0x080808)
  const floorMat = matUnlit(0x050505)
  const woodMat = matUnlit(0x101010)
  const barMat = matUnlit(0x000000)

  const floor = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.08, roomD), floorMat)
  floor.position.y = -0.04
  world.add(floor)
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.08, roomD), wallMat)
  ceil.position.y = roomH
  world.add(ceil)

  function wall(w, h, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat)
    m.position.set(x, y, z)
    world.add(m)
    return m
  }
  wall(roomW, roomH, 0.12, 0, roomH / 2, -roomD / 2)
  wall(roomW, roomH, 0.12, 0, roomH / 2, roomD / 2)
  wall(0.12, roomH, roomD, -roomW / 2, roomH / 2, 0)
  wall(0.12, roomH, roomD, roomW / 2, roomH / 2, 0)

  // window hole suggestion: pale plane + bars
  const windowGroup = new THREE.Group()
  windowGroup.position.set(0.15, 1.15, roomD / 2 - 0.07)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.85), matUnlit(0x101218))
  windowGroup.add(glass)
  for (let i = -2; i <= 2; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.9, 0.04), barMat)
    bar.position.set(i * 0.22, 0, 0.02)
    windowGroup.add(bar)
  }
  for (let i = -1; i <= 1; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.03, 0.04), barMat)
    bar.position.set(0, i * 0.28, 0.02)
    windowGroup.add(bar)
  }
  world.add(windowGroup)

  const outside = new THREE.Group()
  outside.position.set(0.15, 0, roomD / 2 + 3.4)
  const ground = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 8), matUnlit(0x020203))
  ground.position.y = -0.2
  outside.add(ground)
  const shed = new THREE.Group()
  const shedBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.4), woodMat)
  shedBody.position.y = 0.7
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.7, 4), woodMat)
  roof.position.y = 1.7
  roof.rotation.y = Math.PI / 4
  shed.add(shedBody, roof)
  shed.position.set(0.8, 0, 1.2)
  outside.add(shed)
  world.add(outside)

  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 1.9), woodMat)
  bed.position.set(-0.9, 0.2, 0.1)
  world.add(bed)
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 1.8), matUnlit(0x0c0c0c))
  mattress.position.set(-0.9, 0.38, 0.1)
  world.add(mattress)

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.38, 0.42), woodMat)
  chest.position.set(0.95, 0.2, -1.4)
  world.add(chest)

  const lampMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.16, 8), matUnlit(0x2a2110))
  lampMesh.position.set(0.95, 0.48, -1.4)
  world.add(lampMesh)
  const flame = new THREE.PointLight(0xffd9a0, 0, 4.5)
  flame.position.copy(lampMesh.position)
  flame.position.y += 0.12
  world.add(flame)

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.06), woodMat)
  door.position.set(-roomW / 2 + 0.08, 0.9, -0.8)
  world.add(door)

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.08, 8), matUnlit(0x161616))
  cup.position.set(-0.35, 0.48, -1.6)
  world.add(cup)

  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.55), woodMat)
  desk.position.set(1.2, 0.72, 1.6)
  world.add(desk)
  const photo = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.02), matUnlit(0x222222))
  photo.position.set(1.05, 0.9, 1.45)
  world.add(photo)

  const entity = makeEntity()
  entity.visible = false
  entity.position.set(0.9, 0.95, roomD / 2 + 2.6)
  world.add(entity)

  const rainGeo = new THREE.BufferGeometry()
  const rainCount = 900
  const rainPos = new Float32Array(rainCount * 3)
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 12
    rainPos[i * 3 + 1] = Math.random() * 6
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 12 + 3
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3))
  const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x8899aa, size: 0.015 }))
  world.add(rain)

  const lightning = new THREE.DirectionalLight(0xffffff, 0)
  lightning.position.set(-2, 8, 10)
  scene.add(lightning)
  const fill = new THREE.AmbientLight(0x000000, 0)
  scene.add(fill)

  const rt = new THREE.WebGLRenderTarget(host.clientWidth, host.clientHeight, {
    minFilter: THREE.BilinearFilter,
    magFilter: THREE.BilinearFilter,
    format: THREE.RGBAFormat
  })
  const composerScene = new THREE.Scene()
  const composerCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const uniforms = {
    tDiffuse: { value: rt.texture },
    uTime: { value: 0 },
    uFlash: { value: 0 },
    uGrain: { value: 0.16 },
    uTrack: { value: 0.15 },
    uShake: { value: 0 },
    uThreshold: { value: 0.22 },
    uInk: { value: 0.55 },
    uRes: { value: new THREE.Vector2(host.clientWidth, host.clientHeight) }
  }
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG })
  )
  composerScene.add(quad)

  const audio = new AudioWorld()
  const move = { x: 0, y: 0 }
  let dragging = false
  let lastX = 0, lastY = 0
  let stickId = null

  lookZone.addEventListener('pointerdown', (e) => {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    lookZone.setPointerCapture(e.pointerId)
  })
  lookZone.addEventListener('pointermove', (e) => {
    if (!dragging || state.lookLocked) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    state.yaw -= dx * 0.0045
    state.pitch -= dy * 0.0035
    state.pitch = clamp(state.pitch, -0.7, 0.55)
  })
  lookZone.addEventListener('pointerup', () => { dragging = false })

  function setStick(e) {
    const r = stick.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    let x = (e.clientX - cx) / (r.width * 0.5)
    let y = (e.clientY - cy) / (r.height * 0.5)
    const m = Math.hypot(x, y) || 1
    if (m > 1) { x /= m; y /= m }
    move.x = x
    move.y = y
    knob.style.transform = `translate(${x * 22}px, ${y * 22}px)`
  }
  stick.addEventListener('pointerdown', (e) => {
    stickId = e.pointerId
    stick.setPointerCapture(e.pointerId)
    setStick(e)
  })
  stick.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) setStick(e) })
  const endStick = () => {
    stickId = null
    move.x = 0; move.y = 0
    knob.style.transform = ''
  }
  stick.addEventListener('pointerup', endStick)
  stick.addEventListener('pointercancel', endStick)

  window.addEventListener('keydown', onKey)
  function onKey(e) {
    if (state.phase === 'title') return
    if (e.key === 'w' || e.key === 'ArrowUp') move.y = -1
    if (e.key === 's' || e.key === 'ArrowDown') move.y = 1
    if (e.key === 'a' || e.key === 'ArrowLeft') move.x = -1
    if (e.key === 'd' || e.key === 'ArrowRight') move.x = 1
    if (e.key === 'e' || e.key === ' ') tryInteract()
  }
  window.addEventListener('keyup', (e) => {
    if (['w', 'ArrowUp', 's', 'ArrowDown'].includes(e.key)) move.y = 0
    if (['a', 'ArrowLeft', 'd', 'ArrowRight'].includes(e.key)) move.x = 0
  })

  function say(text, ms = 4200) {
    sub.textContent = text
    sub.dataset.on = '1'
    audio.whisper(text.length)
    clearTimeout(say._t)
    say._t = setTimeout(() => { sub.dataset.on = '0' }, ms)
  }

  function setPrompt(label, fn) {
    if (!label) { prompt.hidden = true; prompt.onclick = null; return }
    prompt.hidden = false
    prompt.textContent = label
    prompt.onclick = (e) => { e.preventDefault(); fn?.() }
  }

  function lightningStrike(power = 1) {
    state.flash = power
    lightning.intensity = 3.2 * power
    audio.thunder(0.55 + power * 0.4)
    try { navigator.vibrate?.(40) } catch {}
  }

  function placePlayerInBed() {
    camera.position.set(-0.7, 0.72, 0.55)
    state.yaw = 0
    state.pitch = 0.08
  }

  function beginNight(n) {
    state.night = n
    nightLabel.textContent = NIGHT_TITLES[n]
    state.flags.ending = n === 5 ? state.flags.ending : state.flags.ending
    if (n === 1) {
      state.phase = 'n1_hold'
      state.lookLocked = true
      state.canMove = false
      stick.hidden = true
      placePlayerInBed()
      entity.visible = false
      entity.position.set(0.9, 0.95, roomD / 2 + 2.6)
      flame.intensity = 0
      state.seqAt = state.time
      say(COPY.wake, 5000)
      setPrompt('')
      queueSequence()
    } else if (n === 2) {
      state.phase = 'explore'
      state.lookLocked = false
      state.canMove = true
      stick.hidden = false
      flame.intensity = state.flags.lamp ? 1.6 : 0
      say('The kashayam is already on the chest. They will come to watch you drink.')
    } else if (n === 3) {
      state.phase = 'explore'
      state.lookLocked = false
      state.canMove = true
      stick.hidden = false
      entity.visible = true
      entity.position.set(0.2, 2.15, 0.2)
      entity.userData.mode = 'rafter'
      say(COPY.rafter, 5000)
    } else if (n === 4) {
      state.phase = 'explore'
      state.lookLocked = false
      state.canMove = true
      stick.hidden = false
      entity.visible = false
      say('The floorboard under the bed is loose. The courtyard is loud with rain.')
    } else if (n === 5) {
      state.phase = 'explore'
      state.lookLocked = false
      state.canMove = true
      stick.hidden = false
      entity.visible = true
      entity.userData.mode = 'window'
      entity.position.set(0.8, 0.95, roomD / 2 + 1.5)
      say(COPY.amavasi, 5600)
    }
  }

  function queueSequence() {
    const t0 = state.time
    const steps = [
      { at: 3.2, fn: () => { lightningStrike(1); say(COPY.flash1) } },
      { at: 8.4, fn: () => {
        entity.visible = true
        entity.position.set(0.9, 0.95, roomD / 2 + 2.4)
        lightningStrike(1)
        audio.bassDrop()
        state.terror = 0.62
        say(COPY.flash2)
      } },
      { at: 12.0, fn: () => {
        entity.visible = false
        state.flash = 0
        lightning.intensity = 0
        uniforms.uTrack.value = 0.55
        say('…')
      } },
      { at: 16.0, fn: () => {
        entity.visible = true
        entity.position.set(0.15, 1.05, roomD / 2 - 0.35)
        entity.scale.set(1.35, 1.55, 1.1)
        lightningStrike(1.3)
        audio.stinger()
        state.shake = 1
        state.terror = 0.92
        say(COPY.flash3, 2600)
      } },
      { at: 19.2, fn: () => {
        entity.scale.set(1.15, 1.35, 1.05)
        entity.position.set(0.9, 0.95, roomD / 2 + 2.6)
        entity.visible = false
        state.lookLocked = false
        state.canMove = true
        stick.hidden = false
        state.phase = 'explore'
        uniforms.uTrack.value = 0.18
        state.terror = 0.45
        say(COPY.free, 5200)
      } }
    ]
    state._seq = steps.map((s) => ({ ...s, at: t0 + s.at, done: false }))
  }

  function nearestHotspot() {
    const p = camera.position
    const spots = [
      { id: 'lamp', pos: lampMesh.position, r: 1.15, night: 1 },
      { id: 'door', pos: door.position, r: 1.2, night: 1 },
      { id: 'cup', pos: cup.position, r: 1.1, night: 2 },
      { id: 'photo', pos: photo.position, r: 1.2, night: 2 },
      { id: 'desk', pos: desk.position, r: 1.3, night: 3 },
      { id: 'bed', pos: bed.position, r: 1.1, night: 4 },
      { id: 'shed', pos: new THREE.Vector3(0.9, 0.7, roomD / 2 + 4.4), r: 2.2, night: 5 }
    ]
    let best = null
    let bestD = 99
    for (const s of spots) {
      if (s.night !== state.night && !(s.id === 'lamp' && state.night >= 1) && !(s.id === 'door' && state.night <= 3)) continue
      if (s.night !== state.night && s.id !== 'lamp' && s.id !== 'door') continue
      const d = p.distanceTo(s.pos)
      if (d < s.r && d < bestD) { best = s; bestD = d }
    }
    return best
  }

  function tryInteract() {
    const hs = nearestHotspot()
    if (!hs) return
    if (hs.id === 'lamp' && !state.flags.lamp) {
      state.flags.lamp = true
      flame.intensity = 1.7
      lampMesh.material.color.setHex(0x6a5420)
      say(COPY.lamp)
    } else if (hs.id === 'door') {
      state.flags.doorTried = true
      say(COPY.door)
      audio.snap()
    } else if (hs.id === 'cup' && !state.flags.dumped) {
      state.flags.dumped = true
      cup.visible = false
      say(COPY.dumped)
    } else if (hs.id === 'photo' && !state.flags.photo) {
      state.flags.photo = true
      say(COPY.photo, 6200)
    } else if (hs.id === 'desk' && !state.flags.pact) {
      state.flags.pact = true
      say(COPY.granary, 7000)
    } else if (hs.id === 'bed' && !state.flags.sawRitual) {
      state.flags.sawRitual = true
      camera.position.set(0.2, 0.35, roomD / 2 - 0.8)
      state.yaw = 0
      say(COPY.ritual, 7000)
      state.terror = 0.7
    } else if (hs.id === 'shed' && !state.flags.ending) {
      offerEnding()
    }
  }

  function offerEnding() {
    setPrompt('Burn the shed', () => finish('burn'))
    const second = el('button', 'vk-prompt vk-prompt-alt', 'Turn the lamp on them')
    second.onclick = () => finish('redirect')
    hud.appendChild(second)
    state._alt = second
    say('The sickle is in your other hand. The pact is dry enough to catch.')
  }

  function finish(kind) {
    state.flags.ending = kind
    state.phase = 'ending'
    state.lookLocked = true
    state.canMove = false
    setPrompt('')
    state._alt?.remove()
    lightningStrike(1.2)
    say(kind === 'burn' ? COPY.burn : COPY.redirect, 8000)
    nightLabel.textContent = kind === 'burn' ? 'The debt goes to ash' : 'The signatories remain'
    setTimeout(() => {
      setPrompt('Again, from the window', () => {
        Object.assign(state.flags, {
          lamp: false, doorTried: false, dumped: false, photo: false,
          pact: false, sawRitual: false, sickle: false, ending: null
        })
        flame.intensity = 0
        cup.visible = true
        lampMesh.material.color.setHex(0x2a2110)
        beginNight(1)
      })
    }, 5000)
  }

  function maybeAdvanceNight() {
    if (state.phase !== 'explore') return
    if (state.night === 1 && state.flags.lamp && state.flags.doorTried) {
      setPrompt('Lie down. Night 2.', () => beginNight(2))
    } else if (state.night === 2 && state.flags.dumped && state.flags.photo) {
      setPrompt('The rafters creak. Night 3.', () => beginNight(3))
    } else if (state.night === 3 && state.flags.pact) {
      setPrompt('The courtyard fills. Night 4.', () => beginNight(4))
    } else if (state.night === 4 && state.flags.sawRitual) {
      setPrompt('Amavasi. Walk to the shed.', () => beginNight(5))
    }
  }

  startBtn.addEventListener('click', async () => {
    await audio.unlock()
    title.classList.add('vk-title--out')
    setTimeout(() => { title.style.display = 'none' }, 700)
    beginNight(1)
  })

  function resize() {
    const w = host.clientWidth
    const h = Math.max(host.clientHeight, 1)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    rt.setSize(w, h)
    uniforms.uRes.value.set(w, h)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  let last = performance.now()
  function frame(now) {
    if (state.disposed) return
    state._raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    state.time += dt

    if (state._seq) {
      for (const s of state._seq) {
        if (!s.done && state.time >= s.at) { s.done = true; s.fn() }
      }
    }

    state.flash = lerp(state.flash, 0, 1 - Math.pow(0.001, dt))
    lightning.intensity = state.flash * 3.1
    state.shake = lerp(state.shake, 0, 1 - Math.pow(0.002, dt))
    uniforms.uTime.value = state.time
    uniforms.uFlash.value = state.flash
    uniforms.uShake.value = state.shake
    uniforms.uGrain.value = 0.12 + state.terror * 0.12
    uniforms.uThreshold.value = state.flags.lamp ? 0.16 : 0.24

    const rainArr = rain.geometry.attributes.position.array
    for (let i = 0; i < rainCount; i++) {
      rainArr[i * 3 + 1] -= (8 + (i % 5)) * dt
      if (rainArr[i * 3 + 1] < -0.2) rainArr[i * 3 + 1] = 5.5
    }
    rain.geometry.attributes.position.needsUpdate = true

    if (entity.visible) {
      const snapped = poseEntity(entity, state.time, entity.userData.mode || 'window')
      if (snapped) audio.snap()
    }

    if (state.canMove) {
      const speed = 1.15
      const fx = Math.sin(state.yaw)
      const fz = Math.cos(state.yaw)
      camera.position.x += (fx * -move.y + Math.cos(state.yaw) * move.x) * speed * dt
      camera.position.z += (fz * -move.y + -Math.sin(state.yaw) * move.x) * speed * dt
      camera.position.x = clamp(camera.position.x, -roomW / 2 + 0.35, roomW / 2 - 0.35)
      camera.position.z = clamp(camera.position.z, -roomD / 2 + 0.35, roomD / 2 + (state.night === 5 ? 4.2 : 0.2))
      camera.position.y = state.flags.sawRitual && state.night === 4 ? 0.38 : 0.72
    }

    const shakeX = (Math.random() - 0.5) * state.shake * 0.12
    const shakeY = (Math.random() - 0.5) * state.shake * 0.08
    camera.rotation.order = 'YXZ'
    camera.rotation.y = state.yaw + shakeX
    camera.rotation.x = state.pitch + shakeY

    if (state.flags.lamp) {
      flame.intensity = 1.35 + Math.sin(state.time * 11.0) * 0.18
    }

    const hs = state.phase === 'explore' ? nearestHotspot() : null
    if (hs && !state.flags.ending) {
      const labels = {
        lamp: state.flags.lamp ? '' : 'Take the vilakku',
        door: 'Try the door',
        cup: state.flags.dumped ? '' : 'Dump the kashayam',
        photo: state.flags.photo ? '' : 'Look at the photograph',
        desk: state.flags.pact ? '' : 'Read the palm leaf',
        bed: state.flags.sawRitual ? '' : 'Lift the floorboard',
        shed: 'Step into the shed'
      }
      const lab = labels[hs.id]
      if (lab && prompt.hidden) setPrompt(lab, tryInteract)
      else if (lab) { prompt.hidden = false; prompt.textContent = lab; prompt.onclick = tryInteract }
    } else if (state.phase === 'explore') {
      maybeAdvanceNight()
      if (prompt.textContent.startsWith('Lie') || prompt.textContent.startsWith('The ') || prompt.textContent.startsWith('Amavasi')) {
        /* keep advance prompt */
      } else if (!state.flags.ending) {
        setPrompt('')
      }
    }

    audio.setTerror(state.terror)
    renderer.setRenderTarget(rt)
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(composerScene, composerCam)
  }
  requestAnimationFrame(frame)

  return {
    dispose() {
      state.disposed = true
      cancelAnimationFrame(state._raf)
      ro.disconnect()
      window.removeEventListener('keydown', onKey)
      audio.dispose()
      rt.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      overlay.remove()
    }
  }
}

function injectCss() {
  if (document.getElementById('vk-css')) return
  const s = document.createElement('style')
  s.id = 'vk-css'
  s.textContent = `
    html.vilakku-rem .sp,html.vilakku-rem .ed-preloader{display:none!important}
    #vilakku-host,#vilakku-host *{box-sizing:border-box}
    .vk-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;background:#000;z-index:0}
    .vk-overlay{position:absolute;inset:0;pointer-events:none;z-index:2;font-family:Georgia,"Iowan Old Style","Times New Roman",serif;color:#e6dfd0}
    .vk-title{pointer-events:auto;position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:radial-gradient(ellipse at 50% 38%,#14110c 0%,#000 62%);text-align:center;padding:28px 22px;transition:opacity .7s ease}
    .vk-title--out{opacity:0;pointer-events:none}
    .vk-mark{font-size:15px;letter-spacing:.38em;opacity:.5;margin-bottom:10px}
    .vk-title h1{font-weight:400;letter-spacing:.36em;font-size:34px;margin:0 0 18px;color:#f3ead8}
    .vk-title p{max-width:28ch;margin:0 auto 10px;font-size:14px;line-height:1.5;opacity:.8}
    .vk-warn{opacity:.45!important;font-size:12px!important}
    .vk-btn,.vk-prompt{pointer-events:auto;appearance:none;border:1px solid #cfc6a8;background:#0a0a0a;color:#cfc6a8;
      padding:12px 22px;letter-spacing:.18em;text-transform:uppercase;font-size:11px;font-family:inherit}
    .vk-hud{position:absolute;inset:0}
    .vk-night{position:absolute;top:calc(10px + env(safe-area-inset-top));left:16px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;opacity:.7}
    .vk-back{pointer-events:auto;position:absolute;top:calc(10px + env(safe-area-inset-top));right:16px;color:#cfc6a8;text-decoration:none;font-size:12px;opacity:.7}
    .vk-sub{position:absolute;left:16px;right:16px;bottom:calc(118px + env(safe-area-inset-bottom));
      text-align:center;font-size:15px;line-height:1.45;opacity:0;transition:opacity .35s ease}
    .vk-sub[data-on="1"]{opacity:.92}
    .vk-prompt{position:absolute;left:50%;bottom:calc(64px + env(safe-area-inset-bottom));transform:translateX(-50%);white-space:nowrap}
    .vk-prompt-alt{bottom:calc(118px + env(safe-area-inset-bottom))}
    .vk-look{pointer-events:auto;position:absolute;inset:0 0 22% 28%}
    .vk-stick{pointer-events:auto;position:absolute;left:18px;bottom:calc(18px + env(safe-area-inset-bottom));
      width:96px;height:96px;border:1px solid rgba(200,190,160,.35);border-radius:50%}
    .vk-knob{width:36px;height:36px;border-radius:50%;background:rgba(200,190,160,.35);
      position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);margin-left:-18px;margin-top:-18px}
    .vk-knob{transform:translate(0,0);left:30px;top:30px;margin:0}
  `
  document.head.appendChild(s)
}
