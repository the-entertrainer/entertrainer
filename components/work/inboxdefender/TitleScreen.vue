<script setup lang="ts">
// Boot screen on the console LCD. Single concept, stated plainly: shoot the
// phishing, spare the real mail.
const emit = defineEmits<{ (e: 'start'): void }>()
const showHow = ref(false)
</script>

<template>
  <div class="id-title">
    <div class="id-title__scan" aria-hidden="true" />
    <div class="id-title__inner">
      <p class="id-title__eyebrow">MAIL SECURITY</p>
      <h1 class="id-title__logo">INBOX<br />DEFENDER</h1>
      <p class="id-title__tag">Shoot the phishing.<br />Let the real mail land.</p>

      <button v-if="!showHow" class="id-mi id-mi--go" type="button" @click="emit('start')">▸ START</button>
      <button class="id-mi id-mi--ghost" type="button" @click="showHow = !showHow">
        {{ showHow ? '◂ BACK' : '▸ HOW TO PLAY' }}
      </button>

      <transition name="id-drop">
        <div v-if="showHow" class="id-how">
          <p>Mail drops toward your inbox. Some is <b>phishing or malware</b>; some is <b>real</b>.</p>
          <ul>
            <li><b>D-pad ◀▶</b> — aim the cannon</li>
            <li><b>A</b> — fire</li>
            <li><b>Shoot the threats.</b> Read the cue: lookalike domains, .exe/.zip files, urgency, password &amp; gift-card asks.</li>
            <li><b>Let real mail through.</b> Shooting a genuine message costs integrity too.</li>
          </ul>
          <p>Clear the round without draining your inbox integrity. Desktop: ◀▶ or mouse to aim, click / space to fire.</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.id-title {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: radial-gradient(120% 90% at 50% 24%, #10203a 0%, #0a0f1c 55%, #05060b 100%);
  color: #e8ecf5;
  overflow-y: auto;
}
.id-title__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.28) 3px);
  mix-blend-mode: multiply;
  animation: id-flicker 4s steps(60) infinite;
}
@keyframes id-flicker {
  0%, 97%, 100% { opacity: 0.5; }
  98% { opacity: 0.72; }
  99% { opacity: 0.36; }
}
.id-title__inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 340px;
  text-align: center;
}
.id-title__eyebrow {
  margin: 0 0 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.24em;
  color: #39ff88;
}
.id-title__logo {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(24px, 9vw, 38px);
  line-height: 1.3;
  letter-spacing: 0.03em;
  color: #ffb627;
  text-shadow: 0 0 2px #39ff88, 3px 3px 0 #7c4dff, 6px 6px 0 rgba(0, 0, 0, 0.5);
}
.id-title__tag {
  margin: 16px 0 22px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #8792ab;
}
.id-mi {
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
.id-mi--go {
  color: #d6ffe7;
  border-color: rgba(57, 255, 136, 0.5);
  background: rgba(57, 255, 136, 0.08);
}
.id-mi--go:hover { border-color: #39ff88; background: rgba(57, 255, 136, 0.16); }
.id-mi--ghost { color: #8792ab; border-color: rgba(135, 146, 171, 0.28); background: transparent; font-size: 9px; }
.id-how {
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
.id-how b { color: #e8ecf5; }
.id-how ul { margin: 8px 0; padding-left: 16px; }
.id-how li { margin: 4px 0; }
.id-drop-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.id-drop-enter-from { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) {
  .id-title__scan { animation: none; opacity: 0.5; }
}
</style>
