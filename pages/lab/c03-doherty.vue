<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '03 Under 400', robots: 'noindex' })
const C = CONCEPTS[2]

/**
 * Doherty Threshold: below ~400 ms of system response, attention holds and
 * throughput climbs; above it, people disengage. This page instruments itself
 * against that number — every hover measures the time from the input event to
 * the frame that paints the result, using rAF as the paint proxy, and plots it
 * against the 400 ms ceiling. The pitch is that speed is legible as craft.
 */
const active = ref(0)
const samples = ref<number[]>([])
const last = ref(0)

function hit(i: number) {
  const t0 = performance.now()
  active.value = i
  // The frame after a state change is the first one that can show it.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const dt = performance.now() - t0
    last.value = dt
    samples.value = [...samples.value.slice(-39), dt]
  }))
}

const avg = computed(() => samples.value.length
  ? samples.value.reduce((a, b) => a + b, 0) / samples.value.length : 0)
const worst = computed(() => samples.value.length ? Math.max(...samples.value) : 0)
const budget = 400
// Bar height as a share of the budget, capped so an outlier can't break layout.
const pct = (v: number) => Math.min(100, (v / budget) * 100)

onMounted(() => hit(0))
</script>

<template>
  <LabShell bg="#08090C" ink="#E9EDF2" pop="#FFE14D" display="'Space Grotesk','DM Sans',sans-serif" :law="C.law">
    <div class="d">
      <header class="d__head">
        <h1 class="d__h1">Fast is a feature.</h1>
        <p class="d__sub">Every response on this page is measured against the 400 ms threshold. Hover anything.</p>
      </header>

      <nav class="d__nav" aria-label="Sections">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="d__item"
                  :class="{ on: active === i }" @pointerenter="hit(i)" @focus="hit(i)">
          <span class="d__n">{{ it.n }}</span>
          <span class="d__label">{{ it.label }}</span>
          <span class="d__desc">{{ it.desc }}</span>
        </NuxtLink>
      </nav>

      <section class="d__scope" aria-hidden="true">
        <div class="d__ceiling"><span>400 ms — Doherty ceiling</span></div>
        <div class="d__bars">
          <i v-for="(s, i) in samples" :key="i" :style="{ height: pct(s) + '%' }" />
        </div>
      </section>

      <dl class="d__stats">
        <div><dt>last</dt><dd>{{ last.toFixed(1) }}<i>ms</i></dd></div>
        <div><dt>mean</dt><dd>{{ avg.toFixed(1) }}<i>ms</i></dd></div>
        <div><dt>worst</dt><dd>{{ worst.toFixed(1) }}<i>ms</i></dd></div>
        <div><dt>budget</dt><dd>400<i>ms</i></dd></div>
      </dl>
    </div>
  </LabShell>
</template>

<style scoped>
.d { position: absolute; inset: 0; display: grid; grid-template-rows: auto 1fr auto auto; gap: 20rem; padding: 62rem clamp(18rem, 4vw, 54rem) 74rem; }
.d__head { max-width: 60ch; }
.d__h1 { margin: 0; font-size: clamp(30rem, 5vw, 54rem); font-weight: 600; letter-spacing: -0.03em; }
.d__sub { margin: 10rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 13rem; color: var(--ink-45); max-width: 46ch; }

.d__nav { display: grid; gap: 8rem; align-content: start; grid-template-columns: repeat(auto-fit, minmax(220rem, 1fr)); }
.d__item { display: grid; gap: 4rem; padding: 16rem; border: 1px solid var(--ink-15); border-radius: 12rem; text-decoration: none; color: var(--ink); background: rgba(255,255,255,0.02); transition: background 90ms linear, border-color 90ms linear; }
.d__item.on { background: var(--pop); color: #14140A; border-color: var(--pop); }
.d__item:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }
.d__n { font-size: 10rem; letter-spacing: 0.14em; opacity: 0.55; }
.d__label { font-size: 17rem; font-weight: 600; }
.d__desc { font-family: 'DM Sans', sans-serif; font-size: 11.5rem; line-height: 1.45; opacity: 0.68; }

.d__scope { position: relative; height: 92rem; border: 1px solid var(--ink-15); border-radius: 10rem; padding: 8rem; }
.d__ceiling { position: absolute; left: 8rem; right: 8rem; top: 8rem; border-top: 1px dashed rgba(255,225,77,0.5); }
.d__ceiling span { position: absolute; right: 0; top: 3rem; font-family: 'DM Sans', sans-serif; font-size: 9rem; color: rgba(255,225,77,0.75); }
.d__bars { position: absolute; inset: 8rem; display: flex; align-items: flex-end; gap: 3rem; }
.d__bars i { flex: 1; min-width: 2rem; background: var(--pop); border-radius: 2rem 2rem 0 0; opacity: 0.85; }

.d__stats { display: flex; flex-wrap: wrap; gap: 26rem; margin: 0; font-family: 'DM Sans', sans-serif; }
.d__stats div { display: grid; gap: 2rem; }
.d__stats dt { font-size: 9.5rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-45); }
.d__stats dd { margin: 0; font-size: 22rem; font-weight: 600; color: var(--pop); font-variant-numeric: tabular-nums; }
.d__stats i { font-style: normal; font-size: 11rem; opacity: 0.6; margin-left: 2rem; }

@media (max-width: 620px) { .d__scope { display: none; } .d__stats { gap: 16rem; } .d__stats dd { font-size: 17rem; } }
</style>
