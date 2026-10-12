<script setup lang="ts">
import type { CoinState } from '~/composables/whatto/marketFeed'
import { useCanvas, C } from '~/composables/whatto/canvas'

/** Signed aggressor volume (quote) in 10-second buckets over the last 5 minutes. */
const props = defineProps<{ state: CoinState; tick: number; now: number }>()
const BUCKET = 10_000
const N = 30

const { canvas, render } = useCanvas((ctx, w, h) => {
  const trades = props.state.trades
  const end = Math.floor(Date.now() / BUCKET) * BUCKET + BUCKET
  const start = end - N * BUCKET
  const buys = new Array(N).fill(0), sells = new Array(N).fill(0)
  for (let i = trades.length - 1; i >= 0; i--) {
    const t = trades[i]
    if (t.t < start) break
    const k = Math.floor((t.t - start) / BUCKET)
    if (k < 0 || k >= N) continue
    if (t.buy) buys[k] += t.p * t.q; else sells[k] += t.p * t.q
  }
  const max = Math.max(1, ...buys, ...sells)
  const mid = h / 2
  const bw = w / N
  ctx.font = C.font
  if (!trades.length) {
    ctx.fillStyle = C.muted; ctx.textAlign = 'center'
    ctx.fillText('Waiting for live trades…', w / 2, mid)
    return
  }
  ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke()
  for (let k = 0; k < N; k++) {
    const bh = (buys[k] / max) * (mid - 12), sh = (sells[k] / max) * (mid - 12)
    ctx.fillStyle = C.blue; ctx.fillRect(k * bw + 1.5, mid - bh, bw - 3, bh)
    ctx.fillStyle = C.pink; ctx.fillRect(k * bw + 1.5, mid, bw - 3, sh)
  }
  ctx.fillStyle = C.muted; ctx.textAlign = 'left'
  ctx.fillText('buyers', 2, 11); ctx.fillText('sellers', 2, h - 3)
  ctx.textAlign = 'right'; ctx.fillText('now', w - 2, 11)
})
watch(() => props.tick, render)
</script>

<template>
  <canvas ref="canvas" class="wf" role="img" :aria-label="`${state.coin} aggressive buy and sell volume, last 5 minutes`" />
</template>

<style scoped>
.wf { display: block; width: 100%; height: 100%; }
</style>
