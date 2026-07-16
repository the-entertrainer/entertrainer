// All-procedural Web Audio for HangYourFriend — no samples, no assets.
// Everything is squeezed through a highpass/lowpass "gramophone band" so it
// sounds like it's playing off a 1930s optical track: wind + vinyl crackle
// ambience, ragtime plinks for hits, womp stings for misses, a trapdoor slam,
// rope creaks per swing, a sad-trumpet phrase on death and a ditty on escape.

type StopFn = () => void

export class HangAudio {
  private ac: AudioContext | null = null
  private out: GainNode | null = null
  private amb: StopFn[] = []
  muted = false

  // Create/resume the context. Call from a user gesture (click/keydown).
  unlock() {
    if (typeof window === 'undefined') return
    if (!this.ac) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      const ac = new AC()
      const g = ac.createGain()
      g.gain.value = this.muted ? 0 : 0.5
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 130
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600
      g.connect(hp); hp.connect(lp); lp.connect(ac.destination)
      this.ac = ac; this.out = g
    }
    if (this.ac.state === 'suspended') this.ac.resume().catch(() => {})
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.ac && this.out) {
      this.out.gain.cancelScheduledValues(this.ac.currentTime)
      this.out.gain.linearRampToValueAtTime(m ? 0 : 0.5, this.ac.currentTime + 0.15)
    }
  }

  private noise(len = 1): AudioBuffer | null {
    if (!this.ac) return null
    const b = this.ac.createBuffer(1, Math.max(1, Math.floor(this.ac.sampleRate * len)), this.ac.sampleRate)
    const d = b.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    return b
  }

  // One enveloped oscillator voice.
  private tone(o: {
    f: number; f2?: number; type?: OscillatorType; t?: number; dur: number
    a?: number; vol?: number; lpf?: number; vib?: { rate: number; depth: number }
  }) {
    if (!this.ac || !this.out) return
    const ac = this.ac
    const t0 = o.t ?? ac.currentTime
    const osc = ac.createOscillator(); osc.type = o.type ?? 'triangle'
    osc.frequency.setValueAtTime(Math.max(20, o.f), t0)
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + o.dur)
    const g = ac.createGain()
    const v = o.vol ?? 0.2, a = o.a ?? 0.008
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.linearRampToValueAtTime(v, t0 + a)
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + o.dur)
    let node: AudioNode = osc
    if (o.lpf) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lpf; osc.connect(f); node = f }
    node.connect(g); g.connect(this.out)
    if (o.vib) {
      const l = ac.createOscillator(); l.frequency.value = o.vib.rate
      const lg = ac.createGain(); lg.gain.value = o.vib.depth
      l.connect(lg); lg.connect(osc.frequency)
      l.start(t0); l.stop(t0 + o.dur + 0.1)
    }
    osc.start(t0); osc.stop(t0 + o.dur + 0.15)
  }

  private noiseBurst(o: { dur: number; vol: number; bpf?: number; q?: number; lpf?: number; t?: number }) {
    if (!this.ac || !this.out) return
    const ac = this.ac, t0 = o.t ?? ac.currentTime
    const buf = this.noise(o.dur + 0.05); if (!buf) return
    const src = ac.createBufferSource(); src.buffer = buf
    let node: AudioNode = src
    if (o.bpf) { const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.bpf; f.Q.value = o.q ?? 6; node.connect(f); node = f }
    if (o.lpf) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lpf; node.connect(f); node = f }
    const g = ac.createGain()
    g.gain.setValueAtTime(o.vol, t0)
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + o.dur)
    node.connect(g); g.connect(this.out)
    src.start(t0); src.stop(t0 + o.dur + 0.05)
  }

  private thump(f0: number, f1: number, dur: number, vol: number, t?: number) {
    this.tone({ f: f0, f2: f1, type: 'sine', dur, vol, t })
  }

  // ── Game cues ──────────────────────────────────────────────────────────────

  // Correct letter: ascending ragtime-xylophone plink (index picks the note).
  right(i: number) {
    if (!this.ac) return
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]
    const f = scale[Math.max(0, i) % scale.length]
    this.tone({ f, dur: 0.16, vol: 0.15 })
    this.tone({ f: f * 2, dur: 0.1, vol: 0.045, t: this.ac.currentTime + 0.06 })
  }

  // Wrong letter: a low womp + a sour minor-second pair, escalating with n.
  wrong(n: number) {
    if (!this.ac) return
    const t = this.ac.currentTime
    this.thump(150 + n * 8, 55, 0.28, 0.2 + n * 0.03, t)
    this.tone({ f: 220 * Math.pow(1.059, n), type: 'square', dur: 0.15, vol: 0.045, lpf: 900, t })
    this.tone({ f: 233 * Math.pow(1.059, n), type: 'square', dur: 0.15, vol: 0.045, lpf: 900, t: t + 0.02 })
  }

  // The trapdoor bangs open.
  trapdoor() {
    this.noiseBurst({ dur: 0.28, vol: 0.5, lpf: 240 })
    this.thump(120, 34, 0.42, 0.5)
    this.tone({ f: 52, type: 'sawtooth', dur: 0.2, vol: 0.16, lpf: 300 })
  }

  // The rope snaps taut.
  snap(vol = 1) {
    this.noiseBurst({ dur: 0.07, vol: 0.3 * vol, bpf: 750, q: 8 })
    this.tone({ f: 320, f2: 150, type: 'square', dur: 0.12, vol: 0.1 * vol, lpf: 1200 })
  }

  // A wooden creak — fired once per swing apex, intensity from swing speed.
  creak(i: number) {
    if (!this.ac) return
    const f = 60 + Math.random() * 45
    this.tone({ f, f2: f * 1.5, type: 'sawtooth', dur: 0.35, vol: 0.015 + 0.05 * i, lpf: 480, a: 0.09 })
    this.tone({ f: f * 1.98, f2: f * 2.6, type: 'sawtooth', dur: 0.3, vol: 0.008 + 0.02 * i, lpf: 700, a: 0.08 })
  }

  // Wah-wah-wah-waaah: the classic sad trumpet, on going limp.
  sadSting() {
    if (!this.ac) return
    const t0 = this.ac.currentTime + 0.2
    const notes = [233.08, 220, 207.65, 196]
    notes.forEach((f, i) => {
      const last = i === notes.length - 1
      this.tone({
        f, f2: f * 0.94, type: 'sawtooth', dur: last ? 1.3 : 0.34,
        vol: 0.1, lpf: 1300, a: 0.035, t: t0 + i * 0.38,
        vib: last ? { rate: 6.2, depth: 9 } : undefined
      })
    })
  }

  // A quick ragtime ditty for the escape.
  win() {
    if (!this.ac) return
    const t0 = this.ac.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone({ f, dur: 0.14, vol: 0.13, t: t0 + i * 0.11 }))
    ;[523.25, 659.25, 783.99].forEach(f => this.tone({ f, dur: 0.6, vol: 0.06, t: t0 + 0.52 }))
  }

  // ── Ambience: wind through a lowpass + looped vinyl crackle ────────────────
  startAmbience() {
    if (!this.ac || !this.out || this.amb.length) return
    const ac = this.ac
    const wb = this.noise(3); if (!wb) return
    const wind = ac.createBufferSource(); wind.buffer = wb; wind.loop = true
    const wf = ac.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 320; wf.Q.value = 0.8
    const wg = ac.createGain(); wg.gain.value = 0.05
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.09
    const lg = ac.createGain(); lg.gain.value = 160
    lfo.connect(lg); lg.connect(wf.frequency)
    const lfo2 = ac.createOscillator(); lfo2.frequency.value = 0.13
    const lg2 = ac.createGain(); lg2.gain.value = 0.02
    lfo2.connect(lg2); lg2.connect(wg.gain)
    wind.connect(wf); wf.connect(wg); wg.connect(this.out)
    wind.start(); lfo.start(); lfo2.start()

    // Sparse impulses in a 2s loop read as needle crackle.
    const cb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate)
    const cd = cb.getChannelData(0)
    for (let i = 0; i < 46; i++) {
      const p = Math.floor(Math.random() * (cd.length - 10))
      const amp = Math.random() * 0.6
      for (let j = 0; j < 8; j++) cd[p + j] = (Math.random() * 2 - 1) * amp * (1 - j / 8)
    }
    const cr = ac.createBufferSource(); cr.buffer = cb; cr.loop = true
    const chp = ac.createBiquadFilter(); chp.type = 'highpass'; chp.frequency.value = 1800
    const cg = ac.createGain(); cg.gain.value = 0.22
    cr.connect(chp); chp.connect(cg); cg.connect(this.out)
    cr.start()

    this.amb = [() => { try { wind.stop(); lfo.stop(); lfo2.stop(); cr.stop() } catch { /* already stopped */ } }]
  }

  stopAmbience() { this.amb.forEach(s => s()); this.amb = [] }

  dispose() {
    this.stopAmbience()
    this.ac?.close().catch(() => {})
    this.ac = null; this.out = null
  }
}
