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
 * A threat: an envelope that has turned into a monster. `kind` picks the
 * palette (spam green / virus red); `attack` bares the fangs and lights the
 * eyes for the frame where it lunges at the officer. Doom villain energy,
 * email skin.
 */
export function threatSprite(kind: 'spam' | 'virus', attack = false): HTMLCanvasElement {
  const { c, x } = make(48, 48)
  const glow = kind === 'spam' ? SPAM : VIRUS

  // outer glow halo — hotter mid-attack
  const g = x.createRadialGradient(24, 24, 4, 24, 24, 26)
  g.addColorStop(0, glow + (attack ? 'DD' : '99'))
  g.addColorStop(1, glow + '00')
  x.fillStyle = g
  x.fillRect(0, 0, 48, 48)

  // envelope body (the monster's head)
  x.fillStyle = '#EDE7DA'
  x.fillRect(8, 12, 32, 26)
  x.strokeStyle = glow
  x.lineWidth = 2
  x.strokeRect(9, 13, 30, 24)
  // flap = a furrowed brow (angled down = angry)
  x.strokeStyle = '#B9B2A2'
  x.lineWidth = 2
  x.beginPath()
  x.moveTo(8, 12)
  x.lineTo(24, 22)
  x.lineTo(40, 12)
  x.stroke()

  // eyes
  x.fillStyle = attack ? '#FFFFFF' : glow
  x.fillRect(15, 24, 5, 4)
  x.fillRect(28, 24, 5, 4)
  x.fillStyle = '#1a1020'
  x.fillRect(17, 25, 2, 2)
  x.fillRect(30, 25, 2, 2)

  // mouth: a snarl of fangs, wider on the attack frame
  x.fillStyle = '#1a1020'
  const mouthW = attack ? 22 : 16
  const mx = 24 - mouthW / 2
  x.fillRect(mx, 31, mouthW, attack ? 5 : 3)
  x.fillStyle = '#EDE7DA'
  const fangs = attack ? 5 : 4
  for (let i = 0; i < fangs; i++) {
    x.fillRect(mx + 1 + i * (mouthW / fangs), 31, 2, attack ? 4 : 2)
  }
  return c
}

/** A hostile packet the villains spit at the officer. */
export function projectileSprite(kind: 'spam' | 'virus'): HTMLCanvasElement {
  const { c, x } = make(16, 16)
  const glow = kind === 'spam' ? SPAM : VIRUS
  const g = x.createRadialGradient(8, 8, 1, 8, 8, 8)
  g.addColorStop(0, '#FFFFFF')
  g.addColorStop(0.4, glow)
  g.addColorStop(1, glow + '00')
  x.fillStyle = g
  x.fillRect(0, 0, 16, 16)
  x.fillStyle = '#FFFFFF'
  x.fillRect(6, 6, 4, 4)
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
