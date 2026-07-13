<script setup lang="ts">
// Boot screen on the LCD. Mission brief carries the cyber-safety thread: a
// zero-day is an unpatched flaw — race the kill chain to the patch node.
const emit = defineEmits<{ (e: 'start'): void }>()
const showHow = ref(false)
</script>

<template>
  <div class="zt">
    <div class="zt__scan" aria-hidden="true" />
    <div class="zt__inner">
      <p class="zt__eyebrow">INCIDENT RESPONSE</p>
      <h1 class="zt__logo">ZERO<br />DAY</h1>

      <template v-if="!showHow">
        <p class="zt__brief">
          A <b>zero-day</b> exploit breached the subnet — a flaw with no patch yet. Malware is spreading. Run the kill chain and reach the <b>patch node</b>.
        </p>
        <button class="zt__go" type="button" @click="emit('start')">▸ DEPLOY</button>
        <button class="zt__ghost" type="button" @click="showHow = true">▸ CONTROLS</button>
      </template>

      <template v-else>
        <ul class="zt__how">
          <li><b>◀ ▶</b> run · <b>▲</b> aim up · <b>▼</b> crouch / aim down</li>
          <li><b>A</b> jump · <b>B</b> fire (hold)</li>
          <li>Grab <b class="p">PATCH</b> to heal, <b class="f">FIREWALL</b> to shield, <b class="t">2FA</b> for spread fire</li>
        </ul>
        <button class="zt__go" type="button" @click="emit('start')">▸ DEPLOY</button>
        <button class="zt__ghost" type="button" @click="showHow = false">◂ BACK</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.zt {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: radial-gradient(120% 90% at 50% 24%, #10241a 0%, #0a0f12 55%, #05060b 100%);
  color: #d8f0e2;
  overflow-y: auto;
}
.zt__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.3) 3px);
  mix-blend-mode: multiply;
  animation: zt-flk 4s steps(60) infinite;
}
@keyframes zt-flk { 0%, 97%, 100% { opacity: 0.5; } 98% { opacity: 0.72; } }
.zt__inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 300px;
  text-align: center;
}
.zt__eyebrow {
  margin: 0 0 6px;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  letter-spacing: 0.2em;
  color: #39ff88;
}
.zt__logo {
  margin: 0 0 12px;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(22px, 9vw, 34px);
  line-height: 1.2;
  color: #ffb627;
  text-shadow: 0 0 2px #ff3b5c, 3px 3px 0 #7c4dff, 5px 5px 0 rgba(0, 0, 0, 0.5);
}
.zt__brief {
  margin: 0 0 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #9fb0a6;
}
.zt__brief b { color: #d8f0e2; }
.zt__how {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  text-align: left;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11.5px;
  line-height: 1.5;
  color: #9fb0a6;
}
.zt__how li { margin: 5px 0; }
.zt__how b { color: #d8f0e2; }
.zt__how .p { color: #39ff88; }
.zt__how .f { color: #4db8ff; }
.zt__how .t { color: #ffb627; }
.zt__go, .zt__ghost {
  display: block;
  width: 100%;
  margin: 0 auto 8px;
  padding: 11px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  border-radius: 5px;
  cursor: pointer;
}
.zt__go {
  color: #d6ffe7;
  border: 1px solid rgba(57, 255, 136, 0.6);
  background: rgba(57, 255, 136, 0.1);
}
.zt__ghost {
  color: #8aa0b0;
  border: 1px solid rgba(135, 146, 171, 0.3);
  background: transparent;
  font-size: 8px;
}
@media (prefers-reduced-motion: reduce) {
  .zt__scan { animation: none; opacity: 0.5; }
}
</style>
