<script setup lang="ts">
import { useHomeViewStore } from '~/stores/homeview'
import { HOME_THEMES } from '~/utils/homeThemes'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'The portfolio of Naveen Jose, a certified instructional designer who builds learning experiences that feel human, plus free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Learning experiences that feel human, plus free web apps for L&D teams.',
  ogUrl: 'https://entertrainer.in/'
})

// Electric Cream: the bold-and-playful language applied to the site's existing
// warm-paper identity, so the homepage and the editorial pages still read as
// one place. Swap this index to preview any of the ten directions.
const theme = HOME_THEMES[0]

const homeViewStore = useHomeViewStore()
homeViewStore.setIsHome(true)

// No sub-sections on the home route any more — acknowledge the menu's signals
// so the store never latches.
watch(() => homeViewStore.pendingBack, (p) => { if (p) homeViewStore.ackBack() })
watch(() => homeViewStore.pendingHome, (p) => { if (p) homeViewStore.ackHome() })
</script>

<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open, items }">
    <header class="h-top">
      <span class="h-mark">entertrainer</span>
      <span class="h-role">Instructional design, built by hand</span>
    </header>

    <nav class="h-rail" aria-label="Sections">
      <button v-for="(it, i) in items" :key="it.href" class="h-tick"
              :class="{ on: index % 4 === i }" @click="go(i - (index % 4))"
              :aria-label="it.label" :aria-current="index % 4 === i ? 'true' : undefined">
        <span class="h-tick__n">{{ it.n }}</span>
        <span class="h-tick__bar" />
      </button>
    </nav>

    <footer class="h-foot">
      <Transition name="h" mode="out-in">
        <div :key="active.href" class="h-cap">
          <h1 class="h-title">{{ active.label }}</h1>
          <p class="h-desc">{{ active.desc }}</p>
        </div>
      </Transition>
      <button class="h-cta" @click="open(active.href)">
        Open <span aria-hidden="true">→</span>
      </button>
      <p class="h-hint">drag · scroll · tap a card</p>
    </footer>
  </HomeTower>
</template>

<style scoped>
.h-top { position: fixed; top: 18rem; left: 50%; translate: -50% 0; z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 3rem; pointer-events: none; text-align: center; }
.h-mark { font-family: var(--display); font-weight: 400; font-size: 17rem; letter-spacing: -0.01em; color: var(--ink); }
.h-role { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-35); }

.h-rail { position: fixed; right: clamp(16rem, 3vw, 34rem); top: 50%; translate: 0 -50%; z-index: 20; display: flex; flex-direction: column; gap: 12rem; }
.h-tick { display: flex; align-items: center; gap: 8rem; background: none; border: 0; padding: 2rem; cursor: pointer; color: var(--ink-35); font-family: 'DM Sans', sans-serif; font-size: 10rem; letter-spacing: 0.08em; transition: color 0.25s; }
.h-tick__bar { display: block; width: 16rem; height: 2rem; background: currentColor; transition: width 0.3s cubic-bezier(.19,1,.22,1), background 0.3s; }
.h-tick.on { color: var(--ink); }
.h-tick.on .h-tick__bar { width: 34rem; background: var(--pop); }
.h-tick:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

.h-foot { position: fixed; left: 0; right: 0; bottom: calc(26rem + env(safe-area-inset-bottom)); z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 16rem; padding: 0 24rem; pointer-events: none; }
.h-cap { text-align: center; }
.h-title { font-family: var(--display); font-weight: 400; font-size: clamp(38rem, 6.6vw, 78rem); line-height: 0.98; letter-spacing: -0.03em; margin: 0; color: var(--ink); }
.h-desc { font-family: 'DM Sans', sans-serif; font-size: 14rem; line-height: 1.5; margin: 10rem auto 0; max-width: 40ch; color: var(--ink-60); }
.h-cta { pointer-events: auto; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14rem; color: var(--on-pop); background: var(--pop); border: 0; border-radius: 999rem; padding: 14rem 28rem; cursor: pointer; box-shadow: 0 10rem 30rem -12rem var(--pop); transition: transform 0.22s cubic-bezier(.19,1,.22,1), box-shadow 0.22s; }
.h-cta span { display: inline-block; transition: translate 0.22s cubic-bezier(.19,1,.22,1); }
.h-cta:hover { transform: translateY(-3rem); box-shadow: 0 16rem 36rem -12rem var(--pop); }
.h-cta:hover span { translate: 4rem 0; }
.h-cta:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
.h-hint { font-family: 'DM Sans', sans-serif; font-size: 10rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-35); margin: 0; }

.h-enter-active, .h-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.h-enter-from { opacity: 0; transform: translateY(18rem); }
.h-leave-to { opacity: 0; transform: translateY(-12rem); }

@media (max-width: 640px) {
  .h-rail { display: none; }
  .h-role { display: none; }
  .h-hint { display: none; }
}
</style>
