/**
 * FOLD — one surface, two sides, no seam.
 *
 * Geometry: a Möbius band. The cards ride a loop that carries a half twist, so
 * travelling the loop once rotates every card exactly 180°. Nothing "flips" a
 * card — the geometry turns it over, because on a Möbius strip front and back
 * are the same surface.
 *
 * That gives the concept something the other four don't have: a *second page*
 * for free. The face carries the work; the reverse carries the index — number,
 * title, subject, the line of description. Travelling the band is therefore
 * literally reading recto and verso.
 *
 * Material: matte card stock. A crease highlight runs where the twist is
 * sharpest, and the stock warms very slightly toward its edges the way real
 * board does under a light.
 */
import { wrapT, clamp01, type Concept } from '../Stage'
import { cover, tracked, wrap, MONO, SANS, SERIF } from '../draw'

const R = 3.35
const TURN = 1.30           // radians of loop per card

const vertex = /* glsl */`
  uniform float uTime, uFocus;
  varying vec2 vUv;
  varying vec3 vNormalW;
  void main() {
    vUv = uv;
    vec3 p = position;
    // A gentle cross-band curve: board on a curve is never flat.
    p.z += (0.5 - abs(uv.x - 0.5)) * 0.10;
    vNormalW = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */`
  uniform sampler2D uTex;
  uniform sampler2D uBack;
  uniform float uTime, uFocus, uHover, uReveal, uSeed, uFade, uAspect;
  varying vec2 vUv;
  varying vec3 vNormalW;

  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    // The strip has one surface; which side you are looking at is a fact of
    // where you are standing on it, not a property of the card.
    bool front = gl_FrontFacing;
    vec2 uv = front ? vUv : vec2(1.0 - vUv.x, vUv.y);
    vec3 col = (front ? texture2D(uTex, uv) : texture2D(uBack, uv)).rgb;

    // Matte stock: fibre, and a soft lift toward the top edge.
    float fibre = h21(floor(vUv * vec2(1100.0, 700.0)) + uSeed);
    col *= 0.972 + fibre * 0.056;
    col *= 0.94 + 0.06 * smoothstep(0.0, 1.0, vUv.y);

    // Directional light on the board — this is what makes the twist readable.
    // Kept well off zero: the twist should read as shading, not as darkness.
    float lambert = clamp(dot(normalize(vNormalW), normalize(vec3(0.35, 0.55, 0.75))), 0.0, 1.0);
    col *= 0.82 + 0.34 * lambert;

    // Crease highlight along the spine of the fold.
    float crease = exp(-pow((vUv.x - 0.5) * 7.0, 2.0));
    col += (1.0 - col) * crease * 0.055;

    // Cut edge and a hairline keyline.
    vec2 e = abs(vUv - 0.5) * 2.0;
    float edge = max(e.x, e.y);
    col = mix(col, col * 0.55, smoothstep(0.988, 1.0, edge));

    col *= 0.88 + uFocus * 0.12;
    col += (1.0 - col) * uHover * 0.06;

    gl_FragColor = vec4(col, uFade * smoothstep(0.0, 0.3, uReveal));
  }
`

const backdrop = /* glsl */`
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  void main() {
    // A seamless studio sweep: the band should look photographed, not rendered.
    vec2 uv = vUv + uPointer * 0.008;
    float sweep = smoothstep(0.0, 1.0, uv.y);
    vec3 col = mix(vec3(0.055, 0.052, 0.058), vec3(0.20, 0.196, 0.205), sweep);
    col += vec3(0.045) * smoothstep(0.85, 0.0, distance(uv, vec2(0.5, 0.72)));
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
    col = clamp((col - 0.5) * 1.05 + 0.5, 0.0, 1.0);
    col *= 0.99 + (h21(vUv * uRes) - 0.5) * 0.024;
    col *= 1.0 - smoothstep(0.55, 1.15, length((vUv - 0.5) * vec2(1.0, 1.1))) * 0.28;
    col *= smoothstep(0.0, 0.45, uReveal);
    gl_FragColor = vec4(col, 1.0);
  }
`

const fold: Concept = {
  id: 'fold',
  clear: 0x0d0d10,
  camera: { fov: 36, pos: [0, 0.40, 6.3], look: [0, 0.06, 0] },
  card: {
    aspect: 1 / 1.28,
    seg: [28, 28],
    vertex,
    fragment,
    depthWrite: true,
    uniforms: () => ({ uFade: { value: 1 } })
  },
  backdrop: { fragment: backdrop, dist: 24 },
  composite: { fragment: composite },
  bloom: { strength: 0.16, radius: 0.8, threshold: 0.72 },
  input: { axis: 'y', mode: 'snap', perCard: 340 },

  layout(c, s) {
    const t = wrapT(c.index, s.offset, s.count)
    const th = t * TURN

    // Position on the loop.
    c.mesh.position.set(Math.sin(th) * R, Math.sin(th * 0.5) * 0.30, Math.cos(th) * R - R + 2.9)

    // Face outward along the radius, then twist about the tangent. Half a turn
    // over a full circuit is what makes the band one-sided.
    c.mesh.rotation.set(th * 0.5, th, 0)

    c.focus = 1 - clamp01(Math.abs(t) / 0.8)
    c.uniforms.uFade.value = 1 - clamp01((Math.abs(t) - 1.5) / 0.55) * 0.9
    const k = 1.12 + c.focus * 0.07
    c.mesh.scale.set(k, k * 1.28, 1)
  },

  face(ctx, w, h, item, img) {
    ctx.fillStyle = '#f0eeea'
    ctx.fillRect(0, 0, w, h)
    if (img) {
      ctx.save()
      ctx.beginPath(); ctx.rect(w * 0.06, h * 0.06, w * 0.88, h * 0.62); ctx.clip()
      cover(ctx, img, w * 0.06, h * 0.06, w * 0.88, h * 0.62)
      ctx.restore()
    }
    const M = w * 0.075
    ctx.fillStyle = '#14130f'
    ctx.font = `700 ${Math.round(h * 0.070)}px ${SANS}`
    const lines = wrap(ctx, item.label, w - M * 2)
    let y = h * 0.795
    lines.forEach((l) => { ctx.fillText(l, M, y); y += h * 0.070 })

    ctx.font = `500 ${Math.round(h * 0.023)}px ${MONO}`
    ctx.fillStyle = 'rgba(20,19,15,0.55)'
    tracked(ctx, (item.meta ?? '').toUpperCase(), M, h * 0.935, h * 0.005)
  },

  back(ctx, w, h, item, i) {
    // The verso: no image at all, just the index. A back should be quieter
    // than a front, and it should carry the information the front can't.
    ctx.fillStyle = '#191813'
    ctx.fillRect(0, 0, w, h)

    const M = w * 0.10
    ctx.fillStyle = 'rgba(240,238,234,0.30)'
    ctx.fillRect(M, h * 0.16, w - M * 2, Math.max(1, h * 0.0016))

    ctx.fillStyle = 'rgba(240,238,234,0.55)'
    ctx.font = `500 ${Math.round(h * 0.024)}px ${MONO}`
    tracked(ctx, 'VERSO', M, h * 0.125, h * 0.006)
    ctx.textAlign = 'right'
    ctx.fillText(String(i + 1).padStart(2, '0'), w - M, h * 0.125)
    ctx.textAlign = 'left'

    ctx.fillStyle = '#f2f0ec'
    ctx.font = `400 ${Math.round(h * 0.088)}px ${SERIF}`
    let y = h * 0.30
    wrap(ctx, item.label, w - M * 2).forEach((l) => { ctx.fillText(l, M, y); y += h * 0.088 })

    ctx.fillStyle = 'rgba(240,238,234,0.62)'
    ctx.font = `400 ${Math.round(h * 0.040)}px ${SANS}`
    y += h * 0.030
    wrap(ctx, item.description, w - M * 2).forEach((l) => { ctx.fillText(l, M, y); y += h * 0.052 })

    ctx.fillStyle = 'rgba(240,238,234,0.30)'
    ctx.fillRect(M, h * 0.90, w - M * 2, Math.max(1, h * 0.0016))
    ctx.fillStyle = 'rgba(240,238,234,0.5)'
    ctx.font = `500 ${Math.round(h * 0.022)}px ${MONO}`
    tracked(ctx, (item.meta ?? '').toUpperCase(), M, h * 0.945, h * 0.005)
  }
}

export default fold
