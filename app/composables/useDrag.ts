import { onBeforeUnmount, type Ref } from 'vue'

interface DragOptions {
  /** Called on every horizontal pointer delta while dragging. */
  onDelta: (dx: number, dy: number) => void
  onStart?: () => void
  onEnd?: (velocityX: number) => void
}

/**
 * Unified pointer/touch drag using Pointer Events (covers mouse + touch with
 * one code path). Tracks velocity for momentum hand-off. Framework-light:
 * attaches to a target element ref, cleans up on unmount.
 */
export function useDrag(target: Ref<HTMLElement | null>, opts: DragOptions) {
  let dragging = false
  let lastX = 0
  let lastY = 0
  let velocityX = 0
  let pointerId: number | null = null

  function down(e: PointerEvent) {
    // Ignore drags that start on interactive elements (links/buttons/inputs).
    const el = e.target as HTMLElement
    if (el.closest('a, button, input, textarea, select, [data-no-drag]')) return

    dragging = true
    pointerId = e.pointerId
    lastX = e.clientX
    lastY = e.clientY
    velocityX = 0
    target.value?.setPointerCapture?.(e.pointerId)
    opts.onStart?.()
  }

  function move(e: PointerEvent) {
    if (!dragging || e.pointerId !== pointerId) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    velocityX = dx
    lastX = e.clientX
    lastY = e.clientY
    opts.onDelta(dx, dy)
  }

  function up(e: PointerEvent) {
    if (!dragging || e.pointerId !== pointerId) return
    dragging = false
    pointerId = null
    target.value?.releasePointerCapture?.(e.pointerId)
    opts.onEnd?.(velocityX)
  }

  function attach() {
    const el = target.value
    if (!el) return
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
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
