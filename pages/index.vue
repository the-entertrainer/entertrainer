<script setup lang="ts">
import { useContentStore } from '~/stores/content'
import { useHomeViewStore } from '~/stores/homeview'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'The portfolio of Naveen Jose, a certified instructional designer who builds learning experiences that feel human, plus free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Learning experiences that feel human, plus free web apps for L&D teams.',
  ogUrl: 'https://entertrainer.in/'
})

const contentStore   = useContentStore()
const homeViewStore  = useHomeViewStore()
const router         = useRouter()
const spiralRef      = ref<any>(null)

// Direct, crawlable navigation for the landing — the spiral is the delight,
// this is the orientation. Shown only on the root spiral, not sub-sections.
const heroLinks = [
  { label: 'My Work', to: '/my-work' },
  { label: 'Web Apps', to: '/tools' },
  { label: 'About', to: '/about' }
]

type Section = 'home' | 'tools' | 'downloads' | 'my-work'

const sectionStack = ref<Section[]>(['home'])
const currentSection = computed(() => sectionStack.value[sectionStack.value.length - 1])

const sectionItems = computed(() => {
  switch (currentSection.value) {
    case 'tools':     return contentStore.toolsNav
    case 'downloads': return contentStore.downloadsNav
    case 'my-work':   return contentStore.myWorkNav
    default:          return contentStore.homeNav
  }
})

const sectionTitles: Record<Section, string> = {
  home: '', tools: 'Web Apps', downloads: 'Downloads', 'my-work': 'My Work'
}

const sectionRoutes: Record<string, Section> = {
  '/tools': 'tools', '/downloads': 'downloads', '/my-work': 'my-work'
}

// Items in sectionRoutes use in-place vortex (via items watch).
// All other home cards now also use the vortex (explicit exit before router.push).

watch(currentSection, (s) => homeViewStore.setIsHome(s === 'home'), { immediate: true })

watch(() => homeViewStore.pendingBack, (pending) => {
  if (pending) {
    handleBack()
    homeViewStore.ackBack()
  }
})

// Reset to home when navigating to '/' from a sub-section (e.g. menu home link)
watch(() => homeViewStore.pendingHome, (pending) => {
  if (pending) {
    if (sectionStack.value.length > 1) {
      sectionStack.value = ['home']
      syncHistorySection()
    }
    homeViewStore.ackHome()
  }
})

let _pushingState = false

// `history.state.section` is the single source of truth for which spiral
// sub-section the '/' entry represents. Keep it in sync whenever the in-page
// stack changes so back/forward and remounts all restore the same view.
function readSection(): Section | null {
  const s = (history.state as { section?: Section } | null)?.section
  return s && s in sectionTitles && s !== 'home' ? s : null
}
function syncHistorySection() {
  const cur = currentSection.value
  history.replaceState(
    { ...history.state, section: cur === 'home' ? undefined : cur },
    '', '/'
  )
}

async function handleCardClick(href: string) {
  if (href in sectionRoutes) {
    const section = sectionRoutes[href]
    sectionStack.value = [...sectionStack.value, section]
    _pushingState = true
    // Preserve vue-router's own history keys; just tag this entry with the
    // section so returning to '/' (e.g. backing out of a tool) can restore it.
    history.pushState({ ...history.state, section }, '', '/')
    _pushingState = false
  } else {
    // External page (About, Instructional Design, etc.):
    // Run the vortex exit animation first so every navigation feels unified.
    await spiralRef.value?.performExit?.()
    router.push(href)
  }
}

function handleBack() {
  if (sectionStack.value.length > 1) {
    sectionStack.value = sectionStack.value.slice(0, -1)
    syncHistorySection()
  }
}

function onPopState() {
  if (_pushingState) return
  // Mirror whatever section the landed history entry represents — this respects
  // both back and forward through the spiral hierarchy.
  const s = readSection()
  sectionStack.value = s ? ['home', s] : ['home']
}

onMounted(() => {
  window.addEventListener('popstate', onPopState)
  // Returning to '/' from a deeper route (e.g. backing out of a tool) — restore
  // the spiral sub-section we were in so back respects the hierarchy instead of
  // snapping to the root spiral.
  const restored = readSection()
  if (restored) sectionStack.value = ['home', restored]
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState)
})
</script>

<template>
  <div class="home-root">
    <SpiralView
      ref="spiralRef"
      :items="sectionItems"
      :show-loader="true"
      :show-view-switch="true"
      :title="sectionTitles[currentSection]"
      @card-click="handleCardClick"
    />

    <!-- Indexable identity + orientation. The WebGL wordmark is the brand;
         this names the person and gives a direct way in. -->
    <Transition name="home-hero">
      <div v-show="currentSection === 'home'" class="home-hero" role="region" aria-label="Introduction">
        <p class="home-hero__kicker">Instructional Design · L&amp;D · Gurugram</p>
        <h1 class="home-hero__name">Naveen Jose</h1>
        <p class="home-hero__line">A certified instructional designer who builds the tools he wishes existed.</p>
        <nav class="home-hero__nav" aria-label="Sections">
          <NuxtLink v-for="l in heroLinks" :key="l.to" :to="l.to" class="home-hero__link">{{ l.label }}</NuxtLink>
          <a :href="`mailto:${contentStore.email}`" class="home-hero__link home-hero__link--cta">Get in touch</a>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.home-root { position: relative; }
.home-hero {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(30rem + var(--safe-bottom));
  /* Above the spiral's own layers (which top out at z-10) but well below the
     loader (z-1000, so the hero stays hidden until the loader dismisses) and
     the menu chrome. */
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 20rem;
  pointer-events: none;
}
.home-hero__kicker {
  font-size: 11.5rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.55;
  margin-bottom: 8rem;
}
.home-hero__name {
  font-size: clamp(26rem, 5vw, 40rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--color-text);
}
.home-hero__line {
  font-size: 14.5rem;
  line-height: 1.5;
  color: var(--color-text);
  opacity: 0.68;
  max-width: 30em;
  margin-top: 12rem;
}
.home-hero__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8rem;
  margin-top: 20rem;
  pointer-events: auto;
}
.home-hero__link {
  padding: 9rem 18rem;
  border-radius: 999px;
  font-size: 13rem;
  font-weight: 600;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}
@media (hover: hover) {
  .home-hero__link:hover { transform: translateY(-2rem); background: color-mix(in srgb, var(--color-bg) 70%, transparent); border-color: var(--color-glass-border-hover); }
}
.home-hero__link--cta {
  background: var(--color-text);
  color: var(--color-bg);
  border-color: transparent;
}
@media (hover: hover) {
  .home-hero__link--cta:hover { background: var(--color-text); opacity: 0.88; }
}

.home-hero-enter-active { transition: opacity 0.6s ease 0.3s, transform 0.6s var(--ease-spring) 0.3s; }
.home-hero-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.home-hero-enter-from, .home-hero-leave-to { opacity: 0; transform: translateY(16rem); }

@media (prefers-reduced-motion: reduce) {
  .home-hero-enter-active, .home-hero-leave-active { transition: opacity 0.3s ease; }
  .home-hero-enter-from, .home-hero-leave-to { transform: none; }
}
@media (max-width: 640px) {
  .home-hero { bottom: calc(20rem + var(--safe-bottom)); }
  .home-hero__line { display: none; }
}
</style>
