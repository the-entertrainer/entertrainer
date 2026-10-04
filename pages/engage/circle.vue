<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * Circle — a small top-down tile walk.
 * Five altars, one more side each, then a circle.
 * Pixel world stays on its own palette in both site themes.
 */
import { useThemeStore } from '~/stores/theme'

useSeoMeta({
  title: 'Circle · Engage',
  description: 'A triangle walks the tiles. Five altars. Then a circle.',
  ogUrl: 'https://entertrainer.in/engage/circle',
})

const FONT: Record<string, number[]> = {
  'A': [14,17,17,31,17,17,17],
  'B': [30,17,17,30,17,17,30],
  'C': [15,16,16,16,16,16,15],
  'D': [30,17,17,17,17,17,30],
  'E': [31,16,16,30,16,16,31],
  'F': [31,16,16,30,16,16,16],
  'G': [15,16,16,23,17,17,14],
  'H': [17,17,17,31,17,17,17],
  'I': [14,4,4,4,4,4,14],
  'J': [7,2,2,2,18,18,12],
  'K': [17,18,20,24,20,18,17],
  'L': [16,16,16,16,16,16,31],
  'M': [17,27,21,21,17,17,17],
  'N': [17,25,21,19,17,17,17],
  'O': [14,17,17,17,17,17,14],
  'P': [30,17,17,30,16,16,16],
  'Q': [14,17,17,17,21,18,13],
  'R': [30,17,17,30,20,18,17],
  'S': [15,16,16,14,1,1,30],
  'T': [31,4,4,4,4,4,4],
  'U': [17,17,17,17,17,17,14],
  'V': [17,17,17,17,17,10,4],
  'W': [17,17,17,21,21,21,10],
  'X': [17,17,10,4,10,17,17],
  'Y': [17,17,10,4,4,4,4],
  'Z': [31,1,2,4,8,16,31],
  'a': [0,0,14,1,15,17,15],
  'b': [16,16,30,17,17,17,30],
  'c': [0,0,15,16,16,16,15],
  'd': [1,1,15,17,17,17,15],
  'e': [0,0,14,17,31,16,14],
  'f': [6,9,8,28,8,8,8],
  'g': [0,15,17,15,1,17,14],
  'h': [16,16,22,25,17,17,17],
  'i': [4,0,12,4,4,4,14],
  'j': [2,0,6,2,2,18,12],
  'k': [16,16,18,20,24,20,18],
  'l': [12,4,4,4,4,4,14],
  'm': [0,0,26,21,21,21,17],
  'n': [0,0,22,25,17,17,17],
  'o': [0,0,14,17,17,17,14],
  'p': [0,0,30,17,30,16,16],
  'q': [0,0,15,17,15,1,1],
  'r': [0,0,22,25,16,16,16],
  's': [0,0,15,16,14,1,30],
  't': [8,28,8,8,8,9,6],
  'u': [0,0,17,17,17,19,13],
  'v': [0,0,17,17,17,10,4],
  'w': [0,0,17,17,21,21,10],
  'x': [0,0,17,10,4,10,17],
  'y': [0,0,17,17,15,1,14],
  'z': [0,0,31,2,4,8,31],
  '0': [14,17,19,21,25,17,14],
  '1': [4,12,4,4,4,4,14],
  '2': [14,17,1,6,8,16,31],
  '3': [30,1,1,14,1,1,30],
  '4': [2,6,10,18,31,2,2],
  '5': [31,16,30,1,1,17,14],
  '6': [7,8,16,30,17,17,14],
  '7': [31,1,2,4,8,8,8],
  '8': [14,17,17,14,17,17,14],
  '9': [14,17,17,15,1,2,12],
  ' ': [0,0,0,0,0,0,0],
  '.': [0,0,0,0,0,12,12],
  ',': [0,0,0,0,12,4,8],
  '!': [4,4,4,4,0,0,4],
  '?': [14,17,1,6,4,0,4],
  '\'': [4,4,8,0,0,0,0],
  '-': [0,0,0,31,0,0,0],
  ':': [0,12,12,0,12,12,0]
}

const MAP = [
  '##########################',
  '#~~~~~~~~~#..............#',
  '#~~~~~~~~~#..E...........#',
  '#~~~~~~~~~#.,,...........#',
  '#.........#.,............#',
  '#..+++++++#.,............#',
  '#..+s+++++#.,...~~~~.....#',
  '#..+++P+++#.,...~~~~..W..#',
  '#..+++o+++#.,.b.~~~~..,..#',
  '#..+++++++#,,,,,,,,,,,,,,#',
  '#.....,...#.,,,,,,,,,,,,,#',
  '#...F.,..................#',
  '#...q.,....========......#',
  '#.....,....#......V......#',
  '#.....,....#.............#',
  '#.....,.K..#....h....d...#',
  '#.....,....#.............#',
  '##########################',
]

type Dir = 'up' | 'down' | 'left' | 'right'
type Kind = 'npc' | 'altar'

type Spawn = {
  kind: Kind
  id: string
  edges: number
  color: string
  name: string
  species: string
  facing: Dir
  eyes: boolean
  radius: number
}

type Ent = Spawn & { x: number, y: number }

type Seg = { text: string, start: number, end: number }

type Box = {
  name: string
  species: string
  edges: number
  color: string
  radius: number
  eyes: boolean
  lines: string[]
  index: number
  shown: number
}

const INK = '#141820'
const GOLD = '#f0c14a'
const PAPER = '#f4f0e6'
const FRAME = '#0e1218'
const PANEL = '#1e2836'
const MUTED = '#9eb0c4'

const VEC: Record<Dir, [number, number]> = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
}
const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }
const STEP_MS = 180

const FORMS = [
  { edges: 3, name: 'Trikona', tattva: 'Agni', color: '#e23d3d' },
  { edges: 4, name: 'Chatushkona', tattva: 'Prithvi', color: '#e07a2f' },
  { edges: 5, name: 'Panchakona', tattva: 'Ap', color: '#1aaa78' },
  { edges: 6, name: 'Shatkona', tattva: 'Vayu', color: '#3d7edb' },
  { edges: 8, name: 'Ashtakona', tattva: 'Dikpala', color: '#7a45d0' },
  { edges: 24, name: 'Vritta', tattva: 'Purna', color: '#f0c14a' },
] as const

const GROUND: Record<string, string> = {
  P: '+', o: '+', s: '+',
  E: '.', W: '.', F: '.', V: '.', K: '.',
  b: '.', q: '.', h: '.', d: '.',
}

const SPAWN: Record<string, Spawn> = {
  o: { kind: 'npc', id: 'bindu', edges: 0, color: '#f4f0e6', name: 'Ananta-bindu', species: 'Bindu', facing: 'up', eyes: true, radius: 3.5 },
  s: { kind: 'npc', id: 'square', edges: 4, color: '#e07a2f', name: 'Bhumi-shila', species: 'Chatushkona', facing: 'down', eyes: true, radius: 6 },
  q: { kind: 'npc', id: 'pent', edges: 5, color: '#1aaa78', name: 'Mitra-kara', species: 'Panchakona', facing: 'right', eyes: true, radius: 6 },
  b: { kind: 'npc', id: 'hex', edges: 6, color: '#3d7edb', name: 'Indra-kona', species: 'Shatkona', facing: 'down', eyes: true, radius: 6.2 },
  h: { kind: 'npc', id: 'oct', edges: 8, color: '#7a45d0', name: 'Vajra-stha', species: 'Ashtakona', facing: 'left', eyes: true, radius: 6.2 },
  d: { kind: 'npc', id: 'dodec', edges: 12, color: '#e89ad4', name: 'Rudra-purna', species: 'Dodecagona', facing: 'left', eyes: true, radius: 6.3 },
  E: { kind: 'altar', id: 'earth', edges: 4, color: GOLD, name: 'Altar of Prithvi', species: 'Earth', facing: 'up', eyes: false, radius: 4.2 },
  W: { kind: 'altar', id: 'water', edges: 5, color: GOLD, name: 'Altar of Ap', species: 'Water', facing: 'up', eyes: false, radius: 4.2 },
  F: { kind: 'altar', id: 'fire', edges: 3, color: GOLD, name: 'Altar of Tejas', species: 'Fire', facing: 'up', eyes: false, radius: 4.2 },
  V: { kind: 'altar', id: 'air', edges: 6, color: GOLD, name: 'Altar of Vayu', species: 'Air', facing: 'up', eyes: false, radius: 4.2 },
  K: { kind: 'altar', id: 'ether', edges: 24, color: GOLD, name: 'Altar of Akasha', species: 'Ether', facing: 'up', eyes: false, radius: 4.4 },
}

const FLAVOR: Record<string, string> = {
  earth: 'Prithvi. The square earth carries the rest.',
  water: 'Ap. Water finds its level, then moves.',
  fire: 'Tejas. A flame starts sharp. It can change.',
  air: 'Vayu. Order has more corners than pride.',
}
const GAINS = [
  '',
  'A fourth side. You are Chatushkona.',
  'A fifth side. Panchakona. Less of a wedge.',
  'Six sides. Shatkona. They may look away.',
  'Eight sides. Ashtakona. Corners crowd.',
  'You are Vritta. No beginning, and no end.',
]

const theme = useThemeStore()
const live = ref('Trikona. Three edges. The agora likes six, or more.')
const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const topRef = ref<HTMLElement | null>(null)
const dockRef = ref<HTMLElement | null>(null)

const COLS = MAP[0]!.length
const ROWS = MAP.length
const player = { x: 1, y: 1, fromX: 1, fromY: 1, facing: 'down' as Dir, walking: false, t: 0 }
const tiles: string[][] = []
const ents: Ent[] = []
const at = new Map<string, Ent>()
const visited = new Set<string>()
const padHeld: Dir[] = []
const keyHeld: Dir[] = []
let dialogue: Box | null = null
let reduced = false
let talkQueued = false
let typeAcc = 0
let last = 0
let raf = 0
const spriteCache = new Map<string, HTMLCanvasElement>()

function form() {
  return FORMS[Math.min(visited.size, FORMS.length - 1)]!
}

function buildWorld() {
  for (let y = 0; y < ROWS; y++) {
    const row: string[] = []
    const line = MAP[y]!
    for (let x = 0; x < COLS; x++) {
      const ch = line[x]!
      const spawn = SPAWN[ch]
      if (ch === 'P' || spawn) {
        row.push(GROUND[ch] || '.')
        if (ch === 'P') {
          player.x = x
          player.y = y
          player.fromX = x
          player.fromY = y
        } else if (spawn) {
          const ent = { ...spawn, x, y }
          ents.push(ent)
          at.set(`${x},${y}`, ent)
        }
      } else {
        row.push(ch)
      }
    }
    tiles.push(row)
  }
}

function solid(x: number, y: number) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true
  const t = tiles[y]![x]
  if (t === '#' || t === '~' || t === '=') return true
  return at.has(`${x},${y}`)
}

function currentDir(): Dir | null {
  if (padHeld.length) return padHeld[padHeld.length - 1]!
  if (keyHeld.length) return keyHeld[keyHeld.length - 1]!
  return null
}

function pushDir(list: Dir[], dir: Dir) {
  const i = list.indexOf(dir)
  if (i >= 0) list.splice(i, 1)
  list.push(dir)
}

function dropDir(list: Dir[], dir: Dir) {
  const i = list.indexOf(dir)
  if (i >= 0) list.splice(i, 1)
}

function startStep(dir: Dir) {
  player.facing = dir
  const [dx, dy] = VEC[dir]
  const nx = player.x + dx
  const ny = player.y + dy
  if (solid(nx, ny)) return
  player.fromX = player.x
  player.fromY = player.y
  player.x = nx
  player.y = ny
  player.t = 0
  player.walking = true
}

function nudge() {
  if (dialogue || player.walking) return
  const dir = currentDir()
  if (dir) startStep(dir)
}

function altarLines(id: string, step: number): string[] {
  const finish = step >= 5
  const gain = GAINS[step] || GAINS[5]!
  if (id === 'ether') {
    return [finish
      ? 'Akasha. No first corner. The count closes.'
      : 'Akasha waits. A circle is all five stones.', gain]
  }
  return [FLAVOR[id] || 'The stone is warm, and it knows you.', gain]
}

function npcLines(id: string, grown: number): string[] {
  if (grown >= 5) {
    if (id === 'bindu') return ['Blessed Vritta. The cycle is complete.', 'No beginning. No end. Only the round.']
    if (id === 'square') return ['Blessed Vritta. We keep four, and we are glad.']
    if (id === 'pent') return ['You roll. The whisper was right.']
    if (id === 'hex') return ['Mercy, Vritta. We thought you a triangle.', 'The corners dissolved. The old line was true.', 'We bow our corners to the round one.']
    if (id === 'oct') return ['Mercy. We did not know a wedge could close.', 'Our corners bow. The round one is here.']
    return ['The full count was not a joke, Vritta.', 'Mercy. Our folds were only a costume.']
  }
  if (id === 'bindu') {
    const lines = [
      'Sharp corners are only the start of a flame.',
      'They count sides. The circle has none.',
      'Five altars: earth, water, fire, air, ether.',
    ]
    if (grown > 0) lines.push('You have changed. The stones are not done.')
    return lines
  }
  if (id === 'square') {
    if (grown >= 3) return ['You are heavier already. The earth noticed.', 'Mockery is noise. Weight is not vertices.']
    return ['We stand firm. A square earth carries all.', 'Mockery is noise. Weight is not vertices.']
  }
  if (id === 'pent') {
    if (grown >= 2) return ['Your sides even out. The path was right.']
    return ['A triangle that rolls like the sun. Is it you?']
  }
  if (id === 'hex') {
    if (grown <= 1) return ['Begone, crude wedge. Three edges? Copper work.', 'The High Agora starts at six. Do not stare.']
    if (grown <= 3) return ['You grew. Still a peasant to the twelve-fold.', 'Softer corners. Still an angle that hopes.']
    return ['That resonance. You near the twelfth fold.']
  }
  if (id === 'oct') {
    if (grown <= 1) return ['Off the path. Eight sides do not greet wedges.']
    if (grown <= 3) return ['Less crude. The council is not impressed.']
    return ['You approach our count. Explain yourself.']
  }
  if (grown <= 1) return ['Twelve folds, and you brought three. Quaint.', 'Return when you are more complicated.']
  if (grown <= 3) return ['A few new sides. Complexity is unmoved.']
  return ['Near twelve. Who allowed this resonance?']
}

function openBox(box: Omit<Box, 'index' | 'shown'>) {
  const shown = reduced ? box.lines[0]!.length : 0
  dialogue = { ...box, index: 0, shown }
  typeAcc = 0
  live.value = `${box.name}. ${box.lines[0]}`
}

function speak(ent: Ent) {
  if (ent.kind === 'altar') {
    if (visited.has(ent.id)) {
      openBox({
        name: ent.name, species: ent.species, edges: ent.edges, color: ent.color, radius: ent.radius, eyes: false,
        lines: visited.size >= 5
          ? ['The stone is still. You are the circle.']
          : ['This stone already gave you a side.', 'The others are still waiting.'],
      })
      return
    }
    visited.add(ent.id)
    openBox({
      name: ent.name, species: ent.species, edges: ent.edges, color: GOLD, radius: ent.radius, eyes: false,
      lines: altarLines(ent.id, visited.size),
    })
    return
  }
  openBox({
    name: ent.name, species: ent.species, edges: ent.edges, color: ent.color, radius: ent.radius, eyes: ent.eyes,
    lines: npcLines(ent.id, visited.size),
  })
}

function tryTalk() {
  if (player.walking || dialogue) return
  const [dx, dy] = VEC[player.facing]
  const ent = at.get(`${player.x + dx},${player.y + dy}`)
  if (!ent) return
  ent.facing = OPP[player.facing]
  speak(ent)
}

function advance() {
  if (!dialogue) {
    if (player.walking) { talkQueued = true; return }
    tryTalk()
    return
  }
  const line = dialogue.lines[dialogue.index]!
  if (dialogue.shown < line.length) {
    dialogue.shown = line.length
    return
  }
  if (dialogue.index < dialogue.lines.length - 1) {
    dialogue.index += 1
    const next = dialogue.lines[dialogue.index]!
    dialogue.shown = reduced ? next.length : 0
    typeAcc = 0
    live.value = `${dialogue.name}. ${next}`
    return
  }
  closeBox()
}

function closeBox() {
  dialogue = null
  talkQueued = false
  live.value = ''
  nudge()
}

function confirm() { advance() }
function cancel() { if (dialogue) closeBox() }

function onDir(e: PointerEvent, dir: Dir, down: boolean) {
  e.preventDefault()
  const el = e.currentTarget as HTMLElement
  if (down) {
    try { el.setPointerCapture(e.pointerId) } catch { /* already gone */ }
    pushDir(padHeld, dir)
    nudge()
  } else {
    dropDir(padHeld, dir)
  }
}

function onAPointer(e: PointerEvent) {
  e.preventDefault()
  confirm()
}
function onAClick(e: MouseEvent) {
  if (e.detail !== 0) return
  e.preventDefault()
  confirm()
}
function onBPointer(e: PointerEvent) {
  e.preventDefault()
  cancel()
}
function onBClick(e: MouseEvent) {
  if (e.detail !== 0) return
  e.preventDefault()
  cancel()
}
function onTheme(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  theme.toggle()
}

function dirFromKey(key: string): Dir | null {
  if (key === 'ArrowUp' || key === 'w' || key === 'W') return 'up'
  if (key === 'ArrowDown' || key === 's' || key === 'S') return 'down'
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') return 'left'
  if (key === 'ArrowRight' || key === 'd' || key === 'D') return 'right'
  return null
}

function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  const dir = dirFromKey(e.key)
  if (dir) {
    e.preventDefault()
    if (!e.repeat) { pushDir(keyHeld, dir); nudge() }
    return
  }
  if ((tag === 'BUTTON' || tag === 'A') && (e.key === 'Enter' || e.key === ' ')) return
  if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
    e.preventDefault()
    if (!e.repeat) confirm()
    return
  }
  if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
    e.preventDefault()
    if (!e.repeat) cancel()
  }
}

function onKeyUp(e: KeyboardEvent) {
  const dir = dirFromKey(e.key)
  if (dir) dropDir(keyHeld, dir)
}

function layout(line: string, cols: number): Seg[] {
  const segs: Seg[] = []
  let i = 0
  while (i < line.length) {
    let end = Math.min(line.length, i + cols)
    if (end < line.length) {
      const sp = line.lastIndexOf(' ', end)
      if (sp > i) end = sp
    }
    const start = i
    const text = line.slice(i, end)
    i = end
    let segEnd = end
    if (line[i] === ' ') {
      segEnd = i + 1
      i += 1
    }
    segs.push({ text, start, end: segEnd })
  }
  return segs
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function sprite(edges: number, color: string, facing: Dir, radius: number, eyes: boolean) {
  const key = `${edges}|${color}|${facing}|${radius}|${eyes ? 1 : 0}`
  const hit = spriteCache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 16
  c.height = 16
  const g = c.getContext('2d')!
  const img = g.createImageData(16, 16)
  const data = img.data
  const fill = rgb(color)
  const outline = rgb(INK)
  const pts = edges > 2 && edges < 16 ? polyPoints(edges, radius, facing) : null
  const inside = (x: number, y: number) => {
    if (x < 0 || y < 0 || x > 15 || y > 15) return false
    const px = x + 0.5
    const py = y + 0.5
    if (!pts) {
      const dx = px - 7.5
      const dy = py - 7.5
      return dx * dx + dy * dy <= radius * radius
    }
    return pointInPoly(px, py, pts)
  }
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (!inside(x, y)) continue
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)
      const col = edge ? outline : fill
      const i = (y * 16 + x) * 4
      data[i] = col[0]
      data[i + 1] = col[1]
      data[i + 2] = col[2]
      data[i + 3] = 255
    }
  }
  if (eyes) {
    const off = facing === 'up' ? [0, -1] : facing === 'down' ? [0, 1] : facing === 'left' ? [-1, 0] : [1, 0]
    for (const [ex, ey] of [[6, 8], [9, 8]]) {
      const x = ex + off[0]
      const y = ey + off[1]
      const i = (y * 16 + x) * 4
      if (x < 0 || y < 0 || x > 15 || y > 15 || data[i + 3] === 0) continue
      data[i] = 20
      data[i + 1] = 24
      data[i + 2] = 32
      data[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  spriteCache.set(key, c)
  return c
}

function polyPoints(n: number, r: number, facing: Dir): [number, number][] {
  const rot = facing === 'up' ? -Math.PI / 2 : facing === 'right' ? 0 : facing === 'down' ? Math.PI / 2 : Math.PI
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 2 * Math.PI) / n
    pts.push([7.5 + Math.cos(a) * r, 7.5 + Math.sin(a) * r])
  }
  return pts
}

function pointInPoly(x: number, y: number, pts: [number, number][]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i]![0]
    const yi = pts[i]![1]
    const xj = pts[j]![0]
    const yj = pts[j]![1]
    const hit = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-6) + xi
    if (hit) inside = !inside
  }
  return inside
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, scale: number) {
  ctx.fillStyle = color
  let cx = x
  for (const ch of text) {
    const glyph = FONT[ch] || FONT[ch.toUpperCase()]
    if (glyph) {
      for (let row = 0; row < 7; row++) {
        const bits = glyph[row]!
        for (let col = 0; col < 5; col++) {
          if (bits & (1 << (4 - col))) ctx.fillRect(cx + col * scale, y + row * scale, scale, scale)
        }
      }
    }
    cx += 6 * scale
  }
}

function drawTile(ctx: CanvasRenderingContext2D, ch: string, x: number, y: number, frame: number) {
  const px = x * 16
  const py = y * 16
  if (ch === '~') {
    ctx.fillStyle = '#1a4f86'
    ctx.fillRect(px, py, 16, 16)
    ctx.fillStyle = '#163e68'
    const shift = (frame + x) % 2
    ctx.fillRect(px + shift, py + 5, 7, 1)
    ctx.fillRect(px + 8 - shift, py + 11, 7, 1)
    ctx.fillStyle = '#2f74b8'
    ctx.fillRect(px + 2 + shift, py + 4, 3, 1)
    return
  }
  if (ch === '#') {
    ctx.fillStyle = '#1a3c22'
    ctx.fillRect(px, py, 16, 16)
    ctx.fillStyle = '#245c32'
    ctx.fillRect(px + 1, py + 1, 14, 10)
    ctx.fillStyle = '#17361f'
    ctx.fillRect(px + 3, py + 3, 4, 3)
    ctx.fillStyle = '#6b4428'
    ctx.fillRect(px + 6, py + 11, 4, 5)
    return
  }
  if (ch === '=') {
    ctx.fillStyle = '#6e5a3e'
    ctx.fillRect(px, py, 16, 16)
    ctx.fillStyle = '#a89878'
    ctx.fillRect(px + 1, py + 1, 6, 6)
    ctx.fillRect(px + 9, py + 1, 6, 6)
    ctx.fillRect(px + 1, py + 9, 6, 6)
    ctx.fillRect(px + 9, py + 9, 6, 6)
    return
  }
  if (ch === ',') {
    ctx.fillStyle = '#c4a06a'
    ctx.fillRect(px, py, 16, 16)
    ctx.fillStyle = '#a07848'
    ctx.fillRect(px, py, 16, 1)
    ctx.fillRect(px, py + 15, 16, 1)
    ctx.fillStyle = '#ddc08a'
    ctx.fillRect(px + 3, py + 6, 2, 1)
    ctx.fillRect(px + 11, py + 11, 2, 1)
    return
  }
  if (ch === '+') {
    ctx.fillStyle = (x + y) % 2 === 0 ? '#d9d3c3' : '#cfc8b6'
    ctx.fillRect(px, py, 16, 16)
    ctx.fillStyle = '#8e897c'
    ctx.fillRect(px, py, 16, 1)
    ctx.fillRect(px, py, 1, 16)
    return
  }
  ctx.fillStyle = (x + y) % 2 === 0 ? '#3f8f45' : '#388643'
  ctx.fillRect(px, py, 16, 16)
  ctx.fillStyle = '#2f6e36'
  ctx.fillRect(px, py + 15, 16, 1)
  if (((x * 13 + y * 7) % 8) === 0) {
    ctx.fillStyle = '#67b85a'
    ctx.fillRect(px + 4, py + 6, 1, 2)
    ctx.fillRect(px + 6, py + 5, 1, 2)
  }
}

function drawAltar(ctx: CanvasRenderingContext2D, ent: Ent) {
  const px = ent.x * 16
  const py = ent.y * 16
  const done = visited.has(ent.id)
  ctx.fillStyle = '#6e5a3e'
  ctx.fillRect(px + 1, py + 4, 14, 12)
  ctx.fillStyle = done ? '#8d7a58' : '#a89878'
  ctx.fillRect(px + 2, py + 3, 12, 11)
  ctx.fillStyle = '#cbb892'
  ctx.fillRect(px + 4, py + 5, 8, 6)
  const spr = sprite(ent.edges, done ? PAPER : GOLD, 'up', ent.radius, false)
  ctx.drawImage(spr, px, py - 1)
  if (done) {
    ctx.fillStyle = GOLD
    ctx.fillRect(px + 2, py + 3, 2, 2)
    ctx.fillRect(px + 12, py + 3, 2, 2)
  }
}

function actorDraw(ctx: CanvasRenderingContext2D, edges: number, color: string, facing: Dir, radius: number, eyes: boolean, tx: number, ty: number, bob: number) {
  const spr = sprite(edges, color, facing, radius, eyes)
  ctx.drawImage(spr, Math.round(tx * 16), Math.round(ty * 16 + bob))
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  const canvas = canvasRef.value
  const root = rootRef.value
  if (!canvas || !root) return
  const dt = last ? Math.min(48, now - last) : 16
  last = now
  if (document.hidden) return

  if (reduced && dialogue) {
    const line = dialogue.lines[dialogue.index]!
    if (dialogue.shown < line.length) dialogue.shown = line.length
  } else if (dialogue) {
    const line = dialogue.lines[dialogue.index]!
    if (dialogue.shown < line.length) {
      typeAcc += dt
      while (typeAcc >= 32 && dialogue.shown < line.length) {
        dialogue.shown += 1
        typeAcc -= 32
      }
    }
  }

  if (player.walking) {
    player.t += dt / STEP_MS
    if (player.t >= 1) {
      player.t = 1
      player.walking = false
      if (talkQueued) {
        talkQueued = false
        tryTalk()
      } else if (!dialogue) {
        const dir = currentDir()
        if (dir) startStep(dir)
      }
    }
  }

  const cssW = root.clientWidth
  const cssH = root.clientHeight
  if (cssW < 2 || cssH < 2) return
  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  const dockH = dockRef.value?.offsetHeight ?? 148
  const topH = topRef.value?.offsetHeight ?? 64
  const textScale = cssW >= 980 ? 3 : 2
  const lineH = 8 * textScale
  const boxX = 8
  const boxW = Math.max(120, cssW - 16)
  let portrait = cssW < 340 ? 0 : 36
  let textX = portrait ? boxX + 10 + portrait : boxX + 12
  let textW = boxX + boxW - 12 - textX
  let cols = Math.floor(textW / (6 * textScale))
  if (cols < 16 && portrait) {
    portrait = 0
    textX = boxX + 12
    textW = boxX + boxW - 12 - textX
    cols = Math.floor(textW / (6 * textScale))
  }
  cols = Math.max(12, cols)
  const segs = dialogue ? layout(dialogue.lines[dialogue.index]!, cols) : []
  const lineCount = Math.min(6, Math.max(2, segs.length || 2))
  const boxH = 10 + lineCount * lineH + 8
  const plateH = lineH + 4
  const bottomCut = dockH + (dialogue ? boxH + plateH + 6 : 0)
  const hudH = 46
  const playTop = topH + hudH
  const playBottom = cssH - bottomCut
  const playMidY = playTop + Math.max(16, playBottom - playTop) / 2
  const playMidX = cssW / 2

  const dockSpace = 160
  const playH = Math.max(120, cssH - dockSpace)
  let scale = 2
  while (scale < 5 && (scale + 1) * 16 * 8 <= cssW && (scale + 1) * 16 * 6 <= playH) scale += 1

  const f = form()
  const drawTx = reduced || !player.walking ? player.x : player.fromX + (player.x - player.fromX) * Math.min(1, player.t)
  const drawTy = reduced || !player.walking ? player.y : player.fromY + (player.y - player.fromY) * Math.min(1, player.t)
  const focusX = (drawTx + 0.5) * 16
  const focusY = (drawTy + 0.5) * 16
  const viewW = cssW / scale
  const viewH = cssH / scale
  const mapW = COLS * 16
  const mapH = ROWS * 16
  let camX = focusX - playMidX / scale
  let camY = focusY - playMidY / scale
  if (mapW <= viewW) camX = (mapW - viewW) / 2
  else camX = Math.min(Math.max(0, camX), mapW - viewW)
  if (mapH <= viewH) camY = (mapH - viewH) / 2
  else camY = Math.min(Math.max(0, camY), mapH - viewH)
  camX = Math.round(camX)
  camY = Math.round(camY)

  const bw = Math.floor(cssW * dpr)
  const bh = Math.floor(cssH * dpr)
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw
    canvas.height = bh
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, cssW, cssH)
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, -camX * dpr * scale, -camY * dpr * scale)
  ctx.imageSmoothingEnabled = false

  const waterFrame = reduced ? 0 : Math.floor(now / 420) % 2
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) drawTile(ctx, tiles[y]![x]!, x, y, waterFrame)
  }

  const bob = !reduced && player.walking && player.t > 0.18 && player.t < 0.82 ? -1 : 0
  const drawList: { y: number, draw: () => void }[] = []
  for (const ent of ents) {
    drawList.push({
      y: ent.y,
      draw: () => {
        if (ent.kind === 'altar') drawAltar(ctx, ent)
        else actorDraw(ctx, ent.edges, ent.color, ent.facing, ent.radius, ent.eyes, ent.x, ent.y, 0)
      },
    })
  }
  drawList.push({
    y: drawTy,
    draw: () => actorDraw(ctx, f.edges, f.color, player.facing, f.edges >= 16 ? 6.5 : 6.2, true, drawTx, drawTy, bob),
  })
  drawList.sort((a, b) => a.y - b.y)
  for (const item of drawList) item.draw()

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  drawHud(ctx, cssW, topH, f)

  if (dialogue) {
    const boxY = Math.max(playTop, cssH - dockH - 6 - boxH)
    drawBox(ctx, dialogue, segs, boxX, boxY, boxW, boxH, textX, textScale, lineH, portrait, now)
  }
}

function drawHud(ctx: CanvasRenderingContext2D, cssW: number, topH: number, f: (typeof FORMS)[number]) {
  const scale = 2
  const title = f.name
  const sub = f.edges >= 16 ? 'circle' : `${f.edges} sides`
  const textChars = Math.max(title.length, sub.length)
  const w = textChars * 6 * scale + 62
  const h = 8 * scale * 2 + 16
  const x = Math.round((cssW - w) / 2)
  const y = topH + 4
  ctx.fillStyle = FRAME
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = PANEL
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4)
  ctx.fillStyle = GOLD
  ctx.fillRect(x + 2, y + 2, 3, h - 4)
  drawText(ctx, title, x + 8, y + 4, GOLD, scale)
  drawText(ctx, sub, x + 8, y + 4 + 8 * scale, PAPER, scale)
  const order = ['earth', 'water', 'fire', 'air', 'ether']
  let px = x + w - 10 - order.length * 8
  const py = y + Math.round((h - 6) / 2)
  for (const id of order) {
    ctx.fillStyle = visited.has(id) ? GOLD : '#3a4658'
    ctx.fillRect(px, py, 6, 6)
    ctx.fillStyle = FRAME
    ctx.fillRect(px, py, 6, 1)
    px += 8
  }
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  box: Box,
  segs: Seg[],
  x: number,
  y: number,
  w: number,
  h: number,
  textX: number,
  scale: number,
  lineH: number,
  portrait: number,
  now: number,
) {
  const plate = box.name
  const nameW = plate.length * 6 * scale
  const tagW = box.species.length * 6 * scale
  const showTag = nameW + tagW + 22 <= w - 16
  const plateW = Math.min(w - 8, (showTag ? nameW + tagW + 16 : nameW) + 12)
  ctx.fillStyle = FRAME
  ctx.fillRect(x + 8, y - lineH + 2, plateW, lineH + 2)
  ctx.fillStyle = PANEL
  ctx.fillRect(x + 10, y - lineH + 4, plateW - 4, lineH - 2)
  drawText(ctx, plate, x + 14, y - lineH + 5, GOLD, scale)
  if (showTag) drawText(ctx, box.species, x + 14 + nameW + 8, y - lineH + 5, MUTED, scale)

  ctx.fillStyle = FRAME
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = PANEL
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6)
  ctx.fillStyle = GOLD
  ctx.fillRect(x, y, 8, 3)
  ctx.fillRect(x, y, 3, 8)
  ctx.fillRect(x + w - 8, y + h - 3, 8, 3)
  ctx.fillRect(x + w - 3, y + h - 8, 3, 8)

  if (portrait > 0) {
    ctx.fillStyle = '#121820'
    ctx.fillRect(x + 8, y + 8, portrait, portrait)
    ctx.fillStyle = FRAME
    ctx.fillRect(x + 8, y + 8, portrait, 2)
    ctx.fillRect(x + 8, y + 8, 2, portrait)
    const spr = sprite(box.edges, box.color, 'down', box.radius, box.eyes)
    const inner = portrait - 8
    ctx.drawImage(spr, x + 12, y + 12, inner, inner)
  }

  let ty = y + 8
  const shown = box.shown
  for (const seg of segs) {
    const vis = Math.max(0, Math.min(seg.text.length, shown - seg.start))
    if (vis > 0) drawText(ctx, seg.text.slice(0, vis), textX, ty, PAPER, scale)
    ty += lineH
    if (ty > y + h - 6) break
  }
  const line = box.lines[box.index]!
  if (shown >= line.length && (reduced || Math.floor(now / 360) % 2 === 0)) {
    ctx.fillStyle = GOLD
    const ax = x + w - 18
    const ay = y + h - 14
    ctx.fillRect(ax, ay, 2, 2)
    ctx.fillRect(ax + 4, ay, 2, 2)
    ctx.fillRect(ax + 2, ay + 2, 2, 2)
  }
}

function syncMotion() {
  const attr = document.documentElement.dataset.reduceMotion === 'on'
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  reduced = attr || mq
  if (reduced && dialogue) {
    dialogue.shown = dialogue.lines[dialogue.index]!.length
  }
}

function clearHeld() {
  padHeld.length = 0
  keyHeld.length = 0
}
function clearPad() {
  padHeld.length = 0
}

let mo: MutationObserver | null = null
let mq: MediaQueryList | null = null
const onMq = () => syncMotion()

buildWorld()
openBox({
  name: 'Trikona',
  species: 'Agni',
  edges: 3,
  color: '#e23d3d',
  radius: 6.2,
  eyes: true,
  lines: [
    'Three edges. The agora likes six, or more.',
    'Five altars lend a side each. Then a circle.',
    'A talks. B closes. Pad, or arrow keys.',
  ],
})

onMounted(() => {
  theme.init()
  syncMotion()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', clearHeld)
  window.addEventListener('pointerup', clearPad)
  window.addEventListener('pointercancel', clearPad)
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', onMq)
  mo = new MutationObserver(syncMotion)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] })
  last = 0
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('blur', clearHeld)
  window.removeEventListener('pointerup', clearPad)
  window.removeEventListener('pointercancel', clearPad)
  mq?.removeEventListener('change', onMq)
  mo?.disconnect()
})

</script>

<template>
  <div ref="rootRef" class="ci" :data-ci-theme="theme.theme">
    <canvas ref="canvasRef" class="ci-canvas" width="320" height="480" aria-hidden="true" />
    <header ref="topRef" class="ci-top">
      <NuxtLink to="/engage" class="ci-iconbtn" aria-label="Back to Engage" @pointerdown.stop>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
      </NuxtLink>
      <button
        type="button"
        class="ci-iconbtn"
        :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
        @pointerdown.stop
        @click.stop.prevent="onTheme"
      >
        <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
      </button>
    </header>
    <div ref="dockRef" class="ci-dock">
      <div class="ci-pad" role="group" aria-label="Move">
        <button type="button" class="ci-key ci-up" aria-label="Walk up" @pointerdown="onDir($event, 'up', true)" @pointerup="onDir($event, 'up', false)" @pointercancel="onDir($event, 'up', false)"><i class="ci-chev ci-chev-up"></i></button>
        <button type="button" class="ci-key ci-left" aria-label="Walk left" @pointerdown="onDir($event, 'left', true)" @pointerup="onDir($event, 'left', false)" @pointercancel="onDir($event, 'left', false)"><i class="ci-chev ci-chev-left"></i></button>
        <button type="button" class="ci-key ci-right" aria-label="Walk right" @pointerdown="onDir($event, 'right', true)" @pointerup="onDir($event, 'right', false)" @pointercancel="onDir($event, 'right', false)"><i class="ci-chev ci-chev-right"></i></button>
        <button type="button" class="ci-key ci-down" aria-label="Walk down" @pointerdown="onDir($event, 'down', true)" @pointerup="onDir($event, 'down', false)" @pointercancel="onDir($event, 'down', false)"><i class="ci-chev ci-chev-down"></i></button>
      </div>
      <div class="ci-actions">
        <button type="button" class="ci-key ci-b" aria-label="Close dialogue" @pointerdown="onBPointer" @click="onBClick">B</button>
        <button type="button" class="ci-key ci-a" aria-label="Talk" @pointerdown="onAPointer" @click="onAClick">A</button>
      </div>
    </div>
    <p class="ci-live" aria-live="polite">{{ live }}</p>
  </div>
</template>

<style scoped>
.ci {
  --ci-paper: #fbf8ef;
  --ci-ink: #161618;
  --ci-yellow: #ffd43b;
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  background: #141820;
  color: var(--ci-ink);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}
.ci[data-ci-theme='dark'] {
  --ci-paper: #121214;
  --ci-ink: #ede6d6;
  --ci-yellow: #e8c547;
}
.ci-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
.ci-top {
  position: absolute;
  z-index: 20;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: max(10rem, env(safe-area-inset-top)) max(10rem, env(safe-area-inset-right)) 0 max(10rem, env(safe-area-inset-left));
  pointer-events: none;
}
.ci-iconbtn {
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 999rem;
  background: color-mix(in srgb, var(--ci-paper) 55%, transparent);
  color: color-mix(in srgb, var(--ci-ink) 70%, transparent);
  text-decoration: none;
  cursor: pointer;
  pointer-events: auto;
  appearance: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.ci-iconbtn:hover,
.ci-iconbtn:focus-visible {
  color: var(--ci-ink);
  background: color-mix(in srgb, var(--ci-paper) 82%, transparent);
}
.ci-iconbtn:focus-visible,
.ci-key:focus-visible {
  outline: 3rem solid var(--ci-yellow);
  outline-offset: 2rem;
}
.ci-iconbtn svg {
  width: 20rem;
  height: 20rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ci-iconbtn :deep(svg) {
  width: 18rem;
  height: 18rem;
}
.ci-dock {
  position: absolute;
  z-index: 6;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12rem;
  padding: 8rem max(10rem, env(safe-area-inset-right)) max(10rem, env(safe-area-inset-bottom)) max(10rem, env(safe-area-inset-left));
  pointer-events: none;
}
.ci-pad {
  display: grid;
  grid-template-columns: 44rem 44rem 44rem;
  grid-template-rows: 44rem 44rem 44rem;
  gap: 4rem;
}
.ci-up { grid-column: 2; grid-row: 1; }
.ci-left { grid-column: 1; grid-row: 2; }
.ci-right { grid-column: 3; grid-row: 2; }
.ci-down { grid-column: 2; grid-row: 3; }
.ci-actions {
  display: flex;
  align-items: flex-end;
  gap: 12rem;
  padding-bottom: 8rem;
}
.ci-key {
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 3rem solid #0e1218;
  border-radius: 4rem;
  background: #1e2836;
  color: #f4f0e6;
  box-shadow: inset -3rem -3rem 0 #0e1218, inset 3rem 3rem 0 #3d4d66;
  font: 700 16rem/1 ui-monospace, ui-monospace, monospace;
  pointer-events: auto;
  cursor: pointer;
  appearance: none;
  touch-action: none;
}
.ci-a { color: #f0c14a; }
.ci-chev {
  display: block;
  width: 0;
  height: 0;
  border-style: solid;
}
.ci-chev-up { border-width: 0 7rem 10rem 7rem; border-color: transparent transparent currentColor transparent; }
.ci-chev-down { border-width: 10rem 7rem 0 7rem; border-color: currentColor transparent transparent transparent; }
.ci-chev-left { border-width: 7rem 10rem 7rem 0; border-color: transparent currentColor transparent transparent; }
.ci-chev-right { border-width: 7rem 0 7rem 10rem; border-color: transparent transparent transparent currentColor; }
.ci-key:active { transform: translate(1rem, 1rem); }
.ci-live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
@media (prefers-reduced-motion: reduce) {
  .ci-key:active { transform: none; }
}
:global(html[data-reduce-motion='on']) .ci-key:active { transform: none; }
</style>
