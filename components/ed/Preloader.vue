<!-- Actual Entertrainer wordmark: one finite cinematic reveal. -->
<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()
const leaving = ref(false)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined
let completed = false

const finish = () => {
  if (completed) return
  completed = true
  leaving.value = true
  removeTimer = window.setTimeout(() => emit('complete'), 300)
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  finishTimer = window.setTimeout(finish, reduced ? 140 : 2700)
})
onBeforeUnmount(() => { if (finishTimer) window.clearTimeout(finishTimer); if (removeTimer) window.clearTimeout(removeTimer) })
</script>

<template>
  <div class="preloader" :class="{ 'preloader--leaving': leaving }" role="status" aria-live="polite" aria-label="Preparing Entertrainer">
    <div class="preloader__stage" aria-hidden="true"><div class="preloader__brand-shell"><EdWordmark class="preloader__brand" variant="full" :size="34" /></div></div>
    <span class="sr-only">Preparing Entertrainer</span>
  </div>
</template>

<style scoped>
/* Premium sequence: five rigid signal bars land in depth, then the actual wordmark resolves. */
.preloader { position:fixed; inset:0; z-index:5000; display:grid; place-items:center; overflow:hidden; background:#fff; color:#161618; transition:opacity 300ms cubic-bezier(.3,0,1,1), visibility 300ms step-end; }.preloader--leaving { opacity:0; visibility:hidden; pointer-events:none; }.preloader__stage { position:relative; z-index:1; display:grid; place-items:center; width:min(360rem,82vw); perspective:720rem; }.preloader__brand-shell { position:relative; display:grid; place-items:center; min-height:58rem; padding:14rem 18rem; opacity:0; transform:translate3d(0,12rem,0) scale(.975); animation:pl-shell-arrive 480ms cubic-bezier(.05,.7,.1,1) 70ms both; }.preloader__brand-shell::after { content:''; position:absolute; z-index:0; left:16%; right:8%; bottom:6rem; height:9rem; border-radius:50%; background:rgb(26 38 80 / .16); filter:blur(7rem); transform:scaleX(.55); opacity:0; animation:pl-shadow-land 780ms cubic-bezier(.16,1,.3,1) 250ms both; }.preloader__brand { --wm-size:34rem; position:relative; z-index:1; }.preloader__brand :deep(.wm) { gap:8rem; color:#161618; }.preloader__brand :deep(.wm__signal) { padding:3rem; border-radius:3rem; box-shadow:8rem 9rem 0 #d3e1f5; overflow:visible; transform-style:preserve-3d; }.preloader__brand :deep(.wm__signal i) { animation:pl-signal-bar 720ms cubic-bezier(.12,.78,.18,1) var(--pl-bar-delay) both !important; backface-visibility:hidden; transform-origin:center bottom; }.preloader__brand :deep(.wm__signal i:nth-child(1)) { --pl-bar-delay:120ms; }.preloader__brand :deep(.wm__signal i:nth-child(2)) { --pl-bar-delay:190ms; }.preloader__brand :deep(.wm__signal i:nth-child(3)) { --pl-bar-delay:260ms; }.preloader__brand :deep(.wm__signal i:nth-child(4)) { --pl-bar-delay:330ms; }.preloader__brand :deep(.wm__signal i:nth-child(5)) { --pl-bar-delay:400ms; }.preloader__brand :deep(.wm__word) { overflow:hidden; animation:pl-word-cinema 840ms cubic-bezier(.16,1,.3,1) 680ms both !important; }.preloader__brand :deep(.wm__word)::after { display:none; }
@keyframes pl-shell-arrive { to { opacity:1; transform:none; } } @keyframes pl-shadow-land { 55% { opacity:.92; transform:scaleX(1.06); } to { opacity:.58; transform:scaleX(.92); } } @keyframes pl-signal-bar { from { opacity:0; transform:translate3d(0,28rem,42rem) rotateX(74deg) scaleY(.38); } 62% { opacity:1; transform:translate3d(0,-2rem,0) rotateX(-7deg) scaleY(1.035); } to { opacity:1; transform:none; } } @keyframes pl-word-cinema { from { opacity:0; clip-path:inset(0 100% 0 0); transform:translate3d(-14rem,0,0); filter:blur(3rem); } 72% { opacity:1; filter:blur(0); } to { opacity:1; clip-path:inset(0); transform:none; filter:none; } }
@media (prefers-reduced-motion:reduce) { .preloader { transition-duration:80ms; }.preloader *, .preloader *::before, .preloader *::after { animation:none !important; }.preloader__brand-shell { opacity:1; transform:none; }.preloader__brand-shell::after { opacity:.5; transform:scaleX(.92); } }
</style>
