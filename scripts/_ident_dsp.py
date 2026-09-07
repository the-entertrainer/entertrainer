"""Shared DSP for cinematic sonic logos (no chiptune)."""
from __future__ import annotations
import math
import numpy as np
from scipy import signal

SR = 44100
DUR = 3.25
N = int(DUR * SR)
RING_HITS = (0.0, 0.110, 0.220, 0.330)
WORDMARK = 0.540
BREATHE = 1.480

def env_adsr(n, a, d, s, r, sus=0.7):
    a_n = max(1, int(a * SR)); d_n = max(1, int(d * SR)); r_n = max(1, int(r * SR))
    s_n = max(0, n - a_n - d_n - r_n)
    env = np.concatenate([
        np.linspace(0.0, 1.0, a_n, endpoint=False),
        np.linspace(1.0, sus, d_n, endpoint=False),
        np.full(s_n, sus),
        np.linspace(sus, 0.0, r_n),
    ])
    if len(env) < n: env = np.pad(env, (0, n - len(env)))
    return env[:n].astype(np.float64)

def exp_decay(n, tau):
    t = np.arange(n) / SR
    return np.exp(-t / max(tau, 1e-4)).astype(np.float64)

def soft_clip(x, drive=1.15):
    return np.tanh(x * drive) / np.tanh(drive)

def biquad_lp(x, cutoff, q=0.707):
    b, a = signal.butter(2, min(cutoff, SR * 0.45) / (SR / 2), btype="low")
    return signal.lfilter(b, a, x).astype(np.float64)

def biquad_hp(x, cutoff):
    b, a = signal.butter(2, max(cutoff, 20.0) / (SR / 2), btype="high")
    return signal.lfilter(b, a, x).astype(np.float64)

def biquad_bp(x, low, high):
    b, a = signal.butter(2, [low / (SR / 2), high / (SR / 2)], btype="band")
    return signal.lfilter(b, a, x).astype(np.float64)

def sine(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return np.sin(2 * math.pi * freq * t + phase).astype(np.float64)

def soft_tri(freq, n):
    t = np.arange(n) / SR
    raw = 2 * np.abs(2 * ((t * freq) % 1) - 1) - 1
    return biquad_lp(raw, min(freq * 6, 6000), 0.6)

def fm_bell(freq, dur, amp, ratio=2.01, idx=3.5):
    n = int(dur * SR); t = np.arange(n) / SR
    mod = np.sin(2 * math.pi * freq * ratio * t)
    i_env = idx * exp_decay(n, 0.18)
    car = np.sin(2 * math.pi * freq * t + i_env * mod)
    p2 = 0.22 * np.sin(2 * math.pi * freq * 2.76 * t) * exp_decay(n, 0.12)
    p3 = 0.12 * np.sin(2 * math.pi * freq * 5.43 * t) * exp_decay(n, 0.08)
    body = (car + p2 + p3) * env_adsr(n, 0.002, 0.08, 0.15, max(dur - 0.25, 0.2), 0.35)
    return (body * amp).astype(np.float64)

def sine_pad(freqs, dur, amp, attack=0.2):
    n = int(dur * SR); out = np.zeros(n, dtype=np.float64)
    for i, f in enumerate(freqs):
        det = 1.0 + (i - len(freqs) / 2) * 0.0018
        out += sine(f * det, n) * (1.0 / len(freqs))
        out += 0.25 * sine(f * det * 2, n) * (1.0 / len(freqs))
    out *= env_adsr(n, attack, 0.35, max(dur - attack - 0.9, 0.3), 0.85, 0.55)
    delay = int(0.018 * SR); chor = np.zeros_like(out); chor[delay:] = out[:-delay] * 0.45
    return soft_clip((out + chor) * amp, 1.05)

def warm_sub(freq, dur, amp):
    n = int(dur * SR)
    fund = sine(freq, n)
    over = biquad_lp(sine(freq * 2, n), 180) * 0.35
    body = (fund + over) * env_adsr(n, 0.06, 0.25, max(dur - 1.0, 0.4), 0.7, 0.65)
    return (body * amp).astype(np.float64)

def noise_whoosh(dur, amp, start_hz, end_hz, seed):
    n = int(dur * SR)
    rng = np.random.default_rng(seed)
    noise = rng.normal(0, 1, n).astype(np.float64)
    a = biquad_bp(noise, max(start_hz * 0.5, 80), start_hz * 1.8)
    b = biquad_bp(noise, max(end_hz * 0.5, 80), end_hz * 1.8)
    fade = np.linspace(0, 1, n)
    out = a * (1 - fade) + b * fade
    out = biquad_hp(out, 120)
    out *= env_adsr(n, 0.04, 0.12, max(dur - 0.35, 0.05), 0.2, 0.5)
    peak = np.max(np.abs(out)) or 1.0
    return (out / peak * amp).astype(np.float64)

def impact_thump(dur, amp, seed=7):
    n = int(dur * SR); rng = np.random.default_rng(seed)
    noise = biquad_lp(rng.normal(0, 1, n), 900) * exp_decay(n, 0.035)
    body = sine(68, n) * exp_decay(n, 0.09)
    click = biquad_hp(rng.normal(0, 1, n), 2500) * exp_decay(n, 0.008) * 0.35
    out = noise * 0.55 + body * 0.9 + click
    peak = np.max(np.abs(out)) or 1.0
    return (out / peak * amp).astype(np.float64)

def convolve_reverb(x, decay=1.4, wet=0.32, seed=3):
    ir_n = int(decay * SR); rng = np.random.default_rng(seed)
    ir = rng.normal(0, 1, ir_n).astype(np.float64)
    ir *= exp_decay(ir_n, decay * 0.28)
    ir = biquad_lp(ir, 6500)
    ir /= np.sqrt(np.sum(ir ** 2) + 1e-12)
    wet_sig = signal.fftconvolve(x, ir, mode="full")[: len(x)]
    return (x * (1 - wet) + wet_sig * wet).astype(np.float64)

def place(sig, start_s, total=N):
    out = np.zeros(total, dtype=np.float64)
    start = int(start_s * SR)
    if start >= total: return out
    end = min(total, start + len(sig))
    out[start:end] += sig[: end - start]
    return out

def stereoize(mono, width=0.35):
    delay = int(0.012 * SR)
    right = np.zeros_like(mono); right[delay:] = mono[:-delay]
    mid = mono; side = (mono - right) * width
    L = mid + side * 0.55; R = mid - side * 0.55 + right * 0.25
    L = biquad_lp(L, 14000); R = biquad_lp(R, 13500)
    st = np.stack([L, R], axis=0)
    peak = np.max(np.abs(st)) or 1.0
    if peak > 0.92: st *= 0.92 / peak
    return st.astype(np.float64)

def soft_limiter(st, ceiling=0.94):
    peak = np.max(np.abs(st)) or 1.0
    if peak <= ceiling: return st
    gain = ceiling / peak
    return soft_clip(st * (gain * 1.05), 1.08) * (ceiling / 0.98)

def fade_edges(st, in_ms=8, out_ms=280):
    n = st.shape[1]
    fade_in = np.ones(n); fade_out = np.ones(n)
    ni = max(1, int(in_ms * SR / 1000)); no = max(1, int(out_ms * SR / 1000))
    fade_in[:ni] = np.linspace(0, 1, ni); fade_out[-no:] = np.linspace(1, 0, no)
    return st * (fade_in * fade_out)

def ring_cascade(make_hit, amp_scale=1.0):
    parts = [place(make_hit(i) * amp_scale, t0) for i, t0 in enumerate(RING_HITS)]
    return sum(parts)
