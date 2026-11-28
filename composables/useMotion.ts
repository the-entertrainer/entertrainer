/**
 * Dawn Press motion engine.
 *
 * One place that loads GSAP and its plugins, on the client only, the first
 * time a page asks for them. Pages call `useMotion(scope)` and get `run()`,
 * which hands them a gsap.context scoped to their root element. The context
 * is reverted on unmount, so every tween and ScrollTrigger dies with the page.
 *
 * The no-JS guarantee: elements are visible in CSS. Every helper uses
 * `gsap.from`, so the hidden pre-state exists only for the length of the
 * tween that removes it. If GSAP never loads, nothing is ever hidden.
 *
 * Levels: full (default), calm (half the distance and duration), off (the OS
 * reduce preference or Settings > Motion > Off). At "off", `run()` does not
 * call the page's animation at all.
 */
import type { Ref } from 'vue'

export type MotionLevel = 'full' | 'calm' | 'off'

type GsapMod = typeof import('gsap')
export interface MotionKit {
  gsap: GsapMod['gsap']
  ScrollTrigger: typeof import('gsap/ScrollTrigger')['ScrollTrigger']
  SplitText: typeof import('gsap/SplitText')['SplitText']
  Flip: typeof import('gsap/Flip')['Flip']
  level: MotionLevel
  /**
   * True on a first hard load when the page was already painted well before
   * GSAP arrived. Entrances for anything on screen are skipped then, because
   * replaying text the reader has already seen is a flash, not a reveal (and
   * it pushes LCP back). Scroll reveals further down still run.
   */
  late: boolean
  /** Multiply durations by this (1 full, 0.5 calm). */
  k: number
  /** Distance scale (1 full, 0.5 calm). */
  d: number
  inkReveal: (targets: gsap.TweenTarget, vars?: gsap.TweenVars) => gsap.core.Tween
  stampIn: (targets: gsap.TweenTarget, vars?: gsap.TweenVars) => gsap.core.Tween
  drawRule: (targets: gsap.TweenTarget, vars?: gsap.TweenVars) => gsap.core.Tween
  drawPath: (targets: gsap.TweenTarget, vars?: gsap.TweenVars) => gsap.core.Tween
  develop: (targets: gsap.TweenTarget, vars?: gsap.TweenVars) => gsap.core.Tween
  splitLines: (el: Element, vars?: gsap.TweenVars) => gsap.core.Tween | null
}

let loader: Promise<Omit<MotionKit, 'level' | 'late' | 'k' | 'd' | 'inkReveal' | 'stampIn' | 'drawRule' | 'drawPath' | 'develop' | 'splitLines'>> | null = null

export function loadGsap() {
  if (!loader) {
    loader = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
      import('gsap/DrawSVGPlugin'),
      import('gsap/Flip'),
      import('gsap/CustomEase')
    ]).then(([g, st, sp, dr, fl, ce]) => {
      const gsap = g.gsap
      gsap.registerPlugin(st.ScrollTrigger, sp.SplitText, dr.DrawSVGPlugin, fl.Flip, ce.CustomEase)
      // The press vocabulary. Ink: expo-out. Stamp: fast in, a 3% overshoot,
      // a firm settle. Sun: sine in-out. Exit: ease-in.
      ce.CustomEase.create('ink', '0.19,1,0.22,1')
      ce.CustomEase.create('stamp', 'M0,0 C0.2,0 0.26,1.06 0.5,1.03 0.7,1.005 0.8,1 1,1')
      ce.CustomEase.create('sun', '0.37,0,0.63,1')
      ce.CustomEase.create('exit', '0.55,0,1,0.45')
      gsap.defaults({ ease: 'ink', duration: 0.7 })
      return { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText, Flip: fl.Flip }
    })
  }
  return loader
}

/* A stage is "fresh" when the reader has not seen it yet: after a client-side
   route change, or when the opening animation hands over the front page. */
let freshStage = false
export function markFreshStage() { freshStage = true }
const LATE_AFTER_FCP_MS = 250
const LATE_WINDOW_MS = 400
function isLate(): number {
  if (freshStage) return 0
  try {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime
    if (fcp != null && performance.now() - fcp > LATE_AFTER_FCP_MS) return performance.now() + LATE_WINDOW_MS
  } catch { /* ignore */ }
  return 0
}

export function motionLevel(): MotionLevel {
  if (!import.meta.client) return 'off'
  const html = document.documentElement
  if (html.getAttribute('data-reduce-motion') === 'on') return 'off'
  try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off' } catch { /* ignore */ }
  return html.getAttribute('data-motion') === 'calm' ? 'calm' : 'full'
}

function kit(base: Awaited<ReturnType<typeof loadGsap>>, level: MotionLevel): MotionKit {
  const { gsap, SplitText } = base
  const k = level === 'calm' ? 0.5 : 1
  const d = level === 'calm' ? 0.5 : 1
  const lateUntil = isLate()
  const late = lateUntil > 0
  /** While late, drop targets already on screen; the rest still animate. */
  const offscreen = (t: gsap.TweenTarget): gsap.TweenTarget => {
    if (!late || performance.now() > lateUntil) return t
    return gsap.utils.toArray<Element>(t).filter((el) => {
      const r = el.getBoundingClientRect()
      return r.top >= window.innerHeight || r.bottom <= 0
    })
  }
  const from = (t: gsap.TweenTarget, vars: gsap.TweenVars) => {
    const list = offscreen(t)
    if (Array.isArray(list) && !list.length) return gsap.to({}, { duration: 0 })
    return gsap.from(list, vars)
  }
  return {
    ...base, level, late, k, d,
    inkReveal: (t, v = {}) => from(t, { autoAlpha: 0, y: 21 * d, duration: 0.7 * k, ease: 'ink', stagger: 0.055 * k, clearProps: 'transform,opacity,visibility', ...v }),
    stampIn: (t, v = {}) => from(t, { autoAlpha: 0, scale: 1 + 0.12 * d, rotate: -2 * d, duration: 0.42 * k, ease: 'stamp', stagger: 0.07 * k, clearProps: 'transform,opacity,visibility', ...v }),
    drawRule: (t, v = {}) => from(t, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.7 * k, ease: 'ink', clearProps: 'transform', ...v }),
    drawPath: (t, v = {}) => from(t, { drawSVG: '0%', duration: 1.2 * k, ease: 'sun', stagger: 0.08 * k, ...v }),
    develop: (t, v = {}) => from(t, { autoAlpha: 0.2, filter: 'grayscale(1) contrast(.6) blur(3px)', duration: 1.2 * k, ease: 'sun', clearProps: 'filter,opacity,visibility', ...v }),
    splitLines: (el, v = {}) => {
      const keep = offscreen(el)
      if (Array.isArray(keep) && !keep.length) return null
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'dp-line', aria: 'auto' })
      return gsap.from(split.lines, {
        yPercent: 110 * d, duration: 0.9 * k, ease: 'ink', stagger: 0.07 * k, ...v,
        onComplete: () => { split.revert(); (v.onComplete as (() => void) | undefined)?.() }
      })
    }
  }
}

/**
 * Scope animations to a component. `run(fn)` waits for mount and fonts, then
 * runs `fn` inside a gsap.context bound to `scope`. Everything is reverted on
 * unmount.
 */
export function useMotion(scope?: Ref<HTMLElement | null | undefined>) {
  let ctx: gsap.Context | null = null
  let alive = true
  const level = ref<MotionLevel>('off')

  async function run(fn: (m: MotionKit) => void | (() => void)) {
    if (!import.meta.client) return
    level.value = motionLevel()
    if (level.value === 'off') return
    const base = await loadGsap()
    if (!alive) return
    try { await (document as Document & { fonts?: FontFaceSet }).fonts?.ready } catch { /* ignore */ }
    if (!alive) return
    const m = kit(base, level.value)
    if (!ctx) ctx = m.gsap.context(() => {}, scope?.value ?? undefined)
    ctx.add(() => fn(m))
  }

  onBeforeUnmount(() => {
    alive = false
    ctx?.revert()
    ctx = null
  })

  return { run, level }
}

/** Refresh ScrollTrigger after a route paints, only if GSAP is already loaded. */
export function refreshMotion() {
  if (!loader) return
  void loader.then(k => k.ScrollTrigger.refresh())
}

/** The kit without a component scope, for long-lived layers that re-run per route. Null when motion is off. */
export async function getMotionKit(): Promise<MotionKit | null> {
  if (!import.meta.client) return null
  const level = motionLevel()
  if (level === 'off') return null
  const base = await loadGsap()
  return kit(base, level)
}
