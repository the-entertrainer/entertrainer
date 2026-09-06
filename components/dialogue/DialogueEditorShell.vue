<template>
  <div class="screen active" style="display:flex;flex-direction:column;min-height:100dvh">
    <div class="topbar">
      <button type="button" class="icon-btn" aria-label="Back" @click="goBack">←</button>
      <button type="button" class="title" @click="rename">{{ title }}</button>
      <button type="button" class="icon-btn" aria-label="Undo" @click="ed()?.undo()">↶</button>
      <button type="button" class="icon-btn" aria-label="Redo" @click="ed()?.redo()">↷</button>
      <button type="button" class="icon-btn" aria-label="Preview" @click="preview = true">👁</button>
      <button type="button" class="icon-btn" aria-label="Export" @click="exportOpen = true">⇪</button>
    </div>
    <div class="editor-wrap" style="flex:1;min-height:0;display:flex;flex-direction:column">
      <div id="stage-host" style="flex:1;min-height:0">
        <DialogueCanvasStage
          v-if="bundle"
          ref="stage"
          :bundle="bundle"
          @autosave="onAutosave"
          @select="onSelect"
        />
      </div>
      <DialogueFilmstrip :panels="bundle?.panels || []" :selected-id="selectedPanelId" @select="selectPanel" />
      <DialogueToolDock v-model="dock" />
      <DialogueTray :mode="dock" @action="onTray" />
    </div>
    <DialogueExportSheet :open="exportOpen" @close="exportOpen = false" />
    <DialogueReader :open="preview" :bundle="bundle" @close="preview = false" />
    <DialogueLetteringSheet
      :open="!!letteringId"
      :text="letteringText"
      @save="saveLettering"
      @close="letteringId = null"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ projectId: string }>()
const bundle = ref<any>(null)
const title = ref('Untitled')
const dock = ref('panels')
const stage = ref<any>(null)
const exportOpen = ref(false)
const preview = ref(false)
const selectedPanelId = ref<string | null>(null)
const letteringId = ref<string | null>(null)
const letteringText = ref('')
const route = useRoute()

onMounted(async () => {
  await loadDeps()
  const b = await (window as any).DialogueDB.getProjectBundle(props.projectId)
  bundle.value = b
  title.value = b?.project?.title || 'Untitled'
  if (route.query.export) exportOpen.value = true
  // bridge for export sheet
  ;(window as any).DialogueAppActions = {
    runExport: async (kind: string) => {
      const ed = ed()
      if (!ed) return
      ed.flushAutosave()
      const b2 = ed.getBundle()
      const assetMap: Record<string, any> = {}
      ;(b2.assets || []).forEach((a: any) => { assetMap[a.id] = a })
      const Ex = (window as any).DialogueExport
      const U = (window as any).DialogueUtils
      const t = (b2.project.title || 'comic').replace(/[^\w\-]+/g, '_')
      let blob: Blob
      let name: string
      if (kind === 'png') { blob = await Ex.exportPNG(b2, assetMap); name = t + '.png' }
      else if (kind === 'jpg') { blob = await Ex.exportJPG(b2, assetMap, 0.92); name = t + '.jpg' }
      else if (kind === 'webtoon') { blob = await Ex.exportWebtoonZip(b2, assetMap); name = t + '-webtoon.zip' }
      else if (kind === 'pdf') { blob = await Ex.exportPDF(b2, assetMap); name = t + '.pdf' }
      else { blob = await Ex.projectZip(b2, assetMap); name = t + '.dialogue' }
      U.downloadBlob(blob, name)
    },
  }
})

function ed() { return stage.value?.getEditor?.() }
function goBack() {
  ed()?.flushAutosave()
  navigateTo('/dialogue')
}
async function rename() {
  const next = prompt('Title', title.value)
  if (next == null || !bundle.value) return
  bundle.value.project.title = next.trim() || title.value
  title.value = bundle.value.project.title
  await (window as any).DialogueDB.saveProjectBundle(bundle.value, { replaceChildren: true })
}
async function onAutosave(b: any) {
  bundle.value = b
  await (window as any).DialogueDB.saveProjectBundle(b, { replaceChildren: true })
}
function onSelect(kind: string, id: string) {
  if (kind === 'panel') selectedPanelId.value = id
  if (kind === 'lettering') {
    letteringId.value = id
    const n = bundle.value?.nodes?.find((x: any) => x.id === id)
    letteringText.value = n?.text === 'Say something' ? '' : (n?.text || '')
  }
}
function selectPanel(id: string) { ed()?.select('panel', id) }
function saveLettering(text: string) {
  if (letteringId.value) ed()?.setBalloonText(letteringId.value, text || 'Say something')
  letteringId.value = null
}
function onTray(act: string, payload?: any) {
  const e = ed()
  if (!e) return
  const map: Record<string, () => void> = {
    'add-panel': () => e.addPanel(),
    'dup-panel': () => e.duplicatePanel(),
    del: () => e.deleteSelected(),
    speech: () => e.addBalloon('speech'),
    thought: () => e.addBalloon('thought'),
    caption: () => e.addBalloon('caption'),
    fit: () => e.setFit('contain'),
    fill: () => e.setFit('cover'),
  }
  if (act === 'sticker') e.addSticker(payload)
  else if (act === 'art' && payload) e.setPanelArt(payload, 'cover')
  else map[act]?.()
}

async function loadDeps() {
  const load = (src: string) => new Promise<void>((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error(src)); document.head.appendChild(s)
  })
  const w = window as any
  if (!w.Konva) await load('https://unpkg.com/konva@10/konva.min.js')
  if (!w.Dexie) await load('https://unpkg.com/dexie@4/dist/dexie.js')
  if (!w.JSZip) await load('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
  if (!w.jspdf && !w.jsPDF) await load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
  if (!w.saveAs) await load('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js')
  for (const src of ['/dialogue/js/utils.js','/dialogue/js/formats.js','/dialogue/js/db.js','/dialogue/js/history.js','/dialogue/js/export.js','/dialogue/js/editor.js']) {
    const leaf = src.split('/').pop()!
    if (![...document.scripts].some((s) => s.src.includes(leaf))) await load(src)
  }
}
</script>
