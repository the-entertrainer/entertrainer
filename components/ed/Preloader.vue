<!-- Compact logo first, then finite wordmark reveal; optional opening music (~8.93s). -->
<script setup lang="ts">
import { openingSoundSrc } from '~/composables/useSiteSettings'

const emit = defineEmits<{ complete: [] }>()
const { settings, prefersReducedMotion, hydrate } = useSiteSettings()
const leaving = ref(false)
const entered = ref(false)
const reducedMotion = ref(false)
const ident = ref<HTMLAudioElement | null>(null)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined
let completed = false

/** Opening track duration (~8.93s); safety finish = duration + 400ms. */
const MUSIC_DURATION_MS = 8930
const MUSIC_SAFETY_MS = MUSIC_DURATION_MS + 400
/** Sound-off short preloader. */
const SHORT_NORMAL_MS = 2800
const SHORT_REDUCED_MS = 850

const soundOn = computed(() => settings.value.openingSound === 'on')
const identSrc = computed(() => openingSoundSrc(settings.value.openingSound))

/**
 * Play the brand opening music inside the tap-to-enter gesture only.
 * Uses a plain HTMLAudioElement (no Web Audio / AudioContext hacks) so iOS
 * can honour the hardware silent/ringer switch. If the device is muted,
 * AudioContext would be blocked, or play() rejects — fail silently and
 * continue the visual handoff.
 */
const playOpeningSound = () => {
  const el = ident.value
  const src = identSrc.value
  if (!el || !src || !soundOn.value) return
  try {
    if (el.getAttribute('src') !== src) el.src = src
    el.pause()
    el.currentTime = 0
    // Do not force unmute or route around the silent switch.
    el.volume = 0.92
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => undefined)
  } catch {
    // Visual handoff never depends on audio.
  }
}

const stopOpeningSound = () => {
  const el = ident.value
  if (!el) return
  try {
    el.pause()
    el.currentTime = 0
  } catch {
    /* ignore */
  }
}

const clearFinishTimer = () => {
  if (finishTimer !== undefined) {
    window.clearTimeout(finishTimer)
    finishTimer = undefined
  }
}

const finish = () => {
  if (completed) return
  completed = true
  clearFinishTimer()
  leaving.value = true
  // Fade the ident with the 300ms visual leave so the encoded tail resolves cleanly.
  const el = ident.value
  if (el && !el.paused) {
    const startVol = el.volume
    const t0 = performance.now()
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / 300)
      el.volume = Math.max(0, startVol * (1 - u))
      if (u < 1) requestAnimationFrame(step)
      else el.pause()
    }
    requestAnimationFrame(step)
  }
  removeTimer = window.setTimeout(() => emit('complete'), 300)
}

/** Prefer finishing when the opening track ends; safety timeout covers play failures. */
const onAudioEnded = () => {
  if (!entered.value || completed) return
  clearFinishTimer()
  finish()
}

/** Skip: stop audio and leave immediately (short fade). */
const skip = () => {
  if (completed) return
  stopOpeningSound()
  clearFinishTimer()
  if (!entered.value) entered.value = true
  finish()
}

const startExperience = () => {
  if (entered.value || completed) return
  playOpeningSound()
  entered.value = true
  if (soundOn.value) {
    // Match visual timeline to ~8.9s music; finish on ended or safety timeout.
    finishTimer = window.setTimeout(finish, MUSIC_SAFETY_MS)
  } else {
    // Opening sound off — short preloader, no audio element path.
    finishTimer = window.setTimeout(
      finish,
      reducedMotion.value ? SHORT_REDUCED_MS : SHORT_NORMAL_MS
    )
  }
}

onMounted(() => {
  hydrate()
  reducedMotion.value = prefersReducedMotion()
})

onBeforeUnmount(() => {
  clearFinishTimer()
  if (removeTimer) window.clearTimeout(removeTimer)
  ident.value?.pause()
})
</script>

<template>
  <div
    class="preloader"
    :class="{
      'preloader--entered': entered,
      'preloader--leaving': leaving,
      'preloader--music': soundOn && entered
    }"
  >
    <audio
      v-if="identSrc"
      ref="ident"
      class="preloader__audio"
      :src="identSrc"
      preload="auto"
      playsinline
      aria-hidden="true"
      @ended="onAudioEnded"
    />

    <button
      v-if="!entered"
      type="button"
      class="preloader__entry"
      :aria-label="soundOn ? 'Tap to enter Entertrainer with sound' : 'Tap to enter Entertrainer'"
      @click="startExperience"
    >
      <svg class="preloader__entry-logo" viewBox="0 0 240 240" aria-hidden="true">
        <circle class="preloader__entry-ring" cx="120" cy="120" r="94" />
        <circle class="preloader__entry-ring" cx="120" cy="120" r="62" />
        <circle class="preloader__entry-ring" cx="120" cy="120" r="30" />
        <text class="preloader__entry-e" x="120" y="158" text-anchor="middle">e</text>
      </svg>
      <svg class="preloader__entry-orbit" viewBox="0 0 400 400" aria-hidden="true">
        <defs><path id="entry-orbit-path" d="M 200,200 m -145,0 a 145,145 0 1,1 290,0 a 145,145 0 1,1 -290,0" /></defs>
        <text><textPath href="#entry-orbit-path" startOffset="0%">TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · </textPath></text>
      </svg>
      <span class="sr-only">Tap to enter</span>
    </button>

    <div v-else class="preloader__stage" aria-hidden="true">
      <div class="preloader__rings"><i></i><i></i><i></i><i></i></div>
      <div class="preloader__brand-shell">
        <span class="preloader__word">entertrainer</span>
        <p v-if="soundOn" class="preloader__lyrics">
          <span>अविद्याना-मन्त-स्तिमिर-मिहिर द्वीपनगरी</span>
          <span>जडानां चैतन्य-स्तबक मकरन्द श्रुतिझरी</span>
        </p>
      </div>
    </div>

    <button
      type="button"
      class="preloader__skip"
      :class="{ 'preloader__skip--on': entered }"
      aria-label="Skip opening"
      @click.stop="skip"
    >
      Skip
    </button>

    <span class="sr-only" role="status" aria-live="polite">{{ entered ? 'Preparing Entertrainer' : 'Tap to enter Entertrainer' }}</span>
  </div>
</template>

<style scoped>
/* Selected identity: a direct visitor gesture unlocks the sound and shockwave sequence. */
.preloader {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #fffaf0;
  color: #15120f;
  transition: opacity 300ms cubic-bezier(.3, 0, 1, 1), visibility 300ms step-end;
}
.preloader--leaving { opacity: 0; visibility: hidden; pointer-events: none; }
.preloader__audio { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

.preloader__entry {
  position: relative;
  display: grid;
  place-items: center;
  width: min(236rem, 58vw);
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  background: transparent;
  color: #15120f;
  cursor: pointer;
}
.preloader__entry-logo { position: relative; z-index: 1; display: block; width: 80%; height: auto; overflow: visible; transition: transform 220ms cubic-bezier(.16, 1, .3, 1); }
.preloader__entry-ring { fill: none; stroke: #ffd43b; stroke-width: 18; }
.preloader__entry-e { fill: #15120f; font-family: var(--font-ui), Arial, sans-serif; font-size: 144rem; font-weight: 900; letter-spacing: -.1em; }
.preloader__entry-orbit { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; animation: pl-entry-orbit 24s linear infinite; }
.preloader__entry-orbit text { fill: #15120f; font-family: var(--font-mono), monospace; font-size: 10rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.preloader__entry:hover .preloader__entry-logo { transform: scale(1.025); }
.preloader__entry:focus-visible { outline: 3rem solid #15120f; outline-offset: 10rem; border-radius: 50%; }
.preloader__entry:active .preloader__entry-logo { transform: scale(.975); }

.preloader__stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(860rem, 92vw);
  aspect-ratio: 1.52;
  isolation: isolate;
}
.preloader__rings { position: absolute; z-index: 0; inset: 0; display: grid; place-items: center; }
.preloader__rings i {
  position: absolute;
  box-sizing: border-box;
  border: clamp(22rem, 3.1vw, 48rem) solid #ffd43b;
  border-radius: 50%;
  opacity: 0;
  transform: scale(.42);
  animation:
    pl-ring-arrive 1500ms cubic-bezier(.16, 1, .3, 1) var(--pl-ring-delay) both,
    pl-ring-breathe 1750ms ease-in-out calc(1480ms + var(--pl-ring-delay)) 1 both;
}
.preloader__rings i:nth-child(1) { --pl-ring-delay: 0ms; width: 30%; aspect-ratio: 1; }
.preloader__rings i:nth-child(2) { --pl-ring-delay: 110ms; width: 48%; aspect-ratio: 1; }
.preloader__rings i:nth-child(3) { --pl-ring-delay: 220ms; width: 68%; aspect-ratio: 1; }
.preloader__rings i:nth-child(4) { --pl-ring-delay: 330ms; width: 88%; aspect-ratio: 1; }
.preloader__brand-shell {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  gap: 28rem;
  opacity: 0;
  transform: scale(.94);
  animation: pl-word-arrive 760ms cubic-bezier(.16, 1, .3, 1) 540ms both;
}
.preloader__word {
  color: #15120f;
  font-family: var(--font-ui), Arial, sans-serif;
  font-size: clamp(52rem, 9.4vw, 142rem);
  font-weight: 900;
  letter-spacing: -.082em;
  line-height: .82;
  text-wrap: nowrap;
}
.preloader__brand-shell::after {
  position: absolute;
  z-index: -1;
  right: 6%;
  bottom: -18rem;
  width: 32%;
  height: 14rem;
  content: '';
  border-radius: 50%;
  background: rgb(92 68 0 / .14);
  filter: blur(10rem);
  transform: scaleX(.6);
  opacity: 0;
  animation: pl-shadow-arrive 800ms cubic-bezier(.16, 1, .3, 1) 760ms both;
}

/* Music-on timeline ~8.9s: slower arrive, longer hold/breathe to land with the track. */
.preloader--music .preloader__rings i {
  animation:
    pl-ring-arrive 2600ms cubic-bezier(.16, 1, .3, 1) var(--pl-ring-delay) both,
    pl-ring-breathe 2400ms ease-in-out calc(2500ms + var(--pl-ring-delay)) 2 both;
}
.preloader--music .preloader__rings i:nth-child(1) { --pl-ring-delay: 0ms; }
.preloader--music .preloader__rings i:nth-child(2) { --pl-ring-delay: 180ms; }
.preloader--music .preloader__rings i:nth-child(3) { --pl-ring-delay: 360ms; }
.preloader--music .preloader__rings i:nth-child(4) { --pl-ring-delay: 540ms; }
.preloader--music .preloader__brand-shell {
  animation: pl-word-arrive 1400ms cubic-bezier(.16, 1, .3, 1) 1100ms both;
}
.preloader--music .preloader__brand-shell::after {
  animation: pl-shadow-arrive 1200ms cubic-bezier(.16, 1, .3, 1) 1800ms both;
}

.preloader__lyrics {
  display: grid;
  gap: 6rem;
  margin: 0;
  max-width: min(520rem, 86vw);
  color: #15120f;
  font-family: "Noto Sans Devanagari", "Devanagari Sangam MN", "Noto Serif Devanagari", Georgia, serif;
  font-size: clamp(11rem, 1.7vw, 15rem);
  font-weight: 400;
  letter-spacing: .02em;
  line-height: 1.45;
  text-align: center;
  opacity: 0;
  animation: pl-lyrics-in 1600ms cubic-bezier(.16, 1, .3, 1) 2800ms both;
}
.preloader__lyrics span { display: block; opacity: .38; }

/* Ghost Skip pill — cream/ink DNA; almost invisible until hover/focus. */
.preloader__skip {
  position: absolute;
  z-index: 2;
  bottom: max(28rem, 4vh);
  left: 50%;
  transform: translateX(-50%);
  padding: 8rem 16rem;
  border: 1px solid rgb(21 18 15 / .08);
  border-radius: 999px;
  background: rgb(255 250 240 / .35);
  color: #15120f;
  font-family: var(--font-ui), Arial, sans-serif;
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: .04em;
  line-height: 1;
  cursor: pointer;
  opacity: .14;
  transition: opacity 220ms ease, background 220ms ease, border-color 220ms ease;
}
.preloader__skip--on { opacity: .22; }
.preloader__skip:hover,
.preloader__skip:focus-visible {
  opacity: .72;
  background: rgb(255 250 240 / .85);
  border-color: rgb(21 18 15 / .18);
  outline: none;
}
.preloader__skip:focus-visible {
  outline: 2rem solid #15120f;
  outline-offset: 3rem;
}

@keyframes pl-entry-orbit { to { transform: rotate(360deg); } }
@keyframes pl-ring-arrive {
  0% { opacity: 0; transform: scale(.36) rotate(-10deg); }
  58% { opacity: 1; transform: scale(1.035) rotate(1deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes pl-ring-breathe {
  0%, 100% { transform: scale(1); }
  48% { transform: scale(1.035); }
}
@keyframes pl-word-arrive {
  0% { opacity: 0; transform: scale(.94) translateY(16rem); filter: blur(5rem); }
  66% { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: none; filter: none; }
}
@keyframes pl-shadow-arrive { to { opacity: .78; transform: scaleX(1); } }
@keyframes pl-lyrics-in {
  0% { opacity: 0; transform: translateY(10rem); }
  100% { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .preloader { transition-duration: 80ms; }
  .preloader *,
  .preloader *::before,
  .preloader *::after { animation: none !important; }
  .preloader__entry-orbit { transform: none; }
  .preloader__rings i { opacity: 1; transform: scale(1); }
  .preloader__brand-shell { opacity: 1; transform: none; }
  .preloader__brand-shell::after { opacity: .55; transform: scaleX(1); }
  .preloader__lyrics { opacity: 1; }
}
:global(html[data-reduce-motion="on"]) .preloader { transition-duration: 80ms; }
:global(html[data-reduce-motion="on"]) .preloader *,
:global(html[data-reduce-motion="on"]) .preloader *::before,
:global(html[data-reduce-motion="on"]) .preloader *::after { animation: none !important; }
:global(html[data-reduce-motion="on"]) .preloader__entry-orbit { transform: none; }
:global(html[data-reduce-motion="on"]) .preloader__rings i { opacity: 1; transform: scale(1); }
:global(html[data-reduce-motion="on"]) .preloader__brand-shell { opacity: 1; transform: none; }
:global(html[data-reduce-motion="on"]) .preloader__brand-shell::after { opacity: .55; transform: scaleX(1); }
:global(html[data-reduce-motion="on"]) .preloader__lyrics { opacity: 1; }
</style>
