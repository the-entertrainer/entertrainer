<script setup lang="ts">
/**
 * The Entertrainer cursor: an ink dot and a trailing sun.
 * Fine pointers only, never when motion is off. Links grow the sun; any
 * element with data-cursor="Label" shows that word inside it.
 */
const el = ref<HTMLElement | null>(null)
const label = ref('')
let raf = 0
let x = -100, y = -100, rx = -100, ry = -100
let on = false

function move(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  x = e.clientX; y = e.clientY
  if (!on) { on = true; rx = x; ry = y; document.documentElement.classList.add('br-has-cursor') }
  const t = (e.target as Element | null)?.closest?.('[data-cursor], a, button, [role="button"], input, textarea, select, label')
  const c = el.value
  if (!c) return
  const word = t?.getAttribute('data-cursor') || ''
  label.value = word
  c.classList.toggle('is-label', !!word)
  c.classList.toggle('is-link', !word && !!t && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
}
function down() { el.value?.classList.add('is-down') }
function up() { el.value?.classList.remove('is-down') }
function leave() { on = false; document.documentElement.classList.remove('br-has-cursor') }
function tick() {
  rx += (x - rx) * 0.18
  ry += (y - ry) * 0.18
  const c = el.value
  if (c) {
    (c.children[0] as HTMLElement).style.transform = `translate3d(${x}px, ${y}px, 0)`
    ;(c.children[1] as HTMLElement).style.transform = `translate3d(${rx}px, ${ry}px, 0)`
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (motionLevel() === 'off') return
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', down, { passive: true })
  window.addEventListener('pointerup', up, { passive: true })
  document.documentElement.addEventListener('mouseleave', leave)
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', move)
  window.removeEventListener('pointerdown', down)
  window.removeEventListener('pointerup', up)
  document.documentElement.removeEventListener('mouseleave', leave)
  document.documentElement.classList.remove('br-has-cursor')
})
</script>

<template>
  <div ref="el" class="br-cursor" aria-hidden="true">
    <span class="br-cursor__dot" />
    <span class="br-cursor__ring"><span class="br-cursor__label">{{ label }}</span></span>
  </div>
</template>
