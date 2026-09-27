/** Squash. Brown bugs score. The glow ends the run. */

export type Kind = 'roach' | 'nymph' | 'radio'
export type Phase = 'title' | 'playing' | 'paused' | 'over'
export type Anim = 'crawl' | 'burst' | 'flare' | 'ripple'

export type Actor = {
  id: number
  kind: Kind | 'ripple'
  x: number
  y: number
  vx: number
  vy: number
  heading: number
  frame: number
  frameTime: number
  anim: Anim
  alive: boolean
  draw: number
}

export type TapResult =
  | { type: 'start' }
  | { type: 'resume' }
  | { type: 'miss' }
  | { type: 'kill'; points: number; clean: boolean; combo: number; fever: boolean }
  | { type: 'dead' }

const CELL = 192
const DIRS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4
  return { vx: Math.cos(a), vy: Math.sin(a) }
})

const DRAW: Record<Kind, number> = { roach: 92, nymph: 60, radio: 108 }
const HIT: Record<Kind, { body: [number, number]; clean: [number, number] }> = {
  roach: { body: [36, 24], clean: [16, 12] },
  nymph: { body: [36, 24], clean: [16, 12] },
  radio: { body: [42, 30], clean: [16, 12] }
}

export function headingOf(vx: number, vy: number) {
  const deg = (Math.atan2(vy, vx) * 180) / Math.PI
  return Math.round(((deg % 360) + 360) % 360 / 45) % 8
}

function ellipse(px: number, py: number, cx: number, cy: number, rx: number, ry: number) {
  const dx = (px - cx) / rx
  const dy = (py - cy) / ry
  return dx * dx + dy * dy <= 1
}

export type Squash = ReturnType<typeof createSquash>

export function createSquash(width: number, height: number, random: () => number = Math.random) {
  let w = width
  let h = height
  let nextId = 1
  let phase: Phase = 'title'
  let score = 0
  let combo = 1
  let comboLeft = 0
  let fever = 0
  let kills = 0
  let speed = 1
  let elapsed = 0
  let spawnIn = 0.45
  let lastTap = { x: -999, y: -999, t: -99 }
  const actors: Actor[] = []

  function reset() {
    actors.length = 0
    score = 0
    combo = 1
    comboLeft = 0
    fever = 0
    kills = 0
    speed = 1
    elapsed = 0
    spawnIn = 0.4
    phase = 'playing'
  }

  function baseSpeed() {
    return Math.max(w, h) / 2.15
  }

  function living(kind?: Kind) {
    return actors.filter((a) => a.alive && a.anim === 'crawl' && (kind ? a.kind === kind : a.kind !== 'ripple'))
  }

  function spawn() {
    const crawling = living()
    if (crawling.length >= 9) return
    const side = Math.floor(random() * 4)
    const inward = [
      [0, 1, 7],
      [3, 4, 5],
      [1, 2, 3],
      [5, 6, 7]
    ][side]
    const heading = inward[Math.floor(random() * inward.length)]
    const dir = DIRS[heading]
    const margin = 30
    let x = margin + random() * (w - margin * 2)
    let y = margin + random() * (h - margin * 2)
    if (side === 0) x = -20
    if (side === 1) x = w + 20
    if (side === 2) y = -20
    if (side === 3) y = h + 20
    if (elapsed - lastTap.t < 0.4) {
      const dx = x - lastTap.x
      const dy = y - lastTap.y
      if (dx * dx + dy * dy < 80 * 80) return
    }
    for (const bug of crawling) {
      const dx = bug.x - x
      const dy = bug.y - y
      if (dx * dx + dy * dy < 74 * 74) return
    }
    const radios = living('radio').length
    const radioOk = elapsed >= 8 && radios < (score >= 40 ? 2 : 1) && radios < Math.ceil((crawling.length + 1) / 5)
    let kind: Kind = random() < 0.55 ? 'nymph' : 'roach'
    if (elapsed >= 8 && radioOk && random() < 0.22) kind = 'radio'
    const pace = baseSpeed() * speed * (kind === 'radio' ? 1.25 : 1)
    actors.push({
      id: nextId++,
      kind,
      x,
      y,
      vx: dir.vx * pace,
      vy: dir.vy * pace,
      heading,
      frame: Math.floor(random() * 8),
      frameTime: 0,
      anim: 'crawl',
      alive: true,
      draw: DRAW[kind]
    })
  }

  function tap(x: number, y: number): TapResult {
    if (phase === 'title' || phase === 'over') {
      reset()
      return { type: 'start' }
    }
    if (phase === 'paused') {
      phase = 'playing'
      return { type: 'resume' }
    }
    lastTap = { x, y, t: elapsed }
    let best: { bug: Actor; clean: boolean; d: number } | null = null
    for (const bug of actors) {
      if (!bug.alive || bug.anim !== 'crawl' || bug.kind === 'ripple') continue
      const kind = bug.kind as Kind
      const scale = bug.draw / CELL
      const body = HIT[kind].body
      const rx = body[0] * scale
      const ry = body[1] * scale
      const finger = 22
      if (!ellipse(x, y, bug.x, bug.y, rx + finger * 0.35, ry + finger * 0.35)) continue
      const cleanBox = HIT[kind].clean
      const clean = kind !== 'radio' && ellipse(x, y, bug.x, bug.y, cleanBox[0] * scale + 6, cleanBox[1] * scale + 6)
      const d = (x - bug.x) ** 2 + (y - bug.y) ** 2
      if (!best || d < best.d) best = { bug, clean, d }
    }
    if (!best) {
      actors.push({
        id: nextId++,
        kind: 'ripple',
        x,
        y,
        vx: 0,
        vy: 0,
        heading: 0,
        frame: 0,
        frameTime: 0,
        anim: 'ripple',
        alive: true,
        draw: 128
      })
      return { type: 'miss' }
    }
    const bug = best.bug
    if (bug.kind === 'radio') {
      bug.anim = 'flare'
      bug.frame = 0
      bug.frameTime = 0
      bug.vx = 0
      bug.vy = 0
      phase = 'over'
      return { type: 'dead' }
    }
    bug.anim = 'burst'
    bug.frame = 0
    bug.frameTime = 0
    bug.heading = 0
    bug.vx = 0
    bug.vy = 0
    const startingFever = combo >= 8 && fever <= 0
    if (combo >= 8) fever = 4
    const gained = (best.clean ? 2 : 1) * combo * (fever > 0 ? 2 : 1)
    score += gained
    kills += 1
    if (kills % 8 === 0) speed = Math.min(2.4, speed * 1.08)
    combo = Math.min(8, combo + 1)
    comboLeft = 0.7
    return { type: 'kill', points: gained, clean: best.clean, combo, fever: startingFever || fever > 0 }
  }

  function update(dt: number) {
    if (phase !== 'playing') {
      stepAnims(dt)
      return
    }
    const step = Math.min(dt, 0.05)
    elapsed += step
    if (comboLeft > 0) {
      comboLeft -= step
      if (comboLeft <= 0) combo = 1
    }
    if (fever > 0) fever = Math.max(0, fever - step)
    const slow = fever > 0 ? 0.72 : 1
    for (const bug of actors) {
      if (!bug.alive || bug.anim !== 'crawl') continue
      const scale = bug.kind === 'radio' ? 1 : slow
      bug.x += bug.vx * scale * step
      bug.y += bug.vy * scale * step
      if (bug.x < -80 || bug.y < -80 || bug.x > w + 80 || bug.y > h + 80) {
        bug.alive = false
        if (bug.kind !== 'radio') {
          combo = 1
          comboLeft = 0
        }
      }
    }
    stepAnims(step)
    spawnIn -= step
    if (spawnIn <= 0) {
      spawn()
      const gap = Math.max(0.34, 0.92 - elapsed * 0.012)
      spawnIn = gap
    }
    for (let i = actors.length - 1; i >= 0; i--) {
      if (!actors[i].alive) actors.splice(i, 1)
    }
  }

  function stepAnims(dt: number) {
    for (const bug of actors) {
      if (!bug.alive || bug.anim === 'crawl') {
        if (bug.anim === 'crawl') {
          bug.frameTime += dt
          const fps = 16
          if (bug.frameTime >= 1 / fps) {
            bug.frameTime = 0
            bug.frame = (bug.frame + 1) % 8
          }
        }
        continue
      }
      const fps = bug.anim === 'burst' ? 22 : bug.anim === 'flare' ? 18 : 18
      const frames = bug.anim === 'ripple' ? 4 : 8
      bug.frameTime += dt
      if (bug.frameTime >= 1 / fps) {
        bug.frameTime = 0
        bug.frame += 1
        if (bug.frame >= frames) bug.alive = false
      }
    }
  }

  function togglePause() {
    if (phase === 'playing') phase = 'paused'
    else if (phase === 'paused') phase = 'playing'
  }

  return {
    tap,
    update,
    togglePause,
    resize(nw: number, nh: number) {
      w = nw
      h = nh
    },
    snapshot() {
      return {
        phase,
        score,
        combo,
        fever,
        elapsed,
        width: w,
        height: h,
        actors: actors.map((a) => ({ ...a }))
      }
    }
  }
}
