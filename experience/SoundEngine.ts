// Algorithmic reverb via noise impulse response
function makeReverb(ctx: AudioContext): ConvolverNode {
  const dur = 2.2, decay = 3.5
  const len = Math.floor(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  const node = ctx.createConvolver()
  node.buffer = buf
  return node
}

function makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 3
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

// Am7 arpeggio — each card gets a note so hovering between them plays a chord
const CARD_NOTES = [220, 261.63, 329.63, 392]

export default class SoundEngine {
  private static _inst: SoundEngine | null = null

  static getInstance(): SoundEngine | null { return SoundEngine._inst }
  static init(): SoundEngine {
    if (!SoundEngine._inst) SoundEngine._inst = new SoundEngine()
    return SoundEngine._inst
  }

  readonly ctx: AudioContext
  private _master: GainNode
  private _dry: GainNode
  private _reverb: ConvolverNode
  private _rvbSend: GainNode

  private _scrollFilter: BiquadFilterNode
  private _scrollGain: GainNode

  private _hoverOsc: OscillatorNode | null = null
  private _hoverEnv: GainNode | null = null
  private _hoverPan: StereoPannerNode | null = null

  private _muted = true
  private _entryPlayed = false

  private constructor() {
    const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext
    const ctx = new AudioCtx() as AudioContext
    this.ctx = ctx

    // ── Master bus ──────────────────────────────────────
    this._master = ctx.createGain()
    this._master.gain.value = 0          // starts silent; user opts in via SoundButton
    this._master.connect(ctx.destination)

    this._dry = ctx.createGain()
    this._dry.connect(this._master)

    this._reverb = makeReverb(ctx)
    this._rvbSend = ctx.createGain()
    this._rvbSend.gain.value = 0.38
    this._reverb.connect(this._rvbSend)
    this._rvbSend.connect(this._master)

    // ── Ambient drone ───────────────────────────────────
    // Two very slightly detuned sines beat slowly against each other
    const droneFilter = ctx.createBiquadFilter()
    droneFilter.type = 'lowpass'
    droneFilter.frequency.value = 700
    droneFilter.Q.value = 0.7

    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.038
    droneFilter.connect(droneGain)
    droneGain.connect(this._dry)
    droneGain.connect(this._reverb)

    const sines: [number, number][] = [[55.0, 0.45], [55.35, 0.45], [110.0, 0.18]]
    sines.forEach(([freq, vol]) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq
      g.gain.value = vol
      o.connect(g); g.connect(droneFilter)
      o.start()
    })

    // LFO breathes the filter open and shut (14-second cycle)
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.type = 'sine'; lfo.frequency.value = 1 / 14
    lfoGain.gain.value = 220
    lfo.connect(lfoGain)
    lfoGain.connect(droneFilter.frequency)
    lfo.start()

    // ── Scroll wind ─────────────────────────────────────
    const noise = ctx.createBufferSource()
    noise.buffer = makeNoiseBuffer(ctx)
    noise.loop = true

    this._scrollFilter = ctx.createBiquadFilter()
    this._scrollFilter.type = 'bandpass'
    this._scrollFilter.frequency.value = 280
    this._scrollFilter.Q.value = 1.3

    this._scrollGain = ctx.createGain()
    this._scrollGain.gain.value = 0

    noise.connect(this._scrollFilter)
    this._scrollFilter.connect(this._scrollGain)
    this._scrollGain.connect(this._dry)
    noise.start()
  }

  // ── Public API ──────────────────────────────────────────

  resume() {
    if (this.ctx.state === 'suspended') this.ctx.resume()
  }

  // Called every frame by Controls.ts
  updateScroll(speed: number) {
    const t = this.ctx.currentTime
    const abs = Math.abs(speed)
    this._scrollGain.gain.linearRampToValueAtTime(Math.min(abs * 0.45, 0.2), t + 0.08)
    this._scrollFilter.frequency.linearRampToValueAtTime(220 + abs * 70, t + 0.08)
  }

  // Called by Raycaster when hover changes; ha = card's horizontal angle in radians
  onHoverChange(cardIndex: number | null, ha: number | null) {
    this._killHover()
    if (cardIndex === null || ha === null) return

    const ctx = this.ctx
    const freq = CARD_NOTES[((cardIndex % 4) + 4) % 4]

    const osc  = ctx.createOscillator()
    const env  = ctx.createGain()
    const pan  = ctx.createStereoPanner()

    osc.type = 'sine'
    osc.frequency.value = freq

    env.gain.setValueAtTime(0, ctx.currentTime)
    env.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.14)

    pan.pan.value = Math.max(-0.85, Math.min(0.85, Math.cos(ha) * 0.75))

    osc.connect(env); env.connect(pan)
    pan.connect(this._dry); pan.connect(this._reverb)
    osc.start()

    this._hoverOsc = osc; this._hoverEnv = env; this._hoverPan = pan
  }

  private _killHover() {
    if (!this._hoverEnv || !this._hoverOsc) return
    const t = this.ctx.currentTime
    this._hoverEnv.gain.linearRampToValueAtTime(0, t + 0.2)
    const [osc, pan] = [this._hoverOsc, this._hoverPan]
    setTimeout(() => { try { osc.stop(); osc.disconnect(); pan?.disconnect() } catch {} }, 280)
    this._hoverOsc = null; this._hoverEnv = null; this._hoverPan = null
  }

  // Called by Raycaster on card click
  onCardClick(ha: number) {
    const ctx = this.ctx; const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    const pan = ctx.createStereoPanner()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(240, t)
    osc.frequency.exponentialRampToValueAtTime(58, t + 0.38)

    env.gain.setValueAtTime(0.24, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.48)

    pan.pan.value = Math.max(-0.85, Math.min(0.85, Math.cos(ha) * 0.55))

    osc.connect(env); env.connect(pan)
    pan.connect(this._dry); pan.connect(this._reverb)
    osc.start(t); osc.stop(t + 0.55)
  }

  // Called by Menu.vue
  onMenuChange(open: boolean) {
    const ctx = this.ctx; const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const env = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(open ? 160 : 420, t)
    osc.frequency.linearRampToValueAtTime(open ? 420 : 160, t + (open ? 0.28 : 0.22))

    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.09, t + 0.04)
    env.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.32 : 0.26))

    osc.connect(env); env.connect(this._dry); env.connect(this._reverb)
    osc.start(t); osc.stop(t + 0.38)
  }

  // Called by ThemeCircle.vue — minor = dark, major = light
  onThemeChange(isDark: boolean) {
    const ctx = this.ctx; const t = ctx.currentTime
    const freqs = isDark ? [440, 523.25] : [523.25, 659.25]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      const delay = i * 0.1
      osc.type = 'sine'; osc.frequency.value = freq
      env.gain.setValueAtTime(0, t + delay)
      env.gain.linearRampToValueAtTime(0.08, t + delay + 0.03)
      env.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.9)
      osc.connect(env); env.connect(this._dry); env.connect(this._reverb)
      osc.start(t + delay); osc.stop(t + delay + 1.1)
    })
  }

  // Called once when user enters the experience
  playEnter() {
    const ctx = this.ctx; const t = ctx.currentTime
    ;[220, 261.63, 329.63, 392].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      const delay = i * 0.07
      osc.type = 'sine'; osc.frequency.value = freq
      env.gain.setValueAtTime(0, t + delay)
      env.gain.linearRampToValueAtTime(0.055, t + delay + 0.12)
      env.gain.linearRampToValueAtTime(0.02, t + delay + 2.0)
      env.gain.exponentialRampToValueAtTime(0.001, t + delay + 4.0)
      osc.connect(env); env.connect(this._dry); env.connect(this._reverb)
      osc.start(t + delay); osc.stop(t + delay + 4.5)
    })
  }

  setMuted(v: boolean) {
    this._muted = v
    const t = this.ctx.currentTime
    this._master.gain.linearRampToValueAtTime(v ? 0 : 0.82, t + 0.3)
    if (!v) {
      this.resume()
      if (!this._entryPlayed) {
        this._entryPlayed = true
        this.playEnter()
      }
    }
  }

  get muted() { return this._muted }

  destroy() {
    try { this.ctx.close() } catch {}
    SoundEngine._inst = null
  }
}
