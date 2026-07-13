<script setup lang="ts">
import { vibrate } from '~/utils/doombox/haptics'

// The DOOMBOX handheld — a photorealistic console skin wrapping the game.
// The <slot> is the LCD screen (title / game / game-over render inside it).
// The control deck below drives the game: it emits semantic press/release
// events, and the page maps them to movement, turning, and firing.
//
// Haptics: every button carries a native <input type="checkbox" switch> that
// fills the button and sits transparent on top, so the finger's real tap
// fires iOS's Taptic Engine (the one web route Safari allows, and the only
// one that survives Apple's iOS 26.5 patch of the scripted version). Android
// gets navigator.vibrate() on the same press. We never call preventDefault on
// the buttons — that would cancel the native toggle and kill the iOS haptic —
// so scrolling is blocked with `touch-action: none` instead.

type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start'
const emit = defineEmits<{ (e: 'press', btn: Btn): void; (e: 'release', btn: Btn): void }>()

// The shell is a device that can host different game cartridges — brand it
// per game. Defaults keep DOOMBOX working unchanged.
withDefaults(
  defineProps<{ brand?: string; tagline?: string }>(),
  { brand: 'DOOMBOX', tagline: '· antispam division' }
)

const down = reactive<Record<Btn, boolean>>({
  up: false, down: false, left: false, right: false, a: false, b: false, start: false
})

function press(btn: Btn) {
  if (down[btn]) return
  down[btn] = true
  vibrate(btn === 'a' ? 'fire' : 'tap')
  emit('press', btn)
}
function release(btn: Btn) {
  if (!down[btn]) return
  down[btn] = false
  emit('release', btn)
}
</script>

<template>
  <div class="db-console">
    <div class="db-console__body">
      <!-- screen assembly -->
      <div class="db-console__screenwrap">
        <span class="db-console__led" aria-hidden="true" />
        <span class="db-console__brandtop">{{ brand }}<span>&nbsp;{{ tagline }}</span></span>
        <div class="db-console__bezel">
          <div class="db-lcd">
            <slot />
            <div class="db-lcd__grid" aria-hidden="true" />
            <div class="db-lcd__glass" aria-hidden="true" />
          </div>
        </div>
      </div>

      <span class="db-console__wordmark" aria-hidden="true">{{ brand }}</span>

      <!-- control deck -->
      <div class="db-deck">
        <!-- d-pad -->
        <div class="db-dpad">
          <label
            class="db-pad db-pad--up" :class="{ 'is-down': down.up }"
            @pointerdown="press('up')" @pointerup="release('up')"
            @pointerleave="release('up')" @pointercancel="release('up')"
          >
            <input type="checkbox" switch class="db-haptic" tabindex="-1" aria-label="Move forward" />
            <span class="db-pad__arrow">▲</span>
          </label>
          <label
            class="db-pad db-pad--down" :class="{ 'is-down': down.down }"
            @pointerdown="press('down')" @pointerup="release('down')"
            @pointerleave="release('down')" @pointercancel="release('down')"
          >
            <input type="checkbox" switch class="db-haptic" tabindex="-1" aria-label="Move back" />
            <span class="db-pad__arrow">▼</span>
          </label>
          <label
            class="db-pad db-pad--left" :class="{ 'is-down': down.left }"
            @pointerdown="press('left')" @pointerup="release('left')"
            @pointerleave="release('left')" @pointercancel="release('left')"
          >
            <input type="checkbox" switch class="db-haptic" tabindex="-1" aria-label="Turn left" />
            <span class="db-pad__arrow">◀</span>
          </label>
          <label
            class="db-pad db-pad--right" :class="{ 'is-down': down.right }"
            @pointerdown="press('right')" @pointerup="release('right')"
            @pointerleave="release('right')" @pointercancel="release('right')"
          >
            <input type="checkbox" switch class="db-haptic" tabindex="-1" aria-label="Turn right" />
            <span class="db-pad__arrow">▶</span>
          </label>
          <span class="db-dpad__hub" aria-hidden="true" />
        </div>

        <!-- action buttons -->
        <div class="db-actions">
          <label
            class="db-ab db-ab--b" :class="{ 'is-down': down.b }"
            @pointerdown="press('b')" @pointerup="release('b')"
            @pointerleave="release('b')" @pointercancel="release('b')"
          >
            <input type="checkbox" switch class="db-haptic" tabindex="-1" aria-label="B — strafe / back" />
            <span class="db-ab__label">B</span>
          </label>
          <label
            class="db-ab db-ab--a" :class="{ 'is-down': down.a }"
            @pointerdown="press('a')" @pointerup="release('a')"
            @pointerleave="release('a')" @pointercancel="release('a')"
          >
            <input type="checkbox" switch class="db-haptic" tabindex="-1" aria-label="A — fire" />
            <span class="db-ab__label">A</span>
          </label>
        </div>
      </div>

      <!-- start / select -->
      <div class="db-startrow">
        <label
          class="db-pill" :class="{ 'is-down': down.start }"
          @pointerdown="press('start')" @pointerup="release('start')"
          @pointerleave="release('start')" @pointercancel="release('start')"
        >
          <input type="checkbox" switch class="db-haptic" tabindex="-1" aria-label="Start" />
          <span>START</span>
        </label>
        <span class="db-speaker" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.db-console {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background:
    radial-gradient(120% 80% at 50% 0%, #191225 0%, #0a0910 60%, #05060b 100%);
}

/* ── the body: photorealistic moulded plastic ── */
.db-console__body {
  position: relative;
  width: min(440px, 100%);
  padding: 20px 20px 26px;
  border-radius: 26px 26px 46px 26px;
  background:
    linear-gradient(155deg, #6a5aa0 0%, #4a3d7a 8%, #3a2f63 22%, #2c2450 55%, #241d44 100%);
  box-shadow:
    inset 0 2px 1px rgba(255, 255, 255, 0.35),
    inset 0 -6px 14px rgba(0, 0, 0, 0.55),
    inset 3px 0 8px rgba(0, 0, 0, 0.25),
    inset -3px 0 8px rgba(0, 0, 0, 0.25),
    0 24px 60px rgba(0, 0, 0, 0.6),
    0 4px 10px rgba(0, 0, 0, 0.5);
}
/* fine plastic grain, sharpened on retina */
.db-console__body::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.5;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
}

/* ── screen assembly ── */
.db-console__screenwrap {
  position: relative;
  margin-bottom: 18px;
}
.db-console__led {
  position: absolute;
  top: 8px;
  left: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ff8a9c, #ff3b5c 60%, #7a1122);
  box-shadow: 0 0 8px #ff3b5c, inset 0 0 2px rgba(255, 255, 255, 0.6);
}
.db-console__brandtop {
  display: block;
  text-align: right;
  margin-bottom: 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.08em;
  color: #cdbfff;
}
.db-console__brandtop span {
  color: #8a7fb8;
  font-size: 6.5px;
}
.db-console__bezel {
  padding: 22px 20px;
  border-radius: 10px 10px 22px 10px;
  background: linear-gradient(160deg, #141018 0%, #0c0a12 60%, #17121e 100%);
  box-shadow:
    inset 0 3px 8px rgba(0, 0, 0, 0.9),
    inset 0 -1px 1px rgba(255, 255, 255, 0.06),
    0 1px 1px rgba(255, 255, 255, 0.12);
}
.db-lcd {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: 4px;
  overflow: hidden;
  background: #05060b;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.9), inset 0 0 24px rgba(0, 0, 0, 0.8);
}
.db-lcd > :deep(*:first-child) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
/* LCD pixel grid + scanlines */
.db-lcd__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
  background-image:
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.18) 0 1px, rgba(0, 0, 0, 0) 1px 3px),
    repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.10) 0 1px, rgba(0, 0, 0, 0) 1px 3px);
}
/* glass reflection */
.db-lcd__glass {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 31;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 34%);
}

/* ── wordmark ── */
.db-console__wordmark {
  display: block;
  text-align: center;
  margin: 2px 0 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 15px;
  letter-spacing: 0.05em;
  color: #ffb627;
  text-shadow: 1px 1px 0 #7c4dff, 2px 2px 2px rgba(0, 0, 0, 0.5);
}

/* ── control deck ── */
.db-deck {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
}

/* d-pad */
.db-dpad {
  position: relative;
  width: 132px;
  height: 132px;
}
.db-pad {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(145deg, #2a2438, #14101c);
  color: #b7a9e6;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.18), 0 3px 4px rgba(0, 0, 0, 0.6);
  cursor: pointer;
  touch-action: none;
  user-select: none;
  transition: transform 0.05s ease, box-shadow 0.05s ease, filter 0.05s ease;
}
.db-pad--up { top: 0; left: 44px; border-radius: 8px 8px 0 0; }
.db-pad--down { bottom: 0; left: 44px; border-radius: 0 0 8px 8px; }
.db-pad--left { top: 44px; left: 0; border-radius: 8px 0 0 8px; }
.db-pad--right { top: 44px; right: 0; border-radius: 0 8px 8px 0; }
.db-dpad__hub {
  position: absolute;
  top: 44px;
  left: 44px;
  width: 44px;
  height: 44px;
  background: linear-gradient(145deg, #241e33, #14101c);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.7);
}
.db-pad__arrow { font-size: 12px; pointer-events: none; }
.db-pad.is-down {
  transform: translateY(2px);
  filter: brightness(1.5);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.7);
  color: #39ff88;
}

/* A / B */
.db-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  transform: rotate(-16deg);
}
.db-ab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  transition: transform 0.05s ease, box-shadow 0.05s ease, filter 0.05s ease;
}
.db-ab--a {
  width: 62px;
  height: 62px;
  background: radial-gradient(circle at 34% 30%, #ff6f86, #e0243f 55%, #8c1225 100%);
  box-shadow: inset 0 2px 2px rgba(255, 255, 255, 0.45), inset 0 -4px 6px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.6);
}
.db-ab--b {
  width: 52px;
  height: 52px;
  background: radial-gradient(circle at 34% 30%, #b79dff, #6a4bd0 55%, #3c2a86 100%);
  box-shadow: inset 0 2px 2px rgba(255, 255, 255, 0.4), inset 0 -4px 6px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.6);
}
.db-ab__label {
  font-family: 'Press Start 2P', monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.92);
  pointer-events: none;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
}
.db-ab.is-down {
  transform: translateY(3px) scale(0.96);
  filter: brightness(1.15);
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.6);
}

/* start + speaker */
.db-startrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22px;
  padding: 0 10px;
}
.db-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: 20px;
  background: linear-gradient(145deg, #241e33, #15111e);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.16), 0 3px 4px rgba(0, 0, 0, 0.55);
  color: #9d90c8;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  transition: transform 0.05s ease, filter 0.05s ease;
}
.db-pill span { pointer-events: none; }
.db-pill.is-down { transform: translateY(2px); filter: brightness(1.4); color: #39ff88; }
.db-speaker {
  width: 74px;
  height: 26px;
  border-radius: 6px;
  background:
    radial-gradient(circle, rgba(0, 0, 0, 0.65) 1.1px, transparent 1.6px) 0 0 / 9px 9px;
  opacity: 0.7;
}

/* the transparent native haptic switch: real hit target, invisible.
   NOT display:none — that would remove it from hit-testing and kill the
   iOS haptic. It fills the button so the finger lands on it directly. */
.db-haptic {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

@media (prefers-reduced-motion: reduce) {
  .db-pad, .db-ab, .db-pill { transition: none; }
}
@media (max-width: 380px) {
  .db-dpad { width: 120px; height: 120px; }
  .db-pad { width: 40px; height: 40px; }
  .db-pad--up, .db-pad--down { left: 40px; }
  .db-pad--left, .db-pad--right { top: 40px; }
  .db-pad--down { bottom: 0; }
  .db-dpad__hub { top: 40px; left: 40px; width: 40px; height: 40px; }
}
</style>
