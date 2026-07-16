// A real 3D film reel: photos composited into film cells and laid out on a
// curved arc, rendered with Three.js over the site's glass backdrop. Scrubbing
// rotates the arc so the active cell faces the camera; neighbours curve away.

import * as THREE from 'three'

export interface ReelFrame { img: string; fit?: 'cover' | 'contain' }

const CW = 600, CH = 800 // cell texture resolution
const WIN = { x: 44, y: 96, w: 512, h: 608 } // photo window inside the cell

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
  // Film base.
  g.fillStyle = '#141118'; g.fillRect(0, 0, CW, CH)
  g.fillStyle = '#0c0a10'; g.fillRect(0, 0, CW, WIN.y - 10); g.fillRect(0, WIN.y + WIN.h + 10, CW, CH)
  // Sprocket holes, top and bottom rows.
  g.fillStyle = '#050408'
  const holeW = 46, holeH = 30, gap = (CW - 6 * holeW) / 7
  for (let i = 0; i < 6; i++) {
    const hx = gap + i * (holeW + gap)
    roundRect(g, hx, 32, holeW, holeH, 7); g.fill()
    roundRect(g, hx, CH - 62, holeW, holeH, 7); g.fill()
  }
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

  index = 0
  private rotY = 0
  private dragging = false
  private dragBase = 0; private dragStartX = 0; private dragRot = 0
  onIndex?: (i: number) => void

  constructor(canvas: HTMLCanvasElement, frames: ReelFrame[]) {
    this.n = frames.length
    const w = 2.7, h = w * (CH / CW)
    this.R = 6.0
    this.dA = 2 * Math.asin(Math.min(0.9, w / (2 * this.R)))
    this.geo = new THREE.PlaneGeometry(w, h)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
    this.renderer.setClearColor(0x000000, 0)
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    this.camera.position.set(0, 0, this.R + 10)
    // Lift the reel into the upper area so the caption sits on clear glass below.
    this.group.position.y = 1.4
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
      im.onload = () => { drawFit(g, im, f.fit || 'cover'); g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 3; g.strokeRect(WIN.x, WIN.y, WIN.w, WIN.h); tex.needsUpdate = true }
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

  resize(w: number, h: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // Pull the camera back a touch on narrow/portrait screens so cells fit.
    this.camera.position.z = this.R + 10 + Math.max(0, (1 - w / h)) * 6
    this.camera.updateProjectionMatrix()
  }

  update(dt: number) {
    if (this.dragging) this.rotY = this.dragRot
    else {
      const target = -this.index * this.dA
      this.rotY += (target - this.rotY) * (1 - Math.pow(0.0009, dt))
    }
    this.group.rotation.y = this.rotY
    for (let i = 0; i < this.frames.length; i++) {
      const rel = Math.abs(i * this.dA + this.rotY)
      const m = this.mats[i]
      m.opacity = Math.max(0.1, 1 - rel * 0.85)
      const f = this.frames[i]
      f.visible = rel < 2.6
      const s = 1 + Math.max(0, 0.08 - rel * 0.08)
      f.scale.setScalar(s)
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.geo.dispose()
    this.mats.forEach(m => { (m.map as THREE.Texture)?.dispose(); m.dispose() })
    this.renderer.dispose()
  }
}
