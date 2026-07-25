<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '04 First & Last', robots: 'noindex' })
const C = CONCEPTS[3]

/**
 * Serial Position Effect: recall is highest for the first item (primacy, it got
 * rehearsed into long-term memory) and the last (recency, still in the working
 * buffer), and sags in the middle. The page plots that U-curve and lets you
 * reorder the nav — watching an item's predicted recall change as it moves is
 * the argument. For an instructional designer this is the product, not a trick.
 */
const order = ref([...LAB_NAV])

/** Normalised U-curve: primacy + recency, floor in the middle. */
function recall(i: number, n: number) {
  if (n === 1) return 1
  const t = i / (n - 1)
  const primacy = Math.exp(-t * 3.0)
  const recency = Math.exp(-(1 - t) * 4.2)
  return Math.min(1, 0.24 + 0.76 * Math.max(primacy, recency))
}
function move(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= order.value.length) return
  const next = [...order.value]
  ;[next[i], next[j]] = [next[j], next[i]]
  order.value = next
}
</script>

<template>
  <LabShell bg="#FFF9F2" ink="#1A1410" pop="#E0453C" display="'Fraunces',Georgia,serif" :law="C.law">
    <div class="s">
      <header class="s__head">
        <h1 class="s__h1">I design what they<br>remember — not what<br>they merely saw.</h1>
        <p class="s__sub">Recall isn't flat across a list. Reorder these and watch the predicted recall move.</p>
      </header>

      <ol class="s__list">
        <li v-for="(it, i) in order" :key="it.href" class="s__row">
          <span class="s__pos">{{ i + 1 }}</span>
          <NuxtLink :to="it.href" class="s__link">
            <span class="s__label">{{ it.label }}</span>
            <span class="s__desc">{{ it.desc }}</span>
          </NuxtLink>
          <span class="s__bar" :style="{ '--v': recall(i, order.length) }">
            <i /><em>{{ Math.round(recall(i, order.length) * 100) }}%</em>
          </span>
          <span class="s__ctl">
            <button @click="move(i, -1)" :disabled="i === 0" aria-label="move up">↑</button>
            <button @click="move(i, 1)" :disabled="i === order.length - 1" aria-label="move down">↓</button>
          </span>
        </li>
      </ol>

      <p class="s__note"><b>Primacy</b> rehearses into long-term memory · <b>Recency</b> is still in the buffer · the middle is where things go to be forgotten.</p>
    </div>
  </LabShell>
</template>

<style scoped>
.s { position: absolute; inset: 0; overflow-y: auto; padding: 64rem clamp(18rem, 5vw, 60rem) 80rem; display: grid; align-content: center; gap: 26rem; }
.s__head { max-width: 40ch; }
.s__h1 { margin: 0; font-size: clamp(28rem, 4.6vw, 50rem); line-height: 1.06; letter-spacing: -0.025em; font-weight: 400; }
.s__sub { margin: 12rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 13rem; color: var(--ink-70); max-width: 46ch; }

.s__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6rem; max-width: 900rem; }
.s__row { display: grid; grid-template-columns: 26rem 1fr 128rem auto; align-items: center; gap: 14rem; padding: 12rem 4rem; border-top: 1px solid var(--ink-15); }
.s__row:last-child { border-bottom: 1px solid var(--ink-15); }
.s__pos { font-family: 'DM Sans', sans-serif; font-size: 11rem; color: var(--ink-45); font-variant-numeric: tabular-nums; }
.s__link { display: grid; gap: 2rem; text-decoration: none; color: var(--ink); min-width: 0; }
.s__label { font-size: 20rem; }
.s__desc { font-family: 'DM Sans', sans-serif; font-size: 11.5rem; color: var(--ink-45); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.s__link:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; border-radius: 4rem; }

.s__bar { position: relative; display: flex; align-items: center; gap: 8rem; }
.s__bar i { flex: 1; height: 8rem; border-radius: 4rem; background: var(--ink-15); position: relative; overflow: hidden; }
.s__bar i::after { content: ''; position: absolute; inset: 0; transform-origin: left; transform: scaleX(var(--v)); background: var(--pop); transition: transform 320ms cubic-bezier(.2,.8,.2,1); }
.s__bar em { font-family: 'DM Sans', sans-serif; font-style: normal; font-size: 11rem; color: var(--ink-70); font-variant-numeric: tabular-nums; width: 34rem; text-align: right; }

.s__ctl { display: flex; gap: 4rem; }
.s__ctl button { width: 34rem; height: 34rem; border-radius: 8rem; border: 1px solid var(--ink-15); background: transparent; color: var(--ink); cursor: pointer; font-size: 13rem; transition: background 160ms ease; }
.s__ctl button:hover:not(:disabled) { background: var(--pop); color: #fff; border-color: var(--pop); }
.s__ctl button:disabled { opacity: 0.3; cursor: default; }
.s__ctl button:focus-visible { outline: 2px solid var(--pop); outline-offset: 2px; }

.s__note { margin: 0; font-family: 'DM Sans', sans-serif; font-size: 11.5rem; color: var(--ink-45); max-width: 70ch; }
.s__note b { color: var(--ink-70); }

@media (prefers-reduced-motion: reduce) { .s__bar i::after { transition: none; } }
@media (max-width: 720px) {
  .s__row { grid-template-columns: 22rem 1fr auto; grid-template-areas: 'p l c' '. b b'; }
  .s__pos { grid-area: p; } .s__link { grid-area: l; } .s__ctl { grid-area: c; } .s__bar { grid-area: b; }
  .s__desc { display: none; }
}
</style>
