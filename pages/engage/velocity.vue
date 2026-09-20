<script setup lang="ts">
import type { Root } from 'react-dom/client'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Velocity · Engage',
  description: 'The speeds you already have — Earth spin, solar orbit, galactic ride, CMB frame.',
  ogUrl: 'https://entertrainer.in/engage/velocity',
  ogImage: 'https://entertrainer.in/og-velocity.jpg',
  twitterCard: 'summary_large_image',
})

useHead({
  htmlAttrs: {
    style: 'background:#02040c;height:100%;font-size:16px;color-scheme:dark',
  },
  bodyAttrs: {
    style: 'background:#02040c;margin:0;height:100%;overscroll-behavior:none',
  },
  meta: [
    { name: 'theme-color', content: '#02040c' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no' },
  ],
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/velocity-icon.svg' }],
})

const host = ref<HTMLElement | null>(null)
let root: Root | null = null
let prevHtmlFontSize: string | null = null
let prevHtmlFontSizePriority = ''
let prevNuxtHeight = ''
let prevNuxtMargin = ''
let prevNuxtBg = ''

onMounted(async () => {
  const html = document.documentElement
  const existing = html.style.getPropertyValue('font-size')
  const existingPri = html.style.getPropertyPriority('font-size')
  if (existing && !(existing === '16px' && existingPri !== 'important')) {
    prevHtmlFontSize = existing
    prevHtmlFontSizePriority = existingPri
  }
  html.classList.add('velocity-rem')
  html.style.setProperty('font-size', '16px', 'important')
  const nuxt = document.getElementById('__nuxt')
  if (nuxt) {
    prevNuxtHeight = nuxt.style.height
    prevNuxtMargin = nuxt.style.margin
    prevNuxtBg = nuxt.style.background
    nuxt.style.height = '100%'
    nuxt.style.margin = '0'
  }
  if (!host.value) return
  const [{ createRoot }, { createElement }, { VelocityApp }] = await Promise.all([
    import('react-dom/client'),
    import('react'),
    import('@velocity/VelocityApp'),
  ])
  root = createRoot(host.value)
  root.render(createElement(VelocityApp))
})

onUnmounted(() => {
  root?.unmount()
  root = null
  const html = document.documentElement
  html.classList.remove('velocity-rem')
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
  <div ref="host" id="velocity-host" class="velocity-host" />
</template>

<style scoped>
.velocity-host {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh;
  margin: 0;
  background: #02040c;
  overflow: hidden;
  touch-action: none;
}
</style>
