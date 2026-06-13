import { onBeforeUnmount, type Ref } from 'vue'

interface DragOptions {
  /** Called on every horizontal pointer delta while dragging. */
  onDelta: (dx: number, dy: number) => void
  onStart?: () => void
  onEnd?: (velocityX: number) => void
  /** Minimum pixels to move before drag is considered active (prevents jitter on tap) */
  threshold?: number
}

/**
 * Unified pointer/touch drag using Pointer Events.
 * Mobile-optimized: has drag threshold + better velocity for touch.
 */
export function useDrag(target: Ref<HTMLElement | null>, opts: DragOptions) {
  let dragging = false
  let lastX = 0
  let lastY = 0
  let velocityX = 0
  let pointerId: number | null = null
  let startX = 0
  const threshold = opts.threshold ?? 10 // good default for mobile

  function down(e: PointerEvent) {
    const el = e.target as HTMLElement
    if (el.closest('a, button, input, textarea, select, [data-no-drag]')) return

    dragging = false // not yet active until threshold crossed
    pointerId = e.pointerId
    lastX = e.clientX
    lastY = e.clientY
    startX = e.clientX
    velocityX = 0
    target.value?.setPointerCapture?.(e.pointerId)
  }

  function move(e: PointerEvent) {
    if (e.pointerId !== pointerId) return

    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    velocityX = dx
    lastX = e.clientX
    lastY = e.clientY

    if (!dragging) {
      // Only start real dragging after threshold
      if (Math.abs(e.clientX - startX) > threshold) {
        dragging = true
        opts.onStart?.()
      } else {
        return // ignore tiny movements
      }
    }

    opts.onDelta(dx, dy)
  }

  function up(e: PointerEvent) {
    if (e.pointerId !== pointerId) return

    const wasDragging = dragging
    dragging = false
    pointerId = null
    target.value?.releasePointerCapture?.(e.pointerId)

    if (wasDragging) {
      opts.onEnd?.(velocityX)
    }
  }

  function attach() {
    const el = target.value
    if (!el) return
    el.addEventListener('pointerdown', down, { passive: true })
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('pointerleave', up)
  }

  function detach() {
    const el = target.value
    if (!el) return
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
    el.removeEventListener('pointerleave', up)
  }

  onBeforeUnmount(detach)

  return { attach, detach, isDragging: () => dragging }
}
