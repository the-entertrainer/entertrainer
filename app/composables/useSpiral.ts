import { ref, readonly, type Ref } from 'vue'

// ───────────────────────────────────────────────────────────────
//  Pure Archimedean-spiral math (no DOM, SSR-safe at import time).
//  Ported & generalised from the original vanilla js/spiral.js.
// ───────────────────────────────────────────────────────────────
export interface SpiralConfig {
  coilSpacing: number // b — px between coils
  arcSpan: number // total angular span across panels, in turns·π
  yFlatten: number // vertical squash for fake perspective
  depthBase: number
  depthAmp: number
  scaleMin: number
  scaleRange: number
}

export interface PanelTransform {
  x: number
  y: number
  z: number // depth factor 0..1
  scale: number
  opacity: number
  zIndex: number
}

export const DEFAULT_CONFIG: SpiralConfig = {
  coilSpacing: 96,
  arcSpan: 2.55,
  yFlatten: 0.75,
  depthBase: 0.7,
  depthAmp: 0.3,
  scaleMin: 0.62,
  scaleRange: 0.46,
}

/** θ for panel i given the global rotation. */
export function thetaFor(i: number, n: number, rotation: number, cfg: SpiralConfig): number {
  const thetaStep = (Math.PI * cfg.arcSpan) / Math.max(1, n)
  return i * thetaStep + rotation
}

/** Full transform for panel i. r = coilSpacing · (θ / 2π), a = 0. */
export function spiralTransform(
  i: number,
  n: number,
  rotation: number,
  cfg: SpiralConfig,
): PanelTransform {
  const theta = thetaFor(i, n, rotation, cfg)
  const r = cfg.coilSpacing * (theta / (Math.PI * 2))
  const depth = Math.sin(theta) * cfg.depthAmp + cfg.depthBase
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta) * cfg.yFlatten,
    z: depth,
    scale: cfg.scaleMin + depth * cfg.scaleRange,
    opacity: 0.5 + depth * 0.5,
    zIndex: Math.round(depth * 10),
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

interface UseSpiralOptions {
  count: () => number
  containerRef: Ref<HTMLElement | null>
  panelRefs: Ref<HTMLElement[]>
  enabled: () => boolean // false in grid/list (stops ticker work)
  reducedMotion: () => boolean
  snapMode: () => boolean // mobile: snap to nearest panel instead of free momentum
  config?: Partial<SpiralConfig>
  /** Provide the gsap instance so the ticker is shared app-wide. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gsap: any
}

/**
 * Drives the spiral: holds rotation state, runs on the shared gsap.ticker,
 * applies transforms to panel elements. All DOM work happens client-side
 * (call start() inside onMounted).
 */
export function useSpiral(opts: UseSpiralOptions) {
  const cfg: SpiralConfig = { ...DEFAULT_CONFIG, ...opts.config }

  const rotation = ref(0)
  const target = ref(0)
  const velocity = ref(0)
  const activeIndex = ref(0)
  const isDragging = ref(false)

  let centerX = 0
  let centerY = 0
  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let running = false

  function measure() {
    const el = opts.containerRef.value
    if (!el) return
    centerX = el.offsetWidth / 2
    centerY = el.offsetHeight / 2
  }

  function applyTransforms() {
    const panels = opts.panelRefs.value
    const n = panels.length
    if (!n) return

    let bestDepth = -Infinity
    let bestIdx = 0

    for (let i = 0; i < n; i++) {
      const t = spiralTransform(i, n, rotation.value, cfg)
      const el = panels[i]
      if (!el) continue

      // Hide very distant / low-opacity panels to reduce visual clutter
      if (t.opacity < 0.28) {
        el.style.visibility = 'hidden'
        continue
      } else {
        el.style.visibility = ''
      }

      el.style.transform =
        `translate(-50%, -50%) translate(${(centerX + t.x).toFixed(2)}px, ${(centerY + t.y).toFixed(2)}px) scale(${t.scale.toFixed(3)})`
      el.style.opacity = t.opacity.toFixed(3)
      el.style.zIndex = String(t.zIndex)
      if (t.z > bestDepth) {
        bestDepth = t.z
        bestIdx = i
      }
    }
    activeIndex.value = bestIdx
  }

  function update() {
    if (!opts.enabled()) return

    if (opts.reducedMotion()) {
      // Static layout — apply once, no animation.
      rotation.value = target.value
      applyTransforms()
      return
    }

    if (!isDragging.value) {
      velocity.value *= 0.92 // friction
      target.value += velocity.value * 0.008
    }
    rotation.value = lerp(rotation.value, target.value, 0.1)
    applyTransforms()
  }

  // ── Drag interface (called from useDrag in the component) ──
  function dragStart() {
    isDragging.value = true
    velocity.value = 0
    armIdle()
  }
  function dragDelta(dx: number) {
    velocity.value = dx
    target.value += dx * 0.01
  }
  function dragEnd() {
    isDragging.value = false
    if (opts.snapMode()) snapToNearest()
  }

  // ── Snap-to-panel (mobile) ──
  function snapToNearest() {
    // Solve rotation so the active panel sits at front (sin(θ)=1 → θ=π/2).
    rotateTo(activeIndex.value)
  }

  function rotateTo(index: number) {
    const n = opts.count()
    const thetaStep = (Math.PI * cfg.arcSpan) / Math.max(1, n)
    // We want thetaFor(index) ≈ π/2 (front). rotation = π/2 - index*thetaStep
    const desired = Math.PI / 2 - index * thetaStep
    opts.gsap.to(target, {
      value: desired,
      duration: 0.8,
      ease: 'power3.out',
    })
    velocity.value = 0
  }

  function next() {
    rotateTo((activeIndex.value + 1) % opts.count())
  }
  function prev() {
    rotateTo((activeIndex.value - 1 + opts.count()) % opts.count())
  }

  // ── Idle auto-rotate ──
  function armIdle() {
    if (idleTimer) clearTimeout(idleTimer)
    if (opts.reducedMotion() || opts.snapMode()) return
    idleTimer = setTimeout(() => {
      if (!isDragging.value) velocity.value = 0.8
    }, 3000)
  }

  // ── Lifecycle ──
  function start() {
    measure()

    // Nice initial rotation: put roughly the middle panel near the front (good first impression)
    const n = opts.count()
    if (n > 0) {
      const thetaStep = (Math.PI * cfg.arcSpan) / Math.max(1, n)
      const startIdx = Math.floor(n / 2)
      target.value = Math.PI / 2 - startIdx * thetaStep
      rotation.value = target.value
    }

    running = true
    opts.gsap.ticker.add(update)
    armIdle()
    applyTransforms()
  }
  function pause() {
    opts.gsap.ticker.remove(update)
  }
  function resume() {
    if (running) opts.gsap.ticker.add(update)
  }
  function destroy() {
    running = false
    opts.gsap.ticker.remove(update)
    if (idleTimer) clearTimeout(idleTimer)
  }

  return {
    rotation: readonly(rotation),
    activeIndex: readonly(activeIndex),
    isDragging: readonly(isDragging),
    config: cfg,
    // interaction
    dragStart,
    dragDelta,
    dragEnd,
    rotateTo,
    next,
    prev,
    // lifecycle
    start,
    pause,
    resume,
    destroy,
    measure,
    applyTransforms,
    armIdle,
  }
}
