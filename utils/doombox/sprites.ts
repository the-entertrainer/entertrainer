// ============================================================
// DOOMBOX — procedural pixel-art sprites.
// ============================================================
//
// Every sprite is drawn to an offscreen canvas at low resolution with image
// smoothing OFF, so when the raycaster blits it up into the world it stays
// crunchy and pixelated — the Doom look, with zero external art files. These
// stand in for Phase-4 hand-authored sprite sheets; the engine only ever
// asks for a canvas, so swapping in real art later is a one-function change.

import { OFFICER, OFFICER_DARK, SPAM, VIRUS } from './palette'

function make(w: number, h: number): { c: HTMLCanvasElement; x: CanvasRenderingContext2D } {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')!
  x.imageSmoothingEnabled = false
  return { c, x }
}

/**
 * A floating threat: an envelope with a toxic glow. `kind` picks the palette
 * (spam green / virus red) and the mark on the seal ($ vs a hazard cross).
 */
export function threatSprite(kind: 'spam' | 'virus'): HTMLCanvasElement {
  const { c, x } = make(48, 48)
  const glow = kind === 'spam' ? SPAM : VIRUS

  // outer glow halo
  const g = x.createRadialGradient(24, 24, 4, 24, 24, 26)
  g.addColorStop(0, glow + 'AA')
  g.addColorStop(1, glow + '00')
  x.fillStyle = g
  x.fillRect(0, 0, 48, 48)

  // envelope body
  x.fillStyle = '#EDE7DA'
  x.fillRect(8, 14, 32, 22)
  // border
  x.strokeStyle = glow
  x.lineWidth = 2
  x.strokeRect(9, 15, 30, 20)
  // flap
  x.strokeStyle = '#B9B2A2'
  x.lineWidth = 2
  x.beginPath()
  x.moveTo(8, 14)
  x.lineTo(24, 27)
  x.lineTo(40, 14)
  x.stroke()

  // the mark on the seal
  x.fillStyle = glow
  if (kind === 'spam') {
    // a blocky $ made of rectangles
    x.fillRect(22, 30, 4, 2)
    x.fillRect(20, 32, 8, 2)
    x.fillRect(20, 34, 8, 2)
    x.fillRect(23, 28, 2, 10)
  } else {
    // a hazard cross
    x.fillRect(22, 28, 4, 10)
    x.fillRect(19, 31, 10, 4)
  }
  return c
}

/**
 * The first-person neutraliser gun, anchored at the bottom-centre of the
 * viewport. `fire` swaps in a muzzle flash frame.
 */
export function weaponSprite(fire: boolean): HTMLCanvasElement {
  const { c, x } = make(64, 48)

  // body of the gun (purple officer tech)
  x.fillStyle = OFFICER_DARK
  x.fillRect(22, 20, 20, 28)
  x.fillStyle = OFFICER
  x.fillRect(26, 14, 12, 26)
  // barrel
  x.fillStyle = '#2A2340'
  x.fillRect(29, 4, 6, 14)
  // emitter ring
  x.fillStyle = fire ? '#FFFFFF' : OFFICER
  x.fillRect(27, 2, 10, 4)

  if (fire) {
    // muzzle flash
    const g = x.createRadialGradient(32, 2, 1, 32, 2, 20)
    g.addColorStop(0, '#FFFFFF')
    g.addColorStop(0.4, '#C9B6FF')
    g.addColorStop(1, '#7C4DFF00')
    x.fillStyle = g
    x.fillRect(12, -14, 40, 34)
  }
  return c
}

/**
 * A purple officer — used to draw OTHER players in coop. Included now so the
 * sprite contract is stable before the multiplayer phase lands.
 */
export function officerSprite(): HTMLCanvasElement {
  const { c, x } = make(32, 48)
  // legs
  x.fillStyle = OFFICER_DARK
  x.fillRect(10, 32, 5, 14)
  x.fillRect(17, 32, 5, 14)
  // torso
  x.fillStyle = OFFICER
  x.fillRect(8, 16, 16, 18)
  // visor head
  x.fillStyle = '#2A2340'
  x.fillRect(11, 6, 10, 10)
  x.fillStyle = SPAM
  x.fillRect(12, 9, 8, 3)
  return c
}
