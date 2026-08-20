<!-- Compact theme-aware loader: a three-second five-bar logo sequence gates all site content. -->
<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()

const leaving = ref(false)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const visibleFor = reduced ? 140 : 3000
  const handoffFor = reduced ? 80 : 260

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
    <div class="preloader__stage">
      <div class="preloader__signal" aria-hidden="true"><span class="signal__shadow" /><span class="signal__bars"><i /><i /><i /><i /><i /></span></div>
      <p class="preloader__word">entertrainer</p>
    </div>
    <span class="sr-only">Preparing Entertrainer</span>
  </div>
</template>

<style scoped>
/* Compact premium loading sequence: rise, settle, single light pass, brief quiet hold, then complete. */
.preloader { position: fixed; inset: 0; z-index: 5000; display: grid; place-items: center; overflow: hidden; background: var(--paper); color: var(--ink); transition: opacity 260ms var(--ease-in), visibility 260ms step-end; }.preloader--leaving { opacity: 0; visibility: hidden; pointer-events: none; }.preloader__stage { display: grid; justify-items: center; gap: 10rem; }.preloader__signal { position: relative; width: min(184rem, 58vw); padding: 12rem 14rem 25rem; }.signal__shadow { position: absolute; left: 18%; right: 18%; bottom: 16rem; height: 8rem; border-radius: 50%; background: rgb(0 0 0 / .16); filter: blur(5rem); opacity: 0; transform: scaleX(.6); animation: loader-shadow 480ms var(--ease-out) 100ms both; }.signal__bars { position: relative; display: flex; justify-content: center; gap: 6rem; height: 76rem; padding: 8rem; overflow: hidden; background: var(--ink); border: var(--stroke) solid var(--ink); border-radius: 14rem; box-shadow: 0 12rem 28rem rgb(0 0 0 / .12), inset 0 1rem 0 rgb(255 255 255 / .12); }.signal__bars::after { position: absolute; inset: 0; content: ''; background: linear-gradient(112deg, transparent 38%, rgb(255 255 255 / .2) 50%, transparent 62%); transform: translateX(-125%); animation: loader-sweep 620ms var(--ease-out) 880ms both; }.signal__bars i { --bar-delay: 0ms; position: relative; z-index: 1; display: block; width: 12rem; border-radius: 4rem; background: #4e28d8; transform-origin: center bottom; opacity: 0; animation: loader-bar 460ms var(--ease-spring) var(--bar-delay) both, loader-hold 740ms var(--ease-in-out) calc(1500ms + var(--bar-delay)) both; }.signal__bars i:nth-child(2) { --bar-delay: 60ms; background: #6458e4; }.signal__bars i:nth-child(3) { --bar-delay: 120ms; background: #5d79e9; }.signal__bars i:nth-child(4) { --bar-delay: 180ms; background: #5299e8; }.signal__bars i:nth-child(5) { --bar-delay: 240ms; background: #8bc5f2; }.preloader__word { margin: 0; font-family: var(--font-ui, Arial, sans-serif); font-size: 22rem; font-weight: 720; letter-spacing: -.06em; opacity: 0; animation: loader-word 500ms var(--ease-out) 560ms both; }:global(html[data-theme="dark"]) .preloader { background: var(--paper); color: var(--ink); }:global(html[data-theme="dark"]) .signal__bars { background: #15151a; border-color: var(--line-strong); box-shadow: 0 12rem 28rem rgb(0 0 0 / .42), inset 0 1rem 0 rgb(255 255 255 / .1); }:global(html[data-theme="dark"]) .signal__shadow { background: rgb(0 0 0 / .58); }
@keyframes loader-shadow { from { opacity: 0; transform: scaleX(.6); } to { opacity: .82; transform: scaleX(1); } } @keyframes loader-bar { from { opacity: 0; transform: translateY(34rem) scaleY(.28); } 74% { opacity: 1; transform: translateY(-1rem) scaleY(1.02); } to { opacity: 1; transform: none; } } @keyframes loader-sweep { from { transform: translateX(-125%); } to { transform: translateX(125%); } } @keyframes loader-word { from { opacity: 0; transform: translateY(6rem); } to { opacity: 1; transform: none; } } @keyframes loader-hold { 0%, 100% { transform: none; } 48% { transform: translateY(-1rem) scaleY(1.025); } }
@media (prefers-reduced-motion: reduce) { .preloader { transition-duration: 80ms; }.preloader *, .preloader *::before, .preloader *::after { animation: none !important; }.signal__shadow, .signal__bars i, .preloader__word { opacity: 1; transform: none; } }
</style>
