export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Server-only — set via GIPHY_API_KEY env var (Vercel project settings).
    // When absent, /api/giphy serves a curated fallback manifest.
    giphyApiKey: process.env.GIPHY_API_KEY || ''
  },
  app: {
    head: {
      title: 'Entertrainer',
      script: [
        {
          innerHTML: `(function(){var t=localStorage.getItem('et-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;})();`
        }
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0D0C0A' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Entertrainer' },
        { name: 'msapplication-TileColor', content: '#0D0C0A' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,100..900&display=swap' }
      ]
    },
    pageTransition: false,
    layoutTransition: false
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Entertrainer',
      short_name: 'Entertrainer',
      description: 'Instructional Design & E-Learning',
      theme_color: '#0D0C0A',
      background_color: '#0D0C0A',
      display: 'standalone',
      orientation: 'any',
      scope: '/',
      start_url: '/',
      icons: [
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      runtimeCaching: [
        {
          urlPattern: /^\/api\/.*/,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
        }
      ]
    },
    client: { installPrompt: false },
    devOptions: { enabled: false }
  },
  ssr: false,
  nitro: {
    preset: 'vercel',
    externals: {
      // Keep Playwright deps external in case the pw backup is ever re-enabled
      external: ['playwright-core', '@sparticuz/chromium', 'satori', '@resvg/resvg-js', 'pdf-lib'],
    },
    vercel: {
      functions: {
        maxDuration: 60,
      },
    },
  }
})
