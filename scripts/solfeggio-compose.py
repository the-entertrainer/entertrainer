#!/usr/bin/env python3
"""Seeded Solfeggio song. Python is the numeric source of truth.

Running this file rewrites utils/solfeggio-compose.mjs. Do not edit the .mjs
by hand. Same seed, same score.

The lead is not a table of pitches. A one-layer GRU (MelodyRNN's next-event
idea, with the cell reduced to the GRU the brief asked for) is trained on a
built-in corpus of one-bar motifs in the solfeggio scale. Compose time draws
three bars from that network, then develops them: repeat, sequence, invert,
fragment. Harmony, bass and drums are arranged around those bars.

528/396 and 852/639 are exactly 4/3. 963/639 is about 8 cents sharp of 3/2.
"""

from __future__ import annotations

import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import argparse
import itertools
import json
import math
import sys
from pathlib import Path

import numpy as np

PITCHES = [174, 285, 396, 417, 528, 639, 741, 852, 963]
CENTER = 528
# One octave, low to high, so no lead leap can exceed an octave.
# 570, 792, 834, 1056 are exact octaves of 285, 396, 417, 528.
LEAD = [528, 570, 639, 741, 792, 834, 852, 963, 1056]
REST = 9
START = 10
V_OUT = 10
V_IN = 11
E = 16
H = 24
Q = 128
SIG_LO = -16 * Q
SIG_HI = 16 * Q
BARS = 8

# One-bar motifs the GRU is trained on. Eighths. 9 is a rest.
# Stepwise contours and a reused rhythm skeleton, ending on the tonic.
CORPUS = [
    [0, 0, 1, 2, 3, 2, 1, 0],
    [0, 1, 2, 2, 1, 0, 1, 0],
    [0, 0, 2, 1, 0, 1, 2, 0],
    [1, 0, 1, 2, 3, 2, 1, 0],
    [0, 2, 1, 0, 1, 2, 1, 0],
    [0, 1, 0, 2, 1, 0, 0, 0],
    [2, 1, 0, 1, 2, 3, 1, 0],
    [0, 0, 1, 3, 2, 1, 0, 0],
    [0, 9, 1, 2, 9, 3, 1, 0],
    [0, 0, 9, 2, 3, 9, 1, 0],
    [1, 2, 9, 3, 2, 9, 1, 0],
    [0, 9, 2, 1, 9, 2, 1, 0],
    [2, 9, 1, 0, 9, 1, 2, 0],
    [0, 1, 2, 9, 3, 2, 9, 0],
    [0, 2, 9, 3, 2, 1, 0, 0],
    [3, 2, 1, 0, 1, 2, 1, 0],
    [0, 1, 2, 3, 2, 1, 2, 0],
    [2, 3, 2, 1, 0, 1, 0, 0],
    [0, 0, 1, 2, 4, 3, 1, 0],
    [1, 2, 3, 4, 3, 2, 1, 0],
    [0, 2, 3, 4, 3, 2, 1, 0],
    [4, 3, 2, 1, 2, 1, 0, 0],
    [0, 1, 3, 2, 4, 3, 1, 0],
    [2, 3, 4, 3, 2, 1, 0, 0],
    [0, 9, 3, 2, 4, 9, 1, 0],
    [4, 9, 3, 2, 9, 1, 0, 0],
    [0, 1, 2, 3, 4, 2, 1, 0],
    [3, 4, 3, 2, 1, 2, 0, 0],
    [0, 2, 4, 3, 2, 1, 2, 0],
    [1, 0, 2, 4, 3, 2, 1, 0],
    [0, 0, 3, 4, 5, 3, 1, 0],
    [5, 4, 3, 2, 1, 2, 0, 0],
    [0, 2, 3, 5, 4, 2, 1, 0],
    [2, 4, 5, 4, 3, 2, 1, 0],
    [0, 9, 4, 3, 5, 9, 2, 0],
    [4, 5, 4, 3, 2, 1, 0, 0],
    [0, 1, 2, 4, 6, 4, 2, 0],
    [6, 5, 4, 3, 2, 1, 0, 0],
    [0, 3, 4, 6, 4, 3, 1, 0],
    [2, 3, 4, 6, 4, 2, 1, 0],
    [0, 2, 4, 6, 5, 3, 1, 0],
    [6, 4, 3, 2, 4, 2, 1, 0],
    [0, 9, 2, 4, 6, 4, 2, 0],
    [3, 2, 1, 0, 2, 4, 2, 0],
    [0, 1, 0, 1, 2, 1, 0, 0],
    [8, 7, 6, 4, 3, 2, 1, 0],
    [0, 2, 4, 6, 7, 4, 2, 0],
    [7, 6, 4, 3, 2, 1, 0, 0],
]

# Functional loops. The last chord of each loop is the tonic.
VERSE_ROOTS = [528, 396, 639, 528]
CHORUS_ROOTS = [396, 852, 639, 528]
BRIDGE_ROOTS = [639, 852, 741, 528]
INTRO_ROOTS = [528, 396, 639, 528]
OUTRO_ROOTS = [528, 639, 396, 528]

CHORD_TONES = {
    528: [528, 639, 792],
    396: [396, 528, 639],
    639: [639, 792, 963],
    852: [852, 1056, 639],
    741: [741, 852, 963],
}

GAINS = {
    "kick": 520,
    "snare": 420,
    "hat": 90,
    "openhat": 130,
    "bass": 460,
    "chordIntro": 160,
    "chordVerse": 210,
    "chordChorus": 250,
    "chordBridge": 200,
    "chordOutro": 190,
    "leadIntro": 280,
    "leadVerse": 380,
    "leadChorus": 640,
    "leadBridge": 400,
    "leadOutro": 440,
}

ROOT = Path(__file__).resolve().parents[1]
MJS_PATH = ROOT / "utils" / "solfeggio-compose.mjs"

_ENGINE = None


def to_i32(x: int) -> int:
    x &= 0xFFFFFFFF
    if x >= 0x80000000:
        x -= 0x100000000
    return x


def to_u32(x: int) -> int:
    return x & 0xFFFFFFFF


def imul(a: int, b: int) -> int:
    return to_i32(to_i32(a) * to_i32(b))


class Rng:
    """Same integer stream as the generated module's mulberry32."""

    def __init__(self, seed: int) -> None:
        self.a = seed & 0xFFFFFFFF

    def next_u32(self) -> int:
        self.a = to_i32(self.a + 0x6D2B79F5)
        ua = to_u32(self.a)
        t = imul(ua ^ (ua >> 15), to_u32(1 | self.a))
        ut = to_u32(t)
        prod = imul(ut ^ (ut >> 7), to_u32(61 | t))
        summed = to_i32(t + prod)
        t2 = to_u32(summed) ^ to_u32(t)
        ut2 = to_u32(t2)
        return to_u32(ut2 ^ (ut2 >> 14))

    def below(self, n: int) -> int:
        return self.next_u32() % n


def cents(ratio: float) -> float:
    return 1200 * math.log2(ratio)


def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-np.clip(x, -20, 20)))


def _init_params(rs):
    def w(shape, scale):
        return rs.randn(*shape).astype(np.float64) * scale

    s = 0.25
    return {
        "emb": w((V_IN, E), s),
        "Wx_r": w((H, E), s), "Wh_r": w((H, H), s), "br": np.zeros(H),
        "Wx_z": w((H, E), s), "Wh_z": w((H, H), s), "bz": np.ones(H),
        "Wx_n": w((H, E), s), "Wh_n": w((H, H), s), "bn": np.zeros(H), "bh": np.zeros(H),
        "Wo": w((V_OUT, H), s), "bo": np.zeros(V_OUT),
    }


def _ce_and_grad(p, seq):
    xs = [START] + list(seq[:-1])
    tg = list(seq)
    T = len(tg)
    cache = []
    h = np.zeros(H)
    loss = 0.0
    for t in range(T):
        x = p["emb"][xs[t]]
        xr = p["Wx_r"] @ x + p["Wh_r"] @ h + p["br"]
        r = sigmoid(xr)
        xz = p["Wx_z"] @ x + p["Wh_z"] @ h + p["bz"]
        z = sigmoid(xz)
        xh = p["Wh_n"] @ h + p["bh"]
        xn = p["Wx_n"] @ x + p["bn"] + r * xh
        n = np.tanh(xn)
        h2 = (1 - z) * n + z * h
        logits = p["Wo"] @ h2 + p["bo"]
        m = np.max(logits)
        ex = np.exp(logits - m)
        pr = ex / np.sum(ex)
        loss += -math.log(float(pr[tg[t]]) + 1e-12)
        cache.append((x, h, r, z, n, xh, h2, pr, xs[t]))
        h = h2
    loss /= T
    g = {k: np.zeros_like(v) for k, v in p.items()}
    dh2 = np.zeros(H)
    for t in reversed(range(T)):
        x, h, r, z, n, xh, h2, pr, xt = cache[t]
        dlogits = pr.copy()
        dlogits[tg[t]] -= 1.0
        dlogits /= T
        g["Wo"] += dlogits[:, None] * h2[None, :]
        g["bo"] += dlogits
        dh = dh2 + p["Wo"].T @ dlogits
        dz = dh * (h - n)
        dn = dh * (1 - z)
        dh_direct = dh * z
        dxn = dn * (1 - n * n)
        g["Wx_n"] += dxn[:, None] * x[None, :]
        g["bn"] += dxn
        dr = dxn * xh
        dxh = dxn * r
        g["Wh_n"] += dxh[:, None] * h[None, :]
        g["bh"] += dxh
        dx = p["Wx_n"].T @ dxn
        dh_from_n = p["Wh_n"].T @ dxh
        dxr = dr * r * (1 - r)
        dxz = dz * z * (1 - z)
        g["Wx_r"] += dxr[:, None] * x[None, :]
        g["Wh_r"] += dxr[:, None] * h[None, :]
        g["br"] += dxr
        g["Wx_z"] += dxz[:, None] * x[None, :]
        g["Wh_z"] += dxz[:, None] * h[None, :]
        g["bz"] += dxz
        dx += p["Wx_r"].T @ dxr + p["Wx_z"].T @ dxz
        dh_next = dh_direct + dh_from_n + p["Wh_r"].T @ dxr + p["Wh_z"].T @ dxz
        g["emb"][xt] += dx
        dh2 = dh_next
    return loss, g


def _mean_loss(p):
    total = 0.0
    for seq in CORPUS:
        loss, _ = _ce_and_grad(p, seq)
        total += loss
    return total / len(CORPUS)


def train_engine():
    """Adam on next-eighth cross-entropy. Deterministic given the corpus."""
    rs = np.random.RandomState(7)
    p = _init_params(rs)
    moment = {k: np.zeros_like(v) for k, v in p.items()}
    vel = {k: np.zeros_like(v) for k, v in p.items()}
    idx = np.arange(len(CORPUS))
    loss_start = _mean_loss(p)
    tstep = 0
    lr = 0.04
    for _ep in range(60):
        rs.shuffle(idx)
        for j in idx:
            tstep += 1
            _loss, g = _ce_and_grad(p, CORPUS[int(j)])
            sq = 0.0
            for arr in g.values():
                sq += float(np.sum(arr * arr))
            scale = 5.0 / math.sqrt(sq) if sq > 25 else 1.0
            for k in p:
                gk = g[k] * scale
                moment[k] = 0.9 * moment[k] + 0.1 * gk
                vel[k] = 0.999 * vel[k] + 0.001 * (gk * gk)
                mh = moment[k] / (1 - 0.9 ** tstep)
                vh = vel[k] / (1 - 0.999 ** tstep)
                p[k] = p[k] - lr * mh / (np.sqrt(vh) + 1e-8)
    loss_end = _mean_loss(p)
    params = int(sum(v.size for v in p.values()))

    def qarr(a):
        clipped = np.clip(np.rint(a * Q), -3 * Q, 3 * Q).astype(np.int64)
        return clipped.tolist()

    net = {k: qarr(v) for k, v in p.items()}
    sig = []
    tanh_t = []
    for i in range(SIG_LO, SIG_HI + 1):
        sig.append(int(round(float(sigmoid(i / Q)) * Q)))
        tanh_t.append(int(round(math.tanh(i / Q) * Q)))
    exp_t = []
    for d in range(0, 16 * Q + 1):
        exp_t.append(max(1, int(round(math.exp(-d / Q) * 1_000_000))))
    net["sig"] = sig
    net["tanh"] = tanh_t
    net["exp"] = exp_t
    reg = []
    for base in PITCHES:
        hz = float(base)
        while hz < 300:
            hz *= 2
        while hz <= 1400:
            reg.append(hz)
            hz *= 2
    scale_reg = []
    for hz in sorted(reg):
        if not scale_reg or abs(hz - scale_reg[-1]) > 1e-6:
            scale_reg.append(hz)
    return {
        "net": net,
        "loss_start": loss_start,
        "loss_end": loss_end,
        "params": params,
        "scale_reg": scale_reg,
    }


def engine():
    global _ENGINE
    if _ENGINE is None:
        _ENGINE = train_engine()
    return _ENGINE


def lut(table, pre):
    if pre < SIG_LO:
        pre = SIG_LO
    elif pre > SIG_HI:
        pre = SIG_HI
    return table[pre - SIG_LO]


def dot(W, vec):
    out = []
    for row in W:
        acc = 0
        for a, b in zip(row, vec):
            acc += a * b
        out.append(acc // Q)
    return out


def gru_step(h, tok, net=None):
    if net is None:
        net = engine()["net"]
    emb = net["emb"][tok]
    r_pre = [a + b + c for a, b, c in zip(dot(net["Wx_r"], emb), dot(net["Wh_r"], h), net["br"])]
    z_pre = [a + b + c for a, b, c in zip(dot(net["Wx_z"], emb), dot(net["Wh_z"], h), net["bz"])]
    r = [lut(net["sig"], p) for p in r_pre]
    z = [lut(net["sig"], p) for p in z_pre]
    xh = [a + b for a, b in zip(dot(net["Wh_n"], h), net["bh"])]
    xn = [a + b + (ri * xhi) // Q for a, b, ri, xhi in zip(dot(net["Wx_n"], emb), net["bn"], r, xh)]
    n = [lut(net["tanh"], p) for p in xn]
    h2 = [((Q - zi) * ni + zi * hi) // Q for zi, ni, hi in zip(z, n, h)]
    logits = [a + b for a, b in zip(dot(net["Wo"], h2), net["bo"])]
    return h2, logits


def token_weights(logits, net=None):
    if net is None:
        net = engine()["net"]
    exp_t = net["exp"]
    scaled = [int(v) * 3 // 4 for v in logits]
    peak = max(scaled)
    weights = []
    for value in scaled:
        d = peak - value
        if d >= len(exp_t):
            weights.append(1)
        else:
            weights.append(exp_t[d])
    return weights


def draw_token(logits, rng, net=None):
    weights = token_weights(logits, net)
    total = sum(weights)
    u = rng.below(total)
    acc = 0
    for i, w in enumerate(weights):
        acc += w
        if u < acc:
            return i
    return len(weights) - 1


def sample_motif(rng, net=None):
    last = [0] * BARS
    for _try in range(6):
        h = [0] * H
        x = START
        toks = []
        for _step in range(BARS):
            h, logits = gru_step(h, x, net)
            tok = draw_token(logits, rng, net)
            toks.append(tok)
            x = tok
        last = toks
        if sum(1 for t in toks if t != REST) >= 3:
            return toks
    return last


def plan(seed, net=None):
    rng = Rng(seed & 0xFFFFFFFF)
    bpm = 78 + rng.below(23)
    pocket = rng.below(2)
    motifs = [sample_motif(rng, net) for _ in range(3)]
    return bpm, pocket, motifs


def seq_up(toks):
    return [REST if t == REST else min(8, t + 1) for t in toks]


def seq_down(toks):
    return [REST if t == REST else max(0, t - 1) for t in toks]


def invert_motif(toks):
    return [REST if t == REST else 8 - t for t in toks]


def fragment(toks):
    return list(toks[:4]) + [REST, REST, REST, REST]


def chorus_bars(motif):
    stated = list(motif)
    sequenced = seq_up(motif)
    hook = [stated, sequenced, stated, sequenced]
    return hook + hook


def verse1_bars(motif):
    inv = invert_motif(motif)
    return [list(motif), inv, list(motif), seq_up(motif), inv, seq_up(inv), list(motif), inv]


def verse2_bars(motif):
    frag = fragment(motif)
    inv = invert_motif(motif)
    return [list(motif), seq_up(motif), inv, list(motif), frag, seq_up(frag), inv, list(motif)]


def bridge_bars(motif):
    frag = fragment(motif)
    return [frag, seq_up(frag), frag, invert_motif(frag), frag, seq_up(frag), invert_motif(frag), frag]


def intro_bars(motif):
    frag = fragment(motif)
    return [None, None, frag, seq_up(frag)]


def outro_bars(motif):
    frag = fragment(motif)
    return [frag, invert_motif(frag), seq_down(frag), [0] * BARS]


def build_scale_reg():
    return engine()["scale_reg"]


def scale_index(hz, scale_reg=None):
    if scale_reg is None:
        scale_reg = build_scale_reg()
    for i, item in enumerate(scale_reg):
        if abs(item - hz) < 1e-6:
            return i
    raise AssertionError(f"hz off the register {hz}")


def octaves_between(base, lo, hi):
    hz = float(base)
    while hz < lo:
        hz *= 2.0
    out = []
    while hz <= hi + 1e-9:
        out.append(hz)
        hz *= 2.0
    return out


def candidates(root):
    found = []
    for tone in CHORD_TONES[root]:
        found.extend(octaves_between(tone, 360, 1200))
    uniq = []
    for hz in sorted(found):
        if not uniq or abs(hz - uniq[-1]) > 1e-6:
            uniq.append(hz)
    return uniq


def voice_lead(prev, cands, scale_reg=None):
    prev_s = tuple(sorted(prev))
    best = None
    best_key = None
    for comb in itertools.combinations(cands, 3):
        ordered = tuple(sorted(comb))
        dists = tuple(abs(scale_index(a, scale_reg) - scale_index(b, scale_reg)) for a, b in zip(ordered, prev_s))
        key = (sum(dists), dists, ordered)
        if best_key is None or key < best_key:
            best_key = key
            best = ordered
    return list(best)


def bass_hz(root):
    hz = float(root)
    while hz > 300:
        hz /= 2.0
    while hz < 90:
        hz *= 2.0
    return hz


def song_seconds(total_bars, bpm):
    return total_bars * 4 * 60 / bpm


def compose_song(seed: int) -> dict:
    seed = seed & 0xFFFFFFFF
    eng = engine()
    net = eng["net"]
    scale_reg = eng["scale_reg"]
    bpm, pocket_i, motifs = plan(seed, net)
    pocket = "boom-bap" if pocket_i == 0 else "half-time"

    sections = []
    bar = 0

    def add_sec(name, bars):
        nonlocal bar
        sections.append({"name": name, "bar": bar, "bars": bars})
        bar += bars

    add_sec("intro", 4)
    add_sec("verse", 8)
    add_sec("chorus", 8)
    add_sec("verse", 8)
    add_sec("chorus", 8)
    add_sec("bridge", 8)
    add_sec("chorus", 8)
    add_sec("outro", 4)
    total_bars = bar
    events = []

    def add(at, beat, dur, hz, voice, milli):
        events.append({
            "bar": at,
            "beat": beat,
            "durBeats": dur,
            "hz": hz,
            "voice": voice,
            "gain": milli / 1000,
        })

    def lay_tokens(start, rows, milli):
        for i, toks in enumerate(rows):
            if not toks:
                continue
            k = 0
            while k < BARS:
                if toks[k] == REST:
                    k += 1
                    continue
                j = k + 1
                while j < BARS and toks[j] == toks[k]:
                    j += 1
                add(start + i, k * 0.5, (j - k) * 0.5, LEAD[toks[k]], "lead", milli)
                k = j

    def lay_pocket(at, with_snare):
        if pocket_i == 0:
            kicks = (0, 2.5)
            snares = (1, 3)
        else:
            kicks = (0, 1.5)
            snares = (2,)
        for beat in kicks:
            add(at, beat, 0.5, 87, "kick", GAINS["kick"])
        if with_snare:
            for beat in snares:
                add(at, beat, 0.5, 174, "snare", GAINS["snare"])
        for beat in (0, 0.5, 1, 1.5, 2, 2.5, 3):
            add(at, beat, 0.5, 285, "hat", GAINS["hat"])
        add(at, 3.5, 0.5, 285, "openhat", GAINS["openhat"])

    def lay_fill(at):
        add(at, 0, 0.5, 87, "kick", GAINS["kick"])
        for beat in (1, 1.5, 2, 2.5, 3, 3.5):
            add(at, beat, 0.25, 174, "snare", GAINS["snare"])
        for beat in (0.5, 1.5, 2.5):
            add(at, beat, 0.5, 285, "hat", GAINS["hat"])

    def lay_harmony(start, roots, dur, milli):
        voicing = voice_lead((528, 741, 963), candidates(roots[0]), scale_reg)
        for i, root in enumerate(roots):
            cands = candidates(root)
            if i > 0:
                voicing = voice_lead(voicing, cands, scale_reg)
            bar_i = start + (i if dur == 4 else i // 2)
            beat = 0 if dur == 4 else (i % 2) * 2
            for hz in voicing:
                add(bar_i, beat, dur, hz, "chord", milli)
            for b in (0, 2):
                if beat - 1e-9 <= b < beat + dur - 1e-9:
                    add(bar_i, b, 1, bass_hz(root), "bass", GAINS["bass"])

    for section in sections:
        name = section["name"]
        for rel in range(section["bars"]):
            at = section["bar"] + rel
            if name == "bridge":
                continue
            if name == "outro" and rel == section["bars"] - 1:
                add(at, 0, 0.5, 87, "kick", GAINS["kick"])
                add(at, 0, 0.5, 285, "hat", GAINS["hat"])
                add(at, 2, 0.5, 285, "hat", GAINS["hat"])
                continue
            if name in ("verse", "chorus") and rel == section["bars"] - 1:
                lay_fill(at)
                continue
            lay_pocket(at, name != "intro")

    lay_harmony(sections[0]["bar"], INTRO_ROOTS, 4, GAINS["chordIntro"])
    lay_tokens(sections[0]["bar"], intro_bars(motifs[1]), GAINS["leadIntro"])

    lay_harmony(sections[1]["bar"], VERSE_ROOTS * 2, 4, GAINS["chordVerse"])
    lay_tokens(sections[1]["bar"], verse1_bars(motifs[1]), GAINS["leadVerse"])

    lay_harmony(sections[2]["bar"], CHORUS_ROOTS * 4, 2, GAINS["chordChorus"])
    lay_tokens(sections[2]["bar"], chorus_bars(motifs[0]), GAINS["leadChorus"])

    lay_harmony(sections[3]["bar"], VERSE_ROOTS * 2, 4, GAINS["chordVerse"])
    lay_tokens(sections[3]["bar"], verse2_bars(motifs[2]), GAINS["leadVerse"])

    lay_harmony(sections[4]["bar"], CHORUS_ROOTS * 4, 2, GAINS["chordChorus"])
    lay_tokens(sections[4]["bar"], chorus_bars(motifs[0]), GAINS["leadChorus"])

    lay_harmony(sections[5]["bar"], BRIDGE_ROOTS * 2, 4, GAINS["chordBridge"])
    lay_tokens(sections[5]["bar"], bridge_bars(motifs[0]), GAINS["leadBridge"])

    lay_harmony(sections[6]["bar"], CHORUS_ROOTS * 4, 2, GAINS["chordChorus"])
    lay_tokens(sections[6]["bar"], chorus_bars(motifs[0]), GAINS["leadChorus"])

    lay_harmony(sections[7]["bar"], OUTRO_ROOTS, 4, GAINS["chordOutro"])
    lay_tokens(sections[7]["bar"], outro_bars(motifs[0]), GAINS["leadOutro"])

    events.sort(key=lambda e: (e["bar"], e["beat"], e["voice"], e["hz"], e["durBeats"], e["gain"]))
    return {
        "seed": seed,
        "bpm": bpm,
        "meter": "4/4",
        "pocket": pocket,
        "totalBars": total_bars,
        "duration": song_seconds(total_bars, bpm),
        "centerHz": CENTER,
        "motifs": motifs,
        "sections": sections,
        "events": events,
    }


def allowed_hz(hz) -> bool:
    for pitch in PITCHES:
        ratio = hz / pitch
        if ratio <= 0:
            continue
        k = round(math.log2(ratio))
        if -4 <= k <= 4 and abs(ratio - (2 ** k)) < 1e-6:
            return True
    return False


def family(hz):
    for pitch in PITCHES:
        ratio = hz / pitch
        if ratio <= 0:
            continue
        k = round(math.log2(ratio))
        if -4 <= k <= 4 and abs(ratio - (2 ** k)) < 1e-6:
            return pitch
    return None


def is_center(hz) -> bool:
    return family(hz) == CENTER


def on_grid(value) -> bool:
    return abs(value * 4 - round(value * 4)) < 1e-9


def start_beat(event) -> float:
    return event["bar"] * 4 + event["beat"]


def end_beat(event) -> float:
    return start_beat(event) + event["durBeats"]


def lead_grid(song, section):
    grid = [REST] * (section["bars"] * BARS)
    for event in song["events"]:
        if event["voice"] != "lead":
            continue
        if not (section["bar"] <= event["bar"] < section["bar"] + section["bars"]):
            continue
        start = (event["bar"] - section["bar"]) * BARS + int(round(event["beat"] * 2))
        steps = int(round(event["durBeats"] * 2))
        deg = LEAD.index(event["hz"])
        for s in range(steps):
            grid[start + s] = deg
    return grid


def bars_of(grid):
    return [grid[i * BARS:(i + 1) * BARS] for i in range(len(grid) // BARS)]


def rel_events(song, section, voices):
    rows = []
    for event in song["events"]:
        if event["voice"] not in voices:
            continue
        if not (section["bar"] <= event["bar"] < section["bar"] + section["bars"]):
            continue
        rows.append((
            event["bar"] - section["bar"],
            event["beat"],
            event["durBeats"],
            event["hz"],
            event["voice"],
            event["gain"],
        ))
    return rows


def check_song(song) -> None:
    if song["meter"] != "4/4":
        raise AssertionError("meter")
    if not 78 <= song["bpm"] <= 100:
        raise AssertionError(song["bpm"])
    if song["totalBars"] != 56:
        raise AssertionError(song["totalBars"])
    dur = song["duration"]
    if abs(dur - song_seconds(56, song["bpm"])) > 1e-9:
        raise AssertionError("duration")
    if not 134 <= dur <= 173:
        raise AssertionError(dur)
    names = [section["name"] for section in song["sections"]]
    if names != ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"]:
        raise AssertionError(names)
    expect = [4, 8, 8, 8, 8, 8, 8, 4]
    if [section["bars"] for section in song["sections"]] != expect:
        raise AssertionError("form")
    if song["pocket"] not in ("boom-bap", "half-time"):
        raise AssertionError(song["pocket"])
    bpm, pocket_i, motifs = plan(song["seed"])
    if song["bpm"] != bpm or song["motifs"] != motifs:
        raise AssertionError("plan drifted")
    if ("boom-bap" if pocket_i == 0 else "half-time") != song["pocket"]:
        raise AssertionError("pocket")
    for motif in motifs:
        if len(motif) != 8:
            raise AssertionError("motif length")
        if sum(1 for t in motif if t != REST) < 3:
            raise AssertionError("motif empty")
    if lead_grid(song, song["sections"][2]) != [n for row in chorus_bars(motifs[0]) for n in row]:
        raise AssertionError("chorus is not the motif")
    if lead_grid(song, song["sections"][4]) != lead_grid(song, song["sections"][2]):
        raise AssertionError("chorus melody changed")
    if lead_grid(song, song["sections"][6]) != lead_grid(song, song["sections"][2]):
        raise AssertionError("chorus melody changed")
    if lead_grid(song, song["sections"][1]) != [n for row in verse1_bars(motifs[1]) for n in row]:
        raise AssertionError("verse 1")
    if lead_grid(song, song["sections"][3]) != [n for row in verse2_bars(motifs[2]) for n in row]:
        raise AssertionError("verse 2")
    if lead_grid(song, song["sections"][5]) != [n for row in bridge_bars(motifs[0]) for n in row]:
        raise AssertionError("bridge fragment")
    if lead_grid(song, song["sections"][0]) != [n for row in intro_bars(motifs[1]) for n in (row or [REST] * 8)]:
        raise AssertionError("intro")
    if lead_grid(song, song["sections"][7]) != [n for row in outro_bars(motifs[0]) for n in row]:
        raise AssertionError("outro")
    chorus_rows = bars_of(lead_grid(song, song["sections"][2]))
    if chorus_rows[0] != motifs[0] or chorus_rows[2] != motifs[0]:
        raise AssertionError("hook restatement")
    if chorus_rows[1] != seq_up(motifs[0]) or chorus_rows[4:] != chorus_rows[:4]:
        raise AssertionError("hook sequence")
    drums = ("kick", "snare", "hat", "openhat")
    verses = [section for section in song["sections"] if section["name"] == "verse"]
    choruses = [section for section in song["sections"] if section["name"] == "chorus"]
    if rel_events(song, verses[0], drums) != rel_events(song, verses[1], drums):
        raise AssertionError("verse drums")
    d0 = rel_events(song, choruses[0], drums + ("bass", "chord", "lead"))
    if rel_events(song, choruses[1], drums + ("bass", "chord", "lead")) != d0:
        raise AssertionError("chorus 2")
    if rel_events(song, choruses[2], drums + ("bass", "chord", "lead")) != d0:
        raise AssertionError("chorus 3")
    bridge = song["sections"][5]
    if any(event["voice"] in drums and bridge["bar"] <= event["bar"] < bridge["bar"] + bridge["bars"] for event in song["events"]):
        raise AssertionError("bridge drums")
    verse_snare = {}
    for event in song["events"]:
        if event["voice"] == "snare" and verses[0]["bar"] <= event["bar"] < verses[0]["bar"] + verses[0]["bars"]:
            verse_snare.setdefault(event["bar"] - verses[0]["bar"], 0)
            verse_snare[event["bar"] - verses[0]["bar"]] += 1
    if verse_snare.get(7, 0) <= verse_snare.get(0, 0):
        raise AssertionError("fill")
    scale_reg = build_scale_reg()
    for event in song["events"]:
        if not allowed_hz(event["hz"]):
            raise AssertionError(f"hz {event['hz']}")
        if event["gain"] <= 0:
            raise AssertionError("gain")
        if not on_grid(event["beat"]) or not on_grid(event["durBeats"]):
            raise AssertionError("grid")
        if event["voice"] == "lead" and event["hz"] not in LEAD:
            raise AssertionError("lead hz")
    leads = [event for event in song["events"] if event["voice"] == "lead"]
    leads.sort(key=start_beat)
    for i in range(1, len(leads)):
        ratio = max(leads[i]["hz"], leads[i - 1]["hz"]) / min(leads[i]["hz"], leads[i - 1]["hz"])
        if ratio > 2 + 1e-9:
            raise AssertionError("leap")
    # Chord voices take the smallest joint step on the register.
    max_step = 0
    for section in song["sections"]:
        groups = {}
        for event in song["events"]:
            if event["voice"] != "chord":
                continue
            if not (section["bar"] <= event["bar"] < section["bar"] + section["bars"]):
                continue
            key = (event["bar"], event["beat"])
            groups.setdefault(key, []).append(event["hz"])
        keys = sorted(groups)
        for a, b in zip(keys, keys[1:]):
            left = tuple(sorted(groups[a]))
            right = tuple(sorted(groups[b]))
            for x, y in zip(left, right):
                step = abs(scale_index(x, scale_reg) - scale_index(y, scale_reg))
                if step > max_step:
                    max_step = step
    if max_step > 5:
        raise AssertionError(f"voice leading {max_step}")
    last = max(leads, key=end_beat)
    if last["hz"] not in (528, 1056):
        raise AssertionError(f"end {last['hz']}")
    total_beats = song["totalBars"] * 4
    ending = [
        event for event in song["events"]
        if start_beat(event) < total_beats - 1e-9 and end_beat(event) >= total_beats - 1e-9
    ]
    if not any(is_center(event["hz"]) for event in ending):
        raise AssertionError("center is not sounding")
    top = max(event["gain"] for event in song["events"])
    if abs(top - GAINS["leadChorus"] / 1000) > 1e-12:
        raise AssertionError("chorus lead is not the loudest")
    # Bass on beats 1 and 3, and only the root of the chord sounding there.
    for event in song["events"]:
        if event["voice"] == "bass" and event["beat"] not in (0, 2):
            raise AssertionError("bass beat")
    if song["centerHz"] != CENTER:
        raise AssertionError("center")


def self_test() -> None:
    eng = engine()
    if not eng["loss_end"] < eng["loss_start"] * 0.5:
        raise AssertionError(f"loss did not drop {eng['loss_start']} -> {eng['loss_end']}")
    if eng["params"] < 1000:
        raise AssertionError("params")
    if 528 / 396 != 4 / 3 or 852 / 639 != 4 / 3:
        raise AssertionError("fourths")
    near = cents(963 / 639)
    sharp = near - cents(3 / 2)
    if not 8 < sharp < 8.2:
        raise AssertionError(sharp)
    for seed in range(24):
        song = compose_song(seed)
        if song != compose_song(seed):
            raise AssertionError(f"unstable {seed}")
        check_song(song)
    if compose_song(1)["motifs"] == compose_song(2)["motifs"] and compose_song(1)["bpm"] == compose_song(2)["bpm"]:
        raise AssertionError("seed ignored")
    check_song(compose_song(4294967295))
    print("solfeggio-compose.py: pass")
    print(f"gru loss {eng['loss_start']:.6f} -> {eng['loss_end']:.6f}  params {eng['params']}")
    song = compose_song(1)
    print(f"seed 1 bpm {song['bpm']} pocket {song['pocket']} bars {song['totalBars']} duration {song['duration']:.3f}s")
    print(f"motifs {song['motifs']}")


def report(song) -> None:
    print(f"seed {song['seed']} bpm {song['bpm']} pocket {song['pocket']} bars {song['totalBars']} duration {song['duration']:.3f}s")
    for section in song["sections"]:
        print(f"  {section['name']:8} bar {section['bar']:3} bars {section['bars']}")
    print(f"motifs {song['motifs']}")
    print(f"events {len(song['events'])}")


def render_mjs() -> str:
    eng = engine()
    net = eng["net"]
    fourth = cents(4 / 3)
    fifth = cents(3 / 2)
    near = cents(963 / 639)
    sharp = near - fifth

    def bake(value: float) -> str:
        return format(value, ".17g")

    def dump(value):
        return json.dumps(value)

    text = JS_TEMPLATE
    repl = {
        "__FOURTH__": bake(fourth),
        "__FIFTH__": bake(fifth),
        "__NEAR__": bake(near),
        "__SHARP__": bake(sharp),
        "__LOSS_START__": bake(eng["loss_start"]),
        "__LOSS_END__": bake(eng["loss_end"]),
        "__PARAMS__": str(eng["params"]),
        "__Q__": str(Q),
        "__H__": str(H),
        "__REST__": str(REST),
        "__START__": str(START),
        "__SIG_LO__": str(SIG_LO),
        "__LEAD__": dump(LEAD),
        "__SCALE_REG__": dump(eng["scale_reg"]),
        "__EMB__": dump(net["emb"]),
        "__WX_R__": dump(net["Wx_r"]),
        "__WH_R__": dump(net["Wh_r"]),
        "__BR__": dump(net["br"]),
        "__WX_Z__": dump(net["Wx_z"]),
        "__WH_Z__": dump(net["Wh_z"]),
        "__BZ__": dump(net["bz"]),
        "__WX_N__": dump(net["Wx_n"]),
        "__WH_N__": dump(net["Wh_n"]),
        "__BN__": dump(net["bn"]),
        "__BH__": dump(net["bh"]),
        "__WO__": dump(net["Wo"]),
        "__BO__": dump(net["bo"]),
        "__SIG__": dump(net["sig"]),
        "__TANH__": dump(net["tanh"]),
        "__EXP__": dump(net["exp"]),
        "__GAINS__": dump(GAINS),
        "__VERSE__": dump(VERSE_ROOTS),
        "__CHORUS_ROOTS__": dump(CHORUS_ROOTS),
        "__BRIDGE_ROOTS__": dump(BRIDGE_ROOTS),
        "__INTRO_ROOTS__": dump(INTRO_ROOTS),
        "__OUTRO_ROOTS__": dump(OUTRO_ROOTS),
        "__TONES__": dump({str(k): v for k, v in CHORD_TONES.items()}),
    }
    for key, value in repl.items():
        text = text.replace(key, value)
    if not text.endswith("\n"):
        text += "\n"
    return text


def emit(path: Path) -> None:
    path.write_text(render_mjs(), encoding="utf-8")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Compose a Solfeggio song from a seed.")
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--json", dest="json_path")
    parser.add_argument("--emit", dest="emit_path")
    parser.add_argument("--batch", help="Comma-separated seeds. Prints a JSON array.")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--no-emit", action="store_true")
    args = parser.parse_args(argv)

    if args.check:
        self_test()
        fresh = render_mjs()
        disk = MJS_PATH.read_text(encoding="utf-8") if MJS_PATH.exists() else ""
        if fresh != disk:
            raise SystemExit("utils/solfeggio-compose.mjs does not match a fresh emit")
        print("mjs matches emit")
        return 0
    if args.batch:
        seeds = [int(part, 10) for part in args.batch.split(",") if part != ""]
        json.dump([compose_song(seed) for seed in seeds], sys.stdout)
        sys.stdout.write("\n")
        return 0
    if args.emit_path:
        emit(Path(args.emit_path))
        return 0
    if args.json_path or args.no_emit:
        song = compose_song(args.seed)
        report(song)
        if args.json_path:
            Path(args.json_path).write_text(json.dumps(song), encoding="utf-8")
            print(f"wrote {args.json_path}")
        return 0
    self_test()
    emit(MJS_PATH)
    song = compose_song(1)
    report(song)
    print(f"wrote {MJS_PATH}")
    return 0


JS_TEMPLATE = r"""/**
 * Generated by scripts/solfeggio-compose.py — do not edit by hand.
 * The lead is sampled from a one-layer GRU trained on one-bar solfeggio
 * motifs (MelodyRNN next-event model, GRU cell). Same seed, same score.
 * Not a therapy.
 *
 * 528/396 and 852/639 are exactly 4/3.
 * 963/639 is __SHARP__ cents sharp of 3/2.
 * GRU loss __LOSS_START__ -> __LOSS_END__. Parameters __PARAMS__.
 */

export const CENTER_HZ = 528
export const PIECE_FOURTH_CENTS = __FOURTH__
export const PIECE_FIFTH_CENTS = __FIFTH__
export const PIECE_NEAR_FIFTH_CENTS = __NEAR__
export const PIECE_NEAR_FIFTH_SHARP_CENTS = __SHARP__
export const ENGINE_LOSS_START = __LOSS_START__
export const ENGINE_LOSS_END = __LOSS_END__
export const ENGINE_PARAMS = __PARAMS__
export const ENGINE_H = __H__
export const ENGINE_REST = __REST__
export const ENGINE_START = __START__

const Q = __Q__
const H = __H__
const REST = __REST__
const START = __START__
const SIG_LO = __SIG_LO__
const LEAD = Object.freeze(__LEAD__)
const SCALE_REG = Object.freeze(__SCALE_REG__)
const EMB = Object.freeze(__EMB__)
const WX_R = Object.freeze(__WX_R__)
const WH_R = Object.freeze(__WH_R__)
const BR = Object.freeze(__BR__)
const WX_Z = Object.freeze(__WX_Z__)
const WH_Z = Object.freeze(__WH_Z__)
const BZ = Object.freeze(__BZ__)
const WX_N = Object.freeze(__WX_N__)
const WH_N = Object.freeze(__WH_N__)
const BN = Object.freeze(__BN__)
const BH = Object.freeze(__BH__)
const WO = Object.freeze(__WO__)
const BO = Object.freeze(__BO__)
const SIG = Object.freeze(__SIG__)
const TANH = Object.freeze(__TANH__)
const EXP = Object.freeze(__EXP__)
const GAINS = Object.freeze(__GAINS__)
const VERSE_ROOTS = Object.freeze(__VERSE__)
const CHORUS_ROOTS = Object.freeze(__CHORUS_ROOTS__)
const BRIDGE_ROOTS = Object.freeze(__BRIDGE_ROOTS__)
const INTRO_ROOTS = Object.freeze(__INTRO_ROOTS__)
const OUTRO_ROOTS = Object.freeze(__OUTRO_ROOTS__)
const TONES = Object.freeze(__TONES__)

function makeRng(seed) {
  let a = seed >>> 0
  function nextU32() {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return (t ^ (t >>> 14)) >>> 0
  }
  return {
    below(n) {
      return nextU32() % n
    },
  }
}

function lut(table, pre) {
  let x = pre
  if (x < SIG_LO) x = SIG_LO
  else if (x > -SIG_LO) x = -SIG_LO
  return table[x - SIG_LO]
}

function dot(W, vec) {
  const out = []
  for (let i = 0; i < W.length; i++) {
    const row = W[i]
    let acc = 0
    for (let k = 0; k < row.length; k++) acc += row[k] * vec[k]
    out.push(Math.floor(acc / Q))
  }
  return out
}

function add3(a, b, c) {
  const out = []
  for (let i = 0; i < a.length; i++) out.push(a[i] + b[i] + c[i])
  return out
}

export function gruStep(h, tok) {
  const emb = EMB[tok]
  const rPre = add3(dot(WX_R, emb), dot(WH_R, h), BR)
  const zPre = add3(dot(WX_Z, emb), dot(WH_Z, h), BZ)
  const r = rPre.map((p) => lut(SIG, p))
  const z = zPre.map((p) => lut(SIG, p))
  const wh = dot(WH_N, h)
  const xh = wh.map((v, i) => v + BH[i])
  const wx = dot(WX_N, emb)
  const xn = wx.map((v, i) => v + BN[i] + Math.floor((r[i] * xh[i]) / Q))
  const n = xn.map((p) => lut(TANH, p))
  const h2 = z.map((zi, i) => Math.floor(((Q - zi) * n[i] + zi * h[i]) / Q))
  const wo = dot(WO, h2)
  const logits = wo.map((v, i) => v + BO[i])
  return { h: h2, logits }
}

export function tokenWeights(logits) {
  const scaled = logits.map((v) => Math.floor((v * 3) / 4))
  let peak = scaled[0]
  for (let i = 1; i < scaled.length; i++) if (scaled[i] > peak) peak = scaled[i]
  const weights = []
  for (let i = 0; i < scaled.length; i++) {
    const d = peak - scaled[i]
    weights.push(d >= EXP.length ? 1 : EXP[d])
  }
  return weights
}

function drawToken(logits, rng) {
  const weights = tokenWeights(logits)
  let total = 0
  for (let i = 0; i < weights.length; i++) total += weights[i]
  const u = rng.below(total)
  let acc = 0
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i]
    if (u < acc) return i
  }
  return weights.length - 1
}

function sampleMotif(rng) {
  let last = [0, 0, 0, 0, 0, 0, 0, 0]
  for (let attempt = 0; attempt < 6; attempt++) {
    let h = []
    for (let i = 0; i < H; i++) h.push(0)
    let x = START
    const toks = []
    for (let step = 0; step < 8; step++) {
      const out = gruStep(h, x)
      h = out.h
      const tok = drawToken(out.logits, rng)
      toks.push(tok)
      x = tok
    }
    last = toks
    let notes = 0
    for (let i = 0; i < toks.length; i++) if (toks[i] !== REST) notes += 1
    if (notes >= 3) return toks
  }
  return last
}

function seqUp(toks) {
  return toks.map((t) => (t === REST ? REST : Math.min(8, t + 1)))
}

function seqDown(toks) {
  return toks.map((t) => (t === REST ? REST : Math.max(0, t - 1)))
}

function invertMotif(toks) {
  return toks.map((t) => (t === REST ? REST : 8 - t))
}

function fragment(toks) {
  return toks.slice(0, 4).concat([REST, REST, REST, REST])
}

function chorusBars(motif) {
  const stated = motif.slice()
  const sequenced = seqUp(motif)
  const hook = [stated, sequenced, stated, sequenced]
  return hook.concat(hook)
}

function verse1Bars(motif) {
  const inv = invertMotif(motif)
  return [motif.slice(), inv, motif.slice(), seqUp(motif), inv, seqUp(inv), motif.slice(), inv]
}

function verse2Bars(motif) {
  const frag = fragment(motif)
  const inv = invertMotif(motif)
  return [motif.slice(), seqUp(motif), inv, motif.slice(), frag, seqUp(frag), inv, motif.slice()]
}

function bridgeBars(motif) {
  const frag = fragment(motif)
  return [frag, seqUp(frag), frag, invertMotif(frag), frag, seqUp(frag), invertMotif(frag), frag]
}

function introBars(motif) {
  const frag = fragment(motif)
  return [null, null, frag, seqUp(frag)]
}

function outroBars(motif) {
  const frag = fragment(motif)
  return [frag, invertMotif(frag), seqDown(frag), [0, 0, 0, 0, 0, 0, 0, 0]]
}

function scaleIndex(hz) {
  for (let i = 0; i < SCALE_REG.length; i++) {
    if (Math.abs(SCALE_REG[i] - hz) < 1e-6) return i
  }
  throw new Error('hz ' + hz)
}

function octavesBetween(base, lo, hi) {
  let hz = base
  while (hz < lo) hz *= 2
  const out = []
  while (hz <= hi + 1e-9) {
    out.push(hz)
    hz *= 2
  }
  return out
}

function candidates(root) {
  const tones = TONES[String(root)]
  const found = []
  for (let i = 0; i < tones.length; i++) {
    const extra = octavesBetween(tones[i], 360, 1200)
    for (let k = 0; k < extra.length; k++) found.push(extra[k])
  }
  found.sort((a, b) => a - b)
  const uniq = []
  for (let i = 0; i < found.length; i++) {
    if (!uniq.length || Math.abs(found[i] - uniq[uniq.length - 1]) > 1e-6) uniq.push(found[i])
  }
  return uniq
}

function voiceLead(prev, cands) {
  const prevS = prev.slice().sort((a, b) => a - b)
  let best = null
  let bestKey = null
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      for (let k = j + 1; k < cands.length; k++) {
        const ordered = [cands[i], cands[j], cands[k]].sort((a, b) => a - b)
        const dists = [
          Math.abs(scaleIndex(ordered[0]) - scaleIndex(prevS[0])),
          Math.abs(scaleIndex(ordered[1]) - scaleIndex(prevS[1])),
          Math.abs(scaleIndex(ordered[2]) - scaleIndex(prevS[2])),
        ]
        const key = [dists[0] + dists[1] + dists[2], dists[0], dists[1], dists[2], ordered[0], ordered[1], ordered[2]]
        if (bestKey === null || cmpKey(key, bestKey) < 0) {
          bestKey = key
          best = ordered
        }
      }
    }
  }
  return best
}

function cmpKey(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return -1
    if (a[i] > b[i]) return 1
  }
  return 0
}

function bassHz(root) {
  let hz = root
  while (hz > 300) hz /= 2
  while (hz < 90) hz *= 2
  return hz
}

function songSeconds(totalBars, bpm) {
  return totalBars * 4 * 60 / bpm
}

/**
 * @param {number} seed
 */
export function composeSong(seed) {
  const seed32 = seed >>> 0
  const rng = makeRng(seed32)
  const bpm = 78 + rng.below(23)
  const pocketI = rng.below(2)
  const motifs = [sampleMotif(rng), sampleMotif(rng), sampleMotif(rng)]
  const pocket = pocketI === 0 ? 'boom-bap' : 'half-time'
  const sections = []
  let bar = 0
  function addSec(name, bars) {
    sections.push({ name, bar, bars })
    bar += bars
  }
  addSec('intro', 4)
  addSec('verse', 8)
  addSec('chorus', 8)
  addSec('verse', 8)
  addSec('chorus', 8)
  addSec('bridge', 8)
  addSec('chorus', 8)
  addSec('outro', 4)
  const totalBars = bar
  const events = []

  function add(at, beat, dur, hz, voice, milli) {
    events.push({
      bar: at,
      beat,
      durBeats: dur,
      hz,
      voice,
      gain: milli / 1000,
    })
  }

  function layTokens(start, rows, milli) {
    for (let i = 0; i < rows.length; i++) {
      const toks = rows[i]
      if (!toks) continue
      let k = 0
      while (k < 8) {
        if (toks[k] === REST) {
          k += 1
          continue
        }
        let j = k + 1
        while (j < 8 && toks[j] === toks[k]) j += 1
        add(start + i, k * 0.5, (j - k) * 0.5, LEAD[toks[k]], 'lead', milli)
        k = j
      }
    }
  }

  function layPocket(at, withSnare) {
    const kicks = pocketI === 0 ? [0, 2.5] : [0, 1.5]
    const snares = pocketI === 0 ? [1, 3] : [2]
    for (let i = 0; i < kicks.length; i++) add(at, kicks[i], 0.5, 87, 'kick', GAINS.kick)
    if (withSnare) {
      for (let i = 0; i < snares.length; i++) add(at, snares[i], 0.5, 174, 'snare', GAINS.snare)
    }
    const hats = [0, 0.5, 1, 1.5, 2, 2.5, 3]
    for (let i = 0; i < hats.length; i++) add(at, hats[i], 0.5, 285, 'hat', GAINS.hat)
    add(at, 3.5, 0.5, 285, 'openhat', GAINS.openhat)
  }

  function layFill(at) {
    add(at, 0, 0.5, 87, 'kick', GAINS.kick)
    const rolls = [1, 1.5, 2, 2.5, 3, 3.5]
    for (let i = 0; i < rolls.length; i++) add(at, rolls[i], 0.25, 174, 'snare', GAINS.snare)
    const hats = [0.5, 1.5, 2.5]
    for (let i = 0; i < hats.length; i++) add(at, hats[i], 0.5, 285, 'hat', GAINS.hat)
  }

  function layHarmony(start, roots, dur, milli) {
    let voicing = voiceLead([528, 741, 963], candidates(roots[0]))
    for (let i = 0; i < roots.length; i++) {
      const cands = candidates(roots[i])
      if (i > 0) voicing = voiceLead(voicing, cands)
      const barI = start + (dur === 4 ? i : Math.floor(i / 2))
      const beat = dur === 4 ? 0 : (i % 2) * 2
      for (let v = 0; v < voicing.length; v++) add(barI, beat, dur, voicing[v], 'chord', milli)
      for (const b of [0, 2]) {
        if (b >= beat - 1e-9 && b < beat + dur - 1e-9) add(barI, b, 1, bassHz(roots[i]), 'bass', GAINS.bass)
      }
    }
  }

  for (let s = 0; s < sections.length; s++) {
    const section = sections[s]
    for (let rel = 0; rel < section.bars; rel++) {
      const at = section.bar + rel
      if (section.name === 'bridge') continue
      if (section.name === 'outro' && rel === section.bars - 1) {
        add(at, 0, 0.5, 87, 'kick', GAINS.kick)
        add(at, 0, 0.5, 285, 'hat', GAINS.hat)
        add(at, 2, 0.5, 285, 'hat', GAINS.hat)
        continue
      }
      if ((section.name === 'verse' || section.name === 'chorus') && rel === section.bars - 1) {
        layFill(at)
        continue
      }
      layPocket(at, section.name !== 'intro')
    }
  }

  layHarmony(sections[0].bar, INTRO_ROOTS, 4, GAINS.chordIntro)
  layTokens(sections[0].bar, introBars(motifs[1]), GAINS.leadIntro)
  layHarmony(sections[1].bar, VERSE_ROOTS.concat(VERSE_ROOTS), 4, GAINS.chordVerse)
  layTokens(sections[1].bar, verse1Bars(motifs[1]), GAINS.leadVerse)
  const chorusLoop = CHORUS_ROOTS.concat(CHORUS_ROOTS, CHORUS_ROOTS, CHORUS_ROOTS)
  layHarmony(sections[2].bar, chorusLoop, 2, GAINS.chordChorus)
  layTokens(sections[2].bar, chorusBars(motifs[0]), GAINS.leadChorus)
  layHarmony(sections[3].bar, VERSE_ROOTS.concat(VERSE_ROOTS), 4, GAINS.chordVerse)
  layTokens(sections[3].bar, verse2Bars(motifs[2]), GAINS.leadVerse)
  layHarmony(sections[4].bar, chorusLoop, 2, GAINS.chordChorus)
  layTokens(sections[4].bar, chorusBars(motifs[0]), GAINS.leadChorus)
  layHarmony(sections[5].bar, BRIDGE_ROOTS.concat(BRIDGE_ROOTS), 4, GAINS.chordBridge)
  layTokens(sections[5].bar, bridgeBars(motifs[0]), GAINS.leadBridge)
  layHarmony(sections[6].bar, chorusLoop, 2, GAINS.chordChorus)
  layTokens(sections[6].bar, chorusBars(motifs[0]), GAINS.leadChorus)
  layHarmony(sections[7].bar, OUTRO_ROOTS, 4, GAINS.chordOutro)
  layTokens(sections[7].bar, outroBars(motifs[0]), GAINS.leadOutro)

  events.sort((a, b) => (
    a.bar - b.bar
    || a.beat - b.beat
    || (a.voice < b.voice ? -1 : a.voice > b.voice ? 1 : 0)
    || a.hz - b.hz
    || a.durBeats - b.durBeats
    || a.gain - b.gain
  ))

  return {
    seed: seed32,
    bpm,
    meter: '4/4',
    pocket,
    totalBars,
    duration: songSeconds(totalBars, bpm),
    centerHz: CENTER_HZ,
    motifs,
    sections,
    events,
  }
}
"""


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
