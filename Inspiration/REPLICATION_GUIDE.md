# Portfolio Replication Guide
## Source: pacomepertant.com — Awwwards SOTD, June 9 2026

Complete technical specification to rebuild this site from scratch with any content.
All values extracted directly from production code.

---

## 1. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Nuxt.js 3 (Vue 3) | SSG, file-based routing |
| 3D | Three.js | WebGL spiral carousel |
| Animation | GSAP 3.13 + SplitText + ScrollTrigger | All UI motion |
| Smooth scroll | Lenis | Synced to gsap.ticker |
| Audio | Howler.js | All interaction sounds |
| Lottie | lottie-web (SVG renderer) | Face/loader animations |
| CMS | Sanity.io | Headless, structured content |
| Video | Mux | Adaptive HLS streaming |
| CSS | Scoped BEM + CSS custom properties | No Tailwind in production |
| Font | Indivisible Variable (woff2) | Adobe Typekit cxl5sdt |
| Analytics | PostHog | |
| Hosting | Vercel | |
| Post-processing | three/examples/jsm/postprocessing | EffectComposer + ShaderPass |

---

## 2. Design Tokens

### Colors
```css
--color-black:              #0a0a0a;
--color-white:              #fafafa;
--color-bg-dark:            #0a0a0a;
--color-bg-dark20:          #0a0a0a20;
--color-bg-dark40:          #0a0a0a40;
--color-bg-dark60:          #0a0a0a60;
--color-bg-dark-transparent:#0a0a0a00;
--color-bg-grey:            #171717;
--color-pop-green:          #21ffc0;   /* accent — used on CursorTag, close button */
--color-grey:               #e6e6e6;
--color-white20:            #fafafa20;
```

### Typography
```css
--main-font: "Indivisible Variable", "Helvetica Neue", "Arial", sans-serif;
--display-font: "Indivisible Variable", "Helvetica Neue", "Arial", sans-serif;

/* Base */
font-size: 18px (1rem = 1px via html { font-size: 1px })
font-weight: 400
letter-spacing: -0.04em
line-height: 1

/* Menu links */
font-size: 80px
font-weight: 500
letter-spacing: -0.05em
line-height: 100%

/* Body text */
font-size: 18px
font-weight: 500

/* Error / hero numbers */
font-size: 200px
font-style: italic
font-weight: 600
letter-spacing: -0.05em
```

All sizing uses `rem` as a unit where `1rem = 1px` (set globally via `html { font-size: 1px }`). This lets you write `80rem` and get `80px` — a direct-pixel system.

### Spacing Scale
```css
--gap-xs:   10px
--gap-s:    15px
--gap-m:    30px
--gap-l:    60px
--gap-xl:   90px
--gap-xxl:  120px
--gap-xxxl: 180px
--gap-20:   20px
--gap-45:   45px
```

### Border Radius
```css
--radius-xs:   4px
--radius-s:    8px
--radius-m:    12px
--radius-l:    16px
--radius-xl:   20px
--radius-full: 9999px
```

### Grid System
```css
/* Desktop (>900px): 12 columns */
--grid-margin: 30px
--grid-gutter: 16px
--grid-column: calc(100vw/12 - 16px*11/12 - 30px*2/12)

/* Tablet (900–1024px): same columns, slightly narrower */
/* Mobile (<900px): 6 columns */
--grid-margin: 20px
--grid-gutter: 15px
--grid-column: calc(100vw/6 - 15px*5/6 - 20px*2/6)

/* Small mobile (<420px) */
--grid-margin: 15px
--grid-gutter: 10px
```

### Easing Curves
```css
/* Spring — used on menus, hovers, button reveals */
--ease-spring: linear(
  0, .0014, .0055 1.03%, .0239, .053 3.44%,
  .0961 4.81%, .1957 7.39%, .4354 12.88%,
  .5484, .6494, .7362, .8083 23.88%,
  .8696, .9168 29.72%, .9368, .9536 32.81%,
  .9793 35.9%, .997 39.17%, 1.0084 42.77%,
  1.0142 47.07%, 1.0144 53.43%, 1.0054 68.37%,
  1.0019 77.3%, .9998 99.98%
);

--ease-quad-in-out: cubic-bezier(.455, .03, .515, .955);
--ease-expo-out:    cubic-bezier(.19, 1, .22, 1);

/* GSAP equivalents used in JS */
"power1.out"        /* text reveals */
"power2.out"        /* menu links, cursor images */
"power3.out"        /* project list items */
"power4.out"        /* menu close (snappy) */
"elastic.out(1,0.8)"/* button letter spring-back */
```

---

## 3. Architecture Overview

### Pages
```
/           → index.vue  (Three.js spiral + list toggle)
/about      → about.vue  (image trail, bio, Lottie faces)
/projects/:slug → [slug].vue (fullscreen video player)
```

### Nuxt Configuration
```javascript
// Page transitions (set per page via definePageMeta)
basicPageTransition  = { name: "fade",    mode: "out-in" }  // about
projectPageTransition = { name: "project", mode: "out-in" } // project pages
```

### State Stores (Pinia)
```javascript
useExperienceStore()  // Three.js Experience singleton, progress, hasEntered
useHomeViewStore()    // mode: "spiral" | "list"  (default: "spiral")
useMenuStore()        // isOpened: boolean
useContentStore()     // projects[], showreel, email, social links
useAudioStore()       // enabled: boolean
```

### Data Layer (Sanity)
```javascript
// Project schema
{
  title: string,
  slug: { current: string },
  year: number,
  shortDescription: string,
  behanceUrl: string,
  thumbnail: SanityImageReference,   // used as preview in list + cursor
  styleframes: SanityImageReference[], // 3–4 preview stills
  video: {
    asset: { playbackId: string }     // Mux playback ID
  }
}

// Root content
{
  email: string,
  showreel: { asset: { playbackId: string } },
  socialLinks: [{ platform, url }],
  title: string
}
```

### Video URLs
```javascript
// HLS stream
`https://stream.mux.com/${playbackId}.m3u8`

// Poster/thumbnail
`https://image.mux.com/${playbackId}/thumbnail.jpg?width=1920&fit_mode=preserve`
```

---

## 4. Three.js Spiral System

### Scene Setup
```javascript
// Camera
new PerspectiveCamera(
  width < 900 ? 45 : 35,  // FOV degrees
  width / height,          // aspect
  0.1,                     // near
  100                      // far
)
camera.position.set(0, 0, 8)  // 8 units back along Z

// Renderer
new WebGLRenderer({ antialias: true, powerPreference: "high-performance", stencil: false })
renderer.toneMapping = NoToneMapping
renderer.shadowMap.enabled = false
renderer.setClearColor(0x0E0F0E, 0)  // near-black, transparent alpha
```

### Geometry
```javascript
const geometry = new PlaneGeometry(1, 1, 8, 8)  // 8×8 subdivisions for vertex warp
// Shared across all ProjectPlane instances
```

### Spiral Math (ProjectPlane.update — runs every frame)

Constants per plane:
```javascript
baseScaleX  = 1.7    // plane width  (landscape, ~16:10)
baseScaleY  = 1.0    // plane height
verticalGap = 0.5    // Y units between adjacent planes
angleGap    = 0.85   // radians between planes (~48.7°)
baseRadius  = 2.0    // circle radius in world units
```

Per-frame positioning:
```javascript
// Scrollable index — wraps infinitely
let ws = (index - controls.scrollOffset) % projectsCount
ws = (ws + projectsCount) % projectsCount

// Relative distance from center item (0 = center, ±n = above/below)
const Ba = ws - centerIndex   // centerIndex = floor(projectsCount / 2)

// ─── Position ───────────────────────────────────────────────
// Y: vertical stacking, shifted down 0.8 units
// When hidden: planes fly out by ±1.5 units in Y (ss = isHidden ? 1.5 : -1.5)
const Va = Ba * verticalGap - 0.8 - hiddenProgress * ss

// Radius shrinks to half when hiding
const Ga = baseRadius * (1 - hiddenProgress / 2)   // 2.0 → 1.0

// XZ circle placement
const Ha = Ba * angleGap           // angle in radians
this.position.set(
  Math.cos(Ha) * Ga,   // X
  Va,                   // Y
  Math.sin(Ha) * Ga    // Z
)

// ─── Rotation ────────────────────────────────────────────────
// Face outward from circle (plane normal tangent to circle)
this.rotation.y = -Ha + Math.PI / 2
```

Result: item at Ba=0 sits at angle 0 (rightmost, X=2, Z=0).
Item at Ha=π/2 (Ba≈1.85) faces camera directly at (0, Y, 2).
Items spiral from bottom-back to top-front as Ba increases.

### Reveal / Hide Animation
```javascript
// Per-frame easing (delta-time aware)
const lerpFactor = 1 - Math.pow(1 - 0.05, delta * 0.15)
hiddenProgress = lerp(hiddenProgress, hiddenTarget, lerpFactor)
// hiddenTarget: 0 = visible, 1 = hidden

// Staggered trigger
revealProjects() {
  projectPlanes.forEach((plane, i) => {
    setTimeout(() => plane.reveal(), (i % 4) * 50)  // 0–150ms stagger
  })
}
hideProjects() {
  projectPlanes.forEach((plane, i) => {
    setTimeout(() => plane.hide(), (i % 4) * 30)    // 0–90ms stagger
  })
}
```

### Hover Animation
```javascript
const lerpFactor = 1 - Math.pow(1 - (isHovered ? 0.09 : 0.07), delta * 0.2)
hoverProgress = lerp(hoverProgress, hoverTarget, lerpFactor)
// hoverTarget: 0 = resting, 1 = hovered

// Applied to shader uniforms:
uColorStrength = 0.55 * hoverProgress   // darkens up to 55%
uZoom          = 1 + 0.05 * hoverProgress  // zoom up to 5%
uRevealProgress *= (1 - hoverProgress * 0.05)  // slight compress on hover
```

### Scroll / Rotation Controls
```javascript
// Constants
easing         = 0.1      // lerp factor for wheel speed
minWheelSpeed  = 0.002    // always auto-rotating (never stops)
wheelDirection = 1        // clockwise from above

// Per frame
wheelDeltaY   += (targetWheelDeltaY - wheelDeltaY) * 0.1
scrollOffset  += wheelDeltaY
// Decay
targetWheelDeltaY *= 0.9
// Enforce minimum speed
if (abs(targetWheelDeltaY) < minWheelSpeed)
  targetWheelDeltaY = wheelDirection * minWheelSpeed

// On wheel event
targetWheelDeltaY += event.deltaY * 0.000015
targetWheelDeltaY = clamp(targetWheelDeltaY, -2, 2)
```

### Vertex Shader (ProjectPlane)
```glsl
varying vec2 vUv;
varying vec3 vWorldPosition;
#define PI 3.14159265359

uniform float uScrollSpeed;

void main() {
  vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 newPosition = position;

  // Curve the plane along horizontal axis — concave/convex card effect
  newPosition.z = sin(uv.x * PI) * 0.2;

  vec4 modelPosition  = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition   = viewMatrix * modelPosition;

  // Y-based lateral drift: planes far from Y=0 lean outward
  viewPosition.x += pow(worldPosition.y, 2.0) * 0.1;

  // Scroll warp: planes bow sideways when spinning (sine along V)
  viewPosition.x += sin(uv.y * PI) * uScrollSpeed * 2.0;

  gl_Position = projectionMatrix * viewPosition;
  vUv = uv;
}
```

### Fragment Shader (ProjectPlane)
```glsl
uniform sampler2D uTexture;
uniform float uColorStrength;   // 0–0.55 (hover darkening)
uniform float uZoom;            // 1.0–1.05 (hover zoom)
uniform vec2  uPlaneSizes;      // (1.7, 1.0) — plane aspect
uniform vec2  uImageSizes;      // actual texture pixel dimensions
uniform float uRevealProgress;  // 0 = hidden, 1 = fully visible

varying vec2 vUv;

float roundedRectSDF(vec2 uv, vec2 size, float radius) {
  vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
  return length(max(d, 0.0)) - radius;
}

void main() {
  // Cover-fit image to plane aspect ratio
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );
  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  // Hover zoom
  vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;

  vec4 color;

  if (gl_FrontFacing) {
    // Front face: sharp image + hover darkening
    color = texture2D(uTexture, zoomedUv);
    color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
  } else {
    // Back face: 3×3 Gaussian blur (visible when plane faces away)
    float offset = 40.0 / 1024.0;
    vec4 c = vec4(0.0);
    c += texture2D(uTexture, uv + vec2(-offset, -offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2( 0.0,   -offset)) * 2.0;
    c += texture2D(uTexture, uv + vec2( offset, -offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2(-offset,  0.0))   * 2.0;
    c += texture2D(uTexture, uv)                         * 4.0;
    c += texture2D(uTexture, uv + vec2( offset,  0.0))   * 2.0;
    c += texture2D(uTexture, uv + vec2(-offset,  offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2( 0.0,    offset)) * 2.0;
    c += texture2D(uTexture, uv + vec2( offset,  offset)) * 1.0;
    c /= 16.0;
    color = c;
  }

  // Reveal animation: SDF-based rounded rect that grows from 0 to full
  float reveal     = clamp(uRevealProgress, 0.0, 1.0);
  vec2  revealSize = vec2(reveal);
  float baseRadius = 0.05;
  float radius     = baseRadius * reveal;   // corners round with the reveal

  float sdf  = roundedRectSDF(vUv, revealSize, radius);
  float edge  = 0.002;
  float alpha = 1.0 - smoothstep(0.0, edge, sdf);
  alpha *= smoothstep(0.1, 1.0, uRevealProgress);  // fade in after 10%

  gl_FragColor = vec4(color.rgb, alpha);
}
```

Material:
```javascript
new ShaderMaterial({
  uniforms: { uTexture, uColorStrength, uZoom, uPlaneSizes, uImageSizes, uRevealProgress, uScrollSpeed },
  vertexShader, fragmentShader,
  transparent: true,
  side: DoubleSide
})
```

### Post-Processing (Screen-space gradient vignette)
```glsl
/* PPnoiseFragmentShader — applied to entire scene via EffectComposer */
uniform sampler2D tDiffuse;
uniform vec3 uFillColor;   /* #444 (0.267, 0.267, 0.267) */

void main() {
  /* Fade bottom 20% and top 20% of screen to uFillColor */
  float bot = clamp(remap(vUv.y, 0.0, 0.2, 1.0, 0.0), 0.0, 1.0);
  float top = clamp(remap(vUv.y, 0.8, 1.0, 0.0, 1.0), 0.0, 1.0);
  float strength = clamp(top + bot, 0.0, 1.0);

  vec4 tex = texture2D(tDiffuse, vUv);
  gl_FragColor = vec4(mix(tex.rgb, uFillColor, strength), tex.a);
}
```

```javascript
// Setup
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const noisePass = new ShaderPass(NoiseShader)
noisePass.material.uniforms.uFillColor.value = new Color("#444")
composer.addPass(noisePass)
```

### Project Duplication for Infinite Loop
```javascript
const totalPlanes = projects.length * 2  // e.g. 3 projects → 6 planes
const centerIndex = Math.floor(totalPlanes / 2)  // = 3

// Both copies reference the same project data
;[...projects, ...projects].forEach((project, i) => {
  projectPlanes.push(new ProjectPlane(experience, i, project, totalPlanes, geometry))
})
```

---

## 5. Audio System

Built on Howler.js. Every interaction has a corresponding sound.

### Sound Registry
```javascript
const audioConfig = {
  ambient:   { src: ["/sounds/ambient.ogg"],         volume: 0.3,  loop: true,  html5: true },
  hover:     { src: ["/sounds/hover.ogg"],            volume: 1.0,  loop: false, html5: true },
  click:     { src: ["/sounds/click.ogg"],            volume: 0.5,  loop: false, html5: true },
  spiral:    { src: ["/sounds/spiral.ogg"],           volume: 0.4,  loop: false, html5: true },
  list:      { src: ["/sounds/list.ogg"],             volume: 0.4,  loop: false, html5: true },
  tick:      { src: ["/sounds/tick.ogg"],             volume: 0.2,  loop: false, html5: true },
  longclick: { src: ["/sounds/longclick.ogg"],        volume: 1.0,  loop: false, html5: true },
  switch:    { src: ["/sounds/switch.ogg"],           volume: 0.5,  loop: false, html5: true },
  close:     { src: ["/sounds/close.ogg"],            volume: 0.7,  loop: false, html5: true },
  menuhome:  { src: ["/sounds/menu/homelink.ogg"],    volume: 0.25, loop: false, html5: true },
  menuabout: { src: ["/sounds/menu/aboutlink.ogg"],   volume: 0.25, loop: false, html5: true },
  smiley1:   { src: ["/sounds/smiley/smiley1.ogg"],  volume: 0.2,  loop: false, html5: true },
  smiley2:   { src: ["/sounds/smiley/smiley2.ogg"],  volume: 0.2,  loop: false, html5: true },
  smiley3:   { src: ["/sounds/smiley/smiley3.ogg"],  volume: 0.2,  loop: false, html5: true },
  smiley4:   { src: ["/sounds/smiley/smiley4.ogg"],  volume: 0.2,  loop: false, html5: true },
}
```

### Sound → Interaction Map
| Sound | Trigger |
|---|---|
| `ambient` | On site enter (loops continuously, ducked during showreel) |
| `hover` | Any project row hover (list view) |
| `click` | Menu button click |
| `spiral` | Switch to spiral view |
| `list` | Switch to list view |
| `tick` | Each image trail pop (About page) |
| `longclick` | Project card click (navigate) |
| `switch` | Toggle / misc switch |
| `close` | Close video player |
| `menuhome` | Hover "works" nav link |
| `menuabout` | Hover "about" nav link |
| `smiley1–4` | Click smiley/face Lottie animation |

### Volume Animation (Showreel)
```javascript
// On video open — fade ambient to silence
animateGlobalVolume(0, 500)

// On video close — restore after delay
setTimeout(() => animateGlobalVolume(1, 500), 500)
```

### Page Visibility
```javascript
document.addEventListener("visibilitychange", () => {
  Howler.mute(document.hidden)
})
```

---

## 6. Smooth Scrolling (Lenis)

```javascript
new Lenis({
  gestureOrientation: "vertical",
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // expo ease-out
  autoRaf: false,   // manually driven
  autoResize: true,
})

// Drive via GSAP ticker (frame-perfect)
gsap.ticker.add(time => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// Sync ScrollTrigger
window.addEventListener("resize", () => ScrollTrigger.refresh())
nuxt.hook("page:finish", () => ScrollTrigger.refresh())

// Provide globally
provide({ $lenis: lenisRef })
```

---

## 7. Motion Systems — Per Component

### 7.1 Loader / Entry Screen

**Phase 1 — Lottie plays**
```javascript
<Lottie name="loader" :autoplay="true" :loop="false" @onComplete="lottieComplete" />
```
Lottie file: `/assets/lottie/loader.json`

**Phase 2 — Resources load**
```javascript
// Progress lerp (very slow: factor 0.02 = ~50 frames to cross half the gap)
this.progress += (this.targetProgress - this.progress) * 0.02
// targetProgress updates on each fileLoaded event: (loaded/toLoad) * 100
```

**Phase 3 — Text reveal** (fires when lottie done + progress ≥ 99.5)
```javascript
// Text split into lines with GSAP SplitText
gsap.set(lines, { yPercent: -100, opacity: 0 })
// On lottieDone state = true:
gsap.to(lines, {
  yPercent: 0, opacity: 1,
  stagger: { each: 0.1 },
  ease: "power1.out",
  duration: 0.6
})
```

**Phase 4 — Buttons appear**
```javascript
// "enter with sound" / "enter without sound" buttons
// Show via CSS class: .show { opacity: 1; pointer-events: auto }
// Triggered reactively when isReady && lottieDone
```

**Phase 5 — Enter**
```javascript
// With sound:
audio.play("ambient", true)  // start ambient loop
experienceStore.setHasEntered()

// Without sound:
audio.mute(true)
audio.play("ambient", true)
audioStore.setEnabled(false)
experienceStore.setHasEntered()

// After 200ms:
world.revealProjects()
```

---

### 7.2 Menu Button

The word "menu" has each letter wrapped in a `<span class="letter">`.

```javascript
// Paused GSAP timeline, triggered on mouseenter
const tl = gsap.timeline({ paused: true })

tl.to(letters, {
  rotation: () => gsap.utils.random(-15, 15),  // random per letter
  scale:    () => gsap.utils.random(1.15, 1.4),
  fontWeight: 600,
  duration: 0.25,
  ease: "power2.out",
  stagger: 0.05,
})
.to(letters, {
  rotation: 0, scale: 1, fontWeight: 500,
  duration: 0.25,
  ease: "elastic.out(1, 0.8)",  // springy return
  stagger: 0.05,
})

button.addEventListener("mouseenter", () => tl.restart())
```

CSS for button wrapper (pill → expands to full panel):
```css
/* Closed state */
.subwrapper {
  width: 86.8px; height: 48px;
  border-radius: 24px;
  background: var(--color-white);
  transition: width 0.9s var(--ease-spring), height 1s var(--ease-spring),
              border-radius 0.9s ease;
}
/* Opened state */
.subwrapper.opened {
  width: calc(4 cols + 4 gutters);   /* ~350–450px depending on viewport */
  height: calc(100dvh - 2 * 30px);
  border-radius: 16px;
}
```

Close button (×) scales from corner:
```css
.close-button {
  transform-origin: top right;
  transition: transform 0.8s var(--ease-spring), right 0.8s ..., top 0.8s ...;
}
.close-button.closed { transform: scale(0.125); }  /* shrunk into corner */
.close-button.opened { transform: scale(1); }
```

---

### 7.3 Menu Nav Links (80px text items)

```javascript
// On mount, preset off-screen
gsap.set(linkEls, { y: -20, x: 20, opacity: 0 })

// Watch isMenuOpen
watch(isMenuOpen, open => {
  if (open) {
    gsap.killTweensOf(linkEls)
    gsap.to(linkEls, {
      y: 0, x: 0, opacity: 1,
      duration: 0.5, delay: 0.2,
      ease: "power2.out",
      stagger: 0.1,
    })
  } else {
    gsap.killTweensOf(linkEls)
    gsap.to(linkEls, {
      y: -20, x: 20, opacity: 0,
      duration: 0.2,
      ease: "power4.out",
      stagger: -0.05,  // reverse — bottom-to-top
    })
  }
})
```

CSS hover (spring-based padding expansion):
```css
.link {
  transition: padding-left 0.5s var(--ease-spring);
}
.link:hover { padding-left: 40px; }  /* text slides right */
.link::before {
  /* dark dot/bullet that scales in before the text */
  transform: translateY(-50%) scale(0);
  transition: transform 0.5s var(--ease-spring), opacity 0.5s var(--ease-spring);
}
.link:hover::before { transform: translateY(-50%) scale(1); opacity: 1; }
```

Social links (icon row at bottom of menu):
```css
.menu-social-links.closed {
  opacity: 0; transform: translateY(-10px) translate(10px);
  transition: opacity 0.3s ease, transform 0.3s ease; transition-delay: 0;
}
.menu-social-links.opened {
  opacity: 1; transform: translateY(0) translate(0);
  transition: opacity 0.5s ease, transform 0.5s ease; transition-delay: 0.4s;
}
/* Sibling dimming on hover: */
.menu-social-links:has(.social-link:hover) .social-link:not(:hover) .social-link-inner {
  background-color: var(--color-grey);
  color: var(--color-black);
  transform: scale(0.9);
  transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}
```

---

### 7.4 SolidButton / CTA Buttons (same elastic letter animation)

```javascript
// Same timeline pattern as menu button
// Applied to any button with individual letter spans
gsap.timeline({ paused: true })
  .to(letters, {
    rotation: () => gsap.utils.random(-15, 15),
    scale:    () => gsap.utils.random(1.15, 1.4),
    fontWeight: 600, duration: 0.25, ease: "power2.out",
    stagger: { amount: 0.25 },
  })
  .to(letters, {
    rotation: 0, scale: 1, fontWeight: 500, duration: 0.25,
    ease: "elastic.out(1, 0.8)", stagger: { amount: 0.25 },
  })
```

---

### 7.5 View Switch Button (spiral ↔ list)

Two stacked `<span>` per button, sliding vertically:
```css
.button button { overflow: hidden; position: relative; }
.button button span     { transition: transform 0.3s var(--ease-spring), opacity 0.3s ease; }
.button button span:nth-child(2) { position: absolute; top: 0; transform: translateY(-100%); opacity: 0; }
/* Hover / active: */
.button button:hover span:first-child,
.button.active  span:first-child  { transform: translateY(100%); opacity: 0; }
.button button:hover span:nth-child(2),
.button.active  span:nth-child(2) { transform: translateY(0);    opacity: 1; }
```

Inactive buttons at `opacity: 0.4`, active at `opacity: 1`.

---

### 7.6 CursorTag (floating label above cursor)

```javascript
// rAF-based smooth following
let targetPos = { x: -100, y: -100 }  // actual mouse
let currentPos = { x: -100, y: -100 } // lerped display

const raf = () => {
  currentPos.x = lerp(currentPos.x, targetPos.x, 0.1)
  currentPos.y = lerp(currentPos.y, targetPos.y, 0.1)
  requestAnimationFrame(raf)
}

// Show/hide: scale(0) → scale(1) with 250ms delay on enter
// Positioned via: transform: translate3d(${x}px, ${y}px, 0) translate(-50%, -150%)
// i.e. centered horizontally, floats 150% height above cursor
```

CSS:
```css
.cursor-tag {
  background: var(--color-pop-green);
  color: var(--color-bg-dark);
  border-radius: 50px;
  font-size: 24px; font-weight: 500;
  padding: 8px 16px;
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.2s ease;
  will-change: transform, opacity;
}
```

---

### 7.7 CursorImage (project thumbnail follows cursor — list view)

```javascript
// rAF lerp 0.1, follows cursor inside list wrapper
// Position offset: translate3d(x, y, 0) translate(-25%, -75%)
//   → image appears upper-left of cursor

// Queue: max 5 images, oldest removed as new ones push in
// Scale state: lerp toward 1 on hover, 0.5 on leave
// When scale < 0.01 AND not hovering: clear queue
```

---

### 7.8 Project List Items (list view transitions)

```javascript
// Vue <Transition> hooks on the list wrapper
onEnter(el, done) {
  const items = el.querySelectorAll(".project")
  gsap.fromTo(items,
    { y: -30, opacity: 0, scaleY: 0.5 },
    { y: 0, opacity: 1, scaleY: 1, duration: 0.5, ease: "power3.out",
      stagger: 0.05, delay: 0.2, onComplete: () => { lenis.resize(); done() } }
  )
}
onLeave(el, done) {
  const items = el.querySelectorAll(".project")
  gsap.fromTo(items,
    { y: 0, opacity: 1 },
    { y: 50, opacity: 0, scaleY: 0.5, duration: 0.3, ease: "power3.out",
      stagger: 0.05, onComplete: done }
  )
}
```

---

### 7.9 Showreel Thumbnail

```css
/* Fixed bottom-left, tilted card */
.showreel-thumbnail { position: fixed; bottom: 30px; left: 30px; z-index: 10; }

/* Thumbnail card rotated -15deg */
.thumbnail-wrapper {
  width: 280px; aspect-ratio: 16/9;
  transform: rotate(-15deg);
  transition: transform 0.3s var(--ease-spring);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.thumbnail-wrapper:hover { transform: rotate(-13deg) scale(1.05); }

/* Text orbiting the card on an SVG path */
.marquee-text {
  animation: moveAlong 12s linear infinite;
  offset-path: path("M29.5684 182H274.432C290.14 182 304 169 304 152.286V29.7143
    C304 13 291.064 0 274.432 0H29.5684C12.9362 0 0 13 0 29.7143V152.286
    C0 169 13.8602 182 29.5684 182Z");
  offset-rotate: auto 180deg;
  font-size: 18px; font-weight: 500;
}
@keyframes moveAlong {
  from { offset-distance: -100%; }
  to   { offset-distance:    0%; }
}
```

---

### 7.10 Image Trail (About Page)

```javascript
// 24 sticker images pre-rendered in DOM, absolutely positioned, opacity:0
class ImageTrail {
  threshold = 80   // px of mouse movement before next image triggers
  images    = []   // TrailImage[]  (cycling 0→23→0)
  currentIndex = 0
  smoothMouse = lerp-smoothed cursor (factor 0.1)

  showNext() {
    const img = images[currentIndex++ % 24]
    audio.play("tick")

    gsap.killTweensOf(img.el)
    gsap.timeline()
      // Outer wrapper: scale 0→1, move to cursor
      .fromTo(img.el,
        { opacity: 1, scale: 0, x: smoothMouse.x - img.w/2, y: smoothMouse.y - img.h/2 },
        { scale: 1,  x: actualMouse.x - img.w/2, y: actualMouse.y - img.h/2,
          duration: 0.4, ease: "power2.out" },
        0
      )
      // Inner image: counter-zoom out (punch-in effect)
      .fromTo(img.inner,
        { scale: 2.5 },
        { scale: 1, duration: 0.4 },
        0
      )
      // Disappear: fade and shrink
      .to(img.el,
        { opacity: 0, scale: 0.2, duration: 0.4 },
        0.45    // starts 50ms after the appear begins
      )
  }
}

// Image sizes: 150px wide desktop, 100px mobile
```

---

### 7.11 Logo (top-left)

```css
.wrapper {
  position: fixed; left: 30px; top: 30px;
  width: 64px; height: 64px;
  z-index: 20; cursor: pointer;
}
/* Tag that pops up on hover */
.logo-tag-wrapper {
  opacity: 0;
  transform: scale(0.5) translate(-10%);
  transform-origin: left center;
  transition: opacity 0.2s ease-out, transform 0.5s var(--ease-spring);
}
.wrapper:hover .logo-tag-wrapper {
  opacity: 1;
  transform: scale(1) rotate(-5deg) translateY(-12px);
}
.logo:active { transform: scale(0.9); }
```

---

### 7.12 Video Player

```css
/* Fullscreen overlay with backdrop blur on thumbnail */
.player-wrapper {
  position: fixed; inset: 0; z-index: 50;
  background: cover (thumbnail as bg);
}
.player-wrapper::after {
  backdrop-filter: blur(20px);  /* blurs thumbnail bg */
}

/* Video controls pill */
.controls .inner {
  background: var(--color-white);
  border-radius: 20px;
  padding: 10px; gap: 4px;
}
/* Filmstrip progress thumbnails — 4 columns */
.progress-thumbs { grid-template-columns: repeat(4, 1fr); }

/* Control button hover: background shrinks */
.controls .button .background {
  transition: transform 0.15s ease-out;
}
.controls .button:hover .background { transform: scale(0.9); }
```

Vue transition into video:
```css
.video-fade-enter-from, .video-fade-leave-to {
  opacity: 0;
  transform: scaleY(0.95) scaleX(0.95);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
.video-fade-enter-active, .video-fade-leave-active {
  transform-origin: bottom center;
  transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out, border-radius 0.4s ease-in-out;
}
.video-fade-enter-active { transition-delay: 0.1s; }
```

---

### 7.13 Icon Transitions (play/pause/mute toggles)

```css
.iconfade-leave-from { filter: blur(0);   opacity: 1; transform: scale(1)   rotate(0); }
.iconfade-leave-to   { filter: blur(2px); opacity: 0; transform: scale(0.8) rotate(15deg); }
.iconfade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease, filter 0.25s ease; }

.iconfade-enter-from { filter: blur(2px); opacity: 0; transform: scale(0.8) rotate(-15deg); }
.iconfade-enter-to   { filter: blur(0);   opacity: 1; transform: scale(1)   rotate(0); }
.iconfade-enter-active { transition: opacity 0.25s ease, transform 0.25s ease, filter 0.25s ease; }
```

---

## 8. Page Transitions (CSS)

### fade (Home ↔ About)
```css
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
```

### project (Any page → Project page)
```css
/* Enter: slide up from below, slight scale-in */
.project-enter-from   { opacity: 0; transform: translateY(80px) scale(0.96); }
.project-enter-to     { opacity: 1; transform: translateY(0)     scale(1); }
.project-enter-active {
  transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.2s;
}

/* Leave: scale down slightly and fade */
.project-leave-from   { opacity: 1; transform: translateY(0) scale(1); }
.project-leave-to     { opacity: 0; transform: translateY(0) scale(0.985); }
.project-leave-active {
  position: absolute; inset: 0;
  transition: opacity 0.45s ease, transform 0.45s ease;
}
```

### project-fade (within project page — e.g. video toggle)
```css
.project-fade-enter-from { opacity: 0; transform: translateY(18px) scale(0.96); }
.project-fade-enter-active { transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.project-fade-leave-to  { opacity: 0; transform: translateY(-12px) scale(0.96); }
.project-fade-leave-active { transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
```

### Lenis lifecycle during transitions
```javascript
// Before leave: stop scroll
lenis.stop()
// Before enter: reset scroll to top immediately
window.scrollTo(0, 0)
lenis.scrollTo(0, { immediate: true })
// After enter: restart and resize
lenis.start()
lenis.resize()
```

---

## 9. Lottie Animations

Six animation files:
- `face1.json` through `face5.json` — used for smiley/emoji UI element
- `loader.json` — loading screen animation

```javascript
// Lottie component props
{
  name: string,        // key into animations registry
  loop: false,         // single play
  autoplay: true,
  renderer: "svg",
  speed: 1,
  onComplete: () => {}  // fires after single play
}
```

---

## 10. WebGL Canvas Layout

```css
/* Three.js canvas: fixed, full screen, below all UI */
.webgl {
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  z-index: 0;
  transition: opacity 0.5s ease-out;
}
.webgl.hide { opacity: 0; pointer-events: none; }

/* Background SVG pattern: fixed, z-index 0, opacity 0.4 */
/* (decorative texture behind the WebGL scene) */
svg[fixed-bg] {
  position: fixed; inset: 0;
  width: auto; height: 100%;
  opacity: 0.4;
  pointer-events: none;
}
```

---

## 11. Implementation Checklist

Use this to track a full rebuild:

### Foundation
- [ ] Nuxt 3 project with Vue 3
- [ ] Pinia stores: Experience, HomeView, Menu, Content, Audio
- [ ] Lenis smooth scroll, synced to GSAP ticker
- [ ] Global CSS variables (Section 2)
- [ ] Indivisible Variable font loaded (woff2)
- [ ] Howler.js initialized with all sound assets
- [ ] GSAP 3 + SplitText + ScrollTrigger registered
- [ ] Sanity client configured + content queries
- [ ] Mux HLS URL generation helper

### Three.js Spiral
- [ ] Scene, camera (FOV 35/45, pos 0,0,8), renderer setup
- [ ] ProjectPlane class with geometry, ShaderMaterial
- [ ] Vertex shader (curve + Y-drift + scroll warp)
- [ ] Fragment shader (cover-fit, reveal SDF, hover effects, back-face blur)
- [ ] Per-frame helix math (Ba, angleGap=0.85, verticalGap=0.5, radius=2)
- [ ] Project duplication ×2 for infinite scroll
- [ ] Controls class (easing=0.1, minWheelSpeed=0.002, wheel/touch)
- [ ] Raycasting for hover detection
- [ ] World.revealProjects() / hideProjects() with stagger
- [ ] EffectComposer with gradient vignette pass
- [ ] Responsive camera FOV + resize handler

### UI Components
- [ ] Loader: Lottie player + progress bar + text reveal + enter buttons
- [ ] MenuButton: elastic letter hover animation
- [ ] MenuContainer: pill → panel spring expansion
- [ ] MenuLinks: staggered slide-in/out
- [ ] MenuSocialLinks: sibling dimming hover effect
- [ ] ViewSwitch: spiral/list toggle with stacked span slide
- [ ] CursorTag: lerp follower with spring scale
- [ ] CursorImage: project thumbnail trail on list hover
- [ ] ProjectList: enter/leave GSAP transitions
- [ ] ShowreelThumbnail: rotated card + CSS offset-path text orbit + audio duck
- [ ] VideoPlayer: fullscreen + HLS + custom controls filmstrip
- [ ] Logo: spring tag reveal on hover
- [ ] SoundButton: fixed corner, scale hover

### About Page
- [ ] ImageTrail: 24 sticker images, 80px threshold, punch-in GSAP timeline
- [ ] Lottie face animations (face1–5) with smiley sounds

### Pages & Transitions
- [ ] `fade` CSS transition (home/about)
- [ ] `project` CSS transition (project pages)
- [ ] `project-fade` inner transition
- [ ] `video-fade` + `iconfade` transitions
- [ ] Middleware: hideProjects() when navigating away from /
- [ ] Middleware: revealProjects() when returning to / from /projects/*

---

## 12. Quick-Reference Numeric Constants

| Constant | Value | Description |
|---|---|---|
| Camera Z | 8.0 | Distance from origin |
| Camera FOV desktop | 35° | Wide-angle enough to see full carousel |
| Camera FOV mobile | 45° | |
| Spiral radius | 2.0 | World units |
| Angle per step | 0.85 rad ≈ 48.7° | Angular spacing between planes |
| Vertical per step | 0.5 | Y-units between planes |
| Y offset | -0.8 | Shifts whole carousel down |
| Plane aspect | 1.7 × 1.0 | Width:height ratio |
| Reveal SDF radius | 0.05 | Border-radius of reveal mask (UV space) |
| Back-face blur | 40/1024 | Blur offset in UV space |
| Scroll easing | 0.1 | Wheel delta lerp per frame |
| Min scroll speed | 0.002 | Always auto-rotating |
| Wheel scale | 0.000015 | deltaY multiplier |
| Wheel clamp | ±2 | Max scroll speed |
| Wheel decay | ×0.9 | Per frame deceleration |
| Reveal stagger | 50ms × (i%4) | 0–150ms per card |
| Hide stagger | 30ms × (i%4) | 0–90ms per card |
| Hover lerp in | 0.09 | Fast |
| Hover lerp out | 0.07 | Slightly slower |
| Hidden lerp | 0.05 | Slow reveal/hide |
| Lenis duration | 1.2s | Scroll feel |
| Menu button open | 0.9s spring | Width/height |
| Menu links stagger | 0.1s | Each link |
| Menu close stagger | -0.05s | Reverse |
| Image trail threshold | 80px | Distance between stickers |
| Image trail lerp | 0.1 | Smoothing |
| Image trail images | 24 | Sticker pool size |
| Sticker width desktop | 150px | |
| Sticker width mobile | 100px | |
| Gradient fade start | 0%/80% | Y fraction |
| Gradient fade end | 20%/100% | Y fraction |
| Gradient fill color | #444 | PostFX vignette color |
