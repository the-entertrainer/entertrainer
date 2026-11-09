<script setup lang="ts">
import { ATTACKERS, crackLog10Seconds, formatCrack } from '~/utils/strong/crypto'

const props = withDefaults(defineProps<{ bits: number; compact?: boolean }>(), { compact: false })

const rows = computed(() => ATTACKERS.map(a => ({
  id: a.id, label: a.label, note: a.note, hue: a.hue,
  text: formatCrack(crackLog10Seconds(props.bits, a.rate))
})))
</script>

<template>
  <div class="st-crack" :class="{ 'st-crack--compact': compact }">
    <p v-if="!compact" class="st-crack__head">Average time to crack, by who has your password</p>
    <div class="st-crack__rows">
      <div v-for="r in rows" :key="r.id" class="st-crack__row">
        <span class="st-crack__dot" :style="{ background: r.hue }" aria-hidden="true" />
        <span class="st-crack__label">
          {{ r.label }}
          <small v-if="!compact">{{ r.note }}</small>
        </span>
        <span class="st-crack__time st-num" :style="{ color: r.hue }">{{ r.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.st-crack__head { font-family: var(--st-mono); font-size: 0.75rem; color: var(--st-muted); margin-bottom: 0.75rem; }
.st-crack__rows { display: flex; flex-direction: column; gap: 0.125rem; }
.st-crack__row {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.75rem;
  padding: 0.75rem 0; border-top: 1px solid var(--st-line);
}
.st-crack__row:first-child { border-top: none; }
.st-crack__dot { width: 0.5625rem; height: 0.5625rem; border-radius: 50%; flex-shrink: 0; }
.st-crack__label { font-size: 0.90625rem; font-weight: 500; color: var(--st-text); display: flex; flex-direction: column; gap: 0.125rem; }
.st-crack__label small { font-size: 0.75rem; font-weight: 400; color: var(--st-muted); line-height: 1.4; }
.st-crack__time { font-size: 0.9375rem; font-weight: 600; text-align: right; }
.st-crack--compact .st-crack__row { padding: 0.4375rem 0; }
.st-crack--compact .st-crack__time { font-size: 0.84375rem; }
</style>
