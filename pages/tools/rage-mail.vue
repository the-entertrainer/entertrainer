<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

// ── State ──────────────────────────────────────────────────────────────────
type Phase = 'compose' | 'analyzing' | 'results'

const phase  = ref<Phase>('compose')
const body   = ref('')
const error  = ref('')
const copied = ref(false)

interface RawResult {
  aggressiveness: number
  sarcasm:        number
  offensiveness:  number
  rageTaunt:      string
  rageVerdict:    string
}

const raw = ref<RawResult | null>(null)

// ── Rage Complexity Score ──────────────────────────────────────────────────
// Linear weights: π-inspired (aggressiveness), e-inspired (sarcasm), prime (offensiveness)
// Complexity multiplier: 1 + (A/100 × S/100 × O/100) — rewards multi-dimensional rage
const W_AGGR = 3_141
const W_SARC = 2_718
const W_OFF  = 2_981
const MAX_SCORE = 100 * (W_AGGR + W_SARC + W_OFF) * 2  // 1,768,000

const rageScore = computed(() => {
  if (!raw.value) return 0
  const { aggressiveness: a, sarcasm: s, offensiveness: o } = raw.value
  const linear  = a * W_AGGR + s * W_SARC + o * W_OFF
  const synergy = (a / 100) * (s / 100) * (o / 100)
  return Math.round(linear * (1 + synergy))
})

// ── Rage level thresholds ──────────────────────────────────────────────────
const RAGE_THRESHOLDS = [
  { below: 0.15, label: 'Mildly Miffed'    },
  { below: 0.30, label: 'Properly Peeved'  },
  { below: 0.50, label: 'Simmering Fury'   },
  { below: 0.65, label: 'Full Rage Mode'   },
  { below: 0.80, label: 'Red Mist Rising'  },
  { below: 0.95, label: 'Nuclear Meltdown' },
]

const rageLevel = computed(() => {
  if (!raw.value) return ''
  const ratio = rageScore.value / MAX_SCORE
  return RAGE_THRESHOLDS.find(t => ratio < t.below)?.label ?? 'LEGENDARY RAGE'
})

function fmt(n: number) { return n.toLocaleString() }

// ── Personal best ──────────────────────────────────────────────────────────
interface PersonalBest { score: number; level: string }

const personalBest = ref<PersonalBest | null>(null)
const isNewRecord  = ref(false)

onMounted(() => {
  try {
    const stored = localStorage.getItem('rm-personal-best')
    if (stored) personalBest.value = JSON.parse(stored)
  } catch {}
})

function updatePersonalBest() {
  const s = rageScore.value
  if (!personalBest.value || s > personalBest.value.score) {
    isNewRecord.value = true
    const pb: PersonalBest = { score: s, level: rageLevel.value }
    personalBest.value = pb
    try { localStorage.setItem('rm-personal-best', JSON.stringify(pb)) } catch {}
  } else {
    isNewRecord.value = false
  }
}

// ── Validation ─────────────────────────────────────────────────────────────
const canSubmit = computed(() => body.value.trim().length > 0)

// ── Submit ─────────────────────────────────────────────────────────────────
async function send() {
  if (!canSubmit.value) return
  error.value = ''
  raw.value   = null
  phase.value = 'analyzing'

  try {
    const [result] = await Promise.all([
      $fetch<RawResult>('/api/rage-mail', {
        method: 'POST',
        body: { body: body.value.trim() }
      }),
      new Promise<void>(r => setTimeout(r, 1500))
    ])
    raw.value   = result
    phase.value = 'results'
    nextTick(() => { updatePersonalBest(); startCountUp() })
  } catch (e: any) {
    error.value  = e?.data?.message ?? 'Something went wrong. Please try again.'
    phase.value  = 'compose'
  }
}

// ── Count-up animation ─────────────────────────────────────────────────────
const displayScore = ref(0)

function animateValue(setter: (v: number) => void, target: number, duration: number, delay = 0) {
  setTimeout(() => {
    const start = performance.now()
    function step(now: number) {
      const t    = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setter(Math.round(ease * target))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, delay)
}

function startCountUp() {
  displayScore.value = 0
  animateValue(v => { displayScore.value = v }, rageScore.value, 1200, 100)
}

// ── Reset ──────────────────────────────────────────────────────────────────
function reset() {
  phase.value = 'compose'
  body.value  = ''
  error.value = ''
  raw.value   = null
}

// ── Share ──────────────────────────────────────────────────────────────────
async function shareResult() {
  const text = `I just scored ${fmt(rageScore.value)} on the Rage Complexity Index — ${rageLevel.value}. Beat me: entertrainer.com/tools/rage-mail`
  if (navigator.share) {
    try { await navigator.share({ title: 'Rage Mail', text }) } catch {}
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>

<template>
  <div class="rm-page">

    <!-- ── COMPOSE ─────────────────────────────────────────────────────── -->
    <Transition name="fade" mode="out-in">
      <div v-if="phase === 'compose'" key="compose" class="rm-compose">
        <h1 class="rm-title">Rage Mail</h1>
        <p class="rm-subtitle">Type the email you were never allowed to send.</p>

        <Transition name="fade">
          <div v-if="personalBest" class="rm-personal-best">
            <span class="rm-pb-label">YOUR BEST</span>
            <span class="rm-pb-score">{{ fmt(personalBest.score) }}</span>
            <span class="rm-pb-level">· {{ personalBest.level }}</span>
          </div>
        </Transition>

        <div class="rm-email-card">
          <div class="rm-email-header">
            <div class="rm-dot rm-dot--red" />
            <div class="rm-dot rm-dot--yellow" />
            <div class="rm-dot rm-dot--green" />
            <span class="rm-email-app-label">New Message</span>
          </div>

          <div class="rm-email-body-wrap">
            <textarea
              v-model="body"
              class="rm-body-textarea"
              placeholder="Dear [name], I have been silent long enough and I think it's time you understand exactly what I think about the way you…"
              rows="10"
              autofocus
            />
          </div>

          <div class="rm-email-footer">
            <button class="rm-send-btn" :disabled="!canSubmit" @click="send">
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
      <div v-if="phase === 'results' && raw" key="results" class="rm-results-wrap">

        <Transition name="fade">
          <div v-if="isNewRecord" class="rm-new-record">NEW RECORD</div>
        </Transition>

        <div class="rm-result-card">
          <!-- Score -->
          <div class="rm-score-section">
            <span class="rm-score-label">RAGE COMPLEXITY INDEX</span>
            <span class="rm-score-number">{{ fmt(displayScore) }}</span>
            <span class="rm-rage-level">{{ rageLevel }}</span>
          </div>

          <!-- Verdict — hero element -->
          <div class="rm-verdict">
            <div class="rm-verdict-header">RAGE VERDICT</div>
            <p class="rm-verdict-text">{{ raw.rageVerdict }}</p>
          </div>

          <!-- Taunt -->
          <p class="rm-taunt">{{ raw.rageTaunt }}</p>

          <!-- Bar breakdown -->
          <div class="rm-breakdown">
            <div class="rm-breakdown-title">BREAKDOWN</div>
            <div class="rm-bar-row">
              <span class="rm-bar-key">AGGRESSIVENESS</span>
              <div class="rm-bar-track">
                <div class="rm-bar-fill" :style="{ width: raw.aggressiveness + '%' }" />
              </div>
              <span class="rm-bar-val">{{ raw.aggressiveness }}</span>
            </div>
            <div class="rm-bar-row">
              <span class="rm-bar-key">SARCASM</span>
              <div class="rm-bar-track">
                <div class="rm-bar-fill" :style="{ width: raw.sarcasm + '%' }" />
              </div>
              <span class="rm-bar-val">{{ raw.sarcasm }}</span>
            </div>
            <div class="rm-bar-row">
              <span class="rm-bar-key">OFFENSIVENESS</span>
              <div class="rm-bar-track">
                <div class="rm-bar-fill" :style="{ width: raw.offensiveness + '%' }" />
              </div>
              <span class="rm-bar-val">{{ raw.offensiveness }}</span>
            </div>
          </div>

          <div class="rm-watermark">entertrainer.com · Rage Mail</div>
        </div>

        <p v-if="rageScore < MAX_SCORE * 0.95" class="rm-cta">
          Can you hit <strong>LEGENDARY RAGE</strong>?
        </p>

        <div class="rm-actions">
          <button class="rm-share-btn" @click="shareResult">
            {{ copied ? 'Copied!' : 'Share Score' }}
          </button>
          <button class="rm-reset-btn" @click="reset">
            {{ rageScore >= MAX_SCORE * 0.95 ? 'Write another' : 'Try Again →' }}
          </button>
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
  margin-bottom: 24rem;
  font-weight: 500;
}

/* Personal best pill */
.rm-personal-best {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  padding: 8rem 14rem;
  border-radius: var(--radius-full);
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  margin-bottom: 28rem;
}
.rm-pb-label {
  font-size: 9rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.4;
}
.rm-pb-score {
  font-size: 13rem;
  font-weight: 800;
  color: #FF9500;
}
.rm-pb-level {
  font-size: 12rem;
  font-weight: 500;
  opacity: 0.55;
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
  animation: fillMeter 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards,
             shakeMeter 0.12s ease-in-out 1.1s infinite alternate;
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
  animation: spark calc(0.6s + var(--i) * 0.15s) ease-out calc(0.9s + var(--i) * 0.08s) infinite;
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

/* NEW RECORD badge */
.rm-new-record {
  display: inline-block;
  padding: 6rem 16rem;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #FF3B3B, #FF9500);
  color: #fff;
  font-size: 10rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  animation: recordPulse 0.6s ease-out;
}
@keyframes recordPulse {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity: 1; }
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
.rm-result-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3rem;
  background: linear-gradient(90deg, #FF3B3B, #FF9500);
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

/* Verdict — hero */
.rm-verdict {
  background: color-mix(in srgb, #FF3B3B 8%, transparent);
  border: 1px solid color-mix(in srgb, #FF3B3B 20%, transparent);
  border-radius: 14rem;
  padding: 20rem 22rem;
  display: flex;
  flex-direction: column;
  gap: 10rem;
}
.rm-verdict-header {
  font-size: 9rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #FF3B3B;
  opacity: 0.7;
}
.rm-verdict-text {
  font-size: 15rem;
  line-height: 1.65;
  opacity: 0.9;
  font-style: italic;
  margin: 0;
}

/* Taunt */
.rm-taunt {
  font-size: 15rem;
  line-height: 1.55;
  opacity: 0.7;
  font-style: italic;
  border-left: 2px solid #FF3B3B;
  padding-left: 14rem;
  margin: 0;
}

/* Bar breakdown */
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
.rm-bar-row {
  display: grid;
  grid-template-columns: 110rem 1fr 28rem;
  align-items: center;
  gap: 10rem;
}
.rm-bar-key {
  font-size: 9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.45;
  white-space: nowrap;
}
.rm-bar-track {
  height: 6rem;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
  overflow: hidden;
}
.rm-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, #FF9500, #FF3B3B);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.rm-bar-val {
  font-size: 11rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
  text-align: right;
}

/* Watermark */
.rm-watermark {
  font-size: 10rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  opacity: 0.25;
  text-transform: uppercase;
  margin-top: -8rem;
}

/* Competitive CTA */
.rm-cta {
  font-size: 14rem;
  opacity: 0.55;
  font-weight: 500;
  margin: 0;
}
.rm-cta strong {
  color: #FF9500;
  font-weight: 700;
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
.rm-share-btn:active { transform: scale(0.96); }

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
