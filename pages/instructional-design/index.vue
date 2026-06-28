<script setup lang="ts">
definePageMeta({ layout: 'default' })

// ── State Management ────────────────────────────────────────────────────────
const phase = ref<'intro' | 'select' | 'explore' | 'constellation' | 'final'>('intro')
const selectedPillar = ref<string | null>(null)
const exploredPillars = ref<Set<string>>(new Set())
const currentQuestionIndex = ref(0)

// ── Pillar Data ────────────────────────────────────────────────────────────
interface Pillar {
  id: string
  title: string
  icon: string
  color: string
  question: string
  scenarios: {
    setup: string
    reveal: string
    insight: string
  }[]
  summary: string
}

const pillars: Pillar[] = [
  {
    id: 'clarity',
    title: 'Clarity',
    icon: '✓',
    color: '#06B6D4',
    question: 'What if your learner could understand it on the first read?',
    scenarios: [
      {
        setup: 'You receive a 47-page technical manual.',
        reveal: 'Your job: extract the 3 core ideas.',
        insight: 'Clarity isn\'t about saying less. It\'s about saying the right thing.'
      },
      {
        setup: 'A CEO needs to explain a pivot to 500 employees.',
        reveal: 'You have 90 seconds.',
        insight: 'When everything is essential, nothing is noise.'
      }
    ],
    summary: 'Every word, every icon, every interaction is stripped to its essential meaning.'
  },
  {
    id: 'sequence',
    title: 'Sequence',
    icon: '→',
    color: '#8B5CF6',
    question: 'What if the order was the teacher?',
    scenarios: [
      {
        setup: 'Teaching someone to ride a bike.',
        reveal: 'Balance first. Pedaling second. Steering last.',
        insight: 'The sequence is the architecture. Get it wrong, and nothing else matters.'
      },
      {
        setup: 'A learner is confused about a concept.',
        reveal: 'They\'re not missing the idea. They\'re missing the step before it.',
        insight: 'Confusion is a sequencing problem in disguise.'
      }
    ],
    summary: 'The order matters. We arrange steps exactly as your brain expects them to happen.'
  },
  {
    id: 'practice',
    title: 'Practice',
    icon: '◉',
    color: '#F04E0F',
    question: 'What if learning was something you did, not something you watched?',
    scenarios: [
      {
        setup: 'Reading about swimming vs. getting in the water.',
        reveal: 'One creates understanding. One creates muscle memory.',
        insight: 'People learn by doing. Everything else is just preparation.'
      },
      {
        setup: 'A training module with no interaction.',
        reveal: 'vs. one where learners make real decisions.',
        insight: 'Practice isn\'t an add-on. It\'s the entire point.'
      }
    ],
    summary: 'People learn by doing, not reading. Every design gives them something to pull or tap.'
  },
  {
    id: 'proof',
    title: 'Proof',
    icon: '★',
    color: '#F9D020',
    question: 'How do you know it actually worked?',
    scenarios: [
      {
        setup: 'A training completes. Completion rate: 92%.',
        reveal: 'But did behavior change? Did performance improve?',
        insight: 'Completion is vanity. Change is proof.'
      },
      {
        setup: 'A learner finishes your module.',
        reveal: 'Three months later, they\'re still applying it.',
        insight: 'That\'s not a metric. That\'s a success.'
      }
    ],
    summary: 'Not completion rates. Real change in the real world. That\'s how you know it worked.'
  }
]

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => {
    phase.value = 'select'
  }, 600)
})

// ── Actions ────────────────────────────────────────────────────────────────
const selectPillar = (pillarId: string) => {
  selectedPillar.value = pillarId
  exploredPillars.value.add(pillarId)
  phase.value = 'explore'
  currentQuestionIndex.value = 0
}

const nextScenario = () => {
  const pillar = pillars.find(p => p.id === selectedPillar.value)
  if (!pillar) return

  if (currentQuestionIndex.value < pillar.scenarios.length - 1) {
    currentQuestionIndex.value++
  } else {
    // All scenarios explored for this pillar
    if (exploredPillars.value.size === pillars.length) {
      phase.value = 'final'
    } else {
      phase.value = 'constellation'
    }
  }
}

const continueTour = () => {
  phase.value = 'select'
}

const backToSelect = () => {
  selectedPillar.value = null
  phase.value = 'select'
}
</script>

<template>
  <div class="id-wrap">
    <Transition name="id-fade" mode="out-in">
      <!-- ── Intro: Atmospheric opening ── -->
      <div v-if="phase === 'intro'" key="intro" class="id-phase id-intro">
        <div class="id-intro-glow"></div>
        <div class="id-intro-content">
          <p class="id-intro-label">Understanding</p>
          <h1 class="id-intro-title">What Design Actually Means</h1>
          <p class="id-intro-hint">Tap to explore</p>
        </div>
      </div>

      <!-- ── Select: Choose your path ── -->
      <div v-else-if="phase === 'select'" key="select" class="id-phase id-select">
        <div class="id-select-header">
          <h2 class="id-select-title">The Four Pillars</h2>
          <p class="id-select-subtitle">Choose a pillar to explore</p>
        </div>

        <div class="id-pillar-grid">
          <button
            v-for="pillar in pillars"
            :key="pillar.id"
            class="id-pillar-btn"
            :class="{ 'id-pillar-btn--explored': exploredPillars.has(pillar.id) }"
            :style="{ '--pillar-color': pillar.color }"
            @click="selectPillar(pillar.id)"
          >
            <div class="id-pillar-icon">{{ pillar.icon }}</div>
            <div class="id-pillar-name">{{ pillar.title }}</div>
            <div v-if="exploredPillars.has(pillar.id)" class="id-pillar-check">✓</div>
          </button>
        </div>

        <div v-if="exploredPillars.size > 0" class="id-progress">
          <p class="id-progress-text">{{ exploredPillars.size }} of {{ pillars.length }} explored</p>
          <div class="id-progress-bar">
            <div class="id-progress-fill" :style="{ width: (exploredPillars.size / pillars.length) * 100 + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- ── Explore: Deep dive into pillar ── -->
      <div v-else-if="phase === 'explore' && selectedPillar" key="explore" class="id-phase id-explore">
        <button class="id-back-btn" @click="backToSelect">← Back</button>

        <div class="id-explore-header">
          <div class="id-explore-icon" :style="{ color: pillars.find(p => p.id === selectedPillar)?.color }">
            {{ pillars.find(p => p.id === selectedPillar)?.icon }}
          </div>
          <h2 class="id-explore-title">{{ pillars.find(p => p.id === selectedPillar)?.title }}</h2>
          <p class="id-explore-question">{{ pillars.find(p => p.id === selectedPillar)?.question }}</p>
        </div>

        <div v-if="pillars.find(p => p.id === selectedPillar)" class="id-scenario">
          <div class="id-scenario-setup">
            {{ pillars.find(p => p.id === selectedPillar)!.scenarios[currentQuestionIndex].setup }}
          </div>

          <button class="id-scenario-reveal" @click="nextScenario">
            <span class="id-reveal-text">{{ pillars.find(p => p.id === selectedPillar)!.scenarios[currentQuestionIndex].reveal }}</span>
            <span class="id-reveal-arrow">→</span>
          </button>

          <div class="id-scenario-insight">
            {{ pillars.find(p => p.id === selectedPillar)!.scenarios[currentQuestionIndex].insight }}
          </div>

          <div class="id-scenario-counter">
            {{ currentQuestionIndex + 1 }} / {{ pillars.find(p => p.id === selectedPillar)!.scenarios.length }}
          </div>
        </div>
      </div>

      <!-- ── Constellation: Show progress ── -->
      <div v-else-if="phase === 'constellation'" key="constellation" class="id-phase id-constellation">
        <div class="id-constellation-content">
          <h2 class="id-constellation-title">Pillars Connected</h2>

          <div class="id-constellation-visual">
            <svg viewBox="0 0 300 300" class="id-constellation-svg">
              <!-- Connections between pillars -->
              <line v-for="(pair, idx) in [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]]" :key="`line-${idx}`"
                :x1="[75, 225, 225, 75, 75, 225][pair[0]]"
                :y1="[75, 75, 225, 225, 225, 75][pair[0]]"
                :x2="[75, 225, 225, 75, 75, 225][pair[1]]"
                :y2="[75, 75, 225, 225, 225, 75][pair[1]]"
                class="id-constellation-line"
                :style="{ 
                  '--line-delay': idx * 0.1 + 's',
                  stroke: exploredPillars.has(pillars[pair[0]].id) && exploredPillars.has(pillars[pair[1]].id) ? 'var(--color-accent)' : 'var(--color-divider)'
                }"
              />

              <!-- Pillar nodes -->
              <circle v-for="(pillar, idx) in pillars" :key="`node-${pillar.id}`"
                :cx="[75, 225, 225, 75][idx]"
                :cy="[75, 75, 225, 225][idx]"
                r="20"
                class="id-constellation-node"
                :class="{ 'id-constellation-node--active': exploredPillars.has(pillar.id) }"
                :style="{ 
                  '--node-color': pillar.color,
                  '--node-delay': idx * 0.15 + 's'
                }"
              />
            </svg>
          </div>

          <p class="id-constellation-text">
            {{ exploredPillars.size === pillars.length 
              ? 'All pillars unlocked. See how they connect.'
              : `${pillars.length - exploredPillars.size} pillar${pillars.length - exploredPillars.size !== 1 ? 's' : ''} remaining.`
            }}
          </p>

          <button class="id-constellation-btn" @click="continueTour">
            {{ exploredPillars.size === pillars.length ? 'See the full picture' : 'Continue exploring' }}
          </button>
        </div>
      </div>

      <!-- ── Final: Synthesis ── -->
      <div v-else-if="phase === 'final'" key="final" class="id-phase id-final">
        <div class="id-final-content">
          <h1 class="id-final-title">That's What This Does</h1>

          <div class="id-final-pillars">
            <div v-for="pillar in pillars" :key="pillar.id" class="id-final-pillar">
              <div class="id-final-pillar-icon" :style="{ color: pillar.color }">{{ pillar.icon }}</div>
              <h3 class="id-final-pillar-title">{{ pillar.title }}</h3>
              <p class="id-final-pillar-desc">{{ pillar.summary }}</p>
            </div>
          </div>

          <div class="id-final-closing">
            <p class="id-final-statement">
              Instructional Design is the discipline of simplifying what is complex so people can actually learn it.
            </p>
            <p class="id-final-subtext">
              Every pillar supports the others. Together, they create experiences that stick.
            </p>
          </div>

          <NuxtLink to="/" class="id-final-btn">Back to work</NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ──────────────────────────────────────────────────────────────────────────
   Layout & Wrap
   ────────────────────────────────────────────────────────────────────────── */
.id-wrap {
  position: fixed;
  inset: 0;
  background: var(--color-bg);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--page-top) 24px calc(100px + var(--safe-bottom)) 24px;
  overflow-y: auto;
}

.id-phase {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

/* ──────────────────────────────────────────────────────────────────────────
   Intro Phase
   ────────────────────────────────────────────────────────────────────────── */
.id-intro {
  justify-content: center;
  min-height: 60vh;
  position: relative;
}

.id-intro-glow {
  position: absolute;
  inset: -100px;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-accent) 8%, transparent) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.id-intro-content {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

.id-intro-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  opacity: 0.7;
  margin: 0 0 16px;
}

.id-intro-title {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
}

.id-intro-hint {
  font-size: 14px;
  opacity: 0.5;
  margin: 0;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Select Phase
   ────────────────────────────────────────────────────────────────────────── */
.id-select-header {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.id-select-title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}

.id-select-subtitle {
  font-size: 16px;
  opacity: 0.6;
  margin: 0;
}

.id-pillar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  width: 100%;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.id-pillar-btn {
  position: relative;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 16px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
  color: var(--color-text);
}

.id-pillar-btn:hover {
  background: var(--color-glass-bg-hover);
  border-color: var(--color-glass-border-hover);
  transform: translateY(-4px);
}

.id-pillar-btn:active {
  transform: translateY(-2px);
}

.id-pillar-btn--explored {
  border-color: var(--pillar-color);
  background: color-mix(in srgb, var(--pillar-color) 8%, var(--color-glass-bg));
}

.id-pillar-icon {
  font-size: 32px;
  color: var(--pillar-color);
  opacity: 0.8;
}

.id-pillar-name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.id-pillar-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--pillar-color);
  color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.id-progress {
  width: 100%;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.id-progress-text {
  font-size: 12px;
  opacity: 0.6;
  margin: 0 0 8px;
  text-align: center;
}

.id-progress-bar {
  width: 100%;
  height: 4px;
  background: var(--color-glass-bg);
  border-radius: 2px;
  overflow: hidden;
}

.id-progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.6s ease-out;
}

/* ──────────────────────────────────────────────────────────────────────────
   Explore Phase
   ────────────────────────────────────────────────────────────────────────── */
.id-back-btn {
  align-self: flex-start;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
  cursor: pointer;
  padding: 8px 0;
  transition: opacity 0.2s;
}

.id-back-btn:hover {
  opacity: 0.7;
}

.id-explore-header {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.id-explore-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: inline-block;
  animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.id-explore-title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}

.id-explore-question {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.7;
  margin: 0;
  font-style: italic;
}

.id-scenario {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.id-scenario-setup {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.7;
  padding: 20px;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 12px;
  text-align: center;
}

.id-scenario-reveal {
  background: var(--color-text);
  color: var(--color-bg);
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.id-scenario-reveal:hover {
  transform: translateX(4px);
}

.id-scenario-reveal:active {
  transform: scale(0.98);
}

.id-reveal-arrow {
  display: inline-block;
  transition: transform 0.3s;
}

.id-scenario-reveal:hover .id-reveal-arrow {
  transform: translateX(4px);
}

.id-scenario-insight {
  font-size: 16px;
  line-height: 1.7;
  font-weight: 500;
  padding: 20px;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 24%, transparent);
  border-radius: 12px;
  text-align: center;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.id-scenario-counter {
  text-align: center;
  font-size: 12px;
  opacity: 0.5;
}

/* ──────────────────────────────────────────────────────────────────────────
   Constellation Phase
   ────────────────────────────────────────────────────────────────────────── */
.id-constellation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  animation: fadeInUp 0.6s ease-out;
}

.id-constellation-title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
  text-align: center;
}

.id-constellation-visual {
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1;
}

.id-constellation-svg {
  width: 100%;
  height: 100%;
}

.id-constellation-line {
  stroke-width: 1.5;
  opacity: 0.3;
  transition: all 0.6s ease-out;
  animation: lineReveal 0.8s ease-out backwards;
}

@keyframes lineReveal {
  from {
    opacity: 0;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
  to {
    opacity: 0.3;
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
}

.id-constellation-line {
  animation-delay: var(--line-delay);
}

.id-constellation-node {
  fill: var(--node-color);
  opacity: 0.4;
  transition: all 0.6s ease-out;
  animation: nodeReveal 0.6s ease-out backwards;
}

@keyframes nodeReveal {
  from {
    opacity: 0;
    r: 0;
  }
  to {
    opacity: 0.4;
    r: 20;
  }
}

.id-constellation-node {
  animation-delay: var(--node-delay);
}

.id-constellation-node--active {
  opacity: 1;
  r: 24;
}

.id-constellation-text {
  font-size: 14px;
  opacity: 0.6;
  text-align: center;
  margin: 0;
}

.id-constellation-btn {
  background: var(--color-text);
  color: var(--color-bg);
  border: none;
  border-radius: 999px;
  padding: 12px 28px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.id-constellation-btn:hover {
  opacity: 0.9;
}

.id-constellation-btn:active {
  transform: scale(0.97);
}

/* ──────────────────────────────────────────────────────────────────────────
   Final Phase
   ────────────────────────────────────────────────────────────────────────── */
.id-final-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  animation: fadeInUp 0.6s ease-out;
}

.id-final-title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
  text-align: center;
}

.id-final-pillars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  width: 100%;
}

.id-final-pillar {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  animation: pillarReveal 0.4s ease-out backwards;
}

.id-final-pillar:nth-child(1) { animation-delay: 0.1s; }
.id-final-pillar:nth-child(2) { animation-delay: 0.2s; }
.id-final-pillar:nth-child(3) { animation-delay: 0.3s; }
.id-final-pillar:nth-child(4) { animation-delay: 0.4s; }

@keyframes pillarReveal {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.id-final-pillar-icon {
  font-size: 32px;
}

.id-final-pillar-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
  opacity: 0.9;
}

.id-final-pillar-desc {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.55;
  margin: 0;
}

.id-final-closing {
  text-align: center;
  padding: 24px;
  border-top: 1px solid var(--color-divider);
  animation: fadeInUp 0.6s ease-out 0.5s backwards;
}

.id-final-statement {
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 600;
  line-height: 1.5;
  margin: 0 0 16px;
}

.id-final-subtext {
  font-size: 14px;
  opacity: 0.6;
  margin: 0;
}

.id-final-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  background: var(--color-text);
  color: var(--color-bg);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  animation: fadeInUp 0.6s ease-out 0.6s backwards;
}

.id-final-btn:hover {
  opacity: 0.9;
}

.id-final-btn:active {
  transform: scale(0.97);
}

/* ──────────────────────────────────────────────────────────────────────────
   Transitions
   ────────────────────────────────────────────────────────────────────────── */
.id-fade-enter-active,
.id-fade-leave-active {
  transition: opacity 0.4s ease;
}

.id-fade-enter-from,
.id-fade-leave-to {
  opacity: 0;
}

/* ──────────────────────────────────────────────────────────────────────────
   Responsive
   ────────────────────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .id-pillar-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .id-final-pillars {
    grid-template-columns: repeat(2, 1fr);
  }

  .id-scenario {
    gap: 16px;
  }

  .id-phase {
    gap: 24px;
  }
}
</style>
