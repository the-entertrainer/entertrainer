<!-- Shockwave Type entry: compact logo first, then finite wordmark reveal. -->
<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()
const leaving = ref(false)
const entered = ref(false)
const reducedMotion = ref(false)
const ambient = ref<HTMLAudioElement | null>(null)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined
let completed = false
let audioContext: AudioContext | undefined
let ambientSource: MediaElementAudioSourceNode | undefined
let audioNodes: AudioNode[] = []

const createHallImpulse = (context: AudioContext) => {
  const length = Math.floor(context.sampleRate * 1.15)
  const impulse = context.createBuffer(2, length, context.sampleRate)
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 2.8)
  }
  return impulse
}

const ensureSpatialMix = () => {
  if (audioContext) return audioContext
  const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  const bed = ambient.value
  if (!AudioContextConstructor || !bed) return

  const context = new AudioContextConstructor()
  const master = context.createGain()
  const ambientGain = context.createGain()
  const ambientPan = context.createStereoPanner?.()
  const hall = context.createConvolver()
  const hallGain = context.createGain()

  ambientSource = context.createMediaElementSource(bed)
  ambientGain.gain.value = 0.26
  hallGain.gain.value = 0.24
  master.gain.value = 0.92
  hall.buffer = createHallImpulse(context)
  ambientPan && (ambientPan.pan.value = 0.13)

  ambientSource.connect(ambientGain)
  if (ambientPan) { ambientGain.connect(ambientPan); ambientPan.connect(master) } else ambientGain.connect(master)
  ambientGain.connect(hall)
  hall.connect(hallGain)
  hallGain.connect(master)
  master.connect(context.destination)
  ambientGain.gain.setValueAtTime(0.26, context.currentTime)
  ambientGain.gain.linearRampToValueAtTime(0.0001, context.currentTime + 4.15)

  audioNodes = [master, ambientGain, hall, hallGain, ambientPan].filter(Boolean) as AudioNode[]
  audioContext = context
  return context
}

const playAmbient = () => {
  const bed = ambient.value
  if (!bed) return
  try {
    // Ambient playback and the Web Audio unlock remain inside the direct visitor gesture.
    const context = ensureSpatialMix()
    void context?.resume().catch(() => undefined)
    bed.pause()
    bed.currentTime = 0
    bed.muted = false
    bed.volume = 1
    void bed.play().catch(() => undefined)
  } catch {
    // The visual handoff never depends on successful audio playback.
  }
}

const finish = () => {
  if (completed) return
  completed = true
  leaving.value = true
  ambient.value?.pause()
  removeTimer = window.setTimeout(() => emit('complete'), 300)
}

const startExperience = () => {
  if (entered.value || completed) return
  playAmbient()
  entered.value = true
  finishTimer = window.setTimeout(finish, reducedMotion.value ? 850 : 4400)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onBeforeUnmount(() => {
  if (finishTimer) window.clearTimeout(finishTimer)
  if (removeTimer) window.clearTimeout(removeTimer)
  ambient.value?.pause()
  ambientSource?.disconnect()
  audioNodes.forEach(node => node.disconnect())
  void audioContext?.close()
})
</script>

<template>
  <div class="preloader" :class="{ 'preloader--entered': entered, 'preloader--leaving': leaving }">
    <audio ref="ambient" class="preloader__audio" src="/api/entry-audio/ambient" preload="auto" playsinline aria-hidden="true" />

    <button v-if="!entered" type="button" class="preloader__entry" aria-label="Tap to enter Entertrainer with sound" @click="startExperience">
      <svg class="preloader__entry-logo" viewBox="0 0 240 240" aria-hidden="true">
        <circle class="preloader__entry-ring" cx="120" cy="120" r="94" />
        <circle class="preloader__entry-ring" cx="120" cy="120" r="62" />
        <circle class="preloader__entry-ring" cx="120" cy="120" r="30" />
        <text class="preloader__entry-e" x="120" y="158" text-anchor="middle">e</text>
      </svg>
      <svg class="preloader__entry-orbit" viewBox="0 0 400 400" aria-hidden="true">
        <defs><path id="entry-orbit-path" d="M 200,200 m -163,0 a 163,163 0 1,1 326,0 a 163,163 0 1,1 -326,0" /></defs>
        <text><textPath href="#entry-orbit-path" startOffset="0%">TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · </textPath></text>
      </svg>
      <span class="sr-only">Tap to enter</span>
    </button>

    <div v-else class="preloader__stage" aria-hidden="true">
      <div class="preloader__rings"><i></i><i></i><i></i><i></i></div>
      <div class="preloader__brand-shell"><span class="preloader__word">entertrainer</span></div>
    </div>
    <span class="sr-only" role="status" aria-live="polite">{{ entered ? 'Preparing Entertrainer' : 'Tap to enter Entertrainer' }}</span>
  </div>
</template>

<style scoped>
/* Selected identity: a direct visitor gesture unlocks the sound and shockwave sequence. */
.preloader { position:fixed; inset:0; z-index:5000; display:grid; place-items:center; overflow:hidden; background:#fffaf0; color:#15120f; transition:opacity 300ms cubic-bezier(.3,0,1,1), visibility 300ms step-end; }.preloader--leaving { opacity:0; visibility:hidden; pointer-events:none; }.preloader__audio { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }.preloader__entry { position:relative; display:grid; place-items:center; width:min(280rem,66vw); aspect-ratio:1; padding:0; border:0; background:transparent; color:#15120f; cursor:pointer; }.preloader__entry-logo { position:relative; z-index:1; display:block; width:78%; height:auto; overflow:visible; }.preloader__entry-ring { fill:none; stroke:#ffd43b; stroke-width:18; }.preloader__entry-e { fill:#15120f; font-family:var(--font-ui), Arial, sans-serif; font-size:144rem; font-weight:900; letter-spacing:-.1em; }.preloader__entry-orbit { position:absolute; inset:0; width:100%; height:100%; overflow:visible; animation:pl-entry-orbit 22s linear infinite; }.preloader__entry-orbit text { fill:#15120f; font-family:var(--font-mono), monospace; font-size:13rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }.preloader__entry:hover .preloader__entry-logo { transform:scale(1.025); }.preloader__entry-logo { transition:transform 220ms cubic-bezier(.16,1,.3,1); }.preloader__entry:focus-visible { outline:3rem solid #15120f; outline-offset:10rem; border-radius:50%; }.preloader__entry:active .preloader__entry-logo { transform:scale(.975); }.preloader__stage { position:relative; display:grid; place-items:center; width:min(860rem,92vw); aspect-ratio:1.52; isolation:isolate; }.preloader__rings { position:absolute; z-index:0; inset:0; display:grid; place-items:center; }.preloader__rings i { position:absolute; box-sizing:border-box; border:clamp(22rem,3.1vw,48rem) solid #ffd43b; border-radius:50%; opacity:0; transform:scale(.42); animation:pl-ring-arrive 1500ms cubic-bezier(.16,1,.3,1) var(--pl-ring-delay) both, pl-ring-breathe 1750ms ease-in-out calc(1480ms + var(--pl-ring-delay)) 1 both; }.preloader__rings i:nth-child(1) { --pl-ring-delay:0ms; width:30%; aspect-ratio:1; }.preloader__rings i:nth-child(2) { --pl-ring-delay:110ms; width:48%; aspect-ratio:1; }.preloader__rings i:nth-child(3) { --pl-ring-delay:220ms; width:68%; aspect-ratio:1; }.preloader__rings i:nth-child(4) { --pl-ring-delay:330ms; width:88%; aspect-ratio:1; }.preloader__brand-shell { position:relative; z-index:1; display:grid; place-items:center; opacity:0; transform:scale(.94); animation:pl-word-arrive 760ms cubic-bezier(.16,1,.3,1) 540ms both; }.preloader__word { color:#15120f; font-family:var(--font-ui), Arial, sans-serif; font-size:clamp(52rem,9.4vw,142rem); font-weight:900; letter-spacing:-.082em; line-height:.82; text-wrap:nowrap; }.preloader__brand-shell::after { position:absolute; z-index:-1; right:6%; bottom:-18rem; width:32%; height:14rem; content:''; border-radius:50%; background:rgb(92 68 0 / .14); filter:blur(10rem); transform:scaleX(.6); opacity:0; animation:pl-shadow-arrive 800ms cubic-bezier(.16,1,.3,1) 760ms both; }
@keyframes pl-entry-orbit { to { transform:rotate(360deg); } } @keyframes pl-ring-arrive { 0% { opacity:0; transform:scale(.36) rotate(-10deg); } 58% { opacity:1; transform:scale(1.035) rotate(1deg); } 100% { opacity:1; transform:scale(1) rotate(0); } } @keyframes pl-ring-breathe { 0%,100% { transform:scale(1); } 48% { transform:scale(1.035); } } @keyframes pl-word-arrive { 0% { opacity:0; transform:scale(.94) translateY(16rem); filter:blur(5rem); } 66% { opacity:1; filter:blur(0); } 100% { opacity:1; transform:none; filter:none; } } @keyframes pl-shadow-arrive { to { opacity:.78; transform:scaleX(1); } }
@media (prefers-reduced-motion:reduce) { .preloader { transition-duration:80ms; }.preloader *, .preloader *::before, .preloader *::after { animation:none !important; }.preloader__entry-orbit { transform:none; }.preloader__rings i { opacity:1; transform:scale(1); }.preloader__brand-shell { opacity:1; transform:none; }.preloader__brand-shell::after { opacity:.55; transform:scaleX(1); } }
</style>
