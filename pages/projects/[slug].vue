<script setup lang="ts">
import { useContentStore } from '~/stores/content'

const route = useRoute()
const contentStore = useContentStore()
const project = computed(() => contentStore.getProjectBySlug(route.params.slug as string))
const showVideo = ref(false)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}
</script>

<template>
  <div v-if="project" class="project-page">
    <!-- Nav -->
    <header class="project-header">
      <NuxtLink to="/" class="back-btn">← back to works</NuxtLink>
    </header>

    <!-- Hero info -->
    <div class="project-body">
      <div class="header">
        <h1 class="title">{{ project.title }}</h1>
        <span class="year">{{ project.year }}</span>
      </div>
      <p class="desc">{{ project.shortDescription }}</p>

      <!-- Video placeholder -->
      <div class="video-placeholder" :style="{ background: project.color }">
        <div v-if="!showVideo" class="video-overlay" @click="showVideo = true">
          <div class="play-circle">
            <span class="play-icon">▶</span>
          </div>
          <p class="video-label">play project film</p>
        </div>
        <div v-else class="video-playing">
          <p>[ video would play here ]</p>
          <button class="close-video" @click="showVideo = false">× close</button>
        </div>
      </div>

      <!-- Project details -->
      <div class="project-details">
        <div class="detail-item">
          <span class="detail-label">year</span>
          <span class="detail-value">{{ project.year }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">category</span>
          <span class="detail-value">motion design</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-page {
  min-height: 100dvh;
  background: var(--color-black);
  color: var(--color-white);
  padding: 0 var(--grid-margin);
  padding-bottom: 80rem;
}
.project-header {
  padding-top: 20rem;
  padding-bottom: 40rem;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  padding: 10rem 20rem;
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: var(--color-black);
  font-family: var(--main-font);
  font-size: 16rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.3s var(--ease-spring);
}
.back-btn:hover { transform: scale(1.05); }

.project-body { max-width: 1200rem; }

.header {
  display: flex;
  align-items: baseline;
  gap: 24rem;
  margin-top: 60rem;
}
.title {
  font-size: clamp(60rem, 8vw, 120rem);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1;
}
.year {
  font-size: 24rem;
  opacity: 0.5;
}
.desc {
  margin-top: 30rem;
  max-width: 640rem;
  font-size: 20rem;
  font-weight: 500;
  line-height: 1.6;
  opacity: 0.8;
}
.video-placeholder {
  margin-top: 60rem;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-l);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.video-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rem;
  cursor: pointer;
}
.play-circle {
  width: 80rem;
  height: 80rem;
  border-radius: 50%;
  border: 2px solid rgba(250,250,250,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s var(--ease-spring), border-color 0.2s ease;
}
.video-overlay:hover .play-circle {
  transform: scale(1.1);
  border-color: var(--color-white);
}
.play-icon { font-size: 28rem; color: var(--color-white); }
.video-label {
  font-size: 18rem;
  font-weight: 500;
  color: var(--color-white);
  opacity: 0.8;
}
.video-playing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rem;
}
.video-playing p {
  font-size: 24rem;
  font-weight: 500;
  color: rgba(250,250,250,0.6);
}
.close-video {
  background: rgba(250,250,250,0.1);
  border: 1px solid var(--color-white20);
  border-radius: var(--radius-full);
  color: var(--color-white);
  font-family: var(--main-font);
  font-size: 16rem;
  font-weight: 500;
  padding: 8rem 20rem;
  cursor: pointer;
  transition: background 0.2s ease;
}
.close-video:hover { background: rgba(250,250,250,0.2); }

.project-details {
  margin-top: 60rem;
  display: flex;
  gap: 60rem;
  border-top: 1px solid var(--color-white20);
  padding-top: 30rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6rem;
}
.detail-label {
  font-size: 12rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.4;
}
.detail-value {
  font-size: 20rem;
  font-weight: 600;
}
</style>
