<script setup lang="ts">
import { vibrate } from '~/utils/doombox/haptics'

// The console skin is the uploaded handheld photo (background removed). The
// game is mapped onto the screen region; the D-pad / A / B / Start are
// transparent hit-zones aligned to the photo's real buttons, each carrying a
// native switch input so a genuine tap fires iOS haptics (Android via
// navigator.vibrate). Positions are percentages of the 660x1100 skin.
type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start'
const emit = defineEmits<{ (e: 'press', b: Btn): void; (e: 'release', b: Btn): void }>()

const DEBUG = false // flip to outline the hit-zones + screen while tuning

const BTNS: { id: Btn; l: number; t: number; w: number; h: number; round?: boolean }[] = [
  { id: 'up', l: 14.5, t: 62, w: 13, h: 6.5 },
  { id: 'down', l: 14.5, t: 75.5, w: 13, h: 6.5 },
  { id: 'left', l: 7, t: 68.5, w: 9.5, h: 7 },
  { id: 'right', l: 25.5, t: 68.5, w: 9.5, h: 7 },
  { id: 'b', l: 59, t: 65.5, w: 15.5, h: 10.5, round: true },
  { id: 'a', l: 76.5, t: 60, w: 16, h: 11, round: true },
  { id: 'start', l: 31.5, t: 82, w: 12.5, h: 5 }
]

// game screen rectangle (percent of the skin)
const SCREEN = { l: 6, t: 12.4, w: 88, h: 41 }

const down = reactive<Record<Btn, boolean>>({
  up: false, down: false, left: false, right: false, a: false, b: false, start: false
})
function press(b: Btn) {
  if (down[b]) return
  down[b] = true
  vibrate(b === 'a' ? 'fire' : 'tap')
  emit('press', b)
}
function release(b: Btn) {
  if (!down[b]) return
  down[b] = false
  emit('release', b)
}
</script>

<template>
  <div class="zc" :class="{ 'zc--debug': DEBUG }">
    <div class="zc__unit">
      <img class="zc__skin" src="/zeroday/console.png" alt="ZERO DAY handheld" draggable="false" />

      <!-- the screen: game slotted in, with the LCD grid + glass on top -->
      <div
        class="zc__screen"
        :style="{ left: SCREEN.l + '%', top: SCREEN.t + '%', width: SCREEN.w + '%', height: SCREEN.h + '%' }"
      >
        <div class="zc__lcd"><slot /></div>
        <div class="zc__grid" aria-hidden="true" />
        <div class="zc__glass" aria-hidden="true" />
      </div>

      <!-- transparent, haptic button hit-zones over the photo's controls -->
      <label
        v-for="b in BTNS"
        :key="b.id"
        class="zc__btn"
        :class="{ 'zc__btn--round': b.round, 'is-down': down[b.id] }"
        :style="{ left: b.l + '%', top: b.t + '%', width: b.w + '%', height: b.h + '%' }"
        @pointerdown="press(b.id)"
        @pointerup="release(b.id)"
        @pointerleave="release(b.id)"
        @pointercancel="release(b.id)"
      >
        <input type="checkbox" switch class="db-haptic" tabindex="-1" :aria-label="b.id" />
      </label>
    </div>
  </div>
</template>

<style scoped>
.zc {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: radial-gradient(120% 80% at 50% 0%, #14141a 0%, #08080c 60%, #050506 100%);
}
.zc__unit {
  position: relative;
  height: min(96dvh, 150vw);
  aspect-ratio: 660 / 1100;
  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.65));
}
.zc__skin {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

/* screen */
.zc__screen {
  position: absolute;
  overflow: hidden;
  border-radius: 3px;
}
.zc__lcd {
  position: absolute;
  inset: 0;
  background: #05060b;
}
.zc__lcd > :deep(*:first-child) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
/* LCD dot-matrix simulation */
.zc__grid {
  position: absolute;
  inset: 0;
  z-index: 30;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.28) 0 1px, rgba(0, 0, 0, 0) 1px 2px),
    repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.22) 0 1px, rgba(0, 0, 0, 0) 1px 2px);
  mix-blend-mode: multiply;
}
.zc__glass {
  position: absolute;
  inset: 0;
  z-index: 31;
  pointer-events: none;
  background:
    linear-gradient(135deg, rgba(180, 220, 255, 0.12) 0%, rgba(255, 255, 255, 0) 30%),
    radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.28) 90%);
}

/* buttons */
.zc__btn {
  position: absolute;
  border-radius: 6px;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.zc__btn--round {
  border-radius: 50%;
}
.zc__btn.is-down {
  background: radial-gradient(circle, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0) 70%);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.5);
}
.db-haptic {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  -webkit-appearance: none;
  appearance: none;
}

/* tuning aid */
.zc--debug .zc__btn {
  background: rgba(255, 0, 128, 0.35);
  outline: 1px solid #ff0080;
}
.zc--debug .zc__screen {
  outline: 2px solid #00e0ff;
}
</style>
