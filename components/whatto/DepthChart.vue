<script setup lang="ts">
import type { CoinState } from '~/composables/whatto/marketFeed'
import { fmtPrice } from '~/utils/whatto/coins'
import { useCanvas, C } from '~/composables/whatto/canvas'

const props = defineProps<{ state: CoinState; tick: number }>()

const { canvas, render } = useCanvas((ctx, w, h) => {
  const { bids, asks, coin } = props.state
  ctx.font = C.font
  if (!bids.length || !asks.length) {
    ctx.fillStyle = C.muted; ctx.textAlign = 'center'
    ctx.fillText('Order book not available on this feed.', w / 2, h / 2)
    return
  }
  const padB = 20, padT = 8
  const ch = h - padB - padT
  // cumulative quote depth, top 20 levels each side
  const cum = (lv: { p: number; q: number }[]) => { let s = 0; return lv.map(l => ({ p: l.p, s: (s += l.p * l.q) })) }
  const cb = cum(bids), ca = cum(asks)
  const maxS = Math.max(cb[cb.length - 1].s, ca[ca.length - 1].s)
  const lo = cb[cb.length - 1].p, hi = ca[ca.length - 1].p
  const x = (p: number) => ((p - lo) / (hi - lo || 1)) * w
  const y = (s: number) => padT + ch - (s / maxS) * ch
  const area = (pts: { p: number; s: number }[], color: string, fill: string) => {
    ctx.beginPath()
    ctx.moveTo(x(pts[0].p), padT + ch)
    for (const pt of pts) { ctx.lineTo(x(pt.p), y(pt.s)) }
    ctx.lineTo(x(pts[pts.length - 1].p), padT + ch)
    ctx.closePath()
    ctx.fillStyle = fill; ctx.fill()
    ctx.strokeStyle = color; ctx.lineWidth = 2
    ctx.beginPath(); pts.forEach((pt, i) => (i ? ctx.lineTo(x(pt.p), y(pt.s)) : ctx.moveTo(x(pt.p), y(pt.s)))); ctx.stroke()
  }
  area(cb, C.blue, 'rgba(30,144,255,0.22)')
  area(ca, C.pinkDeep, 'rgba(255,105,180,0.25)')
  const mid = (bids[0].p + asks[0].p) / 2
  ctx.strokeStyle = C.ink; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x(mid), padT); ctx.lineTo(x(mid), padT + ch); ctx.stroke(); ctx.setLineDash([])
  ctx.fillStyle = C.muted; ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'; ctx.fillText(fmtPrice(coin, lo), 2, h - 5)
  ctx.textAlign = 'right'; ctx.fillText(fmtPrice(coin, hi), w - 2, h - 5)
  ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.fillText(fmtPrice(coin, mid), x(mid), h - 5)
})
watch(() => props.tick, render)
</script>

<template>
  <canvas ref="canvas" class="wd" role="img" :aria-label="`${state.coin} order book depth, top 20 levels per side`" />
</template>

<style scoped>
.wd { display: block; width: 100%; height: 100%; }
</style>
