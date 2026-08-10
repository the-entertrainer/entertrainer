/**
 * Writes an element's journey through the viewport onto the element itself, as
 * a CSS custom property, so type can be animated by scroll in pure CSS.
 *
 * `--p` runs 0 → 1 as the element travels from just below the fold to just
 * above it, and `--pc` is the same value centred to -1 → 1. Everything else is
 * a `calc()` in a stylesheet, which keeps the motion on the compositor and
 * means a page can change how it responds to scroll without touching any JS.
 *
 * Driven from rAF rather than a scroll listener on purpose: iOS fires scroll
 * events in bursts and stops firing them entirely during momentum, which makes
 * anything bound to them stutter and then freeze mid-flight. Sampling the
 * element's own rect every frame is the only approach that stays smooth on the
 * phones this site is built for.
 */
export function useScrollProgress(el: Ref<HTMLElement | null>) {
  let raf = 0
  let last = -1

  function tick() {
    raf = requestAnimationFrame(tick)
    const node = el.value
    if (!node) return
    const r = node.getBoundingClientRect()
    const h = innerHeight || 1
    // 0 when the element's top sits at the bottom of the screen, 1 when its
    // bottom has left the top of it.
    const p = Math.max(0, Math.min(1, (h - r.top) / (h + r.height)))
    // Only touch the DOM when it actually moved — this runs every frame on
    // every instance, and a wasted style write is a wasted frame.
    if (Math.abs(p - last) < 0.0005) return
    last = p
    node.style.setProperty('--p', p.toFixed(4))
    node.style.setProperty('--pc', (p * 2 - 1).toFixed(4))
  }

  onMounted(() => {
    // Under reduced motion the properties are pinned to their midpoint, so any
    // CSS built on them resolves to its resting state and never moves.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.value?.style.setProperty('--p', '0.5')
      el.value?.style.setProperty('--pc', '0')
      return
    }
    raf = requestAnimationFrame(tick)
  })
  onBeforeUnmount(() => cancelAnimationFrame(raf))
}
