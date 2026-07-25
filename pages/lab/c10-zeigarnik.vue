<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '10 Open Loop', robots: 'noindex' })
const C = CONCEPTS[9]

/**
 * Zeigarnik Effect: interrupted or unfinished tasks are recalled far better
 * than completed ones — the tension of the open loop keeps them active. Every
 * card here is cut off mid-sentence and stays that way until you open it. The
 * unresolved state is the mechanism *and* the pitch: it's exactly how a good
 * course hooks someone before it teaches them.
 */
const openLoops = ref<Set<string>>(new Set(LAB_NAV.map(i => i.href)))
const teaser: Record<string, [string, string]> = {
  '/about': ['I was carrying plates in a hotel when I first noticed that nobody actually reads the', 'training manual. That observation turned into a career.'],
  '/instructional-design': ['Most e-learning fails for one reason, and it isn\'t the budget or the', 'authoring tool. It\'s that nobody decided what should change.'],
  '/my-work': ['The comic worked better than the slide deck it replaced, and the reason why still', 'surprises the people who commissioned it.'],
  '/tools': ['I built these because I kept doing the same slow thing by hand every single', 'week — so now they take about nine seconds.']
}
function close(href: string) {
  const n = new Set(openLoops.value); n.delete(href); openLoops.value = n
}
const remaining = computed(() => openLoops.value.size)
</script>

<template>
  <LabShell bg="#FAF4E6" ink="#1C1710" pop="#C1272D" display="'Fraunces',Georgia,serif" :law="C.law">
    <div class="z">
      <header class="z__head">
        <h1 class="z__h1">The hook comes<br>before the lesson.</h1>
        <p class="z__sub">
          Four unfinished thoughts.
          <b>{{ remaining }}</b> still open — and they'll sit in your head until they aren't.
        </p>
      </header>

      <ul class="z__list">
        <li v-for="it in LAB_NAV" :key="it.href" class="z__item" :class="{ closed: !openLoops.has(it.href) }">
          <p class="z__n">{{ it.n }} · {{ it.label }}</p>
          <p class="z__text">
            {{ teaser[it.href][0] }}<!--
            --><span class="z__rest" :class="{ show: !openLoops.has(it.href) }"> {{ teaser[it.href][1] }}</span><!--
            --><span v-if="openLoops.has(it.href)" class="z__cut" aria-hidden="true">…</span>
          </p>
          <div class="z__act">
            <button v-if="openLoops.has(it.href)" class="z__resolve" @click="close(it.href)">
              Finish the sentence
            </button>
            <NuxtLink v-else :to="it.href" class="z__go">Read {{ it.label }} →</NuxtLink>
          </div>
        </li>
      </ul>
    </div>
  </LabShell>
</template>

<style scoped>
.z { position: absolute; inset: 0; overflow-y: auto; padding: 62rem clamp(18rem, 4vw, 56rem) 78rem; display: grid; align-content: center; gap: 26rem; }
.z__head { max-width: 46ch; }
.z__h1 { margin: 0; font-size: clamp(28rem, 4.6vw, 52rem); line-height: 1.04; letter-spacing: -0.03em; font-weight: 400; }
.z__sub { margin: 12rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 13rem; color: var(--ink-70); }
.z__sub b { color: var(--pop); font-variant-numeric: tabular-nums; }

.z__list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(300rem, 1fr)); gap: 12rem; max-width: 1000rem; }
.z__item { padding: 18rem; border: 1px solid var(--ink-15); border-radius: 14rem; background: #fff; display: grid; align-content: start; gap: 10rem; }
.z__item.closed { border-color: var(--pop); }
.z__n { margin: 0; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pop); }
.z__text { margin: 0; font-size: 17rem; line-height: 1.45; }
/* The unresolved half is present in the DOM for screen readers but visually
   withheld — the loop is a visual state, not missing content. */
.z__rest { opacity: 0; clip-path: inset(0 100% 0 0); transition: opacity 320ms ease, clip-path 420ms cubic-bezier(.2,.8,.2,1); }
.z__rest.show { opacity: 1; clip-path: inset(0 0 0 0); }
.z__cut { color: var(--pop); font-weight: 700; }

.z__act { margin-top: 2rem; }
.z__resolve { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12rem; color: #fff; background: var(--pop); border: 0; border-radius: 999rem; padding: 10rem 18rem; cursor: pointer; transition: transform 180ms cubic-bezier(.2,.8,.2,1); }
.z__resolve:hover { transform: translateY(-2rem); }
.z__go { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12rem; color: var(--pop); text-decoration: none; }
.z__resolve:focus-visible, .z__go:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .z__rest { transition: opacity 120ms ease; clip-path: none; }
  .z__resolve { transition: none; }
}
</style>
