/**
 * Opening ident audio: dry path while playing, then a slow mellow fade with a
 * short wet delay trail so the song dissolves instead of cutting short.
 * Preloader stays mounted until the fade+trail ends.
 */

type TrailState = {
  ctx: AudioContext | null
  source: MediaElementAudioSourceNode | null
  master: GainNode | null
  wet: GainNode | null
  delay: DelayNode | null
  feedback: GainNode | null
  el: HTMLAudioElement | null
  fadeTimer: ReturnType<typeof setTimeout> | undefined
}

const trail: TrailState = {
  ctx: null,
  source: null,
  master: null,
  wet: null,
  delay: null,
  feedback: null,
  el: null,
  fadeTimer: undefined
}

const clearFadeTimer = () => {
  if (trail.fadeTimer !== undefined) {
    window.clearTimeout(trail.fadeTimer)
    trail.fadeTimer = undefined
  }
}

const disconnectGraph = () => {
  try {
    trail.feedback?.disconnect()
    trail.delay?.disconnect()
    trail.wet?.disconnect()
    trail.master?.disconnect()
    trail.source?.disconnect()
  } catch {
    /* ignore */
  }
  trail.feedback = null
  trail.delay = null
  trail.wet = null
  trail.master = null
  trail.source = null
}

export const disposeIdentTrail = (_opts: { force?: boolean } = {}) => {
  clearFadeTimer()
  disconnectGraph()
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
    disconnectGraph()
  }
  if (trail.ctx.state === 'suspended') void trail.ctx.resume().catch(() => undefined)

  if (!trail.source || trail.el !== el) {
    disconnectGraph()
    trail.source = trail.ctx.createMediaElementSource(el)
    trail.master = trail.ctx.createGain()
    trail.master.gain.value = 0.92

    // Wet delay bed — silent until fade lifts it.
    trail.delay = trail.ctx.createDelay(1.2)
    trail.delay.delayTime.value = 0.22
    trail.feedback = trail.ctx.createGain()
    trail.feedback.gain.value = 0.32
    trail.wet = trail.ctx.createGain()
    trail.wet.gain.value = 0

    trail.source.connect(trail.master)
    trail.master.connect(trail.ctx.destination)

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
    if (wired && trail.master && trail.wet && trail.ctx) {
      const now = trail.ctx.currentTime
      trail.master.gain.cancelScheduledValues(now)
      trail.master.gain.setValueAtTime(0.92, now)
      trail.wet.gain.cancelScheduledValues(now)
      trail.wet.gain.setValueAtTime(0, now)
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
 * Slow mellow fade with a wet delay dissolve.
 * Skip stays short. Natural/end starts early enough that the trail is heard.
 */
export const fadeIdentWithEcho = (
  opts: { skip?: boolean; naturalEnd?: boolean; el?: HTMLAudioElement | null } = {},
) => {
  const skip = !!opts.skip
  const naturalEnd = !!opts.naturalEnd
  // Long gentle dry fade; wet hang lets the echo decay after dry hits silence.
  const fadeMs = skip ? 280 : naturalEnd ? 1600 : 2400
  const hangMs = skip ? 80 : naturalEnd ? 1100 : 1400
  const totalMs = fadeMs + hangMs
  const visualHintMs = skip ? 220 : Math.min(900, fadeMs * 0.35)
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
      const dry = trail.master.gain
      const wet = trail.wet?.gain
      dry.cancelScheduledValues(now)
      const cur = Math.max(0.0001, dry.value || 0.92)
      dry.setValueAtTime(cur, now)
      // Exponential-ish mellow: hold a beat, then ease to near-zero.
      dry.setValueAtTime(cur, now + 0.08)
      dry.exponentialRampToValueAtTime(0.0001, now + fadeMs / 1000)

      if (wet) {
        wet.cancelScheduledValues(now)
        wet.setValueAtTime(Math.max(0.0001, wet.value || 0.0001), now)
        // Lift wet briefly as dry falls, then dissolve.
        wet.linearRampToValueAtTime(0.42, now + Math.min(0.45, fadeMs / 1000 / 3))
        wet.exponentialRampToValueAtTime(0.0001, now + totalMs / 1000)
      }

      clearFadeTimer()
      trail.fadeTimer = window.setTimeout(() => {
        trail.fadeTimer = undefined
        try {
          el.pause()
          el.currentTime = 0
        } catch {
          /* ignore */
        }
        disposeIdentTrail({ force: true })
      }, totalMs + 120)
      return { fadeMs, totalMs, visualHintMs }
    }
  } catch {
    /* fall through */
  }

  const startVol = el.volume || 0.92
  const t0 = performance.now()
  const step = (t: number) => {
    const u = Math.min(1, (t - t0) / Math.max(1, fadeMs))
    // Ease-out mellow curve
    const eased = 1 - Math.pow(1 - u, 2.2)
    el.volume = Math.max(0, startVol * (1 - eased))
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
  return { fadeMs, totalMs: fadeMs + hangMs, visualHintMs }
}

export const stopIdentNow = () => {
  disposeIdentTrail({ force: true })
}
