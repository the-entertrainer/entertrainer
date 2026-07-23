<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import { useHomeViewStore } from '~/stores/homeview'
import { useThemeStore } from '~/stores/theme'
import Experience from '~/experience/Experience'
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
// List mode renders whenever the view store is in 'list' — set either by the
// (optional) menu toggle or automatically by the WebGL fallback. It must NOT be
// gated behind showViewSwitch, or a device without WebGL would fall back to a
// list that never renders and show a blank page.
const isListMode      = computed(() => homeViewStore.mode === 'list')
const { $lenis }      = useNuxtApp()

const FOG_DARK  = 0x0D0C0A
const FOG_LIGHT = 0xF5EFE8

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

  // Atmospheric glow — blue in dark, warm amber in light
  const driftX  = Math.sin(_atmoT * 0.13) * 0.06
  const driftY  = Math.cos(_atmoT * 0.09) * 0.04
  const cx      = (0.5 + driftX) * w
  const cy      = (0.38 + driftY) * h
  const radius  = Math.max(w, h) * (0.68 + kick * 0.14)
  const breath  = 0.5 + Math.sin(_atmoT * 0.48) * 0.5
  const baseA   = dark ? 0.30 : 0.10
  const glowA   = baseA * (0.60 + breath * 0.40 + kick * 0.70)
  // Dark: cool blue-slate glow | Light: warm amber-gold glow
  const [gR, gG, gB] = dark ? [36, 63, 106] : [180, 120, 55]
  const glow    = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  glow.addColorStop(0,    `rgba(${gR},${gG},${gB},${Math.min(glowA, 0.80)})`)
  glow.addColorStop(0.50, `rgba(${gR},${gG},${gB},${Math.min(glowA * 0.28, 0.28)})`)
  glow.addColorStop(1,    'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // Radial vignette — draws eye to centre, edges fade to bg
  const vig = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.22,
    w / 2, h / 2, Math.max(w, h) * 0.78
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, dark ? 'rgba(0,0,0,0.65)' : 'rgba(185,168,148,0.30)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  // grain — tiled, slow drift (not per-frame random) for a calmer texture
  const grainSpeed = 0.6
  const ox  = (_atmoT * grainSpeed * 31.7) % tile.width
  const oy  = (_atmoT * grainSpeed * 17.3) % tile.height
  const pat = ctx.createPattern(tile, 'repeat')
  if (pat) {
    ctx.save()
    ctx.globalAlpha = Math.min((dark ? 0.55 : 0.14) * (1 + kick * 0.40), 0.82)
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
  // Clear the last painted frame so no stale overlay lingers over spiral view.
  if (_atmoCtx) _atmoCtx.clearRect(0, 0, _atmoW, _atmoH)
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

// If WebGL is unavailable (old device, disabled, driver crash) or the 3D
// Experience throws, we don't want the home page to die on a black canvas —
// drop into the existing 2D list view, which is fully featured on its own.
function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

function fallbackToList() {
  if (experience) { experience.destroy(); experience = null }
  if (homeViewStore.mode !== 'list') homeViewStore.setMode('list')
  if (!experienceStore.hasEntered) experienceStore.setHasEntered()
  experienceStore.setReady()
  if (!_atmoRunning) startAtmo()
}

async function mountExperience() {
  await nextTick()
  // Guard against a double mount: on a return visit onMounted calls this
  // directly, and we never want the hasEntered watcher to spin up a second
  // Experience over the top of a live one.
  if (!canvasRef.value || experience) return
  if (!webglSupported()) { fallbackToList(); return }
  try {
    experience = new Experience(canvasRef.value)
  } catch (err) {
    console.warn('[SpiralView] WebGL unavailable — falling back to list view.', err)
    fallbackToList()
    return
  }
  experience.world.setNavItems(props.items, themeStore.isDark)
  experience.setFogColor(themeStore.isDark ? FOG_DARK : FOG_LIGHT)
  experience.postProcessing.setColorGrade(themeStore.isDark)
  experience.setBackdrop(themeStore.isDark)
  // Capture reference so the timeout is safe even if component unmounts before it fires.
  // On first visit the loader covers the 150ms settle time; on return visits reveal immediately
  // so the canvas never shows a blank frame before cards appear.
  const exp = experience
  const revealDelay = (props.showLoader && !experienceStore.hasEntered) ? 150 : 0
  setTimeout(() => exp.world.reveal(), revealDelay)

  experience.on('planeClick', (href: string) => {
    emit('cardClick', href)
  })

  // For return visits (no loader, or loader already played): ensure the menu
  // switch is visible. In the first-load path the loader's exit calls
  // setHasEntered at the right moment — don't jump the gun here.
  if (!props.showLoader && !experienceStore.hasEntered) experienceStore.setHasEntered()
}

function destroyExperience() {
  experience?.destroy()
  experience = null
}

onMounted(() => {
  // The 2D atmosphere overlay is only the atmosphere source in list view —
  // spiral view gets glow/vignette/grain from the GLSL Backdrop + PostProcessing.
  if (isListMode.value) startAtmo()
  window.addEventListener('resize', _resizeAtmo)
  window.addEventListener('wheel',      _onWheel,      { passive: true })
  window.addEventListener('touchstart', _onTouchStart, { passive: true })
  window.addEventListener('touchmove',  _onTouchMove,  { passive: true })
  ;($lenis as any)?.stop()
  // Always start overlay hidden — guards against stale GSAP inline style on remount
  if (props.showLoader) {
    // Return visit — skip loader, show experience directly
    if (experienceStore.hasEntered) {
      isLoaderDone.value = true
      mountExperience()
      return
    }

    // First visit: start the experience loading in the background immediately so
    // that by the time the loader's exit animation completes, the canvas is
    // already rendered and there is no blank frame.
    const tStart = Date.now()
    mountExperience().then(() => {
      if (!experience) { experienceStore.setReady(); return }

      const MIN_DISPLAY_MS = 700  // keep the wordmark visible at least this long
      let readyFired = false

      const markReady = () => {
        if (readyFired) return
        readyFired = true
        const wait = Math.max(0, MIN_DISPLAY_MS - (Date.now() - tStart))
        setTimeout(() => experienceStore.setReady(), wait)
      }

      // The procedural backdrop is ready the moment the Experience is built —
      // its `backdropReady` fires synchronously *inside* mountExperience(), i.e.
      // before this callback runs, so we can't rely on catching that event here.
      // Instead wait two frames so a real frame has composited, then reveal.
      // A 6 s hard cap remains as a safety net for pathological GPU stalls.
      requestAnimationFrame(() => requestAnimationFrame(markReady))
      setTimeout(markReady, 6000)
    })
  } else {
    mountExperience()
  }
})

watch(hasEntered, async (entered) => {
  if (entered && props.showLoader) {
    await nextTick()
    mountExperience()
  }
})

// Any change to items (switching between home sub-sections) triggers the
// canonical vortex transition (wind + cross-fade). External page navigations
// call performExit() explicitly before router.push.
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
    startAtmo()
    destroyExperience()
    await nextTick()
    animateListIn()
  } else {
    stopAtmo()
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

/**
 * Public method for external page navigation.
 * Performs the vortex exit animation (wind up + fade out) before leaving
 * the spiral. This unifies the motion for both in-spiral sections and
 * links that navigate to full pages (About, Instructional Design, etc.).
 */
async function performExit() {
  if (experience?.world) {
    await experience.world.exit()
  }
}

defineExpose({
  performExit
})

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

    <!-- Accent-tinted edge fog — soft finishing haze at top & bottom -->
    <div class="spiral-fog" aria-hidden="true" />

    <!-- List mode — emit cardClick so the parent applies accordion vs router logic -->
    <Transition name="fade">
      <div v-if="hasEntered && isListMode" ref="listRef" class="spiral-list">
        <button
          v-for="(item, i) in items"
          :key="item.id"
          class="nav-row"
          @click="emit('cardClick', item.href)"
        >
          <span class="nav-row__index">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="nav-row__body">
            <span class="nav-row__label">{{ item.label }}</span>
            <span class="nav-row__desc">{{ item.description }}</span>
          </span>
        </button>
      </div>
    </Transition>

    <!-- UI chrome -->
    <Transition name="fade">
      <div v-if="hasEntered" class="spiral-ui">
        <!-- Section title -->
        <p v-if="title" class="spiral-title">{{ title }}</p>

        <!-- Hint — only on root home view, not on sub-sections -->
        <p v-if="!isListMode && !title" class="spiral-hint">scroll to spin · tap to explore</p>
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

/* Accent edge fog — subtle haze at the top & bottom, tinted to the backdrop's
   primary accent (published as --accent-fog). */
.spiral-fog {
  position: fixed;
  inset: 0;
  z-index: 8;
  pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(var(--accent-fog, 120,120,140), 0.16) 0%, transparent 18%),
    linear-gradient(to top,    rgba(var(--accent-fog, 120,120,140), 0.16) 0%, transparent 18%);
}
/* ────────────────────────────────────────────────────────────────────────── */

/* List mode ─────────────────────────────────────────────────────────────── */
.spiral-list {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: calc(100rem + var(--safe-top)) calc(var(--grid-margin) + 60rem) calc(80rem + var(--safe-bottom));
  overflow-y: auto;
  background: var(--color-bg);
  color: var(--color-text);
}

.nav-row {
  display: flex;
  align-items: center;
  gap: 20rem;
  padding: 28rem 24rem;
  border: none;
  border-radius: var(--radius-m);
  background: transparent;
  text-align: left;
  color: var(--color-text);
  width: 100%;
  cursor: pointer;
  font-family: var(--main-font);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background 0.2s ease, transform 0.18s var(--ease-spring);
  border-bottom: 1px solid var(--color-divider);
  border-radius: 0;
}
.nav-row:first-child { border-top: 1px solid var(--color-divider); }
.nav-row:active { transform: scale(0.985); }
@media (hover: hover) {
  .nav-row:hover { background: var(--color-glass-bg); }
}
.nav-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.nav-row__index {
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  opacity: 0.25;
  font-variant-numeric: tabular-nums;
  flex: 0 0 28rem;
}

.nav-row__body {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  flex: 1;
  min-width: 0;
}

.nav-row__label {
  font-size: 24rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.nav-row__desc {
  font-size: 14rem;
  opacity: 0.4;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 900px) {
  .spiral-list {
    padding: calc(80rem + var(--safe-top)) 32rem calc(60rem + var(--safe-bottom));
  }
}

@media (max-width: 600px) {
  .spiral-list {
    padding: calc(80rem + var(--safe-top)) 20rem calc(60rem + var(--safe-bottom));
  }
  .nav-row {
    padding: 22rem 16rem;
    gap: 14rem;
  }
  .nav-row__label { font-size: 20rem; }
  .nav-row__desc { font-size: 13rem; }
}

.spiral-ui {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.spiral-title {
  position: absolute;
  bottom: calc(44rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.35;
  white-space: nowrap;
}
.spiral-hint {
  position: absolute;
  bottom: calc(44rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  font-size: 11rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--color-text);
  opacity: 0.20;
  white-space: nowrap;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.loader-fade-leave-active               { transition: opacity 0.5s ease; }
.loader-fade-leave-to                   { opacity: 0; }
</style>
