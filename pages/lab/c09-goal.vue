<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '09 Momentum', robots: 'noindex' })
const C = CONCEPTS[8]

/**
 * Goal-Gradient Effect (Hull; Kivetz et al.): effort accelerates as the goal
 * gets nearer, and an *endowed* head start accelerates it further — the classic
 * finding is that a 12-stamp card with 2 stamps pre-filled beats an empty
 * 10-stamp card, despite identical work remaining.
 *
 * So the page starts you at 1 of 5, not 0. Each section visited advances the
 * bar, and the bar's own animation gets quicker as it fills — the visual
 * gradient matching the motivational one. Completion is the metric that matters
 * in e-learning, which is exactly the pitch.
 */
const TOTAL = 5
const visited = ref<Set<string>>(new Set(['__head_start__']))   // endowed progress
const done = computed(() => visited.value.size)
const pct = computed(() => (done.value / TOTAL) * 100)
/** Duration shortens as the goal nears: 520ms → 190ms. */
const dur = computed(() => Math.round(520 - (done.value / TOTAL) * 330))

function mark(href: string) {
  const next = new Set(visited.value); next.add(href); visited.value = next
}
</script>

<template>
  <LabShell bg="#0D1B12" ink="#E8F5EC" pop="#43E37A" display="'Space Grotesk','DM Sans',sans-serif" :law="C.law">
    <div class="m">
      <header class="m__head">
        <h1 class="m__h1">Completion is the<br>only metric that matters.</h1>
        <p class="m__sub">You've been given a head start — one of five, for free. Research says that alone makes you likelier to finish than starting from zero.</p>
      </header>

      <div class="m__meter" role="progressbar" :aria-valuenow="done" aria-valuemin="0" :aria-valuemax="TOTAL"
           aria-label="Sections explored">
        <div class="m__track">
          <div class="m__fill" :style="{ width: pct + '%', transitionDuration: dur + 'ms' }" />
          <span v-for="i in TOTAL" :key="i" class="m__notch" :style="{ left: (i / TOTAL) * 100 + '%' }" />
        </div>
        <p class="m__count"><b>{{ done }}</b> / {{ TOTAL }} <span>· bar speed now {{ dur }}ms</span></p>
      </div>

      <nav class="m__nav">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="m__item"
                  :class="{ got: visited.has(it.href) }"
                  @pointerenter="mark(it.href)" @focus="mark(it.href)">
          <span class="m__tick" aria-hidden="true">{{ visited.has(it.href) ? '✓' : '' }}</span>
          <span class="m__l">{{ it.label }}</span>
          <span class="m__d">{{ it.desc }}</span>
        </NuxtLink>
      </nav>

      <p class="m__foot" v-if="done >= TOTAL">That's the lot. The gradient did its job.</p>
      <p class="m__foot" v-else>{{ TOTAL - done }} to go — and each one gets easier.</p>
    </div>
  </LabShell>
</template>

<style scoped>
.m { position: absolute; inset: 0; overflow-y: auto; padding: 62rem clamp(18rem, 4vw, 56rem) 78rem; display: grid; align-content: center; gap: 26rem; }
.m__head { max-width: 50ch; }
.m__h1 { margin: 0; font-size: clamp(28rem, 4.6vw, 50rem); line-height: 1.06; letter-spacing: -0.03em; font-weight: 600; }
.m__sub { margin: 12rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.6; color: var(--ink-70); }

.m__meter { max-width: 760rem; }
.m__track { position: relative; height: 14rem; border-radius: 999rem; background: rgba(232,245,236,0.10); overflow: hidden; }
.m__fill { height: 100%; border-radius: 999rem; background: linear-gradient(90deg, rgba(67,227,122,0.55), var(--pop));
  transition-property: width; transition-timing-function: cubic-bezier(.2,.8,.2,1); }
.m__notch { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(13,27,18,0.55); translate: -1px 0; }
.m__count { margin: 10rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 12rem; color: var(--ink-45); }
.m__count b { color: var(--pop); font-size: 16rem; font-variant-numeric: tabular-nums; }
.m__count span { opacity: 0.7; }

.m__nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(216rem, 1fr)); gap: 8rem; max-width: 900rem; }
.m__item { position: relative; display: grid; gap: 4rem; padding: 16rem 16rem 16rem 40rem; border: 1px solid var(--ink-15); border-radius: 12rem; text-decoration: none; color: var(--ink);
  transition: border-color 200ms ease, background 200ms ease; }
.m__item.got { border-color: var(--pop); background: rgba(67,227,122,0.07); }
.m__item:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }
.m__tick { position: absolute; left: 14rem; top: 17rem; width: 16rem; height: 16rem; border-radius: 50%; border: 1px solid var(--ink-15); display: grid; place-content: center; font-size: 9rem; color: #08150D; }
.m__item.got .m__tick { background: var(--pop); border-color: var(--pop); }
.m__l { font-size: 17rem; font-weight: 600; }
.m__d { font-family: 'DM Sans', sans-serif; font-size: 11.5rem; line-height: 1.45; color: var(--ink-45); }

.m__foot { margin: 0; font-family: 'DM Sans', sans-serif; font-size: 12rem; color: var(--pop); }

@media (prefers-reduced-motion: reduce) { .m__fill, .m__item { transition: none; } }
</style>
