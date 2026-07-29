/**
 * BLEED — ink finding its way through wet paper.
 *
 * Geometry: the spiral is laid *flat*, on a sheet tilted away from the reader,
 * and it winds inward. Cards travel from the outer edge toward the centre and
 * are absorbed there. Because the whole figure sits on one plane you read it
 * as a drawing on paper rather than objects in a void — which is the point.
 *
 * Motion: selection is a press-and-hold. Ink spreads from where your finger
 * rests until it floods the card and the page gives way. Holding is the right
 * verb here: ink takes time, and making the reader wait for it is what sells
 * the material.
 *
 * Material: nothing is a rectangle. Every card is a blot — an SDF perturbed by
 * fractal noise, feathered at the edge, haloed where the ink has wicked into
 * the fibre. The artwork inside is reduced to a single ink on a single paper.
 */
import { wrapT, clamp01, type Concept } from '../Stage'
import { contain, tracked, wrap, MONO, SERIF } from '../draw'

const TILT = 0.62          // radians the paper leans away from the reader
const TURN = 1.62          // radians of spiral per card — ~1.5 turns over the set
const R0 = 0.30            // radius where ink is finally absorbed
const DR = 0.55            // radial gain per card
// Phased so the reading position lands at the near edge of the figure, square
// to the reader, rather than somewhere off along the curve.
const PHASE = -Math.PI / 2 + TURN

const NOISE = /* glsl */`
  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x),
               mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int k = 0; k < 5; k++) { v += a * vnoise(p); p *= 2.02; a *= 0.5; }
    return v;
  }
`

const vertex = /* glsl */`
  uniform float uTime, uFocus;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Wet paper never lies perfectly flat.
    p.z += sin(uv.x * 4.2 + uTime * 0.5) * cos(uv.y * 3.4 - uTime * 0.4) * 0.012 * (0.4 + uFocus);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */`
  uniform sampler2D uTex;
  uniform float uTime, uFocus, uHover, uReveal, uSeed, uAspect, uFade, uHeld;
  uniform vec2 uPointer;
  varying vec2 vUv;
  ${NOISE}

  const vec3 INK   = vec3(0.055, 0.075, 0.185);   // deep indigo, not black
  const vec3 PAPER = vec3(0.945, 0.930, 0.895);

  void main() {
    // Rounded-rect distance field, then torn apart by fractal noise so the
    // boundary is a wicking front rather than a cut.
    vec2 p  = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 hs = vec2(uAspect, 1.0) * 0.5 - 0.075;
    vec2 d  = abs(p) - hs;
    float sdf = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.070;

    float ragged = fbm(vUv * 4.6 + uSeed) - 0.5;
    float fine   = fbm(vUv * 17.0 - uSeed) - 0.5;
    sdf += ragged * 0.075 + fine * 0.022;

    float body = smoothstep(0.008, -0.016, sdf);
    float wick = smoothstep(0.085, -0.005, sdf);      // the halo in the fibre

    // The artwork, reduced to one ink on one paper.
    vec3 src = texture2D(uTex, vUv).rgb;
    float lum = dot(src, vec3(0.299, 0.587, 0.114));
    lum = clamp((lum - 0.46) * 1.5 + 0.46, 0.0, 1.0);
    // Denser ink where the artwork is dark; paper shows through the lights.
    vec3 col = mix(INK, PAPER, smoothstep(0.10, 0.92, lum));

    // Unfocused cards have not fully soaked in yet: less coverage, more paper.
    col = mix(PAPER, col, 0.62 + uFocus * 0.38);

    // Wicking halo around the whole blot.
    col = mix(col, INK, wick * 0.30 * (1.0 - body));

    // Granulation — ink pooling in the tooth of the paper.
    float gran = fbm(vUv * 30.0 + 11.0);
    col = mix(col, col * 0.90, gran * 0.28 * body);

    // Press and hold: a flood front spreading from the fingertip.
    float reach = uHeld * 1.65;
    float flood = smoothstep(reach, reach - 0.30, distance(vUv * vec2(uAspect, 1.0), uPointer * vec2(uAspect, 1.0)));
    flood *= step(0.001, uHeld);
    col = mix(col, INK, flood);

    // Wet sheen on the card being read.
    float sheen = exp(-pow((vUv.x * 0.6 + vUv.y * 0.4 - fract(uTime * 0.06)) * 5.0, 2.0));
    col += (1.0 - col) * sheen * 0.05 * uFocus;

    float a = body * uFade * smoothstep(0.0, 0.35, uReveal);
    a = max(a, wick * 0.16 * uFade * smoothstep(0.0, 0.35, uReveal));
    gl_FragColor = vec4(col, a);
  }
`

const backdrop = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  ${NOISE}
  void main() {
    vec3 paper = vec3(0.918, 0.900, 0.860);
    // Laid fibre, drawn coarse across and fine down.
    float fib = fbm(vUv * vec2(60.0, 320.0));
    paper *= 0.965 + fib * 0.07;
    // Old stains, breathing very slowly.
    float stain = fbm(vUv * 2.4 + vec2(uTime * 0.01, 0.0));
    paper = mix(paper, vec3(0.875, 0.845, 0.785), smoothstep(0.56, 0.85, stain) * 0.55);
    paper *= 1.0 - smoothstep(0.35, 1.0, length((vUv - vec2(0.5, 0.56)) * vec2(1.0, 1.15))) * 0.26;
    gl_FragColor = vec4(paper, 1.0);
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
    col *= 0.98 + (h21(vUv * uRes * 0.6) - 0.5) * 0.05;
    // Warm the whole sheet very slightly — paper is never neutral.
    col *= vec3(1.012, 1.0, 0.976);
    col *= 1.0 - smoothstep(0.44, 1.05, length((vUv - 0.5) * vec2(1.0, 1.12))) * 0.26;
    col = mix(vec3(0.93, 0.915, 0.878), col, smoothstep(0.0, 0.5, uReveal));
    gl_FragColor = vec4(col, 1.0);
  }
`

const bleed: Concept = {
  id: 'bleed',
  clear: 0xe9e3d6,
  camera: { fov: 40, pos: [0, 1.15, 4.15], look: [-0.20, 0.04, -0.15] },
  card: {
    aspect: 16 / 10,
    seg: [28, 24],
    vertex,
    fragment,
    rotationOrder: 'XYZ',
    uniforms: () => ({ uFade: { value: 1 } })
  },
  backdrop: { fragment: backdrop, dist: 24 },
  composite: { fragment: composite },
  input: { axis: 'y', mode: 'snap', perCard: 330 },
  selectOn: 'hold',

  layout(c, s) {
    // k runs 0 (absorbed at the centre) → count (waiting at the outer edge).
    const k = wrapT(c.index, s.offset, s.count) + s.count / 2
    const th = -k * TURN + PHASE
    const r = R0 + k * DR

    const px = Math.cos(th) * r
    const py = Math.sin(th) * r

    // The reading position is one turn out from the centre.
    const f = 1 - clamp01(Math.abs(k - 1) / 0.8)
    c.focus = f
    const lift = f * f * (3 - 2 * f)

    // Cards lie flat on a sheet leaning away from the reader — except the one
    // being read, which peels up off the page to face them. Ink lifting off
    // the paper is the whole gesture, and it's also what makes it legible.
    c.mesh.position.set(
      px,
      py * Math.sin(TILT) + lift * 0.66,
      -py * Math.cos(TILT) + lift * 0.42
    )
    c.mesh.rotation.set(
      (TILT - Math.PI / 2) * (1 - lift * 0.94),
      0,
      (th + Math.PI / 2) * (1 - lift)
    )

    // Cards shrink as they wind in and are absorbed.
    const scale = (0.44 + k * 0.19) * (1 + lift * 0.42)
    c.mesh.scale.set(scale * (16 / 10), scale, 1)
    c.uniforms.uFade.value = clamp01(k / 0.5) * (1 - clamp01((k - (s.count - 0.9)) / 0.7))
  },

  face(ctx, w, h, item, img) {
    ctx.fillStyle = '#f2ecdd'
    ctx.fillRect(0, 0, w, h)

    if (img) {
      ctx.save()
      ctx.globalAlpha = 0.9
      contain(ctx, img, w * 0.07, h * 0.06, w * 0.86, h * 0.56)
      ctx.restore()
    }

    const M = w * 0.075
    ctx.fillStyle = '#0e1330'

    ctx.font = `500 ${Math.round(h * 0.032)}px ${MONO}`
    tracked(ctx, (item.meta ?? '').toUpperCase(), M, h * 0.735, h * 0.008)

    ctx.font = `400 ${Math.round(h * 0.115)}px ${SERIF}`
    ctx.fillText(item.label, M, h * 0.855)

    ctx.font = `400 ${Math.round(h * 0.042)}px ${SERIF}`
    ctx.fillStyle = 'rgba(14,19,48,0.72)'
    const lines = wrap(ctx, item.description, w - M * 2)
    let y = h * 0.915
    lines.slice(0, 2).forEach((l) => { ctx.fillText(l, M, y); y += h * 0.052 })
  }
}

export default bleed
