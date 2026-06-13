import { ref, readonly, type Ref } from 'vue'

// Pure Archimedean-spiral math

export interface SpiralConfig {
  coilSpacing: number
  arcSpan: number
  yFlatten: number
  depthBase: number
  depthAmp: number
  scaleMin: number
  scaleRange: number
  verticalProgress?: number // extra vertical advance per turn (for staircase feel)
}

export interface PanelTransform {
  x: number
  y: number
  z: number
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
  verticalProgress: 0,
}

export function thetaFor(i: number, n: number, rotation: number, cfg: SpiralConfig): number {
  const thetaStep = (Math.PI * cfg.arcSpan) / Math.max(1, n)
  return i * thetaStep + rotation
}

export function spiralTransform(
  i: number,
  n: number,
  rotation: number,
  cfg: SpiralConfig,
): PanelTransform {
  const theta = thetaFor(i, n, rotation, cfg)
  const r = cfg.coilSpacing * (theta / (Math.PI * 2))

  // Base position
  let x = r * Math.cos(theta)
  let y = r * Math.sin(theta) * cfg.yFlatten

  // Extra vertical progression for "spiral staircase" side-view feel on mobile
  if (cfg.verticalProgress) {
    y += (theta / (Math.PI * 2)) * cfg.verticalProgress
  }

  const depth = Math.sin(theta) * cfg.depthAmp + cfg.depthBase

  return {
    x,
    y,
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
  enabled: () => boolean
  reducedMotion: () => boolean
  snapMode: () => boolean
  config?: Partial<SpiralConfig>
  gsap: any
}

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
      rotation.value = target.value
      applyTransforms()
      return
    }

    if (!isDragging.value) {
      velocity.value *= 0.92
      target.value += velocity.value * 0.008
    }
    rotation.value = lerp(rotation.value, target.value, 0.1)
    applyTransforms()
  }

  function dragStart() {
    isDragging.value = true
    velocity.value = 0
    armIdle()
  }
  function dragDelta(dx: number, dy: number = 0) {
    // On mobile we use vertical movement (dy) to control rotation
    const delta = dy !== 0 ? dy : dx
    velocity.value = delta
    target.value += delta * 0.012
  }
  function dragEnd() {
    isDragging.value = false
    if (opts.snapMode()) snapToNearest()
  }

  function snapToNearest() {
    rotateTo(activeIndex.value)
  }

  function rotateTo(index: number) {
    const n = opts.count()
    const thetaStep = (Math.PI * cfg.arcSpan) / Math.max(1, n)
    const desired = Math.PI / 2 - index * thetaStep
    opts.gsap.to(target, {
      value: desired,
      duration: 0.75,
      ease: 'power3.out',
    })
    velocity.value = 0
  }

  function next() { rotateTo((activeIndex.value + 1) % opts.count()) }
  function prev() { rotateTo((activeIndex.value - 1 + opts.count()) % opts.count()) }

  function armIdle() {
    if (idleTimer) clearTimeout(idleTimer)
    if (opts.reducedMotion() || opts.snapMode()) return
    idleTimer = setTimeout(() => {
      if (!isDragging.value) velocity.value = 0.8
    }, 3000)
  }

  function start() {
    measure()
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

  function pause() { opts.gsap.ticker.remove(update) }
  function resume() { if (running) opts.gsap.ticker.add(update) }
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
    dragStart,
    dragDelta,
    dragEnd,
    rotateTo,
    next,
    prev,
    start,
    pause,
    resume,
    destroy,
    measure,
    applyTransforms,
    armIdle,
  }
}
