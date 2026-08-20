<!-- Minimal logo preloader: the five-bar Entertrainer signal is the only illustration. -->
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
    <div class="preloader__stage">
      <div class="preloader__signal" aria-hidden="true">
        <span class="signal__shadow" />
        <span class="signal__bars"><i /><i /><i /><i /><i /></span>
      </div>
      <p class="preloader__word">entertrainer</p>
    </div>
    <span class="sr-only">Preparing Entertrainer</span>
  </div>
</template>

<style scoped>
/* Minimal premium motion: one hero mark, one shadow, one finishing light pass. */
.preloader { position: fixed; inset: 0; z-index: 5000; display: grid; place-items: center; overflow: hidden; background: radial-gradient(circle at center, #202027 0%, #141418 56%); color: #fffdf7; transition: opacity 360ms cubic-bezier(.3, 0, 1, 1), visibility 360ms step-end; }
.preloader--leaving { opacity: 0; visibility: hidden; pointer-events: none; }
.preloader__stage { position: relative; display: grid; justify-items: center; gap: 14px; }.preloader__signal { position: relative; width: min(252px, 68vw); padding: 18px 20px 34px; }.signal__shadow { position: absolute; left: 16%; right: 16%; bottom: 22px; height: 12px; border-radius: 50%; background: rgb(0 0 0 / .46); filter: blur(8px); opacity: 0; transform: scaleX(.58); animation: shadow-arrive 520ms cubic-bezier(.05,.7,.1,1) 110ms both; }.signal__bars { position: relative; display: flex; align-items: stretch; justify-content: center; gap: 9px; height: 110px; padding: 12px; overflow: hidden; background: #09090b; border: 1px solid rgb(255 255 255 / .17); border-radius: 20px; box-shadow: 0 20px 48px rgb(0 0 0 / .32), inset 0 1px 0 rgb(255 255 255 / .11); }.signal__bars::after { position: absolute; inset: 0; content: ''; background: linear-gradient(112deg, transparent 37%, rgb(255 255 255 / .18) 50%, transparent 63%); transform: translateX(-125%); animation: signal-sweep 760ms cubic-bezier(.05,.7,.1,1) 660ms both; }.signal__bars i { --bar-delay: 0ms; position: relative; z-index: 1; display: block; width: 18px; border-radius: 5px; background: #4e28d8; transform-origin: center bottom; opacity: 0; animation: bar-land 560ms cubic-bezier(.175,.885,.32,1.1) var(--bar-delay) both; }.signal__bars i:nth-child(2) { --bar-delay: 70ms; background: #6458e4; }.signal__bars i:nth-child(3) { --bar-delay: 140ms; background: #5d79e9; }.signal__bars i:nth-child(4) { --bar-delay: 210ms; background: #5299e8; }.signal__bars i:nth-child(5) { --bar-delay: 280ms; background: #8bc5f2; }.preloader__word { margin: 0; font-family: var(--font-ui, Arial, sans-serif); font-size: clamp(26px, 5vw, 33px); font-weight: 720; letter-spacing: -.06em; opacity: 0; animation: word-arrive 500ms cubic-bezier(.05,.7,.1,1) 520ms both; }
@keyframes shadow-arrive { from { opacity: 0; transform: scaleX(.58); } to { opacity: .88; transform: scaleX(1); } } @keyframes bar-land { from { opacity: 0; transform: translateY(48px) scaleY(.25); } 72% { opacity: 1; transform: translateY(-2px) scaleY(1.025); } to { opacity: 1; transform: none; } } @keyframes signal-sweep { from { transform: translateX(-125%); } to { transform: translateX(125%); } } @keyframes word-arrive { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (max-width: 520px) { .preloader__signal { width: min(242px, 74vw); }.signal__bars { gap: 8px; height: 102px; padding: 11px; }.signal__bars i { width: 17px; } }
@media (prefers-reduced-motion: reduce) { .preloader { transition-duration: 100ms; }.preloader *, .preloader *::before, .preloader *::after { animation: none !important; }.signal__shadow, .signal__bars i, .preloader__word { opacity: 1; transform: none; } }
</style>
