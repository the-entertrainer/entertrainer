/**
 * ASSEMBLY — the same four things, re-formed into whatever shape answers the
 * question you're asking.
 *
 * Every other concept here moves *content past a reader*. This one doesn't
 * move the content at all: scrolling rebuilds the formation the cards are
 * standing in — grid, ring, helix, column — and each formation is a different
 * claim about the material. A grid says "these are four peers". A ring says
 * "these surround one practice". A helix says "these happened in an order". A
 * column says "start here".
 *
 * A live lattice draws the relationships as they re-form, so the transition is
 * legible as structure rather than as animation. That is the whole argument:
 * layout is an editorial act, and here you can watch it being made.
 */
import {
  BufferGeometry, BufferAttribute, LineSegments, LineBasicMaterial, AdditiveBlending,
  type Scene
} from 'three'
import { clamp01, type Concept, type CardView, type StageState } from '../Stage'
import { contain, tracked, wrap, MONO, SANS } from '../draw'

interface Pose { x: number; y: number; z: number; rx: number; ry: number; s: number }

const FORMATIONS: Array<{ name: string; pose: (i: number, n: number) => Pose }> = [
  {
    // GRID — four peers, no hierarchy.
    name: 'grid',
    pose: (i, n) => {
      const cols = Math.ceil(Math.sqrt(n))
      const col = i % cols
      const row = Math.floor(i / cols)
      const rows = Math.ceil(n / cols)
      return {
        x: (col - (cols - 1) / 2) * 2.42,
        y: ((rows - 1) / 2 - row) * 1.55,
        z: 0, rx: 0, ry: 0, s: 1
      }
    }
  },
  {
    // RING — four faces of one practice.
    name: 'ring',
    pose: (i, n) => {
      const th = (i / n) * Math.PI * 2
      return { x: Math.sin(th) * 2.75, y: 0, z: Math.cos(th) * 2.75 - 0.8, rx: 0, ry: th, s: 1 }
    }
  },
  {
    // HELIX — the original spiral, kept honestly as one option among several.
    name: 'helix',
    pose: (i, n) => {
      const th = i * 1.05
      return {
        x: Math.sin(th) * 2.15,
        y: (i - (n - 1) / 2) * 0.92,
        z: Math.cos(th) * 2.15 - 0.8,
        rx: 0, ry: th, s: 0.95
      }
    }
  },
  {
    // COLUMN — a reading order, receding.
    name: 'column',
    pose: (i, n) => ({
      x: 0, y: ((n - 1) / 2 - i) * 0.34, z: -i * 1.62 + 1.7, rx: -0.10, ry: 0,
      s: 1 - i * 0.02
    })
  }
]

export const FORMATION_NAMES = FORMATIONS.map((f) => f.name)

/** Which formation is on screen, and how far into the next one. */
export function formationAt(offset: number) {
  const m = offset * 0.5
  const f = Math.floor(m)
  const k = m - f
  const a = ((f % FORMATIONS.length) + FORMATIONS.length) % FORMATIONS.length
  const b = (a + 1) % FORMATIONS.length
  return { a, b, k, name: FORMATIONS[a].name, next: FORMATIONS[b].name }
}

const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const mix = (a: number, b: number, t: number) => a + (b - a) * t

const vertex = /* glsl */`
  uniform float uTime, uMorph;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Cards flex fractionally while the structure is being rebuilt.
    p.z += sin(uv.x * 3.14159) * sin(uv.y * 3.14159) * 0.055 * uMorph;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */`
  uniform sampler2D uTex;
  uniform float uTime, uHover, uReveal, uSeed, uMorph, uAspect, uFade;
  varying vec2 vUv;

  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec3 col = texture2D(uTex, vUv).rgb;

    // Drafting stock: cool, matte, very slightly toothed.
    col *= 0.985 + h21(floor(vUv * vec2(900.0, 620.0)) + uSeed) * 0.03;

    // Registration edge.
    vec2 e = abs(vUv - 0.5) * 2.0;
    float edge = max(e.x, e.y);
    col = mix(col, vec3(0.09, 0.11, 0.14), smoothstep(0.986, 1.0, edge) * 0.7);

    // While the formation rebuilds, a survey line sweeps the plate.
    float scan = exp(-pow((vUv.y - fract(uTime * 0.35)) * 16.0, 2.0));
    col += vec3(0.10, 0.35, 0.42) * scan * uMorph * 0.55;

    // Selection.
    col = mix(col, col * vec3(0.96, 1.02, 1.05), uHover);
    col += vec3(0.06, 0.20, 0.24) * smoothstep(0.93, 1.0, edge) * uHover;

    gl_FragColor = vec4(col, uFade * smoothstep(0.0, 0.3, uReveal));
  }
`

const backdrop = /* glsl */`
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv + uPointer * 0.004;
    vec3 col = mix(vec3(0.055, 0.062, 0.075), vec3(0.085, 0.095, 0.112), smoothstep(0.1, 1.0, uv.y));
    // The drawing sheet's own modular grid.
    vec2 g = fract(uv * vec2(34.0, 19.0));
    float minor = smoothstep(0.035, 0.0, min(g.x, g.y));
    vec2 G = fract(uv * vec2(6.8, 3.8));
    float major = smoothstep(0.012, 0.0, min(G.x, G.y));
    col += vec3(0.10, 0.30, 0.36) * minor * 0.055;
    col += vec3(0.12, 0.38, 0.45) * major * 0.10;
    col *= 1.0 - smoothstep(0.4, 1.05, length((uv - 0.5) * vec2(1.0, 1.15))) * 0.35;
    gl_FragColor = vec4(col, 1.0);
  }
`

const composite = /* glsl */`
  uniform sampler2D tDiffuse;
  uniform float uTime, uReveal;
  uniform vec2 uRes;
  varying vec2 vUv;
  void main() {
    vec3 col = texture2D(tDiffuse, vUv).rgb;
    // Corner crop marks — the frame is a drawing, and drawings get trimmed.
    vec2 d = min(vUv, 1.0 - vUv) * uRes;
    float bar = step(d.x, 1.5) * step(28.0, d.y) * step(d.y, 74.0)
              + step(d.y, 1.5) * step(28.0, d.x) * step(d.x, 74.0);
    col += vec3(0.16, 0.46, 0.54) * bar * 0.75;
    col *= 1.0 - smoothstep(0.5, 1.1, length((vUv - 0.5) * vec2(1.0, 1.1))) * 0.30;
    col *= smoothstep(0.0, 0.45, uReveal);
    gl_FragColor = vec4(col, 1.0);
  }
`

let lattice: LineSegments | null = null

const assembly: Concept = {
  id: 'assembly',
  clear: 0x0b0e12,
  camera: { fov: 40, pos: [0, 0.55, 7.4], look: [0, 0, -0.4] },
  card: {
    aspect: 4 / 3,
    seg: [20, 20],
    vertex,
    fragment,
    depthWrite: true,
    uniforms: () => ({ uMorph: { value: 0 }, uFade: { value: 1 } })
  },
  backdrop: { fragment: backdrop, dist: 26 },
  composite: { fragment: composite },
  bloom: { strength: 0.22, radius: 0.7, threshold: 0.65 },
  input: { axis: 'y', mode: 'free', perCard: 420 },

  build(scene: Scene) {
    const geo = new BufferGeometry()
    // Each card links to the next around the loop, and to the hub.
    const segs = 8 * 2
    geo.setAttribute('position', new BufferAttribute(new Float32Array(segs * 2 * 3), 3))
    lattice = new LineSegments(geo, new LineBasicMaterial({
      color: 0x2f8ea6, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false
    }))
    lattice.frustumCulled = false
    scene.add(lattice)

    return (cards: CardView[], s: StageState) => {
      if (!lattice) return
      const attr = lattice.geometry.getAttribute('position') as BufferAttribute
      const arr = attr.array as Float32Array
      const n = cards.length
      let o = 0
      for (let i = 0; i < n; i++) {
        const a = cards[i].mesh.position
        const b = cards[(i + 1) % n].mesh.position
        arr[o++] = a.x; arr[o++] = a.y; arr[o++] = a.z
        arr[o++] = b.x; arr[o++] = b.y; arr[o++] = b.z
        // Spoke to the hub — the thing all four have in common.
        arr[o++] = a.x; arr[o++] = a.y; arr[o++] = a.z
        arr[o++] = 0; arr[o++] = 0; arr[o++] = -0.8
      }
      for (; o < arr.length; o++) arr[o] = 0
      attr.needsUpdate = true
      const { k } = formationAt(s.offset)
      const morph = Math.sin(clamp01(k) * Math.PI)
      ;(lattice.material as LineBasicMaterial).opacity = 0.20 + morph * 0.55
    }
  },

  layout(c, s) {
    const { a, b, k } = formationAt(s.offset)
    const t = ease(clamp01(k))
    const pa = FORMATIONS[a].pose(c.index, s.count)
    const pb = FORMATIONS[b].pose(c.index, s.count)

    c.mesh.position.set(mix(pa.x, pb.x, t), mix(pa.y, pb.y, t), mix(pa.z, pb.z, t))
    // Shortest-path interpolation, so a card never unwinds the long way round.
    let dry = pb.ry - pa.ry
    while (dry > Math.PI) dry -= Math.PI * 2
    while (dry < -Math.PI) dry += Math.PI * 2
    c.mesh.rotation.set(mix(pa.rx, pb.rx, t), pa.ry + dry * t, 0)

    const scale = mix(pa.s, pb.s, t) * 1.62
    c.mesh.scale.set(scale, scale * 0.75, 1)

    // Everything is legible in every formation, so everything stays selectable.
    c.focus = 1
    c.uniforms.uMorph.value = Math.sin(clamp01(k) * Math.PI)
  },

  face(ctx, w, h, item, img, i) {
    ctx.fillStyle = '#eef1f3'
    ctx.fillRect(0, 0, w, h)

    const M = w * 0.055
    // Plate window.
    const iy = h * 0.20, ih = h * 0.50
    ctx.fillStyle = '#dfe4e8'
    ctx.fillRect(M, iy, w - M * 2, ih)
    if (img) {
      ctx.save()
      ctx.beginPath(); ctx.rect(M, iy, w - M * 2, ih); ctx.clip()
      contain(ctx, img, M, iy, w - M * 2, ih)
      ctx.restore()
    }
    ctx.strokeStyle = 'rgba(16,24,32,0.35)'
    ctx.lineWidth = Math.max(1, w * 0.0016)
    ctx.strokeRect(M, iy, w - M * 2, ih)

    // Drafting header: item designation and coordinates.
    ctx.fillStyle = '#101820'
    ctx.font = `500 ${Math.round(h * 0.030)}px ${MONO}`
    tracked(ctx, `ITEM ${String(i + 1).padStart(2, '0')}`, M, h * 0.115, h * 0.007)
    ctx.textAlign = 'right'
    tracked(ctx, (item.meta ?? '').toUpperCase(), w - M, h * 0.115, h * 0.007)
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(16,24,32,0.28)'
    ctx.fillRect(M, h * 0.142, w - M * 2, Math.max(1, h * 0.0022))

    // Title block.
    ctx.fillStyle = '#101820'
    ctx.font = `700 ${Math.round(h * 0.072)}px ${SANS}`
    let y = h * 0.795
    wrap(ctx, item.label, w - M * 2).forEach((l) => { ctx.fillText(l, M, y); y += h * 0.072 })

    ctx.font = `400 ${Math.round(h * 0.032)}px ${SANS}`
    ctx.fillStyle = 'rgba(16,24,32,0.62)'
    wrap(ctx, item.description, w - M * 2).slice(0, 1)
      .forEach((l) => { ctx.fillText(l, M, h * 0.945) })

    // Corner ticks.
    ctx.strokeStyle = 'rgba(16,24,32,0.5)'
    ctx.lineWidth = Math.max(1, w * 0.0022)
    const tk = w * 0.028
    ;[[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([cx, cy]) => {
      const x = cx ? w - M * 0.45 : M * 0.45
      const yy = cy ? h - M * 0.45 : M * 0.45
      ctx.beginPath()
      ctx.moveTo(x - tk, yy); ctx.lineTo(x + tk, yy)
      ctx.moveTo(x, yy - tk); ctx.lineTo(x, yy + tk)
      ctx.stroke()
    })
  }
}

export default assembly
