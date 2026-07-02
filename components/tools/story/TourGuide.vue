<script setup lang="ts">
// A spotlight product tour: dims the live app and cuts a moving, rounded
// window onto real UI — then narrates each capability in a step card with
// autoplay. Nothing is mocked: the tour points at the user's actual
// storyboard, so what they see is exactly what they'll use.
const emit = defineEmits<{ close: [] }>()

interface TourStep {
  id: string
  title: string
  body: string
  bodyMobile?: string
  target?: { desktop?: string; mobile?: string }
  illo?: 'connect' | 'edit' | 'tidy'
}

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Meet StoryGen',
    body: 'A storyboard is a flow of connected screen cards on an infinite canvas. This tour takes about 40 seconds — it plays itself, or tap anywhere to skip ahead.'
  },
  {
    id: 'framework',
    title: 'Your framework drives everything',
    body: 'This storyboard follows the instructional design model you picked. Every stage carries its own guiding question — and you can switch frameworks here anytime without losing work.',
    bodyMobile: 'This storyboard follows the ID model you picked — every stage has its own guiding question. Switch frameworks anytime from this menu without losing work.',
    target: { desktop: '.sg-model-chip', mobile: '.sg-topbar .sg-menu-wrap' }
  },
  {
    id: 'add',
    title: 'Add screens in one tap',
    body: 'The palette holds your framework\'s stages on top — one click adds a card already assigned to that stage — plus eight screen types below. New cards snap onto the end of your flow automatically.',
    bodyMobile: 'Add card opens the palette: your framework\'s stages on top — one tap adds a card assigned to that stage — plus eight screen types. New cards snap onto the end of the flow.',
    target: { desktop: '.sg-dock', mobile: '.sg-add-btn' }
  },
  {
    id: 'connect',
    title: 'Wire the story',
    body: 'Drag cards anywhere. Pull the dot on a card\'s right edge onto another card — the curve snaps in. Tap a curve to disconnect it, or drag its arrival end to re-plug it somewhere else.',
    target: { desktop: '.node-card', mobile: '.node-card' },
    illo: 'connect'
  },
  {
    id: 'edit',
    title: 'Edit any screen',
    body: 'Click a card and its inspector opens as a floating window you can drag around. Shortcuts: ⌘Z undo, ⌘D duplicate, Delete removes.',
    bodyMobile: 'Tap a card for quick actions, then ✎ Edit opens the full editor. The ✎ pencil on each card jumps straight in.',
    target: { desktop: '.node-card', mobile: '.node-card' },
    illo: 'edit'
  },
  {
    id: 'tidy',
    title: 'Zoom, fit, and tidy',
    body: 'Scroll to zoom, drag empty space to pan. Fit frames the whole flow; Tidy snaps every card into its framework\'s stage lanes.',
    bodyMobile: 'Pinch to zoom, drag to pan. Fit frames the whole flow; Tidy snaps cards into their framework\'s stage lanes.',
    target: { desktop: '.sg-zoombar', mobile: '.sg-bottombar' },
    illo: 'tidy'
  },
  {
    id: 'export',
    title: 'Export, polished',
    body: 'One click produces a formatted Word or Excel storyboard grouped by stage, a PNG of the flow diagram, or a project file. Everything autosaves to this device as you work.',
    bodyMobile: 'From this menu: a formatted Word or Excel storyboard grouped by stage, a PNG of the flow, or a project file. Everything autosaves as you work.',
    target: { desktop: '.sg-export-btn', mobile: '.sg-topbar .sg-menu-wrap' }
  },
  {
    id: 'done',
    title: 'You\'re ready',
    body: 'That\'s the whole tool: pick a framework, wire the screens, answer each stage\'s question, export. Replay this tour anytime from the ? button.',
    bodyMobile: 'That\'s the whole tool: pick a framework, wire the screens, answer each stage\'s question, export. Replay this tour anytime from the ⋯ menu.'
  }
]

const STEP_MS = 8000
const PAD = 10

const current = ref(0)
const rect = ref<{ x: number; y: number; w: number; h: number } | null>(null)
const progress = ref(0)
const paused = ref(false)
const isMobile = ref(false)
const reducedMotion = ref(false)

const step = computed(() => STEPS[current.value])
const isLast = computed(() => current.value === STEPS.length - 1)
const bodyText = computed(() => (isMobile.value && step.value.bodyMobile) || step.value.body)
const autoplay = computed(() => !reducedMotion.value && !isLast.value)

function measure() {
  const sel = isMobile.value ? step.value.target?.mobile : step.value.target?.desktop
  const el = sel ? document.querySelector(sel) : null
  if (!el) { rect.value = null; return }
  const r = el.getBoundingClientRect()
  if (!r.width && !r.height) { rect.value = null; return }
  rect.value = { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
}

const spotlightStyle = computed(() => {
  if (rect.value) {
    return { left: `${rect.value.x}px`, top: `${rect.value.y}px`, width: `${rect.value.w}px`, height: `${rect.value.h}px`, opacity: 1 }
  }
  // No target: collapse the window to a point mid-screen so the shade
  // covers everything and the next spotlight grows out smoothly.
  return { left: '50vw', top: '46vh', width: '0px', height: '0px', opacity: 1 }
})

// Desktop step card floats near the spotlight; mobile pins to the bottom.
const cardStyle = computed(() => {
  if (isMobile.value) return {}
  const CW = 358; const CH = 268; const M = 18
  const vw = window.innerWidth; const vh = window.innerHeight
  if (!rect.value) return { left: `${(vw - CW) / 2}px`, top: `${(vh - CH) / 2}px` }
  const r = rect.value
  let left = Math.min(Math.max(r.x, M), vw - CW - M)
  let top = r.y + r.h + 14
  if (top + CH > vh - M) top = r.y - CH - 14
  if (top < M) { // fall back beside the target
    top = Math.min(Math.max(r.y, M), vh - CH - M)
    left = r.x + r.w + 14
    if (left + CW > vw - M) left = r.x - CW - 14
    if (left < M) left = (vw - CW) / 2
  }
  return { left: `${left}px`, top: `${top}px` }
})

// ── Autoplay engine ─────────────────────────────────────────────
let rafId = 0
let stepStart = 0
function tick(now: number) {
  if (!paused.value && autoplay.value) {
    progress.value = Math.min(1, (now - stepStart) / STEP_MS)
    if (progress.value >= 1) { next(); rafId = requestAnimationFrame(tick); return }
  }
  rafId = requestAnimationFrame(tick)
}
function resetTimer() {
  stepStart = performance.now()
  progress.value = 0
}

function goTo(i: number) {
  current.value = Math.min(Math.max(i, 0), STEPS.length - 1)
  resetTimer()
  nextTick(measure)
}
function next() { isLast.value ? emit('close') : goTo(current.value + 1) }
function back() { goTo(current.value - 1) }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.stopPropagation(); emit('close') }
  else if (e.key === 'ArrowRight' || e.key === 'Enter') next()
  else if (e.key === 'ArrowLeft') back()
}

onMounted(() => {
  isMobile.value = !window.matchMedia('(min-width: 900px)').matches
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('resize', measure)
  window.addEventListener('keydown', onKeydown, { capture: true })
  nextTick(measure)
  resetTimer()
  rafId = requestAnimationFrame(tick)
})
onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', measure)
  window.removeEventListener('keydown', onKeydown, { capture: true } as any)
})
</script>

<template>
  <div class="tour" @click.self="next">
    <!-- The moving cutout: its giant shadow is the dimmer -->
    <div class="tour__spotlight" :style="spotlightStyle" />

    <section
      class="tour__card glass-panel"
      :style="cardStyle"
      @click.stop
      @pointerenter="paused = true"
      @pointerleave="paused = false"
    >
      <div class="tour__progress"><span :style="{ width: `${(autoplay ? progress : 0) * 100}%` }" /></div>

      <p class="tour__eyebrow">{{ current + 1 }} / {{ STEPS.length }} · StoryGen tour</p>
      <h3 class="tour__title">{{ step.title }}</h3>
      <p class="tour__body">{{ bodyText }}</p>

      <!-- Gesture micro-illustrations — the things words can't teach -->
      <div v-if="step.illo === 'connect'" class="tour__illo" aria-hidden="true">
        <svg viewBox="0 0 300 96" width="100%">
          <rect x="10" y="22" width="88" height="52" rx="10" class="illo-card" />
          <rect x="10" y="22" width="4" height="52" rx="2" fill="#60A5FA" />
          <rect x="202" y="22" width="88" height="52" rx="10" class="illo-card" />
          <rect x="202" y="22" width="4" height="52" rx="2" fill="#FB7185" />
          <path d="M98,48 C142,48 158,48 202,48" class="illo-curve" />
          <circle cx="98" cy="48" r="6" class="illo-port" />
          <circle cx="202" cy="48" r="6" class="illo-port illo-port--pulse" />
          <circle r="4.5" class="illo-dot">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M98,48 C142,48 158,48 202,48" />
          </circle>
        </svg>
      </div>
      <div v-else-if="step.illo === 'edit'" class="tour__illo" aria-hidden="true">
        <svg viewBox="0 0 300 96" width="100%">
          <rect x="86" y="14" width="128" height="68" rx="12" class="illo-card" />
          <rect x="86" y="14" width="4" height="68" rx="2" fill="#A78BFA" />
          <rect x="102" y="30" width="64" height="7" rx="3.5" class="illo-line" />
          <rect x="102" y="45" width="92" height="5" rx="2.5" class="illo-line illo-line--dim" />
          <rect x="102" y="56" width="78" height="5" rx="2.5" class="illo-line illo-line--dim" />
          <circle cx="204" cy="26" r="11" class="illo-edit-btn" />
          <path d="M200.5,29.5 l6.5,-6.5 M200,30 l1.8,-0.5 -1.3,-1.3 Z" stroke="currentColor" stroke-width="1.6" fill="none" class="illo-pencil" />
        </svg>
      </div>
      <div v-else-if="step.illo === 'tidy'" class="tour__illo" aria-hidden="true">
        <svg viewBox="0 0 300 96" width="100%">
          <rect width="66" height="34" rx="8" class="illo-card illo-tidy illo-tidy--1" />
          <rect width="66" height="34" rx="8" class="illo-card illo-tidy illo-tidy--2" />
          <rect width="66" height="34" rx="8" class="illo-card illo-tidy illo-tidy--3" />
        </svg>
      </div>

      <div class="tour__nav">
        <button class="tour__skip" @click="emit('close')">Skip tour</button>
        <div class="tour__dots">
          <button
            v-for="(s, i) in STEPS" :key="s.id"
            class="tour__dot" :class="{ 'tour__dot--on': i === current }"
            :aria-label="`Step ${i + 1}`"
            @click="goTo(i)"
          />
        </div>
        <div class="tour__btns">
          <button v-if="current > 0" class="tour__btn tour__btn--ghost" @click="back">Back</button>
          <button class="tour__btn" @click="next">{{ isLast ? 'Start building' : 'Next' }}</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tour {
  position: fixed;
  inset: 0;
  z-index: 36;
}

.tour__spotlight {
  position: fixed;
  border-radius: 18rem;
  box-shadow: 0 0 0 200vmax rgba(0, 0, 0, 0.56);
  pointer-events: none;
  transition: all 0.55s cubic-bezier(0.3, 1.2, 0.3, 1);
}
.tour__spotlight::after {
  content: '';
  position: absolute;
  inset: -3rem;
  border-radius: inherit;
  border: 2rem solid rgba(255, 255, 255, 0.85);
  animation: tour-ring 1.8s ease-in-out infinite;
}
@keyframes tour-ring {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.025); }
}

.tour__card {
  position: fixed;
  width: 358rem;
  max-width: calc(100vw - 24rem);
  padding: 0 0 16rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: left 0.5s cubic-bezier(0.3, 1.1, 0.3, 1), top 0.5s cubic-bezier(0.3, 1.1, 0.3, 1);
}

.tour__progress {
  height: 3rem;
  background: color-mix(in srgb, var(--color-text) 12%, transparent);
  margin-bottom: 14rem;
}
.tour__progress span {
  display: block;
  height: 100%;
  background: var(--color-text);
  transition: width 0.15s linear;
}

.tour__eyebrow {
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.45;
  padding: 0 18rem 8rem;
}
.tour__title { font-size: 19rem; letter-spacing: -0.02em; padding: 0 18rem 8rem; }
.tour__body { font-size: 13.5rem; line-height: 1.55; opacity: 0.78; padding: 0 18rem 4rem; }

.tour__illo {
  margin: 10rem 18rem 2rem;
  border-radius: 12rem;
  background: color-mix(in srgb, var(--color-text) 5%, transparent);
  border: 1px solid var(--color-divider);
  padding: 4rem 8rem;
}
.illo-card { fill: color-mix(in srgb, var(--color-text) 9%, transparent); stroke: color-mix(in srgb, var(--color-text) 28%, transparent); stroke-width: 1.2; }
.illo-curve {
  fill: none;
  stroke: color-mix(in srgb, var(--color-text) 55%, transparent);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-dasharray: 6 7;
  animation: illo-dash 1.2s linear infinite;
}
@keyframes illo-dash { to { stroke-dashoffset: -13; } }
.illo-port { fill: var(--color-bg); stroke: color-mix(in srgb, var(--color-text) 80%, transparent); stroke-width: 2; }
.illo-port--pulse { animation: illo-pulse 1.8s ease-in-out infinite; transform-origin: 202px 48px; }
@keyframes illo-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.45); } }
.illo-dot { fill: var(--color-text); }
.illo-line { fill: color-mix(in srgb, var(--color-text) 45%, transparent); }
.illo-line--dim { fill: color-mix(in srgb, var(--color-text) 22%, transparent); }
.illo-edit-btn { fill: color-mix(in srgb, var(--color-text) 14%, transparent); stroke: color-mix(in srgb, var(--color-text) 40%, transparent); animation: illo-pulse-soft 1.8s ease-in-out infinite; transform-origin: 204px 26px; }
@keyframes illo-pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
.illo-pencil { color: var(--color-text); opacity: 0.85; }

.illo-tidy { animation: 2.6s ease-in-out infinite; }
.illo-tidy--1 { animation-name: tidy-1; }
.illo-tidy--2 { animation-name: tidy-2; }
.illo-tidy--3 { animation-name: tidy-3; }
@keyframes tidy-1 { 0%, 15% { transform: translate(30px, 6px) rotate(-5deg); } 50%, 80% { transform: translate(16px, 31px); } 100% { transform: translate(30px, 6px) rotate(-5deg); } }
@keyframes tidy-2 { 0%, 15% { transform: translate(130px, 44px) rotate(4deg); } 50%, 80% { transform: translate(117px, 31px); } 100% { transform: translate(130px, 44px) rotate(4deg); } }
@keyframes tidy-3 { 0%, 15% { transform: translate(215px, 14px) rotate(8deg); } 50%, 80% { transform: translate(218px, 31px); } 100% { transform: translate(215px, 14px) rotate(8deg); } }

.tour__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rem;
  padding: 12rem 18rem 0;
}
.tour__skip { font-size: 12rem; font-weight: 600; opacity: 0.55; }
.tour__skip:hover { opacity: 0.9; }
.tour__dots { display: flex; gap: 5rem; }
.tour__dot {
  width: 7rem; height: 7rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-text) 25%, transparent);
  transition: background 0.2s ease, transform 0.2s ease;
}
.tour__dot--on { background: var(--color-text); transform: scale(1.25); }
.tour__btns { display: flex; gap: 7rem; }
.tour__btn {
  padding: 8rem 16rem;
  border-radius: 999px;
  font-size: 12.5rem;
  font-weight: 700;
  background: var(--color-text);
  color: var(--color-bg);
}
.tour__btn--ghost {
  background: color-mix(in srgb, var(--color-bg) 46%, transparent);
  color: var(--color-text);
  border: 1px solid var(--color-glass-border);
}

@media (max-width: 899px) {
  .tour__card {
    left: 12rem !important;
    right: 12rem;
    top: auto !important;
    bottom: calc(14rem + var(--safe-bottom));
    width: auto;
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tour__spotlight { transition: none; }
  .tour__spotlight::after, .illo-curve, .illo-port--pulse, .illo-edit-btn, .illo-tidy { animation: none; }
  .tour__card { transition: none; }
}
</style>
