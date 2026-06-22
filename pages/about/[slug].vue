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
    <h1 class="detail-title">{{ item.label }}</h1>
    <p class="detail-desc">{{ item.description }}</p>
    <div class="detail-content">
      <p class="placeholder-text">Content coming soon — this section is being crafted.</p>
    </div>
  </div>
</template>
