<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Portal Morph — Lab', robots: 'noindex' })
const router = useRouter()
const active = ref(0)
const d = ref('')
const diving = ref(false)
let raf = 0, t = 0, amp = 26, ampT = 26
const mouse = { x: 0.5, y: 0.5 }

function build() {
  const K = 9, R = 210
  const pts: [number, number][] = []
  const rot = (mouse.x - 0.5) * 1.2
  for (let i = 0; i < K; i++) {
    const a = (i / K) * Math.PI * 2 + rot
    const r = R + Math.sin(a * 3 + t) * amp + Math.cos(a * 2 - t * 0.7) * amp * 0.7
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  let s = ''
  for (let i = 0; i < K; i++) {
    const cur = pts[i], next = pts[(i + 1) % K]
    const mx = (cur[0] + next[0]) / 2, my = (cur[1] + next[1]) / 2
    s += i === 0 ? `M ${mx.toFixed(1)} ${my.toFixed(1)}` : ` Q ${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
  }
  const first = pts[0], last = pts[K - 1]
  s += ` Q ${last[0].toFixed(1)} ${last[1].toFixed(1)} ${((last[0] + first[0]) / 2).toFixed(1)} ${((last[1] + first[1]) / 2).toFixed(1)} Z`
  d.value = s
}
function tick() { t += 0.016; amp += (ampT - amp) * 0.06; build(); raf = requestAnimationFrame(tick) }
function onMove(e: PointerEvent) { mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight; ampT = 26 + Math.abs(mouse.x - 0.5) * 40 }
function dive() { if (diving.value) return; diving.value = true; ampT = 4; setTimeout(() => router.push(LAB_NAV[active.value].href), 620) }
onMounted(() => { build(); raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <LabFrame n="09" name="Portal Morph" hint="pick a door · dive in">
    <div class="pt" @pointermove="onMove">
      <div class="pt__blob" :class="{ dive: diving }">
        <svg viewBox="-320 -320 640 640" preserveAspectRatio="xMidYMid slice">
          <defs><clipPath id="blob"><path :d="d" /></clipPath></defs>
          <g clip-path="url(#blob)">
            <image v-for="(item, i) in LAB_NAV" :key="i" :href="item.img" x="-320" y="-320" width="640" height="640" preserveAspectRatio="xMidYMid slice" :style="{ opacity: active === i ? 1 : 0 }" />
            <rect x="-320" y="-320" width="640" height="640" fill="rgba(0,0,0,0.18)" />
          </g>
          <path :d="d" fill="none" stroke="var(--color-bg)" stroke-width="3" opacity="0.5" />
        </svg>
        <button class="pt__enter" @click="dive">Enter {{ LAB_NAV[active].label }} →</button>
      </div>
      <div class="pt__doors">
        <button v-for="(item, i) in LAB_NAV" :key="item.href" class="pt__door" :class="{ on: active === i }" @pointerenter="active = i" @click="active = i">
          <span class="pt__n">{{ item.n }}</span>{{ item.label }}
        </button>
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.pt { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.pt__blob { position: relative; width: min(70vh, 70vw); aspect-ratio: 1; transition: transform 0.6s cubic-bezier(.6,0,.4,1), opacity 0.6s ease; }
.pt__blob.dive { transform: scale(6); opacity: 0; }
.pt__blob svg { width: 100%; height: 100%; overflow: visible; }
.pt__blob image { transition: opacity 0.5s ease; }
.pt__enter { position: absolute; left: 50%; top: 50%; translate: -50% -50%; background: var(--color-bg); color: var(--color-text); border: 0; border-radius: 999rem; padding: 12rem 22rem; font-family: var(--serif); font-size: 18rem; cursor: pointer; box-shadow: 0 20rem 50rem -20rem rgba(0,0,0,0.5); }
.pt__doors { position: absolute; bottom: calc(46rem + var(--safe-bottom)); left: 50%; translate: -50% 0; display: flex; flex-wrap: wrap; gap: 8rem 22rem; justify-content: center; padding: 0 20rem; }
.pt__door { background: none; border: 0; color: var(--color-text); opacity: 0.4; font-family: var(--serif); font-size: clamp(16rem, 2vw, 22rem); cursor: pointer; transition: opacity 0.25s ease; }
.pt__door.on { opacity: 1; text-decoration: underline; text-underline-offset: 5rem; }
.pt__n { font-size: 0.6em; opacity: 0.6; margin-right: 5rem; }
</style>
