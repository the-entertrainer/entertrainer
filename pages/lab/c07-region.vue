<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '07 Common Region', robots: 'noindex' })
const C = CONCEPTS[6]

/**
 * Gestalt law of Common Region: elements sharing an enclosed area are read as a
 * group — and enclosure beats proximity. Drag a card between the two bounded
 * regions and its meaning changes with no change to the card itself. That's the
 * demonstration: grouping is authored, not inherent.
 */
type Bucket = 'think' | 'make'
const bucket = ref<Record<string, Bucket>>({
  '/about': 'think', '/instructional-design': 'think', '/my-work': 'make', '/tools': 'make'
})
const dragging = ref<string | null>(null)
const over = ref<Bucket | null>(null)

const inBucket = (b: Bucket) => LAB_NAV.filter(i => bucket.value[i.href] === b)
function drop(b: Bucket) {
  if (dragging.value) bucket.value = { ...bucket.value, [dragging.value]: b }
  dragging.value = null; over.value = null
}
/** Keyboard equivalent — dragging must never be the only way to do this. */
function toggle(href: string) {
  bucket.value = { ...bucket.value, [href]: bucket.value[href] === 'think' ? 'make' : 'think' }
}
</script>

<template>
  <LabShell bg="#EEF1EC" ink="#12160F" pop="#0F7B4F" display="'Bricolage Grotesque','DM Sans',sans-serif" :law="C.law">
    <div class="g">
      <header class="g__head">
        <h1 class="g__h1">Everything in its place.</h1>
        <p class="g__sub">Two enclosures, four cards. Drag one across — or press <kbd>Enter</kbd> — and watch it change meaning without changing itself.</p>
      </header>

      <div class="g__regions">
        <section v-for="b in (['think','make'] as Bucket[])" :key="b" class="g__region"
                 :class="{ over: over === b }"
                 @dragover.prevent="over = b" @dragleave="over = null" @drop.prevent="drop(b)">
          <h2 class="g__rt">{{ b === 'think' ? 'How I think' : 'What I make' }}</h2>
          <p class="g__rc">{{ inBucket(b).length }} {{ inBucket(b).length === 1 ? 'item' : 'items' }}</p>
          <ul class="g__cards">
            <li v-for="it in inBucket(b)" :key="it.href">
              <div class="g__card" draggable="true" tabindex="0"
                   @dragstart="dragging = it.href" @dragend="dragging = null; over = null"
                   @keydown.enter.prevent="toggle(it.href)" @keydown.space.prevent="toggle(it.href)">
                <span class="g__n">{{ it.n }}</span>
                <NuxtLink :to="it.href" class="g__label">{{ it.label }}</NuxtLink>
                <span class="g__d">{{ it.desc }}</span>
                <span class="g__grip" aria-hidden="true">⠿</span>
              </div>
            </li>
          </ul>
          <p v-if="!inBucket(b).length" class="g__empty">Empty — an enclosure with nothing in it still reads as a group.</p>
        </section>
      </div>
    </div>
  </LabShell>
</template>

<style scoped>
.g { position: absolute; inset: 0; overflow-y: auto; padding: 62rem clamp(18rem, 4vw, 56rem) 78rem; display: grid; align-content: center; gap: 26rem; }
.g__head { max-width: 56ch; }
.g__h1 { margin: 0; font-size: clamp(28rem, 4.4vw, 50rem); line-height: 1.04; letter-spacing: -0.03em; font-weight: 800; }
.g__sub { margin: 12rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.55; color: var(--ink-70); }
.g__sub kbd { font-family: ui-monospace, monospace; font-size: 11rem; background: var(--ink-15); border-radius: 4rem; padding: 1rem 5rem; }

.g__regions { display: grid; grid-template-columns: repeat(auto-fit, minmax(280rem, 1fr)); gap: 16rem; }
/* The enclosure is the whole point — a real boundary, not just spacing. */
.g__region { border: 2px dashed var(--ink-15); border-radius: 20rem; padding: 18rem; background: rgba(255,255,255,0.5); transition: border-color 180ms ease, background 180ms ease; min-height: 250rem; }
.g__region.over { border-color: var(--pop); background: rgba(15,123,79,0.07); }
.g__rt { margin: 0; font-size: 19rem; font-weight: 800; letter-spacing: -0.02em; }
.g__rc { margin: 2rem 0 14rem; font-family: 'DM Sans', sans-serif; font-size: 11rem; color: var(--ink-45); }
.g__cards { list-style: none; margin: 0; padding: 0; display: grid; gap: 8rem; }

.g__card { position: relative; display: grid; gap: 3rem; padding: 14rem 34rem 14rem 14rem; background: #fff; border: 1px solid var(--ink-15); border-radius: 12rem; cursor: grab; }
.g__card:active { cursor: grabbing; }
.g__card:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }
.g__n { font-family: 'DM Sans', sans-serif; font-size: 10rem; letter-spacing: 0.14em; color: var(--pop); }
.g__label { font-size: 17rem; font-weight: 700; text-decoration: none; color: var(--ink); }
.g__label:focus-visible { outline: 2px solid var(--pop); outline-offset: 2px; }
.g__d { font-family: 'DM Sans', sans-serif; font-size: 11.5rem; line-height: 1.45; color: var(--ink-45); }
.g__grip { position: absolute; right: 12rem; top: 14rem; color: var(--ink-15); font-size: 14rem; }
.g__empty { margin: 8rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 11.5rem; color: var(--ink-45); }

@media (prefers-reduced-motion: reduce) { .g__region { transition: none; } }
</style>
