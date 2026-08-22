<!-- Shockwave Type preloader: warm yellow rings, live wordmark, finite and reduced-motion safe. -->
<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()
const leaving = ref(false)
const narration = ref<HTMLAudioElement | null>(null)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined
let audioTimer: ReturnType<typeof setTimeout> | undefined
let audioContext: AudioContext | undefined
let audioSource: MediaElementAudioSourceNode | undefined
let completed = false

const playNarration = async () => {
  const audio = narration.value
  if (!audio) return

  try {
    if (!audioContext) {
      audioContext = new AudioContext()
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
    }
    audio.volume = 0.94
    await audioContext.resume()
    await audio.play()
  } catch {
    // Unprompted audio can be blocked. The visual sequence remains complete.
  }
}

const finish = () => {
  if (completed) return
  completed = true
  leaving.value = true
  narration.value?.pause()
  removeTimer = window.setTimeout(() => emit('complete'), 300)
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) {
    audioTimer = window.setTimeout(() => {
      // Browsers may block sound before a visitor interacts. The visual sequence
      // always completes either way, without surfacing an intrusive permission UI.
      void playNarration()
    }, 90)
  }
  finishTimer = window.setTimeout(finish, reduced ? 140 : 3400)
})
onBeforeUnmount(() => {
  if (finishTimer) window.clearTimeout(finishTimer)
  if (removeTimer) window.clearTimeout(removeTimer)
  if (audioTimer) window.clearTimeout(audioTimer)
  narration.value?.pause()
  audioSource?.disconnect()
  void audioContext?.close()
})
</script>

<template>
  <div class="preloader" :class="{ 'preloader--leaving': leaving }" role="status" aria-live="polite" aria-label="Preparing Entertrainer">
    <audio ref="narration" class="preloader__audio" src="/manus-storage/tts_You.._20260822_220754_82da6af5.mp3" preload="auto" aria-hidden="true" />
    <div class="preloader__stage" aria-hidden="true">
      <div class="preloader__rings"><i></i><i></i><i></i><i></i></div>
      <div class="preloader__brand-shell"><span class="preloader__word">entertrainer</span></div>
    </div>
    <span class="sr-only">Preparing Entertrainer</span>
  </div>
</template>

<style scoped>
/* Selected identity: an explanatory shockwave, staged once and then removed. */
.preloader { position:fixed; inset:0; z-index:5000; display:grid; place-items:center; overflow:hidden; background:#fffaf0; color:#15120f; transition:opacity 300ms cubic-bezier(.3,0,1,1), visibility 300ms step-end; }.preloader--leaving { opacity:0; visibility:hidden; pointer-events:none; }.preloader__audio { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }.preloader__stage { position:relative; display:grid; place-items:center; width:min(860rem,92vw); aspect-ratio:1.52; isolation:isolate; }.preloader__rings { position:absolute; z-index:0; inset:0; display:grid; place-items:center; }.preloader__rings i { position:absolute; box-sizing:border-box; border:clamp(22rem,3.1vw,48rem) solid #ffd43b; border-radius:50%; opacity:0; transform:scale(.42); animation:pl-ring-arrive 1500ms cubic-bezier(.16,1,.3,1) var(--pl-ring-delay) both, pl-ring-breathe 1750ms ease-in-out calc(1480ms + var(--pl-ring-delay)) 1 both; }.preloader__rings i:nth-child(1) { --pl-ring-delay:0ms; width:30%; aspect-ratio:1; }.preloader__rings i:nth-child(2) { --pl-ring-delay:110ms; width:48%; aspect-ratio:1; }.preloader__rings i:nth-child(3) { --pl-ring-delay:220ms; width:68%; aspect-ratio:1; }.preloader__rings i:nth-child(4) { --pl-ring-delay:330ms; width:88%; aspect-ratio:1; }.preloader__brand-shell { position:relative; z-index:1; display:grid; place-items:center; opacity:0; transform:scale(.94); animation:pl-word-arrive 760ms cubic-bezier(.16,1,.3,1) 540ms both; }.preloader__word { color:#15120f; font-family:var(--font-ui), Arial, sans-serif; font-size:clamp(52rem,9.4vw,142rem); font-weight:900; letter-spacing:-.082em; line-height:.82; text-wrap:nowrap; }.preloader__brand-shell::after { position:absolute; z-index:-1; right:6%; bottom:-18rem; width:32%; height:14rem; content:''; border-radius:50%; background:rgb(92 68 0 / .14); filter:blur(10rem); transform:scaleX(.6); opacity:0; animation:pl-shadow-arrive 800ms cubic-bezier(.16,1,.3,1) 760ms both; }
@keyframes pl-ring-arrive { 0% { opacity:0; transform:scale(.36) rotate(-10deg); } 58% { opacity:1; transform:scale(1.035) rotate(1deg); } 100% { opacity:1; transform:scale(1) rotate(0); } } @keyframes pl-ring-breathe { 0%,100% { transform:scale(1); } 48% { transform:scale(1.035); } } @keyframes pl-word-arrive { 0% { opacity:0; transform:scale(.94) translateY(16rem); filter:blur(5rem); } 66% { opacity:1; filter:blur(0); } 100% { opacity:1; transform:none; filter:none; } } @keyframes pl-shadow-arrive { to { opacity:.78; transform:scaleX(1); } }
@media (prefers-reduced-motion:reduce) { .preloader { transition-duration:80ms; }.preloader *, .preloader *::before, .preloader *::after { animation:none !important; }.preloader__rings i { opacity:1; transform:scale(1); }.preloader__brand-shell { opacity:1; transform:none; }.preloader__brand-shell::after { opacity:.55; transform:scaleX(1); } }
</style>
