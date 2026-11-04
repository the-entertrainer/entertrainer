<script setup lang="ts">
import type { Anchor } from '~/composables/world/anchors'

const props = defineProps<{
  anchor: Anchor | null
}>()

const emit = defineEmits<{
  close: []
}>()

const back = ref<HTMLButtonElement | null>(null)
const root = ref<HTMLElement | null>(null)

watch(() => props.anchor?.id, async (id) => {
  if (!id) return
  await nextTick()
  back.value?.focus()
})

defineExpose({ root })
</script>

<template>
  <div
    v-if="anchor"
    ref="root"
    class="sheet"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="`reading-${anchor.id}`"
  >
    <div class="sheet__panel">
      <p class="sheet__kicker">Reading Mode</p>
      <h2 :id="`reading-${anchor.id}`" class="sheet__title">{{ anchor.readingTitle }}</h2>
      <p class="sheet__dek">{{ anchor.readingDek }}</p>
      <p class="sheet__body">{{ anchor.readingBody }}</p>
      <p v-if="anchor.href" class="sheet__path">Page: {{ anchor.href }}</p>
      <div class="sheet__actions">
        <button ref="back" type="button" class="sheet__back" @click="emit('close')">
          Back to the scene
        </button>
        <NuxtLink v-if="anchor.href && anchor.id !== 'nexus'" class="sheet__go" :to="anchor.href">
          Continue to the page
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sheet {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(7 7 10 / 0.28);
  pointer-events: auto;
}

.sheet__panel {
  width: min(680px, 100%);
  max-height: min(78dvh, 720px);
  overflow: auto;
  background: #F7F1E4;
  color: #0B0B0C;
  padding: 28px 28px 32px;
  box-shadow: 0 24px 60px -24px rgb(0 0 0 / 0.45);
  color-scheme: light;
}

.sheet__kicker {
  margin: 0 0 8px;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #1E3F9A;
}

.sheet__title {
  margin: 0;
  font-family: var(--font-display), Georgia, serif;
  font-weight: 560;
  font-size: clamp(32px, 5vw, 52px);
  letter-spacing: -0.03em;
  line-height: 0.95;
}

.sheet__dek {
  margin: 12px 0 0;
  font-family: var(--font-reading), Georgia, serif;
  font-size: 20px;
  line-height: 1.35;
}

.sheet__body {
  margin: 16px 0 0;
  max-width: 66ch;
  font-family: var(--font-reading), Georgia, serif;
  font-size: 18px;
  line-height: 1.55;
}

.sheet__path {
  margin: 18px 0 0;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 12px;
  color: #5C574E;
}

.sheet__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.sheet__back,
.sheet__go {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid #0B0B0C;
  background: transparent;
  color: #0B0B0C;
  font: inherit;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
}

.sheet__go {
  background: #2F5BD8;
  border-color: #2F5BD8;
  color: #F7F1E4;
}

.sheet__back:focus-visible,
.sheet__go:focus-visible {
  outline: 3px solid #1E3F9A;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .sheet__panel {
    animation: dock-in 420ms cubic-bezier(0.22, 0.82, 0.32, 1) both;
  }
}

@keyframes dock-in {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
</style>
