<script setup lang="ts">
/**
 * Section opener. The picture is one figure from the compass:
 * seed, vesica, fruit, or Metatron's lines. Ink, one accent circle.
 */
import type { GeometryFigure } from '~/utils/sacredGeometry'

type StageVariant = 'ribbons' | 'orbits' | 'ripples' | 'lattice' | 'flow'

const props = withDefaults(defineProps<{
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

const figure = computed<GeometryFigure>(() => {
  if (props.variant === 'flow' || props.variant === 'ripples') return 'vesica'
  if (props.variant === 'orbits') return 'fruit'
  if (props.variant === 'lattice') return 'metatron'
  return 'seed'
})
</script>

<template>
  <section
    class="stage"
    :class="`stage--${variant}`"
    :aria-labelledby="titleId"
  >
    <div class="stage__art" aria-hidden="true">
      <EdGeometryField :figure="figure" />
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
  --stage-cream: color-mix(in srgb, var(--signal-field) 35%, var(--paper));
  --stage-ink: var(--ink);
  --stage-cobalt: var(--accent);
  position: relative;
  display: grid;
  min-height: 0;
  align-content: center;
  justify-items: start;
  overflow: hidden;
  padding: var(--space-55) var(--space-34);
  color: var(--stage-ink);
  background: var(--stage-cream);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l);
}

[data-theme="dark"] .stage {
  --stage-cream: color-mix(in srgb, var(--signal-field) 40%, var(--paper));
  --stage-ink: var(--ink);
  color: var(--stage-ink);
}

.stage__art {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .9;
  /* Keep title zone readable — fade art under left/bottom copy */
  mask-image: linear-gradient(90deg, transparent 0%, transparent 46%, #000 62%, #000 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, transparent 46%, #000 62%, #000 100%);
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
  max-width: 62%;
}
@media (max-width: 720px) {
  .stage__copy { max-width: 100%; }
  .stage__art { display: none; }
}

.stage__eyebrow {
  margin: 0;
  font: 700 12rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  /* Ink on cream — yellow (--stage-cobalt / accent) fails contrast here. */
  color: var(--ink-soft, var(--muted));
}

.stage__copy :deep(h1),
.stage__copy > h1 {
  max-width: 800rem;
  margin: 12rem 0 18rem;
  font: 500 var(--type-h1)/.98 var(--font-display);
  letter-spacing: -.03em;
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
  font-size: var(--type-dek);
  line-height: 1.35;
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
  min-height: 0;
  margin-bottom: var(--space-34);
}

@media (max-width: 640px) {
  .stage {
    min-height: min(340rem, calc(100dvh - 280rem));
    padding: clamp(28rem, 6vw, 48rem);
  }
  .stage__art { opacity: .72; }
  .stage__deck { font-size: var(--type-dek); max-width: 36ch; }
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
