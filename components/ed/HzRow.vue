<script setup lang="ts">
/**
 * One opt-in sine per frequency. Nothing plays until a tap.
 * A second tap, or another frequency, stops the tone that is sounding.
 * prefers-reduced-motion does not block this: playback is a choice, not an animation.
 *
 * Each tone is a sample-exact sine at exactly the labelled hertz, with soft fades so
 * start, stop and switching never click. See utils/pureTone.ts.
 */
import { createPureTonePlayer, PURE_TONE_FADE, type PureTonePlayer } from '~/utils/pureTone'

const props = defineProps<{ hertz: number[] }>()

const active = ref<number | null>(null)
let player: PureTonePlayer | null = null

function ensurePlayer(): PureTonePlayer | null {
  if (player) return player
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  // iOS Safari 17+: let a tapped tone play even with the ringer switch on silent.
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession
    if (session) session.type = 'playback'
  } catch { /* not supported */ }
  player = createPureTonePlayer(new Ctor())
  return player
}

function toggle(hz: number) {
  if (!import.meta.client) return
  const p = ensurePlayer()
  if (!p) return
  // Resume inside the tap itself, so iOS Safari unlocks audio.
  const ctx = p.context as AudioContext
  if (ctx.state !== 'running') void ctx.resume().catch(() => {})
  if (active.value === hz) {
    p.stop()
    active.value = null
    return
  }
  p.play(hz)
  active.value = hz
}

onBeforeUnmount(() => {
  if (!player) return
  const ctx = player.context as AudioContext
  player.stop()
  player = null
  active.value = null
  // Let the fade-out finish, then free the audio device.
  setTimeout(() => { void ctx.close().catch(() => {}) }, (PURE_TONE_FADE + 0.1) * 1000)
})
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
