<template>
  <div ref="host" class="canvas-stage" />
</template>

<script setup lang="ts">
/**
 * CanvasStage — mounts the static DialogueEditor (Konva) into this host.
 * Prefer vue-konva later; P0 uses the battle-tested static editor module.
 */
const props = defineProps<{ bundle: any }>()
const emit = defineEmits<{ dirty: []; autosave: [bundle: any]; select: [kind: string, id: string] }>()
const host = ref<HTMLElement | null>(null)
let editor: any = null

onMounted(async () => {
  await ensureLibs()
  if (!host.value) return
  editor = (window as any).DialogueEditor.createEditor(host.value, {
    onDirty: () => emit('dirty'),
    onAutosave: (b: any) => emit('autosave', b),
    onSelect: (kind: string, id: string) => emit('select', kind, id),
    onBalloonEdit: (n: any) => emit('select', 'lettering', n.id),
  })
  if (props.bundle) editor.loadBundle(props.bundle)
})

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

async function ensureLibs() {
  const w = window as any
  const load = (src: string) => new Promise<void>((res, rej) => {
    if ([...document.scripts].some((s) => s.src.includes(src.split('/').pop()!))) return res()
    const s = document.createElement('script')
    s.src = src
    s.onload = () => res()
    s.onerror = () => rej(new Error(src))
    document.head.appendChild(s)
  })
  if (!w.Konva) await load('https://unpkg.com/konva@10/konva.min.js')
  if (!w.Dexie) await load('https://unpkg.com/dexie@4/dist/dexie.js')
  for (const src of [
    '/dialogue/js/utils.js', '/dialogue/js/formats.js', '/dialogue/js/db.js',
    '/dialogue/js/history.js', '/dialogue/js/export.js', '/dialogue/js/editor.js',
  ]) {
    const leaf = src.split('/').pop()!
    if (![...document.scripts].some((s) => s.src.includes(leaf))) await load(src)
  }
}
</script>

<style scoped>
.canvas-stage { width: 100%; height: 100%; min-height: 50dvh; background: #1a1916; touch-action: none; }
</style>
