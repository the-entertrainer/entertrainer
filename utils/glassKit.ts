/**
 * glassKit — a small "Apple Liquid Glass" engine for the /lab homepage concepts.
 *
 * The look is built from real optics rather than a CSS blur fake:
 *
 *  · Cards are extruded **squircles** (superelliptic corners, the continuous
 *    curvature Apple uses) with a real 3D bevel, so the rim is geometry that
 *    catches light — not a painted-on gradient.
 *  · The glass slab uses MeshPhysicalMaterial `transmission`, so three renders
 *    the scene to an offscreen target and the glass genuinely refracts whatever
 *    sits behind it — including each card's own artwork. `thickness` + `ior`
 *    drive the lensing, so the flat centre stays legible while the bevelled rim
 *    bends and magnifies. That edge-only distortion *is* the Liquid Glass cue.
 *  · Lighting comes from a procedural PMREM environment (warm softboxes on a
 *    paper-toned gradient), so highlights are broad specular streaks that slide
 *    across the bevel as cards move — the thing that reads as "real glass".
 *  · A dispersion pass offsets R/B against G on the rim for the faint prismatic
 *    fringe you get at a real lens edge.
 *
 * Everything is tuned to the site's warm editorial paper palette so the glass
 * feels like it belongs to Entertrainer, not a generic WebGL demo.
 */
import {
  ACESFilmicToneMapping, AmbientLight, CanvasTexture, Clock, Color, DirectionalLight,
  ExtrudeGeometry, Group, LinearFilter, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Raycaster, Scene, Shape,
  ShapeGeometry, SRGBColorSpace, TextureLoader, Vector2, Vector3, WebGLRenderer
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export type LayoutName =
  | 'helix' | 'coverflow' | 'deck' | 'orbit' | 'arc' | 'grid'
  | 'column' | 'ribbon' | 'desk' | 'constellation' | 'wave' | 'vortex'

export interface GlassTheme {
  /** Background / "paper" tone the whole scene sits on. */
  bg: string
  /** Warm key light colour. */
  key: string
  /** Cool fill/rim colour — the complement that makes glass edges sing. */
  rim: string
  /** Tint multiplied into the glass body. Keep near-white for clarity. */
  glass: string
  /** Ground plane on/under which cards cast contact shadows. 0 = no ground. */
  ground?: number
}

export const PAPER: GlassTheme = { bg: '#F2EBE3', key: '#FFF3E2', rim: '#9EC3FF', glass: '#FFFFFF' }
export const DUSK:  GlassTheme = { bg: '#14131A', key: '#FFE2C0', rim: '#7FA8FF', glass: '#EEF3FF' }

// ── Squircle ────────────────────────────────────────────────────────────────
// A superellipse-cornered rounded rect. Unlike a circular-radius rect the
// curvature is continuous into the straight edge, which is why Apple's corners
// read as "one shape" instead of "a rect with arcs glued on".
export function squircle(w: number, h: number, r: number, n = 5, seg = 14): Shape {
  const s = new Shape()
  const hw = w / 2, hh = h / 2
  const rr = Math.max(1e-4, Math.min(r, Math.min(hw, hh)))
  const pts: number[][] = []

  // One superelliptic quadrant. Sweeping t from 0 to PI/2 runs from the arc's
  // x-axis end to its y-axis end; `rev` walks it the other way.
  //
  // Direction matters: to trace one continuous counter-clockwise outline the
  // quadrants must alternate, right→top, top→left, left→bottom, bottom→right.
  // Walking every quadrant the same way (the earlier bug) leaves each corner
  // ending on the wrong edge, so the connecting segments cut diagonally across
  // the card, the outline self-intersects, and the extruder turns those chords
  // into spurious flanges off the corners.
  // Every point is emitted: consecutive quadrants end and start on *different*
  // corners, joined by the card's straight edges, so there are no duplicate
  // vertices to drop — skipping one would clip the head off each arc.
  const quadrant = (cx: number, cy: number, sx: number, sy: number, rev: boolean) => {
    for (let i = 0; i <= seg; i++) {
      const t = ((rev ? seg - i : i) / seg) * (Math.PI / 2)
      pts.push([
        cx + sx * rr * Math.pow(Math.cos(t), 2 / n),
        cy + sy * rr * Math.pow(Math.sin(t), 2 / n)
      ])
    }
  }
  quadrant( hw - rr,  hh - rr,  1,  1, false) // right edge → top edge
  quadrant(-hw + rr,  hh - rr, -1,  1, true)  // top edge   → left edge
  quadrant(-hw + rr, -hh + rr, -1, -1, false) // left edge  → bottom edge
  quadrant( hw - rr, -hh + rr,  1, -1, true)  // bottom     → right edge

  s.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1])
  s.closePath()
  return s
}

// ── Environment ─────────────────────────────────────────────────────────────
/**
 * Builds the PMREM environment that lights every glass surface. RoomEnvironment
 * gives believable studio falloff; we recolour its emissive panels to the
 * theme's key/rim so reflections carry the page's palette instead of a neutral
 * grey studio. This is what turns "transparent plastic" into "lit glass".
 */
function buildEnvironment(renderer: WebGLRenderer, theme: GlassTheme) {
  const pmrem = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const key = new Color(theme.key), rim = new Color(theme.rim)
  let i = 0
  room.traverse((o: any) => {
    if (o.isMesh && o.material?.emissive) {
      // Alternate warm key / cool rim panels so the bevel picks up a two-tone
      // highlight — one warm streak, one cool — like a real softbox setup.
      o.material = o.material.clone()
      o.material.color = new Color(0xffffff)
      o.material.emissive = (i++ % 3 === 0 ? rim : key).clone().multiplyScalar(1.1)
    }
  })
  const tex = pmrem.fromScene(room, 0.04).texture
  room.dispose?.(); pmrem.dispose()
  return tex
}

// ── Soft contact shadow sprite ──────────────────────────────────────────────
function shadowTexture(): CanvasTexture {
  const S = 128
  const c = document.createElement('canvas'); c.width = c.height = S
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  grd.addColorStop(0, 'rgba(60,45,35,0.55)')
  grd.addColorStop(0.45, 'rgba(60,45,35,0.22)')
  grd.addColorStop(1, 'rgba(60,45,35,0)')
  g.fillStyle = grd; g.fillRect(0, 0, S, S)
  const t = new CanvasTexture(c); t.minFilter = LinearFilter
  return t
}

export interface GlassCard {
  group: Group
  /** The pickable glass slab. */
  hit: Mesh
  art: Mesh
  shadow: Mesh | null
  index: number
  href: string
  /** eased 0..1 hover amount */
  hover: number
  hoverTarget: number
}

export interface StageOptions {
  canvas: HTMLCanvasElement
  theme?: GlassTheme
  layout: LayoutName
  items: { href: string; img: string; label: string }[]
  /** Cards to render; items repeat if fewer. */
  count?: number
  /**
   * Shifts the camera up so the composition sits high in frame, reserving a
   * clear band at the bottom for copy. Positive = cards ride higher.
   */
  lift?: number
  onActive?: (index: number) => void
  onPick?: (href: string) => void
}

// The print is a true 16:9 (matching every card image), sitting on a slightly
// taller-aspect slab so it carries an even glass "mat" on all four sides —
// like a photograph mounted behind glass. Deriving the card from the art
// guarantees the margin is uniform and the artwork is never stretched.
const ART_W = 2.50, ART_H = (ART_W * 9) / 16
const MAT   = 0.12
const CARD_W = ART_W + MAT * 2, CARD_H = ART_H + MAT * 2

// How far each layout throws a card's centre off the vertical axis. The camera
// frames `CARD_W + 2 × spread`, so a layout that fans sideways still fits a
// narrow phone screen instead of running off both edges.
const LAYOUT_SPREAD: Record<LayoutName, number> = {
  helix: 2.5, coverflow: 2.7, deck: 0.5, orbit: 2.6, arc: 2.4, grid: 3.1,
  column: 0.45, ribbon: 3.4, desk: 0, constellation: 3.6, wave: 2.1, vortex: 3.4
}

export function createGlassStage(opts: StageOptions) {
  const theme = opts.theme ?? PAPER
  const layout = opts.layout
  const items = opts.items
  const N = opts.count ?? Math.max(items.length, 6)
  const lift = opts.lift ?? 0

  const renderer = new WebGLRenderer({ canvas: opts.canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(innerWidth, innerHeight)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = SRGBColorSpace

  const scene = new Scene()
  scene.background = new Color(theme.bg)
  const envTex = buildEnvironment(renderer, theme)
  scene.environment = envTex

  const camera = new PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 120)
  camera.position.set(0, 0, 9)

  // Real lights on top of the IBL — the directional gives the crisp moving
  // specular dot on the bevel that IBL alone renders too softly. Intensities
  // stay modest on purpose: the glass draws its brilliance from the PMREM
  // environment (which doesn't touch diffuse), so pushing the lamps any harder
  // would only blow the artwork's own colour out to a milky grey.
  const keyLight = new DirectionalLight(new Color(theme.key), 1.15)
  keyLight.position.set(4, 6, 8)
  const rimLight = new DirectionalLight(new Color(theme.rim), 0.6)
  rimLight.position.set(-6, -2, 4)
  scene.add(keyLight, rimLight, new AmbientLight(new Color(theme.bg), 0.32))

  // ── Card construction ─────────────────────────────────────────────────────
  const loader = new TextureLoader()
  const shadowTex = shadowTexture()

  // One clean slab of glass with the print mounted on its face.
  //
  // The previous build made the glass a separate *ring* standing proud of the
  // artwork. Even with correct geometry that reads as a moulded plastic tray —
  // a chunky picture frame, not glass — and a thin ring is fragile to bevel
  // anyway (bevel walls grown from the outer and inner contours collide in the
  // middle of a narrow band). A single slab is both simpler and far more
  // elegant: the visible glass is the even mat around the print plus the
  // bevelled edge, and that is exactly where the refraction wants to be.
  const SLAB_DEPTH = 0.10, SLAB_BEVEL = 0.03
  const slabGeo = new ExtrudeGeometry(squircle(CARD_W, CARD_H, 0.22), {
    depth: SLAB_DEPTH, bevelEnabled: true, bevelThickness: SLAB_BEVEL,
    bevelSize: SLAB_BEVEL, bevelSegments: 6, curveSegments: 24
  })
  slabGeo.center()
  // Front face of the slab in local Z, so the print can sit exactly on it.
  const SLAB_FRONT = SLAB_DEPTH / 2 + SLAB_BEVEL

  // The print itself: flat, no extrusion. Nothing sits in front of it, so it
  // stays perfectly crisp while the glass around and beneath it does the optics.
  const artGeo = new ShapeGeometry(squircle(ART_W, ART_H, 0.13), 24)
  {
    // ShapeGeometry UVs are in world units, not 0..1 — reproject planar so the
    // artwork maps across the print undistorted at its native 16:9.
    const p = artGeo.attributes.position, uv = artGeo.attributes.uv
    for (let i = 0; i < p.count; i++) {
      uv.setXY(i, (p.getX(i) / ART_W) + 0.5, (p.getY(i) / ART_H) + 0.5)
    }
    uv.needsUpdate = true
  }

  const cards: GlassCard[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i % items.length]
    const group = new Group()

    const tex = loader.load(item.img)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    // The face: crisp artwork under a clearcoat. The clearcoat is what makes it
    // read as "printed behind glass" rather than a flat texture — it reflects
    // the environment and carries a specular highlight that slides as it moves.
    // The artwork is driven through `emissive` rather than `map`, with the
    // diffuse colour black. Lighting a near-white print with a warm key, a blue
    // rim and an ambient fill inevitably veils it — every lamp adds toward
    // white, and the artwork is the one thing that has to stay true. Emissive
    // sidesteps the lighting equation entirely, so the card reads at its real
    // colour, while clearcoat still samples the environment on top for a
    // genuine moving gloss. Physically it's a backlit transparency under glass.
    const art = new Mesh(artGeo, new MeshPhysicalMaterial({
      color: 0x000000,
      emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.0,
      roughness: 0.5, metalness: 0.0,
      clearcoat: 1.0, clearcoatRoughness: 0.05,
      envMapIntensity: 0.5, specularIntensity: 1.0
    }))
    // Flush against the slab's front face — mounted on the glass, not floating.
    art.position.z = SLAB_FRONT + 0.001
    group.add(art)

    // The slab. transmission=1 makes three render the scene to an offscreen
    // target and refract it through the glass, so the backdrop genuinely bends
    // through the mat border and around the bevelled edge.
    const glass = new Mesh(slabGeo, new MeshPhysicalMaterial({
      color: new Color(theme.glass),
      transmission: 1.0, thickness: 0.55, ior: 1.5,
      roughness: 0.04, metalness: 0.0,
      clearcoat: 1.0, clearcoatRoughness: 0.04,
      iridescence: 0.35, iridescenceIOR: 1.3, iridescenceThicknessRange: [140, 520],
      envMapIntensity: 1.8,
      specularIntensity: 1.0,
      transparent: true, opacity: 1.0
    }))
    group.add(glass)

    // Shadows live in world space, not on the card group: several layouts rotate
    // the group (the desk lays cards flat at -90°), which would carry a child
    // shadow round with them instead of leaving it on the floor.
    let shadow: Mesh | null = null
    if (theme.ground !== undefined) {
      shadow = new Mesh(new PlaneGeometry(CARD_W * 1.6, CARD_H * 1.6),
        new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.6 }))
      shadow.rotation.x = -Math.PI / 2
      // No negative renderOrder here: three already draws transparent objects
      // after opaques, and forcing the shadow earlier just lets the floor paint
      // straight over it.
      scene.add(shadow)
    }

    scene.add(group)
    cards.push({ group, hit: glass, art, shadow, index: i, href: item.href, hover: 0, hoverTarget: 0 })
  }

  if (theme.ground !== undefined) {
    // Deliberately darker than the page tone: a floor lit to the same value as
    // the background reads as empty white space, and the cards stop looking
    // like they are resting on anything.
    const ground = new Mesh(new PlaneGeometry(80, 80), new MeshStandardMaterial({
      // Warmed toward taupe rather than just darkened: a neutral grey floor lit
      // by the cool rim lamp turns bluish and fights the warm paper palette.
      color: new Color(theme.bg).lerp(new Color('#8A6E52'), 0.34), roughness: 0.96, metalness: 0.0, envMapIntensity: 0.12
    }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = theme.ground
    scene.add(ground)
  }

  // ── Layouts ───────────────────────────────────────────────────────────────
  // Each returns where card `i` sits for scroll position `t`, plus how "active"
  // it is (1 = front & centre). Kept pure so motion stays frame-rate agnostic.
  const TAU = Math.PI * 2
  const wrap = (v: number, n: number) => ((v % n) + n) % n
  function place(i: number, t: number, out: { p: Vector3; r: Vector3; s: number; a: number }) {
    const rel = wrap(i - t + N / 2, N) - N / 2   // -N/2..N/2, 0 = focused
    const ar = Math.abs(rel)
    let px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0, s = 1
    switch (layout) {
      case 'helix': {
        const ang = rel * 0.62 + Math.PI / 2
        // Offset by the radius so the focused card lands at z=0 rather than
        // swinging toward the lens and ballooning in frame.
        px = Math.cos(ang) * 2.5; pz = Math.sin(ang) * 2.5 - 2.5
        py = -rel * 1.80          // generous pitch so cards read one at a time
        ry = -ang + Math.PI / 2
        s = 1 - Math.min(ar, 4) * 0.045
        break
      }
      case 'coverflow': {
        // Wider than a card so neighbours read as separate objects rather than
        // fusing into one continuous strip of glass.
        px = rel * 2.62; pz = -ar * 1.55
        ry = Math.max(-0.62, Math.min(0.62, -rel * 0.5))
        s = 1 - Math.min(ar, 3) * 0.07
        break
      }
      case 'deck': {
        px = rel * 0.16; py = -rel * 0.1; pz = -ar * 0.55
        rz = rel * 0.045; ry = rel * 0.05
        s = 1 - Math.min(ar, 4) * 0.03
        break
      }
      case 'orbit': {
        const ang = rel * (TAU / N) + Math.PI / 2
        const ring = i % 2 === 0 ? 1 : -1
        px = Math.cos(ang) * 2.6; pz = Math.sin(ang) * 2.6
        py = Math.sin(ang * 2) * 0.5 * ring
        ry = -ang + Math.PI / 2; rz = ring * 0.12
        break
      }
      case 'arc': {
        const ang = rel * 0.30
        px = Math.sin(ang) * 5.4; pz = Math.cos(ang) * 5.4 - 5.4
        py = -Math.abs(ang) * 0.55
        ry = -ang; rz = -rel * 0.06
        break
      }
      case 'grid': {
        const cols = 3
        const rows = Math.max(1, Math.ceil(N / cols))
        const gi = wrap(i - Math.round(t), N)
        // Centred on both axes so the wall reads as a composed hang rather than
        // drifting to one corner of the frame.
        px = ((gi % cols) - (cols - 1) / 2) * 3.05
        py = ((rows - 1) / 2 - Math.floor(gi / cols)) * 1.85
        pz = Math.sin(gi * 1.7) * 0.35
        ry = px * 0.035; rx = -py * 0.03
        break
      }
      case 'column': {
        // Pitch must clear the card's own height (CARD_H ≈ 1.65) or the stack
        // collapses into an unreadable overlap — the original 1.05 buried each
        // card under the next by more than a third.
        py = -rel * 2.05
        const ang = rel * 0.42
        px = Math.sin(ang) * 0.40; pz = Math.cos(ang) * 0.55 - 0.55
        ry = -ang * 0.85
        s = 1 - Math.min(ar, 4) * 0.05
        break
      }
      case 'ribbon': {
        const u = rel * 0.55
        px = Math.sin(u) * 3.4; py = Math.sin(u * 2) * 0.85; pz = Math.cos(u) * 2.0 - 1.4
        ry = -u; rz = Math.sin(u * 2) * 0.28
        break
      }
      case 'desk': {
        const cols = 2
        const rows = Math.max(1, Math.ceil(N / cols))
        const gi = wrap(i - Math.round(t), N)
        px = ((gi % cols) - (cols - 1) / 2) * 3.15
        pz = (Math.floor(gi / cols) - (rows - 1) / 2) * 2.15
        py = 0.02 + (i % 3) * 0.012
        rx = -Math.PI / 2; rz = (i % 2 ? 1 : -1) * 0.06
        break
      }
      case 'constellation': {
        const h = Math.sin(i * 12.9898) * 43758.5453
        const rnd = h - Math.floor(h)
        const h2 = Math.sin(i * 78.233) * 12345.678
        const rnd2 = h2 - Math.floor(h2)
        // Scatter is fixed per card, but everything rides back on `rel` so the
        // focused card always swings to centre-front out of the cloud.
        px = (rnd - 0.5) * 10.5 * Math.min(1, ar * 0.55) + rel * 0.35
        py = (rnd2 - 0.5) * 5.4 * Math.min(1, ar * 0.55)
        pz = -ar * 2.35
        ry = (rnd - 0.5) * 0.5; rz = (rnd2 - 0.5) * 0.22
        s = 1 - Math.min(ar, 4) * 0.05
        break
      }
      case 'wave': {
        px = rel * 2.05
        py = Math.sin(rel * 0.85) * 0.95
        pz = -Math.abs(Math.cos(rel * 0.85)) * 0.9
        rz = Math.cos(rel * 0.85) * 0.2; ry = -rel * 0.16
        break
      }
      case 'vortex': {
        // Cards must swing wide as they recede, otherwise the whole spiral
        // collapses into an unreadable pile at the throat of the tunnel.
        const ang = rel * 0.95
        const depth = ar * 2.0
        const rad = 2.5 + depth * 0.85
        px = Math.cos(ang) * rad; py = Math.sin(ang) * rad * 0.6
        pz = -depth
        rz = ang * 0.3; ry = -Math.cos(ang) * 0.28
        s = 1 - Math.min(ar, 4) * 0.05
        break
      }
    }
    out.p.set(px, py, pz); out.r.set(rx, ry, rz); out.s = s
    out.a = Math.max(0, 1 - ar)
    return out
  }

  // ── Input: momentum scroll + pointer ──────────────────────────────────────
  let scroll = 0, vel = 0, dragging = false, dragged = false
  let lastX = 0, lastY = 0, downX = 0, downY = 0, base = 0
  const pointer = new Vector2(-999, -999)
  const light = new Vector2(0, 0), lightTarget = new Vector2(0, 0)
  const ray = new Raycaster()
  let active = -1
  const PX = () => (innerWidth < 700 ? 150 : 280)
  const axisH = layout === 'coverflow' || layout === 'wave' || layout === 'arc' || layout === 'grid'

  const onDown = (e: PointerEvent) => {
    dragging = true; dragged = false
    downX = lastX = e.clientX; downY = lastY = e.clientY
    base = scroll; vel = 0
    ;(opts.canvas as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
    lightTarget.set(pointer.x, pointer.y)
    if (!dragging) return
    const dx = e.clientX - downX, dy = e.clientY - downY
    if (dx * dx + dy * dy > 36) dragged = true
    const d = axisH ? (e.clientX - downX) : (e.clientY - downY)
    scroll = base - d / PX()
    const inst = axisH ? (e.clientX - lastX) : (e.clientY - lastY)
    vel = -inst / PX() * 0.6
    lastX = e.clientX; lastY = e.clientY
  }
  const onUp = () => {
    if (!dragging) return
    dragging = false
    if (!dragged && active >= 0) opts.onPick?.(cards[active].href)
  }
  let wheelLock = false
  const onWheel = (e: WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(d) < 4 || wheelLock) return
    wheelLock = true; vel += d > 0 ? 0.13 : -0.13
    setTimeout(() => (wheelLock = false), 70)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') vel += 0.28
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') vel -= 0.28
    else if ((e.key === 'Enter' || e.key === ' ') && active >= 0) { e.preventDefault(); opts.onPick?.(cards[active].href) }
  }
  opts.canvas.addEventListener('pointerdown', onDown)
  opts.canvas.addEventListener('pointermove', onMove)
  opts.canvas.addEventListener('pointerup', onUp)
  opts.canvas.addEventListener('pointercancel', onUp)
  addEventListener('wheel', onWheel, { passive: true })
  addEventListener('keydown', onKey)

  const BASE_Z = 9
  const onResize = () => {
    camera.aspect = innerWidth / innerHeight
    if (layout === 'desk') {
      // Fixed overhead rig; framing is handled by the grid spacing instead.
      camera.position.set(0, 7.4, 5.6)
      camera.lookAt(0, 0, 0)
    } else {
      // Distance needed for the layout's full width to fit the frame:
      //   halfW = d·tan(fov/2)·aspect  ⇒  d = wanted / (2·tan(fov/2)·aspect)
      // `wanted` has to account for how far a layout throws cards sideways, not
      // just one card: the tower swings its stack off-axis, so framing it as a
      // single card width let the edges run off a phone screen.
      const wanted = (CARD_W + LAYOUT_SPREAD[layout] * 2) + 0.6
      const need = wanted / (2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.aspect)
      // Negated: dropping the camera raises the composition in frame. Moving it
      // *up* would push the cards down into the very band we're clearing.
      camera.position.set(0, -lift, Math.max(BASE_Z, need))
    }
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  }
  addEventListener('resize', onResize); onResize()

  // ── Frame loop ────────────────────────────────────────────────────────────
  const tmp = { p: new Vector3(), r: new Vector3(), s: 1, a: 0 }
  const clock = new Clock()
  let raf = 0, ready = false
  const onReadyCbs: (() => void)[] = []

  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime

    if (!dragging) {
      scroll += vel
      vel *= Math.pow(0.90, dt * 60)
      if (Math.abs(vel) < 0.0012) {
        vel = 0
        const tgt = Math.round(scroll)
        scroll += (tgt - scroll) * (1 - Math.pow(0.86, dt * 60))
      }
    }

    // The whole rig breathes toward the pointer — parallax that sells depth.
    light.lerp(lightTarget, 1 - Math.pow(0.02, dt))
    keyLight.position.set(4 + light.x * 3.5, 6 + light.y * 2.5, 8)
    rimLight.position.set(-6 + light.x * 2.5, -2 + light.y * 2, 4)

    // Hover pick
    ray.setFromCamera(pointer, camera)
    const hits = ray.intersectObjects(cards.map(c => c.hit), false)
    const hovered = hits.length ? cards.find(c => c.hit === hits[0].object) ?? null : null

    let bestA = -1, bestI = -1
    for (const c of cards) {
      place(c.index, scroll, tmp)
      if (tmp.a > bestA) { bestA = tmp.a; bestI = c.index }

      c.hoverTarget = c === hovered ? 1 : 0
      c.hover += (c.hoverTarget - c.hover) * (1 - Math.pow(0.005, dt))

      // Idle float — tiny, out of phase per card, so the scene is never static.
      const fl = Math.sin(t * 0.7 + c.index * 1.7) * 0.045
      const g = c.group
      g.position.set(
        tmp.p.x + light.x * 0.12,
        tmp.p.y + fl + light.y * 0.09,
        tmp.p.z + c.hover * 0.55
      )
      g.rotation.set(
        tmp.r.x + (layout === 'desk' ? 0 : -light.y * 0.06) + c.hover * 0.05,
        tmp.r.y + (layout === 'desk' ? 0 : light.x * 0.10),
        tmp.r.z + Math.sin(t * 0.5 + c.index) * 0.006
      )
      const sc = tmp.s * (1 + c.hover * 0.05)
      g.scale.setScalar(sc)

      // Glass gets thicker + glossier as a card comes forward: the focused card
      // reads as a heavier, more present piece of glass.
      const m = c.hit.material as MeshPhysicalMaterial
      m.thickness = 0.42 + tmp.a * 0.25 + c.hover * 0.2
      m.iridescence = 0.24 + c.hover * 0.4
      m.envMapIntensity = 1.5 + tmp.a * 0.6 + c.hover * 0.7
      const am = c.art.material as MeshPhysicalMaterial
      // Cards further from focus dim slightly — depth cueing without fog.
      am.emissiveIntensity = 0.72 + tmp.a * 0.28 + c.hover * 0.06
      am.envMapIntensity = 0.42 + tmp.a * 0.2 + c.hover * 0.3
      am.clearcoatRoughness = 0.06 - tmp.a * 0.02

      if (c.shadow && theme.ground !== undefined) {
        // Directly under the card in world space, softening and fading with the
        // gap to the floor — the cue that actually seats glass on a surface.
        const lift = Math.max(0, g.position.y - theme.ground)
        c.shadow.position.set(g.position.x + lift * 0.10, theme.ground + 0.004, g.position.z + lift * 0.06)
        c.shadow.scale.setScalar(sc * (1 + lift * 0.30))
        ;(c.shadow.material as MeshBasicMaterial).opacity = Math.max(0.05, 0.62 - lift * 0.30)
      }
    }

    if (bestI !== active) { active = bestI; opts.onActive?.(active % items.length) }

    renderer.render(scene, camera)
    if (!ready) { ready = true; onReadyCbs.forEach(f => f()) }
  }
  raf = requestAnimationFrame(frame)

  return {
    onReady(cb: () => void) { ready ? cb() : onReadyCbs.push(cb) },
    /** Nudge the carousel programmatically (chrome arrows, dots). */
    go(delta: number) { vel += delta * 0.3 },
    dispose() {
      cancelAnimationFrame(raf)
      opts.canvas.removeEventListener('pointerdown', onDown)
      opts.canvas.removeEventListener('pointermove', onMove)
      opts.canvas.removeEventListener('pointerup', onUp)
      opts.canvas.removeEventListener('pointercancel', onUp)
      removeEventListener('wheel', onWheel)
      removeEventListener('keydown', onKey)
      removeEventListener('resize', onResize)
      slabGeo.dispose(); artGeo.dispose(); shadowTex.dispose(); envTex.dispose()
      cards.forEach(c => {
        ;(c.hit.material as MeshPhysicalMaterial).dispose()
        ;(c.art.material as MeshPhysicalMaterial).emissiveMap?.dispose()
        ;(c.art.material as MeshPhysicalMaterial).dispose()
        c.shadow && (c.shadow.material as MeshBasicMaterial).dispose()
      })
      renderer.dispose()
    }
  }
}
