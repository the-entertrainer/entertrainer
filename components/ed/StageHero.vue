<script setup lang="ts">
/**
 * Elevate-DNA stage heroes — cream paper, ink, yellow accent vector art.
 * CSS/SVG animation only; respects prefers-reduced-motion.
 */
type StageVariant = 'ribbons' | 'orbits' | 'ripples' | 'lattice' | 'flow'

withDefaults(defineProps<{
  title?: string
  deck?: string
  eyebrow?: string
  variant?: StageVariant
  /** Heading element id for aria-labelledby */
  titleId?: string
}>(), {
  variant: 'ribbons',
  titleId: 'stage-title'
})
</script>

<template>
  <section
    class="stage"
    :class="`stage--${variant}`"
    :aria-labelledby="titleId"
  >
    <div class="stage__art" aria-hidden="true">
      <!-- ribbons: dashed Bézier roads drifting on cream -->
      <svg v-if="variant === 'ribbons'" class="stage__svg" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <g class="stage__ribbon stage__ribbon--a stage-cobalt" fill="none" stroke="currentColor" stroke-width="2.25" stroke-dasharray="10 8" stroke-linecap="round">
          <path d="M-40 90 C120 40, 220 160, 380 110 S620 40, 860 130" />
        </g>
        <g class="stage__ribbon stage__ribbon--b stage-ink" fill="none" stroke="currentColor" stroke-width="1.75" stroke-dasharray="6 10" stroke-linecap="round" opacity=".72">
          <path d="M-60 210 C80 280, 240 140, 400 220 S640 300, 860 180" />
        </g>
        <g class="stage__ribbon stage__ribbon--c stage-cobalt" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 9" stroke-linecap="round" opacity=".55">
          <path d="M-20 320 C160 260, 300 380, 480 300 S700 240, 860 340" />
        </g>
        <g class="stage__ribbon stage__ribbon--d stage-ink" fill="none" stroke="currentColor" stroke-width="1.25" stroke-dasharray="3 11" opacity=".35">
          <path d="M40 -10 C180 80, 260 -20, 420 60 S620 -30, 780 80" />
        </g>
        <circle class="stage__node stage-cobalt" cx="380" cy="110" r="5" fill="currentColor" />
        <circle class="stage__node stage__node--ink stage-ink" cx="400" cy="220" r="4" fill="currentColor" />
        <circle class="stage__node stage-cobalt" cx="480" cy="300" r="3.5" fill="currentColor" opacity=".7" />
      </svg>

      <!-- orbits: soft grain + cobalt orbital ellipses -->
      <svg v-else-if="variant === 'orbits'" class="stage__svg" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="stage-grain" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.09  0 0 0 0 0.1  0 0 0 0.06 0" />
          </filter>
        </defs>
        <rect class="stage__grain" width="800" height="420" filter="url(#stage-grain)" />
        <g transform="translate(520 210)">
          <g class="stage__orbit-spin stage__orbit-spin--slow stage-cobalt" fill="none" stroke="currentColor" stroke-width="1.35" opacity=".42">
            <ellipse cx="0" cy="0" rx="210" ry="128" />
          </g>
          <g class="stage__orbit-spin stage__orbit-spin--mid stage-cobalt" fill="none" stroke="currentColor" stroke-width="1.35" opacity=".58">
            <ellipse cx="0" cy="0" rx="150" ry="88" />
          </g>
          <g class="stage__orbit-spin stage__orbit-spin--fast stage-cobalt" fill="none" stroke="currentColor" stroke-width="1.35" opacity=".78">
            <ellipse cx="0" cy="0" rx="92" ry="52" />
          </g>
          <g class="stage__orbit-spin stage__orbit-spin--mid">
            <circle cx="150" cy="0" r="4" class="stage-cobalt" fill="currentColor" />
          </g>
          <g class="stage__orbit-spin stage__orbit-spin--fast stage__orbit-spin--rev">
            <circle cx="0" cy="-52" r="3.5" class="stage-cobalt" fill="currentColor" />
          </g>
          <g class="stage__orbit-spin stage__orbit-spin--slow">
            <circle cx="-105" cy="64" r="3" class="stage-cobalt" fill="currentColor" opacity=".85" />
          </g>
          <circle class="stage-ink" cx="0" cy="0" r="7" fill="currentColor" />
          <circle class="stage-cream-fill" cx="0" cy="0" r="3" fill="currentColor" />
        </g>
      </svg>

      <!-- ripples: expanding ink rings from cobalt focus -->
      <svg v-else-if="variant === 'ripples'" class="stage__svg" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <g class="stage-ink" transform="translate(280 220)" fill="none" stroke="currentColor" stroke-width="1.4">
          <circle class="stage__ripple stage__ripple--1" cx="0" cy="0" r="36" />
          <circle class="stage__ripple stage__ripple--2" cx="0" cy="0" r="72" />
          <circle class="stage__ripple stage__ripple--3" cx="0" cy="0" r="118" />
          <circle class="stage__ripple stage__ripple--4" cx="0" cy="0" r="172" />
          <circle class="stage__ripple stage__ripple--5" cx="0" cy="0" r="236" />
        </g>
        <circle cx="280" cy="220" r="9" class="stage-cobalt" fill="currentColor" />
        <circle class="stage__focus-halo stage-cobalt" cx="280" cy="220" r="18" fill="none" stroke="currentColor" stroke-width="1.5" />
      </svg>

      <!-- lattice: fine vector grid + one anomalous pulsing cobalt cell -->
      <svg v-else-if="variant === 'lattice'" class="stage__svg" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <g class="stage__lattice stage-ink" stroke="currentColor" stroke-width="0.75" fill="none" opacity=".22">
          <path v-for="i in 17" :key="`v${i}`" :d="`M${(i - 1) * 50} 0 V420`" />
          <path v-for="j in 9" :key="`h${j}`" :d="`M0 ${(j - 1) * 52.5} H800`" />
        </g>
        <rect class="stage__anomaly stage-cobalt" x="350" y="157.5" width="50" height="52.5" fill="currentColor" />
      </svg>

      <!-- flow: a few flowing cobalt/ink strokes -->
      <svg v-else class="stage__svg" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path class="stage__stroke stage__stroke--1 stage-cobalt" d="M-30 340 C120 280, 200 380, 360 300 S560 200, 820 260" stroke="currentColor" stroke-width="18" opacity=".18" />
          <path class="stage__stroke stage__stroke--2 stage-ink" d="M-40 180 C140 120, 260 240, 420 160 S640 80, 860 140" stroke="currentColor" stroke-width="3.5" opacity=".55" />
          <path class="stage__stroke stage__stroke--3 stage-cobalt" d="M-20 100 C180 160, 300 40, 480 120 S700 200, 860 90" stroke="currentColor" stroke-width="2.25" opacity=".85" />
          <path class="stage__stroke stage__stroke--4 stage-ink" d="M60 400 C220 340, 340 420, 520 360 S720 300, 800 340" stroke="currentColor" stroke-width="1.5" opacity=".35" />
        </g>
        <circle class="stage__flow-dot stage-cobalt" cx="420" cy="160" r="4.5" fill="currentColor" />
      </svg>
    </div>

    <div class="stage__copy">
      <p v-if="eyebrow" class="stage__eyebrow">{{ eyebrow }}</p>
      <slot name="title">
        <h1 :id="titleId">{{ title }}</h1>
      </slot>
      <slot name="deck">
        <p v-if="deck" class="stage__deck">{{ deck }}</p>
      </slot>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.stage {
  --stage-cream: #F7F1E4;
  --stage-ink: #161618;
  --stage-cobalt: var(--cobalt, #FFD43B);
  position: relative;
  display: grid;
  min-height: min(420rem, calc(100dvh - 320rem));
  align-content: center;
  justify-items: start;
  overflow: hidden;
  padding: clamp(34rem, 7vw, 96rem);
  color: var(--stage-ink);
  background: var(--stage-cream);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l);
}

[data-theme="dark"] .stage {
  --stage-cream: #14131A;
  --stage-ink: #F2F2F4;
  color: var(--stage-ink);
}

.stage__art {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .9;
  /* Keep title zone readable — fade art under left/bottom copy */
  mask-image:
    linear-gradient(105deg, transparent 0%, #000 28%, #000 100%),
    linear-gradient(180deg, #000 0%, #000 62%, transparent 100%);
  -webkit-mask-image:
    linear-gradient(105deg, transparent 0%, #000 28%, #000 100%),
    linear-gradient(180deg, #000 0%, #000 62%, transparent 100%);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
}

.stage__svg {
  display: block;
  width: 100%;
  height: 100%;
}
.stage-ink { color: var(--stage-ink); }
.stage-cream-fill { color: var(--stage-cream); }
.stage-cobalt { color: var(--stage-cobalt); }

.stage__copy {
  position: relative;
  z-index: 1;
  max-width: 800rem;
}

.stage__eyebrow {
  margin: 0;
  font: 700 12rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--stage-cobalt);
}

.stage__copy :deep(h1),
.stage__copy > h1 {
  max-width: 800rem;
  margin: 12rem 0 18rem;
  font: 500 clamp(65rem, 12vw, 180rem)/.82 var(--font-display);
  letter-spacing: -.08em;
  color: var(--ink);
}

.stage:not(:has(.stage__eyebrow)) .stage__copy :deep(h1),
.stage:not(:has(.stage__eyebrow)) .stage__copy > h1 {
  margin-top: 0;
}

.stage__deck,
.stage__copy :deep(.stage__deck) {
  max-width: 480rem;
  margin: 0;
  font-size: 20rem;
  line-height: 1.4;
  color: var(--ink);
}

/* —— ribbons —— */
.stage__ribbon--a { animation: stage-drift-a 28s linear infinite; }
.stage__ribbon--b { animation: stage-drift-b 36s linear infinite; }
.stage__ribbon--c { animation: stage-drift-c 32s linear infinite reverse; }
.stage__ribbon--d { animation: stage-drift-a 40s linear infinite reverse; }
.stage__node { animation: stage-node-pulse 4.8s ease-in-out infinite; }
.stage__node--ink { animation-delay: 1.2s; }

@keyframes stage-drift-a {
  from { transform: translate3d(-2%, 0, 0); }
  to { transform: translate3d(3%, 1.5%, 0); }
}
@keyframes stage-drift-b {
  from { transform: translate3d(2%, -1%, 0); }
  to { transform: translate3d(-3%, 1%, 0); }
}
@keyframes stage-drift-c {
  from { transform: translate3d(-1.5%, 1%, 0); }
  to { transform: translate3d(2.5%, -1%, 0); }
}
@keyframes stage-node-pulse {
  0%, 100% { opacity: .75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

/* —— orbits —— */
.stage__orbit-spin--slow { animation: stage-spin 48s linear infinite; }
.stage__orbit-spin--mid { animation: stage-spin 32s linear infinite; }
.stage__orbit-spin--fast { animation: stage-spin 22s linear infinite; }
.stage__orbit-spin--rev { animation-direction: reverse; }

@keyframes stage-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* —— ripples —— */
.stage__ripple { animation: stage-ripple 6.5s ease-out infinite; transform-origin: center; transform-box: fill-box; }
.stage__ripple--1 { animation-delay: 0s; }
.stage__ripple--2 { animation-delay: .7s; }
.stage__ripple--3 { animation-delay: 1.4s; }
.stage__ripple--4 { animation-delay: 2.1s; }
.stage__ripple--5 { animation-delay: 2.8s; }
.stage__focus-halo {
  transform-origin: 280px 220px;
  animation: stage-halo 3.2s ease-in-out infinite;
}

@keyframes stage-ripple {
  0% { transform: scale(0.55); opacity: .5; }
  70% { opacity: .1; }
  100% { transform: scale(1.4); opacity: 0; }
}
@keyframes stage-halo {
  0%, 100% { transform: scale(1); opacity: .45; }
  50% { transform: scale(1.4); opacity: .12; }
}

/* —— lattice —— */
.stage__anomaly { animation: stage-anomaly 2.8s ease-in-out infinite; }

@keyframes stage-anomaly {
  0%, 100% { opacity: .5; }
  50% { opacity: 1; }
}

/* —— flow —— */
.stage__stroke--1 { animation: stage-flow-a 24s ease-in-out infinite alternate; }
.stage__stroke--2 { animation: stage-flow-b 30s ease-in-out infinite alternate; }
.stage__stroke--3 { animation: stage-flow-a 18s ease-in-out infinite alternate-reverse; }
.stage__stroke--4 { animation: stage-flow-b 22s ease-in-out infinite alternate-reverse; }
.stage__flow-dot { animation: stage-node-pulse 3.6s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }

@keyframes stage-flow-a {
  from { transform: translate3d(-1.5%, 0.5%, 0); }
  to { transform: translate3d(2%, -1%, 0); }
}
@keyframes stage-flow-b {
  from { transform: translate3d(1%, -0.5%, 0); }
  to { transform: translate3d(-2%, 1%, 0); }
}

/* Compact stage for section pages that already have page chrome */
.stage--compact {
  min-height: min(280rem, 42vw);
  margin-bottom: clamp(28rem, 4vw, 48rem);
}

@media (max-width: 640px) {
  .stage {
    min-height: min(340rem, calc(100dvh - 280rem));
    padding: clamp(28rem, 6vw, 48rem);
  }
  .stage__art { opacity: .72; }
  .stage__deck { font-size: 17rem; max-width: 36ch; }
}

@media (prefers-reduced-motion: reduce) {
  .stage__ribbon,
  .stage__node,
  .stage__orbit-spin,
  .stage__ripple,
  .stage__focus-halo,
  .stage__anomaly,
  .stage__stroke,
  .stage__flow-dot {
    animation: none !important;
  }
}
:global(html[data-reduce-motion="on"]) .stage__ribbon,
:global(html[data-reduce-motion="on"]) .stage__node,
:global(html[data-reduce-motion="on"]) .stage__orbit-spin,
:global(html[data-reduce-motion="on"]) .stage__ripple,
:global(html[data-reduce-motion="on"]) .stage__focus-halo,
:global(html[data-reduce-motion="on"]) .stage__anomaly,
:global(html[data-reduce-motion="on"]) .stage__stroke,
:global(html[data-reduce-motion="on"]) .stage__flow-dot {
  animation: none !important;
}
</style>
