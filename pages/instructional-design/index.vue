<script setup lang="ts">
import gsap from 'gsap'
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({ layout: 'default' })

// ── State Management ────────────────────────────────────────────────────────
const phase = ref<'intro' | 'frustration' | 'transformation' | 'pillars' | 'final'>('intro')
const selectedPillar = ref<string | null>(null)
const exploredPillars = ref<Set<string>>(new Set())
const currentScenarioIndex = ref(0)

// Toaster interaction
const leverY = ref(0)
const toasterState = ref<'idle' | 'cooking' | 'popped'>('idle')
const cookProgress = ref(0)
const leverLocked = ref(false)
const dragTrackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

// Animation refs
const containerRef = ref<HTMLElement | null>(null)
const toasterRef = ref<HTMLElement | null>(null)
const leverRef = ref<HTMLElement | null>(null)

// ── Pillar Data ────────────────────────────────────────────────────────────
interface Pillar {
  id: string
  title: string
  icon: string
  color: string
  tagline: string
  scenarios: {
    before: string
    after: string
    insight: string
  }[]
}

const pillars: Pillar[] = [
  {
    id: 'clarity',
    title: 'Clarity',
    icon: '✓',
    color: '#06B6D4',
    tagline: 'Strip away the noise',
    scenarios: [
      {
        before: '"Secure vertical alignment of the leavened starch substrate inside the slot."',
        after: 'Put your bread in.',
        insight: 'Clarity is removing every word that doesn\'t matter.'
      },
      {
        before: '"Apply continuous downward mechanical force to the side-mounted actuator."',
        after: 'Push the handle down.',
        insight: 'When your learner understands on the first read, you\'ve done your job.'
      }
    ]
  },
  {
    id: 'sequence',
    title: 'Sequence',
    icon: '→',
    color: '#8B5CF6',
    tagline: 'The order is the teacher',
    scenarios: [
      {
        before: 'All steps presented at once. Learner is overwhelmed.',
        after: 'One step at a time. Each builds on the last.',
        insight: 'Confusion isn\'t a knowledge gap. It\'s a sequencing problem.'
      },
      {
        before: 'Complex concept explained in one paragraph.',
        after: 'Broken into bite-sized pieces in the right order.',
        insight: 'The sequence is the architecture. Get it wrong, nothing else matters.'
      }
    ]
  },
  {
    id: 'practice',
    title: 'Practice',
    icon: '◉',
    color: '#F04E0F',
    tagline: 'Learning by doing',
    scenarios: [
      {
        before: 'Reading about swimming.',
        after: 'Getting in the water.',
        insight: 'People learn by doing. Everything else is just preparation.'
      },
      {
        before: 'Passive video module.',
        after: 'Interactive decisions and real consequences.',
        insight: 'Practice isn\'t an add-on. It\'s the entire point.'
      }
    ]
  },
  {
    id: 'proof',
    title: 'Proof',
    icon: '★',
    color: '#F9D020',
    tagline: 'Measure what matters',
    scenarios: [
      {
        before: '92% completion rate.',
        after: 'Behavior changed. Performance improved.',
        insight: 'Completion is vanity. Change is proof.'
      },
      {
        before: 'Training ends. Learner forgets.',
        after: 'Three months later, they\'re still applying it.',
        insight: 'That\'s not a metric. That\'s a success.'
      }
    ]
  }
]

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  // Stagger the intro reveal
  gsap.set(containerRef.value, { opacity: 0, y: 20 })
  gsap.to(containerRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.2
  })

  setTimeout(() => {
    phase.value = 'frustration'
  }, 1200)
})

// ── Drag Mechanics ─────────────────────────────────────────────────────────
const startDrag = (e: MouseEvent | TouchEvent) => {
  if (toasterState.value !== 'idle') return
  isDragging.value = true
  e.preventDefault()
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !dragTrackRef.value) return
  e.preventDefault()

  const clientY = (e as any).touches ? (e as any).touches[0].clientY : (e as any).clientY
  const trackRect = dragTrackRef.value.getBoundingClientRect()
  
  const relativeY = clientY - trackRect.top
  const percentage = Math.max(0, Math.min(100, (relativeY / trackRect.height) * 100))
  
  leverY.value = percentage

  if (percentage >= 95) {
    leverLocked.value = true
    triggerCooking()
    endDrag()
  }
}

const endDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
  
  if (leverY.value < 95 && !leverLocked.value) {
    gsap.to(leverRef.value, {
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1.2, 0.75)',
      onUpdate: function() {
        leverY.value = (this.targets()[0].getBoundingClientRect().top - dragTrackRef.value!.getBoundingClientRect().top) / dragTrackRef.value!.offsetHeight * 100
      }
    })
  }
}

const triggerCooking = () => {
  toasterState.value = 'cooking'

  let progress = 0
  const timer = setInterval(() => {
    progress += 2
    cookProgress.value = progress
    if (progress >= 100) {
      clearInterval(timer)
      toasterState.value = 'popped'
      
      // Animate toast pop with GSAP
      gsap.to(toasterRef.value, {
        y: -40,
        duration: 0.4,
        ease: 'back.out(1.2)',
        delay: 0.2
      })

      setTimeout(() => {
        phase.value = 'pillars'
      }, 1500)
    }
  }, 40)
}

// ── Actions ────────────────────────────────────────────────────────────────
const selectPillar = (pillarId: string) => {
  selectedPillar.value = pillarId
  exploredPillars.value.add(pillarId)
  currentScenarioIndex.value = 0
}

const nextScenario = () => {
  const pillar = pillars.find(p => p.id === selectedPillar.value)
  if (!pillar) return

  if (currentScenarioIndex.value < pillar.scenarios.length - 1) {
    currentScenarioIndex.value++
  } else {
    selectedPillar.value = null
    if (exploredPillars.value.size === pillars.length) {
      phase.value = 'final'
    }
  }
}

const backToPillars = () => {
  selectedPillar.value = null
}

const resetExperience = () => {
  phase.value = 'intro'
  selectedPillar.value = null
  exploredPillars.value.clear()
  currentScenarioIndex.value = 0
  leverY.value = 0
  toasterState.value = 'idle'
  cookProgress.value = 0
  leverLocked.value = false
}
</script>

<template>
  <div class="id-wrap" ref="containerRef">
    <style>
      @keyframes springPop {
        0% { transform: translateY(60px) scaleY(0.8); opacity: 0; }
        40% { transform: translateY(-25px) scaleY(1.1); opacity: 1; }
        70% { transform: translateY(10px) scaleY(0.95); opacity: 1; }
        100% { transform: translateY(0px) scaleY(1); opacity: 1; }
      }
      @keyframes smokeFloat {
        0% { transform: translateY(0) scaleX(1); opacity: 0; }
        20% { opacity: 0.5; }
        100% { transform: translateY(-50px) scaleX(1.5); opacity: 0; }
      }
      @keyframes glowPulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes shimmer {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      .animate-spring-pop { animation: springPop 0.7s cubic-bezier(0.25, 0.8, 0.25, 1.2) forwards; }
      .smoke-1 { animation: smokeFloat 1.8s infinite ease-out; }
      .smoke-2 { animation: smokeFloat 1.8s infinite ease-out 0.6s; }
    </style>

    <Transition name="id-fade" mode="out-in">
      <!-- ── Intro: Atmospheric opening ── -->
      <div v-if="phase === 'intro'" key="intro" class="id-phase id-intro">
        <div class="id-intro-glow"></div>
        <div class="id-intro-content">
          <p class="id-intro-label">Instructional Design</p>
          <h1 class="id-intro-title">The Art of Making Learning Stick</h1>
          <p class="id-intro-hint">Tap to begin</p>
        </div>
      </div>

      <!-- ── Frustration: The Problem ── -->
      <div v-else-if="phase === 'frustration'" key="frustration" class="id-phase id-frustration">
        <div class="id-section-header">
          <span class="id-badge id-badge--error">The Problem</span>
          <h2 class="id-section-title">Why Learning Feels So Hard</h2>
          <p class="id-section-subtitle">Most instructions are written for machines, not humans.</p>
        </div>

        <div class="id-frustration-card">
          <div class="id-card-label">Typical Manual</div>
          <p class="id-card-text id-card-text--jargon">
            "Prior to core operational ignition, the human agent must secure vertical orientation of the porous leavened starch substrate inside the primary receiving chamber. Apply continuous downward mechanical force to the side-mounted actuator until a dynamic latch activates the heating array."
          </p>
          <p class="id-card-meta">↑ This is how to make toast.</p>
        </div>

        <button class="id-btn id-btn--primary" @click="phase = 'transformation'">
          Let's make it human
          <span class="id-btn-arrow">→</span>
        </button>
      </div>

      <!-- ── Transformation: The Toaster Moment ── -->
      <div v-else-if="phase === 'transformation'" key="transformation" class="id-phase id-transformation">
        <div class="id-section-header">
          <span class="id-badge id-badge--success">The Solution</span>
          <h2 class="id-section-title">Simplifying the Signal</h2>
          <p class="id-section-subtitle">Drag the lever down to experience the transformation.</p>
        </div>

        <div class="id-toaster-scene">
          <!-- Toaster Body -->
          <div class="id-toaster" ref="toasterRef">
            <!-- Heating element glow -->
            <div 
              class="id-heating-glow"
              :style="{ 
                opacity: toasterState === 'cooking' ? Math.min(1, cookProgress / 100) * 0.8 : 0
              }"
            ></div>

            <!-- Heat smoke waves -->
            <div v-if="toasterState === 'popped'" class="id-smoke-container">
              <div class="id-smoke smoke-1"></div>
              <div class="id-smoke smoke-2"></div>
            </div>

            <!-- Toast slot -->
            <div class="id-toast-slot">
              <!-- Toast -->
              <div 
                class="id-toast"
                :class="{ 'animate-spring-pop': toasterState === 'popped' }"
                :style="{
                  backgroundColor: `rgb(${253 - (cookProgress * 1.1)}, ${224 - (cookProgress * 1.2)}, ${139 - (cookProgress * 1.1)})`,
                  opacity: toasterState === 'idle' ? 1 : Math.max(0.3, 1 - cookProgress / 100)
                }"
              ></div>
            </div>

            <!-- Heating element indicator -->
            <div 
              class="id-heating-element"
              :style="{ 
                opacity: toasterState === 'cooking' ? Math.min(1, cookProgress / 100) : 0
              }"
            ></div>
          </div>

          <!-- Lever Track -->
          <div class="id-lever-track" ref="dragTrackRef">
            <div class="id-lever-track-bg"></div>
            <div 
              class="id-lever"
              ref="leverRef"
              :style="{ transform: `translateY(${leverY}%)` }"
              @mousedown="startDrag"
              @touchstart="startDrag"
            >
              <div class="id-lever-handle"></div>
            </div>
          </div>
        </div>

        <!-- Progress indicator -->
        <div v-if="toasterState === 'cooking'" class="id-cooking-state">
          <div class="id-progress-bar">
            <div class="id-progress-fill" :style="{ width: cookProgress + '%' }"></div>
          </div>
          <p class="id-progress-text">Toasting...</p>
        </div>

        <!-- Result message -->
        <div v-if="toasterState === 'popped'" class="id-result-message">
          <p class="id-result-text">✓ Done! That's what good design feels like.</p>
        </div>

        <div class="id-transformation-insight">
          <p class="id-insight-text">
            <strong>Before:</strong> "Apply continuous downward mechanical force..."<br>
            <strong>After:</strong> "Push the handle down."
          </p>
          <p class="id-insight-subtext">
            This is what happens when you design for humans instead of machines.
          </p>
        </div>
      </div>

      <!-- ── Pillars: Explore the Four Pillars ── -->
      <div v-else-if="phase === 'pillars'" key="pillars" class="id-phase id-pillars">
        <button v-if="selectedPillar" class="id-back-btn" @click="backToPillars">← Back</button>

        <div v-if="selectedPillar" class="id-explore-mode">
          <div class="id-explore-header">
            <div class="id-explore-icon" :style="{ color: pillars.find(p => p.id === selectedPillar)?.color }">
              {{ pillars.find(p => p.id === selectedPillar)?.icon }}
            </div>
            <h2 class="id-explore-title">{{ pillars.find(p => p.id === selectedPillar)?.title }}</h2>
            <p class="id-explore-tagline">{{ pillars.find(p => p.id === selectedPillar)?.tagline }}</p>
          </div>

          <div v-if="pillars.find(p => p.id === selectedPillar)" class="id-scenario">
            <div class="id-scenario-before">
              <p class="id-scenario-label">Without Design:</p>
              <p class="id-scenario-text">{{ pillars.find(p => p.id === selectedPillar)!.scenarios[currentScenarioIndex].before }}</p>
            </div>

            <div class="id-scenario-divider">→</div>

            <div class="id-scenario-after">
              <p class="id-scenario-label">With Design:</p>
              <p class="id-scenario-text">{{ pillars.find(p => p.id === selectedPillar)!.scenarios[currentScenarioIndex].after }}</p>
            </div>

            <div class="id-scenario-insight">
              <p class="id-insight-icon">💡</p>
              <p class="id-insight-text">{{ pillars.find(p => p.id === selectedPillar)!.scenarios[currentScenarioIndex].insight }}</p>
            </div>

            <div class="id-scenario-controls">
              <button class="id-btn id-btn--secondary" @click="nextScenario">
                {{ currentScenarioIndex < (pillars.find(p => p.id === selectedPillar)?.scenarios.length ?? 0) - 1 ? 'Next scenario' : 'Done' }}
                <span class="id-btn-arrow">→</span>
              </button>
              <p class="id-scenario-counter">
                {{ currentScenarioIndex + 1 }} / {{ pillars.find(p => p.id === selectedPillar)?.scenarios.length }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="id-pillars-grid">
          <div class="id-pillars-header">
            <h2 class="id-section-title">The Four Pillars</h2>
            <p class="id-section-subtitle">Each one is essential. Explore them all.</p>
          </div>

          <div class="id-pillar-buttons">
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

          <div v-if="exploredPillars.size > 0" class="id-progress-section">
            <p class="id-progress-text">{{ exploredPillars.size }} of {{ pillars.length }} explored</p>
            <div class="id-progress-bar">
              <div class="id-progress-fill" :style="{ width: (exploredPillars.size / pillars.length) * 100 + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Final: Synthesis ── -->
      <div v-else-if="phase === 'final'" key="final" class="id-phase id-final">
        <div class="id-final-header">
          <h1 class="id-final-title">That's What Instructional Design Does</h1>
          <p class="id-final-subtitle">
            It's the discipline of simplifying what is complex so people can actually learn it.
          </p>
        </div>

        <div class="id-final-pillars">
          <div v-for="pillar in pillars" :key="pillar.id" class="id-final-pillar">
            <div class="id-final-pillar-icon" :style="{ color: pillar.color }">{{ pillar.icon }}</div>
            <h3 class="id-final-pillar-title">{{ pillar.title }}</h3>
            <p class="id-final-pillar-tagline">{{ pillar.tagline }}</p>
          </div>
        </div>

        <div class="id-final-closing">
          <p class="id-final-statement">
            Every pillar supports the others. Together, they create experiences that stick.
          </p>
          <p class="id-final-subtext">
            When you design with clarity, sequence, practice, and proof, learning becomes inevitable.
          </p>
        </div>

        <div class="id-cta-group">
          <NuxtLink to="/" class="id-btn id-btn--primary">
            Back to work
            <span class="id-btn-arrow">→</span>
          </NuxtLink>
          <button class="id-btn id-btn--secondary" @click="resetExperience">
            Explore again
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ──────────────────────────────────────────────────────────────────────────
   Layout & Core
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
  will-change: opacity;
}

.id-phase {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

/* ──────────────────────────────────────────────────────────────────────────
   Badges & Labels
   ────────────────────────────────────────────────────────────────────────── */
.id-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
  animation: fadeInUp 0.6s ease-out;
}

.id-badge--error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.id-badge--success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
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

.id-intro-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.id-intro-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  opacity: 0.7;
  margin: 0 0 16px;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.id-intro-title {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.id-intro-hint {
  font-size: 14px;
  opacity: 0.5;
  margin: 0;
  animation: bounce 2s ease-in-out infinite;
}

/* ──────────────────────────────────────────────────────────────────────────
   Section Headers
   ────────────────────────────────────────────────────────────────────────── */
.id-section-header {
  text-align: center;
  width: 100%;
  animation: fadeInUp 0.6s ease-out;
}

.id-section-title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}

.id-section-subtitle {
  font-size: 16px;
  opacity: 0.6;
  margin: 0;
  line-height: 1.5;
}

/* ──────────────────────────────────────────────────────────────────────────
   Frustration Phase
   ────────────────────────────────────────────────────────────────────────── */
.id-frustration-card {
  width: 100%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.id-card-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.5;
}

.id-card-text {
  font-size: 15px;
  line-height: 1.7;
  margin: 0;
}

.id-card-text--jargon {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  opacity: 0.6;
  font-style: italic;
}

.id-card-meta {
  font-size: 12px;
  opacity: 0.4;
  margin: 0;
  text-align: center;
}

/* ──────────────────────────────────────────────────────────────────────────
   Transformation Phase - Toaster
   ────────────────────────────────────────────────────────────────────────── */
.id-toaster-scene {
  width: 100%;
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.id-toaster {
  position: relative;
  width: 140px;
  height: 180px;
  background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 14px;
  border: 3px solid #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  will-change: transform;
}

.id-heating-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center bottom, rgba(255, 107, 53, 0.3), transparent 70%);
  border-radius: 12px;
  pointer-events: none;
  transition: opacity 0.1s linear;
}

.id-smoke-container {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  gap: 16px;
  pointer-events: none;
}

.id-smoke {
  width: 10px;
  height: 24px;
  background: rgba(255, 165, 0, 0.7);
  border-radius: 50%;
  filter: blur(2px);
}

.id-toast-slot {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.id-toast {
  width: 90px;
  height: 100px;
  border-radius: 10px 10px 3px 3px;
  background: #f5e0b8;
  border: 2px solid #d4a574;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.05);
  transition: background-color 0.1s linear;
  will-change: transform, opacity;
}

.id-heating-element {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(90deg, transparent, #ff6b35, transparent);
  border-radius: 0 0 12px 12px;
  transition: opacity 0.2s;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
}

.id-lever-track {
  position: relative;
  width: 70px;
  height: 180px;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 14px;
  display: flex;
  align-items: flex-end;
  cursor: grab;
  user-select: none;
  will-change: contents;
}

.id-lever-track:active {
  cursor: grabbing;
}

.id-lever-track-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%);
  border-radius: 14px;
  pointer-events: none;
}

.id-lever {
  position: absolute;
  width: 100%;
  height: 50px;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.05s linear;
  z-index: 10;
  will-change: transform;
}

.id-lever-handle {
  width: 56px;
  height: 38px;
  background: linear-gradient(135deg, var(--color-accent) 0%, #0891b2 100%);
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: grab;
  transition: box-shadow 0.2s;
}

.id-lever:active .id-lever-handle {
  cursor: grabbing;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.id-cooking-state {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  animation: fadeInUp 0.4s ease-out;
}

.id-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--color-glass-bg);
  border-radius: 3px;
  overflow: hidden;
}

.id-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06B6D4, #0891b2);
  transition: width 0.1s linear;
}

.id-progress-text {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
  margin: 0;
}

.id-result-message {
  animation: fadeInUp 0.4s ease-out;
}

.id-result-text {
  font-size: 16px;
  font-weight: 600;
  color: #22c55e;
  margin: 0;
}

.id-transformation-insight {
  width: 100%;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 24%, transparent);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.id-insight-text {
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px;
}

.id-insight-subtext {
  font-size: 13px;
  opacity: 0.6;
  margin: 0;
}

/* ──────────────────────────────────────────────────────────────────────────
   Pillars Phase
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
  animation: fadeInUp 0.4s ease-out;
}

.id-back-btn:hover {
  opacity: 0.7;
}

.id-pillars-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.id-pillars-header {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.id-pillar-buttons {
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
  will-change: transform, background-color, border-color;
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

.id-progress-section {
  width: 100%;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.id-progress-text {
  font-size: 12px;
  opacity: 0.6;
  margin: 0 0 8px;
  text-align: center;
}

/* ──────────────────────────────────────────────────────────────────────────
   Explore Mode
   ────────────────────────────────────────────────────────────────────────── */
.id-explore-mode {
  width: 100%;
  animation: fadeInUp 0.6s ease-out;
}

.id-explore-header {
  text-align: center;
  margin-bottom: 32px;
}

.id-explore-icon {
  font-size: 48px;
  display: inline-block;
  margin-bottom: 16px;
  animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.id-explore-title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}

.id-explore-tagline {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.7;
  margin: 0;
  font-style: italic;
}

.id-scenario {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.id-scenario-before,
.id-scenario-after {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 12px;
  padding: 16px;
}

.id-scenario-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.5;
  margin: 0 0 8px;
}

.id-scenario-text {
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
}

.id-scenario-divider {
  text-align: center;
  font-size: 20px;
  opacity: 0.4;
}

.id-scenario-insight {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 24%, transparent);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.id-insight-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.id-scenario-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.id-scenario-counter {
  font-size: 12px;
  opacity: 0.5;
  margin: 0;
}

/* ──────────────────────────────────────────────────────────────────────────
   Final Phase
   ────────────────────────────────────────────────────────────────────────── */
.id-final-header {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.id-final-title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}

.id-final-subtitle {
  font-size: 16px;
  opacity: 0.6;
  margin: 0;
  line-height: 1.5;
}

.id-final-pillars {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
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
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
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

.id-final-pillar-tagline {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.55;
  margin: 0;
  font-style: italic;
}

.id-final-closing {
  width: 100%;
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

/* ──────────────────────────────────────────────────────────────────────────
   Buttons
   ────────────────────────────────────────────────────────────────────────── */
.id-cta-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
  animation: fadeInUp 0.6s ease-out 0.6s backwards;
}

.id-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
  white-space: nowrap;
  will-change: transform, background-color;
}

.id-btn--primary {
  background: var(--color-text);
  color: var(--color-bg);
  animation: fadeInUp 0.6s ease-out 0.3s backwards;
}

.id-btn--primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.id-btn--primary:active {
  transform: scale(0.98);
}

.id-btn--secondary {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  color: var(--color-text);
  animation: fadeInUp 0.6s ease-out 0.4s backwards;
}

.id-btn--secondary:hover {
  background: var(--color-glass-bg-hover);
  border-color: var(--color-glass-border-hover);
  transform: translateY(-2px);
}

.id-btn--secondary:active {
  transform: scale(0.98);
}

.id-btn-arrow {
  display: inline-block;
  transition: transform 0.3s;
}

.id-btn:hover .id-btn-arrow {
  transform: translateX(2px);
}

/* ──────────────────────────────────────────────────────────────────────────
   Transitions
   ────────────────────────────────────────────────────────────────────────── */
.id-fade-enter-active,
.id-fade-leave-active {
  transition: opacity 0.5s ease;
}

.id-fade-enter-from,
.id-fade-leave-to {
  opacity: 0;
}

/* ──────────────────────────────────────────────────────────────────────────
   Responsive
   ────────────────────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .id-wrap {
    padding: var(--page-top) 16px calc(60px + var(--safe-bottom)) 16px;
  }

  .id-phase {
    gap: 24px;
  }

  .id-toaster-scene {
    gap: 24px;
  }

  .id-toaster,
  .id-lever-track {
    width: 110px;
    height: 150px;
  }

  .id-toast {
    width: 75px;
    height: 85px;
  }

  .id-pillar-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .id-final-pillars {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
