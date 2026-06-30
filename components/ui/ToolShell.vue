<script setup lang="ts">
import { useGlassMicro } from '~/composables/useGlassMicro'

// The shared shell for every tool / content page: the living gradient backdrop,
// a consistent header, and a centred content column. Pass the tool's UI into the
// default slot — it should be built from the global .glass-* primitives.
defineProps<{
  eyebrow?: string
  title?: string
  deck?: string
}>()

const rootRef = ref<HTMLElement | null>(null)
useGlassMicro(rootRef)
</script>

<template>
  <div ref="rootRef" class="tool-shell">
    <UiGlassBackdrop />

    <div class="tool-inner">
      <header class="tool-head">
        <p v-if="eyebrow" class="tool-eyebrow">{{ eyebrow }}</p>
        <h1 class="tool-title">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="deck || $slots.deck" class="tool-deck">
          <slot name="deck">{{ deck }}</slot>
        </p>
      </header>

      <div class="tool-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-shell {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  padding: calc(100rem + var(--safe-top)) 0 calc(96rem + var(--safe-bottom));
  overflow-x: clip;
}
.tool-inner {
  position: relative;
  z-index: 1;
  max-width: 720rem;
  margin: 0 auto;
  padding: 0 24rem;
}

/* ── Header ── */
.tool-head {
  margin-bottom: 28rem;
  animation: tool-head-in 0.7s var(--ease-spring) both;
}
@keyframes tool-head-in {
  from { opacity: 0; transform: translateY(16rem); filter: blur(5rem); }
  to   { opacity: 1; transform: none; filter: none; }
}
.tool-eyebrow {
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 12rem;
  color: var(--color-text);
}
.tool-title {
  font-size: clamp(34rem, 5vw, 56rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.08;
  color: var(--color-text);
}
.tool-deck {
  margin-top: 14rem;
  font-size: clamp(16rem, 2vw, 20rem);
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: var(--color-text);
  opacity: 0.7;
  max-width: 560rem;
}

@media (prefers-reduced-motion: reduce) {
  .tool-head { animation: none; }
}

@media (max-width: 600px) {
  .tool-shell { padding-top: calc(88rem + var(--safe-top)); }
  .tool-inner { padding: 0 16rem; }
  .tool-head { margin-bottom: 22rem; }
}
</style>
