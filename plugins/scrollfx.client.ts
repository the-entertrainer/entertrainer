/**
 * Site-wide scroll motion.
 *
 * 1. Smooth scrolling (Lenis, vendored) on desktop with a mouse or trackpad
 *    only. Touch and phones keep native scrolling so the app feel is untouched.
 *    It drives ScrollTrigger from the same ticker, so scrubs stay in step.
 * 2. After every route paints, a light scroll layer finds the things pages
 *    share (headings, cards, rows, pull quotes, dividers, photos) and ties them
 *    to scroll: staggered rises, drawn rules and a slow photo parallax. It
 *    skips anything a page already animates, never touches body prose, uses
 *    transform and opacity only, and does nothing at all under reduced motion.
 *
 * Nothing is hidden until GSAP is ready, and only elements still below the
 * fold are ever hidden, so there is no flash and no layout shift.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let ctx: { revert: () => void } | null = null
  let cleanup: (() => void) | null = null
  let gen = 0
  let lenisStarted = false

  const desktopPointer = () => window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches

  async function startLenis() {
    if (lenisStarted || !desktopPointer()) return
    lenisStarted = true
    const kit = await getMotionKit()
    if (!kit || kit.level !== 'full') { lenisStarted = false; return }
    const { default: Lenis } = await import('~/vendor/lenis.mjs') as { default: new (o: Record<string, unknown>) => { raf: (t: number) => void; on: (e: string, f: () => void) => void; destroy: () => void } }
    const { gsap, ScrollTrigger } = kit
    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      syncTouch: false,
      prevent: (node: Element) => !!node.closest?.('[role="dialog"], .preloader, .dpx, .sp__panel, .reader, textarea, [data-lenis-prevent]')
    })
    document.documentElement.classList.add('has-lenis')
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t: number) => lenis.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
    // Leave smooth mode if the window shrinks to a touch layout.
    window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').addEventListener('change', (e) => {
      if (!e.matches) { lenis.destroy(); document.documentElement.classList.remove('has-lenis') }
    })
  }

  async function setup(id: number) {
    const kit = await getMotionKit()
    try { await (document as Document & { fonts?: FontFaceSet }).fonts?.ready } catch { /* ignore */ }
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    if (!kit || id !== gen) return
    const { gsap, ScrollTrigger, k, d } = kit
    const main = document.getElementById('main')
    if (!main) return
    const vh = window.innerHeight
    const below = (el: Element) => el.getBoundingClientRect().top > vh * 0.92
    // Anything a page already animates (on itself, a parent or inside it) is left alone.
    const claimed = (el: Element) => {
      if (el.closest('.home, [data-fx="off"]')) return true
      for (let n: Element | null = el; n && n !== main; n = n.parentElement) if (gsap.getTweensOf(n).length) return true
      return el.children.length > 0 && gsap.getTweensOf(Array.from(el.querySelectorAll('*')).slice(0, 60)).length > 0
    }
    const pending = new Map<HTMLElement, { stagger?: number }>()
    const reveal = (els: HTMLElement[], o: { stagger?: number }) => {
      els.forEach(e => pending.delete(e))
      gsap.to(els, { autoAlpha: 1, y: 0, scale: 1, duration: 1 * k, ease: 'ink', stagger: (o.stagger ?? 0.09) * k, clearProps: 'opacity,visibility,transform' })
    }
    const c = gsap.context(() => {
      const rise = (selector: string, opts: { y?: number; stagger?: number; start?: string; scale?: number } = {}) => {
        const els = gsap.utils.toArray<HTMLElement>(selector, main).filter(el => !claimed(el) && !el.closest('.prose, .art__body') && !el.parentElement?.closest(selector) && below(el))
        if (!els.length) return
        gsap.set(els, { autoAlpha: 0, y: (opts.y ?? 40) * d, scale: opts.scale ?? 1 })
        els.forEach(e => pending.set(e, opts))
        ScrollTrigger.batch(els, { start: opts.start ?? 'top 90%', once: true, interval: 0.08, batchMax: 6, onEnter: batch => reveal(batch as HTMLElement[], opts) })
      }
      rise('h2, h3', { y: 34, stagger: 0.06 })
      rise('.card, .fx-panel, .fx-stage, .fi__row, .elevate__item, .fx-card', { y: 54, scale: 0.985 })
      rise('blockquote:not(.sr-only), .pullquote', { y: 30 })

      // Rules draw themselves in from the left.
      gsap.utils.toArray<HTMLElement>('hr', main).filter(el => !claimed(el) && below(el)).forEach((el) => {
        gsap.set(el, { scaleX: 0, transformOrigin: '0 50%' })
        ScrollTrigger.create({ trigger: el, start: 'top 94%', once: true, onEnter: () => { gsap.to(el, { scaleX: 1, duration: 1.1 * k, ease: 'ink', clearProps: 'transform' }) } })
      })

      // Photos drift against the scroll inside their frames.
      gsap.utils.toArray<HTMLImageElement>('img', main).forEach((img) => {
        const frame = img.parentElement
        if (!frame || claimed(img) || img.closest('.home, .brand-mark, .tb') || img.width < 120) return
        const hiding = ['hidden', 'clip', 'auto'].includes(getComputedStyle(frame).overflowY) || ['hidden', 'clip'].includes(getComputedStyle(frame).overflow)
        if (!hiding) return
        img.setAttribute('data-px', '')
        gsap.fromTo(img, { '--py': -5 * d }, { '--py': 5 * d, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, main)
    ctx = c
    // Safety net: layout can grow after setup (lazy photos, fonts). Re-measure,
    // and never leave something hidden once it is on screen.
    const sweep = () => {
      const due = [...pending.keys()].filter(el => !el.isConnected ? (pending.delete(el), false) : el.getBoundingClientRect().top < window.innerHeight * 0.92)
      if (due.length) reveal(due, { stagger: 0.06 })
    }
    ScrollTrigger.addEventListener('scrollEnd', sweep)
    let rt: ReturnType<typeof setTimeout> | undefined
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { ScrollTrigger.refresh(); sweep() }, 250) })
    ro.observe(main)
    cleanup = () => { ScrollTrigger.removeEventListener('scrollEnd', sweep); ro.disconnect(); clearTimeout(rt) }
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  function teardown() {
    gen++
    cleanup?.(); cleanup = null
    ctx?.revert()
    ctx = null
    document.querySelectorAll('img[data-px]').forEach(i => i.removeAttribute('data-px'))
  }

  let t: ReturnType<typeof setTimeout> | undefined
  nuxtApp.hook('page:start', teardown)
  nuxtApp.hook('page:finish', () => {
    clearTimeout(t)
    const id = ++gen
    // Let the page's own entrance code claim its elements first.
    t = setTimeout(() => { void setup(id) }, 220)
  })

  const idle = (window as Window & { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 600))
  const boot = () => idle(() => { startLenis().catch(() => { lenisStarted = false }) })
  if (document.readyState === 'complete') boot()
  else window.addEventListener('load', boot, { once: true })
})
