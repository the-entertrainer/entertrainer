<script setup lang="ts">
/**
 * The small interactions, kept together because they share one visual
 * grammar and none of them is big enough to earn a file: tabs, accordion,
 * flashcards, a sorting activity, a scenario decision and a reflection box.
 *
 * One rule runs through all six: the learner has to do something before the
 * answer appears. A flashcard that shows both sides, an accordion opened by
 * default, a scenario with the best option marked — each of those is a
 * paragraph wearing a costume.
 */
import { useCourseStore } from '~/stores/course'

const props = defineProps<{ block: any; blockKey: string }>()
const store = useCourseStore()

/* ── Tabs ─────────────────────────────────────────────────────────────── */
const tab = ref(0)

/* ── Accordion ────────────────────────────────────────────────────────── */
const open = reactive<Record<number, boolean>>({})

/* ── Flashcards ───────────────────────────────────────────────────────── */
const flipped = reactive<Record<number, boolean>>({})

/* ── Sorting ──────────────────────────────────────────────────────────── */
const placed = reactive<Record<number, number | null>>({})
const sortChecked = ref(false)
const sortScore = computed(() => {
  if (!props.block.items) return 0
  return props.block.items.filter((it: any, i: number) => placed[i] === it.bucket).length
})

/* ── Matching ─────────────────────────────────────────────────────────── */
// Pair every left item with its right item — sort's exact pattern (click to
// place, a Check button, per-item feedback), just pairing two lists instead
// of bucketing one.
const matchLeftSel = ref<number | null>(null)
/** leftIndex -> the display position (post-shuffle) of the right item placed against it. */
const matchPicked = reactive<Record<number, number>>({})
const matchChecked = ref(false)
/** A shuffle of the right column's display order, fixed once per block instance. */
const matchRightOrder = ref<number[]>([])
onMounted(() => {
  if (props.block.type !== 'match') return
  const order = [...Array(props.block.pairs.length).keys()]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  matchRightOrder.value = order
})
function pickLeft(i: number) {
  if (matchChecked.value) return
  matchLeftSel.value = matchLeftSel.value === i ? null : i
}
function pickRight(displayIndex: number) {
  if (matchChecked.value || matchLeftSel.value === null) return
  for (const k of Object.keys(matchPicked)) {
    if (matchPicked[+k] === displayIndex) delete matchPicked[+k]
  }
  matchPicked[matchLeftSel.value] = displayIndex
  matchLeftSel.value = null
}
const matchTakenDisplayIndices = computed(() => new Set(Object.values(matchPicked)))
const matchScore = computed(() => {
  if (props.block.type !== 'match') return 0
  let right = 0
  for (const li of Object.keys(matchPicked)) {
    if (matchRightOrder.value[matchPicked[+li]] === +li) right++
  }
  return right
})

/* ── Scenario ─────────────────────────────────────────────────────────── */
const chosen = ref<number | null>(null)

/* ── Reflection ───────────────────────────────────────────────────────── */
const text = ref('')
const words = computed(() => text.value.trim().split(/\s+/).filter(Boolean).length)
onMounted(() => { text.value = store.reflections[props.blockKey] ?? '' })
watchEffect(() => { if (text.value) store.reflect(props.blockKey, text.value) })
</script>

<template>
  <!-- ── Tabs ────────────────────────────────────────────────────────── -->
  <div v-if="block.type === 'tabs'" class="tabs">
    <div class="tabs__bar" role="tablist">
      <button v-for="(t, i) in block.items" :key="i" type="button" role="tab"
              class="tabs__tab" :class="{ 'is-on': tab === i }" :aria-selected="tab === i"
              @click="tab = i">{{ t.label }}</button>
    </div>
    <div class="tabs__panel" role="tabpanel">{{ block.items[tab].body }}</div>
  </div>

  <!-- ── Accordion ───────────────────────────────────────────────────── -->
  <div v-else-if="block.type === 'accordion'" class="acc">
    <p v-if="block.title" class="t-mono acc__title">{{ block.title }}</p>
    <div v-for="(it, i) in block.items" :key="i" class="acc__item">
      <button type="button" class="acc__q" :aria-expanded="!!open[i]" @click="open[i] = !open[i]">
        <span>{{ it.q }}</span>
        <span class="acc__sign" aria-hidden="true">{{ open[i] ? '–' : '+' }}</span>
      </button>
      <p v-if="open[i]" class="acc__a">{{ it.a }}</p>
    </div>
  </div>

  <!-- ── Flashcards ──────────────────────────────────────────────────── -->
  <div v-else-if="block.type === 'flashcards'" class="fc">
    <p v-if="block.title" class="t-mono fc__title">{{ block.title }}</p>
    <p class="fc__hint">Answer each one in your head first, then turn it over.</p>
    <ul class="fc__grid">
      <li v-for="(c, i) in block.cards" :key="i">
        <button type="button" class="fc__card" :class="{ 'is-flipped': flipped[i] }" @click="flipped[i] = !flipped[i]">
          <span class="fc__face">{{ flipped[i] ? c.back : c.front }}</span>
          <span class="t-mono fc__turn">{{ flipped[i] ? 'Back' : 'Turn over' }}</span>
        </button>
      </li>
    </ul>
  </div>

  <!-- ── Sorting ─────────────────────────────────────────────────────── -->
  <div v-else-if="block.type === 'sort'" class="sort">
    <p class="sort__prompt">{{ block.prompt }}</p>
    <ul class="sort__items">
      <li v-for="(it, i) in block.items" :key="i" class="sort__item">
        <p class="sort__text">{{ it.text }}</p>
        <div class="sort__buckets" role="radiogroup" :aria-label="it.text">
          <button v-for="(b, bi) in block.buckets" :key="bi" type="button"
                  class="sort__bucket" role="radio" :aria-checked="placed[i] === bi"
                  :class="{ 'is-on': placed[i] === bi,
                            'is-right': sortChecked && bi === it.bucket,
                            'is-wrong': sortChecked && placed[i] === bi && bi !== it.bucket }"
                  :disabled="sortChecked" @click="placed[i] = bi">{{ b }}</button>
        </div>
        <p v-if="sortChecked" class="sort__why">{{ it.why }}</p>
      </li>
    </ul>
    <button v-if="!sortChecked" type="button" class="ticket ticket--sm"
            :disabled="Object.keys(placed).length < block.items.length" @click="sortChecked = true">
      Check my sorting
    </button>
    <p v-else class="t-mono sort__score" role="status">{{ sortScore }} of {{ block.items.length }} placed correctly</p>
  </div>

  <!-- ── Matching ────────────────────────────────────────────────────── -->
  <div v-else-if="block.type === 'match'" class="match">
    <p class="match__prompt">{{ block.prompt }}</p>
    <div class="match__grid">
      <ul class="match__col">
        <li v-for="(p, i) in block.pairs" :key="`l${i}`">
          <button type="button" class="match__item"
                  :class="{ 'is-sel': matchLeftSel === i, 'is-done': matchPicked[i] !== undefined,
                            'is-right': matchChecked && matchRightOrder[matchPicked[i]] === i,
                            'is-wrong': matchChecked && matchPicked[i] !== undefined && matchRightOrder[matchPicked[i]] !== i }"
                  :disabled="matchChecked" @click="pickLeft(i)">{{ p.left }}</button>
        </li>
      </ul>
      <ul class="match__col">
        <li v-for="(ri, di) in matchRightOrder" :key="`r${di}`">
          <button type="button" class="match__item"
                  :class="{ 'is-taken': matchTakenDisplayIndices.has(di) }"
                  :disabled="matchChecked" @click="pickRight(di)">{{ block.pairs[ri].right }}</button>
        </li>
      </ul>
    </div>
    <button v-if="!matchChecked" type="button" class="ticket ticket--sm"
            :disabled="Object.keys(matchPicked).length < block.pairs.length" @click="matchChecked = true">
      Check my pairing
    </button>
    <template v-else>
      <p class="t-mono match__score" role="status">{{ matchScore }} of {{ block.pairs.length }} paired correctly</p>
      <div class="match__review">
        <div v-for="(p, i) in block.pairs" :key="`v${i}`" class="match__row"
             :class="matchRightOrder[matchPicked[i]] === i ? 'is-right' : 'is-wrong'">
          <p class="match__pair"><b>{{ p.left }}</b> → {{ p.right }}</p>
          <p v-if="p.why" class="match__why">{{ p.why }}</p>
        </div>
      </div>
    </template>
  </div>

  <!-- ── Scenario ────────────────────────────────────────────────────── -->
  <div v-else-if="block.type === 'scenario'" class="sc">
    <p class="t-mono sc__kicker">Scenario</p>
    <p class="sc__setup">{{ block.setup }}</p>
    <p class="sc__q">{{ block.question }}</p>
    <ul class="sc__choices">
      <li v-for="(c, i) in block.choices" :key="i">
        <button type="button" class="sc__choice"
                :class="{ 'is-on': chosen === i, [`is-${c.verdict}`]: chosen !== null }"
                :disabled="chosen !== null" @click="chosen = i">{{ c.text }}</button>
      </li>
    </ul>
    <div v-if="chosen !== null" class="sc__fb" role="status">
      <p class="t-mono sc__verdict">{{ block.choices[chosen].verdict === 'best' ? 'Strongest choice'
        : block.choices[chosen].verdict === 'workable' ? 'Workable' : 'Weak choice' }}</p>
      <p>{{ block.choices[chosen].feedback }}</p>
      <details class="sc__all">
        <summary>See feedback on the other options</summary>
        <p v-for="(c, i) in block.choices" :key="i" v-show="i !== chosen">
          <b>{{ c.text }}</b> — {{ c.feedback }}
        </p>
      </details>
    </div>
  </div>

  <!-- ── Reflection ──────────────────────────────────────────────────── -->
  <div v-else-if="block.type === 'reflect'" class="rf">
    <p class="t-mono rf__kicker">Write it down</p>
    <p class="rf__prompt">{{ block.prompt }}</p>
    <p v-if="block.hint" class="rf__hint">{{ block.hint }}</p>
    <label class="sr-only" :for="`rf-${blockKey}`">Your answer</label>
    <textarea :id="`rf-${blockKey}`" v-model="text" class="glass-field rf__field" rows="4"
              placeholder="Nothing here leaves your browser." />
    <p class="t-mono rf__count">
      {{ words }} word{{ words === 1 ? '' : 's' }}<template v-if="block.minWords"> · {{ block.minWords }} suggested</template>
    </p>
  </div>
</template>

<style scoped>
/* Shared shell for every interaction in this file. */
.tabs, .acc, .fc, .sort, .match, .sc, .rf {
  margin: clamp(20rem, 2.6vw, 30rem) 0;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-l);
  background: var(--paper);
  overflow: hidden;
}

/* ── Tabs ── */
.tabs__bar { display: flex; flex-wrap: wrap; gap: 0; border-bottom: var(--stroke) solid var(--line); background: var(--paper-2); }
.tabs__tab {
  padding: 12rem 16rem; font-family: var(--font-mono); font-size: var(--type-meta);
  letter-spacing: var(--tracking-meta); text-transform: uppercase; color: var(--muted);
  border-right: var(--stroke) solid var(--line);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.tabs__tab.is-on { background: var(--ink); color: var(--paper); }
@media (hover: hover) { .tabs__tab:not(.is-on):hover { background: var(--paper-3); color: var(--ink); } }
.tabs__panel { padding: clamp(18rem, 2.4vw, 26rem); font-family: var(--font-reading); font-size: 16rem; line-height: 1.68; }

/* ── Accordion ── */
.acc__title { margin: 0; padding: 14rem 18rem; color: var(--muted); background: var(--paper-2); border-bottom: var(--stroke) solid var(--line); }
.acc__item + .acc__item { border-top: var(--stroke) solid var(--line); }
.acc__q {
  display: flex; align-items: center; justify-content: space-between; gap: 14rem; width: 100%;
  padding: 15rem 18rem; text-align: left; font-size: 15.5rem; font-weight: 600; line-height: 1.4;
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .acc__q:hover { background: var(--paper-2); } }
.acc__sign { font-family: var(--font-mono); font-size: 20rem; color: var(--muted); flex: none; }
.acc__a { margin: 0; padding: 0 18rem 18rem; font-family: var(--font-reading); font-size: 15.5rem; line-height: 1.65; color: var(--muted); max-width: 70ch; }

/* ── Flashcards ── */
.fc__title { margin: 0; padding: 14rem 18rem; color: var(--muted); background: var(--paper-2); border-bottom: var(--stroke) solid var(--line); }
.fc__hint { margin: 0; padding: 14rem 18rem 0; font-size: 13.5rem; color: var(--muted); }
.fc__grid { list-style: none; margin: 0; padding: 16rem 18rem 18rem; display: grid; gap: 10rem; grid-template-columns: repeat(auto-fit, minmax(230rem, 1fr)); }
.fc__card {
  display: flex; flex-direction: column; justify-content: space-between; gap: 12rem;
  width: 100%; min-height: 130rem; padding: 15rem; text-align: left;
  border: var(--stroke) solid var(--ink); border-radius: var(--radius-m);
  background: var(--paper-2); font-size: 14.5rem; line-height: 1.5;
  transition: background var(--dur-fast) var(--ease-out);
}
.fc__card.is-flipped { background: var(--yellow); color: var(--on-yellow); }
@media (hover: hover) { .fc__card:hover { border-width: var(--stroke); } }
.fc__turn { color: var(--muted); font-size: 10rem; }
.fc__card.is-flipped .fc__turn { color: inherit; opacity: 0.7; }

/* ── Sorting ── */
.sort { padding: clamp(18rem, 2.4vw, 26rem); }
.sort__prompt { margin: 0 0 18rem; font-size: 16rem; line-height: 1.5; font-weight: 600; }
.sort__items { list-style: none; margin: 0 0 18rem; padding: 0; display: grid; gap: 16rem; }
.sort__item { padding-bottom: 16rem; border-bottom: var(--stroke) solid var(--line); }
.sort__text { margin: 0 0 10rem; font-size: 15rem; line-height: 1.5; }
.sort__buckets { display: flex; flex-wrap: wrap; gap: 8rem; }
.sort__bucket {
  padding: 8rem 13rem; border-radius: var(--radius-full);
  border: var(--stroke) solid var(--ink); background: var(--paper);
  font-family: var(--font-mono); font-size: var(--type-meta); letter-spacing: var(--tracking-meta);
  text-transform: uppercase; cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out);
}
.sort__bucket.is-on { background: var(--ink); color: var(--paper); }
.sort__bucket.is-right { background: var(--green); color: var(--on-green); border-width: var(--stroke); }
.sort__bucket.is-wrong { background: var(--red); color: var(--on-red); }
.sort__why { margin: 10rem 0 0; font-size: 13.5rem; line-height: 1.55; color: var(--muted); }
.sort__score { margin: 0; color: var(--muted); }

/* ── Matching ── */
.match { padding: clamp(18rem, 2.4vw, 26rem); }
.match__prompt { margin: 0 0 18rem; font-size: 16rem; line-height: 1.5; font-weight: 600; }
.match__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12rem 16rem; margin-bottom: 16rem; }
.match__col { list-style: none; margin: 0; padding: 0; display: grid; gap: 8rem; align-content: start; }
.match__item {
  width: 100%; text-align: left; padding: 11rem 14rem; border-radius: var(--radius-m);
  border: var(--stroke) solid var(--ink); background: var(--paper);
  font-size: 14.5rem; line-height: 1.4; cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .match__item:not(:disabled):hover { background: var(--paper-3); } }
.match__item.is-sel { background: var(--yellow); color: var(--on-yellow); }
.match__item.is-done, .match__item.is-taken { opacity: 0.6; }
.match__item.is-right { background: var(--green); color: var(--on-green); opacity: 1; border-width: var(--stroke); }
.match__item.is-wrong { background: var(--red); color: var(--on-red); opacity: 1; }
.match__item:disabled { cursor: default; }
.match__score { margin: 0 0 14rem; color: var(--muted); }
.match__review { display: grid; gap: 12rem; }
.match__row { padding: 12rem 14rem; border-radius: var(--radius-m); border-left: 5rem solid var(--red); background: var(--paper); }
.match__row.is-right { border-left-color: var(--green); }
.match__pair { margin: 0; font-size: 14.5rem; }
.match__why { margin: 6rem 0 0; font-size: 13.5rem; line-height: 1.55; color: var(--muted); }

/* ── Scenario ── */
.sc { padding: clamp(18rem, 2.4vw, 26rem); background: var(--paper-2); }
.sc__kicker { margin: 0 0 12rem; color: var(--muted); }
.sc__setup { margin: 0 0 12rem; font-family: var(--font-reading); font-size: 16rem; line-height: 1.65; }
.sc__q { margin: 0 0 14rem; font-size: 16rem; font-weight: 700; }
.sc__choices { list-style: none; margin: 0; padding: 0; display: grid; gap: 8rem; }
.sc__choice {
  width: 100%; text-align: left; padding: 13rem 15rem;
  border: var(--stroke) solid var(--ink); border-radius: var(--radius-m);
  background: var(--paper); font-size: 15rem; line-height: 1.45; cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .sc__choice:not(:disabled):hover { background: var(--paper-3); } }
.sc__choice.is-on { border-width: var(--stroke); }
.sc__choice.is-best { background: color-mix(in srgb, var(--green) 30%, var(--paper)); }
.sc__choice.is-workable { background: color-mix(in srgb, var(--yellow) 26%, var(--paper)); }
.sc__choice.is-poor { background: color-mix(in srgb, var(--red) 20%, var(--paper)); }
.sc__fb { margin-top: 14rem; padding: 15rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper); }
.sc__verdict { margin: 0 0 8rem; color: var(--muted); }
.sc__fb > p { margin: 0; font-size: 14.5rem; line-height: 1.6; }
.sc__all { margin-top: 12rem; font-size: 13.5rem; }
.sc__all summary { cursor: pointer; color: var(--muted); font-family: var(--font-mono); font-size: var(--type-meta); letter-spacing: var(--tracking-meta); text-transform: uppercase; }
.sc__all p { margin: 10rem 0 0; line-height: 1.55; color: var(--muted); }
.sc__all b { color: var(--ink); }

/* ── Reflection ── */
.rf { padding: clamp(18rem, 2.4vw, 26rem); }
.rf__kicker { margin: 0 0 10rem; color: var(--muted); }
.rf__prompt { margin: 0 0 8rem; font-size: 16.5rem; line-height: 1.5; font-weight: 600; }
.rf__hint { margin: 0 0 14rem; font-size: 13.5rem; line-height: 1.55; color: var(--muted); }
.rf__field { font-family: var(--font-reading); font-size: 15.5rem; }
.rf__count { margin: 8rem 0 0; color: var(--muted); }
</style>
