<template>
  <div class="sheet" :class="{ open }" id="export-sheet">
    <div class="grab" />
    <h2>Export</h2>
    <div class="progress"><i :style="{ width: progress + '%' }" /></div>
    <p>{{ status }}</p>
    <button type="button" class="row" @click="run('png')">PNG strip</button>
    <button type="button" class="row" @click="run('jpg')">JPG</button>
    <button type="button" class="row" @click="run('webtoon')">WEBTOON slices ZIP</button>
    <button type="button" class="row" @click="run('pdf')">PDF</button>
    <button type="button" class="row" @click="run('dialogue')">.dialogue archive</button>
    <button type="button" class="row" @click="$emit('close')">Close</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits(['close'])
const progress = ref(0)
const status = ref('Choose a format')
const { runBrowserExport } = useDialogueExport()

async function run(kind: string) {
  status.value = 'Exporting…'
  progress.value = 10
  try {
    await runBrowserExport(kind)
    progress.value = 100
    status.value = 'Done'
  } catch (e: any) {
    status.value = e?.message || String(e)
  }
}
</script>
