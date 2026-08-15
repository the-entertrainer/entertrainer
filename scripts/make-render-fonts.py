#!/usr/bin/env python3
"""
Builds the font directory that the image build-scripts render with.

    pip install fonttools
    python3 scripts/make-render-fonts.py <dir of upstream TTFs> <out dir>
    node scripts/build-thumbnails.mjs <out dir>
    node scripts/build-og-card.mjs <out dir>

Why this exists
---------------
resvg draws the PNGs in public/, and it has two constraints the browser does
not:

  · No variable-axis support. Asking for Fraunces at "wght 700, SOFT 24" does
    nothing — it renders the font's default instance. So each face has to be
    cut to a fixed instance *before* it reaches the renderer, at exactly the
    axis values assets/css/main.css sets live. That is what keeps the generated
    artwork and the rendered page looking like the same typeface.

  · Family-name matching only. A face whose name table says "IBM Plex Mono
    Medium" does not answer to font-family="IBM Plex Mono"; it silently falls
    back to whatever else is loaded. That is not a hypothetical — an earlier
    pass shipped thumbnails whose every mono eyebrow rendered in a serif, for
    exactly this reason, and nothing warned about it. So the names are
    flattened here too, and the typographic name IDs dropped so there is one
    unambiguous answer per file.

Upstream sources (all SIL OFL 1.1), from github.com/google/fonts:
    ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf
    ofl/archivo/Archivo[wdth,wght].ttf
    ofl/sourceserif4/SourceSerif4[opsz,wght].ttf
    ofl/ibmplexmono/IBMPlexMono-{Regular,Medium,SemiBold}.ttf

Note the OFL's reserved-name clause on IBM Plex: an instanced or renamed
derivative may not be redistributed under the Plex name. Nothing here is
redistributed — the output directory is a build-time input that never ships,
and the site itself serves the unmodified upstream woff2 files.
"""
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

# file, pinned axes, family, subfamily, output name
VARIABLE = [
    ('Fraunces.ttf', {'wght': 700, 'SOFT': 24, 'WONK': 1, 'opsz': 96},
     'Fraunces', 'Bold', 'Fraunces-Bold.ttf'),
    ('Archivo.ttf', {'wght': 600, 'wdth': 100},
     'Archivo', 'SemiBold', 'Archivo-SemiBold.ttf'),
    ('SourceSerif4.ttf', {'wght': 400, 'opsz': 32},
     'Source Serif 4', 'Regular', 'SourceSerif4-Regular.ttf'),
]
STATIC = [('Regular', 'Regular'), ('Medium', 'Medium'), ('SemiBold', 'SemiBold')]


def rename(font, family, subfamily):
    """Give the face one unambiguous family name."""
    for rec in font['name'].names:
        if rec.nameID == 1:
            rec.string = family
        elif rec.nameID == 2:
            rec.string = subfamily
        elif rec.nameID == 4:
            rec.string = f'{family} {subfamily}'
        elif rec.nameID == 6:
            rec.string = f'{family.replace(" ", "")}-{subfamily}'
    # Typographic family/subfamily would take precedence over 1/2 — drop them.
    font['name'].names = [r for r in font['name'].names if r.nameID not in (16, 17)]


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__.strip().splitlines()[2].strip())
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)

    for name, axes, family, subfamily, dest in VARIABLE:
        font = TTFont(os.path.join(src, name))
        instantiateVariableFont(font, axes, inplace=True, updateFontNames=False)
        rename(font, family, subfamily)
        font.save(os.path.join(out, dest))
        print(dest)

    for weight, subfamily in STATIC:
        font = TTFont(os.path.join(src, f'IBMPlexMono-{weight}.ttf'))
        rename(font, 'IBM Plex Mono', subfamily)
        font.save(os.path.join(out, f'IBMPlexMono-{weight}.ttf'))
        print(f'IBMPlexMono-{weight}.ttf')


if __name__ == '__main__':
    main()
