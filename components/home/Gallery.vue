<script setup lang="ts">
import * as THREE from 'three'
import type { NavItem } from '~/types/nav'

const props = defineProps<{ items: NavItem[] }>()
const emit = defineEmits<{ ready: []; cardClick: [href: string] }>()

const IMG: Record<string, string> = {
  'about': '/about-me.png', 'instructional-design': '/instructional-design.png',
  'my-work': '/my-work.png', 'tools': '/web-apps.png', 'downloads': '/downloads.png'
}

const cv = ref<HTMLCanvasElement | null>(null)
const active = ref(0)
const R = useReveal()
const N = computed(() => props.items.length)

// ── Physics ──
let pos = 0, vel = 0, goal: number | null = null, intro = 0
let dragging = false, dragged = false, downX = 0, basePos = 0, lastX = 0, lastT = 0
let hover = -1

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.PerspectiveCamera
const cards: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; aspect: number; hv: number }[] = []
const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2()
let raf = 0, tPrev = 0, loaded = 0
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

const H = 2.15, SPACING = 2.3, DEPTH = 1.55, TILT = 0.62, MAXT = 0.9, YLIFT = 0.5, DRAGPX = 240

const vert = /* glsl */`
varying vec2 vUv; varying float vDepth;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`
const frag = /* glsl */`
precision highp float;
uniform sampler2D map; uniform float uAspect, uRadius, uOpacity, uHover, uFogNear, uFogFar; uniform vec3 uFog;
varying vec2 vUv; varying float vDepth;
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r; }
void main(){
  vec4 t = texture2D(map, vUv);
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float d = sdRound(p, vec2(uAspect, 1.0) * 0.5, uRadius);
  float aa = fwidth(d) + 0.0008;
  float alpha = 1.0 - smoothstep(0.0, aa, d);
  vec3 col = t.rgb;
  // glassy inner rim: a soft light line just inside the rounded edge
  float rim = smoothstep(aa, 0.0, abs(d + 0.014) - 0.006);
  col += (1.0 - col) * rim * 0.35;
  // hover lift — gentle brighten
  col = mix(col, col * 1.05 + 0.02, uHover);
  // depth fog toward the background colour
  float fog = smoothstep(uFogNear, uFogFar, vDepth);
  col = mix(col, uFog, fog);
  gl_FragColor = vec4(col, alpha * uOpacity * t.a);
}`

function makeMat(fogHex: number) {
  const fc = new THREE.Color(fogHex)
  return new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { map: { value: null }, uAspect: { value: 16 / 9 }, uRadius: { value: 0.055 }, uOpacity: { value: 1 }, uHover: { value: 0 }, uFog: { value: new THREE.Vector3(fc.r, fc.g, fc.b) }, uFogNear: { value: 5.5 }, uFogFar: { value: 13 } }
  })
}
function themeColor(name: string, fb: number) { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); try { return new THREE.Color(v || '#000').getHex() } catch { return fb } }

function tick(now: number) {
  const dt = tPrev ? Math.min((now - tPrev) / 16.67, 2) : 1; tPrev = now
  intro += (1 - intro) * 0.045 * dt
  if (dragging) { /* set on move */ }
  else if (goal !== null) { pos += (goal - pos) * 0.14 * dt; vel = 0; if (Math.abs(goal - pos) < 0.001) { pos = goal; goal = null } }
  else { pos += vel * dt; vel *= Math.pow(0.92, dt); pos = clamp(pos, 0, N.value - 1); if (Math.abs(vel) < 0.016) { const t = Math.round(pos); pos += (t - pos) * 0.12 * dt } }
  pos = clamp(pos, 0, N.value - 1)
  const introZ = (1 - intro) * -4, introOp = intro
  const t = now / 1000
  cards.forEach((c, i) => {
    const a = i - pos
    const targetHv = (i === hover && !dragging) ? 1 : 0
    c.hv += (targetHv - c.hv) * 0.12 * dt
    const s = (1 - Math.min(Math.abs(a), 3) * 0.05) * (1 + c.hv * 0.04)
    c.mesh.position.set(a * SPACING, YLIFT + Math.sin(t * 0.6 + i) * 0.03 + c.hv * 0.06, -Math.abs(a) * DEPTH + introZ)
    c.mesh.rotation.y = clamp(-a * TILT, -MAXT, MAXT) * (0.4 + intro * 0.6)
    c.mesh.scale.set(c.aspect * H * s, H * s, 1)
    c.mat.uniforms.uOpacity.value = clamp(1 - Math.abs(a) * 0.16, 0, 1) * introOp
    c.mat.uniforms.uHover.value = c.hv
    c.mesh.renderOrder = 100 - Math.round(Math.abs(a) * 10)
    c.mesh.visible = Math.abs(a) < 3.6
  })
  const ai = clamp(Math.round(pos), 0, N.value - 1)
  if (ai !== active.value) active.value = ai
  renderer.render(scene, cam)
  raf = requestAnimationFrame(tick)
}

function raycastIndex(cx: number, cy: number) {
  ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1)
  ray.setFromCamera(ndc, cam)
  const hit = ray.intersectObjects(cards.map(c => c.mesh))[0]
  return hit ? cards.findIndex(c => c.mesh === hit.object) : -1
}
function onDown(e: PointerEvent) { dragging = true; dragged = false; downX = lastX = e.clientX; basePos = pos; lastT = performance.now(); vel = 0; goal = null; (cv.value as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) {
  if (dragging) {
    const now = performance.now(); const d = e.clientX - lastX
    if (Math.abs(e.clientX - downX) > 5) dragged = true
    pos = clamp(basePos - (e.clientX - downX) / DRAGPX, 0, N.value - 1)
    vel = clamp(-d / DRAGPX * (16 / Math.max(now - lastT, 8)), -0.6, 0.6)
    lastX = e.clientX; lastT = now
  } else { hover = raycastIndex(e.clientX, e.clientY); document.body.style.cursor = hover >= 0 ? 'pointer' : '' }
}
function onUp(e: PointerEvent) {
  if (!dragging) return; dragging = false
  if (!dragged) { const i = raycastIndex(e.clientX, e.clientY); if (i >= 0) { if (i === Math.round(pos)) emit('cardClick', props.items[i].href); else goal = i } }
}
let wlock = false
function onWheel(e: WheelEvent) { const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (Math.abs(d) < 6 || wlock) return; wlock = true; goal = clamp(Math.round(pos) + (d > 0 ? 1 : -1), 0, N.value - 1); setTimeout(() => (wlock = false), 200) }
function onKey(e: KeyboardEvent) { if (e.key === 'ArrowRight') goal = clamp(Math.round(pos) + 1, 0, N.value - 1); else if (e.key === 'ArrowLeft') goal = clamp(Math.round(pos) - 1, 0, N.value - 1); else if (e.key === 'Enter') emit('cardClick', props.items[active.value].href) }
function enter(i: number) { if (i === active.value) emit('cardClick', props.items[i].href); else goal = i }

onMounted(() => {
  renderer = new THREE.WebGLRenderer({ canvas: cv.value!, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  scene = new THREE.Scene()
  const bg = themeColor('--color-bg', 0xf5efe8)
  scene.fog = new THREE.Fog(bg, 5.5, 13)
  cam = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100); cam.position.set(0, 0, 6.6)
  const geo = new THREE.PlaneGeometry(1, 1)
  const loader = new THREE.TextureLoader()
  const total = props.items.length
  props.items.forEach((item) => {
    const mat = makeMat(bg)
    const mesh = new THREE.Mesh(geo, mat)
    const c = { mesh, mat, aspect: 16 / 9, hv: 0 }
    cards.push(c); scene.add(mesh)
    const done = () => { if (++loaded >= total) emit('ready') }
    const tex = loader.load(IMG[item.id] || '/about-me.png', (t) => { const im = t.image as HTMLImageElement; if (im?.width) c.aspect = im.width / im.height; done() }, undefined, done)
    tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; mat.uniforms.map.value = tex
  })
  const resize = () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix() }
  resize(); addEventListener('resize', resize); addEventListener('wheel', onWheel, { passive: true }); addEventListener('keydown', onKey)
  raf = requestAnimationFrame(tick)
  // Safety: never block entry on a stuck texture.
  setTimeout(() => emit('ready'), 4000)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey); document.body.style.cursor = ''; renderer?.dispose() })
</script>

<template>
  <div class="gal">
    <canvas ref="cv" class="gal__cv" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" />

    <div class="gal__idx" aria-hidden="true"><span>{{ String(active + 1).padStart(2, '0') }}</span><i>/</i><span>{{ String(N).padStart(2, '0') }}</span></div>

    <div class="gal__ui">
      <span class="gal__eyebrow" v-motion :initial="R.rise(300).initial" :visible-once="R.rise(300).visibleOnce">Naveen Jose — Instructional Designer</span>
      <Transition name="gal" mode="out-in">
        <div :key="active" class="gal__cap">
          <h1 class="gal__label">{{ items[active]?.label }}</h1>
          <p class="gal__desc">{{ items[active]?.description }}</p>
        </div>
      </Transition>
      <div class="gal__row" v-motion :initial="R.rise(420).initial" :visible-once="R.rise(420).visibleOnce">
        <button class="gal__enter glass-btn" @click="enter(active)">Open {{ items[active]?.label }} →</button>
        <span class="gal__hint">swipe · fling · click a card</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gal { position: fixed; inset: 0; overflow: hidden; }
.gal__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
.gal__cv:active { cursor: grabbing; }
.gal__idx { position: fixed; top: calc(22rem + var(--safe-top)); right: clamp(70rem, 8vw, 96rem); z-index: 12; font-family: 'Fraunces', Georgia, serif; font-size: 15rem; opacity: 0.55; font-variant-numeric: tabular-nums; }
.gal__idx i { font-style: normal; opacity: 0.4; margin: 0 4rem; }
.gal__ui { position: fixed; left: 0; right: 0; bottom: clamp(40rem, 8vh, 84rem); z-index: 12; text-align: center; pointer-events: none; padding: 0 24rem; }
.gal__eyebrow { display: inline-block; font-size: 12rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; opacity: 0.55; }
.gal__cap { margin-top: 8rem; }
.gal__label { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; font-weight: 400; font-size: clamp(40rem, 6vw, 84rem); line-height: 1; letter-spacing: -0.02em; margin: 0; }
.gal__desc { font-size: 14.5rem; opacity: 0.65; margin: 8rem auto 0; max-width: 44ch; }
.gal__row { margin-top: 16rem; display: inline-flex; align-items: center; gap: 16rem; flex-wrap: wrap; justify-content: center; }
.gal__enter { pointer-events: auto; text-decoration: none; font-family: 'Fraunces', Georgia, serif; font-style: italic; }
.gal__hint { font-size: 11.5rem; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.45; }
.gal-enter-active, .gal-leave-active { transition: opacity 0.35s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.gal-enter-from { opacity: 0; transform: translateY(16rem); }
.gal-leave-to { opacity: 0; transform: translateY(-10rem); }
@media (max-width: 620px) { .gal__hint { display: none; } .gal__idx { right: 66rem; } }
</style>
