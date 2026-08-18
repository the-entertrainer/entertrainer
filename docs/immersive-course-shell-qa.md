# Immersive Course Shell and Visual Library QA

## Shell validation

Both learning routes load without the public site masthead or footer. The only persistent chrome is the compact course bar: an All lessons exit, course identity, progress, and compact previous/next screen controls. The instructional-design module no longer includes its separate bottom navigation strip or expanded module map below the active screen.

## Compact AI player validation

The AI course was rebuilt from long lesson pages into 28 focused screens across the existing seven lessons. The 375px mobile player was checked after its finite preloader, showing a contained cover visual, screen count, top course controls, and a full-width Continue action. Desktop review of the early-computing screen confirmed that the generated early-computing workbench image decoded successfully within the intended visual figure, without public footer chrome.

## Compact instructional-design player validation

The 375px instructional-design opening screen has only the course exit, progress, compact previous/next screen controls, lesson/screen metadata, a practical workplace cover visual, and the focused opening copy. The previous lower navigation strip and module-map footer are absent. The image, learning header, and course body remain contained in the mobile viewport without horizontal overflow.

## Generated visual delivery

The new AI early-computing workbench visual was confirmed rendered in the browser at `/manus-storage/ai-early-computing-bench-v2_3d81bde2.jpg`. Both players use the new Nano Banana Pro visual URLs as primary course media and retain verified Entertrainer CDN assets as event-level image fallbacks for uninterrupted learning flow.

## Compact interaction validation

The AI Input Detective screen was opened directly in a controlled later-course state. It showed only one decision, three touch-sized answers, and a disabled continuation action. Selecting **Camera and sensor readings** produced immediate explanatory feedback and changed the action to **Continue to Candidate output**. This confirms an existing mini game remains one focused screen and cannot bypass its required learner action.

## Outstanding release checks

The remaining checks are a full media sweep after generation delivery, a 375px instructional-design shell review after the top-bar navigation move, keyboard navigation through both players, and the final Nuxt production build.
