/**
 * Web Audio helpers for the opening ident: dry GainNode path + clean volume
 * fade on outro (no delay/reverb bed). Preloader stays mounted (UI already
 * faded) until the fade ends, then emits complete. disposeIdentTrail clears
 * everything on unmount.
 */

type TrailState = {
  ctx: AudioContext | null
  source: MediaElementAudioSourceNode | null
  master: GainNode | null
  el: HTMLAudioElement | null
  fadeTimer: ReturnType<typeof setTimeout> | undefined
}

const trail: TrailState = {
  ctx: null,
  source: null,
  master: null,
  el: null,
  fadeTimer: undefined
}

const clearFadeTimer = () => {
  if (trail.fadeTimer !== undefined) {
    window.clearTimeout(trail.fadeTimer)
    trail.fadeTimer = undefined
  }
}

export const disposeIdentTrail = (_opts: { force?: boolean } = {}) => {
  clearFadeTimer()
  try {
    trail.master?.disconnect()
    trail.source?.disconnect()
  } catch {
    /* ignore */
  }
  trail.master = null
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
      trail.source?.disconnect()
    } catch {
      /* ignore */
    }
    trail.source = trail.ctx.createMediaElementSource(el)
    trail.master = trail.ctx.createGain()
    trail.master.gain.value = 0.92

    // Dry only — no wet/delay path while the track plays.
    trail.source.connect(trail.master)
    trail.master.connect(trail.ctx.destination)

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
 * Clean gain fade so the music does not hard-cut when the preloader vanishes.
 * No delay/reverb lift. Skip uses a tighter envelope. Always schedules dispose.
 */
export const fadeIdentWithEcho = (
  opts: { skip?: boolean; naturalEnd?: boolean; el?: HTMLAudioElement | null } = {},
) => {
  const skip = !!opts.skip
  const naturalEnd = !!opts.naturalEnd
  // Gain-only fade; optional tiny hang so the cut is not abrupt (no wet trail).
  const fadeMs = skip ? 200 : naturalEnd ? 280 : 520
  const hangMs = skip ? 0 : naturalEnd ? 120 : 280
  const totalMs = fadeMs + hangMs
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
      g.cancelScheduledValues(now)
      const cur = Math.max(0.0001, g.value || 0.92)
      g.setValueAtTime(cur, now)
      g.linearRampToValueAtTime(0.0001, now + fadeMs / 1000)
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
