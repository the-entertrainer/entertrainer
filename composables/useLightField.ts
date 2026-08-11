/**
 * One light, for the whole document.
 *
 * The WebGL stage has a key light that follows the pointer — it is why the
 * tower's bevels look like glass and not like grey plastic. The DOM pages had
 * nothing equivalent, so `.lg-surface` chrome and the deck cards were lit from
 * a fixed, imaginary source that never agreed with the one on the home screen.
 * Two different physics on one site.
 *
 * This publishes the pointer as CSS custom properties on `<html>` and lets the
 * stylesheets do the rest:
 *
 *   --lx, --ly    pointer in viewport fractions, 0..1
 *   --lxc, --lyc  the same, centred, -1..1  (handy for tilt and rim terms)
 *   --lit         0 or 1 — whether a pointer is actually present
 *
 * Why properties and not per-element listeners: there is exactly one pointer,
 * so there should be exactly one listener and one write per frame. Elements
 * that want to catch the light read the variables in CSS, which keeps the work
 * on the compositor and means a page with forty lit surfaces costs the same as
 * a page with one.
 *
 * The value is eased rather than assigned. A raw pointer position makes every
 * highlight snap in lockstep with the cursor, which reads as a mouse-follower
 * gimmick; a light with weight reads as a light.
 */
export function useLightField() {
  if (!import.meta.client) return

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  // Coarse pointers have no hover to track. A phone would otherwise leave the
  // light frozen wherever the last tap landed, which is worse than centred.
  const coarse = window.matchMedia?.('(pointer: coarse)').matches

  const root = document.documentElement
  let tx = 0.5, ty = 0.42     // target, viewport fractions
  let cx = 0.5, cy = 0.42     // current (eased)
  let lit = 0, litTarget = 0
  let raf = 0
  let dirty = true

  function onMove(e: PointerEvent) {
    tx = e.clientX / window.innerWidth
    ty = e.clientY / window.innerHeight
    litTarget = 1
    dirty = true
  }
  function onLeave() { litTarget = 0; dirty = true }

  function write() {
    root.style.setProperty('--lx', cx.toFixed(4))
    root.style.setProperty('--ly', cy.toFixed(4))
    root.style.setProperty('--lxc', (cx * 2 - 1).toFixed(4))
    root.style.setProperty('--lyc', (cy * 2 - 1).toFixed(4))
    root.style.setProperty('--lit', lit.toFixed(3))
  }

  let last = 0

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    // Frame-rate independent easing. A fixed per-frame fraction makes the light
    // chase three times faster on a 120Hz display than on a 40Hz one — the
    // whole feel of the thing would depend on the viewer's hardware.
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
    last = now
    if (!dirty) return
    const k = 1 - Math.pow(0.0045, dt)
    cx += (tx - cx) * k
    cy += (ty - cy) * k
    lit += (litTarget - lit) * (1 - Math.pow(0.006, dt))
    // Stop writing once we have arrived. An idle tab should not be dirtying
    // the style tree sixty times a second for a light that is not moving.
    if (Math.abs(tx - cx) < 0.0005 && Math.abs(ty - cy) < 0.0005 &&
        Math.abs(litTarget - lit) < 0.002) {
      cx = tx; cy = ty; lit = litTarget
      dirty = false
    }
    write()
  }

  onMounted(() => {
    write()
    if (reduce || coarse) return   // the properties still exist, just static
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(frame)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerleave', onLeave)
  })
}
