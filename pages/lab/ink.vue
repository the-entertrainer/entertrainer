<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Fluid Ink Field — Lab', robots: 'noindex' })
const cv = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D, raf = 0, t = 0, W = 0, H = 0
const P: { x: number; y: number }[] = []
const mouse = { x: -999, y: -999, px: -999, py: -999 }
let ink = 'rgba(20,18,16,0.10)', fade = 'rgba(245,239,232,0.06)'

function field(x: number, y: number) {
  return (Math.sin(x * 0.0032 + t * 0.4) + Math.cos(y * 0.0036 - t * 0.3) + Math.sin((x + y) * 0.0025 + t * 0.2)) * 1.7
}
function resize() {
  const dpr = Math.min(devicePixelRatio, 2); W = innerWidth; H = innerHeight
  cv.value!.width = W * dpr; cv.value!.height = H * dpr; cv.value!.style.width = W + 'px'; cv.value!.style.height = H + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const cs = getComputedStyle(document.documentElement)
  const text = cs.getPropertyValue('--color-text').trim() || '#141210'
  const bg = cs.getPropertyValue('--color-bg').trim() || '#f5efe8'
  ink = hexA(text, 0.09); fade = hexA(bg, 0.055)
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
}
function hexA(hex: string, a: number) { const h = hex.replace('#', ''); const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h; const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16); return `rgba(${r||20},${g||18},${b||16},${a})` }
function tick() {
  t += 0.016
  ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = ink; ctx.lineWidth = 1.1
  ctx.beginPath()
  for (const p of P) {
    const a = field(p.x, p.y)
    let vx = Math.cos(a) * 1.6, vy = Math.sin(a) * 1.6
    const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy)
    if (d < 170) { const f = (1 - d / 170) * 5; vx += (dx / d) * f + (mouse.x - mouse.px) * 0.06; vy += (dy / d) * f + (mouse.y - mouse.py) * 0.06 }
    const nx = p.x + vx, ny = p.y + vy
    ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny)
    p.x = nx; p.y = ny
    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || Math.random() < 0.002) { p.x = Math.random() * W; p.y = Math.random() * H }
  }
  ctx.stroke()
  mouse.px = mouse.x; mouse.py = mouse.y
  raf = requestAnimationFrame(tick)
}
function onMove(e: PointerEvent) { mouse.x = e.clientX; mouse.y = e.clientY }
onMounted(() => {
  ctx = cv.value!.getContext('2d')!
  resize()
  for (let i = 0; i < (innerWidth < 720 ? 700 : 1300); i++) P.push({ x: Math.random() * W, y: Math.random() * H })
  raf = requestAnimationFrame(tick); addEventListener('resize', resize)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); removeEventListener('resize', resize) })
</script>

<template>
  <LabFrame n="04" name="Fluid Ink Field" hint="stir the ink">
    <div class="ik" @pointermove="onMove">
      <canvas ref="cv" class="ik__cv" />
      <div class="ik__ui">
        <span class="ik__eyebrow">Naveen Jose</span>
        <ul class="ik__list">
          <li v-for="item in LAB_NAV" :key="item.href">
            <NuxtLink :to="item.href" class="ik__link"><span class="ik__n">{{ item.n }}</span>{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.ik { position: absolute; inset: 0; overflow: hidden; }
.ik__cv { position: absolute; inset: 0; }
.ik__ui { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 clamp(24rem, 8vw, 120rem); pointer-events: none; }
.ik__eyebrow { font-size: 12rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; opacity: 0.5; margin-bottom: 10rem; }
.ik__list { list-style: none; margin: 0; padding: 0; }
.ik__link { pointer-events: auto; display: inline-block; font-family: var(--serif); font-weight: 400; font-size: clamp(38rem, 7vw, 92rem); line-height: 1.06; letter-spacing: -0.02em; color: var(--color-text); text-decoration: none; mix-blend-mode: difference; }
.ik__link:hover { font-style: italic; }
.ik__link:focus-visible { outline: 2px solid var(--color-text); outline-offset: 4rem; }
.ik__n { font-size: 0.24em; opacity: 0.6; margin-right: 12rem; vertical-align: super; }
</style>
