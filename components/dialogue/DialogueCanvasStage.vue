<template>
  <DialogueLoadError v-if="loadError" @retry="boot" />
  <div v-else ref="host" class="canvas-stage" />
</template>

<script setup lang="ts">
/**
 * CanvasStage — mounts the static DialogueEditor (Konva) into this host.
 * Konva and Dexie are pinned files under /dialogue/vendor, not a CDN.
 */
const props = defineProps<{ bundle: any }>()
const emit = defineEmits<{ dirty: []; autosave: [bundle: any]; select: [kind: string, id: string] }>()
const host = ref<HTMLElement | null>(null)
const loadError = ref(false)
let editor: any = null

async function boot() {
  loadError.value = false
  try {
    await loadDialogueEditorLibs()
    await nextTick()
    if (!host.value) return
    editor?.destroy()
    editor = (window as any).DialogueEditor.createEditor(host.value, {
      onDirty: () => emit('dirty'),
      onAutosave: (b: any) => emit('autosave', b),
      onSelect: (kind: string, id: string) => emit('select', kind, id),
      onBalloonEdit: (n: any) => emit('select', 'lettering', n.id),
    })
    if (props.bundle) editor.loadBundle(props.bundle)
  } catch (error) {
    console.error(error)
    loadError.value = true
  }
}

onMounted(boot)

watch(() => props.bundle, (b) => {
  if (b && editor) editor.loadBundle(b)
})

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})

defineExpose({
  getEditor: () => editor,
})
</script>

<style scoped>
.canvas-stage { width: 100%; height: 100%; min-height: 50dvh; background: #1a1916; touch-action: none; }
</style>
