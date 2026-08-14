export default defineNuxtConfig({
  devtools: { enabled: false },
  // @vueuse/motion is gone with the reveal composable it powered: every
  // entrance on the site is now CSS (see .u-reveal / .t-fade-up in main.css),
  // which cannot leave content invisible when JavaScript is slow or an
  // observer never fires.
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],
  // Faces first, then the system that uses them.
  css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],
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
          // Stamp the theme before first paint. Reads the stored choice first,
          // then the OS, so a reader who picked dark never gets a flash of
          // paper on the way in. stores/theme.ts owns it from mount onwards.
          innerHTML: `(function(){try{var s=localStorage.getItem('et-theme');if(s==='dark'||s==='light'){document.documentElement.dataset.theme=s;return}}catch(e){}document.documentElement.dataset.theme=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';})();`
        }
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Entertrainer is the portfolio of Naveen Jose, a certified instructional designer building learning experiences that feel human — plus a set of free web apps for L&D teams.' },
        { name: 'theme-color', content: '#131210', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#FFFDF7', media: '(prefers-color-scheme: light)' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Entertrainer' },
        { name: 'msapplication-TileColor', content: '#F36B5F' },
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
        // Two preloads, not sixteen. Space Grotesk sets every interface
        // string on the site and Bangers sets the headline, so those two
        // files are on the critical path for the first screen; the rest
        // (mono, serif, the hand, and every latin-ext cut) are requested by
        // the CSS when something actually needs them.
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: 'anonymous',
          href: '/fonts/webfonts/space-grotesk-var-latin.woff2' },
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: 'anonymous',
          href: '/fonts/webfonts/bangers-400-latin.woff2' },
        // Five faces, five jobs, all open-source (SIL OFL) and all
        // self-hosted — see assets/css/fonts.css:
        //
        //   Bangers        display — headlines, the nameplate, card titles
        //   Space Grotesk  interface — navigation, buttons, labels, tool UI
        //   Source Serif 4 reading — decks, body copy, anything with a measure
        //   IBM Plex Mono  metadata — categories, counts, stamps, indices
        //   Kalam          the hand — margin notes and pinned asides
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
      theme_color: '#FFFDF7',
      background_color: '#FFFDF7',
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
        // The publication's own faces are precached by globPatterns above —
        // they are first-party files now. What is left on a CDN is the Strong
        // module's Inter, which is the only remote font request on the site.
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'remote-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
        }
      ]
    },
    client: { installPrompt: false },
    devOptions: { enabled: false }
  },
  ssr: false,
  // With ssr:false nothing is painted until the Vue bundle boots. This inlines
  // app/spa-loading-template.html into index.html so the first frame is the
  // brand rather than a white flash; UiPreloader then takes over from it.
  spaLoadingTemplate: true,
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
