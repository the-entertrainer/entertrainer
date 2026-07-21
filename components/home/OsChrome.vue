<script setup lang="ts">
// "Entertrainer OS" — a retro-computer chrome layer that floats over the live
// spiral. Draggable stickers, a live clock, an open-to-work flag, a dual-colour
// velocity marquee and CRT scanlines. All interactive bits are pointer-events
// islands so the spiral underneath stays fully draggable/clickable.
const props = defineProps<{ path?: string }>()

useHead({
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap' }]
})

const reduce = ref(false)
const clock = ref('--:--:--')
let clockTimer: ReturnType<typeof setInterval> | null = null

const label = computed(() => (props.path && props.path.trim()) ? props.path.trim().toLowerCase().replace(/\s+/g, '-') : 'home')

const MARQUEE = ['I design', 'I build', 'I dare new tech', 'Instructional Designer', 'Learning that feels human', 'Since the hotel floor']

function tick() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  clock.value = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// ── Draggable stickers ──────────────────────────────────────────────
let zTop = 20
function onStickerDown(e: PointerEvent) {
  if (reduce.value) return
  const el = e.currentTarget as HTMLElement
  e.preventDefault(); e.stopPropagation()
  el.setPointerCapture(e.pointerId)
  el.classList.add('is-drag')
  el.style.zIndex = String(++zTop)
  const ox = parseFloat(el.dataset.x || '0')
  const oy = parseFloat(el.dataset.y || '0')
  const sx = e.clientX, sy = e.clientY
  const rot = parseFloat(el.dataset.rot || '0')
  let lastX = sx
  const move = (ev: PointerEvent) => {
    const nx = ox + (ev.clientX - sx)
    const ny = oy + (ev.clientY - sy)
    el.dataset.x = String(nx); el.dataset.y = String(ny)
    const tilt = gsapClamp(-16, 16, (ev.clientX - lastX) * 1.4)
    lastX = ev.clientX
    el.style.transform = `translate(${nx}px, ${ny}px) rotate(${rot + tilt}deg)`
  }
  const up = (ev: PointerEvent) => {
    el.releasePointerCapture(ev.pointerId)
    el.classList.remove('is-drag')
    const nx = el.dataset.x, ny = el.dataset.y
    el.style.transform = `translate(${nx}px, ${ny}px) rotate(${rot}deg)` // settle upright
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
}
function gsapClamp(min: number, max: number, v: number) { return Math.max(min, Math.min(max, v)) }

onMounted(() => {
  reduce.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  tick(); clockTimer = setInterval(tick, 1000)
})
onBeforeUnmount(() => { if (clockTimer) clearInterval(clockTimer) })
</script>

<template>
  <div class="os" :class="{ 'os--reduce': reduce }">
    <!-- CRT scanlines -->
    <div class="os__scan" aria-hidden="true" />

    <!-- Top bar -->
    <div class="os__bar" aria-hidden="true">
      <div class="os__win">
        <span class="os__dots"><i /><i /><i /></span>
        <span class="os__name">entertrainer<span class="os__ext">.os</span></span>
        <span class="os__path">▸ /{{ label }}</span>
      </div>
      <div class="os__status">
        <span class="os__flag"><span class="os__led" /> OPEN TO WORK</span>
        <span class="os__clock">{{ clock }}</span>
      </div>
    </div>

    <!-- Draggable stickers -->
    <button type="button" class="os-sticker os-sticker--floppy" data-rot="-8" aria-label="Floppy disk sticker — drag me" @pointerdown="onStickerDown">
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        <rect x="4" y="4" width="56" height="56" rx="4" fill="#0000f1" />
        <path d="M4 8a4 4 0 0 1 4-4h40l12 12v40a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" fill="#f300c2" />
        <rect x="16" y="4" width="26" height="18" fill="#0d0c0a" />
        <rect x="30" y="7" width="8" height="12" fill="#18ffe8" />
        <rect x="14" y="30" width="36" height="26" rx="2" fill="#ffeefc" />
        <rect x="18" y="35" width="28" height="3" fill="#0d0c0a" opacity="0.6" />
        <rect x="18" y="41" width="28" height="3" fill="#0d0c0a" opacity="0.6" />
        <rect x="18" y="47" width="18" height="3" fill="#0d0c0a" opacity="0.6" />
      </svg>
    </button>

    <button type="button" class="os-sticker os-sticker--star" data-rot="6" aria-label="Sparkle sticker — drag me" @pointerdown="onStickerDown">
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        <path d="M32 2c2 16 12 26 28 30-16 4-26 14-28 30-2-16-12-26-28-30 16-4 26-14 28-30Z" fill="#18ffe8" stroke="#0d0c0a" stroke-width="2.5" stroke-linejoin="round" />
      </svg>
    </button>

    <button type="button" class="os-sticker os-sticker--hand" data-rot="10" aria-label="Wave sticker — drag me" @pointerdown="onStickerDown">
      <span class="os-sticker__chip">hi! 👋</span>
    </button>

    <button type="button" class="os-sticker os-sticker--stamp" data-rot="-14" aria-label="Design build dare stamp — drag me" @pointerdown="onStickerDown">
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <defs><path id="os-stamp-arc" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
        <circle cx="60" cy="60" r="56" fill="#f300c2" stroke="#0d0c0a" stroke-width="2.5" />
        <circle cx="60" cy="60" r="44" fill="none" stroke="#ffeefc" stroke-width="1.5" opacity="0.8" />
        <text fill="#ffeefc" font-family="'Space Mono', monospace" font-size="12.5" font-weight="700" letter-spacing="3.4">
          <textPath href="#os-stamp-arc" startOffset="0">DESIGN ✦ BUILD ✦ DARE ✦ DESIGN ✦ BUILD ✦ DARE ✦</textPath>
        </text>
        <text x="60" y="66" text-anchor="middle" fill="#18ffe8" font-family="'Space Mono', monospace" font-size="26" font-weight="700">N.J</text>
      </svg>
    </button>

    <!-- Hint -->
    <p class="os__hint"><span class="os__caret" />drag to spin · click an app to open</p>

    <!-- Dual-colour marquee -->
    <div class="os__marquee" aria-hidden="true">
      <div class="os__track">
        <template v-for="pass in 2" :key="pass">
          <span v-for="(m, i) in MARQUEE" :key="pass + '-' + i" class="os__mitem" :class="{ 'os__mitem--alt': i % 2 === 1 }">
            {{ m }}<i class="os__sep">✳</i>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.os {
  position: absolute; inset: 0; z-index: 11; pointer-events: none;
  --mag: #f300c2; --cyan: #18ffe8; --blue: #0000f1; --paper: #ffeefc; --ink: #0d0c0a;
  font-family: 'Space Mono', ui-monospace, monospace;
  color: var(--paper);
}

/* Scanlines — barely-there CRT texture */
.os__scan {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.35; mix-blend-mode: soft-light;
  background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px);
}

/* Top bar — clears the corner menu button on the right */
.os__bar {
  position: absolute; top: calc(14rem + var(--safe-top)); left: clamp(14rem, 3vw, 30rem);
  right: calc(76rem + var(--safe-right)); display: flex; align-items: center; justify-content: space-between;
  gap: 14rem; font-size: 12rem;
}
.os__win {
  display: inline-flex; align-items: center; gap: 10rem; padding: 7rem 12rem;
  background: rgba(13,12,10,0.5); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
}
.os__dots { display: inline-flex; gap: 5rem; }
.os__dots i { width: 9rem; height: 9rem; border-radius: 50%; background: var(--mag); box-shadow: 14rem 0 0 var(--cyan), 28rem 0 0 var(--paper); }
.os__dots i + i, .os__dots i + i + i { display: none; }
.os__name { font-weight: 700; letter-spacing: 0.02em; margin-left: 16rem; }
.os__ext { color: var(--cyan); }
.os__path { color: rgba(255,238,252,0.6); }
.os__status { display: inline-flex; align-items: center; gap: 10rem; }
.os__flag {
  display: inline-flex; align-items: center; gap: 7rem; padding: 7rem 11rem; font-weight: 700; font-size: 11rem;
  letter-spacing: 0.08em; background: var(--mag); color: var(--ink); border: 1px solid var(--ink);
}
.os__led { width: 8rem; height: 8rem; border-radius: 50%; background: #12ff5f; box-shadow: 0 0 8rem #12ff5f; animation: os-blink 1.4s steps(1) infinite; }
.os__clock {
  padding: 7rem 11rem; font-weight: 700; letter-spacing: 0.08em; font-size: 11.5rem;
  background: rgba(13,12,10,0.5); border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
@keyframes os-blink { 0%, 60% { opacity: 1 } 61%, 100% { opacity: 0.25 } }
@media (max-width: 620px) {
  .os__path, .os__clock { display: none; }
  .os__bar { right: calc(70rem + var(--safe-right)); }
}

/* Stickers */
.os-sticker {
  position: absolute; pointer-events: auto; padding: 0; border: 0; background: none; cursor: grab;
  filter: drop-shadow(3rem 5rem 0 rgba(13,12,10,0.35)); touch-action: none; will-change: transform;
  animation: os-float 6s ease-in-out infinite;
}
.os-sticker.is-drag { cursor: grabbing; animation: none; filter: drop-shadow(6rem 10rem 0 rgba(13,12,10,0.4)); }
.os--reduce .os-sticker { animation: none; }
.os-sticker--floppy { width: 74rem; height: 74rem; left: 6vw; top: 30vh; transform: rotate(-8deg); animation-delay: -0.5s; }
.os-sticker--star   { width: 52rem; height: 52rem; right: 12vw; top: 24vh; transform: rotate(6deg); animation-delay: -2s; }
.os-sticker--hand   { right: 8vw; bottom: 24vh; transform: rotate(10deg); animation-delay: -3.4s; }
.os-sticker--stamp  { width: 104rem; height: 104rem; left: 9vw; bottom: 18vh; transform: rotate(-14deg); animation-delay: -1.2s; }
.os-sticker__chip {
  display: inline-block; padding: 10rem 16rem; background: var(--cyan); color: var(--ink); font-weight: 700; font-size: 15rem;
  border: 1.5px solid var(--ink); white-space: nowrap;
}
.os-sticker--stamp { animation-name: os-spin-float; }
.os-sticker:focus-visible { outline: 2px solid var(--cyan); outline-offset: 4px; }
@keyframes os-float { 0%, 100% { translate: 0 0 } 50% { translate: 0 -8rem } }
@keyframes os-spin-float { 0%, 100% { translate: 0 0 } 50% { translate: 0 -6rem } }

/* Hide the busier stickers on small screens to keep it clean */
@media (max-width: 720px) {
  .os-sticker--star { display: none; }
  .os-sticker--floppy { width: 56rem; height: 56rem; top: auto; bottom: 30vh; left: 5vw; }
  .os-sticker--stamp { width: 82rem; height: 82rem; left: auto; right: 6vw; bottom: 30vh; }
}

/* Hint */
.os__hint {
  position: absolute; left: 50%; bottom: calc(72rem + var(--safe-bottom)); translate: -50% 0;
  margin: 0; font-size: 11.5rem; letter-spacing: 0.06em; color: rgba(255,238,252,0.82);
  display: inline-flex; align-items: center; gap: 8rem; white-space: nowrap;
  padding: 8rem 14rem; background: rgba(13,12,10,0.42); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.os__caret { width: 8rem; height: 15rem; background: var(--cyan); animation: os-blink 1.1s steps(1) infinite; }

/* Marquee */
.os__marquee {
  position: absolute; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none;
  border-top: 1.5px solid var(--ink); background: rgba(13,12,10,0.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  padding: 9rem 0;
}
.os__track { display: inline-flex; white-space: nowrap; animation: os-marq 24s linear infinite; }
.os--reduce .os__track { animation: none; }
@keyframes os-marq { to { transform: translateX(-50%) } }
.os__mitem { display: inline-flex; align-items: center; font-weight: 700; text-transform: uppercase; font-size: 14rem; letter-spacing: 0.02em; color: var(--cyan); padding: 0 4rem; }
.os__mitem--alt { color: var(--mag); }
.os__sep { font-style: normal; color: var(--paper); margin: 0 22rem; font-size: 0.7em; }

@media (prefers-reduced-motion: reduce) {
  .os__led, .os__caret { animation: none; }
}
</style>
