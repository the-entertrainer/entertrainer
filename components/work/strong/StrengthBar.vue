<script setup lang="ts">
import { TIERS, tierFor } from '~/utils/strong/crypto'

const props = withDefaults(defineProps<{
  bits: number
  naive?: number | null
  compact?: boolean
}>(), { naive: null, compact: false })

const SCALE = 96 // bits mapped across the full bar
const pct = computed(() => Math.max(0, Math.min(100, (props.bits / SCALE) * 100)))
const naivePct = computed(() => props.naive == null ? null : Math.max(0, Math.min(100, (props.naive / SCALE) * 100)))
const info = computed(() => tierFor(props.bits))
const tierColor = computed(() => `var(--st-t${info.value.index})`)
// Tier boundary ticks (skip the 0 boundary).
const ticks = computed(() => TIERS.slice(1).map(t => ({ label: t.label, left: (t.min / SCALE) * 100 })))
const showGhost = computed(() => naivePct.value != null && props.naive! - props.bits > 3)
</script>

<template>
  <div class="st-bar" :class="{ 'st-bar--compact': compact }">
    <div class="st-bar__top">
      <span class="st-bar__tier" :style="{ color: tierColor }">{{ info.tier.label }}</span>
      <span class="st-bar__bits st-num">{{ Math.round(bits) }}<small>bits</small></span>
    </div>
    <div class="st-bar__track" role="img" :aria-label="`${Math.round(bits)} bits of entropy, rated ${info.tier.label}`">
      <div class="st-bar__zones" />
      <div class="st-bar__fill" :style="{ width: pct + '%', background: tierColor }" />
      <div v-if="showGhost" class="st-bar__ghost" :style="{ left: naivePct + '%' }" :title="`Naive estimate: ${Math.round(naive!)} bits`" />
      <div class="st-bar__marker" :style="{ left: pct + '%', background: tierColor }" />
      <i v-for="(t, i) in ticks" :key="i" class="st-bar__tick" :style="{ left: t.left + '%' }" />
    </div>
    <p v-if="showGhost && !compact" class="st-bar__ghost-note">
      The faint mark is the naive estimate ({{ Math.round(naive!) }} bits). The solid bar is what it is really worth once a cracker uses wordlists.
    </p>
  </div>
</template>

<style scoped>
.st-bar__top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 0.5625rem; }
.st-bar__tier { font-family: var(--st-display); font-weight: 600; font-size: 0.9375rem; }
.st-bar__bits { font-size: 1.25rem; font-weight: 600; color: var(--st-text); }
.st-bar__bits small { font-size: 0.75rem; color: var(--st-muted); margin-left: 0.25rem; }
.st-bar__track {
  position: relative; height: 0.75rem; border-radius: 62.4375rem; overflow: hidden;
  background: var(--st-slot);
}
.st-bar__zones {
  position: absolute; inset: 0; opacity: 0.16;
  background: linear-gradient(90deg, var(--st-t0), var(--st-t1) 29%, var(--st-t2) 42%, var(--st-t3) 62%, var(--st-t4) 83%);
}
.st-bar__fill { position: absolute; top: 0; left: 0; height: 100%; border-radius: 62.4375rem; transition: width 0.28s ease, background 0.28s ease; }
.st-bar__marker { position: absolute; top: -0.1875rem; width: 0.1875rem; height: 1.125rem; border-radius: 0.125rem; transform: translateX(-50%); transition: left 0.28s ease, background 0.28s ease; box-shadow: 0 0 0.625rem currentColor; }
.st-bar__ghost { position: absolute; top: -0.1875rem; width: 0.125rem; height: 1.125rem; border-radius: 0.125rem; transform: translateX(-50%); background: var(--st-muted); opacity: 0.6; }
.st-bar__tick { position: absolute; top: 50%; width: 1px; height: 0.75rem; transform: translate(-50%, -50%); background: rgba(220, 232, 240, 0.22); }
.st-bar__ghost-note { margin-top: 0.625rem; font-size: 0.78125rem; line-height: 1.5; color: var(--st-muted); }
@media (prefers-reduced-motion: reduce) { .st-bar__fill, .st-bar__marker { transition: none; } }
.st-bar--compact .st-bar__bits { font-size: 1.0625rem; }
</style>
