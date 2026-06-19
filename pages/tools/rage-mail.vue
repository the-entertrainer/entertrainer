<script setup lang="ts">
import { toPng } from 'html-to-image'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

// ── State ──────────────────────────────────────────────────────────────────
type Phase = 'compose' | 'analyzing' | 'results'

const phase   = ref<Phase>('compose')
const to      = ref('')
const body    = ref('')
const error   = ref('')
const sharing = ref(false)

interface RawResult {
  aggressiveness: number
  sarcasm: number
  offensiveness: number
  rageTaunt: string
  imaginaryReply: string
}

const raw = ref<RawResult | null>(null)

// ── Benchmark conversion ───────────────────────────────────────────────────
const WEIGHTS    = { aggressiveness: 7_124, sarcasm: 4_893, offensiveness: 6_541 }
const MAX_SCORE  = 100 * (WEIGHTS.aggressiveness + WEIGHTS.sarcasm + WEIGHTS.offensiveness)

const RAGE_THRESHOLDS = [
  { below: 0.15, label: 'Mildly Miffed' },
  { below: 0.30, label: 'Properly Peeved' },
  { below: 0.50, label: 'Simmering Fury' },
  { below: 0.65, label: 'Full Rage Mode' },
  { below: 0.80, label: 'Red Mist Rising' },
  { below: 0.95, label: 'Nuclear Meltdown' },
]

const bench = computed(() => {
  if (!raw.value) return null
  const aggr = Math.round(raw.value.aggressiveness * WEIGHTS.aggressiveness)
  const sarc = Math.round(raw.value.sarcasm        * WEIGHTS.sarcasm)
  const off  = Math.round(raw.value.offensiveness  * WEIGHTS.offensiveness)
  return { aggr, sarc, off, total: aggr + sarc + off }
})

const rageLevel = computed(() => {
  if (!bench.value) return ''
  const ratio = bench.value.total / MAX_SCORE
  return RAGE_THRESHOLDS.find(t => ratio < t.below)?.label ?? 'LEGENDARY RAGE'
})

// ── Validation ─────────────────────────────────────────────────────────────
const emailRe   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const canSubmit = computed(() =>
  to.value.trim().length > 0 &&
  emailRe.test(to.value.trim()) &&
  body.value.trim().length > 0
)

// ── Submit ─────────────────────────────────────────────────────────────────
async function send() {
  if (!canSubmit.value) return
  error.value  = ''
  raw.value    = null
  phase.value  = 'analyzing'

  try {
    const [result] = await Promise.all([
      $fetch<RawResult>('/api/rage-mail', {
        method: 'POST',
        body: { to: to.value.trim(), body: body.value.trim() }
      }),
      new Promise<void>(r => setTimeout(r, 2800))
    ])
    raw.value   = result
    phase.value = 'results'
    nextTick(startCountUp)
  } catch (e: any) {
    error.value  = e?.data?.message ?? e?.data?.statusMessage ?? e?.message ?? 'Something went wrong. Please try again.'
    phase.value  = 'compose'
  }
}

// ── Count-up animation ─────────────────────────────────────────────────────
const displayTotal = ref(0)
const displayAggr  = ref(0)
const displaySarc  = ref(0)
const displayOff   = ref(0)

function animateValue(
  setter: (v: number) => void,
  target: number,
  duration: number,
  delay = 0
) {
  setTimeout(() => {
    const start = performance.now()
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setter(Math.round(ease * target))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, delay)
}

function startCountUp() {
  if (!bench.value) return
  displayTotal.value = 0
  displayAggr.value  = 0
  displaySarc.value  = 0
  displayOff.value   = 0
  animateValue(v => { displayTotal.value = v }, bench.value.total, 1400, 100)
  animateValue(v => { displayAggr.value  = v }, bench.value.aggr,  900,  600)
  animateValue(v => { displaySarc.value  = v }, bench.value.sarc,  900,  750)
  animateValue(v => { displayOff.value   = v }, bench.value.off,   900,  900)
}

function fmt(n: number) { return n.toLocaleString() }

// ── Reset ──────────────────────────────────────────────────────────────────
function reset() {
  phase.value = 'compose'
  to.value    = ''
  body.value  = ''
  error.value = ''
  raw.value   = null
}

// ── Share ──────────────────────────────────────────────────────────────────
async function shareResult() {
  const node = document.getElementById('rage-result-card')
  if (!node || !bench.value || sharing.value) return
  sharing.value = true
  try {
    const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
    const blob    = await (await fetch(dataUrl)).blob()
    const file    = new File([blob], 'rage-score.png', { type: 'image/png' })
    const text    = `I scored ${fmt(bench.value!.total)} on the Rage Benchmark 🔥 #RageMail`

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'My Rage Benchmark', text })
    } else {
      const a  = document.createElement('a')
      a.href   = dataUrl
      a.download = 'rage-score.png'
      a.click()
    }
  } catch (e) {
    // User cancelled share or download failed — silent
  } finally {
    sharing.value = false
  }
}
</script>

<template>
  <div class="rm-page">

    <!-- ── COMPOSE ─────────────────────────────────────────────────────── -->
    <Transition name="fade" mode="out-in">
      <div v-if="phase === 'compose'" key="compose" class="rm-compose">
        <h1 class="rm-title">Rage Mail</h1>
        <p class="rm-subtitle">Type the email you were never allowed to send.</p>

        <div class="rm-email-card">
          <!-- Header bar -->
          <div class="rm-email-header">
            <div class="rm-dot rm-dot--red" />
            <div class="rm-dot rm-dot--yellow" />
            <div class="rm-dot rm-dot--green" />
            <span class="rm-email-app-label">New Message</span>
          </div>

          <div class="rm-email-body-wrap">
            <div class="rm-field-row">
              <label class="rm-field-label" for="rm-to">To</label>
              <input
                id="rm-to"
                v-model="to"
                class="rm-field-input"
                type="email"
                placeholder="their@email.com"
                autocomplete="off"
              />
            </div>
            <div class="rm-divider" />
            <textarea
              v-model="body"
              class="rm-body-textarea"
              placeholder="Dear [name], I hope this email finds you on fire…"
              rows="9"
            />
          </div>

          <div class="rm-email-footer">
            <button
              class="rm-send-btn"
              :disabled="!canSubmit"
              @click="send"
            >
              SEND IT →
            </button>
          </div>
        </div>

        <Transition name="fade">
          <p v-if="error" class="rm-error">{{ error }}</p>
        </Transition>
      </div>
    </Transition>

    <!-- ── ANALYZING ───────────────────────────────────────────────────── -->
    <Transition name="fade" mode="out-in">
      <div v-if="phase === 'analyzing'" key="analyzing" class="rm-analyzing">
        <p class="rm-analyzing-label">ANALYSING YOUR FURY</p>
        <div class="rm-meter-wrap">
          <div class="rm-meter-bar">
            <div class="rm-meter-fill" />
          </div>
          <div class="rm-meter-sparks">
            <span v-for="i in 6" :key="i" class="rm-spark" :style="{ '--i': i }" />
          </div>
        </div>
        <p class="rm-analyzing-sub">Calibrating aggression levels…</p>
      </div>
    </Transition>

    <!-- ── RESULTS ─────────────────────────────────────────────────────── -->
    <Transition name="slide-up" mode="out-in">
      <div v-if="phase === 'results' && raw && bench" key="results" class="rm-results-wrap">

        <!-- Captured card -->
        <div id="rage-result-card" class="rm-result-card">
          <!-- Watermark -->
          <div class="rm-watermark">entertrainer.com · Rage Mail</div>

          <!-- Score -->
          <div class="rm-score-section">
            <span class="rm-score-label">RAGE BENCHMARK</span>
            <span class="rm-score-number">{{ fmt(displayTotal) }}</span>
            <span class="rm-rage-level">{{ rageLevel }}</span>
          </div>

          <p class="rm-taunt">{{ raw.rageTaunt }}</p>

          <!-- Breakdown -->
          <div class="rm-breakdown">
            <div class="rm-breakdown-title">BREAKDOWN</div>
            <div class="rm-breakdown-row">
              <span class="rm-breakdown-key">AGGRESSIVENESS</span>
              <span class="rm-breakdown-val">{{ fmt(displayAggr) }}</span>
            </div>
            <div class="rm-breakdown-row">
              <span class="rm-breakdown-key">SARCASM</span>
              <span class="rm-breakdown-val">{{ fmt(displaySarc) }}</span>
            </div>
            <div class="rm-breakdown-row">
              <span class="rm-breakdown-key">OFFENSIVENESS</span>
              <span class="rm-breakdown-val">{{ fmt(displayOff) }}</span>
            </div>
          </div>

          <!-- Imaginary reply -->
          <div class="rm-reply">
            <div class="rm-reply-header">IMAGINARY REPLY</div>
            <p class="rm-reply-text">{{ raw.imaginaryReply }}</p>
          </div>
        </div>

        <!-- Actions (outside the captured card) -->
        <div class="rm-actions">
          <button
            class="rm-share-btn"
            :disabled="sharing"
            @click="shareResult"
          >
            <span v-if="sharing">Preparing…</span>
            <span v-else>Share Score</span>
          </button>
          <button class="rm-reset-btn" @click="reset">Write another</button>
        </div>

      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────── */
.rm-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  padding: calc(var(--safe-top) + 100rem) var(--grid-margin) calc(var(--safe-bottom) + 100rem);
  display: flex;
  flex-direction: column;
}

/* ── Compose ─────────────────────────────────────────────────────── */
.rm-title {
  font-size: clamp(52rem, 8vw, 110rem);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 12rem;
}
.rm-subtitle {
  font-size: 16rem;
  opacity: 0.45;
  margin-bottom: 40rem;
  font-weight: 500;
}

/* Fake email card */
.rm-email-card {
  max-width: 620rem;
  border-radius: 16rem;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  overflow: hidden;
}
.rm-email-header {
  display: flex;
  align-items: center;
  gap: 6rem;
  padding: 14rem 18rem;
  border-bottom: 1px solid var(--color-glass-border);
}
.rm-dot {
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
}
.rm-dot--red    { background: #FF5F57; }
.rm-dot--yellow { background: #FEBC2E; }
.rm-dot--green  { background: #28C840; }
.rm-email-app-label {
  font-size: 12rem;
  font-weight: 600;
  opacity: 0.4;
  margin-left: 8rem;
  letter-spacing: 0.04em;
}

.rm-email-body-wrap { padding: 0 18rem; }

.rm-field-row {
  display: flex;
  align-items: center;
  gap: 12rem;
  padding: 14rem 0;
}
.rm-field-label {
  font-size: 12rem;
  font-weight: 700;
  opacity: 0.4;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;
  width: 24rem;
}
.rm-field-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: 15rem;
  outline: none;
}
.rm-field-input::placeholder { opacity: 0.3; }

.rm-divider {
  height: 1px;
  background: var(--color-glass-border);
  margin: 0;
}

.rm-body-textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: 15rem;
  line-height: 1.6;
  padding: 16rem 0;
  resize: none;
  outline: none;
}
.rm-body-textarea::placeholder { opacity: 0.25; }

.rm-email-footer {
  border-top: 1px solid var(--color-glass-border);
  padding: 14rem 18rem;
  display: flex;
  justify-content: flex-end;
}
.rm-send-btn {
  padding: 12rem 28rem;
  border-radius: var(--radius-full);
  background: var(--color-text);
  color: var(--color-bg);
  font-family: inherit;
  font-size: 13rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;
}
.rm-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.rm-send-btn:not(:disabled):active { transform: scale(0.95); }

.rm-error {
  margin-top: 20rem;
  font-size: 14rem;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-text) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text) 22%, transparent);
  border-radius: 10rem;
  padding: 12rem 16rem;
  max-width: 620rem;
}

/* ── Analyzing ───────────────────────────────────────────────────── */
.rm-analyzing {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28rem;
  padding: 60rem 0;
}
.rm-analyzing-label {
  font-size: 11rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.7;
}
.rm-analyzing-sub {
  font-size: 13rem;
  opacity: 0.35;
  letter-spacing: 0.04em;
}

/* Rage meter */
.rm-meter-wrap {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10rem;
}
.rm-meter-bar {
  width: 48rem;
  height: 220rem;
  border-radius: 6rem;
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
  border: 1px solid var(--color-glass-border);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.rm-meter-fill {
  width: 100%;
  height: 0%;
  border-radius: 4rem;
  background: linear-gradient(to top, #FF9500, #FF3B3B);
  animation: fillMeter 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards,
             shakeMeter 0.12s ease-in-out 2.2s infinite alternate;
}
@keyframes fillMeter {
  0%   { height: 0%; }
  60%  { height: 72%; }
  80%  { height: 88%; }
  100% { height: 100%; }
}
@keyframes shakeMeter {
  from { transform: translateX(-2rem); }
  to   { transform: translateX(2rem); }
}

/* Sparks */
.rm-meter-sparks {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.rm-spark {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: #FF9500;
  animation: spark calc(0.6s + var(--i) * 0.15s) ease-out calc(2.1s + var(--i) * 0.08s) infinite;
  transform-origin: center bottom;
}
@keyframes spark {
  0%   { transform: translateX(calc((var(--i) - 3) * 8rem)) translateY(0) scale(1); opacity: 1; }
  100% { transform: translateX(calc((var(--i) - 3) * 22rem)) translateY(-60rem) scale(0); opacity: 0; }
}

/* ── Results ─────────────────────────────────────────────────────── */
.rm-results-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24rem;
  max-width: 560rem;
}

.rm-result-card {
  width: 100%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 20rem;
  padding: 32rem 28rem;
  display: flex;
  flex-direction: column;
  gap: 24rem;
  position: relative;
  overflow: hidden;
}

/* Red accent top stripe */
.rm-result-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3rem;
  background: linear-gradient(90deg, #FF3B3B, #FF9500);
}

.rm-watermark {
  font-size: 10rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  opacity: 0.25;
  text-transform: uppercase;
  margin-bottom: -12rem;
}

/* Score */
.rm-score-section {
  display: flex;
  flex-direction: column;
  gap: 6rem;
}
.rm-score-label {
  font-size: 10rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.45;
}
.rm-score-number {
  font-size: clamp(52rem, 10vw, 88rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #FF3B3B 0%, #FF9500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.rm-rage-level {
  font-size: 13rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #FF9500;
}

.rm-taunt {
  font-size: 15rem;
  line-height: 1.55;
  opacity: 0.7;
  font-style: italic;
  border-left: 2px solid #FF3B3B;
  padding-left: 14rem;
  margin: 0;
}

/* Breakdown */
.rm-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10rem;
}
.rm-breakdown-title {
  font-size: 9rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.35;
  margin-bottom: 4rem;
}
.rm-breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rem;
}
.rm-breakdown-key {
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.55;
}
.rm-breakdown-val {
  font-size: 16rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}

/* Reply */
.rm-reply {
  background: color-mix(in srgb, var(--color-text) 5%, transparent);
  border-radius: 12rem;
  padding: 18rem 20rem;
  display: flex;
  flex-direction: column;
  gap: 10rem;
}
.rm-reply-header {
  font-size: 9rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.35;
}
.rm-reply-text {
  font-size: 14rem;
  line-height: 1.65;
  opacity: 0.8;
  margin: 0;
}

/* Action buttons */
.rm-actions {
  display: flex;
  align-items: center;
  gap: 16rem;
  flex-wrap: wrap;
}
.rm-share-btn {
  padding: 14rem 32rem;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #FF3B3B, #FF9500);
  color: #fff;
  font-family: inherit;
  font-size: 14rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;
}
.rm-share-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.rm-share-btn:not(:disabled):active { transform: scale(0.96); }

.rm-reset-btn {
  background: transparent;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: 14rem;
  font-weight: 500;
  opacity: 0.45;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3rem;
  transition: opacity 0.15s ease;
}
.rm-reset-btn:hover { opacity: 0.8; }

/* ── Transitions ─────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(16rem); }
</style>
