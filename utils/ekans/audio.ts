/**
 * EKANS sound — a tiny Web Audio synth, plus one real sample.
 *
 * Nearly everything is generated at runtime: triangle oscillators (warmer
 * and rounder than a square wave — softer, on purpose) and filtered noise,
 * all with very short envelopes. The one exception is the bite — thirteen
 * individual chews cut from a single field recording, played back at random
 * so the same crunch never lands twice in a row. They're tiny (a few KB
 * each) and fetched lazily on first use, so a page that never eats never
 * downloads them.
 *
 * Every other sound in the kit is built the same two ways every time: a
 * triangle tone for pitch, plus a whisper of `grain()` — the same filtered
 * noise texture the bite uses, just much quieter and shorter — so a tap, a
 * chirp and a bite all read as one material, not three different toys.
 *
 * Browsers refuse to start audio outside a user gesture, so the context is
 * created lazily on the first tap and resumed if it was suspended.
 */

const STORE_KEY = 'ekans-muted'
const CHEW_COUNT = 13
const CHEW_URL = (n: number) => `/sounds/ekans/chew/chew-${String(n).padStart(2, '0')}.mp3`

class ArcadeAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private _muted = false
  private _ready = false
  private chewBuffers: AudioBuffer[] = []
  private chewLoadStarted = false
  private lastChewIndex = -1
  /** Pink theme gets its own sound bank — sine bells and sparkle instead of triangle and grain. */
  private cute = false

  get muted() { return this._muted }
  setTheme(theme: 'yellow' | 'pink') { this.cute = theme === 'pink' }

  /** Read the stored preference. Safe to call before any gesture. */
  restore() {
    if (typeof window === 'undefined') return
    try { this._muted = window.localStorage.getItem(STORE_KEY) === '1' } catch { /* private mode */ }
  }

  setMuted(v: boolean) {
    this._muted = v
    try { window.localStorage.setItem(STORE_KEY, v ? '1' : '0') } catch { /* private mode */ }
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v ? 0 : 0.9, this.ctx.currentTime, 0.02)
    }
  }

  /** Call from inside a real user gesture (a tap or click handler). */
  unlock() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
      if (!Ctor) return
      try {
        this.ctx = new Ctor()
        this.master = this.ctx.createGain()
        this.master.gain.value = this._muted ? 0 : 0.9
        this.master.connect(this.ctx.destination)
        this._ready = true
        void this.loadChewBuffers()
      } catch { this.ctx = null }
    }
    if (this.ctx?.state === 'suspended') void this.ctx.resume().catch(() => undefined)
  }

  dispose() {
    try { void this.ctx?.close() } catch { /* already gone */ }
    this.ctx = null; this.master = null; this._ready = false
    this.chewBuffers = []; this.chewLoadStarted = false; this.lastChewIndex = -1
  }

  /** Fetch and decode the thirteen chew clips once, in the background. */
  private async loadChewBuffers() {
    if (this.chewLoadStarted || !this.ctx) return
    this.chewLoadStarted = true
    const ctx = this.ctx
    const clips = await Promise.all(
      Array.from({ length: CHEW_COUNT }, async (_, i) => {
        try {
          const res = await fetch(CHEW_URL(i + 1))
          const bytes = await res.arrayBuffer()
          return await ctx.decodeAudioData(bytes)
        } catch { return null }
      })
    )
    this.chewBuffers = clips.filter((clip): clip is AudioBuffer => clip != null)
  }

  /** One random chew clip, never the same one twice in a row. */
  private playChew() {
    if (!this.live() || !this.chewBuffers.length) return false
    const ctx = this.ctx!
    let index = Math.floor(Math.random() * this.chewBuffers.length)
    if (this.chewBuffers.length > 1 && index === this.lastChewIndex) index = (index + 1) % this.chewBuffers.length
    this.lastChewIndex = index
    const src = ctx.createBufferSource()
    src.buffer = this.chewBuffers[index]
    src.playbackRate.value = 0.94 + Math.random() * 0.12
    const gain = ctx.createGain()
    gain.gain.value = 0.8 + Math.random() * 0.2
    src.connect(gain); gain.connect(this.master!)
    src.start()
    src.onended = () => { src.disconnect(); gain.disconnect() }
    return true
  }

  private get t() { return this.ctx ? this.ctx.currentTime : 0 }
  private live() { return this._ready && !!this.ctx && !!this.master && !this._muted }

  /** One oscillator with an attack/decay envelope, optionally gliding in pitch. */
  private tone(opts: {
    from: number; to?: number; dur: number
    type?: OscillatorType; vol?: number; delay?: number; glideCurve?: 'lin' | 'exp'
  }) {
    if (!this.live()) return
    const ctx = this.ctx!, start = this.t + (opts.delay ?? 0)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = opts.type ?? 'triangle'
    osc.frequency.setValueAtTime(opts.from, start)
    if (opts.to != null && opts.to !== opts.from) {
      if (opts.glideCurve === 'lin') osc.frequency.linearRampToValueAtTime(opts.to, start + opts.dur)
      else osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), start + opts.dur)
    }
    const peak = opts.vol ?? 0.18
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(peak, start + 0.014)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.dur)
    osc.connect(gain); gain.connect(this.master!)
    osc.start(start); osc.stop(start + opts.dur + 0.02)
    osc.onended = () => { osc.disconnect(); gain.disconnect() }
  }

  /** Filtered white noise — the bite, the crumble, the thud. */
  private noise(opts: { dur: number; from: number; to: number; vol?: number; delay?: number; q?: number }) {
    if (!this.live()) return
    const ctx = this.ctx!, start = this.t + (opts.delay ?? 0)
    const frames = Math.max(1, Math.floor(ctx.sampleRate * opts.dur))
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource(); src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = opts.q ?? 1.4
    filter.frequency.setValueAtTime(opts.from, start)
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), start + opts.dur)
    const gain = ctx.createGain()
    const peak = opts.vol ?? 0.16
    gain.gain.setValueAtTime(peak, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.dur)
    src.connect(filter); filter.connect(gain); gain.connect(this.master!)
    src.start(start); src.stop(start + opts.dur + 0.02)
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect() }
  }

  /**
   * A whisper of the bite's own texture — short filtered noise at a fraction
   * of its volume. Layered under a tone, it's what keeps a UI tap from
   * sounding like a bare synth beep next to the real chew samples.
   */
  private grain(opts: { vol?: number; delay?: number; from?: number; to?: number } = {}) {
    this.noise({ dur: 0.032, from: opts.from ?? 2100, to: opts.to ?? 850, vol: opts.vol ?? 0.045, delay: opts.delay ?? 0, q: 1.2 })
  }

  /** The pink kit's texture: a very short, very high shimmer instead of a crunchy grain. */
  private sparkle(opts: { vol?: number; delay?: number } = {}) {
    this.noise({ dur: 0.022, from: 5200, to: 6800, vol: opts.vol ?? 0.03, delay: opts.delay ?? 0, q: 2.4 })
  }

  // --- the kit ------------------------------------------------------------
  // Every sound below pairs a round triangle tone with a touch of grain, the
  // same two ingredients the bite is built from — one shared material, not a
  // clean synth kit bolted onto a real recording. The pink theme swaps that
  // pairing for sine bells and sparkle, its own equally-consistent material.

  /** Generic UI press. */
  tap() {
    if (this.cute) { this.tone({ from: 1100, to: 1420, dur: 0.06, type: 'sine', vol: 0.10 }); this.sparkle({ vol: 0.02 }); return }
    this.tone({ from: 620, to: 860, dur: 0.07, vol: 0.10 }); this.grain({ vol: 0.03 })
  }

  /** Mode / option change — a step up the scale. */
  select() {
    if (this.cute) {
      this.tone({ from: 1050, dur: 0.05, type: 'sine', vol: 0.09 })
      this.tone({ from: 1560, dur: 0.06, type: 'sine', vol: 0.08, delay: 0.05 })
      return
    }
    this.tone({ from: 520, to: 760, dur: 0.08, vol: 0.11 }); this.grain({ vol: 0.035 })
  }

  /**
   * The bite. A random real chew if the samples have loaded, a synthesized
   * two-burst crunch if they haven't yet — either way, a short body
   * underneath: low and round for yellow, a bright little "nom" for pink.
   */
  crunch() {
    if (!this.playChew()) {
      this.noise({ dur: 0.055, from: 2600, to: 700, vol: 0.15, q: 1.1 })
      this.noise({ dur: 0.07, from: 1500, to: 380, vol: 0.11, q: 1.6, delay: 0.045 })
    }
    if (this.cute) {
      this.tone({ from: 1500, to: 1900, dur: 0.06, type: 'sine', vol: 0.08, delay: 0.03 })
      this.sparkle({ vol: 0.035, delay: 0.05 })
      return
    }
    this.tone({ from: 300, to: 150, dur: 0.10, vol: 0.13, glideCurve: 'lin' })
    this.tone({ from: 1100, to: 1500, dur: 0.05, vol: 0.05, delay: 0.02 })
  }

  /** Run starts. */
  start() {
    if (this.cute) {
      const notes = [784, 988, 1245, 1568]
      notes.forEach((f, i) => this.tone({ from: f, dur: 0.09, type: 'sine', vol: 0.11, delay: i * 0.05 }))
      this.sparkle({ vol: 0.025, delay: 0.02 })
      return
    }
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.10, vol: 0.12, delay: i * 0.06 }))
    this.grain({ vol: 0.03, delay: 0.02 })
  }

  /** A campaign level's target is reached. */
  clear() {
    if (this.cute) {
      const notes = [784, 988, 1245, 1568, 1976]
      notes.forEach((f, i) => this.tone({ from: f, dur: 0.15, type: 'sine', vol: 0.13, delay: i * 0.065 }))
      this.sparkle({ vol: 0.05, delay: 0.35 }); this.sparkle({ vol: 0.04, delay: 0.43 })
      return
    }
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.17, vol: 0.14, delay: i * 0.078 }))
    this.tone({ from: 1047, dur: 0.42, vol: 0.10, delay: 0.42 })
    this.grain({ vol: 0.05, delay: 0.42 })
  }

  /** The snake hit a wall, itself, or the edge. Game over. */
  crash() {
    if (this.cute) {
      const notes = [660, 587, 523, 440]
      notes.forEach((f, i) => this.tone({ from: f, dur: 0.19, type: 'sine', vol: 0.10, delay: i * 0.095 }))
      return
    }
    this.noise({ dur: 0.09, from: 1400, to: 200, vol: 0.14, q: 0.9 })
    const notes = [440, 392, 330, 247]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.21, vol: 0.12, delay: i * 0.105 }))
    this.tone({ from: 180, to: 90, dur: 0.5, vol: 0.10, delay: 0.44, glideCurve: 'lin' })
    this.grain({ from: 900, to: 250, vol: 0.05, delay: 0.44 })
  }

  /** Powerup: SLOW-MO armed — the world downshifts. */
  slowmo() {
    if (this.cute) {
      this.tone({ from: 1800, to: 900, dur: 0.16, type: 'sine', vol: 0.09, glideCurve: 'exp' })
      this.sparkle({ vol: 0.03, delay: 0.05 })
      return
    }
    this.tone({ from: 900, to: 320, dur: 0.2, vol: 0.11, glideCurve: 'exp' })
    this.grain({ from: 1400, to: 400, vol: 0.04 })
  }

  /** Powerup: GHOST armed — the next crash is forgiven. */
  ghost() {
    if (this.cute) {
      this.tone({ from: 1400, to: 2000, dur: 0.10, type: 'sine', vol: 0.09 })
      this.sparkle({ vol: 0.04, delay: 0.06 })
      return
    }
    this.tone({ from: 500, to: 1300, dur: 0.14, vol: 0.11 })
    this.grain({ from: 3000, to: 1600, vol: 0.04 })
  }

  /** GHOST actually saved the run — a distinct little "whew." */
  ghostSave() {
    if (this.cute) {
      const notes = [1245, 1568, 1976]
      notes.forEach((f, i) => this.tone({ from: f, dur: 0.09, type: 'sine', vol: 0.11, delay: i * 0.05 }))
      this.sparkle({ vol: 0.05, delay: 0.1 })
      return
    }
    const notes = [660, 880, 1175]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.1, vol: 0.12, delay: i * 0.055 }))
    this.grain({ vol: 0.04 })
  }

  /** A campaign level was cleared for the first time. */
  levelUnlock() {
    if (this.cute) {
      const notes = [988, 1245, 1568, 1976]
      notes.forEach((f, i) => this.tone({ from: f, dur: 0.12, type: 'sine', vol: 0.12, delay: i * 0.06 }))
      this.sparkle({ vol: 0.05, delay: 0.12 }); this.sparkle({ vol: 0.04, delay: 0.22 })
      return
    }
    const notes = [659, 880, 1109]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.14, vol: 0.13, delay: i * 0.075 }))
    this.grain({ vol: 0.04, delay: 0.15 })
  }

  /** A new personal best in freeplay. */
  highScore() {
    if (this.cute) {
      const notes = [988, 1245, 1568, 1976, 2349]
      notes.forEach((f, i) => this.tone({ from: f, dur: 0.13, type: 'sine', vol: 0.13, delay: i * 0.06 }))
      this.sparkle({ vol: 0.06, delay: 0.3 }); this.sparkle({ vol: 0.05, delay: 0.4 })
      return
    }
    const notes = [659, 831, 988, 1245, 1568]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.15, vol: 0.14, delay: i * 0.065 }))
    this.grain({ vol: 0.05, delay: 0.3 })
  }
}

export const arcade = new ArcadeAudio()
