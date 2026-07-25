<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '13 Timing Is Teaching', robots: 'noindex' })
const C = CONCEPTS[12]

/**
 * The evidence on UI motion is unusually specific: under ~100 ms reads as
 * instantaneous (the motion is wasted), 200–500 ms is the band where a
 * transition is legible as intent, and beyond ~1 s it reads as the system
 * being slow. Material's guidance adds that duration should scale with the
 * distance travelled.
 *
 * So rather than assert a house speed, the page runs the *same* transition at
 * four durations at once and lets you feel the difference. Pacing is a teaching
 * decision — which is exactly the pitch for an instructional designer.
 */
const SPEEDS = [
  { ms: 80,   verdict: 'Below perception. The motion may as well not exist.' },
  { ms: 200,  verdict: 'Crisp. Reads as cause and effect.' },
  { ms: 400,  verdict: 'Deliberate. You notice the intent.' },
  { ms: 1000, verdict: 'Reads as lag, not grace.' }
]
const flipped = ref(false)
const ease = 'cubic-bezier(.2,.8,.2,1)'   // ease-out: fast in, settle — for entrances
</script>

<template>
  <LabShell bg="#F4F4F2" ink="#121212" pop="#7A4DFF" display="'Space Grotesk','DM Sans',sans-serif" :law="C.law">
    <div class="ti">
      <header class="ti__head">
        <h1 class="ti__h1">Pacing is a teaching decision.</h1>
        <p class="ti__sub">The same move, four durations, played together. Press once and watch which one you actually believe.</p>
        <button class="ti__go" @click="flipped = !flipped">{{ flipped ? 'Send them back' : 'Run all four' }}</button>
      </header>

      <div class="ti__rows">
        <section v-for="(s, i) in SPEEDS" :key="s.ms" class="ti__row">
          <div class="ti__meta">
            <b>{{ s.ms }}ms</b>
            <span :class="{ band: s.ms >= 200 && s.ms <= 500 }">{{ s.ms >= 200 && s.ms <= 500 ? 'in band' : 'outside' }}</span>
          </div>
          <div class="ti__track">
            <NuxtLink :to="LAB_NAV[i].href" class="ti__chip"
                      :style="{ transitionDuration: s.ms + 'ms', transitionTimingFunction: ease, transform: flipped ? 'translateX(calc(100% - 100%))' : 'none', left: flipped ? 'calc(100% - 148rem)' : '0' }">
              {{ LAB_NAV[i].label }}
            </NuxtLink>
          </div>
          <p class="ti__verdict">{{ s.verdict }}</p>
        </section>
      </div>

      <p class="ti__note">
        Entrances use ease-out — quick away, gentle arrival. Exits invert it. Duration should also grow with the
        distance travelled, which is why a full-screen transition can afford 400 ms and a toggle cannot.
      </p>
    </div>
  </LabShell>
</template>

<style scoped>
.ti { position: absolute; inset: 0; overflow-y: auto; padding: 60rem clamp(18rem, 4vw, 56rem) 76rem; display: grid; align-content: center; gap: 22rem; }
.ti__head { max-width: 56ch; }
.ti__h1 { margin: 0; font-size: clamp(28rem, 4.6vw, 50rem); line-height: 1.04; letter-spacing: -0.03em; font-weight: 600; }
.ti__sub { margin: 12rem 0 16rem; font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.55; color: var(--ink-70); }
.ti__go { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12.5rem; color: #fff; background: var(--pop); border: 0; border-radius: 999rem; padding: 12rem 24rem; cursor: pointer; }
.ti__go:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.ti__rows { display: grid; gap: 10rem; max-width: 920rem; }
.ti__row { display: grid; grid-template-columns: 92rem 1fr; grid-template-areas: 'm t' '. v'; align-items: center; gap: 6rem 14rem; }
.ti__meta { grid-area: m; display: grid; gap: 1rem; font-family: 'DM Sans', sans-serif; }
.ti__meta b { font-size: 16rem; font-variant-numeric: tabular-nums; }
.ti__meta span { font-size: 9.5rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-45); }
.ti__meta span.band { color: var(--pop); }

.ti__track { grid-area: t; position: relative; height: 46rem; border-radius: 10rem; background: rgba(18,18,18,0.05); border: 1px solid var(--ink-15); }
.ti__chip { position: absolute; top: 5rem; width: 148rem; height: 34rem; display: grid; place-content: center; border-radius: 7rem; background: var(--pop); color: #fff; text-decoration: none; font-size: 12.5rem; font-weight: 600; white-space: nowrap; transition-property: left; }
.ti__chip:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
.ti__verdict { grid-area: v; margin: 0; font-family: 'DM Sans', sans-serif; font-size: 11.5rem; color: var(--ink-45); }

.ti__note { margin: 0; max-width: 74ch; font-family: 'DM Sans', sans-serif; font-size: 11.5rem; line-height: 1.6; color: var(--ink-45); }

@media (prefers-reduced-motion: reduce) { .ti__chip { transition-duration: 1ms !important; } }
@media (max-width: 620px) { .ti__row { grid-template-columns: 74rem 1fr; } .ti__chip { width: 112rem; font-size: 11rem; } }
</style>
