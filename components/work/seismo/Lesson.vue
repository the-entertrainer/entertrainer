<script setup lang="ts">
import Seismogram from './Seismogram.vue'
import { P_ARRIVAL_S, TRACE_WINDOW_S } from '~/utils/seismo/model'

const store = useSeismoStore()
const emit = defineEmits<{ back: []; continue: [] }>()

// Segment 1 interaction: two real, focusable candidate marks sit on the
// trace. The learner predicts which is the first arrival before anything is
// labelled. Works by pointer or keyboard (both marks are buttons).
const P_T = P_ARRIVAL_S
const S_T = 30
const picked = ref<'none' | 'p' | 's'>('none')
const solved = computed(() => picked.value === 'p')

function pick(which: 'p' | 's') {
  picked.value = which
}
const feedback = computed(() => {
  if (picked.value === 'p') return 'Correct. That first, sharper jump is the P wave, the faster of the two.'
  if (picked.value === 's') return 'That larger arrival comes later. It is the S wave. Try the earlier mark for the first arrival.'
  return ''
})

function pct(t: number) { return (t / TRACE_WINDOW_S) * 100 }

onMounted(() => {
  // Reaching the lesson and scrolling through it counts as complete; the
  // interaction is the teaching, not a gate.
  store.markLessonComplete()
})
</script>

<template>
  <section class="sg-screen sg-lesson">
    <button type="button" class="sg-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Station log
    </button>
    <p class="sg-eyebrow">Lesson</p>
    <h2 class="sg-h2 sg-lesson__title">Read the waves, then read the gap</h2>

    <!-- Segment 1: two waves, predict the first arrival -->
    <article class="sg-seg">
      <div class="sg-seg__num">01</div>
      <div class="sg-seg__body">
        <h3 class="sg-seg__h">Two waves leave together</h3>
        <p class="sg-body">
          Every earthquake sends out a P wave and an S wave at the same instant. The P wave
          travels faster, so it always reaches a station first. On the trace below, one of the
          two marks is that first arrival.
        </p>

        <figure class="sg-seg__trace">
          <div class="sg-seg__label" role="status">
            {{ solved ? 'P wave, then S wave.' : picked === 's' ? 'Not the first arrival.' : 'Select the first arrival' }}
          </div>
          <div class="sg-seg__plot">
            <Seismogram :seed="731" :window-s="TRACE_WINDOW_S" :p-arrival-s="P_T" :s-arrival-s="S_T" :height="170" :show-p="solved" :show-s="solved" />
            <button
              type="button"
              class="sg-pick sg-pick--p"
              :class="{ 'is-right': solved, 'is-picked': picked === 'p' }"
              :style="{ left: pct(P_T) + '%' }"
              :aria-pressed="picked === 'p'"
              aria-label="Select the earlier arrival"
              @click="pick('p')"
            >
              <span v-if="solved" class="sg-pick__tag">P</span>
            </button>
            <button
              type="button"
              class="sg-pick sg-pick--s"
              :class="{ 'is-right': solved, 'is-picked': picked === 's' }"
              :style="{ left: pct(S_T) + '%' }"
              :aria-pressed="picked === 's'"
              aria-label="Select the later, larger arrival"
              @click="pick('s')"
            >
              <span v-if="solved" class="sg-pick__tag sg-pick__tag--s">S</span>
            </button>
          </div>
          <figcaption v-if="feedback" class="sg-seg__fb" :class="{ 'is-ok': solved }">{{ feedback }}</figcaption>
        </figure>
      </div>
    </article>

    <!-- Segment 2: the gap grows with distance -->
    <article class="sg-seg">
      <div class="sg-seg__num">02</div>
      <div class="sg-seg__body">
        <h3 class="sg-seg__h">The gap grows with distance</h3>
        <p class="sg-body">
          Because the P wave is faster, it pulls further ahead of the S wave the longer they
          travel. So the gap between the two arrivals is small at a nearby station and wide at a
          far one. Compare these two records of the same quake.
        </p>
        <div class="sg-compare">
          <figure class="sg-compare__item">
            <figcaption><span>Near station</span><span class="sg-compare__val">S−P ≈ 12 s</span></figcaption>
            <Seismogram :seed="204" :window-s="TRACE_WINDOW_S" :p-arrival-s="9" :s-arrival-s="21" :height="96" show-p show-s />
          </figure>
          <figure class="sg-compare__item">
            <figcaption><span>Far station</span><span class="sg-compare__val">S−P ≈ 38 s</span></figcaption>
            <Seismogram :seed="907" :window-s="TRACE_WINDOW_S" :p-arrival-s="9" :s-arrival-s="47" :height="96" show-p show-s />
          </figure>
        </div>
      </div>
    </article>

    <!-- Segment 3: gap to distance -->
    <article class="sg-seg">
      <div class="sg-seg__num">03</div>
      <div class="sg-seg__body">
        <h3 class="sg-seg__h">Turn the gap into a distance</h3>
        <p class="sg-body">
          For this region, a simple rule of thumb converts the gap into kilometres: multiply the
          S-minus-P time by about eight.
        </p>
        <div class="sg-eqn">
          <span class="sg-eqn__term"><b>S−P gap</b><small>seconds</small></span>
          <span class="sg-eqn__op">×</span>
          <span class="sg-eqn__term"><b>8</b><small>km / s</small></span>
          <span class="sg-eqn__op">=</span>
          <span class="sg-eqn__term sg-eqn__term--out"><b>distance</b><small>km</small></span>
        </div>
        <p class="sg-note sg-eqn__ex">Worked example: a 30-second gap gives 30 × 8 = 240 km from the station.</p>
      </div>
    </article>

    <!-- Segment 4: one circle, then three -->
    <article class="sg-seg">
      <div class="sg-seg__num">04</div>
      <div class="sg-seg__body">
        <h3 class="sg-seg__h">One distance is a circle. Three cross at a point.</h3>
        <p class="sg-body">
          A distance alone does not say which direction the quake was, only how far. So one
          station places the epicentre somewhere on a circle around it. Add a second circle and
          they meet at two points. A third circle picks the single point. That crossing is the
          epicentre, and finding it is your task next.
        </p>
        <figure class="sg-circles">
          <svg viewBox="0 0 320 200" width="100%" role="img" aria-label="Three circles from three stations crossing at one point.">
            <circle cx="120" cy="80" r="78" class="sg-circles__c" />
            <circle cx="210" cy="95" r="70" class="sg-circles__c" />
            <circle cx="165" cy="150" r="64" class="sg-circles__c" />
            <g class="sg-circles__stn"><path d="M120 74l6 10h-12z" /><path d="M210 89l6 10h-12z" /><path d="M165 144l6 10h-12z" /></g>
            <path d="M162 92l6 6" class="sg-circles__x" />
            <circle cx="165" cy="95" r="4.5" class="sg-circles__epi" />
          </svg>
        </figure>
      </div>
    </article>

    <div class="sg-lesson__actions">
      <button type="button" class="sg-btn sg-btn--primary" @click="emit('continue')">
        Locate one yourself
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.sg-lesson__title { max-width: 20ch; margin-bottom: 12rem; }
.sg-seg {
  display: grid;
  grid-template-columns: 44rem 1fr;
  gap: 12rem;
  padding: 34rem 0;
  border-top: 1px solid var(--sg-line);
}
.sg-seg:first-of-type { border-top: none; }
.sg-seg__num { font-family: var(--sg-mono); font-size: 14rem; color: var(--sg-s); padding-top: 4rem; }
.sg-seg__h { font-family: var(--sg-display); font-size: 21rem; font-weight: 600; color: var(--sg-ink); margin-bottom: 12rem; }
.sg-body { max-width: 60ch; margin-bottom: 4rem; }

.sg-seg__trace { margin: 20rem 0 0; }
.sg-seg__label { font-family: var(--sg-mono); font-size: 12rem; color: var(--sg-muted-strong); margin-bottom: 8rem; }
.sg-seg__plot { position: relative; }
.sg-pick {
  position: absolute;
  top: 0;
  width: 34rem;
  height: 100%;
  transform: translateX(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
}
.sg-pick::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 6rem;
  bottom: 6rem;
  width: 2px;
  transform: translateX(-50%);
  background: var(--sg-muted);
  opacity: 0.5;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.sg-pick::after {
  content: "";
  position: absolute;
  left: 50%;
  top: -6rem;
  width: 11rem;
  height: 11rem;
  border-radius: 50%;
  transform: translateX(-50%);
  background: var(--sg-panel);
  border: 2px solid var(--sg-muted);
  transition: border-color 0.15s ease, background 0.15s ease;
}
@media (hover: hover) { .sg-pick:hover::before { opacity: 0.9; } .sg-pick:hover::after { border-color: var(--sg-ink); } }
.sg-pick:focus-visible { outline: 2px solid var(--sg-ink); outline-offset: 2px; border-radius: 4rem; }
.sg-pick.is-picked::after { border-color: var(--sg-ink); background: var(--sg-ink); }
.sg-pick--p.is-right::before { background: var(--sg-p); opacity: 1; }
.sg-pick--p.is-right::after { border-color: var(--sg-p); background: var(--sg-p); }
.sg-pick--s.is-right::before { background: var(--sg-s); opacity: 1; }
.sg-pick--s.is-right::after { border-color: var(--sg-s); background: var(--sg-s); }
.sg-pick__tag {
  position: absolute;
  left: 50%;
  top: -24rem;
  transform: translateX(-50%);
  font-family: var(--sg-mono);
  font-size: 12rem;
  font-weight: 600;
  color: var(--sg-p);
}
.sg-pick__tag--s { color: var(--sg-s); }
.sg-seg__fb { margin-top: 12rem; font-size: 13.5rem; line-height: 1.5; color: var(--sg-muted-strong); }
.sg-seg__fb.is-ok { color: var(--sg-p); }

.sg-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16rem; margin-top: 20rem; }
.sg-compare__item { margin: 0; }
.sg-compare__item figcaption {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: var(--sg-mono); font-size: 12rem; color: var(--sg-muted-strong); margin-bottom: 6rem;
}
.sg-compare__val { color: var(--sg-s); }

.sg-eqn {
  display: flex; align-items: stretch; gap: 12rem; flex-wrap: wrap;
  margin: 20rem 0 12rem;
}
.sg-eqn__term {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 14rem 22rem; border-radius: 10rem;
  background: var(--sg-panel); border: 1.5px solid var(--sg-line);
}
.sg-eqn__term b { font-family: var(--sg-display); font-size: 20rem; color: var(--sg-ink); }
.sg-eqn__term small { font-family: var(--sg-mono); font-size: 11rem; color: var(--sg-muted-strong); margin-top: 2rem; }
.sg-eqn__term--out { border-color: var(--sg-p); }
.sg-eqn__term--out b { color: var(--sg-p); }
.sg-eqn__op { display: flex; align-items: center; font-family: var(--sg-display); font-size: 20rem; color: var(--sg-muted); }
.sg-eqn__ex { max-width: 60ch; }

.sg-circles { margin: 20rem 0 0; max-width: 360rem; }
.sg-circles__c { fill: none; stroke: var(--sg-line); stroke-width: 1.5; }
.sg-circles__stn path { fill: var(--sg-ink); }
.sg-circles__x { stroke: var(--sg-epi); stroke-width: 2; stroke-linecap: round; }
.sg-circles__epi { fill: none; stroke: var(--sg-epi); stroke-width: 2; }

.sg-lesson__actions { margin-top: 20rem; padding-top: 30rem; border-top: 1px solid var(--sg-line); }

@media (max-width: 640px) {
  .sg-seg { grid-template-columns: 1fr; gap: 4rem; }
  .sg-seg__num { padding-top: 0; }
  .sg-compare { grid-template-columns: 1fr; }
}
</style>
