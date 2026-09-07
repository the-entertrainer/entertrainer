"""Load Inspiration ogg grains for produced texture."""
from __future__ import annotations
import os, subprocess, tempfile
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from _ident_dsp import SR, DUR, biquad_hp, biquad_lp, env_adsr

INSP = Path(__file__).resolve().parents[1] / "Inspiration" / "sounds"
_cache = {}

def load_ogg_mono(path: Path) -> np.ndarray:
    key = str(path)
    if key in _cache: return _cache[key]
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav_path = tmp.name
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "wav", wav_path],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        rate, data = wavfile.read(wav_path)
        if data.dtype == np.int16: audio = data.astype(np.float64) / 32768.0
        elif data.dtype == np.int32: audio = data.astype(np.float64) / 2147483648.0
        else:
            audio = data.astype(np.float64)
            peak = np.max(np.abs(audio)) or 1.0
            audio /= peak
        if audio.ndim > 1: audio = audio.mean(axis=1)
        _cache[key] = audio
        return audio
    finally:
        try: os.unlink(wav_path)
        except OSError: pass

def grain_slice(name, start_s, dur, amp, hp=80, lp=8000):
    path = INSP / name
    if not path.exists(): return np.zeros(int(dur * SR))
    src = load_ogg_mono(path)
    start = int(start_s * SR) % max(1, len(src) - 1)
    n = int(dur * SR)
    chunk = np.zeros(n); pos = 0
    while pos < n:
        take = min(n - pos, len(src) - start)
        chunk[pos:pos + take] = src[start:start + take]
        pos += take; start = 0
    chunk = biquad_hp(chunk, hp); chunk = biquad_lp(chunk, lp)
    chunk *= env_adsr(n, 0.05, 0.15, max(dur - 0.4, 0.1), 0.25, 0.6)
    peak = np.max(np.abs(chunk)) or 1.0
    return (chunk / peak * amp).astype(np.float64)
