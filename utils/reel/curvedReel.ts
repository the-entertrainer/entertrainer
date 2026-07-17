// A real 3D film reel: ONE continuous curved ribbon (a hand-built cylindrical
// strip, not a fan of flat hinged planes), rendered over the site's glass
// backdrop. Each frame is as wide as its own photo needs — sized to the
// image's true aspect ratio — so every photo fills its window edge-to-edge
// with zero cropping and zero letterbox bars, while the ribbon still bends
// smoothly through a fixed-radius arc.

import * as THREE from 'three'

export interface ReelFrame { img: string; aspect: number }

// Atlas layout (pixels). One canvas holds every frame's photo, sprocket
// holes and divider lines — a single continuous strip, not per-cell tiles.
const CH = 800
const TOP_BAND = 64
const BOTTOM_BAND = 64
const CONTENT_Y = TOP_BAND
const CONTENT_H = CH - TOP_BAND - BOTTOM_BAND
const GUTTER = 18
const MIN_AR = 0.45
const MAX_AR = 2.35
const SEGS_PER_FRAME = 16

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath()
}

// Sprocket holes on a fixed pitch across the WHOLE atlas (ignoring frame
// boundaries) plus thin divider lines at each frame edge — the strip reads
// as one continuous reel with individual photos printed on it.
function drawStripDetail(g: CanvasRenderingContext2D, totalW: number, dividerXs: number[]) {
  g.globalCompositeOperation = 'destination-out'
  const slot = 100, holeW = 42, holeH = 20
  const topHoleY = (TOP_BAND - holeH) / 2
  const bottomHoleY = CH - BOTTOM_BAND + (BOTTOM_BAND - holeH) / 2
  for (let cx = slot / 2; cx < totalW; cx += slot) {
    roundRect(g, cx - holeW / 2, topHoleY, holeW, holeH, 6); g.fill()
    roundRect(g, cx - holeW / 2, bottomHoleY, holeW, holeH, 6); g.fill()
  }
  g.globalCompositeOperation = 'source-over'
  g.strokeStyle = 'rgba(255,255,255,0.14)'
  g.lineWidth = 2
  for (const x of dividerXs) {
    g.beginPath(); g.moveTo(x, CONTENT_Y - 8); g.lineTo(x, CONTENT_Y + CONTENT_H + 8); g.stroke()
  }
}

export class CurvedReel {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private group = new THREE.Group()
  private mesh: THREE.Mesh
  private material: THREE.ShaderMaterial
  private texture: THREE.CanvasTexture
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private readonly R = 6.0
  private readonly fh = 2.5      // fixed world height of the ribbon
  private fw = 0                 // widest single frame's world width (for camera fit)
  private n: number
  private vHalf = Math.tan((38 * Math.PI / 180) / 2)

  // Per-frame layout, computed once from each image's own aspect ratio.
  private cellXPx: number[] = []
  private cellWPx: number[] = []
  private frameThetaStart: number[] = []
  private frameDA: number[] = []
  private frameThetaCenter: number[] = []
  private totalWPx = 0

  index = 0
  private rotY = 0
  private dragging = false
  private dragBase = 0; private dragStartX = 0; private dragRot = 0
  // Pointer parallax targets (-1..1) — the reel leans gently toward the cursor.
  private px = 0; private py = 0
  onIndex?: (i: number) => void

  constructor(canvas: HTMLCanvasElement, frames: ReelFrame[]) {
    this.n = frames.length
    const pxToWorld = this.fh / CH

    // ── Layout: each frame is exactly as wide as its photo's own aspect
    // demands, so nothing ever letterboxes or crops. ──
    let xCursor = 0
    for (const f of frames) {
      const ar = Math.min(MAX_AR, Math.max(MIN_AR, f.aspect || 0.75))
      const contentW = Math.round(CONTENT_H * ar)
      const cellW = contentW + GUTTER * 2
      this.cellXPx.push(xCursor)
      this.cellWPx.push(cellW)
      xCursor += cellW
    }
    this.totalWPx = xCursor

    const worldWidths: number[] = []
    for (let i = 0; i < this.n; i++) {
      const wWorld = this.cellWPx[i] * pxToWorld
      worldWidths.push(wWorld)
      this.frameDA.push(2 * Math.asin(Math.min(0.98, wWorld / (2 * this.R))))
    }
    const totalTheta = this.frameDA.reduce((a, b) => a + b, 0)
    let thetaCursor = -totalTheta / 2
    for (let i = 0; i < this.n; i++) {
      this.frameThetaStart.push(thetaCursor)
      this.frameThetaCenter.push(thetaCursor + this.frameDA[i] / 2)
      thetaCursor += this.frameDA[i]
    }
    this.fw = Math.max(...worldWidths)

    // ── Atlas texture: one canvas, drawn once for the strip + holes, then
    // each photo painted into its own slot as it decodes. ──
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.totalWPx
    this.canvas.height = CH
    this.ctx = this.canvas.getContext('2d')!
    this.ctx.fillStyle = '#0f0e13'
    this.ctx.fillRect(0, 0, this.totalWPx, CH)
    drawStripDetail(this.ctx, this.totalWPx, this.cellXPx.slice(1))

    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 4

    // ── Geometry: a hand-built ruled surface curving through the arc — a
    // real continuous bend, not discrete flat planes hinged together. ──
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const frameIdx: number[] = []
    const indices: number[] = []
    let vi = 0
    for (let i = 0; i < this.n; i++) {
      const thetaA = this.frameThetaStart[i]
      const dA = this.frameDA[i]
      const xA = this.cellXPx[i]
      const wA = this.cellWPx[i]
      for (let s = 0; s <= SEGS_PER_FRAME; s++) {
        const t = s / SEGS_PER_FRAME
        const theta = thetaA + dA * t
        const sinT = Math.sin(theta), cosT = Math.cos(theta)
        const u = (xA + wA * t) / this.totalWPx
        positions.push(this.R * sinT, -this.fh / 2, this.R * cosT)
        normals.push(sinT, 0, cosT)
        uvs.push(u, 0)
        frameIdx.push(i)
        positions.push(this.R * sinT, this.fh / 2, this.R * cosT)
        normals.push(sinT, 0, cosT)
        uvs.push(u, 1)
        frameIdx.push(i)
        if (s < SEGS_PER_FRAME) {
          const a0 = vi, b0 = vi + 1, a1 = vi + 2, b1 = vi + 3
          indices.push(a0, a1, b0, b0, a1, b1)
        }
        vi += 2
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setAttribute('aFrameIndex', new THREE.Float32BufferAttribute(frameIdx, 1))
    geo.setIndex(indices)

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: this.texture },
        uCenterIndex: { value: 0 },
        uBulge: { value: 0.09 }
      },
      vertexShader: /* glsl */`
        attribute float aFrameIndex;
        varying vec2 vUv;
        varying float vRel;
        uniform float uCenterIndex;
        uniform float uBulge;
        void main() {
          vUv = uv;
          float rel = abs(aFrameIndex - uCenterIndex);
          vRel = rel;
          // The focused frame breathes slightly forward off the curve.
          float focus = max(0.0, 1.0 - rel);
          vec3 displaced = position + normal * focus * uBulge;
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D map;
        varying vec2 vUv;
        varying float vRel;
        void main() {
          if (vRel > 3.4) discard;
          vec4 tex = texture2D(map, vUv);
          // Neighbours stay visible so the strip reads as one continuous
          // reel, but dim with distance so the centre frame is the focus.
          float opacity = max(0.32, 1.0 - vRel * 0.5);
          gl_FragColor = vec4(tex.rgb, tex.a * opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })

    this.mesh = new THREE.Mesh(geo, this.material)
    this.group.add(this.mesh)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
    this.renderer.setClearColor(0x000000, 0)
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    this.camera.position.set(0, 0, this.R + 12)
    this.scene.add(this.group)

    // Each photo paints into its own atlas slot as it decodes — sized to
    // its slot exactly (the slot was sized FROM its aspect), so it always
    // fills edge-to-edge with no crop and no bars.
    frames.forEach((f, i) => {
      const im = new Image()
      im.onload = () => {
        const x = this.cellXPx[i] + GUTTER
        const w = this.cellWPx[i] - GUTTER * 2
        this.ctx.drawImage(im, x, CONTENT_Y, w, CONTENT_H)
        this.ctx.strokeStyle = 'rgba(255,255,255,0.10)'
        this.ctx.lineWidth = 2
        this.ctx.strokeRect(x, CONTENT_Y, w, CONTENT_H)
        this.texture.needsUpdate = true
      }
      im.src = f.img
    })
  }

  setIndex(i: number) { this.index = Math.max(0, Math.min(this.n - 1, i)) }

  startDrag(x: number) { this.dragging = true; this.dragStartX = x; this.dragBase = this.rotY; this.dragRot = this.rotY }
  moveDrag(x: number) { if (this.dragging) this.dragRot = this.dragBase + ((x - this.dragStartX) / window.innerWidth) * 2.4 }
  endDrag() {
    this.dragging = false
    const centerTheta = -this.rotY
    let best = 0, bestD = Infinity
    for (let i = 0; i < this.n; i++) {
      const d = Math.abs(this.frameThetaCenter[i] - centerTheta)
      if (d < bestD) { bestD = d; best = i }
    }
    this.index = best
    this.onIndex?.(best)
  }
  get isDragging() { return this.dragging }

  setPointer(nx: number, ny: number) { this.px = nx; this.py = ny }

  resize(w: number, h: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h)
    const aspect = w / h
    this.camera.aspect = aspect
    // Distance the centre frame so the tallest/widest content fits within
    // ~54% of the height AND ~84% of the width, whichever is tighter.
    const dH = this.fh / (0.54 * 2 * this.vHalf)
    const dW = this.fw / (0.84 * 2 * this.vHalf * aspect)
    const d = Math.max(dH, dW, 6)
    this.camera.position.z = this.R + d
    // Lift the reel into the upper area so the caption sits on clear glass below.
    this.group.position.y = 2 * d * this.vHalf * 0.155
    this.camera.updateProjectionMatrix()
  }

  update(dt: number) {
    if (this.dragging) this.rotY = this.dragRot
    else {
      const target = -this.frameThetaCenter[this.index]
      this.rotY += (target - this.rotY) * (1 - Math.pow(0.0009, dt))
      // Gentle pointer parallax so the reel feels alive between interactions.
      const k = 1 - Math.pow(0.005, dt)
      this.group.rotation.x += (this.py * 0.045 - this.group.rotation.x) * k
      this.group.position.x += (this.px * 0.2 - this.group.position.x) * k
    }
    this.group.rotation.y = this.rotY

    // Continuous "which frame currently faces the camera" value, driving
    // the per-frame dim/bulge falloff in the shader.
    const centerTheta = -this.rotY
    let centerIndex = this.index
    for (let i = 0; i < this.n; i++) {
      if (centerTheta >= this.frameThetaStart[i] && centerTheta <= this.frameThetaStart[i] + this.frameDA[i]) {
        centerIndex = i + (centerTheta - this.frameThetaStart[i]) / this.frameDA[i]
        break
      }
    }
    this.material.uniforms.uCenterIndex.value = centerIndex

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.material.dispose()
    this.texture.dispose()
    this.renderer.dispose()
  }
}
