<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useEmpowerVisit } from '~/composables/empower/visit'
import { ocrPackSizeLabel } from '~/utils/empower/bytes'
import { copyText, saveText } from '~/utils/empower/download'
import { ocrPackInstalled, offlinePhase } from '~/utils/empower/offline'
import { recognizeImage } from '~/utils/empower/ocr'

useEmpowerVisit('snap-to-text')

const text = ref('')
const error = ref('')
const notice = ref('')
const working = ref(false)
const blocked = ref(false)
const packReady = ref(false)
const cameraOn = ref(false)
const canCamera = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const photoRef = ref<HTMLCanvasElement | null>(null)
const hasPhoto = ref(false)
let stream: MediaStream | null = null
let fileBlob: Blob | null = null

const size = ocrPackSizeLabel()
const statusText = computed(() => {
  if (blocked.value) return `Connect once to download the OCR pack (${size}).`
  if (error.value) return error.value
  if (working.value) return 'Reading the photo.'
  if (text.value) return 'Text is ready to edit.'
  return 'Photo to text. Leaves your device.'
})

async function refreshPack() {
  packReady.value = await ocrPackInstalled()
  const phase = await offlinePhase()
  blocked.value = phase === 'limited'
}

onMounted(async () => {
  canCamera.value = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  await refreshPack()
  window.addEventListener('online', refreshPack)
  window.addEventListener('offline', refreshPack)
})

onBeforeUnmount(() => {
  stopCamera()
  window.removeEventListener('online', refreshPack)
  window.removeEventListener('offline', refreshPack)
})

function stopCamera() {
  stream?.getTracks().forEach(track => track.stop())
  stream = null
  cameraOn.value = false
}

async function drawBlob(blob: Blob) {
  const canvas = photoRef.value
  if (!canvas) return
  const bitmap = await createImageBitmap(blob)
  const max = 1200
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
}

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'That file is not an image.'
    return
  }
  error.value = ''
  fileBlob = file
  hasPhoto.value = true
  await nextTick()
  await drawBlob(file)
}

async function startCamera() {
  error.value = ''
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    cameraOn.value = true
    await nextTick()
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }
  } catch {
    error.value = 'The camera permission was blocked. You can still upload a photo.'
    stopCamera()
  }
}

async function capture() {
  const video = videoRef.value
  if (!video) return
  hasPhoto.value = true
  await nextTick()
  const canvas = photoRef.value
  if (!canvas) return
  canvas.width = video.videoWidth || 1280
  canvas.height = video.videoHeight || 720
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  fileBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  stopCamera()
}

async function readPhoto() {
  if (blocked.value) return
  const source = fileBlob
  if (!source) {
    error.value = 'Add a photo first.'
    return
  }
  working.value = true
  error.value = ''
  try {
    text.value = await recognizeImage(source)
    packReady.value = true
    if (!text.value) error.value = 'No text was found in that photo.'
  } catch (err) {
    await refreshPack()
    if (blocked.value || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
      blocked.value = true
      error.value = ''
    } else {
      error.value = err instanceof Error ? err.message : 'The photo could not be read.'
    }
  } finally {
    working.value = false
  }
}

async function copyOut() {
  notice.value = await copyText(text.value) ? 'Copied the text.' : 'Copy failed. Select the text and copy it yourself.'
}

async function downloadOut() {
  await saveText('snap.txt', text.value)
  notice.value = 'Downloaded snap.txt.'
}
</script>

<template>
  <EmpowerShell title="Snap-to-Text" deck="Photo to text. Leaves your device." :status-text="statusText" :busy="working">
    <div v-if="blocked" class="em-stack">
      <p class="em-error">Connect once to download the OCR pack ({{ size }}).</p>
      <p class="em-note">The pack is the on-device reader. Until it is saved in this browser, a photo cannot be read offline.</p>
    </div>
    <div v-else class="em-stack">
      <p v-if="!packReady" class="em-note">OCR pack {{ size }} — download once for offline use.</p>
      <p class="em-note">The camera stays in this browser. Nothing is uploaded.</p>
      <div class="em-field">
        <label for="snap-file">Upload a photo</label>
        <input id="snap-file" class="em-file" type="file" accept="image/*" @change="onFile">
      </div>
      <div class="em-row-actions">
        <button v-if="canCamera && !cameraOn" type="button" class="em-btn" @click="startCamera">Use the camera</button>
        <button v-if="cameraOn" type="button" class="em-btn em-btn--primary" @click="capture">Capture</button>
        <button v-if="cameraOn" type="button" class="em-btn" @click="stopCamera">Stop camera</button>
      </div>
      <video v-if="cameraOn" ref="videoRef" class="em-video" autoplay playsinline muted aria-label="Camera preview" />
      <canvas v-if="hasPhoto" ref="photoRef" class="em-photo" role="img" aria-label="Source photo" />
      <button type="button" class="em-btn em-btn--primary" :disabled="working || !hasPhoto" @click="readPhoto">Read the photo</button>
      <p v-if="working" class="em-note">Reading the photo…</p>
      <p v-if="error" class="em-error">{{ error }}</p>
      <div class="em-field">
        <label for="snap-text">Recognized text</label>
        <textarea id="snap-text" v-model="text" class="em-textarea" spellcheck="true" />
      </div>
      <div class="em-row-actions">
        <button type="button" class="em-btn" :disabled="!text" @click="copyOut">Copy</button>
        <button type="button" class="em-btn" :disabled="!text" @click="downloadOut">Download .txt</button>
      </div>
      <p v-if="notice" class="em-status" role="status">{{ notice }}</p>
    </div>
  </EmpowerShell>
</template>
