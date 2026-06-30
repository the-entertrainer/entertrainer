import type { Ref } from 'vue'

/**
 * Wires the desktop cursor-tracked specular sheen onto every `.glass-panel`
 * inside `rootRef`. Uses a single delegated pointermove on the root so panels
 * that appear later (phase swaps, async results) light up too — no re-binding.
 *
 * Bound only on hover-capable, fine-pointer devices, and skipped under reduced
 * motion, so phones never pay for it. rAF-throttled and passive.
 */
export function useGlassMicro(rootRef: Ref<HTMLElement | null>) {
  let raf = 0
  let pending: { el: HTMLElement; x: number; y: number } | null = null
  let current: HTMLElement | null = null
  let bound = false

  const enabled = import.meta.client &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function flush() {
    raf = 0
    if (!pending) return
    pending.el.style.setProperty('--mx', `${pending.x}%`)
    pending.el.style.setProperty('--my', `${pending.y}%`)
    pending.el.style.setProperty('--sheen', '1')
  }

  function onMove(e: PointerEvent) {
    const el = (e.target as HTMLElement)?.closest?.('.glass-panel') as HTMLElement | null
    if (el !== current) {
      current?.style.setProperty('--sheen', '0')
      current = el
    }
    if (!el) return
    const r = el.getBoundingClientRect()
    pending = {
      el,
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    }
    if (!raf) raf = requestAnimationFrame(flush)
  }

  function onLeave() {
    current?.style.setProperty('--sheen', '0')
    current = null
  }

  onMounted(() => {
    const root = rootRef.value
    if (!root || !enabled) return
    root.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave, { passive: true })
    bound = true
  })

  onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf)
    const root = rootRef.value
    if (bound && root) {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  })
}
