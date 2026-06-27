<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScoringVector { ati?: number; sgi?: number; rbi?: number }
interface QuestionOption { label: string; desc: string; scores: ScoringVector }
interface Question { prompt: string; domain: string; options: QuestionOption[] }

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    domain: 'Chromatic Resonance',
    prompt: 'What colour is the energy moving through you right now?',
    options: [
      { label: 'Saffron · Gold',   desc: 'Warm, bright, searching upward',           scores: { sgi: -1 } },
      { label: 'Deep Blue',        desc: 'Still, vast, pulled inward',                scores: { ati: -1, rbi: 1 } },
      { label: 'Charcoal Grey',    desc: 'Muted, shielded, held back',                scores: { rbi: -2, sgi: 1 } },
      { label: 'Crimson Red',      desc: 'Urgent, kinetic, heat at the surface',      scores: { ati: 2, sgi: 1 } },
    ],
  },
  {
    domain: 'Sanctuary Geometry',
    prompt: 'Where would you go if you needed to feel safe right now?',
    options: [
      { label: 'An Overgrown Garden',    desc: 'Tangled green, cool air, alive',           scores: { ati: -2, sgi: 1, rbi: 1 } },
      { label: 'A Glass Pavilion',       desc: 'Perfect symmetry, transparent walls',      scores: { ati: 1, sgi: -1, rbi: -1 } },
      { label: 'A Deep Stone Cave',      desc: 'Quiet, sealed, held by the earth',         scores: { sgi: 2, rbi: -2, ati: -1 } },
      { label: 'A Mountaintop at Night', desc: 'Open, vast, above everything',             scores: { sgi: -2 } },
    ],
  },
  {
    domain: 'Somatic Texture',
    prompt: 'If your mind had a texture today, what would your hand feel?',
    options: [
      { label: 'Warm, Polished Wood',    desc: 'Smooth and living, faintly warm',          scores: { rbi: 2, sgi: 1, ati: -1 } },
      { label: 'Cool, Flawless Ceramic', desc: 'Precise, sealed, no edges',                scores: { sgi: -1, rbi: -1, ati: -1 } },
      { label: 'Rough Volcanic Rock',    desc: 'Ancient, heavy, real under pressure',      scores: { sgi: 2, ati: 1 } },
      { label: 'Heavy, Enveloping Velvet', desc: 'Dark, soft, folding around you',         scores: { ati: -2, sgi: 1, rbi: 1 } },
    ],
  },
  {
    domain: 'Auditory Alignment',
    prompt: 'Which sound would make you feel most understood right now?',
    options: [
      { label: 'Rustling Dry Leaves',    desc: 'Nearby, gentle, almost a whisper',         scores: { sgi: 1, rbi: 1 } },
      { label: 'A Distant Solitary Bird', desc: 'Far away, singular, unreachable',         scores: { sgi: -1, rbi: -1 } },
      { label: 'A Heavy Waterfall',      desc: 'Continuous, masking, consuming',            scores: { sgi: 1, ati: -1 } },
      { label: 'Absolute Silence',       desc: 'Total stillness — nothing at all',         scores: { ati: -2, rbi: -2 } },
    ],
  },
  {
    domain: 'Water Vector',
    prompt: 'Which water speaks most clearly to where you are?',
    options: [
      { label: 'A Raging Rapid River',   desc: 'Churning, relentless, demanding',          scores: { ati: 2, sgi: 1 } },
      { label: 'A Deep, Placid Lake',    desc: 'Still surface, unknown depths',            scores: { sgi: 1, rbi: -1 } },
      { label: 'Gentle, Steady Rain',    desc: 'Soft, persistent, washing slowly',         scores: { rbi: 1, ati: -1, sgi: -1 } },
      { label: 'Dense, Suspended Fog',   desc: 'Blurred edges, muffled, drifting',         scores: { ati: 1, sgi: -1, rbi: -1 } },
    ],
  },
  {
    domain: 'Luminous Quality',
    prompt: 'What quality of light are you living inside right now?',
    options: [
      { label: 'Harsh Midday Sun',       desc: 'Exposed, merciless, no shadows',           scores: { ati: 2 } },
      { label: 'Fading Dusk',            desc: 'Amber, soft, already passing',             scores: { ati: -1, sgi: 1, rbi: 1 } },
      { label: 'Sterile Neon Glow',      desc: 'Cold, artificial, humming quietly',        scores: { ati: 1, sgi: -2, rbi: -1 } },
      { label: 'A Single Candle',        desc: 'Small, flickering, a warm circle',         scores: { ati: -1, sgi: 1, rbi: 2 } },
    ],
  },
  {
    domain: 'Path Vector',
    prompt: 'What does the path in front of you look like?',
    options: [
      { label: 'A Straight Paved Highway', desc: 'Clear, fast, relentless forward',        scores: { ati: 1, sgi: -1 } },
      { label: 'A Winding Forest Trail',   desc: 'Curious, shaded, revealing slowly',      scores: { ati: -1, sgi: 2, rbi: 1 } },
      { label: 'An Intricate Labyrinth',   desc: 'Dense, turning, no clear exit',          scores: { rbi: -2 } },
      { label: 'An Open, Pathless Desert', desc: 'Boundless, empty, chosen alone',         scores: { sgi: -2, rbi: -1 } },
    ],
  },
  {
    domain: 'Chronos',
    prompt: 'How is time moving through your body today?',
    options: [
      { label: 'Slipping Violently Away', desc: 'Escaping, never enough, panicking',       scores: { ati: 2, rbi: -1 } },
      { label: 'Frozen in Ice',           desc: 'Stuck, dense, impossible to move',        scores: { ati: -2, rbi: -2, sgi: 1 } },
      { label: 'Moving in Slow Ripples',  desc: 'Heavy, manageable, finding rhythm',       scores: { ati: -1, sgi: 1 } },
      { label: 'Irrelevant — Outside It', desc: 'Floating free, untethered, gone',         scores: { sgi: -2 } },
    ],
  },
  {
    domain: 'Mind Space Architecture',
    prompt: 'If your inner world were a building, what would you find?',
    options: [
      { label: 'A Swaying Skyscraper',   desc: 'High, exposed, slightly trembling',        scores: { ati: 2, sgi: -1 } },
      { label: 'A Crumbling Ruin',       desc: 'Beautiful once, slowly falling',           scores: { ati: -2, sgi: 1, rbi: -1 } },
      { label: 'A Fire-lit Cabin',       desc: 'Small, warm, safe at the core',            scores: { ati: -1, sgi: 2, rbi: 2 } },
      { label: 'A Blank White Room',     desc: 'Empty, infinite, without edges',           scores: { sgi: -2, rbi: -2 } },
    ],
  },
  {
    domain: 'Atmospheric Weight',
    prompt: 'What is the atmosphere pressing against you right now?',
    options: [
      { label: 'Crushing and Dense',     desc: 'Heavy, compressing, hard to breathe',      scores: { ati: 2, sgi: 2, rbi: -2 } },
      { label: 'Electric and Vibrating', desc: 'Charged, live, anticipating',              scores: { ati: 2 } },
      { label: 'Light and Breathable',   desc: 'Open, clear, almost floating',             scores: { ati: -1, sgi: 1, rbi: 1 } },
      { label: 'Thin and Cold',          desc: 'Empty, distant, no one near',              scores: { sgi: -1, rbi: -2 } },
    ],
  },
]

const DISCLAIMER = `This platform generates a highly customised, poetic simulation based on projective sensory preferences. It operates as an artistic mirror for emotional reflection and self-alignment — a strange and dreamy hallucination that should not be considered an alternative for proper medical or psychological assistance. If you are experiencing distress, please connect with a licensed practitioner or a support network immediately.`

// ─── State ────────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'question' | 'loading' | 'result'

const phase     = ref<Phase>('intro')
const currentQ  = ref(0)
const ati       = ref(0)
const sgi       = ref(0)
const rbi       = ref(0)
const narrative = ref('')
const choosing  = ref(false)   // blocks double-tap

// ─── Flow ─────────────────────────────────────────────────────────────────────
function begin() {
  currentQ.value  = 0
  ati.value       = 0
  sgi.value       = 0
  rbi.value       = 0
  narrative.value = ''
  phase.value     = 'question'
}

async function selectOption(opt: QuestionOption) {
  if (choosing.value) return
  choosing.value = true

  ati.value += opt.scores.ati ?? 0
  sgi.value += opt.scores.sgi ?? 0
  rbi.value += opt.scores.rbi ?? 0

  await new Promise(r => setTimeout(r, 280))

  if (currentQ.value < QUESTIONS.length - 1) {
    currentQ.value++
    choosing.value = false
  } else {
    phase.value    = 'loading'
    choosing.value = false
    await callUniverse()
  }
}

async function callUniverse() {
  try {
    const data = await $fetch<any>('/api/youniverse', {
      method: 'POST',
      body: { ati: ati.value, sgi: sgi.value, rbi: rbi.value }
    })
    narrative.value = data.narrative
  } catch (e: any) {
    if (e?.response?.status === 429 || e?.data?.statusCode === 429) {
      narrative.value = `There is a great deal of seeking happening in this space right now — more than the universe can hold all at once. Step away for a few minutes. The mirror will still be here.`
    } else {
      narrative.value = `There is something in the air around you today that resists being named simply. A particular kind of fullness — not the kind that nourishes, but the kind that accumulates without being chosen.\n\nFind a surface near you and press your palms flat against it. A table, a floor, a wall. Feel it push back. That small, certain pressure is the world confirming that it is still here, and so are you.`
    }
  }
  phase.value = 'result'
}

function restart() {
  phase.value = 'intro'
}

// Format narrative into paragraphs for display
const paragraphs = computed(() =>
  narrative.value.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
)
</script>

<template>
  <div class="detail-page yu-page">
    <Transition name="fade" mode="out-in">

      <!-- ── Intro ──────────────────────────────────────────────── -->
      <div v-if="phase === 'intro'" key="intro" class="yu-intro">
        <div class="yu-intro-eyebrow">YOUniverse</div>
        <h1 class="yu-intro-title">What are you carrying today?</h1>
        <div class="yu-intro-body">
          <p>What you carry today has a shape. A weight. A texture that words rarely touch.</p>
          <p>YOUniverse doesn't ask you to explain yourself. It listens to what you reach for when language fails — the images, the sounds, the quality of light that feels most like where you are.</p>
          <p>Ten moments. No right answers. Only what resonates.</p>
        </div>
        <button class="yu-enter" @click="begin">Enter</button>
        <p class="yu-intro-disclaimer">{{ DISCLAIMER }}</p>
      </div>

      <!-- ── Question ──────────────────────────────────────────── -->
      <div v-else-if="phase === 'question'" key="question" class="yu-question-wrap">
        <div class="yu-progress-bar">
          <div class="yu-progress-fill" :style="{ width: `${((currentQ) / QUESTIONS.length) * 100}%` }" />
        </div>

        <Transition name="qslide" mode="out-in">
          <div :key="currentQ" class="yu-question">
            <div class="yu-q-meta">
              <span class="yu-q-domain">{{ QUESTIONS[currentQ].domain }}</span>
              <span class="yu-q-counter">{{ currentQ + 1 }} / {{ QUESTIONS.length }}</span>
            </div>
            <h2 class="yu-q-prompt">{{ QUESTIONS[currentQ].prompt }}</h2>
            <div class="yu-options">
              <button
                v-for="opt in QUESTIONS[currentQ].options"
                :key="opt.label"
                class="yu-option"
                :disabled="choosing"
                @click="selectOption(opt)"
              >
                <span class="yu-opt-label">{{ opt.label }}</span>
                <span class="yu-opt-desc">{{ opt.desc }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ── Loading ───────────────────────────────────────────── -->
      <div v-else-if="phase === 'loading'" key="loading" class="yu-loading">
        <div class="yu-breathe" />
        <p class="yu-loading-text">The universe is listening…</p>
      </div>

      <!-- ── Result ────────────────────────────────────────────── -->
      <div v-else key="result" class="yu-result">
        <div class="yu-result-header">
          <span class="yu-result-eyebrow">YOUniverse</span>
        </div>

        <div class="yu-narrative">
          <p v-for="(para, i) in paragraphs" :key="i" class="yu-para">{{ para }}</p>
        </div>

        <div class="yu-result-footer">
          <div class="yu-divider" />
          <p class="yu-disclaimer-text">{{ DISCLAIMER }}</p>
          <button class="yu-restart" @click="restart">Listen again today</button>
        </div>
      </div>

    </Transition>
  </div>
</template>

<style scoped>
.yu-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--page-top) var(--grid-margin) calc(80rem + var(--safe-bottom));
}

/* ── Intro ── */
.yu-intro {
  max-width: 560rem;
  padding-top: 32rem;
}

.yu-intro-eyebrow {
  font-size: var(--text-label);
  font-weight: 700;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.3;
  margin-bottom: 16rem;
}

.yu-intro-title {
  font-size: clamp(28rem, 5vw, 44rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 32rem;
}

.yu-intro-body {
  display: flex;
  flex-direction: column;
  gap: 16rem;
  margin-bottom: 40rem;
}
.yu-intro-body p {
  font-size: var(--text-body);
  line-height: 1.7;
  opacity: 0.65;
  margin: 0;
}

.yu-enter {
  display: inline-block;
  padding: 14rem 40rem;
  border: 1px solid var(--color-text);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: 15rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  margin-bottom: 40rem;
}
.yu-enter:hover {
  background: var(--color-text);
  color: var(--color-bg);
}

.yu-intro-disclaimer {
  font-size: 11rem;
  line-height: 1.6;
  opacity: 0.25;
  max-width: 500rem;
  margin: 0;
  font-style: italic;
}

/* ── Progress bar ── */
.yu-question-wrap {
  max-width: 640rem;
  padding-top: 8rem;
}

.yu-progress-bar {
  width: 100%;
  height: 2px;
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
  border-radius: 2px;
  margin-bottom: 48rem;
  overflow: hidden;
}
.yu-progress-fill {
  height: 100%;
  background: var(--color-text);
  border-radius: 2px;
  transition: width 0.4s ease;
  opacity: 0.5;
}

/* ── Question ── */
.yu-question {
  display: flex;
  flex-direction: column;
  gap: 28rem;
}

.yu-q-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rem;
}

.yu-q-domain {
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.3;
}

.yu-q-counter {
  font-size: var(--text-label);
  font-weight: 500;
  letter-spacing: 0.04em;
  opacity: 0.25;
}

.yu-q-prompt {
  font-size: clamp(20rem, 3.5vw, 30rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.25;
  margin: 0;
}

.yu-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10rem;
}

@media (max-width: 520px) {
  .yu-options { grid-template-columns: 1fr; }
}

.yu-option {
  display: flex;
  flex-direction: column;
  gap: 6rem;
  padding: 18rem 16rem;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 14rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.yu-option:hover:not(:disabled) {
  background: var(--color-glass-bg-hover);
  border-color: var(--color-glass-border-hover);
}
.yu-option:active:not(:disabled) { transform: scale(0.98); }
.yu-option:disabled { opacity: 0.5; cursor: default; }

.yu-opt-label {
  font-size: 14rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text);
}
.yu-opt-desc {
  font-size: 12rem;
  line-height: 1.45;
  opacity: 0.45;
  color: var(--color-text);
}

/* ── Loading ── */
.yu-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rem;
  min-height: 50dvh;
}

.yu-breathe {
  width: 56rem;
  height: 56rem;
  border-radius: 50%;
  background: transparent;
  border: 1.5px solid var(--color-text);
  opacity: 0.35;
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(0.75); opacity: 0.2; }
  50%       { transform: scale(1.35); opacity: 0.55; }
}

.yu-loading-text {
  font-size: var(--text-sm);
  opacity: 0.35;
  letter-spacing: 0.04em;
  font-style: italic;
  margin: 0;
}

/* ── Result ── */
.yu-result {
  max-width: 600rem;
  padding-top: 16rem;
}

.yu-result-header {
  margin-bottom: 40rem;
}

.yu-result-eyebrow {
  font-size: var(--text-label);
  font-weight: 700;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.25;
}

.yu-narrative {
  display: flex;
  flex-direction: column;
  gap: 24rem;
  margin-bottom: 56rem;
}

.yu-para {
  font-size: clamp(16rem, 2.2vw, 19rem);
  line-height: 1.78;
  margin: 0;
  opacity: 0.85;
  letter-spacing: -0.005em;
}

.yu-result-footer {
  display: flex;
  flex-direction: column;
  gap: 20rem;
}

.yu-divider {
  width: 48rem;
  height: 1px;
  background: var(--color-text);
  opacity: 0.15;
}

.yu-disclaimer-text {
  font-size: 11rem;
  line-height: 1.65;
  opacity: 0.22;
  margin: 0;
  font-style: italic;
  max-width: 480rem;
}

.yu-restart {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  opacity: 0.3;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
  letter-spacing: 0.01em;
}
.yu-restart:hover { opacity: 0.7; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.28s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.qslide-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.qslide-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.qslide-enter-from   { opacity: 0; transform: translateY(16rem); }
.qslide-leave-to     { opacity: 0; transform: translateY(-12rem); }
</style>
