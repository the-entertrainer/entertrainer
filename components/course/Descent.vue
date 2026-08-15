<script setup lang="ts">
/**
 * Descent — the one flagship interactive in the course, in m06l3.
 *
 * The lesson's own prose calls learning "descending a slope in a space of
 * billions of dimensions" and then just links out to an external tool. This
 * replaces that gap with one small, honest mechanic: try it yourself first,
 * then watch what the algorithm actually does, on the same ground.
 *
 * Deliberately not built: a learning-rate slider, multiple runs shown side by
 * side, anything configurable. One hill, one human guess, two walks. The
 * contrast that teaches the lesson doesn't need more than that — a human
 * sees the whole shape at once and finds the bottom in one glance; a local
 * slope-follower never gets to see past its own feet, and can settle
 * somewhere real but wrong. No live physics either: the two walks are
 * authored waypoints on the drawn curve, not a computed simulation — this is
 * an illustration of the behaviour, not a physics engine, and says so.
 *
 * Beats are staged with the site's existing scroll-reveal utility (.u-reveal,
 * assets/css/main.css) rather than a click-through wizard, so the caption for
 * each step arrives as the reader's attention naturally moves down the page.
 */
type Pt = { x: number; y: number }

// The ground: one authored bezier through hand-placed anchors. Two dips —
// a shallow trap at x≈110 (y=155) and the true low point at x≈260 (y=185,
// the larger y is the deeper one, since SVG y grows downward).
const GROUND = 'M 0,90 C 20,75 40,55 60,60 C 85,67 95,120 110,155 C 125,185 145,140 160,100 ' +
  'C 178,78 188,68 200,70 C 230,74 245,140 260,185 C 278,215 300,150 320,110 C 345,95 375,80 400,75'
const TRUE_MIN: Pt = { x: 260, y: 185 }

// Walk A starts on the left shoulder and gets caught in the shallow trap.
const WALK_A: Pt[] = [
  { x: 60, y: 60 }, { x: 75, y: 90 }, { x: 90, y: 120 }, { x: 100, y: 142 }, { x: 110, y: 155 }
]
// Walk B starts on the far side of the middle ridge and finds the true minimum.
const WALK_B: Pt[] = [
  { x: 210, y: 71 }, { x: 225, y: 95 }, { x: 240, y: 130 }, { x: 250, y: 160 }, { x: 260, y: 185 }
]

const stage = ref<SVGSVGElement | null>(null)
const guess = ref<Pt | null>(null)

function onGuess(e: MouseEvent) {
  if (guess.value || !stage.value) return
  const pt = stage.value.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const loc = pt.matrixTransform(stage.value.getScreenCTM()!.inverse())
  guess.value = { x: Math.max(6, Math.min(394, loc.x)), y: Math.max(6, Math.min(219, loc.y)) }
}

const guessFeedback = computed(() => {
  if (!guess.value) return ''
  const near = Math.abs(guess.value.x - TRUE_MIN.x) < 55
  return near
    ? 'Close — you found it in about a second.'
    : 'Not exact, but you were looking at the whole shape, not just the ground under one foot.'
})

const reducedMotion = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const walkAStep = ref(-1)
const walkADone = ref(false)
const walkBStep = ref(-1)
const walkBDone = ref(false)

function playWalkA() {
  if (walkAStep.value >= 0) return
  if (reducedMotion) { walkAStep.value = WALK_A.length - 1; walkADone.value = true; return }
  walkAStep.value = 0
  const advance = () => {
    if (walkAStep.value < WALK_A.length - 1) setTimeout(() => { walkAStep.value++; advance() }, 550)
    else walkADone.value = true
  }
  advance()
}

function playWalkB() {
  if (walkBStep.value >= 0) return
  if (reducedMotion) { walkBStep.value = WALK_B.length - 1; walkBDone.value = true; return }
  walkBStep.value = 0
  const advance = () => {
    if (walkBStep.value < WALK_B.length - 1) setTimeout(() => { walkBStep.value++; advance() }, 550)
    else walkBDone.value = true
  }
  advance()
}
</script>

<template>
  <section class="ds">
    <p class="t-mono ds__kicker">Try it yourself</p>
    <p class="ds__prompt">Where's the lowest point on this ground? Tap it.</p>

    <div class="ds__stage" :class="{ 'is-answered': guess }">
      <svg ref="stage" viewBox="0 0 400 225" class="ds__svg" role="img"
           aria-label="A hilly ground with two low points. Tap to guess the lowest." @click="onGuess">
        <path :d="GROUND" fill="none" class="ds__ground" />

        <g v-if="guess">
          <circle :cx="guess.x" :cy="guess.y" r="7" class="ds__pin ds__pin--guess" />
          <circle :cx="TRUE_MIN.x" :cy="TRUE_MIN.y" r="7" class="ds__pin ds__pin--true" />
        </g>
        <circle v-if="walkAStep >= 0" :cx="WALK_A[walkAStep].x" :cy="WALK_A[walkAStep].y" r="7" class="ds__pin ds__pin--walk" />
        <circle v-if="walkBStep >= 0" :cx="WALK_B[walkBStep].x" :cy="WALK_B[walkBStep].y" r="7" class="ds__pin ds__pin--walk ds__pin--walkb" />
      </svg>
    </div>
    <p v-if="!guess" class="t-mono ds__hint">Tap anywhere on the ground above.</p>

    <template v-if="guess">
      <div class="u-reveal ds__beat">
        <p class="ds__line">{{ guessFeedback }} The dot on the right is the actual lowest point on this ground.</p>
      </div>

      <div class="u-reveal ds__beat">
        <p class="ds__line"><b>You could see the whole hill.</b> Gradient descent never can — it only ever
          feels the slope under its feet. Watch it start on the left and walk downhill, one step at a time.</p>
        <button v-if="walkAStep < 0" type="button" class="ticket ticket--sm" @click="playWalkA">Run it</button>
      </div>

      <div v-if="walkADone" class="u-reveal ds__beat">
        <p class="ds__line">It stopped there — a real dip, just not <i>the</i> dip. It has no way to know a
          deeper one exists further along; it was never shown the whole shape, only ever the ground right there.</p>
      </div>

      <div v-if="walkADone" class="u-reveal ds__beat">
        <p class="ds__line">Same ground. A different starting point, nothing else changed:</p>
        <button v-if="walkBStep < 0" type="button" class="ticket ticket--sm" @click="playWalkB">Run it</button>
      </div>

      <div v-if="walkBDone" class="u-reveal ds__beat">
        <p class="ds__line">This time it finds the real bottom. The algorithm didn't get smarter between the
          two runs — only where it happened to start changed.</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.ds { margin: clamp(24rem, 3.2vw, 36rem) 0; border: none; border-radius: var(--radius-l); padding: clamp(18rem, 2.4vw, 26rem); background: var(--co-surface, var(--paper)); box-shadow: var(--co-shadow, none); }
.ds__kicker { margin: 0 0 10rem; color: var(--muted); }
.ds__prompt { margin: 0 0 16rem; font-size: clamp(17rem, 1.6vw, 19.5rem); font-weight: 700; line-height: 1.4; }

.ds__stage {
  aspect-ratio: 400 / 225; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m);
  background: var(--paper-2); overflow: hidden; cursor: crosshair;
}
.ds__stage.is-answered { cursor: default; }
.ds__svg { display: block; width: 100%; height: 100%; }
.ds__ground { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }

.ds__pin { stroke: var(--ink); stroke-width: 2.5; transition: cx 480ms ease, cy 480ms ease; }
.ds__pin--guess { fill: var(--yellow); }
.ds__pin--true { fill: var(--green); }
.ds__pin--walk { fill: var(--blue); }
.ds__pin--walkb { fill: var(--purple); }

.ds__hint { margin: 10rem 0 0; color: var(--muted); }

.ds__beat { margin-top: clamp(16rem, 2.2vw, 22rem); padding-top: clamp(16rem, 2.2vw, 22rem); border-top: var(--stroke) solid var(--line); display: grid; gap: 12rem; justify-items: start; }
.ds__line { margin: 0; font-family: var(--font-reading); font-size: 15.5rem; line-height: 1.65; max-width: 62ch; }
.ds__line b { font-family: inherit; }

@media (prefers-reduced-motion: reduce) {
  .ds__pin { transition: none; }
}
</style>
