<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useEmpowerVisit } from '~/composables/empower/visit'
import { formatBytes } from '~/utils/empower/bytes'
import { saveBlob } from '~/utils/empower/download'
import { loadPdfjs } from '~/utils/empower/pdfjs'
import {
  compressPdf,
  extractPages,
  mergePdfs,
  pageCount,
  parsePageRange,
  reorderPages,
  signPdf,
  splitZip,
  type PdfSource,
} from '~/utils/empower/pdfKit'
import { uid } from '~/utils/empower/id'

useEmpowerVisit('pdf-kit')

const tabs = [
  { id: 'merge', label: 'Merge' },
  { id: 'split', label: 'Split' },
  { id: 'reorder', label: 'Reorder' },
  { id: 'compress', label: 'Compress' },
  { id: 'sign', label: 'Sign' },
] as const
type TabId = typeof tabs[number]['id']

const files = ref<PdfSource[]>([])
const tab = ref<TabId>('merge')
const error = ref('')
const notice = ref('')
const working = ref(false)
const range = ref('')
const order = ref<number[]>([])
const typed = ref('')
const signPage = ref(1)
const counts = ref<Record<string, number>>({})
const activeId = ref('')
const padRef = ref<HTMLCanvasElement | null>(null)
const thumbRefs = ref<HTMLCanvasElement[]>([])

function setThumb(index: number, el: unknown) {
  if (el instanceof HTMLCanvasElement) thumbRefs.value[index] = el
}
let ink = false
let drawing = false

const active = computed(() => files.value.find(file => file.id === activeId.value) ?? files.value[0] ?? null)
const statusText = computed(() => error.value || notice.value || (files.value.length ? `${files.value.length} PDF${files.value.length === 1 ? '' : 's'} on this device.` : 'Add a PDF to begin.'))

watch(active, async file => {
  order.value = []
  if (!file) return
  try {
    const count = counts.value[file.id] || await pageCount(file.bytes)
    counts.value = { ...counts.value, [file.id]: count }
    order.value = Array.from({ length: count }, (_, index) => index)
    if (signPage.value > count) signPage.value = 1
  } catch {
    error.value = 'That PDF could not be opened. It may be damaged or password-protected.'
  }
})

watch(tab, async value => {
  if (value === 'reorder') {
    await nextTick()
    void renderThumbs()
  }
  if (value === 'sign') {
    await nextTick()
    preparePad()
  }
})

function preparePad() {
  const canvas = padRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#161618'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ink = false
}

async function addFiles(list: FileList | File[]) {
  error.value = ''
  const next: PdfSource[] = []
  for (const file of Array.from(list)) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf' && file.type !== 'application/pdf') {
      error.value = `${file.name} is not a PDF.`
      continue
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    try {
      const count = await pageCount(bytes)
      const id = uid('pdf')
      counts.value = { ...counts.value, [id]: count }
      next.push({ id, name: file.name, bytes })
    } catch {
      error.value = `${file.name} could not be opened. It may be damaged or password-protected.`
    }
  }
  files.value = [...files.value, ...next]
  if (!activeId.value && files.value[0]) activeId.value = files.value[0].id
}

async function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) await addFiles(input.files)
  input.value = ''
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer?.files?.length) void addFiles(event.dataTransfer.files)
}

function removeFile(id: string) {
  files.value = files.value.filter(file => file.id !== id)
  if (activeId.value === id) activeId.value = files.value[0]?.id ?? ''
}

function moveFile(index: number, dir: -1 | 1) {
  const next = index + dir
  if (next < 0 || next >= files.value.length) return
  const copy = [...files.value]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  files.value = copy
}

async function run(action: () => Promise<void>) {
  working.value = true
  error.value = ''
  notice.value = ''
  try {
    await action()
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    error.value = /password/i.test(message)
      ? 'That PDF is password-protected.'
      : 'That PDF could not be processed.'
  } finally {
    working.value = false
  }
}

async function downloadMerge() {
  if (files.value.length < 2) {
    error.value = 'Add at least two PDFs to merge.'
    return
  }
  await run(async () => {
    const bytes = await mergePdfs(files.value.map(file => file.bytes))
    await saveBlob('merged.pdf', bytes, 'application/pdf')
    notice.value = 'Downloaded merged.pdf.'
  })
}

async function downloadExtract() {
  const file = active.value
  if (!file) return
  const count = counts.value[file.id] || 1
  const pages = parsePageRange(range.value, count)
  if (!Array.isArray(pages)) {
    error.value = pages.error
    return
  }
  await run(async () => {
    const bytes = await extractPages(file.bytes, pages)
    await saveBlob('extract.pdf', bytes, 'application/pdf')
    notice.value = 'Downloaded extract.pdf.'
  })
}

async function downloadSplit() {
  const file = active.value
  if (!file) return
  await run(async () => {
    const base = file.name.replace(/\.pdf$/i, '') || 'pages'
    const bytes = await splitZip(file.bytes, base)
    await saveBlob(`${base}-pages.zip`, bytes, 'application/zip')
    notice.value = 'Downloaded one PDF per page, in a zip.'
  })
}

function move(index: number, dir: -1 | 1) {
  const next = index + dir
  if (next < 0 || next >= order.value.length) return
  const copy = [...order.value]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  order.value = copy
  void renderThumbs()
}

function onDrag(index: number, event: DragEvent) {
  event.dataTransfer?.setData('text/plain', String(index))
}

function onDropPage(index: number, event: DragEvent) {
  event.preventDefault()
  const from = Number(event.dataTransfer?.getData('text/plain'))
  if (!Number.isInteger(from) || from === index) return
  const copy = [...order.value]
  const [item] = copy.splice(from, 1)
  copy.splice(index, 0, item)
  order.value = copy
  void renderThumbs()
}

async function downloadReorder() {
  const file = active.value
  if (!file) return
  await run(async () => {
    const bytes = await reorderPages(file.bytes, order.value)
    await saveBlob('reordered.pdf', bytes, 'application/pdf')
    notice.value = 'Downloaded reordered.pdf.'
  })
}

async function renderThumbs() {
  const file = active.value
  if (!file || tab.value !== 'reorder') return
  await nextTick()
  const pdfjs = await loadPdfjs()
  const task = pdfjs.getDocument({ data: file.bytes.slice() })
  try {
    const doc = await task.promise
    for (let index = 0; index < order.value.length; index++) {
      const canvas = thumbRefs.value[index]
      if (!canvas) continue
      const page = await doc.getPage(order.value[index] + 1)
      const viewport = page.getViewport({ scale: 0.25 })
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      await page.render({ canvas, canvasContext: ctx, viewport }).promise
    }
  } catch {
    /* Thumbnails are a convenience. Page numbers and the move buttons still work. */
  } finally {
    await task.destroy?.().catch(() => {})
  }
}

async function downloadCompress() {
  const file = active.value
  if (!file) return
  await run(async () => {
    const bytes = await compressPdf(file.bytes)
    await saveBlob('compressed.pdf', bytes, 'application/pdf')
    const before = formatBytes(file.bytes.byteLength)
    const after = formatBytes(bytes.byteLength)
    notice.value = `Downloaded compressed.pdf. Original ${before}. Rewritten ${after}. Rewriting drops unused structure. It is not a print-shop compressor, and some files barely shrink.`
  })
}

function pointerPos(event: PointerEvent) {
  const canvas = padRef.value!
  const rect = canvas.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  }
}

function drawStart(event: PointerEvent) {
  const canvas = padRef.value
  if (!canvas) return
  drawing = true
  ink = true
  canvas.setPointerCapture(event.pointerId)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const point = pointerPos(event)
  ctx.beginPath()
  ctx.moveTo(point.x, point.y)
}

function drawMove(event: PointerEvent) {
  if (!drawing) return
  const ctx = padRef.value?.getContext('2d')
  if (!ctx) return
  const point = pointerPos(event)
  ctx.lineTo(point.x, point.y)
  ctx.stroke()
}

function drawEnd() {
  drawing = false
}

function clearPad() {
  preparePad()
}

async function downloadSign() {
  const file = active.value
  if (!file) return
  if (!ink && !typed.value.trim()) {
    error.value = 'Draw or type a signature first.'
    return
  }
  await run(async () => {
    const png = ink && padRef.value
      ? new Uint8Array(await (await new Promise<Blob | null>(resolve => padRef.value!.toBlob(resolve, 'image/png')))!.arrayBuffer())
      : null
    const bytes = await signPdf(file.bytes, { pageNumber: signPage.value, png, typed: typed.value })
    await saveBlob('signed.pdf', bytes, 'application/pdf')
    notice.value = 'Downloaded signed.pdf.'
  })
}

function onTabKey(event: KeyboardEvent, id: TabId) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  event.preventDefault()
  const index = tabs.findIndex(item => item.id === id)
  const dir = event.key === 'ArrowRight' ? 1 : -1
  const next = tabs[(index + dir + tabs.length) % tabs.length]
  tab.value = next.id
  void nextTick(() => document.getElementById(`pdf-tab-${next.id}`)?.focus())
}
</script>

<template>
  <EmpowerShell title="PDF Kit" deck="PDFs that never go to a server." :status-text="statusText" :busy="working" wide>
    <div class="em-stack" @dragover.prevent @drop="onDrop">
      <div class="em-field">
        <label for="pdf-files">Add PDFs</label>
        <input id="pdf-files" class="em-file" type="file" accept="application/pdf,.pdf" multiple @change="onPick">
      </div>
      <p v-if="!files.length" class="em-note">Add a PDF to begin. It stays on this device.</p>
      <ul v-else class="em-issues">
        <li v-for="(file, index) in files" :key="file.id">
          <span>{{ file.name }} · {{ counts[file.id] || '?' }} pages · {{ formatBytes(file.bytes.byteLength) }}</span>
          <span class="em-row-actions">
            <button type="button" class="em-btn" :disabled="index === 0" @click="moveFile(index, -1)">Move {{ file.name }} up</button>
            <button type="button" class="em-btn" :disabled="index === files.length - 1" @click="moveFile(index, 1)">Move {{ file.name }} down</button>
            <button type="button" class="em-btn" @click="removeFile(file.id)">Remove {{ file.name }}</button>
          </span>
        </li>
      </ul>
      <div v-if="files.length > 1 && tab !== 'merge'" class="em-field">
        <label for="pdf-which">PDF for this action</label>
        <select id="pdf-which" v-model="activeId" class="em-select">
          <option v-for="file in files" :key="file.id" :value="file.id">{{ file.name }}</option>
        </select>
      </div>

      <div class="em-tabs" role="tablist" aria-label="PDF actions">
        <button
          v-for="item in tabs"
          :id="`pdf-tab-${item.id}`"
          :key="item.id"
          type="button"
          class="em-btn"
          role="tab"
          :aria-selected="tab === item.id ? 'true' : 'false'"
          :tabindex="tab === item.id ? 0 : -1"
          @click="tab = item.id"
          @keydown="onTabKey($event, item.id)"
        >{{ item.label }}</button>
      </div>

      <div v-if="tab === 'merge'" role="tabpanel" aria-label="Merge">
        <p class="em-note">Files merge in the order listed above.</p>
        <button type="button" class="em-btn em-btn--primary" :disabled="working || files.length < 2" @click="downloadMerge">Download merged PDF</button>
      </div>

      <div v-else-if="tab === 'split'" role="tabpanel" aria-label="Split" class="em-stack">
        <div class="em-field">
          <label for="pdf-range">Pages to extract</label>
          <input id="pdf-range" v-model="range" class="em-input" type="text" inputmode="text" autocomplete="off" placeholder="1-2, 4">
        </div>
        <div class="em-row-actions">
          <button type="button" class="em-btn em-btn--primary" :disabled="working || !active" @click="downloadExtract">Download these pages</button>
          <button type="button" class="em-btn" :disabled="working || !active" @click="downloadSplit">Download each page</button>
        </div>
      </div>

      <div v-else-if="tab === 'reorder'" role="tabpanel" aria-label="Reorder">
        <p class="em-note">Scroll sideways for every page. Move buttons work without dragging.</p>
        <div class="em-film">
          <article v-for="(pageIndex, index) in order" :key="`${pageIndex}-${index}`" draggable="true" @dragstart="onDrag(index, $event)" @dragover.prevent @drop="onDropPage(index, $event)">
            <canvas :ref="el => setThumb(index, el)" role="img" :aria-label="`Page ${pageIndex + 1}`" />
            <span>Page {{ pageIndex + 1 }}</span>
            <button type="button" class="em-btn" :disabled="index === 0" @click="move(index, -1)">Move page {{ pageIndex + 1 }} up</button>
            <button type="button" class="em-btn" :disabled="index === order.length - 1" @click="move(index, 1)">Move page {{ pageIndex + 1 }} down</button>
          </article>
        </div>
        <button type="button" class="em-btn em-btn--primary" :disabled="working || !active" @click="downloadReorder">Download reordered PDF</button>
      </div>

      <div v-else-if="tab === 'compress'" role="tabpanel" aria-label="Compress" class="em-stack">
        <p class="em-note">Rewriting a PDF drops unused structure. It is not a print-shop compressor, and some files barely shrink.</p>
        <button type="button" class="em-btn em-btn--primary" :disabled="working || !active" @click="downloadCompress">Download compressed PDF</button>
      </div>

      <div v-else role="tabpanel" aria-label="Sign" class="em-stack">
        <div class="em-field">
          <label for="pdf-sign-page">Page number</label>
          <input id="pdf-sign-page" v-model.number="signPage" class="em-input" type="number" min="1" :max="active ? counts[active.id] : 1">
        </div>
        <div class="em-field">
          <label for="pdf-sign-type">Type a signature</label>
          <input id="pdf-sign-type" v-model="typed" class="em-input" type="text" autocomplete="name">
        </div>
        <p id="pdf-pad-help" class="em-note">Or draw with a finger or a mouse. The pad is a canvas on a white ground, because the PDF page is white.</p>
        <canvas
          ref="padRef"
          class="em-pad"
          width="600"
          height="200"
          aria-label="Signature drawing area"
          aria-describedby="pdf-pad-help"
          @pointerdown="drawStart"
          @pointermove="drawMove"
          @pointerup="drawEnd"
          @pointercancel="drawEnd"
        />
        <div class="em-row-actions">
          <button type="button" class="em-btn" @click="clearPad">Clear drawing</button>
          <button type="button" class="em-btn em-btn--primary" :disabled="working || !active" @click="downloadSign">Download signed PDF</button>
        </div>
      </div>

      <p v-if="error" class="em-error">{{ error }}</p>
      <p v-if="notice" class="em-status" role="status">{{ notice }}</p>
    </div>
  </EmpowerShell>
</template>
