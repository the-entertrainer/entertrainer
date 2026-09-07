#!/usr/bin/env python3
"""Generate short original logo/ident stings as WAV, then encode to MP3."""
from __future__ import annotations

import math
import os
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT_DIR = Path(__file__).resolve().parents[1] / "public" / "audio" / "idents"


def env_adsr(n: int, a: float, d: float, s: float, r: float, sus_level: float = 0.7) -> np.ndarray:
    a_n = max(1, int(a * SR))
    d_n = max(1, int(d * SR))
    r_n = max(1, int(r * SR))
    s_n = max(0, n - a_n - d_n - r_n)
    attack = np.linspace(0.0, 1.0, a_n, endpoint=False)
    decay = np.linspace(1.0, sus_level, d_n, endpoint=False)
    sustain = np.full(s_n, sus_level)
    release = np.linspace(sus_level, 0.0, r_n)
    env = np.concatenate([attack, decay, sustain, release])
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


def tone(freq: float, dur: float, amp: float = 0.35, wave_type: str = "sine") -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    if wave_type == "sine":
        sig = np.sin(2 * math.pi * freq * t)
    elif wave_type == "triangle":
        sig = 2 * np.abs(2 * ((t * freq) % 1) - 1) - 1
    elif wave_type == "soft_square":
        sig = np.tanh(2.2 * np.sin(2 * math.pi * freq * t))
    else:
        sig = np.sin(2 * math.pi * freq * t)
    return (sig * amp).astype(np.float64)


def soft_noise(dur: float, amp: float = 0.08) -> np.ndarray:
    n = int(dur * SR)
    noise = np.random.default_rng(42).normal(0, 1, n)
    # simple one-pole lowpass
    out = np.zeros(n)
    prev = 0.0
    for i, x in enumerate(noise):
        prev = 0.92 * prev + 0.08 * x
        out[i] = prev
    return out * amp


def mix(*parts: np.ndarray) -> np.ndarray:
    length = max(len(p) for p in parts)
    out = np.zeros(length, dtype=np.float64)
    for p in parts:
        out[: len(p)] += p
    peak = np.max(np.abs(out)) or 1.0
    if peak > 0.95:
        out *= 0.95 / peak
    return out


def place(sig: np.ndarray, start_s: float, total_s: float) -> np.ndarray:
    total = int(total_s * SR)
    out = np.zeros(total)
    start = int(start_s * SR)
    end = min(total, start + len(sig))
    out[start:end] += sig[: end - start]
    return out


def write_wav(path: Path, mono: np.ndarray) -> None:
    clipped = np.clip(mono, -1.0, 1.0)
    pcm = (clipped * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def encode_mp3(wav_path: Path, mp3_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(wav_path),
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "128k",
            "-ar",
            "44100",
            "-ac",
            "1",
            str(mp3_path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


# --- Ident generators (original simple musical motifs) ---

def soft_chime(dur: float = 2.2) -> np.ndarray:
    # Gentle ascending major arpeggio: C5 E5 G5 C6
    freqs = [523.25, 659.25, 783.99, 1046.5]
    parts = []
    for i, f in enumerate(freqs):
        note = tone(f, 0.9, amp=0.28 - i * 0.03)
        note *= env_adsr(len(note), 0.01, 0.12, 0.35, 0.42, 0.45)
        # light harmonic
        harm = tone(f * 2, 0.7, amp=0.06)
        harm *= env_adsr(len(harm), 0.005, 0.08, 0.2, 0.4, 0.3)
        parts.append(place(mix(note, harm), 0.08 + i * 0.22, dur))
    air = soft_noise(dur, 0.015) * env_adsr(int(dur * SR), 0.05, 0.2, 1.2, 0.7, 0.5)
    return mix(*parts, air)


def warm_pulse(dur: float = 2.4) -> np.ndarray:
    # Soft low fifth swell + heartbeat-ish double pulse
    root = tone(130.81, dur, amp=0.22, wave_type="soft_square")  # C3
    fifth = tone(196.00, dur, amp=0.14, wave_type="sine")  # G3
    pad = mix(root, fifth) * env_adsr(int(dur * SR), 0.18, 0.35, 1.2, 0.65, 0.55)
    # two soft mid pulses
    pulses = []
    for start, f in ((0.35, 261.63), (0.95, 329.63)):
        p = tone(f, 0.55, amp=0.2)
        p *= env_adsr(len(p), 0.02, 0.1, 0.15, 0.28, 0.4)
        pulses.append(place(p, start, dur))
    return mix(pad, *pulses)


def bright_spark(dur: float = 1.8) -> np.ndarray:
    # Quick bright ping with short sparkle trail
    ping = tone(1396.91, 0.55, amp=0.32)  # F6
    ping *= env_adsr(len(ping), 0.002, 0.05, 0.08, 0.4, 0.25)
    sparkle = tone(2093.0, 0.35, amp=0.12)
    sparkle *= env_adsr(len(sparkle), 0.001, 0.04, 0.05, 0.25, 0.2)
    trail = tone(880.0, 0.9, amp=0.1, wave_type="triangle")
    trail *= env_adsr(len(trail), 0.01, 0.08, 0.2, 0.55, 0.35)
    return mix(place(ping, 0.05, dur), place(sparkle, 0.12, dur), place(trail, 0.18, dur))


def deep_note(dur: float = 2.6) -> np.ndarray:
    # Resonant low tone with gentle overtone bloom
    fund = tone(82.41, dur, amp=0.3, wave_type="soft_square")  # E2
    over = tone(164.81, dur, amp=0.12)
    bloom = tone(246.94, 1.4, amp=0.1)
    bloom *= env_adsr(len(bloom), 0.15, 0.25, 0.5, 0.5, 0.4)
    body = mix(fund, over) * env_adsr(int(dur * SR), 0.08, 0.4, 1.4, 0.7, 0.6)
    return mix(body, place(bloom, 0.35, dur))


def quiet_hush(dur: float = 2.3) -> np.ndarray:
    # Filtered hush + distant soft dyad
    hush = soft_noise(dur, 0.11) * env_adsr(int(dur * SR), 0.25, 0.4, 0.9, 0.75, 0.45)
    a = tone(392.0, 1.6, amp=0.09)  # G4
    a *= env_adsr(len(a), 0.2, 0.3, 0.6, 0.5, 0.4)
    b = tone(493.88, 1.4, amp=0.07)  # B4
    b *= env_adsr(len(b), 0.25, 0.3, 0.5, 0.45, 0.35)
    return mix(hush, place(a, 0.2, dur), place(b, 0.45, dur))


def glass_tap(dur: float = 2.0) -> np.ndarray:
    # Two clear glass-like taps, major third apart
    taps = []
    for i, (f, start) in enumerate(((1046.5, 0.08), (1318.5, 0.42))):
        n = tone(f, 1.1, amp=0.26 - i * 0.04)
        n *= env_adsr(len(n), 0.001, 0.06, 0.15, 0.85, 0.22)
        harm = tone(f * 2.01, 0.7, amp=0.05)
        harm *= env_adsr(len(harm), 0.001, 0.05, 0.1, 0.5, 0.2)
        taps.append(place(mix(n, harm), start, dur))
    return mix(*taps)


IDENTS = {
    "soft-chime": soft_chime,
    "warm-pulse": warm_pulse,
    "bright-spark": bright_spark,
    "deep-note": deep_note,
    "quiet-hush": quiet_hush,
    "glass-tap": glass_tap,
}


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, gen in IDENTS.items():
        wav = OUT_DIR / f"{name}.wav"
        mp3 = OUT_DIR / f"{name}.mp3"
        audio = gen()
        write_wav(wav, audio)
        encode_mp3(wav, mp3)
        wav.unlink(missing_ok=True)
        size = mp3.stat().st_size
        print(f"{name}: {size} bytes, ~{len(audio)/SR:.2f}s")


if __name__ == "__main__":
    main()
