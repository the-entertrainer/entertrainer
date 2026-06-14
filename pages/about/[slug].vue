<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const route        = useRoute()
const contentStore = useContentStore()
const slug         = route.params.slug as string

const item = computed(() =>
  contentStore.aboutNav.find((n) => n.id === slug)
)

if (!item.value) throw createError({ statusCode: 404 })
</script>

<template>
  <div v-if="item" class="detail-page">
    <NuxtLink to="/" class="back-btn">← back</NuxtLink>
    <h1 class="detail-title">{{ item.label }}</h1>
    <p class="detail-desc">{{ item.description }}</p>
    <div class="detail-content">
      <p class="placeholder-text">Content coming soon — this section is being crafted.</p>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100dvh;
  background: var(--color-black);
  color: var(--color-white);
  padding: calc(var(--safe-top) + 80rem) var(--grid-margin) calc(var(--safe-bottom) + 80rem);
}
.back-btn {
  display: inline-block;
  font-size: 16rem;
  font-weight: 500;
  color: var(--color-white);
  opacity: 0.5;
  text-decoration: none;
  margin-bottom: 60rem;
  transition: opacity 0.2s ease;
}
.back-btn:hover { opacity: 1; }
.detail-title {
  font-size: clamp(60rem, 8vw, 120rem);
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 24rem;
}
.detail-desc {
  font-size: 20rem;
  font-weight: 500;
  opacity: 0.5;
  margin-bottom: 60rem;
  max-width: 540rem;
  line-height: 1.5;
}
.detail-content {
  border-top: 1px solid var(--color-white20);
  padding-top: 60rem;
}
.placeholder-text {
  font-size: 18rem;
  opacity: 0.3;
  font-style: italic;
}
</style>
