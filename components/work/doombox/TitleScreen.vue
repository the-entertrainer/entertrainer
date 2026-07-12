<script setup lang="ts">
// The title screen — Doom-styled, CRT-scanned. SOLO is live; HOST / JOIN are
// the coop path (room codes) and are flagged as coming online, so the menu
// reads true to what's built. HOW TO PLAY expands the controls.
const emit = defineEmits<{ (e: 'solo'): void }>()

const code = ref('')
const showHow = ref(false)
const coopNote = ref('')

function flashCoop(kind: 'host' | 'join') {
  coopNote.value =
    kind === 'host'
      ? 'Co-op servers are coming online. For now, drop in SOLO.'
      : code.value.trim()
        ? `Room “${code.value.trim().toUpperCase()}” — co-op is coming online. Play SOLO for now.`
        : 'Enter a code once co-op is live. For now, drop in SOLO.'
}
</script>

<template>
  <div class="db-title">
    <div class="db-title__scan" aria-hidden="true" />
    <div class="db-title__inner">
      <p class="db-title__eyebrow">ENTERTRAINER PRESENTS</p>
      <h1 class="db-title__logo">DOOMBOX</h1>
      <p class="db-title__tag">Neutralise the inbox. Learn what gave it away.</p>

      <div class="db-title__menu">
        <button class="db-mi db-mi--go" type="button" @click="emit('solo')">
          <span class="db-mi__key">▸</span> SOLO — ENTER THE SERVER
        </button>

        <button class="db-mi" type="button" @click="flashCoop('host')">
          <span class="db-mi__key">▸</span> HOST GAME <span class="db-mi__soon">CO-OP · SOON</span>
        </button>

        <div class="db-mi db-mi--join">
          <span class="db-mi__key">▸</span> JOIN GAME
          <input
            v-model="code"
            class="db-mi__code"
            maxlength="6"
            placeholder="CODE"
            aria-label="Game code"
            @keyup.enter="flashCoop('join')"
          />
          <button class="db-mi__jbtn" type="button" @click="flashCoop('join')">GO</button>
        </div>

        <button class="db-mi db-mi--ghost" type="button" @click="showHow = !showHow">
          <span class="db-mi__key">▸</span> HOW TO PLAY
        </button>
      </div>

      <p v-if="coopNote" class="db-title__note">{{ coopNote }}</p>

      <transition name="db-drop">
        <div v-if="showHow" class="db-how">
          <p><b>You are a purple antispam / antivirus officer.</b> The server holds <b>10 threats</b> — spam and viruses disguised as ordinary mail.</p>
          <ul>
            <li><b>Move</b> — WASD or arrow keys · <b>Look</b> — mouse (click to lock) or ← →</li>
            <li><b>Fire</b> — click, Space, or F · aim the neutraliser at a glowing envelope</li>
            <li><b>Neutralise</b> — a hit opens the mail; spot what gave it away to destroy it</li>
          </ul>
          <p>Clear all ten and the server is secured. On touch, use the on-screen sticks and FIRE.</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.db-title {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background:
    radial-gradient(120% 90% at 50% 30%, #1a1230 0%, #0a0a18 55%, #05060b 100%);
  color: #e8ecf5;
  overflow: hidden;
}
.db-title__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0) 0px,
    rgba(0, 0, 0, 0) 2px,
    rgba(0, 0, 0, 0.28) 3px
  );
  mix-blend-mode: multiply;
  animation: db-flicker 4s steps(60) infinite;
}
@keyframes db-flicker {
  0%, 97%, 100% { opacity: 0.55; }
  98% { opacity: 0.75; }
  99% { opacity: 0.4; }
}
.db-title__inner {
  position: relative;
  z-index: 1;
  width: min(620px, 100%);
  text-align: center;
}
.db-title__eyebrow {
  margin: 0 0 14px;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.32em;
  color: #7c4dff;
}
.db-title__logo {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(34px, 9vw, 74px);
  letter-spacing: 0.04em;
  color: #ffb627;
  text-shadow:
    0 0 2px #ff3b5c,
    4px 4px 0 #7c4dff,
    8px 8px 0 rgba(0, 0, 0, 0.5);
}
.db-title__tag {
  margin: 22px 0 34px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(13px, 2vw, 16px);
  color: #8792ab;
}
.db-title__menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 420px;
  margin: 0 auto;
  font-family: 'Press Start 2P', monospace;
}
.db-mi {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 16px;
  background: rgba(124, 77, 255, 0.06);
  border: 1px solid rgba(124, 77, 255, 0.35);
  border-radius: 5px;
  color: #cdbfff;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}
.db-mi:hover {
  background: rgba(124, 77, 255, 0.16);
  border-color: #7c4dff;
  transform: translateX(3px);
}
.db-mi__key {
  color: #39ff88;
}
.db-mi--go {
  color: #d6ffe7;
  border-color: rgba(57, 255, 136, 0.5);
  background: rgba(57, 255, 136, 0.08);
}
.db-mi--go:hover {
  border-color: #39ff88;
  background: rgba(57, 255, 136, 0.16);
}
.db-mi__soon {
  margin-left: auto;
  font-size: 8px;
  color: #8a6410;
  letter-spacing: 0.1em;
}
.db-mi--join {
  cursor: default;
}
.db-mi--join:hover {
  transform: none;
  background: rgba(124, 77, 255, 0.06);
  border-color: rgba(124, 77, 255, 0.35);
}
.db-mi__code {
  margin-left: auto;
  width: 88px;
  padding: 7px 8px;
  background: #05060b;
  border: 1px solid rgba(124, 77, 255, 0.5);
  border-radius: 3px;
  color: #ffb627;
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.db-mi__jbtn {
  padding: 8px 10px;
  background: rgba(124, 77, 255, 0.25);
  border: 1px solid rgba(124, 77, 255, 0.5);
  border-radius: 3px;
  color: #cdbfff;
  font-family: inherit;
  font-size: 9px;
  cursor: pointer;
}
.db-mi--ghost {
  color: #8792ab;
  border-color: rgba(135, 146, 171, 0.28);
  background: transparent;
}
.db-title__note {
  margin: 18px auto 0;
  max-width: 420px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12.5px;
  color: #ffb627;
}
.db-how {
  margin: 20px auto 0;
  max-width: 460px;
  text-align: left;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: #a7b0c6;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(135, 146, 171, 0.2);
  border-radius: 6px;
  padding: 16px 18px;
}
.db-how b {
  color: #e8ecf5;
}
.db-how ul {
  margin: 10px 0;
  padding-left: 18px;
}
.db-how li {
  margin: 5px 0;
}
.db-drop-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.db-drop-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .db-title__scan {
    animation: none;
    opacity: 0.5;
  }
  .db-mi:hover {
    transform: none;
  }
}
</style>
