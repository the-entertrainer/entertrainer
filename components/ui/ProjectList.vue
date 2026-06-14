<script setup lang="ts">
import gsap from 'gsap'
import type { Project } from '~/stores/content'

defineProps<{ projects: Project[] }>()

const listEl = ref<HTMLElement | null>(null)
const cursorX = ref(0)
const cursorY = ref(0)
const cursorVisible = ref(false)
const hoveredProject = ref<Project | null>(null)

function onEnter(el: Element, done: () => void) {
  const items = (el as HTMLElement).querySelectorAll('.project-row')
  gsap.fromTo(
    items,
    { y: -30, opacity: 0, scaleY: 0.5 },
    { y: 0, opacity: 1, scaleY: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05, delay: 0.2, onComplete: done }
  )
}

function onLeave(el: Element, done: () => void) {
  const items = (el as HTMLElement).querySelectorAll('.project-row')
  gsap.fromTo(
    items,
    { y: 0, opacity: 1 },
    { y: 50, opacity: 0, scaleY: 0.5, duration: 0.3, ease: 'power3.out', stagger: 0.05, onComplete: done }
  )
}

function onMouseMove(e: MouseEvent) {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
}
function onProjectEnter(project: Project) {
  hoveredProject.value = project
  cursorVisible.value = true
}
function onProjectLeave() {
  cursorVisible.value = false
  hoveredProject.value = null
}
</script>

<template>
  <div class="project-list" ref="listEl" @mousemove="onMouseMove">
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div class="list-inner" key="list">
        <NuxtLink
          v-for="project in projects"
          :key="project.slug"
          :to="`/projects/${project.slug}`"
          class="project-row"
          @mouseenter="onProjectEnter(project)"
          @mouseleave="onProjectLeave"
        >
          <span class="project-row__index">{{ String(projects.indexOf(project) + 1).padStart(2, '0') }}</span>
          <span class="project-row__title">{{ project.title }}</span>
          <span class="project-row__year">{{ project.year }}</span>
          <span class="project-row__arrow">→</span>
        </NuxtLink>
      </div>
    </Transition>

    <!-- Cursor image follower -->
    <div
      class="cursor-preview"
      :class="{ visible: cursorVisible }"
      :style="{
        transform: `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-25%, -75%)`,
        background: hoveredProject?.color
      }"
    >
      <span v-if="hoveredProject">{{ hoveredProject.title }}</span>
    </div>
  </div>
</template>

<style scoped>
.project-list {
  width: 100%;
  position: relative;
}
.list-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.project-row {
  display: flex;
  align-items: baseline;
  gap: 24rem;
  padding: 24rem 0;
  border-bottom: 1px solid var(--color-white20);
  text-decoration: none;
  color: var(--color-white);
  transition: opacity 0.2s ease, padding-left 0.3s var(--ease-spring);
}
.project-row:first-child {
  border-top: 1px solid var(--color-white20);
}
.project-row:hover {
  padding-left: 16rem;
}
.project-row__index {
  font-size: 14rem;
  opacity: 0.4;
  min-width: 32rem;
}
.project-row__title {
  font-size: 48rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  flex: 1;
}
.project-row__year {
  font-size: 14rem;
  opacity: 0.4;
}
.project-row__arrow {
  font-size: 24rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.project-row:hover .project-row__arrow { opacity: 1; }

.cursor-preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  pointer-events: none;
  width: 200rem;
  aspect-ratio: 16/9;
  border-radius: var(--radius-m);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rem;
  font-weight: 600;
  color: var(--color-white);
  opacity: 0;
  scale: 0.8;
  transition: opacity 0.3s ease, scale 0.3s var(--ease-spring);
  will-change: transform;
}
.cursor-preview.visible {
  opacity: 1;
  scale: 1;
}
</style>
