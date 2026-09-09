/**
 * Opening ident audio lives in a module-owned <audio> + GainNode so a long
 * smooth dry fade can continue after the preloader unmounts (screen handoff).
 * No delay / reverb / echo — just an exponential dissolve.
 */

type TrailState = {
  ctx: AudioContext | null
  source: MediaElementAudioSourceNode | null
  master: GainNode | null
  el: HTMLAudioElement | null
  fadeTimer: ReturnType<typeof setTimeout> | undefined
  fading: boolean
  endedHandler: ((ev: Event) => void) | null
}

const trail: TrailState = {
  ctx: null,
  source: null,
  master: null,
  el: null,
  fadeTimer: undefined,
  fading: false,
  endedHandler: null
}

const clearFadeTimer = () => {
  if (trail.fadeTimer !== undefined) {
    window.clearTimeout(trail.fadeTimer)
    trail.fadeTimer = undefined
  }
}

const ensureElement = () => {
  if (typeof window === 'undefined') return null
  if (!trail.el) {
    const el = new Audio()
    el.preload = 'auto'
    el.setAttribute('playsinline', '')
    el.setAttribute('aria-hidden', 'true')
    trail.el = el
  }
  return trail.el
}

export const getIdentAudio = () => trail.el

export const disposeIdentTrail = (opts: { force?: boolean } = {}) => {
  // Soft dispose during an active fade would cut the dissolve mid-handoff.
  if (trail.fading && !opts.force) return
  clearFadeTimer()
  trail.fading = false
  if (trail.el && trail.endedHandler) {
    try {
      trail.el.removeEventListener('ended', trail.endedHandler)
    } catch {
      /* ignore */
    }
  }
  trail.endedHandler = null
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
      trail.el.removeAttribute('src')
      trail.el.load()
    } catch {
      /* ignore */
    }
  }
}

/** Unmount-safe: keep a running fade alive; otherwise hard-stop. */
export const releaseIdentOnUnmount = () => {
  if (trail.fading) return
  disposeIdentTrail({ force: true })
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

  // createMediaElementSource can only be called once per element — keep the pair.
  if (!trail.source) {
    trail.source = trail.ctx.createMediaElementSource(el)
    trail.master = trail.ctx.createGain()
    trail.master.gain.value = 0.92
    trail.source.connect(trail.master)
    trail.master.connect(trail.ctx.destination)
  }
  return true
}

export const playIdentWithGraph = (
  src: string,
  opts: { onEnded?: () => void } = {},
) => {
  disposeIdentTrail({ force: true })
  const el = ensureElement()
  if (!el || !src) return null
  try {
    if (trail.endedHandler) {
      el.removeEventListener('ended', trail.endedHandler)
      trail.endedHandler = null
    }
    if (opts.onEnded) {
      trail.endedHandler = () => opts.onEnded?.()
      el.addEventListener('ended', trail.endedHandler)
    }
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
    return el
  } catch {
    return null
  }
}

/**
 * Long exponential dry fade — no echo. UI may leave early; audio keeps going.
 */
export const fadeIdentWithEcho = (
  opts: { skip?: boolean; naturalEnd?: boolean } = {},
) => {
  const skip = !!opts.skip
  const naturalEnd = !!opts.naturalEnd
  const fadeMs = skip ? 320 : naturalEnd ? 2800 : 3600
  const hangMs = skip ? 40 : 160
  const totalMs = fadeMs + hangMs
  const visualHintMs = skip ? 220 : 720
  const el = trail.el || ensureElement()

  if (!el) {
    disposeIdentTrail({ force: true })
    return { fadeMs, totalMs, visualHintMs }
  }

  trail.fading = true

  try {
    if (trail.master && trail.ctx && trail.ctx.state !== 'closed') {
      const ctx = trail.ctx
      const now = ctx.currentTime
      const g = trail.master.gain
      g.cancelScheduledValues(now)
      const cur = Math.max(0.0001, g.value || 0.92)
      g.setValueAtTime(cur, now)
      g.exponentialRampToValueAtTime(0.0001, now + fadeMs / 1000)
      clearFadeTimer()
      trail.fadeTimer = window.setTimeout(() => {
        trail.fadeTimer = undefined
        trail.fading = false
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
    const eased = 1 - Math.pow(1 - u, 3.2)
    el.volume = Math.max(0, startVol * (1 - eased))
    if (u < 1) requestAnimationFrame(step)
    else {
      trail.fading = false
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
  return { fadeMs, totalMs, visualHintMs }
}

export const stopIdentNow = () => {
  trail.fading = false
  disposeIdentTrail({ force: true })
}
