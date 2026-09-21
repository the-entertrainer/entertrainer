/**
 * Tiny, very quiet mechanical gear / escapement clicks for AstroClock.
 * Web Audio only (no asset files). Respects prefs + tab visibility.
 */

export const GEAR_SOUND_KEY = 'entertrainer.astroclock.gearSound';

export function loadGearSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(GEAR_SOUND_KEY);
    if (raw === 'off' || raw === '0' || raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function saveGearSoundEnabled(on: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GEAR_SOUND_KEY, on ? 'on' : 'off');
    window.dispatchEvent(
      new CustomEvent('astroclock-gear-sound', { detail: { on } }),
    );
  } catch {
    /* private mode */
  }
}

type GearAmbience = {
  setEnabled: (on: boolean) => void;
  unlock: () => void;
  dispose: () => void;
};

export function createGearAmbience(): GearAmbience {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let enabled = loadGearSoundEnabled();
  let running = false;
  let timer: number | null = null;
  let disposed = false;

  const ensureCtx = () => {
    if (disposed || typeof window === 'undefined') return null;
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      // Extremely quiet — present only if you listen for it
      master.gain.value = 0.028;
      master.connect(ctx.destination);
    }
    return ctx;
  };

  const click = () => {
    const c = ensureCtx();
    if (!c || !master || c.state === 'closed') return;
    if (c.state === 'suspended') void c.resume();

    const t0 = c.currentTime;
    // Soft metal tick: short noise + faint sine body
    const bufLen = Math.floor(c.sampleRate * 0.018);
    const buffer = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      const env = Math.exp(-i / (bufLen * 0.18));
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400 + Math.random() * 900;
    bp.Q.value = 4.5;
    const ng = c.createGain();
    ng.gain.value = 0.55;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(master);

    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 890 + Math.random() * 80;
    const og = c.createGain();
    og.gain.setValueAtTime(0.0001, t0);
    og.gain.exponentialRampToValueAtTime(0.12, t0 + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
    osc.connect(og);
    og.connect(master);

    noise.start(t0);
    osc.start(t0);
    noise.stop(t0 + 0.02);
    osc.stop(t0 + 0.05);

    // Occasional second tooth (gear mesh) — quieter, delayed
    if (Math.random() < 0.35) {
      const t1 = t0 + 0.038 + Math.random() * 0.02;
      const osc2 = c.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 520 + Math.random() * 40;
      const g2 = c.createGain();
      g2.gain.setValueAtTime(0.0001, t1);
      g2.gain.exponentialRampToValueAtTime(0.05, t1 + 0.003);
      g2.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.03);
      osc2.connect(g2);
      g2.connect(master);
      osc2.start(t1);
      osc2.stop(t1 + 0.035);
    }
  };

  const schedule = () => {
    if (timer != null) {
      window.clearTimeout(timer);
      timer = null;
    }
    if (!running || !enabled || disposed) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    click();
    // Slow, irregular escapement — not a metronome hammer
    const wait = 720 + Math.random() * 680;
    timer = window.setTimeout(schedule, wait);
  };

  const start = () => {
    if (running || disposed) return;
    running = true;
    schedule();
  };

  const stop = () => {
    running = false;
    if (timer != null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const onVis = () => {
    if (document.hidden) stop();
    else if (enabled) start();
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVis);
  }

  return {
    setEnabled(on: boolean) {
      enabled = on;
      saveGearSoundEnabled(on);
      if (on) start();
      else stop();
    },
    unlock() {
      const c = ensureCtx();
      if (c?.state === 'suspended') void c.resume();
      if (enabled) start();
    },
    dispose() {
      disposed = true;
      stop();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVis);
      }
      void ctx?.close();
      ctx = null;
      master = null;
    },
  };
}
