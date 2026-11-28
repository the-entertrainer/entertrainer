<script setup lang="ts">
/**
 * The hidden construction grid: the Flower of Life in hairline ink.
 * Same compass order as the preloader and the wordmark (utils/sacredGeometry):
 * the still point, the six seed circles, then the twelve that complete the
 * flower, then the enclosing circle. Pages draw it in with DrawSVG at their
 * signature moment; without JS it is simply there, faint.
 */
import { seedOfLife, fruitOfLife } from '~/utils/sacredGeometry'

const props = withDefaults(defineProps<{ rings?: 7 | 19; outline?: boolean }>(), { rings: 19, outline: true })

const R = 50
const C = 200
const circles = computed(() => {
  if (props.rings === 7) return seedOfLife(C, C, R)
  const fruit = fruitOfLife(C, C, R)
  const between = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + Math.PI / 6 + (Math.PI / 3) * i
    return { cx: C + Math.sqrt(3) * R * Math.cos(a), cy: C + Math.sqrt(3) * R * Math.sin(a), r: R }
  })
  return [...fruit, ...between]
})
const fmt = (n: number) => Math.round(n * 100) / 100
</script>

<template>
  <svg class="fg" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
    <circle v-if="outline" class="fg__ring fg__ring--outer" :cx="C" :cy="C" :r="R * 3" />
    <circle
      v-for="(c, i) in circles"
      :key="i"
      class="fg__ring"
      :class="{ 'fg__ring--still': i === 0, 'fg__ring--seed': i > 0 && i < 7 }"
      :cx="fmt(c.cx)"
      :cy="fmt(c.cy)"
      :r="c.r"
    />
    <circle class="fg__point" :cx="C" :cy="C" r="2.5" />
  </svg>
</template>

<style scoped>
.fg { display: block; width: 100%; height: auto; overflow: visible; }
.fg__ring { fill: none; stroke: currentColor; stroke-width: .7; opacity: .5; }
.fg__ring--seed { opacity: .8; }
.fg__ring--still { opacity: 1; stroke-width: 1.1; }
.fg__ring--outer { opacity: .9; stroke-width: 1; }
.fg__point { fill: currentColor; }
</style>
