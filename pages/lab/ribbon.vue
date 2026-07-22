<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Bent Ribbon — Lab', robots: 'noindex' })
const N = LAB_NAV.length
const STEP = 360 / N
const R = 420
const angle = ref(0)
const tiltX = ref(0), tiltXt = ref(0)
let vel = 0, raf = 0, dragging = false, lastX = 0, lastT = 0
const router = useRouter()
const active = computed(() => ((Math.round(-angle.value / STEP) % N) + N) % N)

function tick() {
  if (!dragging) { const target = Math.round(angle.value / STEP) * STEP; vel += (target - angle.value) * 0.01; vel *= 0.88; angle.value += vel }
  tiltX.value += (tiltXt.value - tiltX.value) * 0.08
  raf = requestAnimationFrame(tick)
}
function onDown(e: PointerEvent) { dragging = true; lastX = e.clientX; lastT = performance.now(); vel = 0; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) { tiltXt.value = (0.5 - e.clientY / innerHeight) * 12; if (!dragging) return; const now = performance.now(); const dx = e.clientX - lastX; angle.value += dx * 0.28; vel = dx * 0.28 * (16 / Math.max(now - lastT, 8)); lastX = e.clientX; lastT = now }
function onUp() { dragging = false }
function cardStyle(i: number) { return { transform: `rotateY(${i * STEP}deg) translateZ(${R}rem)` } }
function go(i: number) { if (i === active.value) router.push(LAB_NAV[i].href) }
onMounted(() => { raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <LabFrame n="06" name="Bent Ribbon" hint="drag to bend">
    <div class="rb" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
      <div class="rb__stage" :style="{ transform: `rotateX(${tiltX}deg) rotateY(${angle}deg)` }">
        <button v-for="(item, i) in LAB_NAV" :key="item.href" class="rb__card" :class="{ on: i === active }" :style="cardStyle(i)" @click="go(i)" :aria-label="item.label">
          <img :src="item.img" :alt="''" draggable="false" />
          <span class="rb__cap"><span class="rb__n">{{ item.n }}</span>{{ item.label }}</span>
        </button>
      </div>
      <p class="rb__desc"><Transition name="rb" mode="out-in"><span :key="active">{{ LAB_NAV[active].desc }} · tap to open</span></Transition></p>
    </div>
  </LabFrame>
</template>

<style scoped>
.rb { position: absolute; inset: 0; perspective: 1400rem; overflow: hidden; touch-action: none; cursor: grab; display: grid; place-items: center; }
.rb:active { cursor: grabbing; }
.rb__stage { position: relative; width: 320rem; height: 420rem; transform-style: preserve-3d; will-change: transform; }
.rb__card { position: absolute; inset: 0; padding: 0; border: 0; border-radius: 18rem; overflow: hidden; background: var(--color-glass-bg); box-shadow: 0 40rem 90rem -40rem rgba(0,0,0,0.6), 0 0 0 1px var(--color-glass-border); cursor: pointer; backface-visibility: hidden; opacity: 0.55; transition: opacity 0.4s ease; }
.rb__card.on { opacity: 1; }
.rb__card img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.rb__cap { position: absolute; left: 16rem; bottom: 16rem; right: 16rem; color: #fff; font-family: var(--serif); font-size: 26rem; text-shadow: 0 2rem 20rem rgba(0,0,0,0.6); text-align: left; }
.rb__n { font-size: 13rem; opacity: 0.8; margin-right: 8rem; }
.rb__desc { position: absolute; bottom: clamp(40rem, 9vh, 90rem); left: 50%; translate: -50% 0; font-size: 14rem; opacity: 0.6; text-align: center; padding: 0 24rem; }
.rb-enter-active, .rb-leave-active { transition: opacity 0.3s ease; } .rb-enter-from, .rb-leave-to { opacity: 0; }
</style>
