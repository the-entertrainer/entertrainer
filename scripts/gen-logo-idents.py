#!/usr/bin/env python3
"""Opening sound for the Entertrainer preloader.

The site ships ONE brand opening ident:

  public/audio/idents/opening.mp3

Source (Pixabay Content License — attribution appreciated):
  "Digital Vibe (Podcast Intro Ident)" by Diamond_Tunes
  https://pixabay.com/sound-effects/musical-digital-vibe-podcast-intro-ident-180005/

Re-encode / re-trim (from a fresh Pixabay download saved as /tmp/px-ident.mp3):

  ffmpeg -y -i /tmp/px-ident.mp3 -t 3.35 \\
    -af "afade=t=in:st=0:d=0.02,afade=t=out:st=3.05:d=0.3" \\
    -codec:a libmp3lame -b:a 256k -ar 44100 -ac 2 \\
    public/audio/idents/opening.mp3

Settings persist openingSound as "on" | "off" only (legacy ident ids migrate to "on").
Lyria / multi-ident scipy synth paths are retired — do not regenerate soft-chime etc.
"""
from __future__ import annotations

import sys


def main() -> None:
    print(__doc__)
    print("Nothing to generate — opening.mp3 is the Pixabay brand ident.")
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
