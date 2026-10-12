<script setup lang="ts">
import type { CoinState } from '~/composables/whatto/marketFeed'
import type { HistoryEntry } from '~/composables/whatto/useWhatto'
import { fmtPrice } from '~/utils/whatto/coins'
import { useCanvas, C, niceStep, roundRect } from '~/composables/whatto/canvas'

const props = withDefaults(defineProps<{ state: CoinState; tick: number; history?: HistoryEntry[]; bars?: number; showLevels?: boolean }>(), { bars: 90, history: () => [], showLevels: true })

const { canvas, render } = useCanvas((ctx, w, h) => {
  const st = props.state
  const closed = st.bars.slice(-props.bars + (st.forming ? 1 : 0))
  const all = st.forming ? [...closed, st.forming] : closed
  if (all.length < 2) {
    ctx.fillStyle = C.muted; ctx.font = C.font; ctx.textAlign = 'center'
    ctx.fillText(st.error ?? 'Loading real 1-minute candles…', w / 2, h / 2)
    return
  }
  const padR = 64, padB = 22, padT = 10, padL = 6
  const cw = w - padR - padL, ch = h - padB - padT
  const r = st.reading
  let lo = Infinity, hi = -Infinity
  for (const b of all) { lo = Math.min(lo, b.l); hi = Math.max(hi, b.h) }
  if (props.showLevels && r?.setup) { lo = Math.min(lo, r.stopPrice); hi = Math.max(hi, r.targetPrice) }
  const live = Number.isFinite(st.lastPrice) ? st.lastPrice : all[all.length - 1].c
  lo = Math.min(lo, live); hi = Math.max(hi, live)
  const pad = (hi - lo) * 0.08 || hi * 0.001
  lo -= pad; hi += pad
  const y = (p: number) => padT + (1 - (p - lo) / (hi - lo)) * ch
  const slot = cw / props.bars
  const x0 = padL + cw - all.length * slot
  const xAt = (i: number) => x0 + i * slot + slot / 2

  // grid + price axis
  ctx.font = C.font
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const step = niceStep(hi - lo, 5)
  for (let p = Math.ceil(lo / step) * step; p <= hi; p += step) {
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(padL, y(p)); ctx.lineTo(padL + cw, y(p)); ctx.stroke()
    ctx.fillStyle = C.muted
    ctx.fillText(fmtPrice(st.coin, p), padL + cw + 6, y(p))
  }
  // time axis: label every 15 minutes, local time
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  let lastLabelX = -Infinity
  all.forEach((b, i) => {
    const d = new Date(b.t)
    if (d.getMinutes() % 15 !== 0) return
    if (xAt(i) - lastLabelX < 46 || xAt(i) < padL + 18) return
    lastLabelX = xAt(i)
    ctx.strokeStyle = C.grid
    ctx.beginPath(); ctx.moveTo(xAt(i), padT); ctx.lineTo(xAt(i), padT + ch); ctx.stroke()
    ctx.fillStyle = C.muted
    ctx.fillText(d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }), xAt(i), h - 6)
  })

  // target / stop levels when the coin is in a falling setup
  if (props.showLevels && r?.setup) {
    const lvl = (p: number, color: string, label: string) => {
      ctx.setLineDash([5, 4]); ctx.strokeStyle = color; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(padL, y(p)); ctx.lineTo(padL + cw, y(p)); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'
      ctx.fillText(label, padL + 4, y(p) - 2)
    }
    lvl(r.targetPrice, C.blue, `rebound target ${fmtPrice(st.coin, r.targetPrice)}`)
    lvl(r.stopPrice, C.pinkDeep, `stop ${fmtPrice(st.coin, r.stopPrice)}`)
  }

  // candles: up = electric blue, down = hot pink
  const bw = Math.max(1.5, slot * 0.66)
  all.forEach((b, i) => {
    const up = b.c >= b.o
    const color = up ? C.blue : C.pink
    ctx.strokeStyle = color; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(xAt(i), y(b.h)); ctx.lineTo(xAt(i), y(b.l)); ctx.stroke()
    const top = y(Math.max(b.o, b.c)), bot = y(Math.min(b.o, b.c))
    ctx.fillStyle = color
    ctx.globalAlpha = st.forming && i === all.length - 1 ? 0.55 : 1
    roundRect(ctx, xAt(i) - bw / 2, top, bw, Math.max(1, bot - top), Math.min(2, bw / 3))
    ctx.fill()
    ctx.globalAlpha = 1
  })

  // signal markers from this device's history
  for (const hEntry of props.history) {
    if (hEntry.coin !== st.coin) continue
    const idx = all.findIndex(b => b.t === hEntry.t - 60_000)
    if (idx < 0) continue
    const px = xAt(idx), py = y(all[idx].l) + 12
    ctx.fillStyle = C.blueBright; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(px, py - 7); ctx.lineTo(px - 6, py + 4); ctx.lineTo(px + 6, py + 4); ctx.closePath(); ctx.fill(); ctx.stroke()
  }

  // live price line + tag
  const ly = y(live)
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([2, 3])
  ctx.beginPath(); ctx.moveTo(padL, ly); ctx.lineTo(padL + cw, ly); ctx.stroke(); ctx.setLineDash([])
  ctx.fillStyle = C.ink
  roundRect(ctx, padL + cw + 2, ly - 9, padR - 4, 18, 9); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(fmtPrice(st.coin, live), padL + cw + padR / 2, ly)
})

watch(() => props.tick, render)
</script>

<template>
  <canvas ref="canvas" class="wc" role="img" :aria-label="`${state.coin}/USDT one-minute candles, last price ${fmtPrice(state.coin, state.lastPrice)}`" />
</template>

<style scoped>
.wc { display: block; width: 100%; height: 100%; }
</style>
