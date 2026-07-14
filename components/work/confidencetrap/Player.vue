<script setup lang="ts">
import type { CtView } from '~/types/confidenceTrap'
import CtIcon from './Icon.vue'

export interface CtSlide {
  id: CtView
  label: string
}

const props = defineProps<{
  slides: CtSlide[]
  currentView: CtView
  visited: CtView[]
}>()

const emit = defineEmits<{ navigate: [view: CtView] }>()

const menuOpen = ref(false)

const currentIndex = computed(() => props.slides.findIndex(s => s.id === props.currentView))
const currentSlide = computed(() => props.slides[currentIndex.value])
const canPrev = computed(() => currentIndex.value > 0)
const canNext = computed(() => currentIndex.value < props.slides.length - 1)
const progressPct = computed(() => Math.round((props.visited.length / props.slides.length) * 100))

function prev() {
  if (canPrev.value) emit('navigate', props.slides[currentIndex.value - 1].id)
}
function next() {
  if (canNext.value) emit('navigate', props.slides[currentIndex.value + 1].id)
}
function jump(id: CtView) {
  emit('navigate', id)
  menuOpen.value = false
}
</script>

<template>
  <div class="ct-player">
    <div class="ct-player__progress"><span :style="{ width: progressPct + '%' }" /></div>
    <div class="ct-player__bar">
      <button type="button" class="ct-player__menu-btn" :aria-expanded="menuOpen" @click="menuOpen = true">
        <CtIcon name="menu" :size="16" />
        <span class="ct-player__menu-label">Menu</span>
      </button>

      <div class="ct-player__status">
        <span class="ct-player__slide-label">{{ currentSlide?.label }}</span>
        <span class="ct-player__slide-count">Slide {{ currentIndex + 1 }} of {{ slides.length }}</span>
      </div>

      <div class="ct-player__nav">
        <button type="button" class="ct-player__nav-btn" :disabled="!canPrev" aria-label="Previous slide" @click="prev">
          <CtIcon name="chevron-left" :size="15" />
          <span class="ct-player__nav-text">Prev</span>
        </button>
        <button type="button" class="ct-player__nav-btn" :disabled="!canNext" aria-label="Next slide" @click="next">
          <span class="ct-player__nav-text">Next</span>
          <CtIcon name="chevron-right" :size="15" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="ct-fade">
        <div v-if="menuOpen" class="ct-player__overlay" @click.self="menuOpen = false">
          <Transition name="ct-slide">
            <nav v-if="menuOpen" class="ct-player__drawer" aria-label="Course outline">
              <div class="ct-player__drawer-head">
                <p class="ct-player__drawer-title">Outline</p>
                <button type="button" class="ct-player__drawer-close" aria-label="Close menu" @click="menuOpen = false">
                  <CtIcon name="close" :size="16" />
                </button>
              </div>
              <ol class="ct-player__drawer-list">
                <li v-for="(slide, i) in slides" :key="slide.id">
                  <button
                    type="button"
                    class="ct-player__drawer-item"
                    :class="{ 'ct-player__drawer-item--current': slide.id === currentView }"
                    @click="jump(slide.id)"
                  >
                    <span class="ct-player__drawer-number">{{ i + 1 }}</span>
                    <span class="ct-player__drawer-item-label">{{ slide.label }}</span>
                    <span
                      class="ct-player__drawer-dot"
                      :class="{ 'ct-player__drawer-dot--visited': visited.includes(slide.id) }"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              </ol>
            </nav>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ct-player__progress {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(60rem + var(--safe-bottom));
  height: 2px;
  background: var(--ct-border);
  z-index: 41;
}
.ct-player__progress span {
  display: block;
  height: 100%;
  background: var(--ct-graphite);
  transition: width 0.4s ease;
}

.ct-player__bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 60rem;
  padding-bottom: var(--safe-bottom);
  display: flex;
  align-items: center;
  gap: 14rem;
  padding-left: 18rem;
  padding-right: 18rem;
  background: var(--ct-sand);
  border-top: 1px solid var(--ct-border);
  z-index: 41;
}

.ct-player__menu-btn {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  padding: 9rem 12rem;
  border-radius: 3rem;
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-graphite);
  flex-shrink: 0;
}
@media (hover: hover) {
  .ct-player__menu-btn:hover { background: var(--ct-bone); }
}
.ct-player__menu-btn:focus-visible { outline: 2px solid var(--ct-graphite); outline-offset: 2px; }

.ct-player__status {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: center;
}
.ct-player__slide-label {
  font-family: var(--ct-sans);
  font-weight: 500;
  font-size: 13rem;
  color: var(--ct-graphite);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ct-player__slide-count {
  font-family: var(--ct-sans);
  font-size: 11rem;
  color: var(--ct-secondary-on-card);
}

.ct-player__nav {
  display: flex;
  gap: 6rem;
  flex-shrink: 0;
}
.ct-player__nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 9rem 14rem;
  border-radius: 3rem;
  border: 1px solid var(--ct-border);
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-graphite);
  background: var(--ct-bone);
}
@media (hover: hover) {
  .ct-player__nav-btn:not(:disabled):hover { border-color: var(--ct-secondary); }
}
.ct-player__nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ct-player__nav-btn:focus-visible { outline: 2px solid var(--ct-graphite); outline-offset: 2px; }

.ct-player__overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(58, 54, 50, 0.35);
}
.ct-player__drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(340rem, 86vw);
  background: var(--ct-bone);
  border-right: 1px solid var(--ct-border);
  display: flex;
  flex-direction: column;
  padding: 22rem 0 0;
}
.ct-player__drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rem 18rem;
  border-bottom: 1px solid var(--ct-border);
}
.ct-player__drawer-title {
  font-family: var(--ct-serif);
  font-size: 18rem;
  font-weight: 600;
  color: var(--ct-graphite);
}
.ct-player__drawer-close {
  width: 30rem;
  height: 30rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--ct-secondary);
}
@media (hover: hover) {
  .ct-player__drawer-close:hover { background: var(--ct-sand); color: var(--ct-graphite); }
}

.ct-player__drawer-list { list-style: none; padding: 8rem 0; overflow-y: auto; }
.ct-player__drawer-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14rem;
  padding: 13rem 20rem;
  text-align: left;
  font-family: var(--ct-sans);
  font-size: 14.5rem;
  color: var(--ct-graphite);
}
@media (hover: hover) {
  .ct-player__drawer-item:hover { background: var(--ct-sand); }
}
.ct-player__drawer-item--current { background: var(--ct-sand); font-weight: 600; }
.ct-player__drawer-number {
  font-family: var(--ct-sans);
  font-size: 12rem;
  color: var(--ct-secondary-on-card);
  width: 16rem;
  flex-shrink: 0;
}
.ct-player__drawer-item-label { flex: 1; }
.ct-player__drawer-dot {
  display: block;
  width: 9rem;
  height: 9rem;
  border-radius: 50%;
  border: 1.5px solid var(--ct-secondary);
  flex-shrink: 0;
}
.ct-player__drawer-dot--visited { background: var(--ct-graphite); border-color: var(--ct-graphite); }

.ct-fade-enter-active, .ct-fade-leave-active { transition: opacity 0.2s ease; }
.ct-fade-enter-from, .ct-fade-leave-to { opacity: 0; }
.ct-slide-enter-active, .ct-slide-leave-active { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
.ct-slide-enter-from, .ct-slide-leave-to { transform: translateX(-100%); }

@media (prefers-reduced-motion: reduce) {
  .ct-player__progress span { transition: none; }
  .ct-fade-enter-active, .ct-fade-leave-active, .ct-slide-enter-active, .ct-slide-leave-active { transition: none; }
}

@media (max-width: 560px) {
  .ct-player__menu-label { display: none; }
  .ct-player__nav-text { display: none; }
  .ct-player__slide-label { font-size: 12rem; }
  .ct-player__bar { padding-left: 12rem; padding-right: 12rem; gap: 8rem; }
  .ct-player__nav-btn { padding: 9rem 11rem; }
}
</style>
