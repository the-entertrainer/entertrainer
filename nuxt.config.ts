export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@vueuse/motion/nuxt'],
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
          innerHTML: `(function(){var t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t;})();`
        }
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Entertrainer is the portfolio of Naveen Jose, a certified instructional designer building learning experiences that feel human — plus a set of free web apps for L&D teams.' },
        { name: 'theme-color', content: '#0D0C0A', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#F5EFE8', media: '(prefers-color-scheme: light)' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Entertrainer' },
        { name: 'msapplication-TileColor', content: '#0D0C0A' },
        // Open Graph / Twitter — social share preview.
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Entertrainer' },
        { property: 'og:title', content: 'Entertrainer — Instructional Design by Naveen Jose' },
        { property: 'og:description', content: 'Learning experiences that feel human, plus free web apps for L&D teams.' },
        { property: 'og:url', content: 'https://entertrainer.in/' },
        { property: 'og:image', content: 'https://entertrainer.in/og-card.png' },
        { property: 'og:image:width', content: '2400' },
        { property: 'og:image:height', content: '1260' },
        { property: 'og:image:alt', content: 'Entertrainer — instructional design that feels human, by Naveen Jose' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Entertrainer — Instructional Design by Naveen Jose' },
        { name: 'twitter:description', content: 'Learning experiences that feel human, plus free web apps for L&D teams.' },
        { name: 'twitter:image', content: 'https://entertrainer.in/og-card.png' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,100..900&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&display=swap' }
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
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ],
      shortcuts: [
        {
          name: 'StoryGen — Storyboard Studio',
          short_name: 'StoryGen',
          description: 'Design instructional storyboards on an infinite canvas',
          url: '/tools/storygen',
          icons: [{ src: '/storygen-icon-192.png', sizes: '192x192', type: 'image/png' }]
        },
        {
          name: 'Cadence — Training Calendar',
          short_name: 'Cadence',
          description: 'Turn a list of topics into a ready-to-present monthly training calendar',
          url: '/tools/cadence',
          icons: [{ src: '/cadence-icon-192.png', sizes: '192x192', type: 'image/png' }]
        },
        {
          name: 'EasyMCQ — Distractor Generator',
          short_name: 'EasyMCQ',
          description: 'Turn correct answers into brilliant, plausible wrong options',
          url: '/tools/easymcq',
          icons: [{ src: '/easymcq-icon-192.png', sizes: '192x192', type: 'image/png' }]
        },
        {
          name: 'Draftly — Email Polisher',
          short_name: 'Draftly',
          description: 'Turn messy drafts into clear, professional emails',
          url: '/tools/better-emails',
          icons: [{ src: '/draftly-icon-192.png', sizes: '192x192', type: 'image/png' }]
        }
      ]
    },
    workbox: {
      // A new deploy's service worker must take over immediately — without
      // this, an open tab (or an installed PWA) can keep serving every JS
      // chunk from the PREVIOUS deploy indefinitely, since the browser only
      // swaps controllers once all old-SW-controlled tabs close naturally.
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
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
  routeRules: {
    '/tools/training-cal-gen': { redirect: { to: '/tools/cadence', statusCode: 301 } },
    '/tools/storyforge-id': { redirect: { to: '/tools/storygen', statusCode: 301 } }
  },
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
