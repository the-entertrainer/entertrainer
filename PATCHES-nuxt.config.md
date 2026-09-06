# Nuxt config patches for Dialogue

Copy the drop-in tree into the-entertrainer/entertrainer.

## Dependencies

Add: konva, vue-konva, dexie, jspdf, jszip, file-saver

## nuxt.config.ts

- css: include assets/css/dialogue.css
- PWA: shortcut url /dialogue/ ; keep public/dialogue/manifest.webmanifest start_url and scope /dialogue/
- workbox: cache shell/fonts/icons; do not cache user comic blobs
- components: path components/dialogue pathPrefix false

## Routes

- /dialogue and /dialogue/
- Canonical https://entertrainer.in/dialogue

## Copy checklist
public/dialogue, pages/dialogue, layouts/dialogue.vue, assets/css/dialogue.css, components/dialogue, composables/dialogue, stores/dialogueProjects.ts, utils/dialogue, types/dialogue.ts
