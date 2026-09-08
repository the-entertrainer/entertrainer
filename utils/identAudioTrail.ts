/**
 * Web Audio helpers for the opening ident: GainNode fade + wet feedback-delay
 * reverb/echo trail. Preloader stays mounted (UI already faded) until the trail
 * ends, then emits complete. disposeIdentTrail clears everything on unmount.
 */

type TrailState = {
  ctx: AudioContext | null
  source: MediaElementAudioSourceNode | null
  master: GainNode | null
  dry: GainNode | null
  wet: GainNode | null
  delay: DelayNode | null
  delay2: DelayNode | null
  feedback: GainNode | null
  feedback2: GainNode | null
  el: HTMLAudioElement | null
  echoTimer: ReturnType<typeof setTimeout> | undefined
}

const trail: TrailState = {
  ctx: null,
  source: null,
  master: null,
  dry: null,
  wet: null,
  delay: null,
  delay2: null,
  feedback: null,
  feedback2: null,
  el: null,
  echoTimer: undefined
}

const clearEchoTimer = () => {
  if (trail.echoTimer !== undefined) {
    window.clearTimeout(trail.echoTimer)
    trail.echoTimer = undefined
  }
}

export const disposeIdentTrail = (_opts: { force?: boolean } = {}) => {
  clearEchoTimer()
  try {
    trail.master?.disconnect()
    trail.dry?.disconnect()
    trail.wet?.disconnect()
    trail.delay?.disconnect()
    trail.delay2?.disconnect()
    trail.feedback?.disconnect()
    trail.feedback2?.disconnect()
    trail.source?.disconnect()
  } catch {
    /* ignore */
  }
  trail.master = null
  trail.dry = null
  trail.wet = null
  trail.delay = null
  trail.delay2 = null
  trail.feedback = null
  trail.feedback2 = null
  trail.source = null
  if (trail.ctx) {
    const ctx = trail.ctx
    trail.ctx = null
    void ctx.close().catch(() => undefined)
  }
  if (trail.el) {
    try {
      trail.el.pause()
      trail.el.currentTime = 0
    } catch {
      /* ignore */
    }
    trail.el = null
  }
}

const ensureGraph = (el: HTMLAudioElement) => {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return false

  if (!trail.ctx || trail.ctx.state === 'closed') {
    trail.ctx = new AC()
    trail.source = null
    trail.master = null
  }
  if (trail.ctx.state === 'suspended') void trail.ctx.resume().catch(() => undefined)

  if (!trail.source || trail.el !== el) {
    try {
      trail.master?.disconnect()
      trail.dry?.disconnect()
      trail.wet?.disconnect()
      trail.delay?.disconnect()
      trail.delay2?.disconnect()
      trail.feedback?.disconnect()
      trail.feedback2?.disconnect()
      trail.source?.disconnect()
    } catch {
      /* ignore */
    }
    trail.source = trail.ctx.createMediaElementSource(el)
    trail.master = trail.ctx.createGain()
    trail.dry = trail.ctx.createGain()
    trail.wet = trail.ctx.createGain()
    // Dual delay = short slap + longer wash (readable wet reverb hang).
    trail.delay = trail.ctx.createDelay(1.2)
    trail.delay2 = trail.ctx.createDelay(1.2)
    trail.feedback = trail.ctx.createGain()
    trail.feedback2 = trail.ctx.createGain()

    trail.master.gain.value = 0.92
    trail.dry.gain.value = 1
    // Audible wet bed while playing; trail lift happens in fadeIdentWithEcho.
    trail.wet.gain.value = 0.22
    trail.delay.delayTime.value = 0.22
    trail.delay2.delayTime.value = 0.48
    trail.feedback.gain.value = 0.42
    trail.feedback2.gain.value = 0.28

    trail.source.connect(trail.master)
    trail.master.connect(trail.dry)
    trail.dry.connect(trail.ctx.destination)

    // Short echo loop
    trail.master.connect(trail.delay)
    trail.delay.connect(trail.feedback)
    trail.feedback.connect(trail.delay)
    trail.delay.connect(trail.wet)

    // Longer wash loop (parallel)
    trail.master.connect(trail.delay2)
    trail.delay2.connect(trail.feedback2)
    trail.feedback2.connect(trail.delay2)
    trail.delay2.connect(trail.wet)

    trail.wet.connect(trail.ctx.destination)

    trail.el = el
  }
  return true
}

export const playIdentWithGraph = (el: HTMLAudioElement, src: string) => {
  disposeIdentTrail({ force: true })
  try {
    if (el.getAttribute('src') !== src) el.src = src
    el.pause()
    el.currentTime = 0
    el.volume = 1
    const wired = ensureGraph(el)
    if (wired && trail.master && trail.ctx) {
      trail.master.gain.cancelScheduledValues(trail.ctx.currentTime)
      trail.master.gain.setValueAtTime(0.92, trail.ctx.currentTime)
      if (trail.wet) trail.wet.gain.setValueAtTime(0.22, trail.ctx.currentTime)
    } else {
      el.volume = 0.92
    }
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => undefined)
  } catch {
    /* Visual handoff never depends on audio. */
  }
}

/**
 * Fade the dry path; leave a clearer wet reverb/echo trail after the UI fade.
 * Skip uses a tighter envelope. Natural end / near-end leave a soft hang.
 * Always schedules dispose — never leaves audio running forever.
 */
export const fadeIdentWithEcho = (
  opts: { skip?: boolean; naturalEnd?: boolean; el?: HTMLAudioElement | null } = {},
) => {
  const skip = !!opts.skip
  const naturalEnd = !!opts.naturalEnd
  // Dry fade, then wet hang after the UI is already gone.
  const fadeMs = skip ? 200 : naturalEnd ? 160 : 640
  const echoMs = skip ? 280 : naturalEnd ? 1800 : 1400
  const totalMs = fadeMs + echoMs
  // UI can vanish while wet trail continues (preloader stays mounted).
  const visualHintMs = skip ? 220 : 520
  const el = opts.el || trail.el

  if (!el) {
    disposeIdentTrail({ force: true })
    return { fadeMs, totalMs, visualHintMs }
  }

  trail.el = el

  try {
    if (trail.master && trail.ctx && trail.ctx.state !== 'closed') {
      const ctx = trail.ctx
      const now = ctx.currentTime
      const g = trail.master.gain
      const wet = trail.wet?.gain
      g.cancelScheduledValues(now)
      if (naturalEnd) {
        // Track already finished — tuck dry quickly, let delay lines ring.
        const cur = Math.max(0.0001, g.value || 0.92)
        g.setValueAtTime(cur, now)
        g.linearRampToValueAtTime(0.0001, now + fadeMs / 1000)
      } else {
        const cur = Math.max(0.0001, g.value || 0.92)
        g.setValueAtTime(cur, now)
        g.linearRampToValueAtTime(0.0001, now + fadeMs / 1000)
      }
      if (wet) {
        wet.cancelScheduledValues(now)
        const wCur = Math.max(0.0001, wet.value || 0.22)
        wet.setValueAtTime(wCur, now)
        // Lift wet as dry dies so the reverb hang is clearly audible.
        const peak = skip ? 0.14 : naturalEnd ? 0.4 : 0.36
        wet.linearRampToValueAtTime(peak, now + Math.max(0.08, fadeMs / 1000))
        // Soft exponential-ish tuck across the hang (two linear segments).
        const mid = now + (fadeMs + echoMs * 0.45) / 1000
        wet.linearRampToValueAtTime(peak * 0.45, mid)
        wet.linearRampToValueAtTime(0.0001, now + totalMs / 1000)
      }
      clearEchoTimer()
      trail.echoTimer = window.setTimeout(() => {
        trail.echoTimer = undefined
        try {
          el.pause()
          el.currentTime = 0
        } catch {
          /* ignore */
        }
        disposeIdentTrail({ force: true })
      }, totalMs + 80)
      return { fadeMs, totalMs, visualHintMs }
    }
  } catch {
    /* fall through */
  }

  const startVol = el.volume || 0.92
  const t0 = performance.now()
  const step = (t: number) => {
    const u = Math.min(1, (t - t0) / Math.max(1, fadeMs))
    el.volume = Math.max(0, startVol * (1 - u))
    if (u < 1) requestAnimationFrame(step)
    else {
      try {
        el.pause()
        el.currentTime = 0
      } catch {
        /* ignore */
      }
      disposeIdentTrail({ force: true })
    }
  }
  requestAnimationFrame(step)
  return { fadeMs, totalMs: fadeMs, visualHintMs }
}

export const stopIdentNow = () => {
  disposeIdentTrail({ force: true })
}
