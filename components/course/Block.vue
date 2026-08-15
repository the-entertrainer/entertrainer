<script setup lang="ts">
import type { Block } from '~/content/course/ai'
import { resourceById, sourceById } from '~/content/course/ai'

/**
 * The block dispatcher. Static blocks are drawn here; the six interactive ones
 * live in CourseInteractions and the two heavier ones have files of their own.
 *
 * The evidence block is the one worth reading closely. Every factual claim in
 * this course that a reasonable person might want to check is wrapped in one,
 * and it prints three things together: the claim, the confidence level, and
 * what the confidence rests on. A colour alone would not do — the level is
 * always spelled out in a word.
 */
const props = defineProps<{ block: Block; blockKey: string }>()
const emit = defineEmits<{ answered: [boolean] }>()

const CONFIDENCE_LABEL: Record<string, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
  speculative: 'Speculative'
}
const CONFIDENCE_NOTE: Record<string, string> = {
  high: 'Primary source, or multiple independent authoritative sources.',
  medium: 'Credible secondary reporting or indirect evidence.',
  low: 'Plausible but disputed, incomplete, or not independently verified.',
  speculative: 'A scenario or forecast, not an established fact.'
}

const b = computed(() => props.block as any)
const resources = computed(() =>
  b.value.resourceIds ? b.value.resourceIds.map((id: string) => resourceById(id)).filter(Boolean) : [])
const source = computed(() => b.value.sourceId ? sourceById(b.value.sourceId) : undefined)

/* ── Chart geometry ───────────────────────────────────────────────────────
   Self-drawn, no library — the same reasoning as the site's generated
   thumbnails and share card: it cannot drift from the palette, and a chart
   this simple does not need a dependency. `bar` and `line` share one data
   shape (ordered label/value pairs); `line` just connects the same points
   instead of drawing columns. */
const CHART_W = 640, CHART_H = 300, CHART_PAD = 42, BAR_GAP = 22
// Exponential growth plotted on a linear axis is not a simplification, it's
// unreadable — the early points collapse to the baseline next to the last
// one. `scale: 'log'` maps through log10 before anything is positioned.
const chartVal = (v: number) => b.value.scale === 'log' ? Math.log10(Math.max(v, 1)) : v
const chartMax = computed(() =>
  b.value.type === 'chart' ? Math.max(...b.value.data.map((d: any) => chartVal(d.value)), 1) : 1)
const barWidth = computed(() => {
  if (b.value.type !== 'chart') return 0
  const n = b.value.data.length
  return (CHART_W - CHART_PAD * 2 - BAR_GAP * (n - 1)) / n
})
const barX = (i: number) => CHART_PAD + i * (barWidth.value + BAR_GAP)
const barHeight = (v: number) => (chartVal(v) / chartMax.value) * (CHART_H - CHART_PAD * 2)
const barY = (v: number) => CHART_H - CHART_PAD - barHeight(v)
const ptX = (i: number) => {
  const n = b.value.data.length
  return n <= 1 ? CHART_PAD : CHART_PAD + i * ((CHART_W - CHART_PAD * 2) / (n - 1))
}
const ptY = (v: number) => CHART_H - CHART_PAD - (chartVal(v) / chartMax.value) * (CHART_H - CHART_PAD * 2)
const linePoints = computed(() =>
  b.value.type === 'chart' ? b.value.data.map((d: any, i: number) => `${ptX(i)},${ptY(d.value)}`).join(' ') : '')
</script>

<template>
  <!-- Prose -->
  <div v-if="b.type === 'text'" class="bk-text" :class="{ 'is-lead': b.lead }">
    <p v-for="(p, i) in b.body" :key="i">{{ p }}</p>
  </div>

  <h3 v-else-if="b.type === 'heading'" class="bk-heading">{{ b.text }}</h3>

  <figure v-else-if="b.type === 'quote'" class="bk-quote">
    <blockquote>{{ b.text }}</blockquote>
    <figcaption>
      <span class="bk-quote__who">{{ b.attribution }}</span>
      <span v-if="b.source" class="bk-quote__src">{{ b.source }}</span>
    </figcaption>
  </figure>

  <aside v-else-if="b.type === 'takeaway'" class="bk-take">
    <p class="t-mono bk-take__kicker">{{ b.title || 'Take this with you' }}</p>
    <p class="bk-take__body">{{ b.body }}</p>
  </aside>

  <!-- Evidence -->
  <aside v-else-if="b.type === 'evidence'" class="bk-ev" :class="`is-${b.confidence}`">
    <p class="t-mono bk-ev__level">
      <span class="bk-ev__dot" aria-hidden="true" />{{ CONFIDENCE_LABEL[b.confidence] }}
    </p>
    <p class="bk-ev__claim">{{ b.claim }}</p>
    <p class="bk-ev__basis"><b>What this rests on.</b> {{ b.basis }}</p>
    <p class="t-mono bk-ev__scale">{{ CONFIDENCE_NOTE[b.confidence] }}</p>
    <a v-if="source?.url" class="bk-ev__src" :href="source.url" target="_blank" rel="noopener noreferrer">
      {{ source.title }} · {{ source.publisher }} ↗
    </a>
  </aside>

  <!-- Timeline -->
  <ol v-else-if="b.type === 'timeline'" class="bk-time">
    <li v-for="(it, i) in b.items" :key="i">
      <p class="t-mono bk-time__year">{{ it.year }}</p>
      <div>
        <p class="bk-time__label">{{ it.label }}</p>
        <p class="bk-time__body">{{ it.body }}</p>
      </div>
    </li>
  </ol>

  <!-- Comparison table -->
  <figure v-else-if="b.type === 'compare'" class="bk-compare">
    <figcaption v-if="b.caption" class="t-mono">{{ b.caption }}</figcaption>
    <div class="bk-compare__scroll">
      <table>
        <thead><tr><th v-for="(c, i) in b.columns" :key="i" scope="col">{{ c }}</th></tr></thead>
        <tbody>
          <tr v-for="(row, ri) in b.rows" :key="ri">
            <td v-for="(cell, ci) in row" :key="ci" :class="{ 'is-head': ci === 0 && b.columns.length > 2 }">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>

  <!-- Labeled graphic, drawn as a described list rather than a diagram: the
       parts have names and explanations, which is what a labelled graphic is
       for, and this version works with images off and with a screen reader. -->
  <figure v-else-if="b.type === 'labeled'" class="bk-labeled">
    <figcaption class="t-mono">{{ b.caption }}</figcaption>
    <dl>
      <div v-for="(p, i) in b.parts" :key="i">
        <dt><span class="bk-labeled__n">{{ String(i + 1).padStart(2, '0') }}</span>{{ p.label }}</dt>
        <dd>{{ p.body }}</dd>
      </div>
    </dl>
  </figure>

  <!-- Process: undated, ordered steps. Where timeline has a year column this
       has a running numeral instead — the fix for content that is a procedure,
       not a chronology. -->
  <figure v-else-if="b.type === 'process'" class="bk-proc">
    <figcaption v-if="b.caption" class="t-mono">{{ b.caption }}</figcaption>
    <ol>
      <li v-for="(s, i) in b.steps" :key="i">
        <span class="t-mono bk-proc__n">{{ String(i + 1).padStart(2, '0') }}</span>
        <div>
          <p class="bk-proc__label">{{ s.label }}</p>
          <p class="bk-proc__body">{{ s.body }}</p>
        </div>
      </li>
    </ol>
  </figure>

  <!-- Chart: flat, self-drawn, no library. -->
  <figure v-else-if="b.type === 'chart'" class="bk-chart">
    <figcaption class="t-mono">{{ b.caption }}</figcaption>
    <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" class="bk-chart__svg" role="img" :aria-label="b.caption">
      <line :x1="CHART_PAD" :y1="CHART_H - CHART_PAD" :x2="CHART_W - CHART_PAD" :y2="CHART_H - CHART_PAD" class="bk-chart__axis" />
      <template v-if="b.kind === 'bar'">
        <g v-for="(d, i) in b.data" :key="i">
          <rect :x="barX(i)" :y="barY(d.value)" :width="barWidth" :height="barHeight(d.value)" class="bk-chart__bar" />
          <text :x="barX(i) + barWidth / 2" :y="barY(d.value) - 10" text-anchor="middle" class="bk-chart__val">{{ d.value.toLocaleString() }}{{ b.unit }}</text>
          <text :x="barX(i) + barWidth / 2" :y="CHART_H - CHART_PAD + 22" text-anchor="middle" class="bk-chart__label">{{ d.label }}</text>
        </g>
      </template>
      <template v-else>
        <polyline :points="linePoints" class="bk-chart__line" fill="none" />
        <g v-for="(d, i) in b.data" :key="i">
          <circle :cx="ptX(i)" :cy="ptY(d.value)" r="5.5" class="bk-chart__dot" />
          <text :x="ptX(i)" :y="ptY(d.value) - 12" text-anchor="middle" class="bk-chart__val">{{ d.value.toLocaleString() }}{{ b.unit }}</text>
          <text :x="ptX(i)" :y="CHART_H - CHART_PAD + 22" text-anchor="middle" class="bk-chart__label">{{ d.label }}</text>
        </g>
      </template>
    </svg>
    <p v-if="b.note" class="bk-chart__note">{{ b.note }}</p>
  </figure>

  <!-- Practice -->
  <section v-else-if="b.type === 'practice'" class="bk-practice">
    <p class="t-mono bk-practice__kicker">Do this</p>
    <h4 class="bk-practice__title">{{ b.title }}</h4>
    <ol class="bk-practice__steps">
      <li v-for="(s, i) in b.steps" :key="i">{{ s }}</li>
    </ol>
    <p class="bk-practice__out"><b>You should end up with:</b> {{ b.output }}</p>
  </section>

  <!-- Resources -->
  <section v-else-if="b.type === 'resource'" class="bk-res">
    <p class="t-mono bk-res__kicker">{{ b.title || 'Go further' }}</p>
    <ul>
      <li v-for="r in resources" :key="r.id">
        <a :href="r.url" target="_blank" rel="noopener noreferrer">{{ r.title }} ↗</a>
        <p class="bk-res__purpose">{{ r.purpose }}</p>
        <p class="t-mono bk-res__meta">
          {{ r.kind }} · {{ r.minutes }} min · {{ r.level }}<template v-if="r.optional"> · optional</template>
          <template v-if="r.access !== 'open'"> · {{ r.access === 'account' ? 'free account needed' : 'partly paywalled' }}</template>
        </p>
      </li>
    </ul>
  </section>

  <!-- Delegated -->
  <CourseVideo v-else-if="b.type === 'video'" :id="b.videoId" />
  <CourseCheck v-else-if="b.type === 'check'" :questions="b.questions" :title="b.title" @answered="emit('answered', $event)" />
  <CourseHotspot v-else-if="b.type === 'hotspot'" :diagram="b.diagram" :caption="b.caption" :points="b.points" />
  <CourseDescent v-else-if="b.type === 'descent'" />
  <CourseInteractions v-else :block="b" :block-key="blockKey" />
</template>

<style scoped>
/* ── Prose ── */
.bk-text { margin: 0 0 clamp(18rem, 2.2vw, 26rem); }
.bk-text p {
  font-family: var(--font-reading);
  font-size: clamp(16.5rem, 1.35vw, 18.5rem);
  line-height: 1.72;
  max-width: var(--measure-body);
  margin: 0 0 1em;
}
.bk-text p:last-child { margin-bottom: 0; }
.bk-text.is-lead p:first-child { font-size: clamp(18rem, 1.6vw, 21rem); line-height: 1.6; }

.bk-heading {
  font-size: var(--type-h2); margin: clamp(30rem, 4vw, 46rem) 0 14rem;
  font-family: var(--font-display); font-weight: 400; letter-spacing: var(--tracking-display);
}

.bk-quote {
  margin: clamp(22rem, 3vw, 32rem) 0; padding: clamp(18rem, 2.2vw, 24rem) clamp(18rem, 2.2vw, 24rem) clamp(18rem, 2.2vw, 24rem) 22rem;
  border-left: 5rem solid var(--yellow);
  background: var(--co-surface, var(--paper)); border-radius: 0 var(--radius-m) var(--radius-m) 0;
  box-shadow: var(--co-shadow, none);
}
.bk-quote blockquote {
  margin: 0; font-family: var(--font-reading); font-style: italic;
  font-size: clamp(18rem, 1.8vw, 22rem); line-height: 1.5; max-width: 56ch;
}
.bk-quote figcaption { margin-top: 12rem; display: grid; gap: 4rem; }
.bk-quote__who { font-size: 14rem; font-weight: 600; }
.bk-quote__src { font-size: 12.5rem; color: var(--muted); line-height: 1.5; }

.bk-take {
  margin: clamp(22rem, 3vw, 32rem) 0; padding: clamp(18rem, 2.2vw, 24rem);
  background: var(--yellow); color: var(--on-yellow);
  border: none; border-radius: var(--radius-l);
  box-shadow: var(--co-shadow, none);
}
.bk-take__kicker { margin: 0 0 10rem; opacity: 0.7; }
.bk-take__body { margin: 0; font-size: clamp(16.5rem, 1.5vw, 19rem); line-height: 1.55; font-weight: 500; max-width: 62ch; }

/* ── Evidence ── */
.bk-ev {
  margin: clamp(20rem, 2.6vw, 30rem) 0; padding: clamp(16rem, 2vw, 22rem);
  border: none; border-left: 6rem solid var(--ev);
  border-radius: 0 var(--radius-m) var(--radius-m) 0; background: var(--co-surface, var(--paper));
  box-shadow: var(--co-shadow, none);
  --ev: var(--muted);
}
.bk-ev.is-high { --ev: var(--green); }
.bk-ev.is-medium { --ev: var(--blue); }
.bk-ev.is-low { --ev: var(--cyan); }
.bk-ev.is-speculative { --ev: var(--purple); }
.bk-ev__level { display: flex; align-items: center; gap: 8rem; margin: 0 0 10rem; color: var(--muted); }
.bk-ev__dot { width: 9rem; height: 9rem; border-radius: 50%; background: var(--ev); border: 1px solid var(--ink); }
.bk-ev__claim { margin: 0 0 10rem; font-size: 16rem; line-height: 1.5; font-weight: 700; max-width: 62ch; }
.bk-ev__basis { margin: 0; font-size: 14.5rem; line-height: 1.6; color: var(--muted); max-width: 68ch; }
.bk-ev__basis b { color: var(--ink); }
.bk-ev__scale { margin: 12rem 0 0; color: var(--muted); opacity: 0.8; font-size: 10.5rem; }
.bk-ev__src { display: inline-block; margin-top: 10rem; font-size: 13.5rem; color: var(--blue); text-decoration: underline; text-underline-offset: 3px; }

/* ── Timeline ── */
.bk-time { list-style: none; margin: clamp(20rem, 2.6vw, 30rem) 0; padding: 0; }
.bk-time li {
  display: grid; grid-template-columns: 96rem minmax(0, 1fr); gap: 18rem;
  padding: 16rem 0; border-top: var(--stroke) solid var(--line);
}
.bk-time li:last-child { border-bottom: var(--stroke) solid var(--line); }
.bk-time__year { margin: 0; color: var(--muted); padding-top: 3rem; }
.bk-time__label { margin: 0 0 5rem; font-size: 16rem; font-weight: 700; }
.bk-time__body { margin: 0; font-size: 14.5rem; line-height: 1.6; color: var(--muted); max-width: 66ch; }
@media (max-width: 560px) { .bk-time li { grid-template-columns: minmax(0, 1fr); gap: 6rem; } }

/* ── Compare ── */
.bk-compare { margin: clamp(20rem, 2.6vw, 30rem) 0; }
.bk-compare figcaption { margin-bottom: 12rem; color: var(--muted); }
.bk-compare__scroll { overflow-x: auto; border: none; border-radius: var(--radius-m); box-shadow: var(--co-shadow, none); }
.bk-compare table { border-collapse: collapse; width: 100%; min-width: 460rem; }
.bk-compare th, .bk-compare td {
  text-align: left; padding: 12rem 14rem; font-size: 14.5rem; line-height: 1.5;
  border-bottom: var(--stroke) solid var(--line);
  vertical-align: top;
}
.bk-compare th {
  background: var(--blue); color: #fff;
  font-family: var(--font-mono); font-size: var(--type-meta);
  letter-spacing: var(--tracking-meta); text-transform: uppercase;
}
.bk-compare td.is-head { font-weight: 700; background: var(--paper-2); }
.bk-compare tr:last-child td { border-bottom: 0; }

/* ── Labeled ── */
.bk-labeled { margin: clamp(20rem, 2.6vw, 30rem) 0; border: none; border-radius: var(--radius-l); overflow: hidden; background: var(--co-surface, var(--paper)); box-shadow: var(--co-shadow, none); }
.bk-labeled figcaption { padding: 14rem 18rem; background: var(--blue); color: #fff; font-family: var(--font-mono); font-size: var(--type-meta); letter-spacing: var(--tracking-meta); text-transform: uppercase; }
.bk-labeled dl { margin: 0; }
.bk-labeled dl > div { padding: 15rem 18rem; border-bottom: var(--stroke) solid var(--line); }
.bk-labeled dl > div:last-child { border-bottom: 0; }
.bk-labeled dt { display: flex; align-items: baseline; gap: 12rem; font-size: 16rem; font-weight: 700; margin-bottom: 6rem; }
.bk-labeled__n { font-family: var(--font-mono); font-size: 11rem; color: var(--muted); }
.bk-labeled dd { margin: 0 0 0 34rem; font-size: 14.5rem; line-height: 1.6; color: var(--muted); max-width: 66ch; }

/* ── Process ── */
.bk-proc { margin: clamp(20rem, 2.6vw, 30rem) 0; }
.bk-proc figcaption { margin-bottom: 12rem; color: var(--muted); }
.bk-proc ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 4rem; }
.bk-proc li { display: grid; grid-template-columns: 40rem minmax(0, 1fr); gap: 16rem; padding: 14rem 0; border-top: var(--stroke) solid var(--line); }
.bk-proc li:last-child { border-bottom: var(--stroke) solid var(--line); }
.bk-proc__n {
  display: flex; align-items: center; justify-content: center; margin-top: 2rem;
  width: 34rem; height: 34rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m);
  color: var(--muted);
}
.bk-proc__label { margin: 0 0 5rem; font-size: 16rem; font-weight: 700; }
.bk-proc__body { margin: 0; font-size: 14.5rem; line-height: 1.6; color: var(--muted); max-width: 66ch; }
@media (max-width: 560px) { .bk-proc li { grid-template-columns: minmax(0, 1fr); gap: 8rem; } .bk-proc__n { width: 26rem; height: 26rem; } }

/* ── Chart ── */
.bk-chart { margin: clamp(20rem, 2.6vw, 30rem) 0; }
.bk-chart figcaption { margin-bottom: 12rem; color: var(--muted); }
.bk-chart__svg { display: block; width: 100%; height: auto; border: none; border-radius: var(--radius-m); background: var(--co-surface, var(--paper)); box-shadow: var(--co-shadow, none); }
.bk-chart__axis { stroke: var(--line); stroke-width: 1.5; }
.bk-chart__bar { fill: var(--blue); }
.bk-chart__line { stroke: var(--blue); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.bk-chart__dot { fill: var(--paper); stroke: var(--blue); stroke-width: 3; }
.bk-chart__val { font-family: var(--font-mono); font-size: 13px; fill: var(--ink); font-weight: 600; }
.bk-chart__label { font-family: var(--font-mono); font-size: 11px; fill: var(--muted); letter-spacing: 0.02em; }
.bk-chart__note { margin: 10rem 0 0; font-size: 13.5rem; line-height: 1.55; color: var(--muted); max-width: 66ch; }

/* ── Practice ── */
.bk-practice {
  margin: clamp(22rem, 3vw, 32rem) 0; padding: clamp(18rem, 2.4vw, 26rem);
  border: none; border-radius: var(--radius-l);
  background: var(--co-surface, var(--paper)); box-shadow: var(--co-shadow, none);
}
.bk-practice__kicker { margin: 0 0 8rem; color: var(--muted); }
.bk-practice__title { margin: 0 0 14rem; font-size: clamp(18rem, 1.8vw, 22rem); }
.bk-practice__steps { margin: 0 0 16rem; padding-left: 20rem; display: grid; gap: 9rem; }
.bk-practice__steps li { font-size: 15rem; line-height: 1.55; }
.bk-practice__out { margin: 0; padding-top: 14rem; border-top: var(--stroke) solid var(--line); font-size: 14.5rem; line-height: 1.6; color: var(--muted); }
.bk-practice__out b { color: var(--ink); }

/* ── Resources ── */
.bk-res { margin: clamp(20rem, 2.6vw, 30rem) 0; padding: clamp(16rem, 2vw, 22rem); background: var(--co-surface, var(--paper)); border: none; border-radius: var(--radius-m); box-shadow: var(--co-shadow, none); }
.bk-res__kicker { margin: 0 0 12rem; color: var(--muted); }
.bk-res ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 14rem; }
.bk-res a { font-size: 15.5rem; font-weight: 700; color: var(--blue); text-decoration: underline; text-underline-offset: 3px; }
.bk-res__purpose { margin: 5rem 0 4rem; font-size: 14rem; line-height: 1.55; color: var(--muted); max-width: 66ch; }
.bk-res__meta { margin: 0; color: var(--muted); opacity: 0.85; }
</style>
