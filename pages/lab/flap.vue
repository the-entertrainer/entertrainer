<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Split-flap Board — Lab', robots: 'noindex' })
const root = ref<HTMLElement | null>(null)
const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ&·0123456789'
let reduce = false
const timers: ReturnType<typeof setInterval>[] = []

function flipRow(row: HTMLElement) {
  if (reduce) return
  row.querySelectorAll<HTMLElement>('.flap__cell').forEach((cell, i) => {
    const final = cell.dataset.final || ''
    if (final === ' ') { cell.textContent = ' '; return }
    let ticks = 5 + i * 2 + Math.floor(Math.random() * 6), t = 0
    const iv = setInterval(() => {
      if (t >= ticks) { cell.textContent = final; clearInterval(iv); return }
      cell.textContent = CH[Math.floor(Math.random() * CH.length)]; t++
    }, 45)
    timers.push(iv)
  })
}
onMounted(() => {
  reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const rows = Array.from(root.value?.querySelectorAll<HTMLElement>('.flap__row') ?? [])
  rows.forEach((r, i) => setTimeout(() => flipRow(r), 250 + i * 260))
})
onBeforeUnmount(() => timers.forEach(clearInterval))
const chars = (s: string) => s.toUpperCase().split('')
</script>

<template>
  <LabFrame n="08" name="Split-flap Board" hint="hover a row">
    <div ref="root" class="fl">
      <div class="fl__head"><span class="fl__eyebrow">Entertrainer</span><span class="fl__eyebrow">Departures</span></div>
      <ul class="fl__board">
        <li v-for="item in LAB_NAV" :key="item.href">
          <NuxtLink :to="item.href" class="fl__row" :aria-label="item.label" @pointerenter="flipRow($event.currentTarget as HTMLElement)">
            <span class="fl__cells">
              <span v-for="(ch, ci) in chars(item.label)" :key="ci" class="fl__cell" :data-final="ch === ' ' ? ' ' : ch">{{ ch }}</span>
            </span>
            <span class="fl__gate">{{ item.n }} →</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </LabFrame>
</template>

<style scoped>
.fl { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 clamp(20rem, 5vw, 70rem); }
.fl__head { display: flex; justify-content: space-between; padding-bottom: 20rem; margin-bottom: 8rem; border-bottom: 1px solid var(--color-glass-border); }
.fl__eyebrow { font-size: 12rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; opacity: 0.5; }
.fl__board { list-style: none; margin: 0; padding: 0; }
.fl__row { display: flex; align-items: center; justify-content: space-between; gap: 20rem; padding: clamp(8rem, 1.6vh, 18rem) 0; text-decoration: none; color: var(--color-text); border-bottom: 1px solid var(--color-glass-border); }
.fl__row:focus-visible { outline: 2px solid var(--color-text); outline-offset: 4px; }
.fl__cells { display: inline-flex; gap: 3rem; }
.fl__cell { display: inline-grid; place-items: center; min-width: clamp(24rem, 4vw, 52rem); height: clamp(38rem, 6vw, 78rem); font-family: 'DM Sans', sans-serif; font-weight: 800; font-size: clamp(24rem, 4vw, 54rem); text-transform: uppercase; background: color-mix(in srgb, var(--color-text) 8%, transparent); border-radius: 5rem; box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--color-text) 18%, transparent); font-variant-numeric: tabular-nums; }
.fl__gate { font-family: var(--serif); font-size: clamp(18rem, 2.4vw, 30rem); opacity: 0.55; white-space: nowrap; }
@media (hover: hover) { .fl__row:hover .fl__gate { opacity: 1; } }
</style>
