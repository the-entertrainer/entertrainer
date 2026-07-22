<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Smooth Dolly — Lab', robots: 'noindex' })
const N = LAB_NAV.length
const scroller = ref<HTMLElement | null>(null)
const prog = ref(0)
let target = 0, raf = 0
function onScroll() { const el = scroller.value; if (!el) return; const max = el.scrollHeight - el.clientHeight; target = max > 0 ? el.scrollTop / max : 0 }
function tick() { prog.value += (target - prog.value) * 0.09; raf = requestAnimationFrame(tick) }   // smoothed (Lenis-like)
function sceneStyle(i: number) {
  const f = prog.value * (N - 1)
  const d = i - f
  const z = -d * 620
  const blur = Math.min(Math.abs(d), 2.2) * 4
  let op = 1
  if (d > 0) op = Math.max(0, 1 - (d - 0.1) / 1.5)
  else op = Math.max(0, 1 + d / 0.7)
  return { transform: `translate(-50%,-50%) translateZ(${z}rem)`, opacity: String(op), filter: `blur(${blur}rem)`, pointerEvents: Math.abs(d) < 0.4 ? 'auto' : 'none' as any, zIndex: String(100 - Math.round(Math.abs(d) * 10)) }
}
onMounted(() => { scroller.value?.addEventListener('scroll', onScroll, { passive: true }); raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => { scroller.value?.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) })
</script>

<template>
  <LabFrame n="07" name="Smooth Dolly" hint="scroll to glide">
    <div ref="scroller" class="dl">
      <div class="dl__spacer" :style="{ height: (N * 120) + 'vh' }" />
      <div class="dl__stage">
        <NuxtLink v-for="(item, i) in LAB_NAV" :key="item.href" :to="item.href" class="dl__scene" :style="sceneStyle(i)">
          <div class="dl__img"><img :src="item.img" :alt="''" /></div>
          <div class="dl__meta">
            <span class="dl__n">{{ item.n }}</span>
            <h1 class="dl__label">{{ item.label }}</h1>
            <p class="dl__desc">{{ item.desc }}</p>
          </div>
        </NuxtLink>
      </div>
      <div class="dl__prog" aria-hidden="true"><span :style="{ transform: `scaleX(${prog})` }" /></div>
    </div>
  </LabFrame>
</template>

<style scoped>
.dl { position: absolute; inset: 0; overflow-y: auto; }
.dl__spacer { width: 1px; }
.dl__stage { position: fixed; inset: 0; perspective: 1200rem; pointer-events: none; }
.dl__scene { position: absolute; left: 50%; top: 50%; width: min(880rem, 88vw); display: grid; grid-template-columns: 1.1fr 0.9fr; gap: clamp(20rem, 3vw, 50rem); align-items: center; text-decoration: none; color: var(--color-text); will-change: transform, opacity, filter; }
.dl__img { border-radius: 16rem; overflow: hidden; aspect-ratio: 4/3; box-shadow: 0 50rem 100rem -50rem rgba(0,0,0,0.6); }
.dl__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dl__n { font-family: var(--serif); font-size: 15rem; opacity: 0.5; }
.dl__label { font-family: var(--serif); font-weight: 400; font-size: clamp(38rem, 5.5vw, 78rem); line-height: 1; margin: 6rem 0 0; letter-spacing: -0.02em; }
.dl__desc { margin: 14rem 0 0; font-size: 15rem; line-height: 1.55; opacity: 0.75; max-width: 34ch; }
.dl__prog { position: fixed; left: 0; right: 0; bottom: 0; height: 3rem; background: color-mix(in srgb, var(--color-text) 8%, transparent); }
.dl__prog span { display: block; height: 100%; background: var(--color-text); opacity: 0.8; transform-origin: left; transform: scaleX(0); }
@media (max-width: 720px) { .dl__scene { grid-template-columns: 1fr; text-align: center; gap: 20rem; } .dl__desc { margin-inline: auto; } }
</style>
