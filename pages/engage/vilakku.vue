<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Vilakku · Engage',
  description: 'A locked room in a Kerala monsoon. 1994. The lamp is the only honest light.',
  ogUrl: 'https://entertrainer.in/engage/vilakku',
})

useHead({
  htmlAttrs: {
    style: 'background:#000;height:100%;font-size:16px',
  },
  bodyAttrs: {
    style: 'background:#000;margin:0;height:100%;overscroll-behavior:none',
  },
  meta: [
    { name: 'theme-color', content: '#000000' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no' },
  ],
})

const host = ref<HTMLElement | null>(null)
let handle: { dispose: () => void } | null = null
let prevHtmlFontSize: string | null = null
let prevHtmlFontSizePriority = ''
let prevNuxtHeight = ''
let prevNuxtMargin = ''
let prevNuxtBg = ''

onMounted(async () => {
  const html = document.documentElement
  html.classList.add('vilakku-rem')
  const existing = html.style.getPropertyValue('font-size')
  const existingPri = html.style.getPropertyPriority('font-size')
  if (existing && !(existing === '16px' && existingPri !== 'important')) {
    prevHtmlFontSize = existing
    prevHtmlFontSizePriority = existingPri
  }
  html.style.setProperty('font-size', '16px', 'important')
  const nuxt = document.getElementById('__nuxt')
  if (nuxt) {
    prevNuxtHeight = nuxt.style.height
    prevNuxtMargin = nuxt.style.margin
    prevNuxtBg = nuxt.style.background
    nuxt.style.height = '100%'
    nuxt.style.margin = '0'
    nuxt.style.background = '#000'
  }
  if (!host.value) return
  const { createVilakku } = await import('../../vilakku/game.js')
  handle = createVilakku(host.value)
})

onUnmounted(() => {
  handle?.dispose()
  handle = null
  const html = document.documentElement
  html.classList.remove('vilakku-rem')
  html.style.removeProperty('font-size')
  if (prevHtmlFontSize != null) {
    html.style.setProperty('font-size', prevHtmlFontSize, prevHtmlFontSizePriority || undefined)
  }
  const nuxt = document.getElementById('__nuxt')
  if (nuxt) {
    nuxt.style.height = prevNuxtHeight
    nuxt.style.margin = prevNuxtMargin
    nuxt.style.background = prevNuxtBg
  }
})
</script>

<template>
  <div ref="host" id="vilakku-host" class="vilakku-host" />
</template>

<style scoped>
.vilakku-host {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh;
  margin: 0;
  background: #000;
  overflow: hidden;
  touch-action: none;
}
</style>
