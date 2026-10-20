<script setup lang="ts">
/**
 * Whatto signature: the price "breathes". Only the digits that actually changed
 * roll in, upward on an uptick and downward on a downtick, tinted for a beat.
 * Unchanged characters never move, so the eye lands on exactly what moved.
 */
const props = defineProps<{ text: string; value: number | null | undefined }>()

const dir = ref<'up' | 'down' | ''>('')
const armed = ref(false)
let last: number | null = null

watch(() => props.value, (v) => {
  if (v == null || !Number.isFinite(v)) return
  if (last != null && v !== last) dir.value = v > last ? 'up' : 'down'
  last = v
}, { immediate: true })

onMounted(() => { requestAnimationFrame(() => { armed.value = true }) })

// A character keeps the direction it was born with, so a later tick the other
// way never restarts the animation on digits that did not change.
const born = new Map<string, string>()
const chars = computed(() => {
  const d = armed.value ? dir.value : ''
  const out = Array.from(props.text ?? '').map((ch, i) => {
    const key = `${i}:${ch}`
    if (!born.has(key)) born.set(key, d)
    return { key, ch, cls: born.get(key) ? `tk__c--${born.get(key)}` : '' }
  })
  const live = new Set(out.map((c) => c.key))
  for (const k of born.keys()) if (!live.has(k)) born.delete(k)
  return out
})
</script>

<template>
  <span class="tk" :aria-label="text">
    <span v-for="c in chars" :key="c.key" class="tk__c" :class="c.cls" aria-hidden="true">{{ c.ch }}</span>
  </span>
</template>

<style scoped>
.tk { display: inline-flex; overflow: hidden; vertical-align: bottom; font-variant-numeric: tabular-nums; }
.tk__c { display: inline-block; white-space: pre; }
.tk__c--up { animation: tk-up 420ms cubic-bezier(0.22, 1, 0.36, 1); }
.tk__c--down { animation: tk-down 420ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes tk-up {
  0% { transform: translateY(70%); opacity: 0; color: var(--wt-blue, #00BFFF); }
  60% { color: var(--wt-blue, #00BFFF); }
  100% { transform: none; opacity: 1; }
}
@keyframes tk-down {
  0% { transform: translateY(-70%); opacity: 0; color: var(--wt-pink, #FF69B4); }
  60% { color: var(--wt-pink, #FF69B4); }
  100% { transform: none; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .tk--up .tk__c, .tk__c--down { animation: none; }
}
</style>
