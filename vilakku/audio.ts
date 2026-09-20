import { clamp } from "./math";

export class AudioWorld {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  terror = 0.15;
  muted = false;
  private heartT = 0;
  private running = false;
  private raf = 0;
  private rainGain: GainNode | null = null;
  private lastNear = 0;

  async unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx({ latencyHint: "interactive" });
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.58;
    this.master.connect(ctx.destination);
    this.startRain();
    this.running = true;
    this.tick();
  }

  setTerror(t: number) {
    this.terror = clamp(t, 0, 1);
  }

  setNear(near: number) {
    if (near > 0.65 && this.lastNear <= 0.65) {
      try {
        navigator.vibrate?.([30, 40, 30, 40, 80]);
      } catch {
        /* ignore */
      }
    }
    this.lastNear = near;
  }

  thunder(gain = 0.9) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const dur = 1.8;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "lowpass";
    bp.frequency.value = 280;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master);
    src.start();
    try {
      navigator.vibrate?.(Math.floor(28 + gain * 40));
    } catch {
      /* ignore */
    }
  }

  bassDrop() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(48, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 1.4);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.7, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 1.7);
  }

  stinger() {
    if (!this.ctx || !this.master) return;
    this.thunder(1);
    this.bassDrop();
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(140, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.28);
    g.gain.setValueAtTime(0.22, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 0.32);
    try {
      navigator.vibrate?.([40, 30, 80, 40, 180]);
    } catch {
      /* ignore */
    }
  }

  snap() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 90 + Math.random() * 70;
    g.gain.setValueAtTime(0.11, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 0.08);
  }

  woodCreak() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(180 + Math.random() * 40, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.22);
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 0.26);
  }

  pour() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const dur = 0.7;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.value = 0.09;
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master);
    src.start();
  }

  whisper(textLen = 8) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const dur = 0.55 + textLen * 0.035;
    const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.22;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 2.2;
    const g = ctx.createGain();
    g.gain.value = 0.07 + this.terror * 0.1;
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master);
    src.start();
  }

  foot(crouch: boolean) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = crouch ? 70 : 95 + Math.random() * 18;
    g.gain.setValueAtTime(crouch ? 0.03 : 0.055, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 0.1);
  }

  private startRain() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 800;
    const g = ctx.createGain();
    g.gain.value = 0.13;
    this.rainGain = g;
    src.connect(hp);
    hp.connect(g);
    g.connect(this.master);
    src.start();
  }

  setRain(amp: number) {
    if (!this.ctx || !this.rainGain) return;
    this.rainGain.gain.setTargetAtTime(amp, this.ctx.currentTime, 0.08);
  }

  private tick = () => {
    if (!this.running || !this.ctx) return;
    const bpm = 48 + this.terror * 78;
    const interval = 60 / bpm;
    this.heartT += 0.016;
    if (this.heartT >= interval) {
      this.heartT = 0;
      this.thump(0.08 + this.terror * 0.13);
      window.setTimeout(() => this.thump(0.045 + this.terror * 0.08), 90);
      if (this.terror > 0.55) {
        try {
          navigator.vibrate?.(Math.floor(16 + this.terror * 28));
        } catch {
          /* ignore */
        }
      }
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private thump(amp: number) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(62, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.16);
    g.gain.setValueAtTime(amp, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 0.2);
  }

  dispose() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    try {
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
  }
}
