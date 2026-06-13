import { onBeforeUnmount, type Ref } from 'vue'

interface DragOptions {
  onDelta: (dx: number, dy: number) => void
  onStart?: () => void
  onEnd?: (velocityX: number) => void
  threshold?: number
}

export function useDrag(target: Ref<HTMLElement | null>, opts: DragOptions) {
  let dragging = false
  let lastX = 0
  let lastY = 0
  let velocityX = 0
  let pointerId: number | null = null
  let startX = 0
  let startY = 0
  const threshold = opts.threshold ?? 12

  function down(e: PointerEvent) {
    const el = e.target as HTMLElement
    if (el.closest('a, button, input, textarea, select, [data-no-drag]')) return

    dragging = false
    pointerId = e.pointerId
    lastX = startX = e.clientX
    lastY = startY = e.clientY
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
      const distX = Math.abs(e.clientX - startX)
      const distY = Math.abs(e.clientY - startY)

      // Only start drag if movement exceeds threshold
      if (distX > threshold || distY > threshold) {
        dragging = true
        opts.onStart?.()
      } else {
        return
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
    el.addEventListener('pointermove', move, { passive: false }) // needed to preventDefault when claiming gesture
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
