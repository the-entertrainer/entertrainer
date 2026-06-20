import * as THREE from 'three'
import { NoteObject } from './NoteObject'
import { PhotoObject } from './PhotoObject'
import { ParticleField } from './ParticleField'
import { ConnectionLines } from './ConnectionLines'
import { ScatterPhysics } from './ScatterPhysics'
import { TextureLibrary } from './TextureLibrary'
import { PostFX } from './PostFX'
import { ENTRIES } from './entries/index'
import type { EntryDef } from './entries/index'

export interface CamRef {
  pos: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
}

interface EntryObjects {
  notes: NoteObject[]
  photos: PhotoObject[]
  comics: NoteObject[]
  blueprintMesh?: THREE.Mesh
  mantraMesh?: THREE.Mesh
}

export class FieldNotesWorld {
  private _renderer: THREE.WebGLRenderer
  private _scene: THREE.Scene
  private _camera: THREE.PerspectiveCamera
  private _postfx: PostFX
  private _texLib: TextureLibrary
  private _camRef: CamRef
  private _lookTarget = new THREE.Vector3()
  private _mouse = new THREE.Vector2()

  private _entryObjects = new Map<number, EntryObjects>()
  private _particles: ParticleField
  private _connectionLines?: ConnectionLines
  private _scatter?: ScatterPhysics
  private _knowledgeGraph: { line: THREE.Line; mat: THREE.LineBasicMaterial }[] = []

  private _currentEntry = 0
  private _active = true
  private _raf = 0
  private _prevTime = 0
  private _elapsed = 0

  private _onMouse = (e: MouseEvent) => {
    this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  constructor(canvas: HTMLCanvasElement, camRef: CamRef, scatterContainer?: HTMLElement) {
    this._camRef = camRef

    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    this._renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this._renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    this._renderer.setClearColor(0x0D0C0A)

    this._scene = new THREE.Scene()

    this._camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 200)
    this._camera.position.set(0, 0, -4)

    const pr = Math.min(devicePixelRatio, 2)
    this._postfx = new PostFX(this._renderer, this._scene, this._camera, canvas.clientWidth, canvas.clientHeight, pr)

    this._texLib = new TextureLibrary()
    this._particles = new ParticleField(30000, this._scene)

    ENTRIES.forEach((entry, i) => this._buildEntry(entry, i + 1))
    this._buildKnowledgeGraph()

    if (scatterContainer) {
      const e08 = ENTRIES.find(e => e.id === 'clarity')
      if (e08?.scatterWords) {
        this._scatter = new ScatterPhysics(scatterContainer)
        this._scatter.init(e08.scatterWords)
      }
    }

    window.addEventListener('mousemove', this._onMouse)
    this._raf = requestAnimationFrame(this._loop)
  }

  private _buildEntry(entry: EntryDef, idx: number) {
    const objs: EntryObjects = { notes: [], photos: [], comics: [] }

    entry.notes.forEach((spec, si) => {
      const tex = this._texLib.noteTexture(spec.lines, 512, 640, idx * 100 + si)
      const pos = new THREE.Vector3(...spec.pos)
      const rot = new THREE.Euler(spec.rot[0], spec.rot[1], spec.rot[2])
      const note = new NoteObject(this._scene, tex, pos, rot, spec.scale ?? 1)
      note.mesh.visible = false
      objs.notes.push(note)
    })

    entry.photos.forEach((spec, si) => {
      const tex = this._texLib.polaroidTexture(spec.label ?? '', 512, 620, idx * 100 + si + 50)
      const pos = new THREE.Vector3(...spec.pos)
      const rot = new THREE.Euler(spec.rot[0], spec.rot[1], spec.rot[2])
      const photo = new PhotoObject(this._scene, tex, pos, rot, spec.scale ?? 1)
      photo.mesh.visible = false
      objs.photos.push(photo)
    })

    entry.comicPanels.forEach((spec, si) => {
      const tex = this._texLib.comicPanelTexture(512, 400, spec.seed)
      const pos = new THREE.Vector3(...spec.pos)
      const rot = new THREE.Euler(spec.rot[0], spec.rot[1], spec.rot[2])
      // Comic panels are wider than tall — override geometry via scale on a 1:0.8 ratio note
      const comic = new NoteObject(this._scene, tex, pos, rot, (spec.scale ?? 1) * 1.1)
      comic.mesh.visible = false
      objs.comics.push(comic)
    })

    if (entry.hasBlueprint) {
      const tex = this._texLib.blueprintTexture()
      const geo = new THREE.PlaneGeometry(14, 9)
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(0, 0, entry.zCenter)
      mesh.visible = false
      this._scene.add(mesh)
      objs.blueprintMesh = mesh
    }

    if (entry.hasMantra) {
      const tex = this._texLib.mantraTexture('सरलता', 'Clarity through simplicity')
      const geo = new THREE.PlaneGeometry(3.8, 2.4)
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(0, 0.5, entry.zCenter)
      mesh.visible = false
      this._scene.add(mesh)
      objs.mantraMesh = mesh
    }

    if (entry.constellationNodes) {
      this._connectionLines = new ConnectionLines(this._scene)
      this._connectionLines.addMany(entry.constellationNodes, 4.5)
      this._connectionLines.setVisible(false)
    }

    this._entryObjects.set(idx, objs)
  }

  private _buildKnowledgeGraph() {
    // One representative point per entry (entry zCenter, slight Y variation)
    const centers: THREE.Vector3[] = ENTRIES.map((e, i) => {
      const y = [0, 0.8, 0.5, -0.8, 2.5, 0, -0.5, 0, 0.8, 2.5, 0, 0.3][i] ?? 0
      return new THREE.Vector3(0, y, e.zCenter)
    })

    // Sequential connections
    for (let i = 0; i < centers.length - 1; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([centers[i], centers[i + 1]])
      const mat = new THREE.LineBasicMaterial({ color: 0xC8C0B0, transparent: true, opacity: 0, depthWrite: false })
      const line = new THREE.Line(geo, mat)
      line.visible = false
      this._scene.add(line)
      this._knowledgeGraph.push({ line, mat })
    }

    // Skip connections for visual depth
    for (const [a, b] of [[0, 5], [2, 8], [4, 10], [6, 11]] as [number, number][]) {
      if (b < centers.length) {
        const geo = new THREE.BufferGeometry().setFromPoints([centers[a], centers[b]])
        const mat = new THREE.LineBasicMaterial({ color: 0x908880, transparent: true, opacity: 0, depthWrite: false })
        const line = new THREE.Line(geo, mat)
        line.visible = false
        this._scene.add(line)
        this._knowledgeGraph.push({ line, mat })
      }
    }
  }

  private _loop = (now: number) => {
    if (!this._active) return
    this._raf = requestAnimationFrame(this._loop)

    const delta = Math.min((now - this._prevTime) / 1000, 0.05)
    this._prevTime = now
    this._elapsed += delta

    this._tick(this._elapsed, delta)
  }

  private _tick(time: number, delta: number) {
    this._camera.position.set(this._camRef.pos.x, this._camRef.pos.y, this._camRef.pos.z)
    this._lookTarget.set(this._camRef.target.x, this._camRef.target.y, this._camRef.target.z)
    this._camera.lookAt(this._lookTarget)

    this._entryObjects.forEach(objs => {
      objs.notes.forEach(n => { if (n.mesh.visible) n.tick(delta) })
      objs.photos.forEach(p => { if (p.mesh.visible) p.tick(delta) })
      objs.comics.forEach(c => { if (c.mesh.visible) c.tick(delta) })
    })

    const entry = ENTRIES[this._currentEntry - 1]
    if (entry?.particles) {
      this._particles.tick(delta, entry.particles, this._mouse)
    }

    if (this._connectionLines) {
      this._connectionLines.tick(delta, this._currentEntry === 5)
    }

    if (this._currentEntry === 12) {
      const pulse = Math.sin(time * 0.9) * 0.5 + 0.5
      this._knowledgeGraph.forEach(({ mat }) => {
        if (mat.opacity > 0) mat.opacity = 0.12 + pulse * 0.2
      })
    }

    this._postfx.tick(time)
    this._postfx.render()
  }

  setActiveEntry(n: number) {
    if (n === this._currentEntry) return
    const prev = this._currentEntry
    this._currentEntry = n

    if (prev > 0) {
      const prevObjs = this._entryObjects.get(prev)
      if (prevObjs) {
        const all = [...prevObjs.notes, ...prevObjs.photos, ...prevObjs.comics]
        all.forEach(o => {
          o.fadeTo(0, 0.5)
          setTimeout(() => { o.mesh.visible = false }, 600)
        })
        this._fadeOutMesh(prevObjs.blueprintMesh)
        this._fadeOutMesh(prevObjs.mantraMesh)
      }
      if (prev === 5) this._connectionLines?.fadeOut()
      if (prev === 12) {
        this._knowledgeGraph.forEach(({ line, mat }) => {
          mat.opacity = 0; line.visible = false
        })
      }
    }

    const objs = this._entryObjects.get(n)
    if (objs) {
      const all = [...objs.notes, ...objs.photos, ...objs.comics]
      all.forEach((o, i) => {
        o.mesh.visible = true
        setTimeout(() => o.fadeTo(0.92, 0.8), i * 55)
      })
      this._fadeInMesh(objs.blueprintMesh, 0.7, 1.6, 200)
      this._fadeInMesh(objs.mantraMesh, 0.95, 2.0, 500)
    }

    if (n === 5) {
      this._connectionLines?.setVisible(true)
      this._connectionLines?.fadeIn(1.5)
    }

    if (n === 12) {
      this._knowledgeGraph.forEach(({ line, mat }, i) => {
        setTimeout(() => {
          line.visible = true
          this._animateOpacity(mat, 0, 0.3, 1.8)
        }, i * 100)
      })
    }
  }

  private _fadeInMesh(mesh: THREE.Mesh | undefined, targetOpacity: number, duration: number, delay: number) {
    if (!mesh) return
    mesh.visible = true
    const mat = mesh.material as THREE.MeshBasicMaterial
    mat.opacity = 0
    setTimeout(() => this._animateOpacity(mat, 0, targetOpacity, duration), delay)
  }

  private _fadeOutMesh(mesh: THREE.Mesh | undefined) {
    if (!mesh) return
    const mat = mesh.material as THREE.MeshBasicMaterial
    this._animateOpacity(mat, mat.opacity, 0, 0.5)
    setTimeout(() => { mesh.visible = false }, 600)
  }

  private _animateOpacity(mat: { opacity: number }, from: number, to: number, duration: number) {
    let elapsed = 0
    mat.opacity = from
    const step = () => {
      elapsed += 1 / 60
      const t = Math.min(elapsed / duration, 1)
      mat.opacity = from + (to - from) * t
      if (t < 1) requestAnimationFrame(step)
    }
    step()
  }

  getScatterPhysics() { return this._scatter }

  resize(w: number, h: number) {
    this._camera.aspect = w / h
    this._camera.updateProjectionMatrix()
    this._renderer.setSize(w, h, false)
    const pr = Math.min(devicePixelRatio, 2)
    this._postfx.resize(w, h, pr)
  }

  dispose() {
    this._active = false
    cancelAnimationFrame(this._raf)
    window.removeEventListener('mousemove', this._onMouse)

    this._entryObjects.forEach(objs => {
      ;[...objs.notes, ...objs.photos, ...objs.comics].forEach(o => o.dispose())
      if (objs.blueprintMesh) {
        objs.blueprintMesh.geometry.dispose()
        ;(objs.blueprintMesh.material as THREE.MeshBasicMaterial).dispose()
        this._scene.remove(objs.blueprintMesh)
      }
      if (objs.mantraMesh) {
        objs.mantraMesh.geometry.dispose()
        ;(objs.mantraMesh.material as THREE.MeshBasicMaterial).dispose()
        this._scene.remove(objs.mantraMesh)
      }
    })

    this._particles.dispose()
    this._connectionLines?.dispose()
    this._scatter?.dispose()
    this._texLib.dispose()

    this._knowledgeGraph.forEach(({ line, mat }) => {
      line.geometry.dispose()
      mat.dispose()
      this._scene.remove(line)
    })

    this._postfx.dispose()
    this._renderer.dispose()
  }
}
