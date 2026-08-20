<!-- Actual Entertrainer logo preloader: finite 3s HTML/CSS motion sequence. -->
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
onBeforeUnmount(() => { if (finishTimer) window.clearTimeout(finishTimer); if (removeTimer) window.clearTimeout(removeTimer) })
</script>

<template>
  <div class="preloader" :class="{ 'preloader--leaving': leaving }" role="status" aria-live="polite" aria-label="Preparing Entertrainer">
    <div class="preloader__stage" aria-hidden="true">
      <div class="preloader__brand-shell"><EdWordmark class="preloader__brand" variant="full" :size="34" /><span class="preloader__glint" /></div>
      <span class="preloader__rule"><i /></span>
      <p class="preloader__message">Preparing a clearer way in</p>
      <span class="preloader__ticks"><i /><i /><i /><i /><i /></span>
    </div>
    <span class="sr-only">Preparing Entertrainer</span>
  </div>
</template>

<style scoped>
/* Narrative: mark arrives (0–900ms), word resolves (900–1650ms), light confirms (1650–2200ms), route ticks complete (2200–3000ms). */
.preloader { position:fixed; inset:0; z-index:5000; display:grid; place-items:center; overflow:hidden; background:var(--paper); color:var(--ink); transition:opacity 260ms cubic-bezier(.3,0,1,1), visibility 260ms step-end; }.preloader::before { content:''; position:absolute; inset:0; opacity:.28; background:linear-gradient(90deg, transparent 49.92%, var(--line) 50%, transparent 50.08%); background-size:120rem 100%; mask-image:linear-gradient(to bottom, transparent, #000 28%, #000 72%, transparent); }.preloader--leaving { opacity:0; visibility:hidden; pointer-events:none; }.preloader__stage { position:relative; z-index:1; display:grid; justify-items:center; gap:16rem; width:min(360rem, 82vw); }.preloader__brand-shell { position:relative; display:grid; place-items:center; min-height:58rem; padding:12rem 16rem; opacity:0; transform:translate3d(0,18rem,0) scale(.94); animation:pl-brand-shell 680ms cubic-bezier(.05,.7,.1,1) 140ms both; }.preloader__brand { --wm-size:34rem; position:relative; z-index:1; }.preloader__brand :deep(.wm) { gap:8rem; }.preloader__brand :deep(.wm__signal) { padding:3rem; border-radius:3rem; box-shadow:8rem 8rem 0 var(--signal-sheet); }.preloader__brand :deep(.wm__signal i) { animation:pl-bar 520ms cubic-bezier(.16,1.08,.32,1) var(--wm-enter-delay) both; }.preloader__brand :deep(.wm__word) { overflow:hidden; animation:pl-word 640ms cubic-bezier(.16,1,.3,1) 680ms both; }.preloader__glint { position:absolute; z-index:2; inset:10rem 8rem; pointer-events:none; background:linear-gradient(104deg, transparent 43%, rgb(255 255 255 / .8) 50%, transparent 57%); mix-blend-mode:screen; transform:translateX(-145%); animation:pl-glint 560ms cubic-bezier(.2,.8,.2,1) 1580ms both; }.preloader__rule { display:block; width:0; height:2rem; background:var(--ink); overflow:hidden; animation:pl-rule 520ms cubic-bezier(.16,1,.3,1) 1760ms both; }.preloader__rule i { display:block; width:34%; height:100%; background:var(--signal-cobalt); }.preloader__message { margin:0; overflow:hidden; color:var(--muted); font-family:var(--font-mono); font-size:10rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase; opacity:0; transform:translateY(8rem); animation:pl-message 440ms var(--ease-out) 1940ms both; }.preloader__ticks { display:flex; gap:4rem; height:3rem; }.preloader__ticks i { width:12rem; height:2rem; background:var(--line-strong); transform:scaleX(.08); transform-origin:left; animation:pl-tick 190ms var(--ease-out) both; }.preloader__ticks i:nth-child(1) { animation-delay:2240ms; background:#4e28d8; }.preloader__ticks i:nth-child(2) { animation-delay:2340ms; background:#6458e4; }.preloader__ticks i:nth-child(3) { animation-delay:2440ms; background:#5d79e9; }.preloader__ticks i:nth-child(4) { animation-delay:2540ms; background:#5299e8; }.preloader__ticks i:nth-child(5) { animation-delay:2640ms; background:#8bc5f2; }:global(html[data-theme="dark"]) .preloader { background:#0b0b0c; color:#f4f4f2; }:global(html[data-theme="dark"]) .preloader::before { opacity:.1; }:global(html[data-theme="dark"]) .preloader__brand :deep(.wm) { color:#f4f4f2; }:global(html[data-theme="dark"]) .preloader__brand :deep(.wm__signal) { box-shadow:8rem 8rem 0 #242a3b; }:global(html[data-theme="dark"]) .preloader__rule { background:#f4f4f2; }
@keyframes pl-brand-shell { to { opacity:1; transform:none; } } @keyframes pl-bar { from { opacity:0; transform:translateY(18rem) scaleY(.3); } 72% { opacity:1; transform:translateY(-2rem) scaleY(1.04); } to { opacity:1; transform:none; } } @keyframes pl-word { from { opacity:0; transform:translateX(-10rem); clip-path:inset(0 100% 0 0); } to { opacity:1; transform:none; clip-path:inset(0); } } @keyframes pl-glint { to { transform:translateX(145%); } } @keyframes pl-rule { to { width:186rem; } } @keyframes pl-message { to { opacity:1; transform:none; } } @keyframes pl-tick { to { transform:scaleX(1); } }
@media (prefers-reduced-motion:reduce) { .preloader { transition-duration:80ms; }.preloader *, .preloader *::before, .preloader *::after { animation:none !important; }.preloader__brand-shell, .preloader__message { opacity:1; transform:none; }.preloader__rule { width:186rem; }.preloader__ticks i { transform:scaleX(1); } }
</style>
