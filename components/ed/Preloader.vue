<!-- Shockwave Type entry: compact logo first, then finite wordmark reveal. -->
<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()
const leaving = ref(false)
const entered = ref(false)
const reducedMotion = ref(false)
const narration = ref<HTMLAudioElement | null>(null)
const compactLogoUrl = '/manus-storage/entertrainer-compact-e-rings-primary_54347c50.png'
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined
let audioContext: AudioContext | undefined
let audioSource: MediaElementAudioSourceNode | undefined
let completed = false

const ensureAudioGraph = () => {
  if (audioContext) return audioContext
  const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextConstructor) return
  audioContext = new AudioContextConstructor()
  const audio = narration.value
  if (!audio) return audioContext
  audioSource = audioContext.createMediaElementSource(audio)
  const echoDelay = audioContext.createDelay(0.72)
  const echoFeedback = audioContext.createGain()
  const echoLevel = audioContext.createGain()
  echoDelay.delayTime.value = 0.34
  echoFeedback.gain.value = 0.26
  echoLevel.gain.value = 0.22
  audioSource.connect(audioContext.destination)
  audioSource.connect(echoDelay)
  echoDelay.connect(echoLevel)
  echoLevel.connect(audioContext.destination)
  echoDelay.connect(echoFeedback)
  echoFeedback.connect(echoDelay)
  return audioContext
}

const playNarration = () => {
  const audio = narration.value
  if (!audio) return
  try {
    const context = ensureAudioGraph()
    if (!context) return
    audio.currentTime = 0
    audio.volume = 0.94
    // These calls intentionally remain in the button activation stack. iOS Safari
    // allows audible media only when the visitor has directly requested it.
    void context.resume().catch(() => undefined)
    void audio.play().catch(() => undefined)
  } catch {
    // The visual handoff never depends on successful audio playback.
  }
}

const finish = () => {
  if (completed) return
  completed = true
  leaving.value = true
  narration.value?.pause()
  removeTimer = window.setTimeout(() => emit('complete'), 300)
}

const startExperience = () => {
  if (entered.value || completed) return
  entered.value = true
  playNarration()
  finishTimer = window.setTimeout(finish, reducedMotion.value ? 850 : 4400)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onBeforeUnmount(() => {
  if (finishTimer) window.clearTimeout(finishTimer)
  if (removeTimer) window.clearTimeout(removeTimer)
  narration.value?.pause()
  audioSource?.disconnect()
  void audioContext?.close()
})
</script>

<template>
  <div class="preloader" :class="{ 'preloader--entered': entered, 'preloader--leaving': leaving }">
    <audio ref="narration" class="preloader__audio" src="/manus-storage/tts_You.._20260822_220754_82da6af5.mp3" preload="auto" aria-hidden="true" />

    <button v-if="!entered" type="button" class="preloader__entry" aria-label="Tap to enter Entertrainer with sound" @click="startExperience">
      <span class="preloader__entry-logo" :style="{ backgroundImage: `url(${compactLogoUrl})` }" aria-hidden="true"></span>
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
.preloader { position:fixed; inset:0; z-index:5000; display:grid; place-items:center; overflow:hidden; background:#fffaf0; color:#15120f; transition:opacity 300ms cubic-bezier(.3,0,1,1), visibility 300ms step-end; }.preloader--leaving { opacity:0; visibility:hidden; pointer-events:none; }.preloader__audio { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }.preloader__entry { position:relative; display:grid; place-items:center; width:min(390rem,78vw); aspect-ratio:1; padding:0; border:0; background:transparent; color:#15120f; cursor:pointer; }.preloader__entry-logo { position:relative; z-index:1; display:block; width:62%; aspect-ratio:1; background-position:center; background-repeat:no-repeat; background-size:contain; }.preloader__entry-orbit { position:absolute; inset:-5%; width:110%; height:110%; overflow:visible; animation:pl-entry-orbit 18s linear infinite; }.preloader__entry-orbit text { fill:#15120f; font-family:var(--font-mono), monospace; font-size:16rem; font-weight:700; letter-spacing:.13em; text-transform:uppercase; }.preloader__entry:hover .preloader__entry-logo { transform:scale(1.025); }.preloader__entry-logo { transition:transform 220ms cubic-bezier(.16,1,.3,1); }.preloader__entry:focus-visible { outline:3rem solid #15120f; outline-offset:12rem; border-radius:50%; }.preloader__entry:active .preloader__entry-logo { transform:scale(.975); }.preloader__stage { position:relative; display:grid; place-items:center; width:min(860rem,92vw); aspect-ratio:1.52; isolation:isolate; }.preloader__rings { position:absolute; z-index:0; inset:0; display:grid; place-items:center; }.preloader__rings i { position:absolute; box-sizing:border-box; border:clamp(22rem,3.1vw,48rem) solid #ffd43b; border-radius:50%; opacity:0; transform:scale(.42); animation:pl-ring-arrive 1500ms cubic-bezier(.16,1,.3,1) var(--pl-ring-delay) both, pl-ring-breathe 1750ms ease-in-out calc(1480ms + var(--pl-ring-delay)) 1 both; }.preloader__rings i:nth-child(1) { --pl-ring-delay:0ms; width:30%; aspect-ratio:1; }.preloader__rings i:nth-child(2) { --pl-ring-delay:110ms; width:48%; aspect-ratio:1; }.preloader__rings i:nth-child(3) { --pl-ring-delay:220ms; width:68%; aspect-ratio:1; }.preloader__rings i:nth-child(4) { --pl-ring-delay:330ms; width:88%; aspect-ratio:1; }.preloader__brand-shell { position:relative; z-index:1; display:grid; place-items:center; opacity:0; transform:scale(.94); animation:pl-word-arrive 760ms cubic-bezier(.16,1,.3,1) 540ms both; }.preloader__word { color:#15120f; font-family:var(--font-ui), Arial, sans-serif; font-size:clamp(52rem,9.4vw,142rem); font-weight:900; letter-spacing:-.082em; line-height:.82; text-wrap:nowrap; }.preloader__brand-shell::after { position:absolute; z-index:-1; right:6%; bottom:-18rem; width:32%; height:14rem; content:''; border-radius:50%; background:rgb(92 68 0 / .14); filter:blur(10rem); transform:scaleX(.6); opacity:0; animation:pl-shadow-arrive 800ms cubic-bezier(.16,1,.3,1) 760ms both; }
@keyframes pl-entry-orbit { to { transform:rotate(360deg); } } @keyframes pl-ring-arrive { 0% { opacity:0; transform:scale(.36) rotate(-10deg); } 58% { opacity:1; transform:scale(1.035) rotate(1deg); } 100% { opacity:1; transform:scale(1) rotate(0); } } @keyframes pl-ring-breathe { 0%,100% { transform:scale(1); } 48% { transform:scale(1.035); } } @keyframes pl-word-arrive { 0% { opacity:0; transform:scale(.94) translateY(16rem); filter:blur(5rem); } 66% { opacity:1; filter:blur(0); } 100% { opacity:1; transform:none; filter:none; } } @keyframes pl-shadow-arrive { to { opacity:.78; transform:scaleX(1); } }
@media (prefers-reduced-motion:reduce) { .preloader { transition-duration:80ms; }.preloader *, .preloader *::before, .preloader *::after { animation:none !important; }.preloader__entry-orbit { transform:none; }.preloader__rings i { opacity:1; transform:scale(1); }.preloader__brand-shell { opacity:1; transform:none; }.preloader__brand-shell::after { opacity:.55; transform:scaleX(1); } }
</style>
