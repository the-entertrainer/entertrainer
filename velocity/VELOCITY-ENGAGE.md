# Velocity on Engage

Route: `/engage/velocity`. Layoutless Nuxt/Vue route mounts a React island.

Four selectable reference frames explain motion using current model estimates,
plain-language context and interactive Three.js scenes. Local place presets,
latitude/longitude controls and optional browser geolocation need no account.
Location is kept only in this page session. No automatic location prompt.

Balanced mode uses a 4K Earth map and capped pixel ratio; High uses an 8K map when
supported. Orbit controls, reset, locate marker, pause, motion rate, unit selector,
independent distance counters and a source dialog are available. Reduced-motion
preferences start with the illustration paused. WebGL/load/context errors leave
the numerical explanation available and offer a scene reload.

Textures, shaders, fonts and code are local. The production service worker
precaches the Velocity document and textures for use after a successful online
installation. First use needs a network connection; source links and browser
geolocation can require connectivity. Dev mode does not install the worker.

`physics.ts` is independent of rendering. See `SOURCES.md` for assumptions and
scientific references. Tests:

```sh
node --experimental-strip-types --test tests/velocity/*.test.mjs
npm run build
```

`engine.ts` owns GPU resources and disposes controls, animation loops, materials,
textures, geometries and post-processing targets when the island unmounts or
quality changes. `materials.ts` contains the custom shading; `galaxy.ts` contains
deterministic illustrative geometry. No external texture feeds are used.
