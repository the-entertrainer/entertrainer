<template>
  <div class="shelf">
    <h2>Format</h2>
    <div class="chips">
      <button
        v-for="f in formats"
        :key="f.id"
        type="button"
        class="chip"
        :class="{ active: formatId === f.id }"
        @click="formatId = f.id"
      >{{ f.label }}</button>
    </div>
    <h2>Layout</h2>
    <div class="chips">
      <button
        v-for="l in layouts"
        :key="l.id"
        type="button"
        class="chip"
        :class="{ active: layoutId === l.id }"
        @click="layoutId = l.id"
      >{{ l.label }}</button>
    </div>
    <h2>Start with</h2>
    <div class="chips">
      <button type="button" class="chip" :class="{ active: start === 'camera' }" @click="start = 'camera'">Camera</button>
      <button type="button" class="chip" :class="{ active: start === 'photos' }" @click="start = 'photos'">Photos</button>
      <button type="button" class="chip" disabled>Script (Soon)</button>
    </div>
    <p class="camera-note">Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone.</p>
    <button type="button" class="btn-primary large" @click="emit('create', { formatId, layoutId, start })">Create</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ create: [payload: { formatId: string; layoutId: string; start: string | null }] }>()
const formatId = ref('webtoon')
const layoutId = ref('stack3')
const start = ref<string | null>(null)
const formats = [
  { id: 'webtoon', label: 'Webtoon 800×∞' },
  { id: 'shorts', label: 'Shorts 1080×1920' },
  { id: 'square', label: 'Square 1080×1080' },
  { id: 'page', label: 'Page 2480×3508' },
]
const layouts = [
  { id: 'splash1', label: '1 splash' },
  { id: 'stack2', label: '2 stack' },
  { id: 'stack3', label: '3 stack' },
  { id: 'grid4', label: '4 grid' },
  { id: 'blank', label: 'Blank' },
]
</script>
