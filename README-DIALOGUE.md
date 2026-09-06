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
