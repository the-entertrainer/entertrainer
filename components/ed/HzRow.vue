<script setup lang="ts">
/**
 * One opt-in sine per frequency. Nothing plays until a tap.
 * A second tap, or another frequency, stops the tone that is sounding.
 * prefers-reduced-motion does not block this: playback is a choice, not an animation.
 */
const props = defineProps<{ hertz: number[] }>()

const active = ref<number | null>(null)
let ctx: AudioContext | null = null
let osc: OscillatorNode | null = null
let gain: GainNode | null = null

function silence() {
  try { osc?.stop() } catch { /* already stopped */ }
  osc?.disconnect()
  gain?.disconnect()
  osc = null
  gain = null
  active.value = null
}

function toggle(hz: number) {
  if (!import.meta.client) return
  if (active.value === hz) {
    silence()
    return
  }
  silence()
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return
  if (!ctx) ctx = new Ctor()
  const now = ctx.currentTime
  const next = ctx.createOscillator()
  const amp = ctx.createGain()
  next.type = 'sine'
  next.frequency.setValueAtTime(hz, now)
  amp.gain.setValueAtTime(0.0001, now)
  next.connect(amp)
  amp.connect(ctx.destination)
  next.start()
  amp.gain.exponentialRampToValueAtTime(0.07, now + 0.04)
  osc = next
  gain = amp
  active.value = hz
  void ctx.resume()
}

onBeforeUnmount(silence)
</script>

<template>
  <div class="hz">
    <ul class="hz__row">
      <li v-for="hz in props.hertz" :key="hz">
        <button
          type="button"
          class="hz__btn"
          :aria-pressed="active === hz"
          :aria-label="active === hz ? `Stop ${hz} hertz` : `Play ${hz} hertz`"
          @click="toggle(hz)"
        >
          <span aria-hidden="true">{{ active === hz ? 'Stop' : 'Play' }}</span>
          {{ hz }} Hz
        </button>
      </li>
    </ul>
    <p class="hz__hint">Sine wave. One at a time. Tap again to stop.</p>
  </div>
</template>

<style scoped>
.hz { margin: 0 0 var(--space-21); }
.hz__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.hz__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6rem;
  min-width: 44rem;
  min-height: 44rem;
  padding: 0 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: 0;
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
  white-space: nowrap;
  font: 500 var(--type-meta)/1 var(--font-mono);
  letter-spacing: .06em;
}
.hz__btn[aria-pressed="true"] {
  background: var(--accent);
  color: var(--accent-ink);
}
.hz__hint {
  margin: 8rem 0 0;
  color: var(--ink-soft);
  font: 500 var(--type-meta)/1.3 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
}
</style>
