<script setup lang="ts">
import { Renderer, Geometry, Program, Mesh, Texture } from 'ogl'
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'WebGL Flux — Theme Lab', robots: 'noindex' })

const cv = ref<HTMLCanvasElement | null>(null)
const active = ref(0)
const N = LAB_NAV.length
const router = useRouter()

// ── momentum scroll physics ──
let scroll = 0, vel = 0, smoothVel = 0
let dragging = false, dragged = false, downX = 0, lastX = 0, lastT = 0, base = 0
const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
const DRAG = 320
let raf = 0, renderer: any, gl: any, program: any, mesh: any
const textures: any[] = []
const clampV = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

const vertex = `
  attribute vec2 position; attribute vec2 uv; varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`
const fragment = `
  precision highp float;
  uniform sampler2D t0, t1; uniform float prog, vel, uTime; uniform vec2 uPointer, uRes;
  varying vec2 vUv;
  vec2 cover(vec2 uv){ float sa = uRes.x/uRes.y; float ia = 16.0/9.0; vec2 s = sa>ia?vec2(ia/sa,1.0):vec2(1.0,sa/ia); return (uv-0.5)*s+0.5; }
  void main(){
    vec2 uv = vUv;
    float d = distance(uv, uPointer);
    float ripple = sin(d*34.0 - uTime*4.5) * exp(-d*7.0) * (0.014 + abs(vel)*0.03);
    float smear = vel * 0.55;
    vec2 duv = uv + vec2(smear, 0.0) + ripple;
    vec4 a = texture2D(t0, cover(duv - vec2(prog*0.18, 0.0)));
    vec4 b = texture2D(t1, cover(duv + vec2((1.0-prog)*0.18, 0.0)));
    vec3 col = mix(a.rgb, b.rgb, smoothstep(0.32, 0.68, prog));
    // subtle chromatic edge tied to speed
    float ca = abs(vel)*0.02;
    col.r = mix(a.r, b.r, smoothstep(0.32,0.68,prog+ca));
    float vig = smoothstep(1.15, 0.35, distance(uv, vec2(0.5)));
    col *= mix(0.82, 1.0, vig);
    gl_FragColor = vec4(col, 1.0);
  }`

function idxs() { const i = Math.floor(scroll); return [((i % N) + N) % N, ((i + 1) % N + N) % N] }
function tick(t: number) {
  if (!dragging) {
    scroll += vel; vel *= 0.93
    if (Math.abs(vel) < 0.0008) { const tgt = Math.round(scroll); scroll += (tgt - scroll) * 0.1 }
  }
  smoothVel += (vel - smoothVel) * 0.2
  pointer.x += (pointer.tx - pointer.x) * 0.08; pointer.y += (pointer.ty - pointer.y) * 0.08
  const [a, b] = idxs()
  const u = program.uniforms
  u.t0.value = textures[a]; u.t1.value = textures[b]
  u.prog.value = scroll - Math.floor(scroll)
  u.vel.value = clampV(smoothVel, -0.5, 0.5)
  u.uTime.value = t / 1000
  u.uPointer.value[0] = pointer.x; u.uPointer.value[1] = pointer.y
  const ai = ((Math.round(scroll) % N) + N) % N
  if (ai !== active.value) active.value = ai
  renderer.render({ scene: mesh })
  raf = requestAnimationFrame(tick)
}

function onDown(e: PointerEvent) { dragging = true; dragged = false; downX = lastX = e.clientX; base = scroll; lastT = performance.now(); vel = 0; (cv.value as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) {
  pointer.tx = e.clientX / innerWidth; pointer.ty = 1 - e.clientY / innerHeight
  if (!dragging) return
  const now = performance.now(), d = e.clientX - lastX
  if (Math.abs(e.clientX - downX) > 5) dragged = true
  scroll = base - (e.clientX - downX) / DRAG
  vel = clampV(-d / DRAG * (16 / Math.max(now - lastT, 8)), -0.5, 0.5)
  lastX = e.clientX; lastT = now
}
function onUp() { if (!dragging) return; dragging = false; if (!dragged) router.push(LAB_NAV[active.value].href) }
let wlock = false
function onWheel(e: WheelEvent) { const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (Math.abs(d) < 6 || wlock) return; wlock = true; vel = clampV(vel + (d > 0 ? 0.16 : -0.16), -0.5, 0.5); setTimeout(() => (wlock = false), 90) }

onMounted(() => {
  renderer = new Renderer({ canvas: cv.value!, dpr: Math.min(devicePixelRatio, 2), alpha: false })
  gl = renderer.gl
  const geometry = new Geometry(gl, { position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) }, uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) } })
  LAB_NAV.forEach((it) => {
    const tex = new Texture(gl, { generateMipmaps: false })
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = it.img; img.onload = () => (tex.image = img)
    textures.push(tex)
  })
  program = new Program(gl, { vertex, fragment, uniforms: {
    t0: { value: textures[0] }, t1: { value: textures[1] }, prog: { value: 0 }, vel: { value: 0 },
    uTime: { value: 0 }, uPointer: { value: [0.5, 0.5] }, uRes: { value: [innerWidth, innerHeight] } } })
  mesh = new Mesh(gl, { geometry, program })
  const resize = () => { renderer.setSize(innerWidth, innerHeight); program.uniforms.uRes.value = [innerWidth, innerHeight] }
  resize(); addEventListener('resize', resize); addEventListener('wheel', onWheel, { passive: true })
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); removeEventListener('wheel', onWheel) })
</script>

<template>
  <div class="fx">
    <canvas ref="cv" class="fx__cv" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" />
    <NuxtLink to="/lab" class="fx__lab">◂ lab</NuxtLink>
    <div class="fx__idx" aria-hidden="true">{{ String(active + 1).padStart(2, '0') }} / {{ String(N).padStart(2, '0') }}</div>
    <div class="fx__ui">
      <span class="fx__eyebrow">Naveen Jose — Instructional Designer</span>
      <Transition name="fx" mode="out-in">
        <div :key="active" class="fx__cap">
          <h1 class="fx__label">{{ LAB_NAV[active].label }}</h1>
          <p class="fx__desc">{{ LAB_NAV[active].desc }}</p>
        </div>
      </Transition>
      <span class="fx__hint">drag to flux · release to snap · tap to open</span>
    </div>
  </div>
</template>

<style scoped>
.fx { position: fixed; inset: 0; overflow: hidden; background: #0a0a0a; color: #fff; }
.fx__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
.fx__cv:active { cursor: grabbing; }
.fx__lab { position: fixed; top: 16rem; left: 20rem; z-index: 10; color: #fff; text-decoration: none; font-family: 'Space Mono', monospace; font-size: 12rem; opacity: 0.7; mix-blend-mode: difference; }
.fx__idx { position: fixed; top: 18rem; right: 22rem; z-index: 10; font-family: 'Fraunces', serif; font-size: 15rem; opacity: 0.8; mix-blend-mode: difference; }
.fx__ui { position: absolute; left: 0; right: 0; bottom: clamp(48rem, 10vh, 100rem); text-align: center; pointer-events: none; padding: 0 24rem; text-shadow: 0 2rem 30rem rgba(0,0,0,0.6); }
.fx__eyebrow { font-size: 12rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; opacity: 0.8; }
.fx__cap { margin-top: 8rem; }
.fx__label { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(44rem, 7vw, 96rem); line-height: 1; margin: 0; }
.fx__desc { font-size: 15rem; opacity: 0.85; margin: 10rem auto 0; max-width: 42ch; }
.fx__hint { display: inline-block; margin-top: 20rem; font-family: 'Space Mono', monospace; font-size: 11rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; }
.fx-enter-active, .fx-leave-active { transition: opacity 0.35s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.fx-enter-from { opacity: 0; transform: translateY(16rem); }
.fx-leave-to { opacity: 0; transform: translateY(-10rem); }
@media (max-width: 620px) { .fx__hint { display: none; } }
</style>
