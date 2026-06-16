<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import SoundEngine from '~/experience/SoundEngine'

const emit = defineEmits<{ (e: 'entered'): void }>()

const experienceStore = useExperienceStore()
const isReady         = computed(() => experienceStore.isReady)
const entering        = ref(false)

const loaderEl  = ref<HTMLElement | null>(null)
const dotEls    = ref<HTMLElement[]>([])
const padEls    = ref<HTMLElement[]>([])
const anchorEls = ref<HTMLElement[]>([])

// ── Constellation geometry ──────────────────────────────────
// 12 dots arranged as a centred "E" while loading, then scattered to the
// four corners where they form each button's icon.
const U = 22 // formation grid unit (px; 1rem === 1px here)
const FORMATION: { x: number; y: number }[] = [
  // left spine (x = -1.5)
  { x: -1.5, y: -2 }, { x: -1.5, y: -1 }, { x: -1.5, y: 0 }, { x: -1.5, y: 1 }, { x: -1.5, y: 2 },
  // top arm
  { x: -0.5, y: -2 }, { x: 0.5, y: -2 }, { x: 1.5, y: -2 },
  // middle arm
  { x: -0.5, y: 0 },
  // bottom arm
  { x: -0.5, y: 2 }, { x: 0.5, y: 2 }, { x: 1.5, y: 2 }
].map((p) => ({ x: p.x * U, y: p.y * U }))

// Per-dot destination: which corner anchor + the slot offset (px, relative to
// that corner's centre) + the final icon-piece shape.
interface Shape { w: number; h: number; r: string }
const DOT_ROUND: Shape = { w: 12, h: 12, r: '50%' }
const E_DOT:     Shape = { w: 3.3, h: 3.3, r: '50%' }   // matches 12-dot Logo.vue mark (r=2.2 at scale 0.75)
const BAR_H:     Shape = { w: 18, h: 2, r: '1px' }      // hamburger bar
const BAR_V:     Shape = { w: 3, h: 14, r: '2px' }      // sound bar
const THEME_DOT: Shape = { w: 14, h: 14, r: '50%' }     // ThemeCircle tc-dot

interface Dest { corner: number; sx: number; sy: number; shape: Shape }
const DESTS: Dest[] = [
  // 0-4 → top-left logo: 3 spine dots + 2 arm endpoints matching new 12-dot Logo.vue
  // (Logo: viewBox 0 0 24 32, mark 18×24px, scale 0.75; offsets relative to wrapper centre)
  { corner: 0, sx: -6.75, sy: -9, shape: E_DOT },   // d0 spine top   (cx=3,  cy=4)
  { corner: 0, sx: -6.75, sy:  0, shape: E_DOT },   // d2 spine mid   (cx=3,  cy=16)
  { corner: 0, sx: -6.75, sy:  9, shape: E_DOT },   // d4 spine bot   (cx=3,  cy=28)
  { corner: 0, sx:  6.75, sy: -9, shape: E_DOT },   // d7 top arm end (cx=21, cy=4)
  { corner: 0, sx:  6.75, sy:  9, shape: E_DOT },   // d11 bot arm end(cx=21, cy=28)
  // 5-7 → top-right hamburger (3 horizontal bars)
  { corner: 1, sx: 0, sy: -7, shape: BAR_H },
  { corner: 1, sx: 0, sy: 0,  shape: BAR_H },
  { corner: 1, sx: 0, sy: 7,  shape: BAR_H },
  // 8 → bottom-left theme dot
  { corner: 2, sx: 0, sy: 0, shape: THEME_DOT },
  // 9-11 → bottom-right sound (3 vertical bars)
  { corner: 3, sx: -6, sy: 0, shape: BAR_V },
  { corner: 3, sx: 0,  sy: 0, shape: BAR_V },
  { corner: 3, sx: 6,  sy: 0, shape: BAR_V }
]

let assemblyTl: gsap.core.Timeline | null = null
let idleTween: gsap.core.Tween | null = null

// Once the experience is ready, let the "E" breathe briefly, then auto-enter.
watch(isReady, (ready) => {
  if (ready) setTimeout(() => enter(), 700)
})

onMounted(() => {
  const rng = (a: number, b: number) => a + Math.random() * (b - a)

  // Seed dots at random scatter positions, invisible and scaled to zero.
  dotEls.value.forEach((el, i) => {
    const angle  = rng(0, Math.PI * 2)
    const radius = rng(100, 200)
    gsap.set(el, {
      xPercent: -50, yPercent: -50,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      width: DOT_ROUND.w, height: DOT_ROUND.h, borderRadius: '50%',
      scale: 0, opacity: 0
    })
  })

  // Staggered spring-convergence into the E formation.
  assemblyTl = gsap.timeline({
    onComplete: () => {
      assemblyTl = null
      idleTween = gsap.to(dotEls.value, {
        scale: 1.18, duration: 0.9, ease: 'sine.inOut',
        stagger: { each: 0.08, repeat: -1, yoyo: true }
      })
    }
  })

  dotEls.value.forEach((el, i) => {
    assemblyTl!.to(el, {
      x: FORMATION[i].x, y: FORMATION[i].y,
      scale: 1, opacity: 1,
      duration: 0.85, ease: 'back.out(1.6)'
    }, 0.08 + i * 0.055)
  })
})

function setDotEl(el: any, i: number)    { if (el) dotEls.value[i] = el }
function setPadEl(el: any, i: number)    { if (el) padEls.value[i] = el }
function setAnchorEl(el: any, i: number) { if (el) anchorEls.value[i] = el }

function cornerCentre(i: number) {
  const r = anchorEls.value[i].getBoundingClientRect()
  return {
    x: r.left + r.width / 2 - window.innerWidth / 2,
    y: r.top + r.height / 2 - window.innerHeight / 2
  }
}

function enter() {
  if (entering.value) return
  entering.value = true

  // Init audio + arm the iOS unlock listeners (resume happens on first touch).
  SoundEngine.init()
  SoundEngine.getInstance()?.unlock()

  // Kill any in-progress assembly and snap dots to their final E positions.
  assemblyTl?.kill()
  assemblyTl = null
  dotEls.value.forEach((el, i) => {
    gsap.set(el, {
      x: FORMATION[i].x, y: FORMATION[i].y,
      scale: 1, opacity: 1,
      width: DOT_ROUND.w, height: DOT_ROUND.h, borderRadius: '50%'
    })
  })
  idleTween?.kill()

  // Resolve the icon colour for the active theme — dots darken into the icon
  // as they land on the white pads.
  const iconColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-black').trim() || '#0D0C0A'

  const tl = gsap.timeline({ onComplete: () => emit('entered') })

  // Clear any idle scale so width/height drives the final shape cleanly.
  tl.to(dotEls.value, { scale: 1, duration: 0.2 }, 0)

  // Fly each dot to its corner slot and morph into the icon piece.
  dotEls.value.forEach((el, i) => {
    const d = DESTS[i]
    const c = cornerCentre(d.corner)
    tl.to(el, {
      x: c.x + d.sx, y: c.y + d.sy,
      width: d.shape.w, height: d.shape.h, borderRadius: d.shape.r,
      duration: 0.75, ease: 'power3.inOut'
    }, 0.25 + i * 0.02)
  })

  // White button pads bloom in behind the dots as they land.
  padEls.value.forEach((el, i) => {
    const c = cornerCentre(i)
    gsap.set(el, { xPercent: -50, yPercent: -50, x: c.x, y: c.y, scale: 0, opacity: 0 })
    tl.to(el, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.6)' }, 0.7)
  })

  // Dots darken into the icon colour as the pads appear beneath them.
  tl.to(dotEls.value, { backgroundColor: iconColor, duration: 0.35, ease: 'power2.out' }, 0.72)

  // Once the dots have landed + darkened, reveal the real WebGL experience and
  // real corner buttons underneath the (still-opaque) overlay.
  tl.add(() => {
    experienceStore.setHasEntered()
    gsap.to(loaderEl.value, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.55, ease: 'power2.out' })
  }, 1.05)

  // Hand off: fade the morph overlay out, leaving the identical real buttons.
  tl.to([...padEls.value, ...dotEls.value], {
    opacity: 0, duration: 0.35, ease: 'power2.in'
  }, 1.5)
}
</script>

<template>
  <div ref="loaderEl" class="eloader">
    <!-- Constellation dots (form the "E", then scatter to the four corners) -->
    <span
      v-for="i in 12"
      :key="'dot-' + i"
      class="dot"
      :ref="(el: any) => setDotEl(el, i - 1)"
    ></span>

    <!-- Button pads that bloom in as the dots land -->
    <span
      v-for="i in 4"
      :key="'pad-' + i"
      class="pad"
      :ref="(el: any) => setPadEl(el, i - 1)"
    ></span>

    <!-- Invisible anchors at the exact corner-button positions (measured for landing) -->
    <span class="anchor anchor-tl" :ref="(el: any) => setAnchorEl(el, 0)"></span>
    <span class="anchor anchor-tr" :ref="(el: any) => setAnchorEl(el, 1)"></span>
    <span class="anchor anchor-bl" :ref="(el: any) => setAnchorEl(el, 2)"></span>
    <span class="anchor anchor-br" :ref="(el: any) => setAnchorEl(el, 3)"></span>
  </div>
</template>

<style scoped>
.eloader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--color-bg);
  overflow: hidden;
}

/* Constellation */
.dot {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  background: var(--color-text);
  will-change: transform, width, height;
  pointer-events: none;
}
.pad {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  width: 48rem;
  height: 48rem;
  border-radius: var(--radius-full);
  background: var(--color-white);
  pointer-events: none;
  opacity: 0;
}
.anchor {
  position: fixed;
  width: 48rem;
  height: 48rem;
  opacity: 0;
  pointer-events: none;
}
.anchor-tl { left: calc(30rem + var(--safe-left));  top: calc(38rem + var(--safe-top)); }
.anchor-tr { right: calc(30rem + var(--safe-right)); top: calc(38rem + var(--safe-top)); }
.anchor-bl { left: calc(30rem + var(--safe-left));  bottom: calc(30rem + var(--safe-bottom)); }
.anchor-br { right: calc(30rem + var(--safe-right)); bottom: calc(30rem + var(--safe-bottom)); }
</style>
