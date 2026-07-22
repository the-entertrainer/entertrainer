<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Morphing Type — Lab', robots: 'noindex' })
// Load Fraunces with the full weight + SOFT + WONK axes for a dramatic morph.
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,100..900,0..100,0..1&display=swap' }] })

const N = LAB_NAV.length
const idx = ref(0)
const word = ref<HTMLElement | null>(null)
const router = useRouter()
let raf = 0, wght = 400, soft = 0, wonk = 0
const tw = { wght: 400, soft: 40, wonk: 0 }
let transitioning = false

function apply() {
  wght += (tw.wght - wght) * 0.1; soft += (tw.soft - soft) * 0.1; wonk += (tw.wonk - wonk) * 0.1
  if (word.value) word.value.style.fontVariationSettings = `"opsz" 144, "wght" ${wght.toFixed(0)}, "SOFT" ${soft.toFixed(0)}, "WONK" ${wonk.toFixed(2)}`
  raf = requestAnimationFrame(apply)
}
function onMove(e: PointerEvent) {
  const x = e.clientX / innerWidth, y = e.clientY / innerHeight
  tw.wght = 200 + y * 640
  tw.soft = x * 100
  tw.wonk = x > 0.5 ? 1 : 0
}
function advance(dir = 1) {
  if (transitioning || !word.value) return
  transitioning = true
  const el = word.value
  el.animate([{ opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }, { opacity: 0, filter: 'blur(24px)', transform: `scale(${dir > 0 ? 1.15 : 0.9})` }], { duration: 340, easing: 'cubic-bezier(.5,0,.75,0)' }).onfinish = () => {
    idx.value = (idx.value + dir + N) % N
    el.animate([{ opacity: 0, filter: 'blur(24px)', transform: `scale(${dir > 0 ? 0.9 : 1.15})` }, { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }], { duration: 480, easing: 'cubic-bezier(.19,1,.22,1)' }).onfinish = () => { transitioning = false }
  }
}
let lock = false
function onWheel(e: WheelEvent) { if (lock) return; lock = true; advance(e.deltaY > 0 ? 1 : -1); setTimeout(() => (lock = false), 500) }
function onKey(e: KeyboardEvent) { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') advance(1); else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') advance(-1); else if (e.key === 'Enter') router.push(LAB_NAV[idx.value].href) }
onMounted(() => { raf = requestAnimationFrame(apply); addEventListener('wheel', onWheel, { passive: true }); addEventListener('keydown', onKey) })
onBeforeUnmount(() => { cancelAnimationFrame(raf); removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey) })
</script>

<template>
  <LabFrame n="05" name="Morphing Type" hint="move & scroll">
    <div class="ty" @pointermove="onMove" @click="router.push(LAB_NAV[idx].href)">
      <span class="ty__eyebrow">Naveen Jose — {{ LAB_NAV[idx].n }}</span>
      <h1 ref="word" class="ty__word">{{ LAB_NAV[idx].label }}</h1>
      <span class="ty__desc">{{ LAB_NAV[idx].desc }} · click to enter</span>
    </div>
  </LabFrame>
</template>

<style scoped>
.ty { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; overflow: hidden; padding: 0 24rem; }
.ty__eyebrow { font-size: 12rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; opacity: 0.5; }
.ty__word { font-family: 'Fraunces', Georgia, serif; font-weight: 400; font-size: clamp(64rem, 16vw, 260rem); line-height: 0.9; margin: 14rem 0; letter-spacing: -0.02em; will-change: font-variation-settings, transform, filter; }
.ty__desc { font-family: var(--serif); font-style: italic; font-size: 15rem; opacity: 0.55; }
</style>
