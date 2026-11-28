<script setup lang="ts">
import { useContentStore } from '~/stores/content'

/**
 * The finale. Every page ends at sunset: an ink stage, the sun sinking behind
 * a horizon line as you reach the bottom, and the name set as wide as the
 * screen. The sun is CSS here (no WebGL in chrome that every page carries).
 */
const store = useContentStore()
const year = new Date().getFullYear()
const sectionLinks = [
  { label: 'Elevate', hint: 'Read', href: '/elevate' },
  { label: 'Empower', hint: 'Make', href: '/empower' },
  { label: 'Engage', hint: 'Play', href: '/engage' },
  { label: 'About me', hint: 'Naveen', href: '/about' }
]
const linkedin = computed(() => store.socialLinks.find((s) => s.platform === 'linkedin')?.url ?? 'https://linkedin.com/in/entertrainer')

const root = ref<HTMLElement | null>(null)
const { run } = useMotion(root)
onMounted(() => {
  void run((m) => {
    if (m.level !== 'full') return
    m.gsap.fromTo(root.value!.querySelector('.ft__sun'), { yPercent: -35 }, {
      yPercent: 30, ease: 'none',
      scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom bottom', scrub: true }
    })
    m.gsap.from(root.value!.querySelectorAll('.ft__word span'), {
      yPercent: 100, ease: 'ink', duration: 1.1 * m.k, stagger: 0.03 * m.k,
      scrollTrigger: { trigger: root.value!.querySelector('.ft__word'), start: 'top 95%' }
    })
  })
})
const letters = [...'entertrainer']
</script>

<template>
  <footer ref="root" class="ft">
    <div class="ft__top">
      <div class="ft__say">
        <p class="br-meta ft__k">Say hello</p>
        <a class="ft__mail br-display" :href="`mailto:${store.email}`" data-cursor="Write">{{ store.email }}</a>
        <p class="ft__fine">Training teams, building a course, or just want to argue about Bloom’s verbs? Write. I read everything.</p>
      </div>
      <nav class="ft__nav" aria-label="Footer">
        <NuxtLink v-for="link in sectionLinks" :key="link.href" class="ft__link" :to="link.href">
          <span class="br-meta">{{ link.hint }}</span>{{ link.label }}
        </NuxtLink>
      </nav>
    </div>

    <div class="ft__horizon" aria-hidden="true">
      <span class="ft__sun" />
    </div>

    <p class="ft__word br-display" aria-label="Entertrainer"><span v-for="(l, i) in letters" :key="i" aria-hidden="true">{{ l }}</span></p>

    <div class="ft__base br-meta">
      <span>© {{ year }} {{ store.name }}</span>
      <a :href="linkedin" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
      <NuxtLink to="/colophon">How this site works</NuxtLink>
      <span>No tracking. Your work in the apps stays in your browser.</span>
    </div>
  </footer>
</template>

<style scoped>
.ft { background: var(--br-ink); color: var(--br-paper); margin-top: var(--space-89); overflow: hidden; position: relative; isolation: isolate; }
.ft__top { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 48px; padding: clamp(64px, 9vw, 140px) var(--hub-gutter) 40px; position: relative; z-index: 2; }
@media (max-width: 860px) { .ft__top { grid-template-columns: 1fr; } }
.ft__k { color: var(--br-sun); margin: 0 0 18px; }
.ft__mail { display: inline-block; font-size: clamp(32px, 4.6vw, 80px); color: var(--br-paper); text-decoration: none; letter-spacing: -.035em; line-height: 1; background: linear-gradient(var(--br-sun), var(--br-sun)) 0 100% / 0 3px no-repeat; transition: background-size .6s var(--br-ease); padding-bottom: 8px; overflow-wrap: anywhere; }
.ft__mail:hover { background-size: 100% 3px; }
.ft__fine { max-width: 42ch; margin: 22px 0 0; opacity: .7; font-size: 16px; line-height: 1.5; }
.ft__nav { display: grid; align-content: start; }
.ft__link { display: flex; justify-content: space-between; align-items: baseline; padding: 14px 0; border-bottom: 1px solid color-mix(in srgb, var(--br-paper) 22%, transparent); color: var(--br-paper); text-decoration: none; font: 400 clamp(28px, 3vw, 44px)/1 var(--font-display); letter-spacing: -.02em; transition: color .3s, padding .5s var(--br-ease); flex-direction: row-reverse; }
.ft__link .br-meta { opacity: .5; }
.ft__link:hover { color: var(--br-sun); padding-left: 12px; }
.ft__horizon { position: relative; height: clamp(120px, 18vw, 280px); margin-top: 20px; overflow: hidden; border-bottom: 1px solid color-mix(in srgb, var(--br-paper) 35%, transparent); }
.ft__sun { position: absolute; left: 50%; bottom: -60%; width: clamp(240px, 34vw, 560px); aspect-ratio: 1; translate: -50% 0; border-radius: 50%; background: radial-gradient(circle at 50% 30%, #FFE070, var(--br-sun) 45%, #F4A62A); box-shadow: 0 0 140px 30px color-mix(in srgb, var(--br-sun) 30%, transparent); }
.ft__word { font-size: 17.2vw; line-height: .78; letter-spacing: -.055em; margin: 0; padding: 0 1vw; white-space: nowrap; overflow: hidden; color: var(--br-paper); display: flex; }
.ft__word span { display: inline-block; }
.ft__base { display: flex; flex-wrap: wrap; gap: 10px 28px; padding: 28px var(--hub-gutter) calc(28px + var(--safe-bottom, 0px)); opacity: .7; }
.ft__base a { color: inherit; }
.ft__base span:last-child { margin-left: auto; }
@media (max-width: 760px) { .ft__base span:last-child { margin-left: 0; } }
</style>
