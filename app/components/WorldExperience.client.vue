<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useContent } from '~/composables/useContent'

const site = useContent()
const currentRoom = ref('hub')
const isTransitioning = ref(false)
// Fade overlay opacity is driven by reactive state + CSS transition
// (no GSAP dependency — guarantees the intro fade always clears).
const fadeOpacity = ref(1)

let fadeTimers: ReturnType<typeof setTimeout>[] = []

const { width } = useWindowSize()

// Responsive grid config.
// colGap is width-derived so the outermost cards always fit on screen:
//   max gap = (viewport - cardWidth - 2*margin) / (cols - 1)
const gridCfg = computed(() => {
  const w = width.value
  if (w < 640) {
    // Mobile: 2 columns × 4 rows; card ~140px, shift down for hub title
    const colGap = Math.min(170, (w - 140 - 32) / 1)
    return { cols: 2, colGap, rowGap: 140, roomZ: -2200, yOffset: 90 }
  }
  if (w < 1024) {
    // Tablet: 4 columns; card ~165px
    const colGap = Math.min(210, (w - 165 - 56) / 3)
    return { cols: 4, colGap, rowGap: 185, roomZ: -2600, yOffset: 30 }
  }
  // Desktop: 4 columns; card ~200px
  const colGap = Math.min(340, (w - 200 - 80) / 3)
  return { cols: 4, colGap, rowGap: 220, roomZ: -2800, yOffset: 0 }
})

const ROOM_Z = computed(() => gridCfg.value.roomZ)

const portalLayout = computed(() => {
  const { cols, colGap, rowGap, yOffset } = gridCfg.value
  const totalRows = Math.ceil(site.sections.length / cols)
  return site.sections.map((section, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = (col - (cols - 1) / 2) * colGap
    const y = (row - (totalRows - 1) / 2) * rowGap + yOffset
    return { section, x, y }
  })
})

// CSS transform for each room's 3D position
function portalVars(x: number, y: number): Record<string, string> {
  return { '--px': `${x}px`, '--py': `${y}px` }
}

function roomVars(x: number, y: number): Record<string, string> {
  return { '--rx': `${x}px`, '--ry': `${y}px`, '--rz': `${ROOM_Z.value}px` }
}

// Scene CSS transform: moves scene to place the current room in front of camera
const sceneStyle = computed(() => {
  if (currentRoom.value === 'hub') return {}
  const item = portalLayout.value.find(p => p.section.id === currentRoom.value)
  if (!item) return {}
  return {
    transform: `translate3d(${-item.x}px, ${-item.y}px, ${-ROOM_Z.value}px)`,
  }
})

// Fade to white, swap room, fade back in — driven by CSS transition.
function transitionTo(id: string) {
  if (isTransitioning.value || currentRoom.value === id) return
  isTransitioning.value = true
  fadeOpacity.value = 1 // fade up
  fadeTimers.push(setTimeout(() => {
    currentRoom.value = id // swap behind the white veil
    fadeTimers.push(setTimeout(() => {
      fadeOpacity.value = 0 // fade back in
      fadeTimers.push(setTimeout(() => {
        isTransitioning.value = false
      }, 450))
    }, 80))
  }, 400))
}

function goToRoom(id: string) { transitionTo(id) }
function goToHub() {
  if (currentRoom.value === 'hub') return
  transitionTo('hub')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && currentRoom.value !== 'hub') goToHub()
}

onMounted(() => {
  // Clear the intro veil on next frame so the CSS transition runs.
  requestAnimationFrame(() => { fadeOpacity.value = 0 })
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  fadeTimers.forEach(clearTimeout)
})
</script>

<template>
  <div class="world-stage" role="main">
    <!-- Fade overlay — starts opaque, CSS transition clears it on mount -->
    <div class="world-fade" :style="{ opacity: fadeOpacity }" aria-hidden="true" />

    <!-- No-JS fallback message -->
    <noscript>
      <div style="position: fixed; inset: 0; background: #0a0a0a; display: flex; align-items: center; justify-content: center; z-index: 100;">
        <div style="text-align: center; color: #f0f0f0;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">JavaScript Required</h1>
          <p style="font-size: 1rem; color: #888;">This interactive experience requires JavaScript to be enabled.</p>
        </div>
      </div>
    </noscript>

    <!-- Hub title overlay — lives outside 3D scene so it's always readable -->
    <Transition name="hub-title">
      <div v-if="currentRoom === 'hub'" class="hub-hero" aria-label="Site title">
        <p class="hub-eyebrow">Instructional Designer · Learning Architect</p>
        <h1 class="hub-heading">Interesting is the<br>Mother of All Inventions.</h1>
        <p class="hub-sub">Click a room to explore</p>
      </div>
    </Transition>

    <!-- Perspective container -->
    <div class="world-perspective" aria-hidden="true">
      <!-- 3D scene: translate this to "move camera" -->
      <div class="world-scene" :style="sceneStyle">

        <!-- Portal cards (hub navigation) -->
        <button
          v-for="{ section, x, y } in portalLayout"
          :key="`p-${section.id}`"
          class="world-portal"
          :style="portalVars(x, y)"
          :aria-label="`Enter ${section.tab}`"
          :tabindex="currentRoom === 'hub' ? 0 : -1"
          @click="goToRoom(section.id)"
        >
          <span class="p-tab">{{ section.tab }}</span>
          <span class="p-hint">{{ section.title }}</span>
        </button>

        <!-- Room content panels (pushed back in Z) -->
        <div
          v-for="{ section, x, y } in portalLayout"
          :key="`r-${section.id}`"
          class="world-room"
          :class="{ 'room--on': currentRoom === section.id }"
          :style="roomVars(x, y)"
          :aria-hidden="currentRoom !== section.id"
          role="region"
          :aria-label="section.tab"
        >
          <div class="room-inner">
            <p v-if="section.eyebrow" class="r-eyebrow">{{ section.eyebrow }}</p>
            <h2 class="r-title">{{ section.title }}</h2>
            <p v-if="section.body" class="r-body">{{ section.body }}</p>

            <!-- Skills -->
            <div v-if="section.kind === 'skills'" class="r-skills">
              <div v-for="sk in (section.items || [])" :key="sk.name as string" class="sk-row">
                <span class="sk-name">{{ sk.name }}</span>
                <div class="sk-bar">
                  <div class="sk-fill" :style="{ width: sk.level + '%' }" />
                </div>
                <span class="sk-pct">{{ sk.level }}%</span>
              </div>
            </div>

            <!-- About facts -->
            <ul v-if="section.kind === 'about'" class="r-facts">
              <li v-for="it in (section.items || [])" :key="it.fact as string">{{ it.fact }}</li>
            </ul>

            <!-- Experience -->
            <div v-if="section.kind === 'experience'" class="r-timeline">
              <div v-for="it in (section.items || [])" :key="it.role as string" class="tl-row">
                <span class="tl-year">{{ it.year }}</span>
                <div><p class="tl-role">{{ it.role }}</p><p class="tl-org">{{ it.org }}</p></div>
              </div>
            </div>

            <!-- Projects -->
            <div v-if="section.kind === 'projects'" class="r-projects">
              <div v-for="it in (section.items || [])" :key="it.title as string" class="proj-card">
                <span class="proj-icon">{{ it.icon }}</span>
                <div><p class="proj-name">{{ it.title }}</p><span class="proj-tag">{{ it.tag }}</span></div>
              </div>
            </div>

            <!-- Testimonials -->
            <div v-if="section.kind === 'testimonials'" class="r-quotes">
              <blockquote v-for="it in (section.items || [])" :key="it.quote as string" class="quote">
                <p>"{{ it.quote }}"</p>
                <cite>— {{ it.author }}</cite>
              </blockquote>
            </div>

            <!-- Contact -->
            <div v-if="section.kind === 'contact'" class="r-contact">
              <a href="mailto:naveen@entertrainer.in" class="r-cta" data-no-drag>
                Send a Message →
              </a>
            </div>

            <!-- Footer -->
            <div v-if="section.kind === 'footer'" class="r-footer">
              <p class="footer-sig">Handcrafted with too much CSS and just enough chaos.</p>
              <p class="footer-copy">© 2026 Entertrainer · entertrainer.in</p>
            </div>
          </div>

          <button class="room-exit" :tabindex="currentRoom === section.id ? 0 : -1" @click="goToHub">
            ← Back to Hub
          </button>
        </div>

      </div><!-- end .world-scene -->
    </div><!-- end .world-perspective -->

    <!-- Accessible skip to rooms -->
    <nav class="rooms-nav" aria-label="Room navigation">
      <button
        v-for="{ section } in portalLayout"
        :key="`nav-${section.id}`"
        class="rooms-nav__btn"
        :aria-current="currentRoom === section.id ? 'page' : undefined"
        @click="currentRoom === section.id ? goToHub() : goToRoom(section.id)"
      >{{ section.tab }}</button>
    </nav>

    <!-- HUD (back button + room label) -->
    <Transition name="hud">
      <div v-if="currentRoom !== 'hub'" class="world-hud">
        <button class="hud-back" @click="goToHub">← Hub</button>
        <span class="hud-room">{{ site.sections.find(s => s.id === currentRoom)?.tab }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ─── Stage ─── */
.world-stage {
  position: fixed;
  inset: 0;
  background: #ffffff;
  overflow: hidden;
}

/* ─── Fade overlay ─── */
.world-fade {
  position: absolute;
  inset: 0;
  background: #fff;
  pointer-events: none;
  z-index: 200;
  transition: opacity 0.5s ease;
}

/* ─── Perspective ─── */
.world-perspective {
  position: absolute;
  inset: 0;
  perspective: 1100px;
  perspective-origin: 50% 48%;
}

/* ─── Scene ─── */
.world-scene {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  will-change: transform;
}

/* ─── Hub hero (fixed overlay, outside 3D scene) ─── */
.hub-hero {
  position: fixed;
  top: calc(var(--nav-h) + 2rem);
  left: 50%;
  transform: translateX(-50%);
  width: min(640px, 90vw);
  text-align: center;
  pointer-events: none;
  user-select: none;
  z-index: 10;
}

.hub-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #777;
  margin-bottom: 1rem;
}

.hub-heading {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: #000000;
  margin: 0 0 0.9rem;
}

.hub-sub {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: #999;
  letter-spacing: 0.06em;
}

/* hub title enter/leave */
.hub-title-enter-active,
.hub-title-leave-active { transition: opacity 0.3s ease; }
.hub-title-enter-from,
.hub-title-leave-to { opacity: 0; }

/* ─── Portal cards ─── */
.world-portal {
  position: absolute;
  left: 50%;
  top: 50%;
  /* CSS vars --px / --py set by portalVars() */
  transform: translate3d(calc(-50% + var(--px)), calc(-50% + var(--py)), 0px);
  width: 200px;
  min-height: 86px;
  padding: 1rem 1.2rem;
  background: rgba(250, 250, 250, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: #000000;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.4rem;
  transition: border-color 0.22s ease, background 0.22s ease, transform 0.22s ease;
  backface-visibility: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.world-portal:hover {
  border-color: rgba(0, 0, 0, 0.25);
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translate3d(calc(-50% + var(--px)), calc(-50% + var(--py)), 18px);
}

.world-portal:focus-visible {
  outline: 2px solid #000;
  outline-offset: 3px;
}

.p-tab {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #000000;
}

.p-hint {
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: #666;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── Rooms ─── */
.world-room {
  position: absolute;
  left: 50%;
  top: 50%;
  /* CSS vars --rx / --ry / --rz set by roomVars() */
  transform: translate3d(calc(-50% + var(--rx)), calc(-50% + var(--ry)), var(--rz));
  width: min(680px, 88vw);
  backface-visibility: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.world-room.room--on {
  opacity: 1;
  pointer-events: auto;
}

.room-inner {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 2.5rem 2.75rem;
  min-height: 340px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.r-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #999;
  margin-bottom: 0.85rem;
}

.r-title {
  font-family: var(--font-display);
  font-size: clamp(1.55rem, 2.5vw, 2.1rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #000000;
  margin: 0 0 1.1rem;
}

.r-body {
  font-family: var(--font-body);
  font-size: 0.86rem;
  line-height: 1.72;
  color: #333;
  max-width: 52ch;
  margin: 0;
}

/* Skills */
.r-skills { margin-top: 1.4rem; display: flex; flex-direction: column; gap: 0.8rem; }

.sk-row {
  display: grid;
  grid-template-columns: 1fr 130px 32px;
  align-items: center;
  gap: 0.9rem;
}

.sk-name { font-family: var(--font-body); font-size: 0.8rem; color: #333; }

.sk-bar {
  height: 2px;
  background: rgba(0,0,0,0.08);
  overflow: hidden;
}

.sk-fill {
  height: 100%;
  background: rgba(0,0,0,0.4);
}

.sk-pct {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: #777;
  text-align: right;
}

/* Facts */
.r-facts {
  margin-top: 1.2rem;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.r-facts li {
  font-family: var(--font-body);
  font-size: 0.84rem;
  color: #555;
  line-height: 1.5;
  padding-left: 1.2rem;
  position: relative;
}

.r-facts li::before { content: '–'; position: absolute; left: 0; color: #bbb; }

/* Timeline */
.r-timeline { margin-top: 1.4rem; display: flex; flex-direction: column; gap: 1.2rem; }

.tl-row { display: grid; grid-template-columns: 80px 1fr; gap: 1rem; align-items: start; }

.tl-year { font-family: var(--font-mono); font-size: 0.65rem; color: #888; letter-spacing: 0.06em; padding-top: 0.1rem; }
.tl-role { font-family: var(--font-display); font-size: 0.87rem; font-weight: 700; color: #000; margin: 0 0 0.2rem; }
.tl-org { font-family: var(--font-body); font-size: 0.74rem; color: #666; margin: 0; }

/* Projects */
.r-projects {
  margin-top: 1.4rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.proj-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(0,0,0,0.02);
}

.proj-icon { font-size: 1.1rem; flex-shrink: 0; }
.proj-name { font-family: var(--font-body); font-size: 0.77rem; color: #333; margin: 0 0 0.2rem; }
.proj-tag {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  color: #999;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Quotes */
.r-quotes { margin-top: 1.4rem; display: flex; flex-direction: column; gap: 1.3rem; }

.quote {
  margin: 0;
  padding: 1.1rem 1.3rem;
  border-left: 1px solid rgba(0,0,0,0.1);
}

.quote p {
  font-family: var(--font-body);
  font-size: 0.87rem;
  color: #555;
  line-height: 1.65;
  margin: 0 0 0.5rem;
  font-style: italic;
}

.quote cite { font-family: var(--font-mono); font-size: 0.62rem; color: #999; letter-spacing: 0.1em; }

/* Contact */
.r-contact { margin-top: 2rem; }

.r-cta {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  text-decoration: none;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #000;
  padding-bottom: 0.2rem;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.r-cta:hover { border-color: #666; color: #333; }

/* Footer */
.r-footer { margin-top: 1.8rem; }
.footer-sig { font-family: var(--font-body); font-size: 0.82rem; color: #777; line-height: 1.55; margin: 0 0 0.4rem; }
.footer-copy { font-family: var(--font-mono); font-size: 0.6rem; color: #999; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }

/* Room exit */
.room-exit {
  margin-top: 1.4rem;
  display: block;
  background: none;
  border: none;
  color: #999;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.room-exit:hover { color: #333; }
.room-exit:focus-visible { outline: 2px solid #000; outline-offset: 4px; }

/* ─── Accessible room nav (visually hidden but keyboard accessible) ─── */
.rooms-nav {
  position: fixed;
  left: -9999px;
  top: 0;
  z-index: 300;
}

.rooms-nav:focus-within {
  left: var(--sz-4);
  top: var(--sz-4);
  display: flex;
  gap: var(--sz-2);
  flex-wrap: wrap;
  max-width: 600px;
  background: #ffffff;
  padding: var(--sz-2);
  border: 1px solid rgba(0,0,0,0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rooms-nav__btn {
  background: none;
  border: none;
  color: #777;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rooms-nav__btn[aria-current] { color: #000; }

/* ─── HUD ─── */
.world-hud {
  position: fixed;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1.4rem;
  z-index: 50;
}

.hud-back {
  background: rgba(250, 250, 250, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: #555;
  font-family: var(--font-mono);
  font-size: 0.67rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.hud-back:hover { color: #000; border-color: rgba(0,0,0,0.3); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); }
.hud-back:focus-visible { outline: 2px solid #000; outline-offset: 3px; }

.hud-room {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: #888;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* HUD transition */
.hud-enter-active,
.hud-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.hud-enter-from,
.hud-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .world-portal { transition: none; }
  .world-room { transition: none; }
  .world-fade { transition: none; }
}

/* ─── Tablet ─── */
@media (max-width: 1024px) {
  .world-portal { width: 165px; padding: 0.85rem 1rem; }
  .p-hint { font-size: 0.62rem; }
}

/* ─── Mobile ─── */
@media (max-width: 640px) {
  .hub-heading { font-size: 1.65rem; }
  .hub-sub { display: none; }

  .world-portal { width: 140px; min-height: 0; padding: 0.7rem 0.85rem; }
  .p-hint { display: none; }

  .world-room { width: 92vw; max-height: 80vh; overflow-y: auto; }
  .room-inner { padding: 1.5rem 1.25rem; }
  .r-title { font-size: 1.3rem; }
  .r-projects { grid-template-columns: 1fr; }
  .sk-row { grid-template-columns: 1fr 100px 28px; }
  .sk-bar { width: 100px; }

  .world-hud { bottom: 1.5rem; }
  .hud-room { display: none; }
}
</style>
