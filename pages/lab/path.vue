<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'The Path — Lab', robots: 'noindex' })
const R = useReveal()
const scroller = ref<HTMLElement | null>(null)
const progress = ref(0)
function onScroll() { const el = scroller.value; if (!el) return; const max = el.scrollHeight - el.clientHeight; progress.value = max > 0 ? el.scrollTop / max : 0 }
onMounted(() => scroller.value?.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => scroller.value?.removeEventListener('scroll', onScroll))
</script>

<template>
  <LabFrame n="10" name="The Path" hint="scroll to travel">
    <div ref="scroller" class="pth">
      <section class="pth__hero">
        <span class="pth__eyebrow">Naveen Jose</span>
        <h1 class="pth__htitle">A path worth<br>walking</h1>
        <span class="pth__cue">↓ follow the line</span>
      </section>

      <div class="pth__track">
        <div class="pth__line" aria-hidden="true"><span class="pth__fill" :style="{ transform: `scaleY(${progress})` }" /></div>
        <NuxtLink
          v-for="(item, i) in LAB_NAV" :key="item.href" :to="item.href"
          class="pth__station" :class="{ right: i % 2 === 1 }"
          v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce"
        >
          <span class="pth__node" aria-hidden="true" />
          <div class="pth__card">
            <div class="pth__img"><img :src="item.img" :alt="''" /></div>
            <span class="pth__n">{{ item.n }}</span>
            <strong class="pth__label">{{ item.label }}</strong>
            <span class="pth__desc">{{ item.desc }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.pth { position: absolute; inset: 0; overflow-y: auto; }
.pth__hero { min-height: 92vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 0 24rem; }
.pth__eyebrow { font-size: 12rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; opacity: 0.5; }
.pth__htitle { font-family: var(--serif); font-weight: 400; font-size: clamp(44rem, 9vw, 116rem); line-height: 0.95; margin: 14rem 0 0; letter-spacing: -0.02em; }
.pth__cue { margin-top: 26rem; font-family: var(--serif); font-style: italic; font-size: 16rem; opacity: 0.55; }
.pth__track { position: relative; max-width: 900rem; margin: 0 auto; padding: 6vh 24rem 20vh; }
.pth__line { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; translate: -50% 0; background: var(--color-glass-border); }
.pth__fill { position: absolute; inset: 0; background: var(--color-text); transform-origin: top; transform: scaleY(0); }
.pth__station { position: relative; display: block; width: 46%; margin: 0 0 12vh auto; text-decoration: none; color: var(--color-text); }
.pth__station.right { margin: 0 auto 12vh 0; }
.pth__node { position: absolute; top: 34rem; width: 14rem; height: 14rem; border-radius: 50%; background: var(--color-bg); border: 2px solid var(--color-text); }
.pth__station:not(.right) .pth__node { left: -13%; }
.pth__station.right .pth__node { right: -13%; }
.pth__card { border: 1px solid var(--color-glass-border); border-radius: 16rem; overflow: hidden; background: var(--color-glass-bg); transition: transform 0.3s var(--ease-spring); }
@media (hover: hover) { .pth__station:hover .pth__card { transform: translateY(-5rem); } }
.pth__station:focus-visible { outline: 2px solid var(--color-text); outline-offset: 4px; border-radius: 16rem; }
.pth__img { width: 100%; aspect-ratio: 16 / 10; overflow: hidden; }
.pth__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pth__n { display: inline-block; margin: 14rem 0 0 18rem; font-family: var(--serif); font-size: 13rem; opacity: 0.5; }
.pth__label { display: block; font-family: var(--serif); font-weight: 400; font-size: 30rem; margin: 2rem 0 6rem; padding: 0 18rem; }
.pth__desc { display: block; font-size: 13.5rem; opacity: 0.62; line-height: 1.45; padding: 0 18rem 20rem; }
@media (max-width: 720px) {
  .pth__station, .pth__station.right { width: 82%; margin-left: auto; margin-right: 0; }
  .pth__line { left: 9%; }
  .pth__station .pth__node, .pth__station.right .pth__node { left: -9%; right: auto; }
}
</style>
