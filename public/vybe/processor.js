/**
 * Vybe ear. One hop of samples in, four numbers out, then the samples are gone.
 * Nothing here is stored, sent, or played back.
 */
class Biquad {
  constructor(type, freq, q, sampleRate) {
    this.x1 = 0
    this.x2 = 0
    this.y1 = 0
    this.y2 = 0
    this.tune(type, freq, q, sampleRate)
  }

  tune(type, freq, q, sampleRate) {
    const w0 = (2 * Math.PI * freq) / sampleRate
    const cos = Math.cos(w0)
    const sin = Math.sin(w0)
    const alpha = sin / (2 * q)
    let b0
    let b1
    let b2
    let a0
    let a1
    let a2
    if (type === 'low') {
      b0 = (1 - cos) / 2
      b1 = 1 - cos
      b2 = (1 - cos) / 2
      a0 = 1 + alpha
      a1 = -2 * cos
      a2 = 1 - alpha
    } else if (type === 'high') {
      b0 = (1 + cos) / 2
      b1 = -(1 + cos)
      b2 = (1 + cos) / 2
      a0 = 1 + alpha
      a1 = -2 * cos
      a2 = 1 - alpha
    } else {
      b0 = alpha
      b1 = 0
      b2 = -alpha
      a0 = 1 + alpha
      a1 = -2 * cos
      a2 = 1 - alpha
    }
    this.b0 = b0 / a0
    this.b1 = b1 / a0
    this.b2 = b2 / a0
    this.a1 = a1 / a0
    this.a2 = a2 / a0
  }

  step(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2
    this.x2 = this.x1
    this.x1 = x
    this.y2 = this.y1
    this.y1 = y
    return y
  }
}

class VybeEar extends AudioWorkletProcessor {
  constructor() {
    super()
    const rate = sampleRate
    this.sub = new Biquad('low', 80, 0.7, rate)
    this.bass = new Biquad('band', 140, 0.8, rate)
    this.high = new Biquad('high', 2000, 0.7, rate)
    this.hop = 128
    this.n = 0
    this.subE = 0
    this.bassE = 0
    this.highE = 0
    this.rmsE = 0
    this.prevHigh = 0
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (!channel) return true
    for (let i = 0; i < channel.length; i++) {
      const x = channel[i]
      this.rmsE += x * x
      this.subE += this.sub.step(x) ** 2
      this.bassE += this.bass.step(x) ** 2
      this.highE += this.high.step(x) ** 2
      this.n++
      if (this.n >= this.hop) {
        const inv = 1 / this.hop
        const high = Math.sqrt(this.highE * inv)
        const flux = Math.max(0, high - this.prevHigh)
        this.prevHigh = high
        this.port.postMessage({
          rms: Math.sqrt(this.rmsE * inv),
          sub: Math.sqrt(this.subE * inv),
          bass: Math.sqrt(this.bassE * inv),
          high,
          flux
        })
        this.n = 0
        this.rmsE = 0
        this.subE = 0
        this.bassE = 0
        this.highE = 0
      }
    }
    return true
  }
}

registerProcessor('vybe-ear', VybeEar)
