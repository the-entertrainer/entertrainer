<script setup lang="ts">
import type { CoinState } from '~/composables/whatto/marketFeed'
import { useCanvas, C } from '~/composables/whatto/canvas'

const props = defineProps<{ state: CoinState; tick: number }>()
const { canvas, render } = useCanvas((ctx, w, h) => {
  const bars = props.state.bars.slice(-60)
  const pts = bars.map(b => b.c)
  if (Number.isFinite(props.state.lastPrice)) pts.push(props.state.lastPrice)
  if (pts.length < 2) return
  const lo = Math.min(...pts), hi = Math.max(...pts)
  const x = (i: number) => (i / (pts.length - 1)) * (w - 4) + 2
  const y = (p: number) => 3 + (1 - (p - lo) / (hi - lo || 1)) * (h - 6)
  const up = pts[pts.length - 1] >= pts[0]
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, up ? 'rgba(30,144,255,0.35)' : 'rgba(255,105,180,0.38)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(x(i), y(p)) : ctx.moveTo(x(i), y(p))))
  ctx.lineTo(x(pts.length - 1), h); ctx.lineTo(x(0), h); ctx.closePath(); ctx.fillStyle = grad; ctx.fill()
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(x(i), y(p)) : ctx.moveTo(x(i), y(p))))
  ctx.strokeStyle = up ? C.blue : C.pinkDeep; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke()
  ctx.fillStyle = up ? C.blue : C.pinkDeep
  ctx.beginPath(); ctx.arc(x(pts.length - 1), y(pts[pts.length - 1]), 3, 0, Math.PI * 2); ctx.fill()
})
watch(() => props.tick, render)
</script>

<template>
  <canvas ref="canvas" class="ws" aria-hidden="true" />
</template>

<style scoped>
.ws { display: block; width: 100%; height: 100%; }
</style>
