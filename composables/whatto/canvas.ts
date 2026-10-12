/** Shared HiDPI canvas sizing for Whatto charts. */
export function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = ref<HTMLCanvasElement | null>(null)
  let ro: ResizeObserver | null = null
  let w = 0, h = 0
  function render() {
    const c = canvas.value
    if (!c || !w || !h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
    }
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    draw(ctx, w, h)
  }
  onMounted(() => {
    const c = canvas.value
    if (!c) return
    ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      w = r.width; h = r.height
      render()
    })
    ro.observe(c)
  })
  onBeforeUnmount(() => ro?.disconnect())
  return { canvas, render }
}

export const C = {
  ink: '#1F1033',
  muted: '#5B4A6B',
  grid: 'rgba(31,16,51,0.08)',
  pink: '#FF69B4',
  pinkDeep: '#E0408F',
  pinkSoft: '#FFB6C1',
  blue: '#1E90FF',
  blueBright: '#00BFFF',
  font: '600 11px ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
}

export function niceStep(range: number, target: number): number {
  const raw = range / Math.max(1, target)
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
