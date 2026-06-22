<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import { useHomeViewStore } from '~/stores/homeview'
import { useThemeStore } from '~/stores/theme'
import Experience from '~/experience/Experience'
import SoundEngine from '~/experience/SoundEngine'
import type { NavItem } from '~/types/nav'

const props = defineProps<{
  items: NavItem[]
  showLoader?: boolean
  title?: string
  showViewSwitch?: boolean
}>()

const emit = defineEmits<{
  cardClick: [href: string]
}>()

const experienceStore = useExperienceStore()
const homeViewStore   = useHomeViewStore()
const themeStore      = useThemeStore()
const canvasRef       = ref<HTMLCanvasElement | null>(null)
const listRef         = ref<HTMLElement | null>(null)
const isLoaderDone    = ref(!props.showLoader || experienceStore.hasEntered)
const hasEntered      = computed(() => props.showLoader ? experienceStore.hasEntered : true)
const isListMode      = computed(() => props.showViewSwitch && homeViewStore.mode === 'list')
const { $lenis }      = useNuxtApp()

const FOG_DARK  = 0x0D0C0A
const FOG_LIGHT = 0xF4F1EC

let experience: Experience | null = null
let transitioning = false

// ── Unified atmosphere canvas (animated glow + vignette + grain) ───────────
const atmoRef   = ref<HTMLCanvasElement | null>(null)
let _atmoCtx:   CanvasRenderingContext2D | null = null
let _atmoTile:  HTMLCanvasElement | null = null
let _atmoRaf  = 0
let _atmoRunning = false
let _atmoT    = 0
let _atmoLast = 0
let _atmoW    = 0
let _atmoH    = 0
let _atmoIntensity    = 0   // smoothed scroll energy 0..1
let _atmoIntensityTgt = 0   // set by wheel/touch, decays each frame
let _lastTouchY       = 0

function _bakeGrain(): HTMLCanvasElement {
  const size = 160
  const g = document.createElement('canvas')
  g.width = size; g.height = size
  const gc = g.getContext('2d')!
  const img = gc.createImageData(size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255
    d[i] = d[i + 1] = d[i + 2] = v
    d[i + 3] = 20 // heavier grain
  }
  gc.putImageData(img, 0, 0)
  return g
}

function _resizeAtmo() {
  const cv = atmoRef.value
  if (!cv) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  _atmoW = window.innerWidth
  _atmoH = window.innerHeight
  cv.width  = Math.floor(_atmoW * dpr)
  cv.height = Math.floor(_atmoH * dpr)
  cv.style.width  = _atmoW + 'px'
  cv.style.height = _atmoH + 'px'
  _atmoCtx = cv.getContext('2d')!
  _atmoCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function _atmoFrame(now: number) {
  if (!_atmoRunning) return
  _atmoRaf = requestAnimationFrame(_atmoFrame)
  const dt = Math.min((now - _atmoLast) / 1000, 0.05)
  _atmoLast = now
  _atmoT += dt

  // decay scroll energy — target fades fast, current follows smoothly
  _atmoIntensityTgt *= Math.pow(0.18, dt)             // ~0.5 s half-life
  _atmoIntensity    += (_atmoIntensityTgt - _atmoIntensity) * Math.min(dt * 6, 1)

  const ctx  = _atmoCtx
  const tile = _atmoTile
  if (!ctx || !tile) return

  const w    = _atmoW
  const h    = _atmoH
  const dark = themeStore.isDark
  const kick = _atmoIntensity              // 0..1 scroll-reactive boost

  ctx.clearRect(0, 0, w, h)

  // drifting Pi Blue glow — slow sin/cos path, breathing alpha, scroll flare
  const driftX = Math.sin(_atmoT * 0.13) * 0.06
  const driftY = Math.cos(_atmoT * 0.09) * 0.04
  const cx     = (0.5 + driftX) * w
  const cy     = (0.38 + driftY) * h
  const radius = Math.max(w, h) * (0.68 + kick * 0.14)  // glow expands on scroll
  const breath = 0.5 + Math.sin(_atmoT * 0.48) * 0.5    // 0 → 1 cycle ~13 s
  const baseA  = dark ? 0.30 : 0.13
  const glowA  = baseA * (0.60 + breath * 0.40 + kick * 0.70)
  const glow   = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  glow.addColorStop(0,    `rgba(36,63,106,${Math.min(glowA, 0.82)})`)
  glow.addColorStop(0.50, `rgba(36,63,106,${Math.min(glowA * 0.30, 0.30)})`)
  glow.addColorStop(1,    'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // radial vignette — edges pull toward bg
  const vig = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.28,
    w / 2, h / 2, Math.max(w, h) * 0.74
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, dark ? 'rgba(0,0,0,0.60)' : 'rgba(168,158,142,0.44)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  // grain — tiled, jittered each frame; heavier while scrolling
  const ox  = Math.random() * tile.width
  const oy  = Math.random() * tile.height
  const pat = ctx.createPattern(tile, 'repeat')
  if (pat) {
    ctx.save()
    ctx.globalAlpha = Math.min((dark ? 0.72 : 0.48) * (1 + kick * 0.50), 0.95)
    ctx.translate(-ox, -oy)
    ctx.fillStyle = pat
    ctx.fillRect(ox, oy, w, h)
    ctx.restore()
  }
}

function startAtmo() {
  if (_atmoRunning) return
  _atmoTile = _bakeGrain()
  _resizeAtmo()
  _atmoRunning = true
  _atmoLast = performance.now()
  _atmoRaf  = requestAnimationFrame(_atmoFrame)
}

function stopAtmo() {
  _atmoRunning = false
  cancelAnimationFrame(_atmoRaf)
}

function _onWheel(e: WheelEvent) {
  _atmoIntensityTgt = Math.min(1, Math.abs(e.deltaY) / 280)
}
function _onTouchStart(e: TouchEvent) {
  _lastTouchY = e.touches[0]?.clientY ?? 0
}
function _onTouchMove(e: TouchEvent) {
  const dy = Math.abs((e.touches[0]?.clientY ?? _lastTouchY) - _lastTouchY)
  _lastTouchY = e.touches[0]?.clientY ?? _lastTouchY
  _atmoIntensityTgt = Math.min(1, dy / 35)
}
// ──────────────────────────────────────────────────────────────────────────

async function mountExperience() {
  await nextTick()
  // Guard against a double mount: on a return visit onMounted calls this
  // directly, and we never want the hasEntered watcher to spin up a second
  // Experience over the top of a live one.
  if (!canvasRef.value || experience) return
  experience = new Experience(canvasRef.value)
  experience.world.setNavItems(props.items, themeStore.isDark)
  experience.setFogColor(themeStore.isDark ? FOG_DARK : FOG_LIGHT)
  experience.postProcessing.setColorGrade(themeStore.isDark)
  // Capture reference so the timeout is safe even if component unmounts before it fires
  const exp = experience
  setTimeout(() => exp.world.reveal(), 150)

  experience.on('planeClick', (href: string) => {
    emit('cardClick', href)
  })

  // Whenever the spiral is actually on screen, guarantee the global view-switch
  // is shown. The loader normally sets this at the end of its enter animation,
  // but on return visits (loader skipped) we rely on this so the toggle never
  // gets stuck invisible. setHasEntered is idempotent.
  if (!experienceStore.hasEntered) experienceStore.setHasEntered()
}

function destroyExperience() {
  experience?.destroy()
  experience = null
}

onMounted(() => {
  startAtmo()
  window.addEventListener('resize', _resizeAtmo)
  window.addEventListener('wheel',      _onWheel,      { passive: true })
  window.addEventListener('touchstart', _onTouchStart, { passive: true })
  window.addEventListener('touchmove',  _onTouchMove,  { passive: true })
  ;($lenis as any)?.stop()

  if (props.showLoader) {
    // If user already entered this session, skip loader
    if (experienceStore.hasEntered) {
      isLoaderDone.value = true
      mountExperience()
      SoundEngine.init()
      return
    }

    let p = 0
    const interval = setInterval(() => {
      p = Math.min(p + Math.random() * 8 + 2, 99)
      experienceStore.setProgress(p)
      if (p >= 99) {
        clearInterval(interval)
        setTimeout(() => {
          experienceStore.setProgress(100)
          experienceStore.setReady()
        }, 300)
      }
    }, 80)
  } else {
    mountExperience()
  }
})

watch(hasEntered, async (entered) => {
  if (entered && props.showLoader) {
    await nextTick()
    mountExperience()
    SoundEngine.init()
  }
})

// Accordion: when items prop changes, transition to new items in-place
watch(() => props.items, async (newItems) => {
  if (isListMode.value) { await nextTick(); animateListIn(); return }
  if (!experience || !newItems.length || transitioning) return
  transitioning = true
  await experience.world.transitionTo(newItems)
  transitioning = false
}, { deep: false })

// Sync theme (fog + card textures) when theme changes
watch(() => themeStore.isDark, (isDark) => {
  experience?.setTheme(isDark)
})

// List mode toggle — destroy/recreate Three.js
watch(isListMode, async (listMode) => {
  if (listMode) {
    destroyExperience()
    await nextTick()
    animateListIn()
  } else {
    await nextTick()
    mountExperience()
  }
})

function animateListIn() {
  const rows = listRef.value?.querySelectorAll('.nav-row')
  if (!rows?.length) return
  gsap.fromTo(
    rows,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.07, delay: 0.1 }
  )
}

onUnmounted(() => {
  stopAtmo()
  window.removeEventListener('resize',     _resizeAtmo)
  window.removeEventListener('wheel',      _onWheel)
  window.removeEventListener('touchstart', _onTouchStart)
  window.removeEventListener('touchmove',  _onTouchMove)
  destroyExperience()
  ;($lenis as any)?.start()
})

function onLoaderEntered() {
  isLoaderDone.value = true
}
</script>

<template>
  <div class="spiral-view">
    <!-- Loader (home only) -->
    <Transition name="loader-fade">
      <UiLoader v-if="showLoader && !isLoaderDone" @entered="onLoaderEntered" />
    </Transition>

    <!-- WebGL canvas -->
    <canvas
      ref="canvasRef"
      class="spiral-canvas"
      :class="{ hidden: !hasEntered || isListMode }"
    />

    <!-- Unified atmosphere: animated glow + vignette + film grain -->
    <canvas ref="atmoRef" class="spiral-atmo" />

    <!-- List mode — emit cardClick so the parent applies accordion vs router logic -->
    <Transition name="fade">
      <div v-if="hasEntered && isListMode" ref="listRef" class="spiral-list">
        <button
          v-for="item in items"
          :key="item.id"
          class="nav-row"
          @click="emit('cardClick', item.href)"
        >
          <span class="nav-row__label">{{ item.label }}</span>
          <span class="nav-row__desc">{{ item.description }}</span>
          <span class="nav-row__arrow">→</span>
        </button>
      </div>
    </Transition>

    <!-- UI chrome -->
    <Transition name="fade">
      <div v-if="hasEntered" class="spiral-ui">
        <!-- Section title -->
        <p v-if="title" class="spiral-title">{{ title }}</p>

        <!-- Hint -->
        <p v-if="!isListMode" class="spiral-hint">scroll to spin · tap to explore</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.spiral-view {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-bg);
}
.spiral-canvas {
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  touch-action: none;
  background: var(--color-bg);
  transition: opacity 0.5s ease;
}
.spiral-canvas.hidden {
  opacity: 0;
  pointer-events: none;
}

/* Unified atmosphere canvas ─────────────────────────────────────────────── */
.spiral-atmo {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
/* ────────────────────────────────────────────────────────────────────────── */

/* List mode — matches the E-menu panel: white pill background, black foreground */
.spiral-list {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: calc(80rem + var(--safe-top)) calc(var(--grid-margin) + 80rem) calc(60rem + var(--safe-bottom));
  overflow-y: auto;
  background: var(--color-white);
  color: var(--color-black);
}
/* Inside the white panel, keyboard focus ring uses the panel foreground */
.spiral-list :focus-visible { outline-color: var(--color-black); }
.nav-row {
  display: flex;
  align-items: center;
  gap: 24rem;
  padding: 28rem 0;
  border: none;
  border-bottom: 1px solid color-mix(in srgb, var(--color-black) 12%, transparent);
  border-radius: 0;
  background: none;
  text-align: left;
  text-decoration: none;
  color: var(--color-black);
  width: 100%;
  cursor: pointer;
  font-family: var(--main-font);
  transition: padding-left 0.3s var(--ease-spring);
}
.nav-row:first-child { border-top: 1px solid color-mix(in srgb, var(--color-black) 12%, transparent); }
.nav-row:hover { padding-left: 16rem; }
.nav-row__label {
  font-size: 40rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  flex: 0 0 auto;
  min-width: 220rem;
}
.nav-row__desc {
  font-size: var(--text-sm);
  opacity: 0.4;
  flex: 1;
}
.nav-row__arrow {
  font-size: 20rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.nav-row:hover .nav-row__arrow { opacity: 1; }

@media (max-width: 600px) {
  .spiral-list {
    padding: calc(80rem + var(--safe-top)) 24rem calc(60rem + var(--safe-bottom));
  }
  .nav-row { flex-wrap: wrap; gap: 8rem; padding: 22rem 0; }
  .nav-row__label { font-size: 28rem; min-width: unset; flex: 1; }
  .nav-row__desc  { display: none; }
}

.spiral-ui {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.spiral-title {
  position: absolute;
  bottom: calc(52rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  font-size: 13rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.3;
  white-space: nowrap;
}
.spiral-hint {
  position: absolute;
  bottom: calc(36rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  font-size: 13rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--color-text);
  opacity: 0.2;
  white-space: nowrap;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.loader-fade-leave-active               { transition: opacity 0.5s ease; }
.loader-fade-leave-to                   { opacity: 0; }
</style>
