<!-- Paper Signal preloader: 3s staged mark assembly, then a gated handoff. -->
<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()
const leaving = ref(false)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const visibleFor = reduced ? 140 : 3000
  const handoffFor = reduced ? 80 : 280
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
      <div class="preloader__sheet">
        <span class="preloader__sheet-shadow" />
        <span class="preloader__corner preloader__corner--one" /><span class="preloader__corner preloader__corner--two" />
        <div class="preloader__signal"><span class="signal__baseline" /><span class="signal__bars"><i /><i /><i /><i /><i /></span></div>
        <span class="preloader__sweep" />
      </div>
      <p class="preloader__word"><span>enter</span><span>trainer</span></p>
      <div class="preloader__ledger"><i /><i /><i /><i /><i /></div>
    </div>
    <span class="sr-only">Preparing Entertrainer</span>
  </div>
</template>

<style scoped>
/* Motion: setup 0–420ms, mark assembly 260–1260ms, confirmation 1280–1960ms, word/ledger resolve 1650–2800ms, handoff at 3000ms. */
.preloader { position:fixed; inset:0; z-index:5000; display:grid; place-items:center; overflow:hidden; background:var(--paper); color:var(--ink); transition:opacity 280ms cubic-bezier(.3,0,1,1), visibility 280ms step-end; }.preloader::before { content:''; position:absolute; inset:0; opacity:.42; background:linear-gradient(90deg, transparent 49.9%, var(--line) 50%, transparent 50.1%); background-size:80rem 100%; mask-image:linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent); }.preloader--leaving { opacity:0; visibility:hidden; pointer-events:none; }.preloader__stage { position:relative; display:grid; justify-items:center; gap:17rem; width:min(240rem, 72vw); }.preloader__sheet { position:relative; display:grid; place-items:center; width:156rem; height:102rem; background:var(--paper); border:2rem solid var(--ink); box-shadow:10rem 10rem 0 var(--signal-sheet); opacity:0; transform:translateY(14rem) scale(.96); animation:loader-sheet 520ms cubic-bezier(.05,.7,.1,1) 70ms both; }.preloader__sheet-shadow { position:absolute; left:18%; right:18%; bottom:-19rem; height:8rem; border-radius:50%; background:rgb(0 0 0 / .16); filter:blur(5rem); opacity:0; animation:loader-shadow 520ms cubic-bezier(.05,.7,.1,1) 160ms both; }.preloader__corner { position:absolute; width:10rem; height:10rem; border-color:var(--signal-cobalt); opacity:0; animation:loader-corner 340ms var(--ease-out) 1040ms both; }.preloader__corner--one { top:8rem; left:8rem; border-top:2rem solid; border-left:2rem solid; }.preloader__corner--two { right:8rem; bottom:8rem; border-right:2rem solid; border-bottom:2rem solid; }.preloader__signal { position:relative; display:grid; align-items:end; width:83rem; height:58rem; padding-bottom:7rem; overflow:hidden; }.signal__baseline { position:absolute; right:0; bottom:5rem; left:0; height:2rem; background:var(--ink); transform:scaleX(0); transform-origin:left; animation:loader-baseline 360ms var(--ease-out) 430ms both; }.signal__bars { position:relative; z-index:1; display:flex; align-items:end; justify-content:center; gap:5rem; height:48rem; }.signal__bars i { --delay:0ms; width:9rem; height:42rem; border-radius:2rem 2rem 0 0; background:#4f2dd7; box-shadow:0 1rem 0 rgb(255 255 255 / .24) inset; opacity:0; transform:translateY(44rem) scaleY(.22); transform-origin:center bottom; animation:loader-bar 530ms cubic-bezier(.16,1.08,.32,1) calc(350ms + var(--delay)) both, loader-bar-settle 720ms cubic-bezier(.45,0,.2,1) calc(1550ms + var(--delay)) both; }.signal__bars i:nth-child(2) { --delay:70ms; height:47rem; background:#6358e4; }.signal__bars i:nth-child(3) { --delay:140ms; height:43rem; background:#5e78e9; }.signal__bars i:nth-child(4) { --delay:210ms; height:49rem; background:#5198e8; }.signal__bars i:nth-child(5) { --delay:280ms; height:40rem; background:#8ac3ef; }.preloader__sweep { position:absolute; inset:-2rem; pointer-events:none; background:linear-gradient(106deg, transparent 42%, rgb(255 255 255 / .76) 50%, transparent 58%); transform:translateX(-150%); animation:loader-sweep 620ms cubic-bezier(.2,.8,.2,1) 1280ms both; }.preloader__word { display:flex; gap:0; margin:0; overflow:hidden; color:var(--ink); font-family:var(--font-ui, Arial, sans-serif); font-size:24rem; font-weight:760; letter-spacing:-.065em; line-height:1; }.preloader__word span { display:block; opacity:0; transform:translateY(118%); animation:loader-word 480ms cubic-bezier(.16,1,.3,1) both; }.preloader__word span:nth-child(1) { animation-delay:1650ms; }.preloader__word span:nth-child(2) { animation-delay:1730ms; }.preloader__ledger { display:flex; gap:5rem; height:4rem; }.preloader__ledger i { width:15rem; height:2rem; background:var(--line-strong); transform:scaleX(.2); transform-origin:left; animation:loader-ledger 180ms var(--ease-out) both; }.preloader__ledger i:nth-child(1) { animation-delay:2060ms; background:#4f2dd7; }.preloader__ledger i:nth-child(2) { animation-delay:2140ms; background:#6358e4; }.preloader__ledger i:nth-child(3) { animation-delay:2220ms; background:#5e78e9; }.preloader__ledger i:nth-child(4) { animation-delay:2300ms; background:#5198e8; }.preloader__ledger i:nth-child(5) { animation-delay:2380ms; background:#8ac3ef; }:global(html[data-theme="dark"]) .preloader { background:#0b0b0c; color:#f4f4f2; }:global(html[data-theme="dark"]) .preloader::before { opacity:.12; }:global(html[data-theme="dark"]) .preloader__sheet { background:#15151a; border-color:#f0f0ed; box-shadow:10rem 10rem 0 #252839; }:global(html[data-theme="dark"]) .preloader__sheet-shadow { background:rgb(0 0 0 / .65); }:global(html[data-theme="dark"]) .signal__baseline { background:#f0f0ed; }:global(html[data-theme="dark"]) .preloader__word { color:#f4f4f2; }
@keyframes loader-sheet { to { opacity:1; transform:none; } } @keyframes loader-shadow { to { opacity:.8; transform:scaleX(1); } } @keyframes loader-baseline { to { transform:scaleX(1); } } @keyframes loader-bar { 0% { opacity:0; transform:translateY(44rem) scaleY(.22); } 72% { opacity:1; transform:translateY(-2rem) scaleY(1.035); } 100% { opacity:1; transform:none; } } @keyframes loader-bar-settle { 0%,100% { transform:none; } 38% { transform:translateY(-2rem) scaleY(1.035); } } @keyframes loader-corner { to { opacity:1; } } @keyframes loader-sweep { to { transform:translateX(150%); } } @keyframes loader-word { to { opacity:1; transform:none; } } @keyframes loader-ledger { to { transform:scaleX(1); } }
@media (prefers-reduced-motion:reduce) { .preloader { transition-duration:80ms; }.preloader *, .preloader *::before, .preloader *::after { animation:none !important; }.preloader__sheet, .preloader__word span, .preloader__corner, .signal__bars i { opacity:1; transform:none; }.signal__baseline, .preloader__ledger i { transform:scaleX(1); } }
</style>
