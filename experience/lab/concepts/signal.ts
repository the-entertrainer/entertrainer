/**
 * SIGNAL — the work as a broadcast you have to tune into.
 *
 * Geometry: the cards are mounted on the inside of a drum that turns around
 * the reader. Scroll rotates the drum rather than translating a list, so the
 * set has no beginning or end to fall off.
 *
 * The idea that makes it more than a rotating carousel: *legibility is the
 * reward for arriving*. A card away from centre is not merely dimmed, it is
 * genuinely unresolved — torn into scanline bands, split into RGB, dissolving
 * into static. As it reaches the reading position the signal locks and the
 * artwork assembles itself. Nothing is decorative here; the noise is the
 * interface telling you where you are.
 */
import { wrapT, clamp01, smootherstep, type Concept } from '../Stage'
import { cover, tracked, MONO, SANS } from '../draw'

const R = 4.6
const ARC = 0.66

const vertex = /* glsl */`
  uniform float uTime, uFocus, uSeed;
  varying vec2 vUv;
  varying float vDepth;

  float h11(float p){ return fract(sin(p * 127.1) * 43758.5453); }

  void main() {
    vUv = uv;
    vec3 p = position;
    float inst = 1.0 - uFocus;

    // An unlocked projection can't hold a flat plane steady.
    p.z += sin(uv.x * 3.14159) * 0.10 * inst;
    float band = floor(uv.y * 20.0);
    p.x += (h11(band + floor(uTime * 12.0) + uSeed) - 0.5) * 0.10 * inst;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const fragment = /* glsl */`
  uniform sampler2D uTex;
  uniform float uTime, uFocus, uHover, uReveal, uSeed, uFade, uAspect;
  varying vec2 vUv;
  varying float vDepth;

  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x),
               mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    float lock = uFocus;
    float inst = 1.0 - lock;

    vec2 uv = vUv;

    // Horizontal tearing — whole bands slip sideways while unlocked.
    float band = floor(uv.y * 26.0);
    float slip = (h21(vec2(band, floor(uTime * 9.0 + uSeed))) - 0.5);
    slip *= step(0.55, h21(vec2(band * 1.7, floor(uTime * 9.0)))) * inst * 0.14;
    uv.x += slip;

    // Chromatic split, widening as the signal degrades.
    float split = (0.0016 + inst * 0.020) * (1.0 + uHover * 0.7);
    vec3 col = vec3(
      texture2D(uTex, uv + vec2(split, 0.0)).r,
      texture2D(uTex, uv).g,
      texture2D(uTex, uv - vec2(split, 0.0)).b
    );

    // A hologram emits where the source has marks, not where it has paper —
    // projecting luminance directly turns a white page into a solid slab of
    // light. So the ink drives emission and the paper falls away to nothing.
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float mark = 1.0 - lum;
    vec3 phos = vec3(0.26, 0.98, 1.0);
    // Held well below full: a projection reads as light in a dark room, and
    // pushing emission to 1.0 turns the plate into a lamp with no image on it.
    vec3 emissive = phos * (0.030 + mark * 0.52);
    col = mix(emissive, col * phos * 0.34, 0.14);

    // Dissolve into static.
    float st = vnoise(vUv * vec2(220.0, 420.0) + uTime * 40.0);
    col = mix(vec3(st) * phos * 0.62, col, smoothstep(0.02, 0.72, lock));

    // Scanlines, cut deep — the gaps between lines are what make it a raster
    // rather than a pane of glass.
    col *= 0.52 + 0.48 * (0.5 + 0.5 * sin(vUv.y * 460.0 - uTime * 5.0));
    float roll = fract(vUv.y * 0.6 - uTime * 0.14);
    col += phos * 0.16 * smoothstep(0.93, 1.0, roll) * (0.35 + inst * 0.8);

    // Projector flicker.
    col *= 0.90 + 0.10 * h21(vec2(floor(uTime * 22.0), uSeed));

    // Containment frame.
    vec2 e = abs(vUv - 0.5) * 2.0;
    float edge = max(e.x, e.y);
    col += phos * smoothstep(0.978, 0.999, edge) * (0.30 + uHover * 0.55);
    // Corner brackets read as an instrument rather than a border.
    float cx = step(0.84, e.x), cy = step(0.84, e.y);
    col += phos * 0.32 * cx * cy * smoothstep(0.92, 0.998, edge);

    float a = uFade * (0.30 + lock * 0.70) * smoothstep(0.0, 0.35, uReveal);
    a *= 1.0 - smoothstep(11.0, 15.5, vDepth) * 0.75;
    gl_FragColor = vec4(col * (0.85 + uHover * 0.5), a);
  }
`

const backdrop = /* glsl */`
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv + uPointer * 0.006;
    vec3 col = vec3(0.015, 0.024, 0.030);

    // The projector's own bloom, low and central.
    col += vec3(0.02, 0.14, 0.17) * smoothstep(0.85, 0.0, distance(uv, vec2(0.5, 0.44))) * 0.6;

    // A grid floor receding under the drum — the only thing establishing that
    // this is a room and not a void.
    if (uv.y < 0.44) {
      float persp = 1.0 / max(0.015, 0.44 - uv.y);
      float gx = fract((uv.x - 0.5) * persp * 0.55 + 0.5);
      float gz = fract(persp * 0.30 - uTime * 0.10);
      float lx = smoothstep(0.030, 0.0, abs(gx - 0.5));
      float lz = smoothstep(0.055, 0.0, abs(gz - 0.5));
      col += vec3(0.05, 0.52, 0.60) * (lx + lz) * 0.13 * smoothstep(0.0, 0.36, uv.y);
    }
    gl_FragColor = vec4(col, 1.0);
  }
`

const composite = /* glsl */`
  uniform sampler2D tDiffuse;
  uniform float uTime, uReveal;
  uniform vec2 uRes;
  varying vec2 vUv;

  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    // Whole-frame roll — the screen itself is a monitor, not a window.
    float roll = smoothstep(0.988, 1.0, fract(uv.y * 0.4 - uTime * 0.05));
    uv.x += roll * 0.003;

    vec3 col = texture2D(tDiffuse, uv).rgb;

    // CRT scanlines at true pixel pitch.
    float sl = 0.5 + 0.5 * sin(uv.y * uRes.y * 1.55);
    col *= 0.88 + 0.12 * sl;

    // Aperture grille.
    col *= 0.96 + 0.04 * sin(uv.x * uRes.x * 3.14159);

    col += vec3(0.02, 0.09, 0.11) * roll;
    col += (h21(uv * uRes + fract(uTime) * 91.0) - 0.5) * 0.030;

    // Tube vignette.
    vec2 d = (uv - 0.5) * vec2(1.0, 1.12);
    col *= 1.0 - smoothstep(0.34, 0.86, length(d)) * 0.78;

    // Power-on.
    col *= smoothstep(0.0, 0.5, uReveal);
    gl_FragColor = vec4(col, 1.0);
  }
`

const signal: Concept = {
  id: 'signal',
  clear: 0x04070a,
  camera: { fov: 36, pos: [0, 0.1, 6.6], look: [0, 0, 0] },
  card: {
    aspect: 16 / 9,
    seg: [32, 24],
    vertex,
    fragment,
    uniforms: () => ({ uFade: { value: 1 } })
  },
  backdrop: { fragment: backdrop, dist: 22 },
  composite: { fragment: composite },
  bloom: { strength: 0.30, radius: 0.85, threshold: 0.58 },
  input: { axis: 'y', mode: 'snap', perCard: 320 },

  layout(c, s) {
    const t = wrapT(c.index, s.offset, s.count)
    const th = t * ARC
    c.mesh.position.set(Math.sin(th) * R, Math.sin(th * 1.6) * 0.16, Math.cos(th) * R - R + 2.2)
    c.mesh.rotation.set(0, th, 0)
    // A touch of pointer parallax so the drum feels volumetric at rest.
    c.mesh.rotation.x = s.py * 0.035
    const near = 1 - clamp01(Math.abs(t) / 0.9)
    c.focus = smootherstep(near)
    c.uniforms.uFade.value = 1 - clamp01((Math.abs(t) - 1.35) / 0.5) * 0.85
    const k = 1 + c.focus * 0.06
    c.mesh.scale.set(1.92 * k, (1.92 / (16 / 9)) * k, 1)
  },

  face(ctx, w, h, item, img) {
    ctx.fillStyle = '#04080b'
    ctx.fillRect(0, 0, w, h)
    if (img) {
      ctx.save()
      ctx.globalAlpha = 0.95
      cover(ctx, img, 0, 0, w, h)
      ctx.restore()
    }

    // A readout strip along the bottom: this is instrumentation, so the label
    // is data — channel, title, state — not a caption.
    const barH = Math.round(h * 0.19)
    const g = ctx.createLinearGradient(0, h - barH * 1.9, 0, h)
    g.addColorStop(0, 'rgba(2,10,14,0)')
    g.addColorStop(1, 'rgba(2,10,14,0.94)')
    ctx.fillStyle = g
    ctx.fillRect(0, h - barH * 1.9, w, barH * 1.9)

    ctx.fillStyle = '#7ff6ff'
    ctx.font = `500 ${Math.round(h * 0.045)}px ${MONO}`
    ctx.textBaseline = 'alphabetic'
    tracked(ctx, `[ ${item.meta?.toUpperCase() ?? 'CHANNEL'} ]`, w * 0.055, h - barH * 1.02, h * 0.012)

    ctx.fillStyle = '#eafdff'
    ctx.font = `700 ${Math.round(h * 0.105)}px ${SANS}`
    ctx.fillText(item.label.toUpperCase(), w * 0.055, h - barH * 0.30)

    ctx.strokeStyle = 'rgba(127,246,255,0.55)'
    ctx.lineWidth = Math.max(2, h * 0.005)
    ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2)
  }
}

export default signal
