<!-- Motion design: a premium editorial-workspace sequence. One paper card is the hero; pencil, highlight, note, and background dots are staggered secondary/ambient layers. -->
<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()

const leaving = ref(false)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const visibleFor = reduced ? 140 : 1420
  const handoffFor = reduced ? 100 : 360

  finishTimer = window.setTimeout(() => {
    leaving.value = true
    removeTimer = window.setTimeout(() => emit('complete'), handoffFor)
  }, visibleFor)
})

onBeforeUnmount(() => {
  if (finishTimer) window.clearTimeout(finishTimer)
  if (removeTimer) window.clearTimeout(removeTimer)
})
</script>

<template>
  <div class="preloader" :class="{ 'preloader--leaving': leaving }" role="status" aria-live="polite" aria-label="Preparing Entertrainer">
    <div class="preloader__field" aria-hidden="true">
      <i class="preloader__speck preloader__speck--one" />
      <i class="preloader__speck preloader__speck--two" />
      <i class="preloader__speck preloader__speck--three" />
    </div>

    <div class="preloader__stage">
      <svg class="preloader__scene" viewBox="0 0 296 184" aria-hidden="true">
        <ellipse class="scene-shadow" cx="148" cy="157" rx="94" ry="11" fill="currentColor" />
        <g class="scene-sheet">
          <path d="M63 26h122l34 34v83H63z" class="scene-paper" />
          <path d="M185 26v34h34" class="scene-fold" />
          <path class="scene-line scene-line--one" d="M88 77h89" />
          <path class="scene-line scene-line--two" d="M88 92h58" />
          <path class="scene-line scene-line--three" d="M88 106h76" />
          <rect class="scene-highlight" x="80" y="68" width="106" height="19" rx="4" />
        </g>
        <g class="scene-note">
          <rect x="185" y="102" width="58" height="41" rx="5" />
          <circle cx="201" cy="122" r="5" />
          <path d="M212 117h18M212 125h12" />
          <path class="scene-clip" d="M191 103l14-11" />
        </g>
        <g class="scene-pencil" transform="rotate(-22 55 135)">
          <path d="M20 130h63l10 8-10 8H20z" />
          <path d="M12 138l8-8v16z" />
        </g>
        <circle class="scene-dot" cx="56" cy="56" r="6" />
      </svg>
      <p class="preloader__eyebrow">Entertrainer</p>
      <p class="preloader__title">Putting the pieces together</p>
    </div>
    <span class="sr-only">Preparing Entertrainer</span>
  </div>
</template>

<style scoped>
/* Motion design: premium paper material, 1.42s total narrative. Primary card lands first; secondary tools complete its story; ambient specks add non-looping depth. */
.preloader {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--paper, #fffdf7);
  color: #171717;
  transition: opacity 360ms cubic-bezier(.3, 0, 1, 1), visibility 360ms step-end;
}

.preloader--leaving { opacity: 0; visibility: hidden; pointer-events: none; }
.preloader__field { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(44,43,232,.12) 1.1px, transparent 1.2px); background-size: 25px 25px; opacity: .24; mask-image: radial-gradient(ellipse 46% 40% at center, #000 18%, transparent 74%); }
.preloader__speck { position: absolute; width: 10px; height: 10px; border-radius: 50%; opacity: 0; animation: speck-arrive 400ms cubic-bezier(.05,.7,.1,1) both; }
.preloader__speck--one { top: 29%; left: 34%; background: #e35b4f; animation-delay: 330ms; }
.preloader__speck--two { top: 66%; right: 31%; width: 7px; height: 7px; background: #2c2be8; animation-delay: 440ms; }
.preloader__speck--three { top: 39%; right: 28%; width: 13px; height: 13px; background: #e8b933; animation-delay: 520ms; }
.preloader__stage { position: relative; z-index: 1; display: grid; justify-items: center; gap: 2px; }
.preloader__scene { width: min(296px, 78vw); height: auto; overflow: visible; }
.scene-shadow { color: #d9d4c9; opacity: 0; transform-box: fill-box; transform-origin: center; animation: shadow-arrive 520ms cubic-bezier(.05,.7,.1,1) 60ms both; }
.scene-sheet { opacity: .64; transform-box: fill-box; transform-origin: center; animation: sheet-arrive 600ms cubic-bezier(.05,.7,.1,1) 90ms both; }
.scene-paper { fill: #fffdf7; stroke: #171717; stroke-width: 2.7; stroke-linejoin: round; }
.scene-fold { fill: #eee9dd; stroke: #171717; stroke-width: 2.7; stroke-linejoin: round; }
.scene-line { fill: none; stroke: #171717; stroke-linecap: round; transform-box: fill-box; transform-origin: left; opacity: 0; animation: line-write 240ms cubic-bezier(.05,.7,.1,1) both; }
.scene-line--one { stroke-width: 5.2; animation-delay: 310ms; }.scene-line--two { stroke: #6b6861; stroke-width: 3.2; animation-delay: 360ms; }.scene-line--three { stroke: #6b6861; stroke-width: 3.2; animation-delay: 410ms; }
.scene-highlight { fill: #e8b933; opacity: 0; transform-box: fill-box; transform-origin: left; animation: highlight-sweep 470ms cubic-bezier(.05,.7,.1,1) 415ms both; }
.scene-note { opacity: 0; transform-box: fill-box; transform-origin: center; animation: note-arrive 480ms cubic-bezier(.05,.7,.1,1) 550ms both; }
.scene-note rect { fill: #f1eeff; stroke: #171717; stroke-width: 2; }.scene-note circle { fill: #4e28d8; }.scene-note path { fill: none; stroke: #2c2be8; stroke-width: 2; stroke-linecap: round; }.scene-note .scene-clip { stroke: #e35b4f; stroke-width: 4; }
.scene-pencil { opacity: 0; transform-box: fill-box; transform-origin: right center; animation: pencil-arrive 500ms cubic-bezier(.05,.7,.1,1) 430ms both; }.scene-pencil path:first-child { fill: #2c2be8; }.scene-pencil path:last-child { fill: #e8b933; }
.scene-dot { fill: #e35b4f; opacity: 0; transform-box: fill-box; transform-origin: center; animation: dot-pop 320ms cubic-bezier(.175,.885,.32,1.275) 690ms both; }
.preloader__eyebrow { margin: 0; font: 700 11px/1 var(--font-mono, monospace); letter-spacing: .13em; text-transform: uppercase; opacity: 0; animation: copy-arrive 400ms cubic-bezier(.05,.7,.1,1) 770ms both; }
.preloader__title { margin: 0; color: #6b6861; font: 500 10px/1.4 var(--font-ui, Arial, sans-serif); letter-spacing: .11em; text-transform: uppercase; opacity: 0; animation: copy-arrive 400ms cubic-bezier(.05,.7,.1,1) 870ms both; }
@keyframes shadow-arrive { from { opacity: 0; transform: scaleX(.55); } to { opacity: .7; transform: scaleX(1); } }
@keyframes sheet-arrive { from { opacity: .64; transform: translate3d(0,-22px,0) rotate(-5deg) scale(.92); } 70% { opacity: 1; transform: translate3d(0,2px,0) rotate(.8deg) scale(1.02); } to { opacity: 1; transform: none; } }
@keyframes line-write { from { opacity: 0; transform: scaleX(.08); } to { opacity: 1; transform: scaleX(1); } }
@keyframes highlight-sweep { from { opacity: 0; transform: scaleX(.05) skewX(-7deg); } to { opacity: .88; transform: scaleX(1) skewX(0); } }
@keyframes note-arrive { from { opacity: 0; transform: translate3d(19px,-14px,0) rotate(9deg) scale(.82); } 75% { opacity: 1; transform: translate3d(-1px,1px,0) rotate(-.8deg) scale(1.015); } to { opacity: 1; transform: none; } }
@keyframes pencil-arrive { from { opacity: 0; transform: translateX(-30px) rotate(-11deg); } to { opacity: 1; transform: translateX(0) rotate(0); } }
@keyframes dot-pop { from { opacity: 0; transform: scale(.2); } to { opacity: 1; transform: scale(1); } }
@keyframes speck-arrive { from { opacity: 0; transform: translateY(8px) scale(.4); } to { opacity: 1; transform: none; } }
@keyframes copy-arrive { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: none; } }
@media (prefers-color-scheme: dark) { .preloader { background: #131210; color: #f4efe4; }.scene-paper { fill: #f4efe4; }.preloader__title { color: #b8b2a7; }.preloader__field { opacity: .16; } }
@media (prefers-reduced-motion: reduce) { .preloader { transition-duration: 100ms; }.preloader *, .preloader *::before, .preloader *::after { animation: none !important; }.preloader__speck, .scene-shadow, .scene-sheet, .scene-line, .scene-highlight, .scene-note, .scene-pencil, .scene-dot, .preloader__eyebrow, .preloader__title { opacity: 1; transform: none; } }
</style>
