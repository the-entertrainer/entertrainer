<script setup lang="ts">
/**
 * The site's front door.
 *
 * The old Loader.vue lived inside SpiralView, which no route mounts any more —
 * so until now the site had no preloader at all: you got the SPA splash, then
 * a bare stage popping in unannounced the moment WebGL happened to finish.
 * This is a real one, owned by app.vue, and it works on every route.
 *
 * What it waits for, in order of who finishes last:
 *  - webfonts, so the wordmark never reflows mid-animation
 *  - the home stage's WebGL readiness (experienceStore.isReady), but ONLY on
 *    the home route — interior pages have no stage and must not wait for a
 *    signal that will never arrive
 *  - a hard ceiling, because none of the above is guaranteed on a bad network
 *    and a visitor stuck behind a spinner is worse than an early entrance
 *
 * Shown once per tab. A preloader is an introduction; playing it again on
 * every internal navigation would be an interruption.
 */
import { useExperienceStore } from '~/stores/experience'

/**
 * Two events, because the exit has two moments and the chrome belongs to the
 * first one. `lift` fires when the curtain starts moving — that is when the
 * site is visible and the menu should be fading up alongside it. `done` fires
 * only once the curtain has finished travelling, and is what unmounts this
 * component. Emitting a single event for both used to tear the component out
 * of the DOM on the same tick the leave transition began, so the curtain lift
 * was written, styled, and never once seen.
 */
const emit = defineEmits<{ (e: 'lift'): void; (e: 'done'): void }>()

const experienceStore = useExperienceStore()
const route = useRoute()

const progress = ref(0)     // 0..1, what the bar and counter render
const leaving = ref(false)
const gone = ref(false)

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

/** Ceiling on the whole intro. Nothing may hold the door shut longer than this. */
const MAX_WAIT = reduceMotion ? 600 : 4200
/** Floor, so a warm cache doesn't flash the mark for three frames and vanish. */
const MIN_SHOW = reduceMotion ? 0 : 900
/** Must match `.pl-leave-active`'s transform duration below. */
const CURTAIN = reduceMotion ? 220 : 640

const isHome = route.path === '/'

let raf = 0
let startedAt = 0
let settled = false          // every gate we're waiting on has reported in
let fontsDone = false
let stageDone = !isHome      // interior routes have no stage to wait for

const counter = computed(() => String(Math.round(progress.value * 100)).padStart(3, '0'))

/**
 * The progress bar is the tower.
 *
 * It was a single rule filling left to right, which is what every loading bar
 * on the internet does. The site's own object is a stack of four glass slabs —
 * one per section — so the wait is spent assembling that stack instead: four
 * rungs, filling bottom to top, and the thing you are waiting for turns out to
 * be the thing you were watching build.
 *
 * Each rung gets a quarter of the range, and reports its own fill so the last
 * one is still moving at 97% rather than every rung snapping full at once.
 */
const RUNGS = 4
const rungFill = computed(() =>
  Array.from({ length: RUNGS }, (_, i) => {
    const lo = i / RUNGS, hi = (i + 1) / RUNGS
    return Math.max(0, Math.min(1, (progress.value - lo) / (hi - lo)))
  }))

function checkSettled() {
  if (fontsDone && stageDone) settled = true
}

/**
 * The bar eases toward a ceiling that rises as gates report in, so it always
 * moves but never reaches 100% before the site is genuinely ready — the
 * dishonest pattern where a bar sits full while the page is still blank.
 */
function frame(t: number) {
  raf = requestAnimationFrame(frame)
  if (!startedAt) startedAt = t
  const elapsed = t - startedAt

  const ceiling = settled ? 1 : (fontsDone ? 0.82 : 0.55)
  // Time-based floor as well, so a stalled gate still shows life.
  const byTime = Math.min(0.92, elapsed / MAX_WAIT)
  const goal = Math.max(Math.min(ceiling, byTime), settled ? 1 : 0)

  progress.value += (goal - progress.value) * 0.085
  if (goal === 1 && progress.value > 0.995) progress.value = 1

  const ready = settled && progress.value === 1 && elapsed >= MIN_SHOW
  const timedOut = elapsed >= MAX_WAIT
  if (!leaving.value && (ready || timedOut)) exit()
}

function exit() {
  if (leaving.value) return
  leaving.value = true
  progress.value = 1
  experienceStore.setHasEntered()
  // The lockup leaves first, alone, so the curtain isn't lifting away from a
  // wordmark that is still sitting on it.
  const hold = reduceMotion ? 160 : 620
  setTimeout(() => {
    cancelAnimationFrame(raf)
    gone.value = true      // starts the curtain's leave transition
    emit('lift')           // the site is visible now — bring the chrome up with it
    // Unmount only after the curtain has finished travelling, so the fixed
    // overlay can never intercept a pointer event on its way out.
    setTimeout(() => emit('done'), CURTAIN)
  }, hold)
}

onMounted(async () => {
  // Never block on fonts — a Google Fonts outage must not gate the site.
  const fontsReady = (document as any).fonts?.ready
  Promise.race([
    fontsReady ?? Promise.resolve(),
    new Promise(r => setTimeout(r, 1500))
  ]).catch(() => {}).finally(() => { fontsDone = true; checkSettled() })

  if (isHome) {
    if (experienceStore.isReady) { stageDone = true }
    else {
      const stop = watch(() => experienceStore.isReady, v => {
        if (v) { stageDone = true; checkSettled(); stop() }
      })
      // The stage may never report — a WebGL failure, a blocked context. The
      // MAX_WAIT ceiling in frame() is the real backstop, but release the gate
      // a little earlier so the exit animation still gets to play in full.
      setTimeout(() => { stageDone = true; checkSettled(); stop() }, MAX_WAIT - 900)
    }
  }
  checkSettled()
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <Transition name="pl">
    <div
      v-if="!gone"
      class="pl"
      :class="{ 'pl--leaving': leaving }"
      role="status"
      aria-live="polite"
      :aria-label="`Loading, ${counter} percent`"
    >
      <div class="pl__center">
        <p class="pl__mark"><em>enter</em><b>trainer</b></p>

        <div class="pl__ladder" aria-hidden="true">
          <span
            v-for="(f, i) in rungFill" :key="i"
            class="pl__rung"
            :style="{ '--f': f, '--i': RUNGS - 1 - i }"
          ><i :style="{ transform: `scaleX(${f})` }" /></span>
        </div>

        <p class="pl__meta t-mono" aria-hidden="true">
          <span class="pl__role">Instructional design, built by hand</span>
          <span class="pl__count">{{ counter }}</span>
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pl {
  position: fixed;
  inset: 0;
  z-index: var(--z-loader);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  color: var(--color-text);
}

.pl__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22rem;
  padding: 0 24rem;
  /* The whole lockup leaves as one object, ahead of the curtain, so the exit
     reads as the page arriving rather than the loader merely disappearing. */
  transition: transform 620ms var(--ease-in), opacity 380ms ease-in;
}
.pl--leaving .pl__center {
  transform: translateY(-14rem) scale(1.04);
  opacity: 0;
}
/* On the way out the rungs fan apart before the lockup goes — the stack
   coming undone into the stage that replaces it. */
.pl--leaving .pl__rung {
  transform: translateX(calc(var(--i) * 10rem - 15rem)) scaleX(1.06);
  opacity: 0;
  transition:
    transform 520ms var(--ease-in),
    opacity 300ms ease-in;
  transition-delay: calc(var(--i) * 40ms);
}

.pl__mark {
  margin: 0;
  font-family: var(--display-font);
  font-size: clamp(22rem, 5.2vw, 34rem);
  letter-spacing: 0.01em;
  line-height: 1;
  /* Matches the SPA splash exactly, so the handoff is invisible. */
  animation: pl-mark-in 760ms var(--ease-out) both;
}
.pl__mark em { font-style: normal; font-weight: 400; opacity: 0.55; }
.pl__mark b { font-weight: 700; }

/* Four rungs, bottom to top, in the tower's own proportions — the topmost is
   the widest, the way the focused card is the largest on the home stage. */
.pl__ladder {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 7rem;
  animation: pl-fade-in-1 520ms var(--ease-out) 160ms both;
}
.pl__rung {
  display: block;
  /* --i counts from the bottom rung, so each one up is a touch wider. */
  width: calc(min(150rem, 34vw) + var(--i) * min(30rem, 4vw));
  height: 3rem;
  border-radius: 2rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-text) 13%, transparent);
}
.pl__rung i {
  display: block;
  width: 100%; height: 100%;
  background: var(--color-text);
  transform-origin: left center;
  transform: scaleX(0);
  /* No CSS transition: the rAF loop already eases the value, and a transition
     on top of an eased value lags behind the counter it is meant to match. */
  box-shadow: 0 0 12rem -2rem var(--glow-soft);
}

.pl__meta {
  display: flex;
  align-items: baseline;
  gap: 14rem;
  margin: 0;
  opacity: 0.45;
  animation: pl-fade-in 520ms var(--ease-out) 260ms both;
}
.pl__count { font-variant-numeric: tabular-nums; }
@media (max-width: 480px) {
  .pl__role { display: none; }
}

@keyframes pl-mark-in {
  from { opacity: 0; transform: translateY(14rem); filter: blur(6px); }
  to   { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes pl-fade-in {
  from { opacity: 0; }
  to   { opacity: 0.45; }
}
@keyframes pl-fade-in-1 { from { opacity: 0; } to { opacity: 1; } }

/* The curtain itself: lifts away after the lockup has already gone. It stops
   taking pointer events the instant it starts moving — the site underneath is
   already visible and live, and a departing overlay that still swallows the
   first click is the classic preloader bug. */
.pl-leave-active {
  pointer-events: none;
  transition: transform 620ms var(--ease-out), opacity 300ms ease 240ms;
}
.pl-leave-to { transform: translateY(-101%); opacity: 0.9; }

@media (prefers-reduced-motion: reduce) {
  .pl__center,
  .pl__mark,
  .pl__ladder,
  .pl__meta { animation: none !important; transition: opacity 160ms linear; }
  .pl--leaving .pl__rung { transform: none; transition: opacity 160ms linear; }
  .pl--leaving .pl__center { transform: none; }
  .pl-leave-active { transition: opacity 200ms linear; }
  .pl-leave-to { transform: none; opacity: 0; }
}
</style>
