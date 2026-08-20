<!-- Logo-led preloader: the five-bar Entertrainer signal is the hero; route trace and halo are supporting motion layers. -->
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
    <div class="preloader__field" aria-hidden="true"><i class="preloader__orbit preloader__orbit--one" /><i class="preloader__orbit preloader__orbit--two" /><i class="preloader__spark preloader__spark--one" /><i class="preloader__spark preloader__spark--two" /></div>

    <div class="preloader__stage">
      <div class="preloader__signal" aria-hidden="true">
        <span class="signal__shadow" />
        <span class="signal__bars"><i /><i /><i /><i /><i /></span>
        <svg class="signal__route" viewBox="0 0 300 56" fill="none" preserveAspectRatio="none"><path d="M4 35c34 0 45-16 72-16 33 0 42 27 77 27 39 0 39-32 82-32 23 0 37 10 61 10" /></svg>
      </div>
      <p class="preloader__word">entertrainer</p>
      <p class="preloader__note">making the route visible</p>
    </div>
    <span class="sr-only">Preparing Entertrainer</span>
  </div>
</template>

<style scoped>
/* Premium brand motion: hero bars land in sequence, route trace follows, ambient halo settles behind; all travel uses transform or opacity. */
.preloader { position: fixed; inset: 0; z-index: 5000; display: grid; place-items: center; overflow: hidden; background: #141418; color: #fffdf7; transition: opacity 360ms cubic-bezier(.3, 0, 1, 1), visibility 360ms step-end; }
.preloader::before { position: absolute; inset: 0; content: ''; background-image: radial-gradient(circle at 1px 1px, rgb(255 255 255 / .08) 1px, transparent 0); background-size: 24px 24px; opacity: .26; mask-image: radial-gradient(ellipse 55% 46% at center, #000 12%, transparent 74%); }
.preloader--leaving { opacity: 0; visibility: hidden; pointer-events: none; }
.preloader__field { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }.preloader__orbit { position: absolute; left: 50%; top: 50%; display: block; border: 1px solid rgb(139 197 242 / .21); border-radius: 50%; transform: translate(-50%, -50%) scale(.76); opacity: 0; animation: orbit-arrive 940ms cubic-bezier(.05, .7, .1, 1) both; }.preloader__orbit--one { width: min(74vw, 780px); aspect-ratio: 1; animation-delay: 80ms; }.preloader__orbit--two { width: min(49vw, 500px); aspect-ratio: 1; border-color: rgb(100 88 228 / .34); animation-delay: 220ms; }.preloader__spark { position: absolute; display: block; width: 9px; aspect-ratio: 1; border-radius: 50%; opacity: 0; background: #e8b933; box-shadow: 0 0 0 6px rgb(232 185 51 / .09); animation: spark-arrive 520ms cubic-bezier(.05, .7, .1, 1) both; }.preloader__spark--one { left: calc(50% - min(33vw, 346px)); top: calc(50% - min(17vw, 174px)); animation-delay: 540ms; }.preloader__spark--two { left: calc(50% + min(30vw, 316px)); top: calc(50% + min(13vw, 140px)); width: 6px; background: #8bc5f2; box-shadow: 0 0 0 5px rgb(139 197 242 / .09); animation-delay: 680ms; }
.preloader__stage { position: relative; z-index: 1; display: grid; justify-items: center; gap: 8px; }.preloader__signal { position: relative; width: min(300px, 76vw); padding: 30px 26px 48px; }.signal__shadow { position: absolute; left: 10%; right: 10%; bottom: 35px; height: 14px; border-radius: 50%; background: rgb(0 0 0 / .42); filter: blur(8px); opacity: 0; transform: scaleX(.52); animation: shadow-arrive 560ms cubic-bezier(.05, .7, .1, 1) 140ms both; }.signal__bars { position: relative; z-index: 1; display: flex; align-items: stretch; justify-content: center; gap: 10px; height: 122px; padding: 12px; overflow: hidden; background: #08080a; border: 1px solid rgb(255 255 255 / .18); border-radius: 22px; box-shadow: 0 22px 58px rgb(0 0 0 / .36), inset 0 1px 0 rgb(255 255 255 / .12); }.signal__bars::before { position: absolute; inset: 0; content: ''; background: linear-gradient(115deg, transparent 34%, rgb(255 255 255 / .22) 48%, transparent 62%); transform: translateX(-125%); animation: signal-sweep 940ms cubic-bezier(.05, .7, .1, 1) 700ms both; }.signal__bars i { --bar-delay: 0ms; position: relative; z-index: 1; display: block; width: 20px; border-radius: 6px; background: #4e28d8; transform-origin: center bottom; opacity: 0; animation: bar-land 650ms cubic-bezier(.175, .885, .32, 1.12) var(--bar-delay) both; }.signal__bars i:nth-child(2) { --bar-delay: 80ms; background: #6458e4; }.signal__bars i:nth-child(3) { --bar-delay: 160ms; background: #5d79e9; }.signal__bars i:nth-child(4) { --bar-delay: 240ms; background: #5299e8; }.signal__bars i:nth-child(5) { --bar-delay: 320ms; background: #8bc5f2; }.signal__route { position: absolute; z-index: 2; left: 0; right: 0; bottom: 10px; width: 100%; height: 56px; overflow: visible; }.signal__route path { stroke: #e8b933; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 340; stroke-dashoffset: 340; filter: drop-shadow(0 0 7px rgb(232 185 51 / .38)); animation: route-draw 720ms cubic-bezier(.05, .7, .1, 1) 500ms both; }.preloader__word { margin: 0; font-family: var(--font-ui, Arial, sans-serif); font-size: clamp(27px, 5vw, 35px); font-weight: 720; letter-spacing: -.06em; opacity: 0; animation: word-arrive 580ms cubic-bezier(.05, .7, .1, 1) 660ms both; }.preloader__note { margin: 0; color: rgb(255 253 247 / .64); font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .16em; text-transform: uppercase; opacity: 0; animation: note-arrive 480ms cubic-bezier(.05, .7, .1, 1) 810ms both; }
@keyframes orbit-arrive { from { opacity: 0; transform: translate(-50%, -50%) scale(.76) rotate(-16deg); } to { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0); } } @keyframes spark-arrive { from { opacity: 0; transform: scale(.2); } to { opacity: 1; transform: scale(1); } } @keyframes shadow-arrive { from { opacity: 0; transform: scaleX(.52); } to { opacity: .9; transform: scaleX(1); } } @keyframes bar-land { from { opacity: 0; transform: translateY(58px) scaleY(.2); } 72% { opacity: 1; transform: translateY(-3px) scaleY(1.035); } to { opacity: 1; transform: none; } } @keyframes signal-sweep { from { transform: translateX(-125%); } to { transform: translateX(125%); } } @keyframes route-draw { to { stroke-dashoffset: 0; } } @keyframes word-arrive { from { opacity: 0; transform: translateY(10px); letter-spacing: -.02em; } to { opacity: 1; transform: none; } } @keyframes note-arrive { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: none; } }
@media (max-width: 520px) { .preloader__signal { width: min(290px, 84vw); padding-left: 18px; padding-right: 18px; }.signal__bars { gap: 8px; height: 112px; padding: 11px; }.signal__bars i { width: 18px; }.preloader__orbit--one { width: 118vw; }.preloader__orbit--two { width: 76vw; } }
@media (prefers-reduced-motion: reduce) { .preloader { transition-duration: 100ms; }.preloader *, .preloader *::before, .preloader *::after { animation: none !important; }.preloader__orbit { opacity: .72; transform: translate(-50%, -50%) scale(1); }.preloader__spark, .signal__shadow, .signal__bars i, .preloader__word, .preloader__note { opacity: 1; transform: none; }.signal__route path { stroke-dashoffset: 0; } }
</style>
