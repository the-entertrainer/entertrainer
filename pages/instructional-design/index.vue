<script setup lang="ts">
definePageMeta({ layout: 'default' })

const phase = ref<'intro' | 'reveal' | 'final'>('intro')
const letterIndex = ref(0)

const sentence = 'Instructional Design is the discipline of simplifying what is complex so people can actually learn it.'
const words = sentence.split(' ')

const wordElements = ref<(HTMLElement | null)[]>([])

onMounted(() => {
  setTimeout(() => { phase.value = 'reveal' }, 300)
})

watch(() => phase.value, async (newPhase) => {
  if (newPhase === 'reveal') {
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 100))
      letterIndex.value = i + 1
    }
    await new Promise(r => setTimeout(r, 800))
    phase.value = 'final'
  }
})
</script>

<template>
  <div class="id-wrap">
    <Transition name="fade">
      <!-- Intro phase -->
      <div v-if="phase === 'intro'" key="intro" class="id-intro">
        <div class="id-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
            <!-- Custom ID icon: brain + clarity symbol -->
            <circle cx="24" cy="24" r="20" />
            <path d="M 24 10 Q 28 14 28 20 Q 28 26 24 28 Q 20 26 20 20 Q 20 14 24 10" />
            <path d="M 16 20 L 32 20" stroke-linecap="round" />
            <path d="M 18 26 L 30 26" opacity="0.5" stroke-linecap="round" />
          </svg>
        </div>
        <p class="id-intro-text">Understanding what design actually means...</p>
      </div>

      <!-- Reveal phase -->
      <div v-else-if="phase === 'reveal'" key="reveal" class="id-reveal">
        <div class="id-sentence-wrap">
          <div class="id-sentence">
            <span
              v-for="(word, i) in words"
              :key="i"
              class="id-word"
              :class="{ 'id-word--visible': i < letterIndex }"
              :style="{ '--delay': i * 0.1 + 's' }"
            >
              {{ word }}&nbsp;
              <span v-if="word === 'Instructional'" class="id-icon id-icon--design">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M 2 3 L 14 3 L 14 13 L 2 13 Z M 4 6 L 12 6 M 4 9 L 12 9 M 4 12 L 9 12" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" />
                </svg>
              </span>
              <span v-if="word === 'simplifying'" class="id-icon id-icon--simplify">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
                  <path d="M 1 8 L 15 8 M 1 4 L 15 4 M 1 12 L 15 12" stroke-linecap="round" />
                </svg>
              </span>
              <span v-if="word === 'complex'" class="id-icon id-icon--complex">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
                  <circle cx="8" cy="8" r="5" />
                  <path d="M 3 8 L 13 8 M 8 3 L 8 13 M 4.5 4.5 L 11.5 11.5 M 11.5 4.5 L 4.5 11.5" />
                </svg>
              </span>
              <span v-if="word === 'learn'" class="id-icon id-icon--learn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
                  <path d="M 2 4 L 8 2 L 14 4 L 14 10 C 14 13 8 15 8 15 C 8 15 2 13 2 10 Z" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M 8 6 L 10 9 L 6 9 Z" fill="currentColor" />
                </svg>
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Final phase -->
      <div v-else key="final" class="id-final">
        <h1 class="id-final-title">That's what this does.</h1>

        <div class="id-pillars">
          <div class="id-pillar">
            <div class="id-pillar-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="16" cy="16" r="12" />
                <path d="M 10 16 L 14 20 L 22 12" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="id-pillar-head">Clarity</h3>
            <p class="id-pillar-body">Every word, every icon, every interaction is stripped to its essential meaning.</p>
          </div>

          <div class="id-pillar">
            <div class="id-pillar-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M 6 8 L 26 8 M 6 16 L 26 16 M 6 24 L 26 24" stroke-linecap="round" />
                <circle cx="10" cy="8" r="2" fill="currentColor" />
                <circle cx="10" cy="16" r="2" fill="currentColor" />
                <circle cx="10" cy="24" r="2" fill="currentColor" />
              </svg>
            </div>
            <h3 class="id-pillar-head">Sequence</h3>
            <p class="id-pillar-body">The order matters. We arrange steps exactly as your brain expects them to happen.</p>
          </div>

          <div class="id-pillar">
            <div class="id-pillar-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="4" y="8" width="24" height="18" rx="2" />
                <path d="M 10 14 L 14 18 L 22 10" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="id-pillar-head">Practice</h3>
            <p class="id-pillar-body">People learn by doing, not reading. Every design gives them something to pull or tap.</p>
          </div>

          <div class="id-pillar">
            <div class="id-pillar-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M 8 16 L 16 24 L 24 8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </div>
            <h3 class="id-pillar-head">Proof</h3>
            <p class="id-pillar-body">Not completion rates. Real change in the real world. That's how you know it worked.</p>
          </div>
        </div>

        <div class="id-cta">
          <NuxtLink to="/" class="id-btn">Back to work</NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
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

/* ── Intro ──────────────────────────────────────────────────────────────── */
.id-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.id-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  opacity: 0.8;
}

.id-intro-text {
  font-size: 14px;
  opacity: 0.5;
  margin: 0;
  font-style: italic;
}

/* ── Reveal ────────────────────────────────────────────────────────────────── */
.id-reveal {
  width: 100%;
  max-width: 720px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.id-sentence-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.id-sentence {
  font-size: clamp(22px, 5vw, 42px);
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
  letter-spacing: -0.01em;
}

.id-word {
  display: inline;
  opacity: 0;
  animation: wordReveal 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  animation-delay: var(--delay);
}

.id-word--visible {
  opacity: 1;
}

@keyframes wordReveal {
  0%   { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}

.id-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  opacity: 0.6;
  animation: iconFloat 2s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}

/* ── Final ─────────────────────────────────────────────────────────────── */
.id-final {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  animation: fadeInUp 0.6s ease-out;
}

.id-final-title {
  font-size: clamp(28px, 6vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  text-align: center;
}

.id-pillars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.id-pillar {
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

.id-pillar:nth-child(1) { animation-delay: 0.1s; }
.id-pillar:nth-child(2) { animation-delay: 0.2s; }
.id-pillar:nth-child(3) { animation-delay: 0.3s; }
.id-pillar:nth-child(4) { animation-delay: 0.4s; }

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

.id-pillar-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 24%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  opacity: 0.8;
}

.id-pillar-head {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
  opacity: 0.9;
}

.id-pillar-body {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.55;
  margin: 0;
}

.id-cta {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.id-btn {
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
  transition: opacity 0.15s, transform 0.12s;
}

.id-btn:active { transform: scale(0.97); }

/* ── Transitions ───────────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
