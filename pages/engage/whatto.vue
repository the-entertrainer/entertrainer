<script setup lang="ts">
/**
 * WHATTO: live crypto rebound signals for Engage.
 * Client-only app (live websockets + localStorage). See docs/whatto/ARCHITECTURE.md.
 */
import '~/assets/css/whatto.css'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Whatto · Engage',
  description: 'Live crypto rebound signals with the odds shown. Real Binance data, a backtested model, and plain words.',
  ogUrl: 'https://entertrainer.in/engage/whatto',
  // Unlisted page: shareable by direct link, never indexed or followed.
  robots: 'noindex, nofollow',
})

useHead({
  meta: [
    { name: 'theme-color', content: '#FFF7FB' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'mobile-web-app-capable', content: 'yes' },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/whatto-icon.svg' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/whatto-icon-192.png' },
  ],
  bodyAttrs: { style: 'background:#FFF7FB' },
})
</script>

<template>
  <ClientOnly>
    <WhattoApp />
    <template #fallback>
      <div class="wt">
        <div class="wt-shell" style="padding-top: 80px">
          <div class="wt-skeleton" style="height: 120px" />
          <div class="wt-skeleton" style="height: 260px; margin-top: 14px" />
        </div>
      </div>
    </template>
  </ClientOnly>
</template>
