/**
 * Aether Lyre — sexagesimal Web Audio engine.
 *
 * Timbre: fundamental sine + quiet partials drawn ONLY from positive
 * divisors of 60 (1,2,3,4,5,6,…). Optional tiny dry bridge buzz is
 * unpitched noise, never a pitch source.
 *
 * API matches pages/engage/aether-lyre.vue:
 *   resume, stopAll, setMaster, playDrone, setDroneHarmonics,
 *   startSequence, stopSequence, setLayer, fadeLayer, clearLayers,
 *   fadeOut, getLevels, getMasterAmp, isPlaying, dispose
 */

import { SEXAGESIMAL_PARTIALS, VOICE_PARTIALS } from './tunings'

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
  kind: 'drone' | 'seq' | 'layer' | 'pillar'
  partials: number[]
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

const ALLOWED = new Set(SEXAGESIMAL_PARTIALS)

/** Keep only positive divisors of 60; fall back to default voice stack. */
function sanitizePartials(mults: number[]): number[] {
  const clean = mults
    .map((m) => Math.round(Math.abs(m)))
    .filter((m) => m >= 1 && ALLOWED.has(m))
  const uniq = [...new Set(clean)]
  return uniq.length ? uniq.slice(0, 8) : [...VOICE_PARTIALS]
}

/** Quiet descending weights for sexagesimal partials (fund dominant). */
function partialWeight(mult: number, index: number): number {
  if (mult === 1) return 1
  const byMult: Record<number, number> = {
    2: 0.28,
    3: 0.16,
    4: 0.1,
    5: 0.07,
    6: 0.05,
    10: 0.03,
    12: 0.025,
    15: 0.02,
    20: 0.015,
    30: 0.01,
    60: 0.008,
  }
  return byMult[mult] ?? Math.max(0.01, 0.2 / (index + 1))
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
  /** Healthy audible master without clipping (~0.55–0.75 range). */
  let masterVol = 0.68
  let droneHarmonics = sanitizePartials([...VOICE_PARTIALS])
  let disposed = false

  const voices = new Map<string, Voice>()
  let seqTimer: number | null = null
  let seqIndex = 0
  let seqNotes: number[] = []
  let seqLabels: string[] = []
  let seqNoteSec = 2.4
  let seqActiveId: string | null = null
  let seqPrevId: string | null = null
  let noiseBuf: AudioBuffer | null = null
  let breathTimer: number | null = null
  let droneBaseGain = 0.52

  const timeData = new Float32Array(2048)

  function ensureGraph(): AudioContext {
    if (disposed) throw new Error('LyreEngine disposed')
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = Math.min(0.78, Math.max(0.55, masterVol))

      compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -16
      compressor.knee.value = 16
      compressor.ratio.value = 2.4
      compressor.attack.value = 0.015
      compressor.release.value = 0.2

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
        g.setTargetAtTime(v, t, Math.max(0.018, sec / 4))
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
    opts?: { buzz?: boolean },
  ): Voice {
    const c = ensureGraph()
    const t = c.currentTime
    const voiceGain = c.createGain()
    voiceGain.gain.value = 0.00008
    voiceGain.connect(master!)

    const oscillators: OscillatorNode[] = []
    const gains: GainNode[] = []
    const partials = sanitizePartials(mults)

    partials.forEach((m, i) => {
      const o = c.createOscillator()
      o.type = 'sine'
      o.frequency.setValueAtTime(hz * m, t)
      const g = c.createGain()
      g.gain.value = partialWeight(m, i)
      o.connect(g)
      g.connect(voiceGain)
      o.start(t)
      oscillators.push(o)
      gains.push(g)
    })

    // Tiny unpitched bridge buzz (not a pitch source)
    let noise: AudioBufferSourceNode | undefined
    if (opts?.buzz !== false && noiseBuf && kind !== 'pillar') {
      const src = c.createBufferSource()
      src.buffer = noiseBuf
      src.loop = true
      const bp = c.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = Math.min(3800, Math.max(180, hz * 3.8))
      bp.Q.value = 16
      const ng = c.createGain()
      ng.gain.value = kind === 'seq' ? 0.014 : 0.012
      src.connect(bp)
      bp.connect(ng)
      ng.connect(voiceGain)
      src.start(t)
      noise = src
      gains.push(ng)
    }

    softRamp(voiceGain.gain, Math.max(0, Math.min(1, gain)), 0.14, t)

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
      partials,
    }
    voices.set(id, voice)
    return voice
  }

  function killVoice(id: string, fadeSec = 0.18) {
    const v = voices.get(id)
    if (!v || !ctx) return
    const t = ctx.currentTime
    softRamp(v.voiceGain.gain, 0.00008, fadeSec, t)
    const stopAt = fadeSec + 0.1
    window.setTimeout(() => {
      try {
        v.oscillators.forEach((o) => {
          try {
            o.stop()
          } catch {
            /* */
          }
          try {
            o.disconnect()
          } catch {
            /* */
          }
        })
        if (v.noise) {
          try {
            v.noise.stop()
          } catch {
            /* */
          }
          try {
            v.noise.disconnect()
          } catch {
            /* */
          }
        }
        v.gains.forEach((g) => {
          try {
            g.disconnect()
          } catch {
            /* */
          }
        })
        try {
          v.voiceGain.disconnect()
        } catch {
          /* */
        }
      } catch {
        /* */
      }
      if (voices.get(id) === v) voices.delete(id)
    }, Math.ceil(stopAt * 1000))
  }

  function clearSeqTimer() {
    if (seqTimer != null) {
      window.clearTimeout(seqTimer)
      seqTimer = null
    }
  }

  function clearBreath() {
    if (breathTimer != null) {
      window.clearTimeout(breathTimer)
      breathTimer = null
    }
  }

  /** Very subtle slow amplitude breath on the drone pillar stack. */
  function scheduleBreath() {
    clearBreath()
    const drone = voices.get('drone')
    if (!drone || disposed) return
    const high = droneBaseGain
    const low = droneBaseGain * 0.86
    softRamp(drone.voiceGain.gain, low, 3.4)
    ;['pillar-5th', 'pillar-4th'].forEach((id) => {
      const p = voices.get(id)
      if (p) softRamp(p.voiceGain.gain, p.targetGain * 0.88, 3.4)
    })
    breathTimer = window.setTimeout(() => {
      const d = voices.get('drone')
      if (!d || disposed) return
      softRamp(d.voiceGain.gain, high, 3.6)
      ;['pillar-5th', 'pillar-4th'].forEach((id) => {
        const p = voices.get(id)
        if (p) softRamp(p.voiceGain.gain, p.targetGain, 3.6)
      })
      breathTimer = window.setTimeout(scheduleBreath, 3800)
    }, 3600)
  }

  function killKind(kind: Voice['kind'], fade = 0.2) {
    ;[...voices.values()]
      .filter((v) => v.kind === kind)
      .forEach((v) => killVoice(v.id, fade))
  }

  /**
   * Note duration varies slightly within 1.8–3.2s for living sequence feel,
   * still deterministic from index.
   */
  function noteDurationFor(index: number, base: number): number {
    const span = 3.2 - 1.8
    const wobble = ((index * 5) % 7) / 7
    const d = Math.min(3.2, Math.max(1.8, base * 0.85 + wobble * span * 0.55))
    return d
  }

  function scheduleNextSeqNote() {
    if (!seqNotes.length || disposed) return
    const hz = seqNotes[seqIndex % seqNotes.length]
    const label = seqLabels[seqIndex % seqNotes.length] || `${hz.toFixed(1)}`
    const id = `seq-${seqIndex}`
    const dur = noteDurationFor(seqIndex, seqNoteSec)

    // Crossfade: keep previous voice overlapping ~45% of note length
    if (seqPrevId && seqPrevId !== seqActiveId) {
      killVoice(seqPrevId, dur * 0.35)
    }
    if (seqActiveId) {
      const prev = voices.get(seqActiveId)
      if (prev) softRamp(prev.voiceGain.gain, 0.00008, dur * 0.5)
      seqPrevId = seqActiveId
      window.setTimeout(() => {
        if (seqPrevId) killVoice(seqPrevId, 0.05)
      }, Math.ceil(dur * 0.55 * 1000))
    }

    const v = buildVoice(id, hz, 0.48, 'seq', label, [1, 2, 3, 4, 5])
    softRamp(v.voiceGain.gain, 0.48, 0.22)
    window.setTimeout(() => {
      if (voices.get(id) === v) softRamp(v.voiceGain.gain, 0.00008, dur * 0.48)
    }, Math.max(50, dur * 0.52 * 1000))

    seqActiveId = id
    seqIndex += 1
    seqTimer = window.setTimeout(scheduleNextSeqNote, dur * 1000)
  }

  return {
    async resume() {
      const c = ensureGraph()
      if (c.state === 'suspended') await c.resume()
    },

    stopAll() {
      clearSeqTimer()
      clearBreath()
      seqActiveId = null
      seqPrevId = null
      seqNotes = []
      ;[...voices.keys()].forEach((id) => killVoice(id, 0.15))
    },

    setMaster(vol: number) {
      masterVol = Math.max(0, Math.min(1, vol))
      // Map UI 0–1 into a healthy audible band without hard clip
      const mapped = 0.55 + masterVol * 0.23
      if (master) softRamp(master.gain, Math.min(0.78, mapped), 0.08)
    },

    /**
     * Drone = tonic + locked harmonic pillars at 3/2 and 4/3
     * (length-column fifth and fourth), with slow amplitude breath.
     */
    playDrone(hz: number, ratioLabel = 'L60 · 1/1') {
      clearBreath()
      killKind('drone', 0.2)
      killKind('pillar', 0.2)

      droneBaseGain = 0.52
      buildVoice('drone', hz, droneBaseGain, 'drone', ratioLabel, droneHarmonics)

      // Pillars: audible but quieter than tonic
      buildVoice(
        'pillar-5th',
        hz * (3 / 2),
        0.3,
        'pillar',
        'L40 · 3/2',
        [1, 2, 3, 4],
        { buzz: false },
      )
      buildVoice(
        'pillar-4th',
        hz * (4 / 3),
        0.24,
        'pillar',
        'L45 · 4/3',
        [1, 2, 3],
        { buzz: false },
      )

      scheduleBreath()
    },

    setDroneHarmonics(mults: number[]) {
      droneHarmonics = sanitizePartials(mults)
      const drone = voices.get('drone')
      if (drone) {
        const { hz, ratioLabel } = drone
        // Rebuild full drone + pillars at current tonic
        this.playDrone(hz, ratioLabel)
      }
    },

    startSequence(notesHz: number[], noteSec: number, labels?: string[]) {
      clearSeqTimer()
      killKind('seq', 0.12)
      seqNotes = notesHz.slice()
      seqLabels = labels ? labels.slice() : notesHz.map((h) => h.toFixed(1))
      seqNoteSec = Math.min(3.2, Math.max(1.8, noteSec))
      seqIndex = 0
      seqActiveId = null
      seqPrevId = null
      if (!seqNotes.length) return
      scheduleNextSeqNote()
    },

    stopSequence() {
      clearSeqTimer()
      if (seqActiveId) killVoice(seqActiveId, 0.25)
      if (seqPrevId) killVoice(seqPrevId, 0.2)
      seqActiveId = null
      seqPrevId = null
      seqNotes = []
      killKind('seq', 0.2)
    },

    setLayer(id: string, hz: number, gain: number, ratioLabel = id) {
      const key = `layer-${id}`
      const existing = voices.get(key)
      const partials = sanitizePartials([1, 2, 3, 4, 5])
      if (existing) {
        existing.hz = hz
        existing.ratioLabel = ratioLabel
        existing.targetGain = gain
        existing.oscillators.forEach((o, i) => {
          const m = existing.partials[i] ?? partials[i] ?? 1
          try {
            o.frequency.setTargetAtTime(hz * m, now(), 0.04)
          } catch {
            /* */
          }
        })
        softRamp(existing.voiceGain.gain, Math.max(0, Math.min(1, gain)), 0.15)
        return
      }
      if (gain <= 0.001) return
      buildVoice(key, hz, gain, 'layer', ratioLabel, partials)
    },

    fadeLayer(id: string, gain: number, sec: number) {
      const key = `layer-${id}`
      const v = voices.get(key)
      if (!v) {
        if (gain > 0.001) this.setLayer(id, 60, gain)
        return
      }
      v.targetGain = gain
      softRamp(v.voiceGain.gain, Math.max(0, Math.min(1, gain)), sec)
      if (gain <= 0.001) {
        window.setTimeout(() => killVoice(key, 0.05), sec * 1000 + 40)
      }
    },

    clearLayers() {
      killKind('layer', 0.2)
    },

    fadeOut(sec: number) {
      clearSeqTimer()
      clearBreath()
      const t = sec > 0 ? sec : 0.4
      ;[...voices.values()].forEach((v) => {
        softRamp(v.voiceGain.gain, 0.00008, t)
        window.setTimeout(() => killVoice(v.id, 0.05), t * 1000 + 30)
      })
      if (master) softRamp(master.gain, 0.00008, t)
      window.setTimeout(() => {
        if (master && !disposed) {
          const mapped = 0.55 + masterVol * 0.23
          softRamp(master.gain, Math.min(0.78, mapped), 0.05)
        }
      }, t * 1000 + 80)
    },

    getLevels(): LevelSample[] {
      const out: LevelSample[] = []
      voices.forEach((v) => {
        const amp = Math.min(1, Math.max(0, v.voiceGain.gain.value))
        if (amp > 0.002) out.push({ hz: v.hz, ratioLabel: v.ratioLabel, amp })
      })
      // Prefer tonic / sequence first in readout order
      out.sort((a, b) => b.amp - a.amp)
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
      clearBreath()
      ;[...voices.keys()].forEach((id) => {
        const v = voices.get(id)
        if (!v) return
        try {
          v.oscillators.forEach((o) => {
            try {
              o.stop()
            } catch {
              /* */
            }
          })
          if (v.noise)
            try {
              v.noise.stop()
            } catch {
              /* */
            }
        } catch {
          /* */
        }
      })
      voices.clear()
      try {
        ctx?.close()
      } catch {
        /* */
      }
      ctx = null
      master = null
      compressor = null
      analyser = null
    },
  }
}
