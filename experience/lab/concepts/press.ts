/**
 * PRESS — the portfolio as a stack of sheets coming off a press.
 *
 * Geometry: no orbit at all. Sheets lie stacked in depth, the top one square to
 * the reader, the rest visible only as edges. That single change removes the
 * carousel's biggest weakness — that everything is always half-visible and
 * therefore nothing is ever fully read.
 *
 * Motion: you don't scrub, you *turn a page*. A flick commits exactly one
 * sheet, which hinges up and over the reader's head. The gesture is discrete
 * because printed matter is discrete.
 *
 * Material: a genuine halftone screen — rotated dot lattice, dot radius driven
 * by local luminance — applied to the photography only, so the type stays as
 * crisp as real letterpress beside a screened plate. Black ink, bone paper,
 * nothing else. The restraint is the art direction.
 */
import { wrapT, clamp01, type Concept } from '../Stage'
import { contain, tracked, wrap, MONO, SANS } from '../draw'

// The screened plate, in UV (origin bottom-left) — shared by the painter and
// the shader so the halftone lands exactly on the photograph and nowhere else.
const PLATE = { x: 0.055, y: 0.335, w: 0.89, h: 0.465 }

const vertex = /* glsl */`
  uniform float uCurl, uTime, uFocus;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Paper bends as it is lifted — the leading edge lifts most.
    float lift = smoothstep(-0.5, 0.5, uv.y);
    p.z += lift * lift * uCurl;
    // A resting sheet still breathes very slightly.
    p.z += sin(uv.x * 3.14159) * 0.006 * uFocus * sin(uTime * 0.7);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */`
  uniform sampler2D uTex;
  uniform float uTime, uFocus, uHover, uReveal, uSeed, uAspect, uFade;
  uniform vec4 uPlate;
  varying vec2 vUv;

  const vec3 INK   = vec3(0.055, 0.052, 0.050);
  const vec3 PAPER = vec3(0.925, 0.915, 0.885);

  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec4 src = texture2D(uTex, vUv);
    vec3 col = src.rgb;

    // Is this fragment inside the screened plate?
    vec2 rel = (vUv - uPlate.xy) / uPlate.zw;
    float inPlate = step(0.0, rel.x) * step(rel.x, 1.0) * step(0.0, rel.y) * step(rel.y, 1.0);

    if (inPlate > 0.5) {
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      // Open the shadows well past the source's own black point — the plate
      // art already carries plenty of dark ink of its own (illustrations,
      // not just photos), and screening it on top of that used to crush
      // everything below mid-gray into a solid, illegible mass.
      lum = clamp(lum * 1.02 + 0.10, 0.0, 1.0);

      // Rotated dot lattice — 15° is the classic black screen angle.
      float freq = 232.0 + uHover * 12.0;
      vec2 sc = vec2(vUv.x * uAspect, vUv.y) * freq;
      const float a = 0.2618;
      vec2 rc = vec2(sc.x * cos(a) - sc.y * sin(a), sc.x * sin(a) + sc.y * cos(a));
      vec2 cell = fract(rc) - 0.5;
      float d = length(cell);

      // Dot area tracks ink coverage; sqrt keeps midtones where the eye wants
      // them. Capped well under the cell's own half-diagonal so even the
      // darkest coverage still reads as dots, not a solid ink block.
      float radius = sqrt(1.0 - lum) * 0.58;
      float aa = max(fwidth(d) * 1.1, 0.004);
      float dotMask = smoothstep(radius + aa, radius - aa, d);

      col = mix(PAPER, INK, dotMask);
    }

    // Press texture: laid paper, and a whisper of misregistration at the edges.
    float grain = h21(floor(vUv * vec2(1400.0, 900.0)) + uSeed);
    col *= 0.975 + grain * 0.05;

    // Sheets behind the top one sit in its shadow.
    col *= mix(0.80, 1.0, uFocus);
    // Ink gains very slightly under the reader's attention.
    col = mix(col, col * 0.94, uHover * 0.5);

    // Cut edge.
    vec2 e = abs(vUv - 0.5) * 2.0;
    float edge = max(e.x, e.y);
    col = mix(col, INK, smoothstep(0.994, 1.0, edge) * 0.55);

    float a = uFade * smoothstep(0.0, 0.3, uReveal);
    gl_FragColor = vec4(col, a);
  }
`

const backdrop = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    // The bed the sheets are stacked on: bone, lit from above, nothing else.
    vec3 col = mix(vec3(0.82, 0.81, 0.78), vec3(0.90, 0.89, 0.865), smoothstep(0.0, 0.9, vUv.y));
    col *= 1.0 - smoothstep(0.30, 0.95, length((vUv - vec2(0.5, 0.55)) * vec2(1.0, 1.2))) * 0.30;
    col *= 0.985 + h21(floor(vUv * 900.0)) * 0.03;
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
    vec3 col = texture2D(tDiffuse, vUv).rgb;
    // One ink, one paper: strip every last trace of hue from the whole frame.
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = vec3(lum);
    col = clamp((col - 0.5) * 1.13 + 0.5, 0.0, 1.0);
    col *= 0.985 + (h21(vUv * uRes) - 0.5) * 0.045;
    col *= 1.0 - smoothstep(0.45, 1.05, length((vUv - 0.5) * vec2(1.0, 1.15))) * 0.30;
    col = mix(vec3(1.0), col, smoothstep(0.0, 0.45, uReveal));
    gl_FragColor = vec4(col, 1.0);
  }
`

const press: Concept = {
  id: 'press',
  clear: 0xdedbd2,
  camera: { fov: 34, pos: [0, 0.75, 5.0], look: [0, -0.12, 0] },
  card: {
    aspect: 1 / 1.35,           // portrait — a printed page, not a screen
    seg: [24, 32],
    vertex,
    fragment,
    depthWrite: true,
    uniforms: () => ({
      uCurl: { value: 0 },
      uFade: { value: 1 },
      uPlate: { value: new Float32Array([PLATE.x, PLATE.y, PLATE.w, PLATE.h]) }
    })
  },
  backdrop: { fragment: backdrop, dist: 26 },
  composite: { fragment: composite },
  input: { axis: 'y', mode: 'flick', perCard: 300 },

  layout(c, s) {
    const t = wrapT(c.index, s.offset, s.count)
    // Sized so a whole sheet clears the chrome at the top and bottom of the
    // frame — a page you can only see the middle of isn't a page.
    const W = 1.78, H = W * 1.35

    if (t >= -0.02) {
      // Waiting in the stack. The one you can actually read lifts very
      // slightly toward you under the pointer — feedback that it's live,
      // sized to feel like a response rather than a decoration.
      const lift = c.hover * 0.05
      c.mesh.position.set(0, -t * 0.085, -t * 0.36 + lift)
      c.mesh.rotation.set(-0.075 - t * 0.012, 0, t * 0.006)
      c.uniforms.uCurl.value = 0
      c.uniforms.uFade.value = 1
      const k = 1 - t * 0.012 + c.hover * 0.012
      c.mesh.scale.set(W * k, H * k, 1)
    } else {
      // Turning: hinged at the far edge, up and over the reader.
      const u = clamp01(-t)
      const e = u * u * (3 - 2 * u)
      c.mesh.position.set(0, e * 3.05 + 0.10 * e, e * 2.35)
      c.mesh.rotation.set(-0.075 - e * 1.62, 0, 0)
      c.uniforms.uCurl.value = e * 0.42
      c.uniforms.uFade.value = 1 - clamp01((u - 0.55) / 0.42)
      c.mesh.scale.set(W, H, 1)
    }
    c.focus = 1 - clamp01(Math.abs(t) / 0.55)
  },

  face(ctx, w, h, item, img, i) {
    ctx.fillStyle = '#eceadf'
    ctx.fillRect(0, 0, w, h)

    const M = w * 0.055
    const ink = '#0e0d0c'

    // Masthead rule + folio: the furniture of a printed page.
    ctx.fillStyle = ink
    ctx.fillRect(M, h * 0.048, w - M * 2, Math.max(2, h * 0.0035))

    ctx.font = `500 ${Math.round(h * 0.019)}px ${MONO}`
    ctx.textBaseline = 'alphabetic'
    tracked(ctx, 'ENTERTRAINER', M, h * 0.040, h * 0.004)
    const folio = String(i + 1).padStart(2, '0')
    ctx.textAlign = 'right'
    ctx.font = `500 ${Math.round(h * 0.019)}px ${MONO}`
    ctx.fillText(`${folio} / 04`, w - M, h * 0.040)
    ctx.textAlign = 'left'

    // The screened plate.
    const px = PLATE.x * w
    const pw = PLATE.w * w
    const py = (1 - PLATE.y - PLATE.h) * h
    const ph = PLATE.h * h
    ctx.fillStyle = '#c9c6bd'
    ctx.fillRect(px, py, pw, ph)
    if (img) {
      ctx.save()
      ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip()
      contain(ctx, img, px, py, pw, ph)
      ctx.restore()
    }

    // Eyebrow above the plate.
    ctx.fillStyle = ink
    ctx.font = `500 ${Math.round(h * 0.020)}px ${MONO}`
    tracked(ctx, (item.meta ?? '').toUpperCase(), M, py - h * 0.022, h * 0.005)

    // The headline, set tight and large — the page's whole voice.
    ctx.font = `700 ${Math.round(h * 0.088)}px ${SANS}`
    const lines = wrap(ctx, item.label.toUpperCase(), w - M * 2)
    let ty = py + ph + h * 0.098
    lines.forEach((l) => { ctx.fillText(l, M, ty); ty += h * 0.086 })

    // Standfirst.
    ctx.font = `400 ${Math.round(h * 0.030)}px ${SANS}`
    ctx.fillStyle = 'rgba(14,13,12,0.72)'
    const deck = wrap(ctx, item.description, w - M * 2)
    ty += h * 0.006
    deck.slice(0, 3).forEach((l) => { ctx.fillText(l, M, ty); ty += h * 0.040 })

    // Foot rule.
    ctx.fillStyle = ink
    ctx.fillRect(M, h - h * 0.058, w - M * 2, Math.max(1, h * 0.002))
    ctx.font = `500 ${Math.round(h * 0.018)}px ${MONO}`
    tracked(ctx, 'FLICK UP TO TURN', M, h - h * 0.030, h * 0.004)
  }
}

export default press
