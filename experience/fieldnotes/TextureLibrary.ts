import * as THREE from 'three'

// Seeded pseudo-random for consistent texture generation
function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

export class TextureLibrary {
  private _cache = new Map<string, THREE.Texture>()

  private _getOrCreate(key: string, fn: () => THREE.Texture): THREE.Texture {
    if (!this._cache.has(key)) this._cache.set(key, fn())
    return this._cache.get(key)!
  }

  // Cream paper with Perlin-like grain
  paperBase(w = 512, h = 512, seed = 1): THREE.Texture {
    return this._getOrCreate(`paper-${seed}`, () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h
      const ctx = c.getContext('2d')!
      const rng = seededRng(seed)

      ctx.fillStyle = '#F0EDE8'
      ctx.fillRect(0, 0, w, h)

      // Subtle tonal variation
      const img = ctx.getImageData(0, 0, w, h)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const n = (rng() - 0.5) * 18
        d[i]   = Math.min(255, Math.max(0, d[i]   + n))
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n * 0.95))
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + n * 0.88))
      }
      ctx.putImageData(img, 0, 0)

      // Ruled lines
      ctx.strokeStyle = 'rgba(0,0,0,0.07)'
      ctx.lineWidth = 1
      for (let y = 52; y < h; y += 32) {
        ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(w - 30, y); ctx.stroke()
      }

      // Left margin line
      ctx.strokeStyle = 'rgba(180,120,100,0.18)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(68, 0); ctx.lineTo(68, h); ctx.stroke()

      const t = new THREE.CanvasTexture(c)
      t.needsUpdate = true
      return t
    })
  }

  // Note with inked text
  noteTexture(lines: string[], w = 512, h = 640, seed = 1): THREE.Texture {
    const key = `note-${lines.join('|')}-${seed}`
    return this._getOrCreate(key, () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h
      const ctx = c.getContext('2d')!
      const rng = seededRng(seed)

      // Paper base
      ctx.fillStyle = '#EDEAE4'
      ctx.fillRect(0, 0, w, h)

      const img = ctx.getImageData(0, 0, w, h)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const n = (rng() - 0.5) * 14
        d[i]   = Math.min(255, Math.max(0, d[i]   + n))
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n))
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + n))
      }
      ctx.putImageData(img, 0, 0)

      // Ruled lines
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'
      ctx.lineWidth = 1
      for (let y = 48; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(w - 24, y); ctx.stroke()
      }

      // Border
      ctx.strokeStyle = 'rgba(0,0,0,0.14)'
      ctx.lineWidth = 2
      ctx.strokeRect(8, 8, w - 16, h - 16)

      // Text
      ctx.fillStyle = '#1C1A18'
      let y = 80
      lines.forEach((line, i) => {
        const size = i === 0 ? 36 : 26
        ctx.font = `${i === 0 ? '700' : '400'} ${size}px "DM Sans", sans-serif`
        ctx.fillText(line, 36, y)
        y += size + 18
      })

      // Subtle ink smudge at corners
      const grad = ctx.createRadialGradient(w - 20, 20, 0, w - 20, 20, 60)
      grad.addColorStop(0, 'rgba(0,0,0,0.08)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      const t = new THREE.CanvasTexture(c)
      t.needsUpdate = true
      return t
    })
  }

  // Polaroid-style photo placeholder (grey photo area + white border)
  polaroidTexture(label = '', w = 512, h = 620, seed = 1): THREE.Texture {
    const key = `polaroid-${label}-${seed}`
    return this._getOrCreate(key, () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h
      const ctx = c.getContext('2d')!
      const rng = seededRng(seed)

      // White base
      ctx.fillStyle = '#F8F6F2'
      ctx.fillRect(0, 0, w, h)

      // Photo area - grey placeholder
      const margin = 28
      const photoH = h - 140
      ctx.fillStyle = '#C8C5BE'
      ctx.fillRect(margin, margin, w - margin * 2, photoH)

      // Grain on photo
      const img = ctx.getImageData(margin, margin, w - margin * 2, photoH)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const n = (rng() - 0.5) * 28
        d[i]   = Math.min(255, Math.max(0, d[i]   + n))
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n))
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + n))
      }
      ctx.putImageData(img, margin, margin)

      // Vignette on photo
      const vgn = ctx.createRadialGradient(w/2, photoH/2 + margin, photoH * 0.1, w/2, photoH/2 + margin, photoH * 0.8)
      vgn.addColorStop(0, 'rgba(0,0,0,0)')
      vgn.addColorStop(1, 'rgba(0,0,0,0.3)')
      ctx.fillStyle = vgn
      ctx.fillRect(margin, margin, w - margin * 2, photoH)

      // Label text at bottom
      if (label) {
        ctx.fillStyle = '#3A3632'
        ctx.font = '400 22px "DM Sans", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(label, w / 2, h - 40)
        ctx.textAlign = 'left'
      }

      // Drop shadow tint at top edge
      const sh = ctx.createLinearGradient(0, 0, 0, 12)
      sh.addColorStop(0, 'rgba(0,0,0,0.08)')
      sh.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = sh
      ctx.fillRect(0, 0, w, 12)

      const t = new THREE.CanvasTexture(c)
      t.needsUpdate = true
      return t
    })
  }

  // Halftone dot pattern (for comic panels)
  halftoneTexture(w = 512, h = 512): THREE.Texture {
    return this._getOrCreate('halftone', () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h
      const ctx = c.getContext('2d')!

      ctx.fillStyle = '#E8E4DC'
      ctx.fillRect(0, 0, w, h)

      const dotSpacing = 10
      ctx.fillStyle = 'rgba(30,25,20,0.12)'
      for (let y = 0; y < h; y += dotSpacing) {
        for (let x = 0; x < w; x += dotSpacing) {
          const r = 2.2
          ctx.beginPath()
          ctx.arc(x + (y % (dotSpacing * 2) === 0 ? 0 : dotSpacing / 2), y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const t = new THREE.CanvasTexture(c)
      t.needsUpdate = true
      return t
    })
  }

  // Blueprint grid (Entry 07)
  blueprintTexture(w = 512, h = 512): THREE.Texture {
    return this._getOrCreate('blueprint', () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h
      const ctx = c.getContext('2d')!

      ctx.fillStyle = '#0F1A2A'
      ctx.fillRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = 'rgba(100,160,240,0.22)'
      ctx.lineWidth = 0.8
      const step = 32
      for (let x = 0; x < w; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      // Major grid lines
      ctx.strokeStyle = 'rgba(100,160,240,0.45)'
      ctx.lineWidth = 1.2
      for (let x = 0; x < w; x += step * 4) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += step * 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      const t = new THREE.CanvasTexture(c)
      t.needsUpdate = true
      return t
    })
  }

  // Comic panel with ink border
  comicPanelTexture(w = 512, h = 400, seed = 1): THREE.Texture {
    const key = `comic-${seed}`
    return this._getOrCreate(key, () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h
      const ctx = c.getContext('2d')!
      const rng = seededRng(seed)

      // Off-white background with halftone-like grain
      ctx.fillStyle = '#E8E3D8'
      ctx.fillRect(0, 0, w, h)

      // Halftone dots
      ctx.fillStyle = 'rgba(30,20,10,0.09)'
      const dotS = 9
      for (let y = 0; y < h; y += dotS) {
        for (let x = 0; x < w; x += dotS) {
          ctx.beginPath()
          ctx.arc(x + (y % (dotS * 2) === 0 ? 0 : dotS / 2), y, 1.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Thick ink border (slightly wobbly)
      ctx.strokeStyle = '#1A1512'
      ctx.lineWidth = 6
      ctx.beginPath()
      const pts = [[10, 10], [w-10, 10], [w-10, h-10], [10, h-10]]
      ctx.moveTo(pts[0][0] + (rng()-0.5)*3, pts[0][1])
      pts.forEach(([x,y]) => {
        ctx.lineTo(x + (rng()-0.5)*3, y + (rng()-0.5)*3)
      })
      ctx.closePath()
      ctx.stroke()

      // Inner action lines from center
      ctx.strokeStyle = 'rgba(20,15,10,0.06)'
      ctx.lineWidth = 1
      const cx = w/2, cy = h/2
      for (let angle = 0; angle < Math.PI * 2; angle += 0.18) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(angle) * w, cy + Math.sin(angle) * h)
        ctx.stroke()
      }

      const t = new THREE.CanvasTexture(c)
      t.needsUpdate = true
      return t
    })
  }

  // Single large centered note — for mantra Entry 10
  mantraTexture(text: string, subtext: string, w = 600, h = 480): THREE.Texture {
    const key = `mantra-${text}`
    return this._getOrCreate(key, () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h
      const ctx = c.getContext('2d')!
      const rng = seededRng(42)

      ctx.fillStyle = '#EDEAE3'
      ctx.fillRect(0, 0, w, h)

      const img = ctx.getImageData(0, 0, w, h)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const n = (rng() - 0.5) * 10
        d[i]   = Math.min(255, Math.max(0, d[i]   + n))
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n))
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + n))
      }
      ctx.putImageData(img, 0, 0)

      ctx.textAlign = 'center'
      ctx.fillStyle = '#1A1714'
      ctx.font = '600 52px "Noto Sans Devanagari", serif'
      ctx.fillText(text, w / 2, h / 2 - 20)

      ctx.fillStyle = '#5A5652'
      ctx.font = 'italic 22px "DM Sans", sans-serif'
      ctx.fillText(subtext, w / 2, h / 2 + 40)

      ctx.strokeStyle = 'rgba(0,0,0,0.1)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(12, 12, w - 24, h - 24)

      ctx.textAlign = 'left'

      const t = new THREE.CanvasTexture(c)
      t.needsUpdate = true
      return t
    })
  }

  dispose() {
    this._cache.forEach(t => t.dispose())
    this._cache.clear()
  }
}
