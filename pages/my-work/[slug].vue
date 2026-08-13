<script setup lang="ts">
import { useContentStore } from '~/stores/content'


const route        = useRoute()
const contentStore = useContentStore()
const slug         = route.params.slug as string

const item = computed(() =>
  contentStore.myWorkNav.find((n) => {
    const hrefSlug = n.href?.replace(/^\/my-work\//, '')
    return n.id === slug || hrefSlug === slug
  })
)

if (!item.value) throw createError({ statusCode: 404 })
</script>

<template>
  <UiContentShell v-if="item" eyebrow="My Work" :title="item.label" :deck="item.description">
    <UiConstructionZone />
  </UiContentShell>
</template>
