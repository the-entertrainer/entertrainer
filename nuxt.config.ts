// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  // Opt into the Nuxt 4 directory layout so srcDir = app/ and ~ maps to app/.
  future: { compatibilityVersion: 4 },
  ssr: true,

  modules: ['@vueuse/nuxt'],

  // Resolve components by filename (no directory prefix), so <Panel>,
  // <PanelChrome>, <ViewToggle> etc. work regardless of subfolder.
  components: [{ path: '~/components', pathPrefix: false }],

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/glass.css',
  ],

  nitro: {
    preset: 'vercel',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Entertrainer — Interesting is the Mother of All Inventions',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Entertrainer — a home for instructional designers. Sleek micro-learnings, free Storyline examples, and tools for the modern learning designer.',
        },
        { name: 'theme-color', content: '#ffffff' },
        { property: 'og:title', content: 'Entertrainer' },
        { property: 'og:description', content: 'Interesting is the Mother of All Inventions.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://entertrainer.in' },
      ],
      link: [
        {
          rel: 'icon',
          href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@700;800&family=Space+Grotesk:wght@400;500;700&display=swap',
        },
      ],
    },
    pageTransition: false,
  },

  vite: {
    build: {
      // Keep Three.js in its own async chunk so it never blocks the spiral.
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/three')) return 'three'
          },
        },
      },
    },
  },

  typescript: {
    strict: true,
  },
})
