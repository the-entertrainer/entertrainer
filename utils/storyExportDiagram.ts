import { saveAs } from 'file-saver'
import type { Connection, StoryCard } from '~/types/story'
import { bezierControls } from './storyBezier'
import { CARD_KINDS, cardPreview } from './storyCards'
import { stageOf } from './idModels'
import { cardNumbers } from './storyGraph'
import { NODE_H, NODE_W } from './storyLayout'

const PAD = 110
const SCALE = 2
const FONT = '"DM Sans", "Helvetica Neue", Arial, sans-serif'

interface Theme {
  bg: string
  dot: string
  card: string
  cardBorder: string
  text: string
  muted: string
  line: string
}

const THEMES: Record<'dark' | 'light', Theme> = {
  dark: {
    bg: '#0D0C0A', dot: 'rgba(255,255,255,0.07)', card: '#1C1A17', cardBorder: 'rgba(255,255,255,0.16)',
    text: '#F4F1EC', muted: 'rgba(244,241,236,0.55)', line: 'rgba(244,241,236,0.42)'
  },
  light: {
    bg: '#F5EFE8', dot: 'rgba(0,0,0,0.08)', card: '#FFFDF9', cardBorder: 'rgba(0,0,0,0.14)',
    text: '#0D0C0A', muted: 'rgba(13,12,10,0.55)', line: 'rgba(13,12,10,0.38)'
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.replace(/\n/g, ' · ').split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word
    if (ctx.measureText(attempt).width <= maxWidth) {
      current = attempt
    } else {
      if (current) lines.push(current)
      current = word
      if (lines.length === maxLines) break
    }
  }
  if (current && lines.length < maxLines) lines.push(current)
  if (lines.length === maxLines && words.length) {
    const last = lines[maxLines - 1]
    lines[maxLines - 1] = last.length > 3 ? `${last.slice(0, -1)}…` : last
  }
  return lines
}

export function exportDiagramPng(
  input: { title: string; cards: StoryCard[]; connections: Connection[]; modelId?: string; modelLabel?: string },
  filename: string
) {
  const { cards, connections } = input
  if (!cards.length) return

  const theme = THEMES[(document.documentElement.dataset.theme as 'dark' | 'light') || 'dark']
  const numbers = cardNumbers(cards, connections)
  const byId = new Map(cards.map(c => [c.id, c]))

  const minX = Math.min(...cards.map(c => c.x)) - PAD
  const minY = Math.min(...cards.map(c => c.y)) - PAD - 40 // headline room
  const maxX = Math.max(...cards.map(c => c.x + NODE_W)) + PAD
  const maxY = Math.max(...cards.map(c => c.y + NODE_H)) + PAD

  const canvas = document.createElement('canvas')
  canvas.width = (maxX - minX) * SCALE
  canvas.height = (maxY - minY) * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(SCALE, SCALE)
  ctx.translate(-minX, -minY)

  // Backdrop + dot grid
  ctx.fillStyle = theme.bg
  ctx.fillRect(minX, minY, maxX - minX, maxY - minY)
  ctx.fillStyle = theme.dot
  for (let gx = Math.floor(minX / 28) * 28; gx < maxX; gx += 28) {
    for (let gy = Math.floor(minY / 28) * 28; gy < maxY; gy += 28) {
      ctx.beginPath()
      ctx.arc(gx, gy, 1.3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Headline
  ctx.fillStyle = theme.text
  ctx.font = `700 22px ${FONT}`
  ctx.fillText(input.title || 'Untitled Storyboard', minX + 36, minY + 44)
  ctx.fillStyle = theme.muted
  ctx.font = `500 12px ${FONT}`
  const metaBits = [`${cards.length} screens`, input.modelLabel, new Date().toLocaleDateString()].filter(Boolean)
  ctx.fillText(metaBits.join(' · '), minX + 36, minY + 66)

  // Connections — same cubic bezier the live canvas draws
  ctx.strokeStyle = theme.line
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  for (const conn of connections) {
    const from = byId.get(conn.from)
    const to = byId.get(conn.to)
    if (!from || !to) continue
    const p1 = { x: from.x + NODE_W, y: from.y + NODE_H / 2 }
    const p2 = { x: to.x, y: to.y + NODE_H / 2 }
    const { c1, c2 } = bezierControls(p1, p2)
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y)
    ctx.stroke()
  }

  // Cards
  for (const card of cards) {
    const meta = CARD_KINDS[card.kind]
    const { x, y } = card

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetY = 10
    roundRect(ctx, x, y, NODE_W, NODE_H, 18)
    ctx.fillStyle = theme.card
    ctx.fill()
    ctx.restore()

    roundRect(ctx, x, y, NODE_W, NODE_H, 18)
    ctx.strokeStyle = theme.cardBorder
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Kind accent stripe along the left edge
    ctx.save()
    roundRect(ctx, x, y, NODE_W, NODE_H, 18)
    ctx.clip()
    ctx.fillStyle = meta.color
    ctx.fillRect(x, y, 5, NODE_H)
    ctx.restore()

    // Header: kind label + screen number
    ctx.fillStyle = meta.color
    ctx.font = `700 10px ${FONT}`
    ctx.fillText(meta.label.toUpperCase(), x + 20, y + 26)
    const num = `№ ${String(numbers.get(card.id) ?? 0).padStart(2, '0')}`
    ctx.fillStyle = theme.muted
    ctx.font = `600 10px ${FONT}`
    ctx.fillText(num, x + NODE_W - 20 - ctx.measureText(num).width, y + 26)

    // Title
    ctx.fillStyle = theme.text
    ctx.font = `700 16px ${FONT}`
    for (const [i, line] of wrapLines(ctx, card.title || 'Untitled', NODE_W - 40, 2).entries()) {
      ctx.fillText(line, x + 20, y + 52 + i * 20)
    }

    // Preview
    ctx.fillStyle = theme.muted
    ctx.font = `400 11.5px ${FONT}`
    for (const [i, line] of wrapLines(ctx, cardPreview(card), NODE_W - 40, 3).entries()) {
      ctx.fillText(line, x + 20, y + 98 + i * 16)
    }

    // Footer: stage chip (if the project follows a model) + duration
    const stage = stageOf(input.modelId, card.stage)
    if (stage) {
      ctx.fillStyle = stage.color
      ctx.font = `700 10px ${FONT}`
      ctx.fillText(stage.short.toUpperCase(), x + 20, y + NODE_H - 14)
      ctx.fillStyle = theme.muted
      ctx.font = `600 10px ${FONT}`
      const t = `${card.duration || 0}s`
      ctx.fillText(t, x + NODE_W - 20 - ctx.measureText(t).width, y + NODE_H - 14)
    } else {
      ctx.fillStyle = theme.muted
      ctx.font = `600 10px ${FONT}`
      ctx.fillText(`${card.duration || 0}s`, x + 20, y + NODE_H - 14)
    }

    // Ports
    for (const px of [x, x + NODE_W]) {
      ctx.beginPath()
      ctx.arc(px, y + NODE_H / 2, 6, 0, Math.PI * 2)
      ctx.fillStyle = theme.bg
      ctx.fill()
      ctx.strokeStyle = theme.text
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  canvas.toBlob((blob) => {
    if (blob) saveAs(blob, filename)
  }, 'image/png')
}
