<script setup lang="ts">
// The boot screen, rendered on the console's LCD. Doom-styled, CRT-scanned.
// The online/co-op path is out of scope, so this is a clean single-player
// boot: START drops you in; HOW TO PLAY explains the handheld controls.
// START fires on the on-screen button, on a tap of the LCD, or on the
// console A / START buttons (the page maps those here).
const emit = defineEmits<{ (e: 'start'): void }>()
const showHow = ref(false)
</script>

<template>
  <div class="db-title">
    <div class="db-title__scan" aria-hidden="true" />
    <div class="db-title__inner">
      <p class="db-title__eyebrow">ANTISPAM DIVISION</p>
      <h1 class="db-title__logo">DOOMBOX</h1>
      <p class="db-title__tag">Neutralise the inbox.<br />Learn what gave it away.</p>

      <button v-if="!showHow" class="db-mi db-mi--go" type="button" @click="emit('start')">
        ▸ START
      </button>
      <button class="db-mi db-mi--ghost" type="button" @click="showHow = !showHow">
        {{ showHow ? '◂ BACK' : '▸ HOW TO PLAY' }}
      </button>

      <transition name="db-drop">
        <div v-if="showHow" class="db-how">
          <p><b>You are a purple antispam / antivirus officer.</b> Ten threats haunt the server — spam and viruses disguised as ordinary mail. They will hunt you.</p>
          <ul>
            <li><b>D-pad ▲▼</b> — move forward / back</li>
            <li><b>D-pad ◀▶</b> — turn to aim</li>
            <li><b>A</b> — fire the neutraliser</li>
            <li>A hit opens the mail — <b>spot what gave it away</b> to destroy it</li>
          </ul>
          <p>Clear all ten before they drain your armour. Desktop: WASD / arrows + click or space.</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.db-title {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: radial-gradient(120% 90% at 50% 26%, #1a1230 0%, #0a0a18 55%, #05060b 100%);
  color: #e8ecf5;
  overflow-y: auto;
}
.db-title__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.28) 3px);
  mix-blend-mode: multiply;
  animation: db-flicker 4s steps(60) infinite;
}
@keyframes db-flicker {
  0%, 97%, 100% { opacity: 0.55; }
  98% { opacity: 0.78; }
  99% { opacity: 0.4; }
}
.db-title__inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 340px;
  text-align: center;
}
.db-title__eyebrow {
  margin: 0 0 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.24em;
  color: #7c4dff;
}
.db-title__logo {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(26px, 11vw, 44px);
  letter-spacing: 0.03em;
  color: #ffb627;
  text-shadow: 0 0 2px #ff3b5c, 3px 3px 0 #7c4dff, 6px 6px 0 rgba(0, 0, 0, 0.5);
}
.db-title__tag {
  margin: 16px 0 22px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #8792ab;
}
.db-mi {
  display: block;
  width: 100%;
  margin: 0 auto 10px;
  padding: 13px 14px;
  background: rgba(124, 77, 255, 0.06);
  border: 1px solid rgba(124, 77, 255, 0.35);
  border-radius: 5px;
  color: #cdbfff;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.db-mi--go {
  color: #d6ffe7;
  border-color: rgba(57, 255, 136, 0.5);
  background: rgba(57, 255, 136, 0.08);
}
.db-mi--go:hover { border-color: #39ff88; background: rgba(57, 255, 136, 0.16); }
.db-mi--ghost { color: #8792ab; border-color: rgba(135, 146, 171, 0.28); background: transparent; font-size: 9px; }
.db-how {
  margin-top: 6px;
  text-align: left;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  line-height: 1.55;
  color: #a7b0c6;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(135, 146, 171, 0.2);
  border-radius: 6px;
  padding: 12px 14px;
}
.db-how b { color: #e8ecf5; }
.db-how ul { margin: 8px 0; padding-left: 16px; }
.db-how li { margin: 4px 0; }
.db-drop-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.db-drop-enter-from { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) {
  .db-title__scan { animation: none; opacity: 0.5; }
}
</style>
