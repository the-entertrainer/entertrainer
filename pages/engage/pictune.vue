<script setup lang="ts">
import { TARGET_RATE, type PicTuneHeader } from '~/utils/pictune/protocol'
import { demoPhoto, etchPicTune, openPicTuneFile, photoFromFile, pngBlobUrl, type PhotoInput } from '~/utils/pictune/client'
import { decodeAudioFile, prepareVoice, synthJingle } from '~/utils/pictune/audio'
import { downloadBytes, getAudioContext, playPcm, stopPlayback } from '~/utils/pictune/playback'
import { startVoiceCapture, type VoiceCapture } from '~/utils/pictune/record'

definePageMeta({ ssr: false })

useSeoMeta({
  title: 'pictune · Engage',
  description: 'Hide a voice inside a photo.',
  ogUrl: 'https://entertrainer.in/engage/pictune',
})

type VoiceTake = { pcm: Int16Array; sampleRate: number; durationMs: number }
type EtchedTune = {
  png: Uint8Array
  url: string
  width: number
  height: number
  header: PicTuneHeader
  pcm: Int16Array
  sampleRate: number
}

const tab = ref<'make' | 'play'>('make')
const photo = shallowRef<PhotoInput | null>(null)
const voice = shallowRef<VoiceTake | null>(null)
const etched = shallowRef<EtchedTune | null>(null)
const opened = shallowRef<(EtchedTune & { crcOk: boolean }) | null>(null)
const busy = ref<string | null>(null)
const error = ref<string | null>(null)
const recState = ref<'idle' | 'recording' | 'denied'>('idle')
const recMs = ref(0)
const recLevel = ref(0)
const playing = ref(false)

const capture = shallowRef<VoiceCapture | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)
const audioInput = ref<HTMLInputElement | null>(null)
const playInput = ref<HTMLInputElement | null>(null)

const cover = computed(() => etched.value ?? photo.value)
const makeReady = computed(() => Boolean(photo.value && voice.value && !etched.value && recState.value !== 'recording'))

function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

function setVoiceFromPcm(pcm: Float32Array, sampleRate: number, channels: number) {
  const prep = prepareVoice(pcm, sampleRate, channels)
  voice.value = { pcm: prep.pcm, sampleRate: prep.sampleRate, durationMs: prep.durationMs }
  etched.value = null
}

async function onPhoto(file: File) {
  error.value = null
  try {
    const next = await photoFromFile(file)
    if (photo.value?.url.startsWith('blob:')) URL.revokeObjectURL(photo.value.url)
    photo.value = next
    etched.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : "couldn't open that photo."
  }
}

async function onAudio(file: File) {
  error.value = null
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const decoded = await decodeAudioFile(bytes, file.name, (buf) => getAudioContext().decodeAudioData(buf))
    setVoiceFromPcm(decoded.pcm, decoded.sampleRate, decoded.channels)
  } catch (err) {
    error.value = err instanceof Error ? err.message : "couldn't read that clip."
  }
}

async function toggleRecord() {
  error.value = null
  if (recState.value === 'recording') {
    const cap = capture.value
    capture.value = null
    recState.value = 'idle'
    if (!cap) return
    try {
      const result = await cap.stop()
      if (result.pcm.length < result.sampleRate * 0.3) {
        error.value = 'that was too short.'
        return
      }
      setVoiceFromPcm(result.pcm, result.sampleRate, 1)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "couldn't save that take."
    }
    return
  }
  try {
    const cap = await startVoiceCapture({
      onLevel: (v) => { recLevel.value = v },
      onTick: (ms) => { recMs.value = ms },
    })
    capture.value = cap
    recMs.value = 0
    voice.value = null
    etched.value = null
    recState.value = 'recording'
  } catch {
    recState.value = 'denied'
    error.value = 'mic is blocked. use a clip instead.'
  }
}

async function hideInPhoto() {
  if (!photo.value || !voice.value) return
  busy.value = 'hiding…'
  error.value = null
  try {
    const out = await etchPicTune({
      rgba: photo.value.rgba,
      width: photo.value.width,
      height: photo.value.height,
      pcm: voice.value.pcm,
      sampleRate: voice.value.sampleRate,
    })
    if (etched.value?.url.startsWith('blob:')) URL.revokeObjectURL(etched.value.url)
    const next: EtchedTune = {
      png: out.png,
      url: pngBlobUrl(out.png),
      width: out.width,
      height: out.height,
      header: out.header,
      pcm: voice.value.pcm,
      sampleRate: voice.value.sampleRate,
    }
    etched.value = next
    opened.value = { ...next, crcOk: true }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "couldn't hide that take."
  } finally {
    busy.value = null
  }
}

async function trySample() {
  busy.value = 'making a sample…'
  error.value = null
  try {
    const coverPhoto = demoPhoto()
    const pcm = synthJingle(4)
    if (photo.value?.url.startsWith('blob:')) URL.revokeObjectURL(photo.value.url)
    photo.value = coverPhoto
    voice.value = { pcm, sampleRate: TARGET_RATE, durationMs: Math.round((pcm.length / TARGET_RATE) * 1000) }
    const out = await etchPicTune({
      rgba: coverPhoto.rgba,
      width: coverPhoto.width,
      height: coverPhoto.height,
      pcm,
      sampleRate: TARGET_RATE,
    })
    if (etched.value?.url.startsWith('blob:')) URL.revokeObjectURL(etched.value.url)
    const next: EtchedTune = {
      png: out.png,
      url: pngBlobUrl(out.png),
      width: out.width,
      height: out.height,
      header: out.header,
      pcm,
      sampleRate: TARGET_RATE,
    }
    etched.value = next
    opened.value = { ...next, crcOk: true }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'sample failed.'
  } finally {
    busy.value = null
  }
}

async function onPlayFile(file: File) {
  error.value = null
  busy.value = 'opening…'
  try {
    const dec = await openPicTuneFile(file)
    if (opened.value?.url.startsWith('blob:')) URL.revokeObjectURL(opened.value.url)
    opened.value = {
      png: new Uint8Array(await file.arrayBuffer()),
      url: URL.createObjectURL(file),
      width: dec.width,
      height: dec.height,
      header: dec.header,
      pcm: dec.pcm,
      sampleRate: dec.header.sampleRate,
      crcOk: dec.crcOk,
    }
    tab.value = 'play'
  } catch (err) {
    error.value = err instanceof Error ? err.message : "this photo isn't a pictune."
  } finally {
    busy.value = null
  }
}

async function togglePlay(take: VoiceTake | EtchedTune) {
  if (playing.value) {
    stopPlayback()
    playing.value = false
    return
  }
  playing.value = true
  await playPcm(take.pcm, take.sampleRate, () => { playing.value = false })
}

function pickPhoto() { photoInput.value?.click() }
function pickAudio() { audioInput.value?.click() }
function pickPlay() { playInput.value?.click() }

onBeforeUnmount(() => {
  stopPlayback()
  void capture.value?.stop()
  for (const url of [photo.value?.url, etched.value?.url, opened.value?.url]) {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
  }
})
</script>

<template>
  <div class="pt">
    <div class="pt__phone">
      <header class="pt__head">
        <NuxtLink to="/engage" class="pt__back" aria-label="Back to Engage">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
        </NuxtLink>
        <span class="pt__wordmark">
          <svg class="pt__mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="4" y="4" width="5.2" height="24" rx="2.4" fill="currentColor" />
            <rect x="4" y="4" width="24" height="5.2" rx="2.4" fill="currentColor" />
            <circle cx="20.5" cy="16.5" r="7.2" fill="none" stroke="currentColor" stroke-width="4.4" />
          </svg>
          <span class="pt__name">pictune</span>
        </span>
      </header>

      <input
        ref="photoInput"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class="pt__file"
        @change="(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) void onPhoto(f); (e.target as HTMLInputElement).value = '' }"
      >
      <input
        ref="audioInput"
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
        class="pt__file"
        @change="(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) void onAudio(f); (e.target as HTMLInputElement).value = '' }"
      >
      <input
        ref="playInput"
        type="file"
        accept="image/png"
        class="pt__file"
        @change="(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) void onPlayFile(f); (e.target as HTMLInputElement).value = '' }"
      >

      <main class="pt__main">
        <template v-if="tab === 'make'">
          <button type="button" class="pt__well" @click="pickPhoto">
            <img v-if="cover" :src="cover.url" alt="">
            <span v-else>add a photo</span>
          </button>

          <div class="pt__dock">
            <p v-if="recState === 'recording'" class="pt__clock">{{ clock(recMs) }}</p>
            <p v-else-if="voice" class="pt__meta">{{ clock(voice.durationMs) }}</p>

            <template v-if="etched">
              <button type="button" class="pt__cta" @click="downloadBytes(etched.png, 'pictune.png', 'image/png')">
                save photo
              </button>
              <button type="button" class="pt__ghost" @click="void togglePlay(etched)">
                {{ playing ? 'pause' : 'play take' }}
              </button>
              <p class="pt__hint">send the original file — not a screenshot</p>
            </template>

            <template v-else-if="makeReady">
              <button type="button" class="pt__cta" :disabled="Boolean(busy)" @click="void hideInPhoto()">
                {{ busy ?? 'hide in photo' }}
              </button>
              <button type="button" class="pt__ghost" @click="void toggleRecord()">record again</button>
            </template>

            <template v-else>
              <button
                type="button"
                class="pt__rec"
                :aria-label="recState === 'recording' ? 'stop' : 'record'"
                @click="void toggleRecord()"
              >
                <span
                  class="pt__orb"
                  :class="{ 'pt__orb--live': recState === 'recording' }"
                  :style="recState === 'recording' ? { transform: `scale(${1 + recLevel * 0.12})` } : undefined"
                >
                  <span class="pt__orb-core" :class="{ 'pt__orb-core--stop': recState === 'recording' }" />
                </span>
                <span class="pt__rec-label">{{ recState === 'recording' ? 'stop' : 'record' }}</span>
              </button>
              <div class="pt__alts">
                <button type="button" @click="pickAudio">use a clip</button>
                <button type="button" @click="void trySample()">try a sample</button>
              </div>
            </template>
          </div>
        </template>

        <template v-else>
          <button type="button" class="pt__well" @click="pickPlay">
            <img v-if="opened" :src="opened.url" alt="">
            <span v-else>open a pictune</span>
          </button>
          <div class="pt__dock">
            <template v-if="opened">
              <button
                type="button"
                class="pt__play"
                :aria-label="playing ? 'pause' : 'play'"
                @click="void togglePlay(opened)"
              >
                <svg v-if="playing" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="5" width="4.5" height="14" rx="1.2" fill="currentColor" />
                  <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" fill="currentColor" />
                </svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5L8 5.5Z" fill="currentColor" />
                </svg>
              </button>
              <p class="pt__meta">{{ clock(opened.header.durationMs) }}</p>
            </template>
            <p v-else class="pt__meta">needs the original png</p>
          </div>
        </template>

        <p v-if="error" class="pt__error">{{ error }}</p>
      </main>

      <nav class="pt__tabs">
        <button type="button" :class="{ active: tab === 'make' }" @click="tab = 'make'">
          <i /><span>make</span>
        </button>
        <button type="button" :class="{ active: tab === 'play' }" @click="tab = 'play'">
          <i /><span>play</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.pt {
  --pt-paper: #0B0B0C;
  --pt-ink: #F2F2F4;
  --pt-accent: #FFD43B;
  --pt-surface: #161618;
  --pt-muted: #8A8A90;
  --pt-line: #2A2A2E;
  position: fixed;
  inset: 0;
  z-index: 40;
  background: var(--pt-paper);
  color: var(--pt-ink);
  font-family: var(--font-ui, Archivo, Helvetica, sans-serif);
  display: flex;
  justify-content: center;
}
.pt__phone {
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: max(12px, env(safe-area-inset-top)) 20px env(safe-area-inset-bottom);
  box-sizing: border-box;
}
.pt__head {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  height: 56px;
}
.pt__back {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--pt-muted);
}
.pt__back svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.pt__wordmark {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--pt-ink);
}
.pt__mark {
  width: 28px;
  height: 28px;
  color: var(--pt-accent);
}
.pt__name {
  font-size: 18px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.08em;
  font-variant-caps: small-caps;
  text-transform: lowercase;
}
.pt__file {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
.pt__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0 8px;
  min-height: 0;
}
.pt__well {
  width: 100%;
  aspect-ratio: 4 / 5;
  max-height: 52dvh;
  overflow: hidden;
  border-radius: 12px;
  background: var(--pt-surface);
  box-shadow: inset 0 0 0 1px var(--pt-line);
  color: var(--pt-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  border: 0;
}
.pt__well img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pt__dock {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.pt__clock {
  margin: 0;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}
.pt__meta, .pt__hint {
  margin: 0;
  font-size: 13px;
  color: var(--pt-muted);
  font-variant-numeric: tabular-nums;
}
.pt__hint {
  max-width: 28ch;
  text-align: center;
  font-size: 12px;
}
.pt__cta {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 999px;
  background: var(--pt-accent);
  color: var(--pt-paper);
  font: 600 16px/1 var(--font-ui, Archivo, Helvetica, sans-serif);
  cursor: pointer;
}
.pt__cta:disabled { opacity: 0.4; }
.pt__ghost {
  border: 0;
  background: none;
  color: var(--pt-muted);
  font: 400 14px/1 var(--font-ui, Archivo, Helvetica, sans-serif);
  cursor: pointer;
  padding: 8px;
}
.pt__rec {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
}
.pt__orb {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 2px var(--pt-ink);
  display: grid;
  place-items: center;
}
.pt__orb--live {
  box-shadow: inset 0 0 0 2px var(--pt-accent);
  animation: pt-pulse 1.1s ease-in-out infinite;
}
.pt__orb-core {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: var(--pt-accent);
  transition: border-radius 150ms, width 150ms, height 150ms;
}
.pt__orb-core--stop {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
.pt__rec-label {
  font-size: 14px;
  color: var(--pt-muted);
}
.pt__alts {
  display: flex;
  gap: 16px;
}
.pt__alts button {
  border: 0;
  background: none;
  color: var(--pt-muted);
  font: 400 14px/1 var(--font-ui, Archivo, Helvetica, sans-serif);
  cursor: pointer;
  padding: 8px;
}
.pt__play {
  width: 64px;
  height: 64px;
  border: 0;
  border-radius: 999px;
  background: var(--pt-accent);
  color: var(--pt-paper);
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
}
.pt__play svg { width: 24px; height: 24px; }
.pt__error {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(--pt-accent);
}
.pt__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 8px 0 12px;
}
.pt__tabs button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 48px;
  border: 0;
  background: none;
  color: var(--pt-muted);
  font: 400 12px/1 var(--font-ui, Archivo, Helvetica, sans-serif);
  cursor: pointer;
}
.pt__tabs i {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--pt-line);
  display: block;
}
.pt__tabs button.active { color: var(--pt-ink); }
.pt__tabs button.active i { background: var(--pt-accent); }

@keyframes pt-pulse {
  0%, 100% { box-shadow: inset 0 0 0 2px var(--pt-accent), 0 0 0 0 rgba(255, 212, 59, 0.35); }
  50% { box-shadow: inset 0 0 0 2px var(--pt-accent), 0 0 0 10px rgba(255, 212, 59, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .pt__orb--live { animation: none; }
  .pt__orb-core { transition: none; }
}
</style>
