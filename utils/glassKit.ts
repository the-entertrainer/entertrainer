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
  AmbientLight, CanvasTexture, Clock, Color, DirectionalLight,
  ExtrudeGeometry, Group, LinearFilter, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  MeshStandardMaterial, NoToneMapping, PerspectiveCamera, PlaneGeometry, PMREMGenerator,
  Raycaster, Scene, ShaderMaterial, Shape,
  ShapeGeometry, SRGBColorSpace, TextureLoader, Vector2, Vector3, WebGLRenderer
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
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
  /** Loud accent, woven into the backdrop's brightest ripple crests. */
  pop?: string
  /** Secondary accent — the mid-tone the backdrop's currents are drawn in. */
  alt?: string
  /** Dark end of the duotone ramp the card artwork is re-mapped across. */
  duoShadow?: string
  /** Bright end of that ramp. */
  duoHighlight?: string
}

export const PAPER: GlassTheme = { bg: '#F2EBE3', key: '#FFF3E2', rim: '#9EC3FF', glass: '#FFFFFF' }
export const DUSK:  GlassTheme = { bg: '#14131A', key: '#FFE2C0', rim: '#7FA8FF', glass: '#EEF3FF' }

// ── Backdrop ────────────────────────────────────────────────────────────────
/**
 * The field the glass actually bends.
 *
 * Until this existed the scene's background was a single flat colour, which
 * meant the cards' transmission had nothing to refract: physically correct
 * glass over a uniform field returns that same uniform field, so all the
 * expensive optics were invisible and the cards read as frosted plastic. A
 * moving, structured backdrop is not decoration here — it is the thing that
 * makes the glass legible as glass.
 *
 * Two layers of structure: twice-warped fbm for slow continental drift, and
 * two travelling ripple systems for the fine relief that catches the bevel.
 * Amplitudes are deliberately low and the vignette pulls hard back to the page
 * tone at the top and bottom, so the DOM scrims meet it without a seam and the
 * artwork stays the loudest thing on screen.
 */
const BACKDROP_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const BACKDROP_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uBg;
  uniform vec3 uDeep;
  uniform vec3 uAlt;
  uniform vec3 uPop;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  // Ridged noise. Folding each octave around its midpoint turns soft blobs into
  // thin bright filaments — this is what draws light *through* the water rather
  // than just lighting it, and it is what the bloom has to catch.
  float ridge(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      float n = vnoise(p);
      n = 1.0 - abs(n * 2.0 - 1.0);
      v += a * n * n;
      p = p * 2.07 + vec2(3.1, 1.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float t = uTime;

    // Two layers drifting against each other. Counter-motion is the whole
    // reason this reads as depth rather than as a texture sliding past.
    vec2 pa = p * 3.2 + vec2(t * 0.012, -t * 0.008);
    vec2 pb = p * 5.8 - vec2(t * 0.021,  t * 0.014);

    // The swell: the slow body of the water.
    vec2 w = vec2(fbm(pa), fbm(pa + vec2(4.3, 1.9)));
    float swell = fbm(pa + 2.4 * w);

    // The filaments riding on it.
    float fil = ridge(pb + 1.3 * w + swell * 0.6);
    fil = pow(clamp(fil, 0.0, 1.0), 2.6);

    // Organic pulse. Three periods that share no common multiple, so the
    // brightness breathes and never visibly loops — a single sine would tick
    // like a metronome and the whole thing would read as a screensaver.
    float pulse = 0.62
      + 0.20 * sin(t * 0.21 + swell * 3.0)
      + 0.12 * sin(t * 0.13 + fil * 2.0)
      + 0.06 * sin(t * 0.37);

    // Far specks, slowly guttering.
    vec2 sp = floor(p * 190.0);
    float star = step(0.9975, hash(sp));
    star *= 0.5 + 0.5 * sin(t * 1.6 + hash(sp + 7.0) * 30.0);

    vec3 col = uBg;
    col = mix(col, uDeep, smoothstep(0.30, 0.95, swell) * 0.75);
    col = mix(col, uAlt,  clamp(fil * pulse, 0.0, 1.0) * 0.55);
    col = mix(col, uPop,  smoothstep(0.55, 1.05, fil * pulse) * 0.42);
    col += star * 0.45;

    // Vignette to true black. The ocean has no edges — it just stops being lit,
    // which also hands the DOM scrims a seamless join.
    float vg = smoothstep(1.15, 0.12, length(p * vec2(0.80, 1.30)));
    col = mix(uBg, col, 0.05 + 0.95 * vg);

    gl_FragColor = vec4(col, 1.0);

    // three.js hands uniforms to a ShaderMaterial in its linear working space
    // but does not convert the output for you the way it does for its own
    // materials. Writing linear values straight to an sRGB framebuffer rendered
    // the page tone as a dark tan and pushed every accent off-hue — the backdrop
    // visibly disagreed with the DOM scrims sitting on top of it.
    #include <colorspace_fragment>
  }
`

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
  /**
   * Screen-space bands reserved for chrome, in CSS pixels. The camera frames
   * the cards into what's left, so a fixed header or caption sheet can never
   * be overlapped by the stage.
   */
  insetTop?: number
  insetBottom?: number
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
  // The tower's own lateral throw is 0.40, but framing for all of it shrank the
  // focused card to make room for neighbours that are dimmed and scrimmed
  // anyway. Framing for a fraction of it lets the subject fill the frame.
  column: 0.08, ribbon: 3.4, desk: 0, constellation: 3.6, wave: 2.1, vortex: 3.4
}

// Breathing room around the framed content, as a fraction of a card. Expressed
// relative to the card rather than in world units so it scales with the frame:
// a fixed margin that looked right on a desktop left a phone with 55px of dead
// paper down each side and a card too small to read.
//
// Kept deliberately tight. The card is the subject and the artwork is the whole
// pitch, so it runs nearly edge to edge; the neighbours above and below are
// allowed to bleed past the frame, which reads as "the stack continues" rather
// than as a mistake.
const FRAME_MARGIN = CARD_W * 0.035

export function createGlassStage(opts: StageOptions) {
  const theme = opts.theme ?? PAPER
  const layout = opts.layout
  const items = opts.items
  const N = opts.count ?? Math.max(items.length, 6)
  const lift = opts.lift ?? 0
  let insetTop = opts.insetTop ?? 0
  let insetBottom = opts.insetBottom ?? 0

  const renderer = new WebGLRenderer({ canvas: opts.canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(innerWidth, innerHeight)
  // ACES is a film curve: it rolls off highlights and desaturates on the way,
  // which is right for a lit CG scene and wrong for artwork that is already
  // finished, in gamut, and delivered through `emissive`. It was quietly
  // greying every print and pulling the navy toward slate. No tone curve means
  // the cards render at the colour the artwork was actually drawn in.
  renderer.toneMapping = NoToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = SRGBColorSpace

  const scene = new Scene()
  scene.background = new Color(theme.bg)
  const envTex = buildEnvironment(renderer, theme)
  scene.environment = envTex

  const camera = new PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 120)
  camera.position.set(0, 0, 9)

  // The refractable field, sized to the frustum in onResize.
  const BACKDROP_Z = -7
  const bdMat = new ShaderMaterial({
    vertexShader: BACKDROP_VERT,
    fragmentShader: BACKDROP_FRAG,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uBg: { value: new Color(theme.bg) },
      // A three-step ramp out of one hue family: page tone, a pale wash of it,
      // then the accent, then the deep crest.
      uDeep: { value: new Color(theme.bg).lerp(new Color(theme.alt ?? theme.rim), 0.16) },
      uAlt: { value: new Color(theme.alt ?? theme.rim) },
      uPop: { value: new Color(theme.pop ?? theme.key) }
    }
  })
  const backdrop = new Mesh(new PlaneGeometry(1, 1), bdMat)
  backdrop.position.z = BACKDROP_Z
  backdrop.renderOrder = -1
  scene.add(backdrop)

  // ── Bloom ────────────────────────────────────────────────────────────────
  // The look is monochrome, so brightness is the only dimension left to
  // compose with: the specular streak on a bevel, the lit face of the card in
  // front, the crest of a ripple. Bloom is what turns those into light rather
  // than just pale pixels — it is the difference between a grey render and
  // something that looks lit from inside. Threshold sits high on purpose so it
  // catches highlights only and never washes the artwork's midtones.
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new Vector2(innerWidth, innerHeight), 0.34, 0.72, 0.92)
  composer.addPass(bloom)
  // Without this the composer's linear buffer is written straight out and the
  // whole scene renders dark and off-gamma.
  composer.addPass(new OutputPass())

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
    const artMat = new MeshPhysicalMaterial({
      color: 0x000000,
      emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.0,
      roughness: 0.5, metalness: 0.0,
      // A near-mirror clearcoat sampling a blue-tinted studio environment laid
      // a cool veil over the whole print — the artwork's cream paper was
      // rendering grey-blue and its navy was reading slate. Roughening the coat
      // and pulling the environment right down turns that mirror into a sheen:
      // the gloss still slides across the card as it moves, but the colour
      // underneath is the artwork's own.
      clearcoat: 1.0, clearcoatRoughness: 0.12,
      envMapIntensity: 0.35, specularIntensity: 1.0
    })

    // Duotone the print on the GPU.
    //
    // The scene is a monochrome, and dropping full-colour artwork into it would
    // have made four bright rectangles floating in an otherwise achromatic
    // world — the one thing guaranteed to break the look. Collapsing each print
    // to luminance and re-mapping it across a black-to-white ramp keeps the
    // composition, the type and the figure perfectly readable while putting the
    // artwork in the same palette as everything around it. Contrast is pushed
    // hard on purpose: a bitmap-era image is high contrast, and the bloom needs
    // genuine highlights to catch.
    artMat.onBeforeCompile = (shader) => {
      shader.uniforms.uShadow = { value: new Color(theme.duoShadow ?? '#0A0A0C') }
      shader.uniforms.uHighlight = { value: new Color(theme.duoHighlight ?? '#FFFFFF') }
      shader.fragmentShader = shader.fragmentShader
        .replace('void main() {', 'uniform vec3 uShadow;\nuniform vec3 uHighlight;\nvoid main() {')
        .replace('#include <emissivemap_fragment>', `
          #ifdef USE_EMISSIVEMAP
            vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
            float lum = dot( emissiveColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
            lum = clamp( ( lum - 0.50 ) * 1.06 + 0.5, 0.0, 1.0 );
            // Roll the top of the range off rather than letting it clip. The
            // figure's dark suit is a big uniform mass; inverted and pushed it
            // clipped to flat white and bloomed into a shapeless blob that ate
            // the headline next to it. This keeps its form.
            lum = lum * ( 1.0 - 0.44 * smoothstep( 0.42, 1.0, lum ) );
            totalEmissiveRadiance *= mix( uShadow, uHighlight, lum );
          #endif
        `)
    }
    const art = new Mesh(artGeo, artMat)
    // Flush against the slab's front face — mounted on the glass, not floating.
    art.position.z = SLAB_FRONT + 0.001
    group.add(art)

    // The slab. transmission=1 makes three render the scene to an offscreen
    // target and refract it through the glass, so the backdrop genuinely bends
    // through the mat border and around the bevelled edge.
    const glass = new Mesh(slabGeo, new MeshPhysicalMaterial({
      color: new Color(theme.glass),
      // `thickness` is a distance in world units, and it is how far the
      // refracted sample is dragged across the backdrop. At 0.55 on a card
      // 2.74 wide it reached a fifth of the way across the print — so the mat,
      // which is only 0.12 wide, sampled the artwork instead of the page and
      // wore a smeared duplicate of the print around its edge. Scaling it to
      // the slab's actual depth is both the fix and the physically honest
      // number: this is a few millimetres of glass over a print, not a
      // paperweight. The bevel still bends hard, which is where the optics
      // were always meant to live.
      transmission: 1.0, thickness: SLAB_DEPTH, ior: 1.45,
      roughness: 0.04, metalness: 0.0,
      clearcoat: 1.0, clearcoatRoughness: 0.04,
      iridescence: 0.18, iridescenceIOR: 1.3, iridescenceThicknessRange: [140, 520],
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
        // Pitch is tighter than the card is tall on purpose. Now that the
        // focused card fills the frame, a pitch that cleared its full height
        // threw both neighbours clean off screen and the tower stopped being a
        // tower at all. Overlapping is correct here — the neighbours sit a long
        // way further back, so they read as a stack continuing behind the
        // subject rather than as a collision.
        py = -rel * 1.72
        const ang = rel * 0.42
        px = Math.sin(ang) * 0.40
        // Neighbours fall away from the lens as well as up and down the frame.
        // Height alone gave no hierarchy — on a phone the card behind read as
        // loud as the one in front, so there was nothing to tell you which one
        // the caption and the button belonged to. Depth does that work: the
        // focused card is nearer, larger and brighter, and the stack reads as
        // one object receding rather than a row of equals.
        pz = Math.cos(ang) * 0.55 - 0.55 - Math.min(ar, 4) * 1.75
        ry = -ang * 0.85
        rx = rel * 0.10
        s = 1 - Math.min(ar, 4) * 0.11
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

  // ── Input: direct manipulation onto spring detents ────────────────────────
  //
  // The stack is a *paged* control, not a free-scrolling one. A finger moves it
  // one-to-one; on release the position springs onto a whole card. Free
  // momentum reads fine under a mouse wheel but is miserable under a thumb: a
  // flick used to spin the tower for a second and stop wherever friction
  // happened to run out, so there was no way to aim it. Projecting the flick
  // onto a detent — and capping how far a single flick may carry — makes every
  // gesture land on a card the person chose.
  let scroll = 0            // continuous position, in card units
  let target = 0            // the detent being settled onto
  let vel = 0               // spring velocity, card units per second
  let dragging = false, dragged = false, caught = false
  let downX = 0, downY = 0, base = 0
  let moveT = 0, moveV = 0  // last sample time + smoothed drag velocity
  const pointer = new Vector2(-999, -999)
  const light = new Vector2(0, 0), lightTarget = new Vector2(0, 0)
  const ray = new Raycaster()
  const pick = new Vector2()
  let active = -1

  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)')
  const mqCoarse = matchMedia('(pointer: coarse)')

  // Travel per card. Touch gets a much shorter throw than a mouse: a thumb arc
  // is a fraction of a comfortable mouse drag, and it has a shorter viewport to
  // work in, so the desktop distance made the tower feel stuck to the glass.
  const PX = () => (mqCoarse.matches ? Math.max(90, Math.min(190, innerHeight * 0.22)) : 280)
  const axisH = layout === 'coverflow' || layout === 'wave' || layout === 'arc' || layout === 'grid'

  /** The t nearest the current position that puts card `i` dead centre. */
  const detentFor = (i: number) => i + Math.round((scroll - i) / N) * N

  /** Which card is under a given client point, if any. */
  const hitAt = (cx: number, cy: number) => {
    pick.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1)
    ray.setFromCamera(pick, camera)
    const h = ray.intersectObjects(cards.map(c => c.hit), false)
    return h.length ? cards.find(c => c.hit === h[0].object) ?? null : null
  }

  const onDown = (e: PointerEvent) => {
    dragging = true; dragged = false
    downX = e.clientX; downY = e.clientY
    base = scroll
    moveT = e.timeStamp; moveV = 0
    // Was the stack still travelling when the finger landed? If so this gesture
    // is a catch, not a tap, and it must not also navigate.
    caught = Math.abs(vel) > 0.35 || Math.abs(target - scroll) > 0.03
    vel = 0; target = scroll
    ;(opts.canvas as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    // Parallax follows a real pointer only. On touch the "pointer" is the finger
    // mid-drag, so tying the lights and the rig's sway to it made the whole
    // scene lurch sideways on every swipe.
    if (!mqCoarse.matches) {
      pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
      lightTarget.set(pointer.x, pointer.y)
    }
    if (!dragging) return
    const dx = e.clientX - downX, dy = e.clientY - downY
    // 8px slop: a thumb never holds perfectly still, and treating a 6px wobble
    // as a drag stole taps from people with less steady hands.
    if (dx * dx + dy * dy > 64) dragged = true
    const prev = scroll
    scroll = base - (axisH ? dx : dy) / PX()
    const dt = Math.max(8, e.timeStamp - moveT) / 1000
    moveT = e.timeStamp
    // Smoothed, so one jittery sample at lift-off can't define the whole flick.
    moveV = moveV * 0.6 + ((scroll - prev) / dt) * 0.4
    target = scroll
  }
  const onUp = (e: PointerEvent) => {
    if (!dragging) return
    dragging = false
    if (dragged) {
      // Project the flick a fifth of a second forward, then bite onto the
      // nearest detent — never more than three cards from where it was let go.
      vel = Math.max(-14, Math.min(14, moveV))
      const here = Math.round(scroll)
      target = Math.max(here - 3, Math.min(here + 3, Math.round(scroll + vel * 0.20)))
      return
    }
    vel = 0
    // A tap. First job is to arrest a moving stack; only then may it navigate —
    // and only into a card the finger actually landed on. Tapping empty
    // background used to open whatever happened to be centred.
    if (caught) { target = Math.round(scroll); return }
    const c = hitAt(e.clientX, e.clientY)
    target = Math.round(scroll)
    if (!c) return
    // Tap the front card to open it; tap one behind to bring it to the front.
    // That gives the stack a second, forgiving way in on a phone, where
    // dragging to a precise card is fiddly.
    if (c.index === active) opts.onPick?.(c.href)
    else target = detentFor(c.index)
  }
  let wheelLock = false
  const onWheel = (e: WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(d) < 4 || wheelLock || dragging) return
    wheelLock = true; vel = 0
    target = Math.round(scroll) + (d > 0 ? 1 : -1)
    setTimeout(() => (wheelLock = false), 130)
  }
  const onKey = (e: KeyboardEvent) => {
    const ae = document.activeElement as HTMLElement | null
    // Never steal keys from a field, and never let Enter both activate a
    // focused button and open the centred card.
    if (ae?.closest?.('input, textarea, select, [contenteditable="true"]')) return
    const idle = !ae || ae === document.body || ae === opts.canvas
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { vel = 0; target = Math.round(scroll) + 1 }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { vel = 0; target = Math.round(scroll) - 1 }
    else if (idle && (e.key === 'Enter' || e.key === ' ') && active >= 0) { e.preventDefault(); opts.onPick?.(cards[active].href) }
  }
  opts.canvas.addEventListener('pointerdown', onDown)
  opts.canvas.addEventListener('pointermove', onMove)
  opts.canvas.addEventListener('pointerup', onUp)
  opts.canvas.addEventListener('pointercancel', onUp)
  addEventListener('wheel', onWheel, { passive: true })
  addEventListener('keydown', onKey)

  // A floor on camera distance, not a default. At 9 it was *binding* on every
  // desktop viewport — the width and height solves both wanted to come closer,
  // so the card sat at a quarter of the frame no matter what the framing maths
  // asked for. Low enough now to let the solve win, high enough that a very
  // wide, short window can't push the lens into fisheye.
  const BASE_Z = 4.2
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
      const tanHalf = Math.tan((camera.fov * Math.PI / 180) / 2)

      // Width: the layout's full lateral throw has to fit, not just one card.
      const wantW = CARD_W + LAYOUT_SPREAD[layout] * 2 + FRAME_MARGIN * 2
      const needW = wantW / (2 * tanHalf * camera.aspect)

      // Height: cards may only occupy the band left between the chrome. Framing
      // against the whole viewport is what let the top card sit under the
      // wordmark and the bottom one hide behind the caption.
      const H = Math.max(1, innerHeight)
      const band = Math.max(120, H - insetTop - insetBottom)
      const needH = ((CARD_H + FRAME_MARGIN * 2) * H) / (band * 2 * tanHalf)

      const dist = Math.max(BASE_Z, needW, needH)

      // Re-centre on that band: world units per screen pixel at this distance,
      // times half the inset imbalance. Positive raises the composition.
      const perPx = (2 * dist * tanHalf) / H
      const recentre = ((insetBottom - insetTop) / 2) * perPx

      camera.position.set(0, -(lift + recentre), dist)
    }
    camera.updateProjectionMatrix()

    // Cover the frustum at the backdrop's depth, with margin so a card's
    // refraction can never sample past its edge and pick up empty scene.
    const bdDist = camera.position.z - BACKDROP_Z
    const bdH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * bdDist
    const bdW = bdH * camera.aspect
    backdrop.scale.set(bdW * 1.25, bdH * 1.25, 1)
    backdrop.position.set(0, camera.position.y, BACKDROP_Z)
    bdMat.uniforms.uAspect.value = camera.aspect
    renderer.setSize(innerWidth, innerHeight)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    composer.setSize(innerWidth, innerHeight)
    composer.setPixelRatio(Math.min(devicePixelRatio, 2))
    bloom.setSize(innerWidth, innerHeight)
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

    // Under a reduced-motion preference the stack steps straight to its detent:
    // no travel, no float, no parallax. The layout still changes, but nothing
    // slides across the field of view.
    const calm = mqReduce.matches

    // The backdrop keeps drifting under reduced motion, just far slower: it is
    // a diffuse field with no edges to track, so it reads as light changing
    // rather than as something moving across the view.
    bdMat.uniforms.uTime.value = calm ? t * 0.15 : t

    if (!dragging) {
      if (calm) { scroll = target; vel = 0 }
      else {
        // Critically damped spring — settles in roughly a third of a second and
        // never overshoots, so the card you aimed at is the card you get.
        const k = 130, c = 2 * Math.sqrt(k)
        vel += (-k * (scroll - target) - c * vel) * dt
        scroll += vel * dt
        if (Math.abs(scroll - target) < 0.0008 && Math.abs(vel) < 0.01) { scroll = target; vel = 0 }
      }
    }

    // The whole rig breathes toward the pointer — parallax that sells depth.
    if (calm) lightTarget.set(0, 0)
    light.lerp(lightTarget, 1 - Math.pow(0.02, dt))

    // On top of the pointer parallax, the lamps wander on their own. Three
    // incommensurate periods per axis means the path never repeats and never
    // reads as a loop — light that drifts like weather rather than orbiting on
    // a timer. The specular streak on each bevel crawls with it, which is what
    // gives the glass its life when nothing else on screen is moving.
    const organic = calm ? 0 : 1
    const ox = organic * (Math.sin(t * 0.13) * 1.6 + Math.sin(t * 0.071) * 1.1 + Math.sin(t * 0.037) * 0.7)
    const oy = organic * (Math.cos(t * 0.11) * 1.2 + Math.cos(t * 0.053) * 0.9)
    const breathe = 1 + organic * (Math.sin(t * 0.19) * 0.10 + Math.sin(t * 0.087) * 0.06)

    keyLight.position.set(4 + light.x * 3.5 + ox, 6 + light.y * 2.5 + oy, 8)
    keyLight.intensity = 1.15 * breathe
    rimLight.position.set(-6 + light.x * 2.5 - ox * 0.7, -2 + light.y * 2 + oy * 0.5, 4)
    rimLight.intensity = 0.6 * (2 - breathe)
    // The bloom swells with the same signal, so the glow is the light's own
    // rather than a constant post effect sitting on top of it.
    bloom.strength = 0.34 * breathe

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
      const fl = calm ? 0 : Math.sin(t * 0.7 + c.index * 1.7) * 0.045
      const g = c.group
      g.position.set(
        tmp.p.x + light.x * 0.12,
        tmp.p.y + fl + light.y * 0.09,
        tmp.p.z + c.hover * 0.55
      )
      g.rotation.set(
        tmp.r.x + (layout === 'desk' ? 0 : -light.y * 0.06) + c.hover * 0.05,
        tmp.r.y + (layout === 'desk' ? 0 : light.x * 0.10),
        tmp.r.z + (calm ? 0 : Math.sin(t * 0.5 + c.index) * 0.006)
      )
      const sc = tmp.s * (1 + c.hover * 0.05)
      g.scale.setScalar(sc)

      // Glass gets thicker + glossier as a card comes forward: the focused card
      // reads as a heavier, more present piece of glass.
      const m = c.hit.material as MeshPhysicalMaterial
      m.thickness = SLAB_DEPTH * (0.9 + tmp.a * 0.35 + c.hover * 0.35)
      m.iridescence = 0.14 + c.hover * 0.22
      m.envMapIntensity = 1.5 + tmp.a * 0.6 + c.hover * 0.7
      const am = c.art.material as MeshPhysicalMaterial
      // Cards further from focus dim — depth cueing without fog. The old 0.54
      // floor took it too far: neighbours went milky and illegible, so the
      // stack read as out of focus rather than deep. Scale, recession and the
      // scrims already carry the depth; brightness only has to hint at it.
      am.emissiveIntensity = 0.54 + tmp.a * 0.46 + c.hover * 0.04
      am.envMapIntensity = 0.11 + tmp.a * 0.05 + c.hover * 0.10
      am.clearcoatRoughness = 0.22 - tmp.a * 0.06

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

    composer.render()
    if (!ready) { ready = true; onReadyCbs.forEach(f => f()) }
  }
  raf = requestAnimationFrame(frame)

  return {
    onReady(cb: () => void) { ready ? cb() : onReadyCbs.push(cb) },
    /** Chrome heights measured from the DOM, so framing tracks real layout. */
    setInsets(top: number, bottom: number) {
      if (top === insetTop && bottom === insetBottom) return
      insetTop = top; insetBottom = bottom; onResize()
    },
    /** Step whole cards (arrows, keyboard). */
    go(delta: number) { vel = 0; target = Math.round(scroll) + Math.round(delta) },
    /**
     * Bring a specific *item* to the front by the shortest route. Cards repeat
     * (8 cards over 4 destinations), so every candidate card for the item is
     * tested and the nearest wins — pressing a dot should never send the tower
     * the long way round.
     */
    goToItem(itemIndex: number) {
      let best = target, bd = Infinity
      for (let c = ((itemIndex % items.length) + items.length) % items.length; c < N; c += items.length) {
        const t = detentFor(c), d = Math.abs(t - scroll)
        if (d < bd) { bd = d; best = t }
      }
      vel = 0; target = best
    },
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
      backdrop.geometry.dispose(); bdMat.dispose()
      bloom.dispose(); composer.dispose()
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
