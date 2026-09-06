# Dialogue — Comics from your pocket.

Mobile-first webcomic PWA drop-in for the-entertrainer/entertrainer.
Canonical: https://entertrainer.in/dialogue

## Preview standalone

npx --yes serve public/dialogue -p 4173
or: cd public/dialogue && python3 -m http.server 4173
Open http://127.0.0.1:4173/

## Smoke test
node scripts/dialogue-smoke.mjs

## Copy into Nuxt
See PATCHES-nuxt.config.md. Deps: konva vue-konva dexie jspdf jszip file-saver

## Export presets
PNG strip | JPG | WEBTOON ZIP (800x<=1280) | PDF | .dialogue archive

## Brand
Ink #12110F Paper #F6F1E8 Balloon #FF4D2E Night #0D0C0A/#F3EEE6 SFX #F5C518

## P1 gaps
CBZ packaging, script wizard, frames/type polish, cloud sync, full vue-konva rewrite

## Manual tests
Home demo The Last Bus; new wizard; editor panels/art/balloons; undo; export; settings.

## Stack (CDN pinned)
konva@10, dexie@4, jspdf umd, jszip 3.10.1, FileSaver 2.0.5; fonts Bangers Comic Neue Anton Kosugi Maru Shippori Mincho Inter (display=swap). SW caches shell+fonts+icons; IndexedDB is SoT for comics.

## Data model
Dexie dialogue-db: Project, Page, Panel, Node, Asset — see types/dialogue.ts

Camera copy: Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone.


## AI Story Mode / Dialogue Canon Engine
Home → **New story** → Power mode (**Draft / Studio / Epic**, default Studio) → expand → beat list → **Densify** (optional) → Approve → Visual DNA bible → Generate pages → Copy forge prompt / Copy all / Open in editor.

### Canon passes
1. **expand** — beat graph: each scene has `beat` (setup|turn|payoff|hook), `conflict`, `emotion`, `pageHint`; chapters have `arcRole`.
2. **chat** — revise outline; preserves density.
3. **densify** — critic pass: more scenes, sharper conflicts, adult/YA sophistication (forbids kiddie blandness unless asked).
4. **bible** — deep Visual DNA (face/hair/wardrobeLocked/colorHex), psychology, relationships, locations sensory+palette, rules, motifs, timeline, structured `visualStyle`.
5. **pages** — per-chapter for studio/epic; Prompt Forge locks style + character DNA + “DO NOT change locked wardrobe/colors/face marks”.

### Density targets (story panels / chapter)
| Mode | Panels |
|------|--------|
| draft | 4–8 |
| studio | 12–24 |
| epic | 24–40 (server batches ≤8 panels) |

API: `POST /api/dialogue/story` with `action`: `expand` | `chat` | `densify` | `bible` | `pages` and optional `density`. Health: `GET /api/dialogue/story`.
Provider policy: **Groq** preferred for expand/chat (speed); **Gemini** preferred for densify/bible/pages (long JSON) when both keys exist.
Temps: expand 0.8 · densify 0.55 · bible 0.4 · pages 0.6. Dexie stories v3 (`density`, `beatGraph`). SW: dialogue-shell-v6.
Requires `GROQ_API_KEY` and/or `GEMINI_API_KEY`.
