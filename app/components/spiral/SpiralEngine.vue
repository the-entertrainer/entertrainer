<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useContent } from '~/composables/useContent'
import { useViewMode } from '~/composables/useViewMode'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { useGsap } from '~/composables/useGsap'
import { useDrag } from '~/composables/useDrag'
import { useSpiral, DEFAULT_CONFIG, type SpiralConfig } from '~/composables/useSpiral'

const site = useContent()
const sections = site.sections

const { mode, isAnimating } = useViewMode()
const motion = useReducedMotion()
const { width } = useWindowSize()

const stageRef = ref<HTMLElement | null>(null)
const panelEls = ref<HTMLElement[]>([])
const isDragging = ref(false)

// Collect panel elements in order (function ref keeps array dense & ordered).
function setPanelRef(el: Element | null, i: number) {
  if (el) panelEls.value[i] = el as HTMLElement
}

// Responsive spiral config — looser, more vertical spread on mobile
const responsiveConfig = computed<Partial<SpiralConfig>>(() => {
  if (width.value < 640) {
    return { 
      coilSpacing: 120, 
      arcSpan: 2.2,
      yFlatten: 0.85
    }
  }
  if (width.value < 1024) return { coilSpacing: 90, arcSpan: 2.3 }
  return { coilSpacing: 98, arcSpan: 2.6 }
})

const snapMode = computed(() => motion.isTouch.value && width.value < 1024)

let spiral: ReturnType<typeof useSpiral> | null = null
let drag: ReturnType<typeof useDrag> | null = null
let gsapRef: ReturnType<typeof useGsap>['gsap'] | null = null
let FlipRef: ReturnType<typeof useGsap>['Flip'] | null = null

onMounted(async () => {
  const { gsap, Flip } = useGsap()
  gsapRef = gsap
  FlipRef = Flip

  if (document.fonts?.ready) await document.fonts.ready

  spiral = useSpiral({
    count: () => sections.length,
    containerRef: stageRef,
    panelRefs: panelEls,
    enabled: () => mode.value === 'spiral',
    reducedMotion: () => motion.prefersReducedMotion.value,
    snapMode: () => snapMode.value,
    config: responsiveConfig.value,
    gsap,
  })

  // Mobile-optimized drag with threshold
  drag = useDrag(stageRef, {
    threshold: width.value < 1024 ? 12 : 6,
    onStart: () => {
      isDragging.value = true
      spiral?.dragStart()
    },
    onDelta: (dx) => spiral?.dragDelta(dx),
    onEnd: (vel) => {
      isDragging.value = false
      spiral?.dragEnd()
    },
  })
  drag.attach()

  spiral.start()

  window.addEventListener('resize', onResize, { passive: true })
})

function onResize() {
  spiral?.measure()
  spiral?.applyTransforms()
}

onBeforeUnmount(() => {
  spiral?.destroy()
  window.removeEventListener('resize', onResize)
})

watch(responsiveConfig, () => {
  Object.assign(spiral?.config ?? {}, DEFAULT_CONFIG, responsiveConfig.value)
  spiral?.measure()
  spiral?.applyTransforms()
})

// View-mode transitions
watch(mode, async (next, prev) => {
  if (!gsapRef || !FlipRef) return
  const panels = panelEls.value.filter(Boolean)
  isAnimating.value = true

  const leavingSpiral = prev === 'spiral'
  const enteringSpiral = next === 'spiral'

  if (leavingSpiral) {
    await gsapRef.to(panels, {
      opacity: 0,
      scale: 0.85,
      duration: 0.28,
      stagger: 0.02,
      ease: 'power2.in',
    })
    spiral?.pause()
    panels.forEach((p) => {
      p.style.transform = ''
      p.style.zIndex = ''
      p.style.opacity = ''
    })
  }

  await nextTick()

  if (enteringSpiral) {
    gsapRef.set(panels, { opacity: 0 })
    spiral?.resume()
    spiral?.measure()
    spiral?.applyTransforms()
    gsapRef.fromTo(
      panels,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'opacity' },
    )
    spiral?.armIdle()
  } else {
    const state = prev === 'spiral' ? null : FlipRef.getState(panels)
    await nextTick()
    if (state) {
      FlipRef.from(state, {
        duration: 0.6,
        ease: 'power3.inOut',
        stagger: 0.02,
        absolute: true,
      })
    } else {
      gsapRef.fromTo(
        panels,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', clearProps: 'all' },
      )
    }
  }

  gsapRef.delayedCall(0.65, () => { isAnimating.value = false })
})

function onKey(e: KeyboardEvent) {
  if (mode.value !== 'spiral') return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { spiral?.next(); e.preventDefault() }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { spiral?.prev(); e.preventDefault() }
}
</script>

<template>
  <div
    ref="stageRef"
    class="stage"
    :class="[`is-${mode}`, { 'is-dragging': isDragging }]"
    tabindex="0"
    role="application"
    :aria-label="`Project spiral — ${mode} view. Use arrow keys to rotate, or switch layout with the toggle.`"
    @keydown="onKey"
  >
    <Panel
      v-for="(section, i) in sections"
      :key="section.id"
      :ref="(el) => setPanelRef((el as any)?.$el ?? el, i)"
      class="stage__panel"
      :section="section"
      :index="i"
    />

    <p v-if="mode === 'spiral'" class="stage__hint" aria-hidden="true">
      {{ snapMode ? 'Swipe horizontally to explore' : 'Drag to rotate · arrow keys too' }}
    </p>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  outline: none;
  transition: transform 0.1s ease-out;
}

/* Micro-interaction: subtle lift + stronger glow while dragging on mobile */
.stage.is-dragging {
  transform: scale(0.985);
}

.stage.is-dragging .stage__panel {
  box-shadow: 0 0 40px rgba(0, 240, 255, 0.25);
  transition: box-shadow 0.1s ease-out;
}

/* SPIRAL */
.stage.is-spiral {
  height: min(66vh, 620px);
  touch-action: pan-y;
  overflow: hidden;
  cursor: grab;
}
.stage.is-spiral:active { cursor: grabbing; }

.stage.is-spiral .stage__panel {
  position: absolute;
  top: 0;
  left: 0;
  width: clamp(138px, 35vw, 195px);
  height: clamp(168px, 40vw, 235px);
  will-change: transform, opacity;
  transition: box-shadow 0.2s ease;
}

/* GRID */
.stage.is-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--sz-6);
  padding-block: var(--sz-8);
}
.stage.is-grid .stage__panel {
  position: relative;
  height: 340px;
  will-change: auto;
}

/* LIST */
.stage.is-list {
  display: flex;
  flex-direction: column;
  gap: var(--sz-4);
  padding-block: var(--sz-8);
  max-width: 860px;
  margin-inline: auto;
}
.stage.is-list .stage__panel {
  position: relative;
  min-height: 160px;
  will-change: auto;
}

.stage__hint {
  position: absolute;
  bottom: var(--sz-4);
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  opacity: 0.7;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .stage.is-spiral { height: auto; display: flex; flex-direction: column; gap: var(--sz-4); }
  .stage.is-spiral .stage__panel { position: relative; width: 100%; height: auto; min-height: 200px; }
}

@media (max-width: 640px) {
  .stage.is-spiral {
    height: min(62vh, 520px);
  }
}
</style>
