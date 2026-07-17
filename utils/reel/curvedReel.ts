// A real 3D film reel: photos composited into film cells and laid out on a
// curved arc, rendered with Three.js over the site's glass backdrop. Scrubbing
// rotates the arc so the active cell faces the camera; neighbours curve away.

import * as THREE from 'three'

export interface ReelFrame { img: string; fit?: 'cover' | 'contain' }

const CW = 600, CH = 800 // cell texture resolution
const WIN = { x: 26, y: 92, w: 548, h: 616 } // photo window inside the cell

function drawFit(g: CanvasRenderingContext2D, img: HTMLImageElement, fit: 'cover' | 'contain') {
  const { x, y, w, h } = WIN
  const ir = img.width / img.height, wr = w / h
  let dw = w, dh = h, dx = x, dy = y
  if (fit === 'contain') {
    if (ir > wr) { dh = w / ir; dy = y + (h - dh) / 2 } else { dw = h * ir; dx = x + (w - dw) / 2 }
    g.drawImage(img, dx, dy, dw, dh)
  } else {
    let sw = img.width, sh = img.height, sx = 0, sy = 0
    if (ir > wr) { sw = img.height * wr; sx = (img.width - sw) / 2 } else { sh = img.width / wr; sy = (img.height - sh) / 2 }
    g.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  }
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath()
}

function cellCanvas(): { c: HTMLCanvasElement; g: CanvasRenderingContext2D } {
  const c = document.createElement('canvas'); c.width = CW; c.height = CH
  const g = c.getContext('2d')!
  g.clearRect(0, 0, CW, CH)
  // Full, square dark film base so adjacent cells butt into one continuous strip.
  g.fillStyle = '#0f0e13'; g.fillRect(0, 0, CW, CH)
  // Transparent sprocket holes on a fixed pitch so they tile seamlessly across
  // cell boundaries and read as one continuous perforated reel.
  g.globalCompositeOperation = 'destination-out'
  const slot = 100, holeW = 42, holeH = 20
  for (let cx = slot / 2; cx < CW; cx += slot) {
    roundRect(g, cx - holeW / 2, 34, holeW, holeH, 6); g.fill()
    roundRect(g, cx - holeW / 2, CH - 54, holeW, holeH, 6); g.fill()
  }
  g.globalCompositeOperation = 'source-over'
  return { c, g }
}

export class CurvedReel {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private group = new THREE.Group()
  private frames: THREE.Mesh[] = []
  private mats: THREE.MeshBasicMaterial[] = []
  private geo: THREE.PlaneGeometry
  private R: number
  private dA: number
  private n: number
  private fw: number
  private fh: number
  private vHalf = Math.tan((38 * Math.PI / 180) / 2)

  index = 0
  private rotY = 0
  private dragging = false
  private dragBase = 0; private dragStartX = 0; private dragRot = 0
  // Pointer parallax targets (-1..1) — the reel leans gently toward the cursor.
  private px = 0; private py = 0
  onIndex?: (i: number) => void

  constructor(canvas: HTMLCanvasElement, frames: ReelFrame[]) {
    this.n = frames.length
    const w = 2.7, h = w * (CH / CW)
    this.fw = w; this.fh = h
    this.R = 6.0
    this.dA = 2 * Math.asin(Math.min(0.9, w / (2 * this.R)))
    this.geo = new THREE.PlaneGeometry(w, h)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
    this.renderer.setClearColor(0x000000, 0)
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    this.camera.position.set(0, 0, this.R + 12)
    this.scene.add(this.group)

    frames.forEach((f, i) => {
      const { c, g } = cellCanvas()
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 4
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1 })
      this.mats.push(mat)
      const mesh = new THREE.Mesh(this.geo, mat)
      const a = i * this.dA
      mesh.position.set(this.R * Math.sin(a), 0, this.R * Math.cos(a))
      mesh.rotation.y = a
      this.group.add(mesh)
      this.frames.push(mesh)

      const im = new Image()
      im.onload = () => {
        g.save()
        g.beginPath(); g.rect(WIN.x, WIN.y, WIN.w, WIN.h); g.clip()
        g.fillStyle = '#0a090d'; g.fillRect(WIN.x, WIN.y, WIN.w, WIN.h)
        drawFit(g, im, f.fit || 'cover')
        g.restore()
        g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 2; g.strokeRect(WIN.x, WIN.y, WIN.w, WIN.h)
        tex.needsUpdate = true
      }
      im.src = f.img
    })
  }

  setIndex(i: number) { this.index = Math.max(0, Math.min(this.n - 1, i)) }

  startDrag(x: number) { this.dragging = true; this.dragStartX = x; this.dragBase = this.rotY; this.dragRot = this.rotY }
  moveDrag(x: number) { if (this.dragging) this.dragRot = this.dragBase + ((x - this.dragStartX) / window.innerWidth) * 2.4 }
  endDrag() {
    this.dragging = false
    const i = Math.max(0, Math.min(this.n - 1, Math.round(-this.rotY / this.dA)))
    this.index = i
    this.onIndex?.(i)
  }
  get isDragging() { return this.dragging }

  setPointer(nx: number, ny: number) { this.px = nx; this.py = ny }

  resize(w: number, h: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setPixelRatio(dpr)
    // updateStyle must stay ON: the canvas is an absolutely-positioned replaced
    // element, so without an explicit CSS size it renders at its DPR-scaled
    // buffer size and overflows the viewport on high-density screens.
    this.renderer.setSize(w, h)
    const aspect = w / h
    this.camera.aspect = aspect
    // Distance the centre cell so it fits within ~54% of the height AND ~84% of
    // the width, whichever is tighter — keeps it sized right on any screen.
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
      const target = -this.index * this.dA
      this.rotY += (target - this.rotY) * (1 - Math.pow(0.0009, dt))
      // Gentle pointer parallax so the reel feels alive between interactions.
      const k = 1 - Math.pow(0.005, dt)
      this.group.rotation.x += (this.py * 0.045 - this.group.rotation.x) * k
      this.group.position.x += (this.px * 0.2 - this.group.position.x) * k
    }
    this.group.rotation.y = this.rotY
    for (let i = 0; i < this.frames.length; i++) {
      const rel = Math.abs(i * this.dA + this.rotY)
      const m = this.mats[i]
      // Neighbours stay visible so the strip reads as one continuous reel, but
      // dim with distance so the centre frame is clearly the focus.
      m.opacity = Math.max(0.32, 1 - rel * 0.5)
      const f = this.frames[i]
      f.visible = rel < this.dA * 3.4
      // The focused frame breathes slightly forward.
      const focus = Math.max(0, 1 - rel / this.dA)
      f.scale.setScalar(1 + focus * 0.045)
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.geo.dispose()
    this.mats.forEach(m => { (m.map as THREE.Texture)?.dispose(); m.dispose() })
    this.renderer.dispose()
  }
}
