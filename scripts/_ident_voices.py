"""Six distinct cinematic sonic logos synced to Entertrainer preloader."""
from __future__ import annotations
import math
import numpy as np
from _ident_dsp import (
    N, SR, WORDMARK, BREATHE, DUR,
    place, ring_cascade, impact_thump, fm_bell, sine_pad, warm_sub,
    noise_whoosh, convolve_reverb, stereoize, sine, soft_tri, env_adsr,
    biquad_lp, biquad_bp, biquad_hp, exp_decay,
)
from _ident_texture import grain_slice

def mix_pad(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n, dtype=np.float64)
    for p in parts:
        out[:len(p)] += p
    return out


def soft_chime():
    mono = np.zeros(N)
    mono += place(impact_thump(0.25, 0.22, seed=11), 0.0)
    def hit(i):
        freqs = [659.25, 783.99, 987.77, 1318.5]
        return fm_bell(freqs[i], 1.35 - i * 0.08, 0.28 - i * 0.03, ratio=2.003, idx=2.8)
    mono += ring_cascade(hit)
    resolve = mix_pad(
        fm_bell(523.25, 2.2, 0.32, ratio=2.01, idx=2.2),
        fm_bell(659.25, 2.0, 0.18, ratio=1.99, idx=1.8) * 0.85,
        fm_bell(783.99, 1.8, 0.12, ratio=3.01, idx=1.5) * 0.7,
    )
    mono += place(resolve, WORDMARK)
    mono += place(sine_pad([261.63, 329.63, 392.0], 2.6, 0.16, attack=0.25), WORDMARK)
    mono += place(noise_whoosh(0.55, 0.08, 400, 2400, seed=21), 0.0)
    mono += place(grain_slice("ambient.ogg", 4.5, DUR, 0.09, hp=200, lp=4500), 0.0)
    mono += place(grain_slice("spiral.ogg", 0.0, 1.4, 0.05, hp=400, lp=6000), WORDMARK)
    mono = convolve_reverb(mono, decay=1.6, wet=0.38, seed=5)
    mono += place(warm_sub(65.41, 2.8, 0.12), 0.05)
    mono += place(sine_pad([196.0, 246.94, 293.66], 1.7, 0.08, attack=0.4), BREATHE)
    return stereoize(mono, 0.4)

def warm_pulse():
    mono = np.zeros(N)
    mono += place(impact_thump(0.3, 0.18, seed=19), 0.0)
    def hit(i):
        f = [98.0, 123.47, 146.83, 174.61][i]
        n = int(0.55 * SR)
        p = sine(f, n) * env_adsr(n, 0.01, 0.08, 0.12, 0.32, 0.4)
        p += biquad_lp(sine(f * 2, n), 400) * 0.25 * env_adsr(n, 0.01, 0.06, 0.1, 0.3, 0.35)
        return p * (0.34 - i * 0.03)
    mono += ring_cascade(hit)
    for t0, a in ((WORDMARK, 0.28), (WORDMARK + 0.28, 0.18)):
        n = int(0.45 * SR)
        beat = sine(55, n) * env_adsr(n, 0.008, 0.06, 0.08, 0.28, 0.35)
        mono += place(beat * a, t0)
    mono += place(sine_pad([130.81, 164.81, 196.0, 246.94], 2.8, 0.22, attack=0.28), 0.08)
    mono += place(sine_pad([261.63, 329.63], 2.2, 0.1, attack=0.35), WORDMARK)
    mono += place(noise_whoosh(0.7, 0.07, 200, 1200, seed=31), 0.0)
    mono += place(grain_slice("ambient.ogg", 12.0, DUR, 0.12, hp=100, lp=3500), 0.0)
    mono += place(grain_slice("list.ogg", 0.1, 1.3, 0.04, hp=300, lp=5000), 0.2)
    mono = convolve_reverb(mono, decay=1.8, wet=0.42, seed=8)
    mono += place(warm_sub(49.0, 3.0, 0.16), 0.0)
    mono += place(sine_pad([98.0, 146.83], 1.7, 0.1, attack=0.5), BREATHE)
    return stereoize(mono, 0.28)

def bright_spark():
    mono = np.zeros(N)
    mono += place(impact_thump(0.2, 0.26, seed=41), 0.0)
    def hit(i):
        freqs = [1046.5, 1318.5, 1568.0, 2093.0]
        bell = fm_bell(freqs[i], 0.85, 0.3 - i * 0.04, ratio=2.4, idx=4.2)
        n = int(0.08 * SR); rng = np.random.default_rng(50 + i)
        tick = biquad_hp(rng.normal(0, 1, n), 4000) * exp_decay(n, 0.01)
        return mix_pad(bell, tick * 0.2)
    mono += ring_cascade(hit)
    mono += place(fm_bell(880.0, 1.8, 0.28, ratio=2.02, idx=3.0), WORDMARK)
    mono += place(fm_bell(1108.73, 1.5, 0.16, ratio=1.99, idx=2.5), WORDMARK + 0.04)
    mono += place(fm_bell(1318.5, 1.2, 0.1, ratio=3.5, idx=2.0), WORDMARK + 0.08)
    mono += place(sine_pad([440.0, 554.37, 659.25], 2.4, 0.12, attack=0.12), WORDMARK)
    mono += place(noise_whoosh(0.4, 0.1, 800, 5000, seed=44), 0.0)
    mono += place(grain_slice("switch.ogg", 0.0, 1.2, 0.06, hp=500, lp=9000), 0.0)
    mono += place(grain_slice("ambient.ogg", 22.0, DUR, 0.06, hp=400, lp=7000), 0.05)
    mono = convolve_reverb(mono, decay=1.2, wet=0.28, seed=12)
    mono += place(warm_sub(73.42, 2.4, 0.1), 0.0)
    mono += place(sine_pad([329.63, 415.3], 1.6, 0.07, attack=0.3), BREATHE)
    return stereoize(mono, 0.45)

def deep_note():
    mono = np.zeros(N)
    mono += place(impact_thump(0.4, 0.3, seed=61), 0.0)
    def hit(i):
        freqs = [55.0, 61.74, 69.3, 82.41]
        n = int(0.7 * SR)
        body = sine(freqs[i], n) * env_adsr(n, 0.015, 0.12, 0.2, 0.35, 0.5)
        body += biquad_lp(soft_tri(freqs[i] * 2, n), 280) * 0.3 * env_adsr(n, 0.02, 0.1, 0.15, 0.35, 0.4)
        return body * (0.4 - i * 0.04)
    mono += ring_cascade(hit)
    rise_n = int(0.55 * SR); t = np.arange(rise_n) / SR
    phase = np.cumsum(2 * math.pi * (40 + (82.41 - 40) * (t / 0.55)) / SR)
    rise = np.sin(phase) * env_adsr(rise_n, 0.08, 0.1, 0.25, 0.12, 0.7)
    mono += place(rise * 0.35, WORDMARK - 0.35)
    mono += place(warm_sub(41.2, 2.7, 0.38), WORDMARK)
    mono += place(warm_sub(82.41, 2.5, 0.18), WORDMARK)
    mono += place(sine_pad([164.81, 246.94, 329.63], 2.3, 0.12, attack=0.3), WORDMARK + 0.1)
    mono += place(fm_bell(246.94, 2.0, 0.08, ratio=1.5, idx=1.2), WORDMARK + 0.15)
    mono += place(noise_whoosh(0.9, 0.09, 80, 900, seed=66), 0.0)
    mono += place(grain_slice("ambient.ogg", 30.0, DUR, 0.14, hp=40, lp=2500), 0.0)
    mono += place(grain_slice("longclick.ogg", 0.0, 1.2, 0.05, hp=80, lp=2000), WORDMARK)
    mono = convolve_reverb(mono, decay=2.0, wet=0.45, seed=17)
    mono += place(sine_pad([82.41, 123.47], 1.7, 0.12, attack=0.45), BREATHE)
    return stereoize(mono, 0.22)

def quiet_hush():
    mono = np.zeros(N)
    mono += place(noise_whoosh(0.5, 0.14, 300, 1800, seed=71), 0.0)
    mono += place(impact_thump(0.18, 0.1, seed=72), 0.0)
    def hit(i):
        n = int(0.6 * SR); rng = np.random.default_rng(80 + i)
        air = biquad_bp(rng.normal(0, 1, n), 600, 3200) * env_adsr(n, 0.02, 0.08, 0.1, 0.4, 0.3)
        tone = sine([392.0, 440.0, 493.88, 587.33][i], n) * env_adsr(n, 0.05, 0.12, 0.15, 0.35, 0.35) * 0.22
        return (air * 0.35 + tone) * (0.9 - i * 0.08)
    mono += ring_cascade(hit, 0.85)
    mono += place(sine_pad([392.0, 493.88], 2.4, 0.11, attack=0.35), WORDMARK)
    mono += place(sine_pad([293.66], 2.2, 0.06, attack=0.4), WORDMARK + 0.08)
    mono += place(fm_bell(784.0, 1.8, 0.07, ratio=2.0, idx=1.4), WORDMARK + 0.05)
    mono += place(grain_slice("ambient.ogg", 38.0, DUR, 0.16, hp=250, lp=5000), 0.0)
    mono += place(grain_slice("close.ogg", 0.0, 0.4, 0.04, hp=400, lp=6000), WORDMARK)
    hush = noise_whoosh(2.0, 0.06, 500, 2500, seed=77)
    mono += place(hush * env_adsr(len(hush), 0.3, 0.4, 0.8, 0.5, 0.45), 0.4)
    mono = convolve_reverb(mono, decay=1.9, wet=0.5, seed=21)
    mono += place(warm_sub(61.74, 2.8, 0.07), 0.1)
    mono += place(sine_pad([246.94, 311.13], 1.7, 0.06, attack=0.55), BREATHE)
    return stereoize(mono, 0.5)

def glass_tap():
    mono = np.zeros(N)
    mono += place(impact_thump(0.22, 0.2, seed=91), 0.0)
    def hit(i):
        freqs = [1396.91, 1661.2, 2093.0, 2637.0]
        bell = fm_bell(freqs[i], 1.1, 0.32 - i * 0.035, ratio=2.76, idx=5.0)
        n = int(0.12 * SR); rng = np.random.default_rng(100 + i)
        wood = biquad_bp(rng.normal(0, 1, n), 800, 4500) * exp_decay(n, 0.018)
        return mix_pad(bell, wood * 0.35)
    mono += ring_cascade(hit)
    mono += place(fm_bell(659.25, 2.1, 0.22, ratio=2.01, idx=2.4), WORDMARK)
    mono += place(fm_bell(830.61, 1.9, 0.14, ratio=1.99, idx=2.0), WORDMARK + 0.06)
    mono += place(fm_bell(987.77, 1.7, 0.1, ratio=3.02, idx=1.6), WORDMARK + 0.1)
    mono += place(sine_pad([329.63, 415.3, 493.88], 2.4, 0.13, attack=0.18), WORDMARK)
    mono += place(noise_whoosh(0.45, 0.07, 600, 3500, seed=95), 0.0)
    mono += place(grain_slice("tick.ogg", 0.0, 0.08, 0.08, hp=1000, lp=12000), 0.0)
    mono += place(grain_slice("click.ogg", 0.0, 0.15, 0.05, hp=800, lp=10000), 0.11)
    mono += place(grain_slice("ambient.ogg", 8.0, DUR, 0.07, hp=300, lp=6000), 0.05)
    mono += place(grain_slice("spiral.ogg", 0.2, 1.2, 0.045, hp=500, lp=8000), WORDMARK)
    mono = convolve_reverb(mono, decay=1.5, wet=0.36, seed=25)
    mono += place(warm_sub(82.41, 2.6, 0.1), 0.05)
    mono += place(sine_pad([415.3, 523.25], 1.6, 0.07, attack=0.35), BREATHE)
    return stereoize(mono, 0.42)

IDENTS = {
    "soft-chime": soft_chime,
    "warm-pulse": warm_pulse,
    "bright-spark": bright_spark,
    "deep-note": deep_note,
    "quiet-hush": quiet_hush,
    "glass-tap": glass_tap,
}
