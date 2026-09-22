/**
 * One-shot mechanical transform sound for AstroClock dial flips.
 * Reuses the legacy gearSound storage key (toggle = flip sound on/off).
 */

export const GEAR_SOUND_KEY = 'entertrainer.astroclock.gearSound';
export const FLIP_SOUND_EVENT = 'astroclock-gear-sound';

const TRANSFORM_SRC = '/audio/astroclock/transform.mp3';

/** Prefer horizontal swipes; ignore vertical-dominant drags (page scroll). */
export const DIAL_SWIPE_PX = 45;
const TAP_SLOP_PX = 18;

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
      new CustomEvent(FLIP_SOUND_EVENT, { detail: { on } }),
    );
  } catch {
    /* private mode */
  }
}

export type DialPtr = { x: number; y: number };

/** Tap or horizontal-dominant swipe → flip; vertical drag → no. */
export function dialGestureShouldFlip(start: DialPtr, end: DialPtr): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  if (ady > 24 && ady >= adx) return false;
  if (adx >= DIAL_SWIPE_PX && adx > ady) return true;
  if (adx < TAP_SLOP_PX && ady < TAP_SLOP_PX) return true;
  return false;
}

type FlipSound = {
  setEnabled: (on: boolean) => void;
  unlock: () => void;
  play: () => void;
  dispose: () => void;
};

export function createFlipSound(): FlipSound {
  let audio: HTMLAudioElement | null = null;
  let enabled = loadGearSoundEnabled();
  let disposed = false;
  let playing = false;

  const ensure = (): HTMLAudioElement | null => {
    if (disposed || typeof window === 'undefined') return null;
    if (!audio) {
      audio = new Audio(TRANSFORM_SRC);
      audio.preload = 'auto';
      audio.volume = 0.38; // subtle metallic ring — not a paper slap
      audio.addEventListener('ended', () => {
        playing = false;
      });
      audio.addEventListener('pause', () => {
        if (audio && audio.currentTime >= audio.duration - 0.02) {
          playing = false;
        }
      });
    }
    return audio;
  };

  return {
    setEnabled(on: boolean) {
      enabled = on;
      saveGearSoundEnabled(on);
      if (!on && audio) {
        audio.pause();
        playing = false;
      }
    },
    unlock() {
      const a = ensure();
      if (!a) return;
      /* Warm decode / satisfy autoplay policy after a user gesture. */
      const wasMuted = a.muted;
      a.muted = true;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        void p
          .then(() => {
            a.pause();
            a.currentTime = 0;
            a.muted = wasMuted;
          })
          .catch(() => {
            a.muted = wasMuted;
          });
      } else {
        a.pause();
        a.currentTime = 0;
        a.muted = wasMuted;
      }
    },
    play() {
      if (!enabled || disposed) return;
      const a = ensure();
      if (!a) return;
      /* Ignore spam while the same one-shot is still mid-play. */
      if (playing && !a.paused && a.currentTime > 0.04) return;
      playing = true;
      try {
        a.currentTime = 0;
      } catch {
        /* ignore seek race */
      }
      const p = a.play();
      if (p && typeof p.catch === 'function') {
        void p.catch(() => {
          playing = false;
        });
      }
    },
    dispose() {
      disposed = true;
      playing = false;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio = null;
      }
    },
  };
}

/** @deprecated Use createFlipSound — kept name for any stray imports. */
export const createGearAmbience = createFlipSound;
