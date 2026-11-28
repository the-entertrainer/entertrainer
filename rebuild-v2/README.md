# Entertrainer rebuild (preview at /v2/)

A from-scratch static site built with tasteskill 2.5.1 (github.com/Leonxlnx/taste-skill, skills/taste-skill,
commit 952435f, MIT). It lives in `public/v2/` so the Nuxt app keeps building on Vercel untouched; nothing at
`/` changes.

- `node rebuild-v2/gen.mjs` writes the five pages (index, elevate, empower, engage, about) into `public/v2/`.
- `public/v2/assets/` is the kit's own CSS and JS (system, motion, layout, ui, four moments), copied unedited,
  plus three tool icons from the kit's icon script. Licence: `public/v2/assets/LICENSE`.
- Kind: service. Deal: palette stone-blueprint, type Hanken Grotesk, nav-split, close-photo, footer-dark,
  rhythm surface-pairs, buttons arrow, wordmark. Heroes and moments per page are noted in each page's top comment.
- Photographs are Naveen's own (public/about, public/blog). App and game pictures are live HTML of the real apps.
