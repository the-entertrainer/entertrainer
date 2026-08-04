<script setup lang="ts">
import { useGlassMicro } from '~/composables/useGlassMicro'

// The shared shell for every tool / content page: the living gradient backdrop,
// a consistent header, and a centred content column. Pass the tool's UI into the
// default slot — it should be built from the global .glass-* primitives.
defineProps<{
  eyebrow?: string
  title?: string
  deck?: string
  wide?: boolean
}>()

const rootRef = ref<HTMLElement | null>(null)
useGlassMicro(rootRef)

// The header used to enter via a CSS keyframe, which fired on mount regardless
// of the viewport and had no reduced-motion parity with the rest of the site.
// useReveal is the house entrance and degrades to "just visible" by construction.
const R = useReveal()
const rv = R.head()
</script>

<template>
  <div ref="rootRef" class="tool-shell" :class="{ 'tool-shell--wide': wide }">
    <UiGlassBackdrop calm />

    <div class="tool-inner">
      <header class="tool-head">
        <p v-if="eyebrow" class="eyebrow tool-eyebrow" v-motion :initial="rv.eyebrow.initial" :visible-once="rv.eyebrow.visibleOnce">{{ eyebrow }}</p>
        <h1 class="display-serif tool-title" v-motion :initial="rv.title.initial" :visible-once="rv.title.visibleOnce">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="deck || $slots.deck" class="tool-deck" v-motion :initial="rv.deck.initial" :visible-once="rv.deck.visibleOnce">
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
  padding: var(--page-top) 0 var(--page-bottom);
  overflow-x: clip;
}
.tool-inner {
  position: relative;
  z-index: 1;
  max-width: var(--maxw-tool);
  margin: 0 auto;
  padding-inline: var(--edge-column);
}
.tool-shell--wide .tool-inner { max-width: var(--maxw-tool-wide); }

/* ── Header ──
   The title was the site's second page-title identity: DM Sans 700 at -0.04em
   against Fraunces 400 at -0.015em everywhere else. It governs eight routes
   (error.vue, the four tools, three [slug] stubs), so moving it here is the one
   edit that makes the whole site speak with one voice. */
.tool-head { margin-bottom: clamp(22rem, 3vw, 30rem); }
.tool-eyebrow { margin-bottom: 12rem; }
.tool-title { font-size: var(--text-h1); line-height: 1.04; color: var(--color-text); }
.tool-deck {
  margin-top: 14rem;
  font-size: var(--text-lead);
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: -0.015em;
  color: var(--color-text);
  opacity: 0.72;
  max-width: 46ch;
}
</style>
