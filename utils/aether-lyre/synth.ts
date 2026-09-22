/**
 * Aether Lyre — dry organic Web Audio engine.
 * Fundamental sine + quiet 2nd/3rd partials + optional narrow bridge buzz.
 * No lush reverb, no pads. Zero-click gain ramps throughout.
 */

export type LevelSample = {
  hz: number
  ratioLabel: string
  amp: number
}

type Voice = {
  id: string
  hz: number
  ratioLabel: string
  oscillators: OscillatorNode[]
  noise?: AudioBufferSourceNode
  gains: GainNode[]
  voiceGain: GainNode
  targetGain: number
  kind: 'drone' | 'seq' | 'layer'
}

export type LyreEngine = {
  resume: () => Promise<void>
  stopAll: () => void
  setMaster: (vol: number) => void
  playDrone: (hz: number, ratioLabel?: string) => void
  setDroneHarmonics: (mults: number[]) => void
  startSequence: (notesHz: number[], noteSec: number, labels?: string[]) => void
  stopSequence: () => void
  setLayer: (id: string, hz: number, gain: number, ratioLabel?: string) => void
  fadeLayer: (id: string, gain: number, sec: number) => void
  clearLayers: () => void
  fadeOut: (sec: number) => void
  getLevels: () => LevelSample[]
  getMasterAmp: () => number
  isPlaying: () => boolean
  dispose: () => void
}

function createNoiseBuffer(ctx: AudioContext, seconds = 0.35): AudioBuffer {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.55
  return buf
}

export function createLyreEngine(): LyreEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let compressor: DynamicsCompressorNode | null = null
  let analyser: AnalyserNode | null = null
  let masterVol = 0.7
  let droneHarmonics = [1, 2, 3]
  let disposed = false

  const voices = new Map<string, Voice>()
  let seqTimer: number | null = null
  let seqIndex = 0
  let seqNotes: number[] = []
  let seqLabels: string[] = []
  let seqNoteSec = 2.4
  let seqActiveId: string | null = null
  let noiseBuf: AudioBuffer | null = null

  const timeData = new Float32Array(2048)

  function ensureGraph(): AudioContext {
    if (disposed) throw new Error('LyreEngine disposed')
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = Math.min(0.85, masterVol)

      compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -18
      compressor.knee.value = 18
      compressor.ratio.value = 2.2
      compressor.attack.value = 0.02
      compressor.release.value = 0.22

      analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.82

      master.connect(compressor)
      compressor.connect(analyser)
      analyser.connect(ctx.destination)
      noiseBuf = createNoiseBuffer(ctx)
    }
    return ctx
  }

  function now(): number {
    return ensureGraph().currentTime
  }

  function softRamp(g: AudioParam, value: number, sec: number, t0?: number) {
    const t = t0 ?? now()
    const v = Math.max(0.00008, value)
    try {
      g.cancelScheduledValues(t)
      g.setValueAtTime(Math.max(0.00008, g.value || 0.00008), t)
      if (sec <= 0.001) {
        g.setValueAtTime(v, t)
      } else {
        g.setTargetAtTime(v, t, Math.max(0.015, sec / 4))
      }
    } catch {
      g.value = value
    }
  }

  function buildVoice(
    id: string,
    hz: number,
    gain: number,
    kind: Voice['kind'],
    ratioLabel: string,
    mults: number[] = droneHarmonics,
  ): Voice {
    const c = ensureGraph()
    const t = c.currentTime
    const voiceGain = c.createGain()
    voiceGain.gain.value = 0.00008
    voiceGain.connect(master!)

    const oscillators: OscillatorNode[] = []
    const gains: GainNode[] = []

    // Dry partial mix: fund dominant, quiet 2nd/3rd
    const weights = [1, 0.22, 0.1]
    mults.slice(0, 3).forEach((m, i) => {
      const o = c.createOscillator()
      o.type = 'sine'
      o.frequency.setValueAtTime(hz * m, t)
      const g = c.createGain()
      g.gain.value = (weights[i] ?? 0.06) * (i === 0 ? 1 : 1)
      o.connect(g)
      g.connect(voiceGain)
      o.start(t)
      oscillators.push(o)
      gains.push(g)
    })

    // Very quiet narrow bandpass noise — bridge buzz
    let noise: AudioBufferSourceNode | undefined
    if (noiseBuf) {
      const src = c.createBufferSource()
      src.buffer = noiseBuf
      src.loop = true
      const bp = c.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = Math.min(4200, hz * 4.5)
      bp.Q.value = 14
      const ng = c.createGain()
      ng.gain.value = 0.018
      src.connect(bp)
      bp.connect(ng)
      ng.connect(voiceGain)
      src.start(t)
      noise = src
      gains.push(ng)
    }

    softRamp(voiceGain.gain, Math.max(0, Math.min(1, gain)), 0.12, t)

    const voice: Voice = {
      id,
      hz,
      ratioLabel,
      oscillators,
      noise,
      gains,
      voiceGain,
      targetGain: gain,
      kind,
    }
    voices.set(id, voice)
    return voice
  }

  function killVoice(id: string, fadeSec = 0.18) {
    const v = voices.get(id)
    if (!v || !ctx) return
    const t = ctx.currentTime
    softRamp(v.voiceGain.gain, 0.00008, fadeSec, t)
    const stopAt = t + fadeSec + 0.08
    window.setTimeout(() => {
      try {
        v.oscillators.forEach((o) => {
          try { o.stop() } catch { /* */ }
          try { o.disconnect() } catch { /* */ }
        })
        if (v.noise) {
          try { v.noise.stop() } catch { /* */ }
          try { v.noise.disconnect() } catch { /* */ }
        }
        v.gains.forEach((g) => { try { g.disconnect() } catch { /* */ } })
        try { v.voiceGain.disconnect() } catch { /* */ }
      } catch { /* */ }
      if (voices.get(id) === v) voices.delete(id)
    }, Math.ceil((fadeSec + 0.1) * 1000))
  }

  function clearSeqTimer() {
    if (seqTimer != null) {
      window.clearTimeout(seqTimer)
      seqTimer = null
    }
  }

  function scheduleNextSeqNote() {
    if (!seqNotes.length) return
    const hz = seqNotes[seqIndex % seqNotes.length]
    const label = seqLabels[seqIndex % seqNotes.length] || `${hz.toFixed(1)}`
    const id = `seq-${seqIndex}`
    if (seqActiveId) killVoice(seqActiveId, seqNoteSec * 0.45)
    const v = buildVoice(id, hz, 0.42, 'seq', label, [1, 2, 3])
    // Crossfade: hold then begin fade before next
    softRamp(v.voiceGain.gain, 0.42, 0.2)
    window.setTimeout(() => {
      if (voices.get(id) === v) softRamp(v.voiceGain.gain, 0.00008, seqNoteSec * 0.5)
    }, Math.max(40, (seqNoteSec * 0.55) * 1000))
    seqActiveId = id
    seqIndex += 1
    seqTimer = window.setTimeout(scheduleNextSeqNote, seqNoteSec * 1000)
  }

  return {
    async resume() {
      const c = ensureGraph()
      if (c.state === 'suspended') await c.resume()
    },

    stopAll() {
      clearSeqTimer()
      seqActiveId = null
      seqNotes = []
      ;[...voices.keys()].forEach((id) => killVoice(id, 0.15))
    },

    setMaster(vol: number) {
      masterVol = Math.max(0, Math.min(1, vol))
      if (master) softRamp(master.gain, Math.min(0.85, masterVol), 0.08)
    },

    playDrone(hz: number, ratioLabel = '1/1') {
      // Replace existing drones
      ;[...voices.values()].filter((v) => v.kind === 'drone').forEach((v) => killVoice(v.id, 0.22))
      buildVoice('drone', hz, 0.5, 'drone', ratioLabel, droneHarmonics)
    },

    setDroneHarmonics(mults: number[]) {
      droneHarmonics = mults.length ? mults.slice(0, 4) : [1, 2, 3]
      const drone = voices.get('drone')
      if (drone) {
        const { hz, ratioLabel, targetGain } = drone
        killVoice('drone', 0.12)
        window.setTimeout(() => {
          if (!disposed) buildVoice('drone', hz, targetGain || 0.5, 'drone', ratioLabel, droneHarmonics)
        }, 130)
      }
    },

    startSequence(notesHz: number[], noteSec: number, labels?: string[]) {
      clearSeqTimer()
      ;[...voices.values()].filter((v) => v.kind === 'seq').forEach((v) => killVoice(v.id, 0.12))
      seqNotes = notesHz.slice()
      seqLabels = labels ? labels.slice() : notesHz.map((h) => h.toFixed(1))
      seqNoteSec = Math.max(0.8, noteSec)
      seqIndex = 0
      seqActiveId = null
      if (!seqNotes.length) return
      scheduleNextSeqNote()
    },

    stopSequence() {
      clearSeqTimer()
      if (seqActiveId) killVoice(seqActiveId, 0.25)
      seqActiveId = null
      seqNotes = []
      ;[...voices.values()].filter((v) => v.kind === 'seq').forEach((v) => killVoice(v.id, 0.2))
    },

    setLayer(id: string, hz: number, gain: number, ratioLabel = id) {
      const existing = voices.get(`layer-${id}`)
      if (existing) {
        existing.hz = hz
        existing.ratioLabel = ratioLabel
        existing.targetGain = gain
        existing.oscillators.forEach((o, i) => {
          const m = droneHarmonics[i] ?? (i + 1)
          try { o.frequency.setTargetAtTime(hz * m, now(), 0.04) } catch { /* */ }
        })
        softRamp(existing.voiceGain.gain, Math.max(0, Math.min(1, gain)), 0.15)
        return
      }
      if (gain <= 0.001) return
      buildVoice(`layer-${id}`, hz, gain, 'layer', ratioLabel, [1, 2, 3])
    },

    fadeLayer(id: string, gain: number, sec: number) {
      const v = voices.get(`layer-${id}`)
      if (!v) {
        if (gain > 0.001) this.setLayer(id, 60, gain)
        return
      }
      v.targetGain = gain
      softRamp(v.voiceGain.gain, Math.max(0, Math.min(1, gain)), sec)
      if (gain <= 0.001) {
        window.setTimeout(() => killVoice(`layer-${id}`, 0.05), sec * 1000 + 40)
      }
    },

    clearLayers() {
      ;[...voices.values()].filter((v) => v.kind === 'layer').forEach((v) => killVoice(v.id, 0.2))
    },

    fadeOut(sec: number) {
      clearSeqTimer()
      const t = sec > 0 ? sec : 0.4
      ;[...voices.values()].forEach((v) => {
        softRamp(v.voiceGain.gain, 0.00008, t)
        window.setTimeout(() => killVoice(v.id, 0.05), t * 1000 + 30)
      })
      if (master) softRamp(master.gain, 0.00008, t)
      window.setTimeout(() => {
        if (master && !disposed) softRamp(master.gain, Math.min(0.85, masterVol), 0.05)
      }, t * 1000 + 80)
    },

    getLevels(): LevelSample[] {
      const out: LevelSample[] = []
      voices.forEach((v) => {
        const amp = Math.min(1, Math.max(0, v.voiceGain.gain.value))
        if (amp > 0.002) out.push({ hz: v.hz, ratioLabel: v.ratioLabel, amp })
      })
      return out
    },

    getMasterAmp(): number {
      if (!analyser) return 0
      analyser.getFloatTimeDomainData(timeData)
      let sum = 0
      for (let i = 0; i < timeData.length; i++) sum += timeData[i] * timeData[i]
      return Math.min(1, Math.sqrt(sum / timeData.length) * 4.2)
    },

    isPlaying() {
      return voices.size > 0 || seqTimer != null
    },

    dispose() {
      disposed = true
      clearSeqTimer()
      ;[...voices.keys()].forEach((id) => {
        const v = voices.get(id)
        if (!v) return
        try {
          v.oscillators.forEach((o) => { try { o.stop() } catch { /* */ } })
          if (v.noise) try { v.noise.stop() } catch { /* */ }
        } catch { /* */ }
      })
      voices.clear()
      try { ctx?.close() } catch { /* */ }
      ctx = null
      master = null
      compressor = null
      analyser = null
    },
  }
}
