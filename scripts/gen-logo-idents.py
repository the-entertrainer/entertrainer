#!/usr/bin/env python3
"""Generate HQ cinematic sonic-logo idents for the Entertrainer preloader.

Preferred pipeline (when Lyria quota exists):
  1. Google Lyria via Gemini API — model `lyria-3-clip-preview` (30s clip).
     Docs: https://ai.google.dev/gemini-api/docs/music-generation
     Requires GEMINI_API_KEY. Prompt: instrumental-only premium brand sonic logo
     (Netflix-ta-dum ambition, original), cream/yellow editorial learning brand,
     NO vocals/lyrics/8-bit/chiptune/synthwave square waves.
  2. Trim/fade with ffmpeg to the ~3.0–3.4s preloader sync window, keeping the
     strongest opening phrase that matches the sync map below.
  3. Encode 44.1 kHz stereo MP3 at ~224 kbps into public/audio/idents/*.mp3.

Current default (Lyria free-tier lyria-3-clip quota is 0 on this key):
  Multi-layer cinematic scipy/numpy synthesizer + Inspiration/sounds/*.ogg grain,
  mixed and encoded with ffmpeg. Still NOT chiptune — soft sine/pad stacks,
  FM glass/bells, filtered noise whooshes, warm sub, exponential-decay reverb IR,
  soft limiter. Set FORCE_LYRIA=1 to attempt the API path when quota returns.

Preloader sync map (hits the visual choreography in components/ed/Preloader.vue):
  0 ms              tap/impact (user gesture unlocks audio)
  0 / 110 / 220 / 330 ms  cascading yellow rings
  ~540 ms           wordmark "entertrainer" — main melodic resolve / warm swell
  ~1480–3200 ms     soft breathe / sustain, clean resolve before fade-out
  Visual finish ~3250 ms then 300 ms opacity leave; usable audio ~3.25 s.

Settings IDs/labels (stable — do not rename):
  soft-chime, warm-pulse, bright-spark, deep-note, quiet-hush, glass-tap

Usage:
  python3 scripts/gen-logo-idents.py
  # needs: numpy, scipy, ffmpeg on PATH
"""
from __future__ import annotations

import os
import subprocess
import sys
import wave
from pathlib import Path

# Allow `python scripts/gen-logo-idents.py` without installing a package.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from _ident_dsp import DUR, SR, fade_edges, soft_limiter  # noqa: E402
from _ident_voices import IDENTS  # noqa: E402

OUT_DIR = Path(__file__).resolve().parents[1] / "public" / "audio" / "idents"


def write_wav_stereo(path: Path, st) -> None:
    import numpy as np

    pcm = (np.clip(st, -1.0, 1.0).T * 32767.0).astype("int16")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def encode_mp3(wav_path: Path, mp3_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(wav_path),
            "-codec:a", "libmp3lame", "-b:a", "224k",
            "-ar", "44100", "-ac", "2",
            str(mp3_path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def try_lyria() -> bool:
    """Attempt Lyria clip generation. Returns True only if files were written.

    Documented for when free-tier quota returns. Skipped unless FORCE_LYRIA=1
    because lyria-3-clip currently reports HTTP 429 (quota 0) on this key.
    """
    if os.environ.get("FORCE_LYRIA") != "1":
        print(
            "Lyria: skipped (set FORCE_LYRIA=1 to retry). "
            "Using cinematic scipy + Inspiration texture fallback."
        )
        return False
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("Lyria: FORCE_LYRIA=1 but GEMINI_API_KEY missing — fallback.")
        return False
    try:
        from google import genai  # type: ignore
    except ImportError:
        print("Lyria: google-genai not installed — fallback.")
        return False

    # When quota exists: client.interactions.create(model="lyria-3-clip-preview",
    # input=prompt) → decode audio → ffmpeg trim/fade to ~3.25s sync window.
    print("Lyria: attempting lyria-3-clip-preview (may 429)…")
    prompts = {
        "soft-chime": (
            "Instrumental only, no vocals no lyrics. Premium brand sonic logo, "
            "Netflix ta-dum quality ambition but original. Warm glass bells and "
            "cream editorial chimes for a yellow learning brand called Entertrainer. "
            "Not 8-bit, not chiptune, not synthwave square waves. Short 3 second sting "
            "with cascading hits then warm major resolve."
        ),
        "warm-pulse": (
            "Instrumental only. Soft human pads and low warm pulse brand sting, "
            "premium sonic logo, cream editorial learning brand. No vocals, no chiptune."
        ),
        "bright-spark": (
            "Instrumental only. Crisp modern confident sparkle sting, premium brand "
            "sonic logo. No vocals, no 8-bit chiptune."
        ),
        "deep-note": (
            "Instrumental only. Cinematic deep bass resolve brand logo, warm and "
            "premium. No vocals, no chiptune."
        ),
        "quiet-hush": (
            "Instrumental only. Airy intimate whispered texture brand sting, soft "
            "and premium. No vocals, no chiptune."
        ),
        "glass-tap": (
            "Instrumental only. Clear glass and wood taps blooming into harmony, "
            "premium brand sonic logo. No vocals, no chiptune."
        ),
    }
    try:
        client = genai.Client(api_key=key)
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        for name, prompt in prompts.items():
            interaction = client.interactions.create(
                model="lyria-3-clip-preview",
                input=prompt,
            )
            audio = getattr(interaction, "output_audio", None)
            if audio is None:
                print(f"Lyria: no audio for {name} — aborting to fallback.")
                return False
            raw = OUT_DIR / f"{name}-lyria-raw.mp3"
            # output_audio may be bytes or a part with .data
            data = audio if isinstance(audio, (bytes, bytearray)) else getattr(audio, "data", None)
            if data is None:
                print(f"Lyria: empty audio for {name} — fallback.")
                return False
            if isinstance(data, str):
                import base64
                data = base64.b64decode(data)
            raw.write_bytes(data)
            mp3 = OUT_DIR / f"{name}.mp3"
            # Keep strongest opening ~3.25s with 8ms in / 300ms out fade
            subprocess.run(
                [
                    "ffmpeg", "-y", "-i", str(raw),
                    "-t", "3.25",
                    "-af", "afade=t=in:st=0:d=0.008,afade=t=out:st=2.95:d=0.3",
                    "-codec:a", "libmp3lame", "-b:a", "224k",
                    "-ar", "44100", "-ac", "2",
                    str(mp3),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            raw.unlink(missing_ok=True)
            print(f"Lyria: wrote {mp3}")
        return True
    except Exception as exc:  # noqa: BLE001 — any quota/auth/shape error → fallback
        print(f"Lyria failed ({exc!r}) — using cinematic fallback.")
        return False


def render_fallback() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Fallback synthesizer → {OUT_DIR} ({DUR:.2f}s @ {SR}Hz stereo 224k)")
    for name, gen in IDENTS.items():
        print(f"  rendering {name}…", flush=True)
        st = soft_limiter(fade_edges(gen(), in_ms=6, out_ms=300), 0.93)
        wav = OUT_DIR / f"{name}.wav"
        mp3 = OUT_DIR / f"{name}.mp3"
        write_wav_stereo(wav, st)
        encode_mp3(wav, mp3)
        wav.unlink(missing_ok=True)
        probe = subprocess.check_output(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration,size",
                "-of", "default=noprint_wrappers=1",
                str(mp3),
            ],
            text=True,
        )
        print(f"  {name}: {probe.strip().replace(chr(10), ', ')}")


def main() -> None:
    if try_lyria():
        return
    render_fallback()


if __name__ == "__main__":
    main()
