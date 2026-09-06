<template>
  <div class="tray open">
    <template v-if="mode === 'panels'">
      <button type="button" @click="$emit('action', 'add-panel')">Add panel</button>
      <button type="button" @click="$emit('action', 'dup-panel')">Duplicate</button>
      <button type="button" @click="$emit('action', 'del')">Delete</button>
    </template>
    <template v-else-if="mode === 'art'">
      <label class="file-btn">Camera
        <input class="sr-only" type="file" accept="image/*" capture="environment" @change="onFile" />
      </label>
      <label class="file-btn">Photos
        <input class="sr-only" type="file" accept="image/*" multiple @change="onFile" />
      </label>
      <button type="button" @click="$emit('action', 'fit')">Fit</button>
      <button type="button" @click="$emit('action', 'fill')">Fill</button>
      <p class="camera-note">Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone.</p>
    </template>
    <template v-else-if="mode === 'balloon'">
      <button type="button" @click="$emit('action', 'speech')">Speech</button>
      <button type="button" @click="$emit('action', 'thought')">Thought</button>
      <button type="button" @click="$emit('action', 'caption')">Caption</button>
    </template>
    <template v-else-if="mode === 'stickers'">
      <button
        v-for="s in stickers"
        :key="s"
        type="button"
        @click="$emit('action', 'sticker', `/dialogue/stickers/${s}`)"
      >
        <img :src="`/dialogue/stickers/${s}`" width="36" height="36" alt="" />
      </button>
    </template>
    <template v-else-if="mode === 'frames' || mode === 'type'">
      <button type="button" class="soon" disabled>Soon</button>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{ mode: string }>()
const emit = defineEmits(['action'])
const stickers = [
  'burst.svg', 'heart.svg', 'pow.svg', 'bam.svg', 'sweat.svg', 'speed-lines.svg',
  'sparkle.svg', 'exclaim.svg', 'question.svg', 'impact-lines.svg', 'anger-vein.svg',
  'music-note.svg', 'zzzz.svg', 'cloud-puff.svg', 'motion-arc.svg', 'hearts-mini.svg',
]

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  for (const file of files) {
    const dataURL = await new Promise<string>((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(String(r.result))
      r.onerror = rej
      r.readAsDataURL(file)
    })
    const asset = {
      id: 'asset_' + Math.random().toString(36).slice(2),
      projectId: 'current',
      mime: file.type || 'image/jpeg',
      name: file.name,
      dataURL,
      createdAt: Date.now(),
    }
    emit('action', 'art', asset)
  }
  input.value = ''
}
</script>
