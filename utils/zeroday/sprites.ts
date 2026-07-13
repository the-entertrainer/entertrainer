// ============================================================
// ZERO DAY — sprite bank + animation frame maps.
// ============================================================
//
// Loads the CC0 art pack (Vacaroxa generic run-n-gun) and exposes a single
// drawFrame helper. Frame maps were read off the sheets with a grid overlay:
// the player is a 45x45 8-column sheet; enemies are single-row strips.

export const PLAYER_FW = 45
export const PLAYER_COLS = 8

export const AR_FW = 38
export const RPG_FW = 44
export const SNIPER_FW = 44
export const EXPLO_FW = 32

// player animation frames (indices into the 45x45 sheet)
export const P = {
  idle: [0, 1, 2, 3],
  run: [8, 9, 10, 11, 12, 13, 14, 15],
  runShoot: [24, 25, 26, 27, 28, 29, 30, 31],
  shoot: [18, 19],
  aimUp: [20],
  runAimUp: [32, 33, 34, 35, 36, 37, 38, 39],
  jump: [44],
  crouch: [46],
  crouchShoot: [22],
  death: [48, 49, 50]
}

// enemy strips: idle / shoot frames
export const E = {
  ar: { fw: AR_FW, idle: [0, 1], shoot: [2, 3, 4] },
  rpg: { fw: RPG_FW, idle: [0, 1], shoot: [2, 3, 4] },
  sniper: { fw: SNIPER_FW, idle: [0, 1], shoot: [2, 3, 4, 5] }
}

const URLS: Record<string, string> = {
  player: '/zeroday/player.png',
  ar: '/zeroday/mob-ar.png',
  rpg: '/zeroday/mob-rpg.png',
  sniper: '/zeroday/mob-sniper.png',
  explosion: '/zeroday/explosion.png',
  a1bg: '/zeroday/area1/bg.png',
  a1wall: '/zeroday/area1/wall.png',
  a2c1: '/zeroday/area2/clouds1.png',
  a2c2: '/zeroday/area2/clouds2.png',
  a2c3: '/zeroday/area2/clouds3.png'
}

export class SpriteBank {
  imgs: Record<string, HTMLImageElement> = {}
  ready = false

  load(): Promise<void> {
    const entries = Object.entries(URLS)
    return Promise.all(
      entries.map(
        ([k, url]) =>
          new Promise<void>((res) => {
            const img = new Image()
            img.onload = () => res()
            img.onerror = () => res()
            img.src = url
            this.imgs[k] = img
          })
      )
    ).then(() => {
      this.ready = true
    })
  }

  /**
   * Blit one frame. `fw` frame width (square frames), `cols` columns in the
   * sheet. Draws centred horizontally on (dx) with feet at (dy); `flip`
   * mirrors for left-facing. `scale` scales the frame.
   */
  frame(
    ctx: CanvasRenderingContext2D,
    name: string,
    frame: number,
    fw: number,
    cols: number,
    dx: number,
    dy: number,
    scale: number,
    flip: boolean
  ) {
    const img = this.imgs[name]
    if (!img || !img.width) return
    const fh = fw
    const sx = (frame % cols) * fw
    const sy = Math.floor(frame / cols) * fh
    const dw = fw * scale
    const dh = fh * scale
    ctx.save()
    ctx.translate(dx, dy) // dx = centre x, dy = feet (bottom) y
    if (flip) ctx.scale(-1, 1)
    ctx.drawImage(img, sx, sy, fw, fh, -dw / 2, -dh, dw, dh)
    ctx.restore()
  }
}
