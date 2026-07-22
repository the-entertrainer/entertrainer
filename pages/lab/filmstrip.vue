<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'The Filmstrip — Lab', robots: 'noindex' })
const strip = ref<HTMLElement | null>(null)
let dragging = false, startX = 0, startLeft = 0, moved = false
function onDown(e: PointerEvent) { if (!strip.value) return; dragging = true; moved = false; startX = e.clientX; startLeft = strip.value.scrollLeft }
function onMove(e: PointerEvent) { if (!dragging || !strip.value) return; const dx = e.clientX - startX; if (Math.abs(dx) > 5) moved = true; strip.value.scrollLeft = startLeft - dx }
function onUp() { dragging = false }
function onWheel(e: WheelEvent) { if (!strip.value) return; const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX; strip.value.scrollLeft += d; if (Math.abs(d) > 0) e.preventDefault() }
function guard(e: MouseEvent) { if (moved) { e.preventDefault(); moved = false } }
onMounted(() => strip.value?.addEventListener('wheel', onWheel, { passive: false }))
onBeforeUnmount(() => strip.value?.removeEventListener('wheel', onWheel))
</script>

<template>
  <LabFrame n="06" name="The Filmstrip" hint="drag sideways">
    <div class="fs">
      <div class="fs__head">
        <span class="fs__eyebrow">Naveen Jose</span>
        <h1 class="fs__title">Have a look around</h1>
      </div>
      <div ref="strip" class="fs__rail" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
        <NuxtLink v-for="item in LAB_NAV" :key="item.href" :to="item.href" class="fs__card" @click="guard">
          <div class="fs__img"><img :src="item.img" :alt="''" draggable="false" /></div>
          <div class="fs__meta">
            <span class="fs__n">{{ item.n }}</span>
            <strong class="fs__label">{{ item.label }}</strong>
            <span class="fs__desc">{{ item.desc }}</span>
          </div>
        </NuxtLink>
        <div class="fs__end" aria-hidden="true" />
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.fs { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; }
.fs__head { padding: 0 clamp(24rem, 6vw, 80rem) 28rem; }
.fs__eyebrow { font-size: 12rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; opacity: 0.5; }
.fs__title { font-family: var(--serif); font-weight: 400; font-size: clamp(34rem, 5vw, 60rem); margin: 8rem 0 0; letter-spacing: -0.015em; }
.fs__rail { display: flex; gap: 20rem; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; padding: 10rem clamp(24rem, 6vw, 80rem); cursor: grab; scrollbar-width: none; touch-action: pan-x; }
.fs__rail::-webkit-scrollbar { display: none; }
.fs__rail:active { cursor: grabbing; }
.fs__card { flex: 0 0 auto; width: min(380rem, 80vw); scroll-snap-align: center; text-decoration: none; color: var(--color-text); border-radius: 18rem; overflow: hidden; border: 1px solid var(--color-glass-border); background: var(--color-glass-bg); transition: transform 0.3s var(--ease-spring); }
@media (hover: hover) { .fs__card:hover { transform: translateY(-6rem); } }
.fs__img { width: 100%; aspect-ratio: 4 / 3; overflow: hidden; }
.fs__img img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.fs__meta { padding: 18rem 20rem 24rem; }
.fs__n { font-family: var(--serif); font-size: 13rem; opacity: 0.5; }
.fs__label { display: block; font-family: var(--serif); font-weight: 400; font-size: 30rem; margin: 2rem 0 6rem; }
.fs__desc { font-size: 13.5rem; opacity: 0.6; line-height: 1.45; }
.fs__end { flex: 0 0 clamp(24rem, 6vw, 80rem); }
</style>
