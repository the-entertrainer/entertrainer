<template>
  <div class="reader" :class="{ open }">
    <div class="bar">
      <button type="button" class="icon-btn" aria-label="Close" @click="$emit('close')">←</button>
      <strong style="flex:1">Preview</strong>
    </div>
    <div class="scroll">
      <img v-if="url" class="page-img" :src="url" alt="Comic" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; bundle: any }>()
defineEmits(['close'])
const url = ref('')

watch(() => props.open, async (v) => {
  if (!v || !props.bundle) return
  const Ex = (window as any).DialogueExport
  if (!Ex) return
  const assetMap: Record<string, any> = {}
  ;(props.bundle.assets || []).forEach((a: any) => { assetMap[a.id] = a })
  const canvas = await Ex.renderBundleToCanvas(props.bundle, assetMap)
  url.value = canvas.toDataURL('image/jpeg', 0.9)
})
</script>
