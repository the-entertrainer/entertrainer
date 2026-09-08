/**
 * Web Audio helpers for the opening ident: GainNode fade + quiet feedback-delay echo.
 * Preloader stays mounted (UI already faded) until the trail ends, then emits complete.
 */

type TrailState = {
  ctx: AudioContext | null
  source: MediaElementAudioSourceNode | null
  master: GainNode | null
  dry: GainNode | null
  wet: GainNode | null
  delay: DelayNode | null
  feedback: GainNode | null
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
  feedback: null,
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
    trail.feedback?.disconnect()
    trail.source?.disconnect()
  } catch {
    /* ignore */
  }
  trail.master = null
  trail.dry = null
  trail.wet = null
  trail.delay = null
  trail.feedback = null
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
      trail.feedback?.disconnect()
      trail.source?.disconnect()
    } catch {
      /* ignore */
    }
    trail.source = trail.ctx.createMediaElementSource(el)
    trail.master = trail.ctx.createGain()
    trail.dry = trail.ctx.createGain()
    trail.wet = trail.ctx.createGain()
    trail.delay = trail.ctx.createDelay(1.0)
    trail.feedback = trail.ctx.createGain()

    trail.master.gain.value = 0.92
    trail.dry.gain.value = 1
    // Quiet wet — soft echo tail, never a blast.
    trail.wet.gain.value = 0.16
    trail.delay.delayTime.value = 0.15
    trail.feedback.gain.value = 0.26

    trail.source.connect(trail.master)
    trail.master.connect(trail.dry)
    trail.dry.connect(trail.ctx.destination)

    trail.master.connect(trail.delay)
    trail.delay.connect(trail.feedback)
    trail.feedback.connect(trail.delay)
    trail.delay.connect(trail.wet)
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
      if (trail.wet) trail.wet.gain.setValueAtTime(0.16, trail.ctx.currentTime)
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
 * Fade the dry path; leave a short wet echo after the UI fade.
 * Skip uses a tighter envelope so the trail does not hang.
 */
export const fadeIdentWithEcho = (
  opts: { skip?: boolean; naturalEnd?: boolean; el?: HTMLAudioElement | null } = {},
) => {
  const skip = !!opts.skip
  const naturalEnd = !!opts.naturalEnd
  const fadeMs = skip ? 200 : naturalEnd ? 0 : 520
  const echoMs = skip ? 140 : 580
  const totalMs = fadeMs + echoMs
  const visualHintMs = skip ? 220 : 480
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
        // Track already finished — tuck dry, let the delay line ring a soft tail.
        g.setValueAtTime(0.0001, now)
      } else {
        const cur = Math.max(0.0001, g.value || 0.92)
        g.setValueAtTime(cur, now)
        g.linearRampToValueAtTime(0.0001, now + fadeMs / 1000)
      }
      if (wet) {
        wet.cancelScheduledValues(now)
        const wCur = Math.max(0.0001, wet.value || 0.16)
        wet.setValueAtTime(wCur, now)
        // Keep a whisper of wet through the trail after the dry path dies.
        if (!naturalEnd) {
          wet.linearRampToValueAtTime(skip ? 0.05 : 0.11, now + fadeMs / 1000)
        } else {
          // Slightly lift wet so the residual delay is audible, then tuck away.
          wet.linearRampToValueAtTime(0.14, now + 0.05)
        }
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
      }, totalMs + 50)
      return { fadeMs, totalMs, visualHintMs }
    }
  } catch {
    /* fall through */
  }

  const startVol = el.volume || 0.92
  const t0 = performance.now()
  const step = (t: number) => {
    const u = Math.min(1, (t - t0) / fadeMs)
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
