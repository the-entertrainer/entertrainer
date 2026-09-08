# Preloader assets

Hand cursor stills (Kenney Cursor Pack) were removed — the entry screen no longer shows a pointer cue.

Idle affordance lives in CSS on the entry mark itself (`entry-mark--cue` in `components/ed/Preloader.vue`): two soft scale/opacity breathes, then settle. Reduced-motion keeps the mark static. No tap labels, arrows, or fake cursors.
