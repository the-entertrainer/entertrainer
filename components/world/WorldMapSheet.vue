<script setup lang="ts">
import { ANCHORS, mapPosition, type AnchorId } from '~/composables/world/anchors'

defineProps<{
  open: boolean
  current: AnchorId
}>()

const emit = defineEmits<{
  close: []
  select: [id: AnchorId]
}>()

const root = ref<HTMLElement | null>(null)
defineExpose({ root })

function place(id: AnchorId) {
  const anchor = ANCHORS.find((item) => item.id === id)!
  return mapPosition(anchor)
}
</script>

<template>
  <div
    v-if="open"
    ref="root"
    class="map"
    role="dialog"
    aria-modal="true"
    aria-labelledby="satya-map-title"
  >
    <div class="map__panel">
      <div class="map__head">
        <h2 id="satya-map-title" tabindex="-1">World map</h2>
        <button type="button" class="map__close" @click="emit('close')">Close</button>
      </div>
      <p class="map__note">Same places as the orbit. Forward is up. Archive sits low.</p>
      <div class="map__field">
        <button
          v-for="anchor in ANCHORS"
          :key="anchor.id"
          type="button"
          class="map__stop"
          :class="{ 'map__stop--on': anchor.id === current }"
          :data-anchor="anchor.id"
          :style="{ left: place(anchor.id).left, top: place(anchor.id).top }"
          @click="emit('select', anchor.id)"
        >
          {{ anchor.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-items: center;
  background: rgb(7 7 10 / 0.72);
  pointer-events: auto;
  padding: 20px;
}

.map__panel {
  width: min(720px, 100%);
  background: #12131A;
  color: #E8E4DC;
  border: 1px solid rgb(122 154 232 / 0.45);
  padding: 18px 18px 22px;
}

.map__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.map__head h2 {
  margin: 0;
  font-family: var(--font-display), Georgia, serif;
  font-size: 28px;
  font-weight: 560;
  letter-spacing: -0.03em;
}

.map__close {
  min-height: 44px;
  min-width: 44px;
  padding: 0 12px;
  border: 1px solid #7A9AE8;
  background: transparent;
  color: #E8E4DC;
  font: inherit;
  cursor: pointer;
}

.map__note {
  margin: 8px 0 0;
  color: #7A9AE8;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 12px;
}

.map__field {
  position: relative;
  height: min(58dvh, 460px);
  margin-top: 12px;
}

.map__stop {
  position: absolute;
  transform: translate(-50%, -50%);
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid rgb(232 228 220 / 0.35);
  background: #07070A;
  color: #E8E4DC;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.map__stop--on {
  border-color: #2F5BD8;
  color: #F7F1E4;
  background: #2F5BD8;
}

.map__close:focus-visible,
.map__stop:focus-visible {
  outline: 3px solid #7A9AE8;
  outline-offset: 3px;
}
</style>
