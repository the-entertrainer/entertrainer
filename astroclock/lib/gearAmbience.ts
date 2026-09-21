/**
 * Tiny, very quiet mechanical gear ticks for AstroClock.
 * Same click every time, steady interval — like gearwork, not random rain.
 */

export const GEAR_SOUND_KEY = 'entertrainer.astroclock.gearSound';

/** Fixed tick spacing (ms) — uniform escapement. */
const TICK_MS = 1000;

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
  let clickBuf: AudioBuffer | null = null;
  let enabled = loadGearSoundEnabled();
  let running = false;
  let timer: number | null = null;
  let disposed = false;

  function buildUniformClick(c: AudioContext): AudioBuffer {
    const dur = 0.028;
    const n = Math.floor(c.sampleRate * dur);
    const buffer = c.createBuffer(1, n, c.sampleRate);
    const data = buffer.getChannelData(0);
    const f1 = 2100;
    const f2 = 780;
    for (let i = 0; i < n; i++) {
      const t = i / c.sampleRate;
      const env = Math.exp(-t * 95);
      const a = Math.sin(2 * Math.PI * f1 * t) * 0.7;
      const b = Math.sin(2 * Math.PI * f2 * t) * 0.35;
      data[i] = (a + b) * env;
    }
    return buffer;
  }

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
      master.gain.value = 0.026;
      master.connect(ctx.destination);
      clickBuf = buildUniformClick(ctx);
    }
    return ctx;
  };

  const click = () => {
    const c = ensureCtx();
    if (!c || !master || !clickBuf || c.state === 'closed') return;
    if (c.state === 'suspended') void c.resume();
    const src = c.createBufferSource();
    src.buffer = clickBuf;
    src.connect(master);
    src.start(c.currentTime);
  };

  const schedule = () => {
    if (timer != null) {
      window.clearTimeout(timer);
      timer = null;
    }
    if (!running || !enabled || disposed) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    click();
    timer = window.setTimeout(schedule, TICK_MS);
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
      clickBuf = null;
    },
  };
}
