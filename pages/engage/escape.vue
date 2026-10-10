<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'escape · Engage',
  description: 'A quiet concrete room. Walk with a drag. The door is warm.',
  ogUrl: 'https://entertrainer.in/engage/escape'
})

const viewRef = ref<HTMLCanvasElement | null>(null)
const cardRef = ref<HTMLCanvasElement | null>(null)
const phase = ref<'play' | 'fade' | 'card'>('play')

let game: { dispose: () => void; nextEscape: () => void } | null = null

function onCardPointer() {
  if (phase.value !== 'card') return
  phase.value = 'play'
  game?.nextEscape()
}

onMounted(async () => {
  const view = viewRef.value
  const card = cardRef.value
  if (!view || !card) return
  const { mountEscape } = await import('~/utils/escape/game')
  game = mountEscape(view, card, {
    onPhase: (next) => {
      phase.value = next
    }
  })
})

onBeforeUnmount(() => {
  game?.dispose()
  game = null
})
</script>

<template>
  <div class="escape">
    <canvas ref="viewRef" class="escape__view" />
    <p v-show="phase !== 'card'" class="escape__word">escape</p>
    <div class="escape__wash" :class="{ 'is-on': phase !== 'play' }" />
    <canvas
      v-show="phase === 'card'"
      ref="cardRef"
      class="escape__card"
      @pointerdown="onCardPointer"
    />
  </div>
</template>

<style scoped>
.escape {
  position: fixed;
  inset: 0;
  background: #f4f0e6;
  touch-action: none;
  user-select: none;
}

.escape__view {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}

.escape__word {
  position: fixed;
  z-index: 2;
  top: max(16px, env(safe-area-inset-top));
  left: max(16px, env(safe-area-inset-left));
  margin: 0;
  color: #1c1a17;
  font: 500 13px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.18em;
  text-transform: lowercase;
  pointer-events: none;
}

.escape__wash {
  position: fixed;
  z-index: 3;
  inset: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 700ms ease;
}

.escape__wash.is-on { opacity: 1; }

.escape__card {
  position: fixed;
  z-index: 4;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f7f1e4;
  touch-action: none;
}

@media (prefers-reduced-motion: reduce) {
  .escape__wash { transition: none; }
}
</style>
