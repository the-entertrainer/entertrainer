<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'The Deck — Lab', robots: 'noindex' })
const N = LAB_NAV.length
const idx = ref(0)
const dragX = ref(0)
const anim = ref(false)         // true while flying off / springing (enables transition)
let dragging = false, startX = 0, moved = false
const router = useRouter()

function rel(i: number) { return (i - idx.value + N) % N }
function cardStyle(i: number) {
  const r = rel(i)
  if (r === 0) return { transform: `translateX(${dragX.value}rem) rotate(${dragX.value * 0.03}deg)`, zIndex: '50', transition: anim.value ? 'transform 0.4s cubic-bezier(.22,1,.36,1)' : 'none' }
  const clamped = Math.min(r, 3)
  return { transform: `translateY(${clamped * 16}rem) scale(${1 - clamped * 0.05})`, zIndex: String(50 - r), opacity: r > 3 ? '0' : String(1 - clamped * 0.15), transition: 'transform 0.4s ease, opacity 0.4s ease' }
}
function onDown(e: PointerEvent) { if (anim.value) return; dragging = true; moved = false; startX = e.clientX; anim.value = false; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) { if (!dragging) return; dragX.value = e.clientX - startX; if (Math.abs(dragX.value) > 6) moved = true }
function onUp() {
  if (!dragging) return; dragging = false
  if (Math.abs(dragX.value) > 110) {
    anim.value = true; dragX.value = dragX.value > 0 ? 900 : -900
    setTimeout(() => { idx.value = (idx.value + 1) % N; anim.value = false; dragX.value = 0 }, 380)
  } else { anim.value = true; dragX.value = 0; setTimeout(() => (anim.value = false), 400) }
}
function onCard(i: number) { if (moved || anim.value) return; if (rel(i) === 0) router.push(LAB_NAV[i].href) }
function next() { anim.value = true; dragX.value = -900; setTimeout(() => { idx.value = (idx.value + 1) % N; anim.value = false; dragX.value = 0 }, 380) }
</script>

<template>
  <LabFrame n="03" name="The Deck" hint="flick a card">
    <div class="dk">
      <div class="dk__stack" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
        <button v-for="(item, i) in LAB_NAV" :key="item.href" class="dk__card" :style="cardStyle(i)" @click="onCard(i)" :aria-label="item.label">
          <img :src="item.img" :alt="''" />
          <span class="dk__meta">
            <span class="dk__n">{{ item.n }}</span>
            <strong class="dk__label">{{ item.label }}</strong>
            <span class="dk__desc">{{ item.desc }}</span>
          </span>
        </button>
      </div>
      <button class="dk__next" @click="next">next card →</button>
    </div>
  </LabFrame>
</template>

<style scoped>
.dk { position: absolute; inset: 0; display: grid; place-items: center; }
.dk__stack { position: relative; width: min(360rem, 82vw); height: 500rem; touch-action: none; }
.dk__card { position: absolute; inset: 0; margin: auto; width: 100%; height: 100%; padding: 0; border: 0; border-radius: 20rem; overflow: hidden; background: var(--color-bg); box-shadow: 0 50rem 90rem -40rem rgba(0,0,0,0.5), 0 0 0 1px var(--color-glass-border); cursor: grab; text-align: left; will-change: transform; }
.dk__card:active { cursor: grabbing; }
.dk__card img { width: 100%; height: 64%; object-fit: cover; display: block; pointer-events: none; }
.dk__meta { display: block; padding: 20rem 22rem; }
.dk__n { font-family: var(--serif); font-size: 13rem; opacity: 0.5; }
.dk__label { display: block; font-family: var(--serif); font-weight: 400; font-size: 34rem; line-height: 1.05; margin: 2rem 0 6rem; }
.dk__desc { font-size: 13.5rem; opacity: 0.62; line-height: 1.45; }
.dk__next { position: absolute; bottom: calc(40rem + var(--safe-bottom)); left: 50%; translate: -50% 0; background: none; border: 0; color: var(--color-text); opacity: 0.55; font-family: var(--serif); font-style: italic; font-size: 15rem; cursor: pointer; }
.dk__next:hover { opacity: 1; }
</style>
