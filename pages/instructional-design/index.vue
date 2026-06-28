<script setup lang="ts">
definePageMeta({ layout: 'default' })

// ── State ──────────────────────────────────────────────────────────────────
const stage        = ref(0)
const shakeScreen  = ref(false)

// Stage 0
const quizAnswer   = ref<'right' | 'wrong' | null>(null)

// Stage 1
const flipped      = ref([false, false, false])

// Stage 2
const leverY       = ref(0)
const leverLocked  = ref(false)
const toasterState = ref<'idle' | 'cooking' | 'popped'>('idle')
const cookProgress = ref(0)
const trackEl      = ref<HTMLElement | null>(null)
let   cookTimer: ReturnType<typeof setInterval> | null = null

// ── Stage 0 ────────────────────────────────────────────────────────────────
function pickAnswer(ans: 'right' | 'wrong') {
  quizAnswer.value = ans
  if (ans === 'wrong') {
    shakeScreen.value = true
    setTimeout(() => { shakeScreen.value = false }, 500)
  }
}

// ── Stage 1 ────────────────────────────────────────────────────────────────
function toggleCard(i: number) {
  flipped.value = flipped.value.map((v, idx) => idx === i ? !v : v)
}

// ── Stage 2 drag ───────────────────────────────────────────────────────────
function onPointerDown(e: PointerEvent) {
  if (toasterState.value !== 'idle') return
  e.preventDefault()
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup',   onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  if (!trackEl.value || leverLocked.value) return
  const rect = trackEl.value.getBoundingClientRect()
  const pct  = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
  leverY.value = pct
  if (pct >= 95) {
    leverLocked.value = true
    startCooking()
    onPointerUp()
  }
}

function onPointerUp() {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup',   onPointerUp)
  if (!leverLocked.value) leverY.value = 0
}

function startCooking() {
  toasterState.value = 'cooking'
  shakeScreen.value  = true
  setTimeout(() => { shakeScreen.value = false }, 300)
  cookProgress.value = 0
  cookTimer = setInterval(() => {
    cookProgress.value += 2
    if (cookProgress.value >= 100) {
      clearInterval(cookTimer!)
      toasterState.value = 'popped'
      leverY.value       = 0
      leverLocked.value  = false
    }
  }, 40)
}

// ── Toast colour ───────────────────────────────────────────────────────────
const toastStyle = computed(() => {
  const p = cookProgress.value
  const r = Math.round(253 - p * 1.1)
  const g = Math.round(224 - p * 1.2)
  const b = Math.round(139 - p * 1.1)
  const br = Math.round(242 - p * 1.2)
  const bg = Math.round(150 - p * 1.3)
  const bb = Math.max(0, Math.round(11  - p * 0.8))
  const bottom = toasterState.value === 'popped' ? '85px' : `${40 - leverY.value * 0.4}px`
  return {
    backgroundColor: `rgb(${r},${g},${b})`,
    borderColor:     `rgb(${br},${bg},${bb})`,
    bottom,
  }
})

// ── Reset ──────────────────────────────────────────────────────────────────
function restart() {
  stage.value        = 0
  quizAnswer.value   = null
  flipped.value      = [false, false, false]
  leverY.value       = 0
  leverLocked.value  = false
  toasterState.value = 'idle'
  cookProgress.value = 0
  if (cookTimer) clearInterval(cookTimer)
}

onBeforeUnmount(() => { if (cookTimer) clearInterval(cookTimer) })
</script>

<template>
  <div class="ce-root" :class="{ 'ce-shake': shakeScreen }">

    <!-- header -->
    <header class="ce-header">
      <div class="ce-brand">
        <span class="ce-dot" />
        <span class="ce-brand-label">Clarity Engine</span>
      </div>
      <div class="ce-dots">
        <span v-for="s in 4" :key="s" class="ce-step-dot" :class="{ active: s - 1 === stage }" />
      </div>
    </header>

    <!-- body -->
    <main class="ce-main">

      <!-- ══ STAGE 0 ══ -->
      <Transition name="ce-fade" mode="out-in">
        <div v-if="stage === 0" key="s0" class="ce-stage">
          <div class="ce-top">
            <span class="ce-tag ce-tag--red">Let's try a quick test</span>
            <h1 class="ce-h1">Why does learning feel so hard?</h1>
            <p class="ce-sub">Before we start, read this real procedure and answer the check.</p>
          </div>

          <div class="ce-card">
            <p class="ce-card-eyebrow">Operational Protocol T-9</p>
            <h3 class="ce-card-title">Maillard Thermal Activation</h3>
            <p class="ce-card-body">
              "Prior to core operational ignition, the human agent must secure vertical orientation
              of the porous leavened starch substrate inside the primary receiving chamber. Apply
              continuous downward mechanical force to the side-mounted actuator until a dynamic
              latch activates the heating array."
            </p>

            <div class="ce-quiz">
              <p class="ce-quiz-q">What are you supposed to do first?</p>
              <div class="ce-quiz-opts">
                <button
                  class="ce-opt"
                  :class="{ 'ce-opt--wrong': quizAnswer === 'wrong' && true }"
                  @click="pickAnswer('wrong')"
                >Turn on the array.</button>
                <button
                  class="ce-opt"
                  :class="{ 'ce-opt--right': quizAnswer === 'right' }"
                  @click="pickAnswer('right')"
                >Put the bread in.</button>
              </div>
            </div>
          </div>

          <div class="ce-bottom">
            <p v-if="quizAnswer" class="ce-insight">
              {{ quizAnswer === 'right'
                ? "Correct! But your brain had to translate every single robot word, didn't it?"
                : "Exactly. It's written like a robot manual. You shouldn't need a dictionary to make breakfast." }}
            </p>
            <button class="ce-btn ce-btn--primary" @click="stage = 1">
              Let's make this human
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- ══ STAGE 1 ══ -->
        <div v-else-if="stage === 1" key="s1" class="ce-stage">
          <div class="ce-top">
            <span class="ce-tag ce-tag--amber">Step 1: The Translation</span>
            <h1 class="ce-h1">Simplifying the Signal</h1>
            <p class="ce-sub">Tap each card to flip it from "Robot Code" to plain human speak.</p>
          </div>

          <div class="ce-flip-list">
            <div
              v-for="(card, i) in [
                { num: '1', tech: 'Secure vertical alignment of the leavened starch substrate inside the slot.', clear: 'Put your slice of bread into the toaster slot.' },
                { num: '2', tech: 'Apply continuous downward mechanical force to the side actuator.',             clear: 'Push the handle on the right down until it clicks.' },
                { num: '3', tech: 'Verify automatic mechanical release upon optimum dehydration status.',         clear: 'Wait. It pops up automatically when it\'s done.' }
              ]"
              :key="i"
              class="ce-flip-wrap"
              @click="toggleCard(i)"
            >
              <div class="ce-flip-inner" :class="{ flipped: flipped[i] }">
                <!-- front -->
                <div class="ce-flip-face ce-flip-front">
                  <span class="ce-flip-num">{{ card.num }}</span>
                  <p class="ce-flip-text-tech">"{{ card.tech }}"</p>
                </div>
                <!-- back -->
                <div class="ce-flip-face ce-flip-back">
                  <span class="ce-flip-num ce-flip-num--back">{{ card.num }}</span>
                  <p class="ce-flip-text-clear">{{ card.clear }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="ce-bottom">
            <p class="ce-insight ce-insight--muted">Flipped cards feel light, intuitive, and simple. Just like good teaching.</p>
            <button class="ce-btn ce-btn--primary" @click="stage = 2">
              Let's practice doing it
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- ══ STAGE 2 ══ -->
        <div v-else-if="stage === 2" key="s2" class="ce-stage">
          <div class="ce-top">
            <span class="ce-tag ce-tag--green">Step 2: Real Action</span>
            <h1 class="ce-h1">Learn by Doing</h1>
            <p class="ce-sub">Reading isn't enough. Grab the lever and drag it down to start.</p>
          </div>

          <!-- Toaster canvas -->
          <div class="ce-toaster-canvas">
            <div class="ce-toaster-scene">

              <!-- smoke -->
              <div v-if="toasterState === 'popped'" class="ce-smoke-wrap">
                <span class="ce-smoke ce-smoke-1" />
                <span class="ce-smoke ce-smoke-2" />
              </div>

              <!-- toast -->
              <div
                class="ce-toast"
                :class="{ 'ce-toast--pop': toasterState === 'popped' }"
                :style="toastStyle"
              >
                <div v-if="toasterState === 'popped'" class="ce-toast-face">
                  <div class="ce-face-eyes">
                    <span class="ce-eye" /><span class="ce-eye" />
                  </div>
                  <div class="ce-face-smile" />
                </div>
              </div>

              <!-- toaster body -->
              <div class="ce-toaster-body">
                <div class="ce-toaster-slot" :class="{ 'ce-toaster-slot--hot': toasterState === 'cooking' }" />
                <div class="ce-toaster-indicator" :class="{ 'ce-toaster-indicator--on': toasterState === 'cooking' }" />

                <!-- lever track -->
                <div class="ce-lever-track">
                  <div ref="trackEl" class="ce-lever-rail">
                    <div
                      class="ce-lever-handle"
                      :class="{ 'ce-lever-handle--disabled': toasterState !== 'idle' }"
                      :style="{ top: (leverY * 0.72) + '%' }"
                      @pointerdown="onPointerDown"
                    >
                      <span class="ce-lever-grip" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p class="ce-toaster-hint">
              <template v-if="toasterState === 'idle'">Slide the handle down to practice</template>
              <template v-else-if="toasterState === 'cooking'">Perfect Heat Flow: {{ Math.round(cookProgress) }}%</template>
              <template v-else>Delicious! Practice makes perfect.</template>
            </p>
          </div>

          <div class="ce-bottom">
            <button
              class="ce-btn ce-btn--primary"
              :disabled="toasterState !== 'popped'"
              @click="stage = 3"
            >
              Let's look at what happened
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- ══ STAGE 3 ══ -->
        <div v-else key="s3" class="ce-stage ce-stage--center">
          <div class="ce-reveal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <h1 class="ce-h1">That is Instructional Design.</h1>
          <p class="ce-sub">The art of stopping people from feeling stupid.</p>

          <div class="ce-reveal-card">
            <div v-for="(item, i) in [
              { n: '1', head: 'We delete the clutter',      body: 'Nobody reads thick manuals. We strip out information overload and give you only the clear, simple truth.' },
              { n: '2', head: 'We sequence logically',      body: 'We arrange actions exactly in the order your brain expects them to happen, reducing friction.' },
              { n: '3', head: 'We design doing',            body: 'We know that people learn by pulling levers, making choices, and practising — not by reading slides.' }
            ]" :key="i" class="ce-reveal-item">
              <span class="ce-reveal-num">{{ item.n }}</span>
              <div>
                <p class="ce-reveal-head">{{ item.head }}</p>
                <p class="ce-reveal-body">{{ item.body }}</p>
              </div>
            </div>
          </div>

          <button class="ce-btn ce-btn--ghost" @click="restart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            Play Again
          </button>
        </div>
      </Transition>
    </main>

    <footer class="ce-footer">
      <p class="ce-footer-label">The Psychology of Experience Design</p>
    </footer>
  </div>
</template>

<style scoped>
/* ── Reset / root ─────────────────────────────────────────────────── */
.ce-root {
  position: fixed;
  inset: 0;
  background: var(--color-bg);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  font-family: inherit;
}
.ce-root.ce-shake { animation: ce-shake 0.25s ease-in-out; }

@keyframes ce-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60%  { transform: translateX(-4px); }
  40%, 80%  { transform: translateX(4px); }
}

/* ── Header ───────────────────────────────────────────────────────── */
.ce-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  flex-shrink: 0;
}
.ce-brand { display: flex; align-items: center; gap: 8px; }
.ce-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 10px rgba(245,158,11,0.5);
}
.ce-brand-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.4;
}
.ce-dots { display: flex; gap: 6px; align-items: center; }
.ce-step-dot {
  width: 6px; height: 6px;
  border-radius: 3px;
  background: var(--color-text);
  opacity: 0.15;
  transition: width 0.4s ease, opacity 0.4s ease;
}
.ce-step-dot.active {
  width: 20px;
  opacity: 0.7;
}

/* ── Main ─────────────────────────────────────────────────────────── */
.ce-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
}
.ce-stage {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0 24px;
  min-height: 100%;
}
.ce-stage--center { align-items: center; text-align: center; }

/* ── Tags ─────────────────────────────────────────────────────────── */
.ce-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
}
.ce-tag--red   { color: #dc2626; background: rgba(220,38,38,0.08); border-color: rgba(220,38,38,0.15); }
.ce-tag--amber { color: #b45309; background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.2); }
.ce-tag--green { color: #15803d; background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.15); }

/* ── Typography ───────────────────────────────────────────────────── */
.ce-top { display: flex; flex-direction: column; gap: 10px; }
.ce-h1 {
  font-size: clamp(26px, 6vw, 34px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
}
.ce-sub { font-size: 12px; opacity: 0.5; margin: 0; line-height: 1.5; }

/* ── Stage 0: card ────────────────────────────────────────────────── */
.ce-card {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ce-card-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.4; margin: 0; }
.ce-card-title   { font-size: 18px; font-weight: 700; margin: 0; }
.ce-card-body    { font-size: 13px; line-height: 1.65; opacity: 0.55; font-style: italic; margin: 0; }

.ce-quiz { border-top: 1px solid var(--color-glass-border); padding-top: 16px; display: flex; flex-direction: column; gap: 10px; }
.ce-quiz-q { font-size: 12px; font-weight: 600; margin: 0; }
.ce-quiz-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ce-opt {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--color-glass-border);
  background: var(--color-glass-bg);
  color: var(--color-text);
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, opacity 0.15s;
  opacity: 0.7;
}
.ce-opt:hover { opacity: 1; background: var(--color-glass-bg-hover); }
.ce-opt--right { border-color: #22c55e !important; background: rgba(34,197,94,0.1) !important; opacity: 1 !important; color: #15803d; }
.ce-opt--wrong { border-color: rgba(220,38,38,0.4) !important; background: rgba(220,38,38,0.06) !important; opacity: 1 !important; color: #dc2626; }

/* ── Bottom / CTA area ────────────────────────────────────────────── */
.ce-bottom { display: flex; flex-direction: column; gap: 12px; margin-top: auto; }
.ce-insight      { font-size: 12px; text-align: center; opacity: 0.6; margin: 0; line-height: 1.5; }
.ce-insight--muted { font-style: italic; }

/* ── Buttons ──────────────────────────────────────────────────────── */
.ce-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  border: none;
  width: 100%;
}
.ce-btn:active { transform: scale(0.97); }
.ce-btn--primary {
  background: var(--color-text);
  color: var(--color-bg);
}
.ce-btn--primary:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}
.ce-btn--ghost {
  background: transparent;
  color: var(--color-text);
  border: 1.5px solid var(--color-text);
  opacity: 0.55;
  width: auto;
}
.ce-btn--ghost:hover { opacity: 1; }

/* ── Stage 1: 3D flip cards ───────────────────────────────────────── */
.ce-flip-list { display: flex; flex-direction: column; gap: 10px; }
.ce-flip-wrap {
  perspective: 1000px;
  height: 80px;
  cursor: pointer;
  flex-shrink: 0;
}
.ce-flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.ce-flip-inner.flipped { transform: rotateY(180deg); }
.ce-flip-face {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.ce-flip-front {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
}
.ce-flip-back {
  background: #f59e0b;
  transform: rotateY(180deg);
}
.ce-flip-num {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--color-text);
  color: var(--color-bg);
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.35;
}
.ce-flip-num--back {
  background: rgba(255,255,255,0.25);
  color: #fff;
  opacity: 1;
}
.ce-flip-text-tech  { font-size: 11px; font-family: monospace; opacity: 0.5; line-height: 1.45; margin: 0; }
.ce-flip-text-clear { font-size: 12px; font-weight: 700; color: #fff; line-height: 1.4; margin: 0; }

/* ── Stage 2: Toaster ─────────────────────────────────────────────── */
.ce-toaster-canvas {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 24px;
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.ce-toaster-scene {
  position: relative;
  width: 192px;
  height: 192px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
/* smoke */
.ce-smoke-wrap {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  pointer-events: none;
}
.ce-smoke {
  display: block;
  width: 6px;
  border-radius: 3px;
  background: #f59e0b;
  opacity: 0;
}
.ce-smoke-1 { height: 24px; animation: ceSmoke 1.6s infinite ease-out; }
.ce-smoke-2 { height: 32px; animation: ceSmoke 1.6s infinite ease-out 0.5s; }
@keyframes ceSmoke {
  0%   { transform: translateY(0) scaleX(1); opacity: 0; }
  40%  { opacity: 0.4; }
  100% { transform: translateY(-40px) scaleX(1.4); opacity: 0; }
}
/* toast */
.ce-toast {
  position: absolute;
  width: 112px;
  height: 112px;
  border-radius: 34px 34px 8px 8px;
  border: 4px solid;
  z-index: 10;
  transition: bottom 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ce-toast--pop { animation: ceSpringPop 0.65s cubic-bezier(0.25, 0.8, 0.25, 1.2) forwards; }
@keyframes ceSpringPop {
  0%   { transform: translateY(60px) scaleY(0.8); }
  40%  { transform: translateY(-25px) scaleY(1.1); }
  70%  { transform: translateY(10px) scaleY(0.95); }
  100% { transform: translateY(0) scaleY(1); }
}
.ce-toast-face { display: flex; flex-direction: column; align-items: center; gap: 6px; animation: ceFadeIn 0.4s 0.3s both; }
@keyframes ceFadeIn { from { opacity: 0; } to { opacity: 1; } }
.ce-face-eyes  { display: flex; gap: 10px; }
.ce-eye        { width: 7px; height: 7px; border-radius: 50%; background: #292524; }
.ce-face-smile { width: 16px; height: 7px; border: 3.5px solid #292524; border-top: none; border-radius: 0 0 16px 16px; }
/* toaster body */
.ce-toaster-body {
  position: relative;
  z-index: 20;
  width: 160px;
  height: 112px;
  background: #1c1917;
  border-radius: 24px 24px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 8px solid #0f0e0d;
}
.ce-toaster-slot {
  width: 112px;
  height: 10px;
  background: #000;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}
.ce-toaster-slot::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f97316, #fbbf24, #f97316);
  opacity: 0;
  transition: opacity 1s;
}
.ce-toaster-slot--hot::after { opacity: 0.9; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
.ce-toaster-indicator {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #3f3a37;
  transition: background 0.3s, box-shadow 0.3s;
}
.ce-toaster-indicator--on {
  background: #f97316;
  box-shadow: 0 0 10px rgba(249,115,22,0.8);
}
/* lever track */
.ce-lever-track {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 64px;
  background: #0f0e0d;
  border-radius: 4px;
  border: 1px solid #2a2623;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}
.ce-lever-rail {
  position: relative;
  width: 4px;
  height: 100%;
  background: #000;
  border-radius: 2px;
}
.ce-lever-handle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 20px;
  background: var(--color-bg);
  border: 2px solid var(--color-glass-border);
  border-radius: 6px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  touch-action: none;
  transition: transform 0.15s;
}
.ce-lever-handle:hover { transform: translateX(-50%) scale(1.05); }
.ce-lever-handle:active { cursor: grabbing; }
.ce-lever-handle--disabled { opacity: 0.4; cursor: default; pointer-events: none; }
.ce-lever-grip { display: block; width: 14px; height: 2px; border-radius: 1px; background: var(--color-glass-border); }

.ce-toaster-hint {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.55;
  text-align: center;
  min-height: 20px;
  margin: 0;
}

/* ── Stage 3: Reveal ──────────────────────────────────────────────── */
.ce-reveal-icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
}
.ce-reveal-card {
  width: 100%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}
.ce-reveal-item { display: flex; align-items: flex-start; gap: 16px; }
.ce-reveal-num {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--color-text);
  color: var(--color-bg);
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.75;
}
.ce-reveal-head { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.7; margin: 0 0 6px; }
.ce-reveal-body { font-size: 13px; opacity: 0.55; line-height: 1.6; margin: 0; }

/* ── Footer ───────────────────────────────────────────────────────── */
.ce-footer {
  padding: 16px;
  text-align: center;
  border-top: 1px solid var(--color-glass-border);
  flex-shrink: 0;
}
.ce-footer-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.3;
  margin: 0;
}

/* ── Transition ───────────────────────────────────────────────────── */
.ce-fade-enter-active, .ce-fade-leave-active { transition: opacity 0.25s ease; }
.ce-fade-enter-from,  .ce-fade-leave-to      { opacity: 0; }
</style>
