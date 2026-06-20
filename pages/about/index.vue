<script setup lang="ts">
import gsap from 'gsap'
import { useThemeStore } from '~/stores/theme'
import { SCENES, CTA } from '~/experience/about/narrative'
import type { Scene } from '~/experience/about/narrative'
import type { GifResult } from '~/composables/useGiphy'

definePageMeta({ pageTransition: false })

useHead({
  title: 'About — Field Notes on Learning',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap'
    }
  ]
})

const themeStore = useThemeStore()
const { fetchPool } = useGiphy()

const atmosRef  = ref<HTMLCanvasElement | null>(null)
const sceneRefs = ref<(HTMLElement | null)[]>([])
const progressBar = ref<HTMLElement | null>(null)
const gifs = ref<Record<number, GifResult>>({})

const reduceMotion = ref(false)
const isMobile = ref(false)
const cleanups: Array<() => void> = []

function toneClass(tone?: string) {
  return `t-${tone ?? 'md'}`
}

// Deterministic-ish placement for a scene's thought (GIF) cluster.
function thoughtStyle(scene: Scene, i: number) {
  const a = scene.gif!.anchor
  const spread = 130
  const seed = (scene.id * 31 + i * 17) % 100 / 100
  const dx = (seed - 0.5) * spread + (i - (scene.gif!.density - 1) / 2) * 86
  const dy = ((scene.id * 13 + i * 29) % 100 / 100 - 0.5) * spread
  const rot = ((scene.id + i) % 2 === 0 ? 1 : -1) * (3 + i * 2)
  return {
    left: `calc(${a.x * 100}% + ${dx}rem)`,
    top: `calc(${a.y * 100}% + ${dy}rem)`,
    transform: `translate(-50%, -50%) rotate(${rot}deg)`,
    '--scale': String(scene.gif!.scale ?? 1),
  }
}

onMounted(async () => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isMobile.value = window.innerWidth < 768
  await nextTick()

  // ── Atmosphere ────────────────────────────────────────────────────────────
  const { Atmosphere } = await import('~/experience/about/atmosphere')
  let atmos: InstanceType<typeof Atmosphere> | null = null
  if (atmosRef.value && !reduceMotion.value) {
    atmos = new Atmosphere(atmosRef.value, { dark: themeStore.isDark })
    atmos.start()
    const onResize = () => atmos?.resize()
    window.addEventListener('resize', onResize)
    const stopTheme = watch(() => themeStore.isDark, d => atmos?.setDark(d))
    cleanups.push(() => window.removeEventListener('resize', onResize))
    cleanups.push(stopTheme)
    cleanups.push(() => atmos?.dispose())
  }

  // ── GIF engine — resolve each scene's "thoughts" ───────────────────────────
  SCENES.forEach(scene => {
    if (!scene.gif) return
    const density = isMobile.value ? Math.min(scene.gif.density, 1) : scene.gif.density
    fetchPool(scene.gif.keywords, Math.max(1, Math.ceil(density / scene.gif.keywords.length)))
      .then(res => { gifs.value[scene.id] = { items: res.items.slice(0, density), fallback: res.fallback } })
      .catch(() => { gifs.value[scene.id] = { items: [], fallback: true } })
  })

  // ── Reduced motion: static, legible, no pinning ────────────────────────────
  if (reduceMotion.value) {
    sceneRefs.value.forEach(el => {
      if (!el) return
      gsap.set(el.querySelectorAll('.fn-beat'), { opacity: 1, y: 0 })
    })
    return
  }

  // ── Animation engine ───────────────────────────────────────────────────────
  const [{ default: SplitType }, { splitBeat, buildSceneTimeline, scatterChars }, { CutPhysics }] = await Promise.all([
    import('split-type'),
    import('~/experience/about/typography'),
    import('~/experience/about/cutPhysics'),
  ])
  void SplitType
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const lenis = (useNuxtApp().$lenis) as any
  if (lenis?.on) {
    lenis.on('scroll', ScrollTrigger.update)
    cleanups.push(() => lenis.off('scroll', ScrollTrigger.update))
  }

  const rn = await import('rough-notation')

  // Overall progress bar
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: self => {
      if (progressBar.value) progressBar.value.style.transform = `scaleX(${self.progress})`
    },
  })

  // Per-scene pinned timelines
  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i]
    const sceneEl = sceneRefs.value[i]
    if (!sceneEl) continue

    const beatEls = [...sceneEl.querySelectorAll<HTMLElement>('.fn-beat .fn-beat-text')]
    const splits = beatEls.map((el, bi) => splitBeat(el, scene.beats[bi]))

    const scrollLen = Math.round(window.innerHeight * Math.max(1.1, scene.beats.length * (isMobile.value ? 0.5 : 0.62)))

    // Scene 08 — physical editing
    if (scene.special === 'cut' && !isMobile.value) {
      const removeEls = beatEls.filter((_, bi) => scene.beats[bi].fx === 'strike')
      const keepEl = beatEls.find((_, bi) => scene.beats[bi].fx === 'keep') ?? beatEls[beatEls.length - 1]
      // reveal all lines first, then cut on progress
      gsap.set(beatEls, { opacity: 0, y: 40 })
      const cut = new CutPhysics()
      await cut.init(removeEls, keepEl!)
      cleanups.push(() => cut.dispose())

      ScrollTrigger.create({
        trigger: sceneEl,
        start: 'top top',
        end: `+=${scrollLen}`,
        pin: true,
        scrub: true,
        onEnter: () => gsap.to(beatEls, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }),
        onUpdate: self => {
          cut.setProgress(self.progress)
          atmos?.setIntensity(0.4 + self.progress * 0.5)
          atmos?.setFocus(0.5, 0.45)
        },
      })
      continue
    }

    // Generic / converge / antithesis / signature — scrubbed teleprompter
    const tl = buildSceneTimeline(splits)

    ScrollTrigger.create({
      trigger: sceneEl,
      start: 'top top',
      end: `+=${scrollLen}`,
      pin: true,
      scrub: true,
      animation: tl,
      onUpdate: self => {
        const anchor = scene.gif?.anchor
        atmos?.setIntensity(0.3 + self.progress * 0.45)
        atmos?.setFocus(anchor?.x ?? 0.5, anchor?.y ?? 0.5)
      },
      onToggle: self => {
        const cluster = sceneEl.querySelector<HTMLElement>('.fn-thoughts')
        if (cluster) {
          gsap.to(cluster.children, {
            opacity: self.isActive ? 1 : 0,
            scale: self.isActive ? 1 : 0.86,
            duration: 0.7,
            stagger: 0.06,
            ease: 'power2.out',
          })
        }
      },
    })

    // rough-notation accents on the signature / SEWA beats when they read
    splits.forEach((s, bi) => {
      const beat = scene.beats[bi]
      const wantsAnnotation =
        (scene.id === 3 && beat.text.startsWith('SEWA')) ||
        (scene.id === 10 && beat.accent && beat.text.includes('moment'))
      if (!wantsAnnotation) return
      let ann: any = null
      ScrollTrigger.create({
        trigger: sceneEl,
        start: `top+=${(bi / scene.beats.length) * scrollLen} top`,
        end: `top+=${((bi + 1) / scene.beats.length) * scrollLen} top`,
        onEnter: () => {
          if (!ann) ann = rn.annotate(s.el, { type: scene.id === 3 ? 'underline' : 'circle', color: '#243F6A', strokeWidth: 3, padding: scene.id === 3 ? 4 : 10, animationDuration: 600 })
          ann.show()
        },
        onLeaveBack: () => ann?.hide(),
      })
    })

    void scatterChars
  }

  ScrollTrigger.refresh()
  lenis?.resize?.()
  cleanups.push(() => ScrollTrigger.getAll().forEach(t => t.kill()))
})

onBeforeUnmount(() => {
  cleanups.forEach(fn => { try { fn() } catch {} })
  cleanups.length = 0
})
</script>

<template>
  <div class="fn" :class="{ 'is-mobile': isMobile }">
    <canvas ref="atmosRef" class="fn-atmos" aria-hidden="true" />
    <div class="fn-progress"><span ref="progressBar" /></div>

    <section
      v-for="(scene, i) in SCENES"
      :key="scene.id"
      class="fn-scene"
      :class="[`align-${scene.align}`, `special-${scene.special}`]"
      :ref="el => sceneRefs[i] = el as HTMLElement"
      :aria-label="`${scene.label} — ${scene.title}`"
    >
      <span class="fn-eyebrow">{{ scene.label }}</span>

      <!-- thought cluster (GIFs) -->
      <div v-if="scene.gif" class="fn-thoughts" aria-hidden="true">
        <template v-if="gifs[scene.id] && !gifs[scene.id].fallback">
          <img
            v-for="(g, gi) in gifs[scene.id].items"
            :key="g.id"
            class="fn-thought"
            :src="g.url"
            :alt="''"
            :style="thoughtStyle(scene, gi)"
            loading="lazy"
          />
        </template>
        <template v-else-if="gifs[scene.id]">
          <span
            v-for="(kw, gi) in scene.gif.keywords.slice(0, scene.gif.density)"
            :key="gi"
            class="fn-thought fn-thought--placeholder"
            :style="thoughtStyle(scene, gi)"
          >{{ kw }}</span>
        </template>
      </div>

      <div class="fn-stage">
        <p
          v-for="(beat, bi) in scene.beats"
          :key="bi"
          class="fn-beat"
          :class="[toneClass(beat.tone), { 'is-accent': beat.accent, 'fx-from': beat.fx === 'pairFrom', 'fx-to': beat.fx === 'pairTo' }]"
        >
          <span class="fn-beat-text">{{ beat.text }}</span>
        </p>
      </div>
    </section>

    <!-- CTA — continue the story -->
    <section class="fn-cta-scene" aria-label="Continue">
      <NuxtLink :to="CTA.to" class="fn-cta">
        <span class="fn-cta-label">{{ CTA.text }}</span>
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
/* ── Root ─────────────────────────────────────────────────────────────────── */
.fn {
  position: relative;
  width: 100%;
  background: #0C0E14;
  color: #FAFAF8;
}
[data-theme="light"] .fn { background: #FAFAF8; color: #111111; }

.fn-atmos {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.fn-progress {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 3rem;
  z-index: 40;
  background: transparent;
}
.fn-progress span {
  display: block;
  height: 100%;
  width: 100%;
  background: #243F6A;
  transform: scaleX(0);
  transform-origin: left center;
}

/* ── Scene ────────────────────────────────────────────────────────────────── */
.fn-scene {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 clamp(24rem, 7vw, 140rem);
  overflow: hidden;
}
.fn-scene.align-center { align-items: center; text-align: center; }
.fn-scene.align-left   { align-items: flex-start; }

.fn-eyebrow {
  position: absolute;
  top: clamp(80rem, 12vh, 140rem);
  left: clamp(24rem, 7vw, 140rem);
  font-size: 14rem;
  font-weight: 600;
  letter-spacing: 0.32em;
  color: #8C8C8C;
  z-index: 6;
}
.fn-scene.align-center .fn-eyebrow { left: 50%; transform: translateX(-50%); }

/* ── Stage: beats stacked, one reads at a time ────────────────────────────── */
.fn-stage {
  position: relative;
  width: 100%;
  max-width: 1400rem;
  min-height: 40vh;
  display: grid;
  place-items: inherit;
}
.fn-scene.align-center .fn-stage { place-items: center; }
.fn-scene.align-left   .fn-stage { place-items: center start; }

.fn-beat {
  grid-area: 1 / 1;
  margin: 0;
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.04em;
  max-width: 22ch;
  perspective: 800rem;
}
.special-cut .fn-beat { max-width: none; }

/* tones */
.t-sm   { font-size: clamp(20rem, 3vw, 30rem);   font-weight: 500; letter-spacing: -0.02em; opacity: 0.72; }
.t-md   { font-size: clamp(26rem, 4.2vw, 46rem);  font-weight: 500; letter-spacing: -0.03em; }
.t-lg   { font-size: clamp(34rem, 6.2vw, 78rem);  font-weight: 600; }
.t-xl   { font-size: clamp(46rem, 9vw, 132rem);   font-weight: 700; letter-spacing: -0.05em; }
.t-hero { font-size: clamp(64rem, 16vw, 240rem);  font-weight: 800; letter-spacing: -0.06em; line-height: 0.92; }
.t-deva { font-family: 'Noto Sans Devanagari', serif; font-size: clamp(40rem, 8vw, 112rem); font-weight: 600; letter-spacing: 0; line-height: 1.3; }
.t-sig  { font-size: clamp(24rem, 3.4vw, 46rem);  font-weight: 500; font-style: italic; opacity: 0.78; }

/* accent — Pi Blue brand signal (legible per theme) */
.is-accent { position: relative; }
[data-theme="light"] .is-accent { color: #243F6A; }
.fn .is-accent .fn-beat-text {
  text-shadow: 0 0 60rem rgba(36, 63, 106, 0.55);
}
.is-accent::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  bottom: -0.12em;
  height: 0.07em;
  background: #243F6A;
  border-radius: 999rem;
}
.fn-scene.align-center .is-accent::after { left: 10%; right: 10%; }
.t-hero.is-accent::after, .t-deva.is-accent::after { display: none; }
.t-hero.is-accent .fn-beat-text { text-shadow: 0 0 120rem rgba(36, 63, 106, 0.85); }

/* antithesis pairing */
.fx-from { opacity: 0.5; color: #8C8C8C; }
.fx-to   { }
[data-theme="light"] .fx-to { color: #243F6A; }
.fn .fx-to .fn-beat-text { text-shadow: 0 0 50rem rgba(36, 63, 106, 0.5); }

/* split-type chars must be inline-block to transform */
.fn-beat-text :deep(.char) {
  display: inline-block;
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
}
.fn-beat-text :deep(.word) { display: inline-block; }

/* ── Thought cluster (GIFs) ───────────────────────────────────────────────── */
.fn-thoughts {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}
.fn-thought {
  position: absolute;
  width: calc(190rem * var(--scale, 1));
  height: auto;
  border-radius: 10rem;
  opacity: 0;
  box-shadow: 0 24rem 60rem rgba(0, 0, 0, 0.5);
  filter: grayscale(0.15) contrast(1.05);
  outline: 2rem solid rgba(36, 63, 106, 0.5);
}
.fn-thought--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(190rem * var(--scale, 1));
  height: calc(130rem * var(--scale, 1));
  background: rgba(36, 63, 106, 0.12);
  border: 1.5rem dashed rgba(36, 63, 106, 0.6);
  color: #8C8C8C;
  font-size: 15rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: lowercase;
  padding: 10rem;
  text-align: center;
}

/* ── CTA ──────────────────────────────────────────────────────────────────── */
.fn-cta-scene {
  position: relative;
  z-index: 5;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fn-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: clamp(22rem, 2.6vw, 40rem) clamp(40rem, 5vw, 84rem);
  background: #243F6A;
  color: #FAFAF8;
  border-radius: 999rem;
  font-size: clamp(28rem, 4.4vw, 64rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  box-shadow: 0 30rem 90rem rgba(36, 63, 106, 0.5);
  transition: transform 0.4s var(--ease-spring, cubic-bezier(.16,1,.3,1)), box-shadow 0.4s ease;
  will-change: transform;
}
.fn-cta:hover {
  transform: translateY(-6rem) scale(1.02);
  box-shadow: 0 40rem 120rem rgba(36, 63, 106, 0.7);
}
.fn-cta-label { display: inline-block; }

/* ── Mobile tuning ────────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .fn-beat { max-width: 16ch; }
  .fn-thought, .fn-thought--placeholder { width: calc(120rem * var(--scale, 1)); }
  .fn-thought--placeholder { height: calc(84rem * var(--scale, 1)); font-size: 12rem; }
  .fn-eyebrow { top: 90rem; }
}

@media (prefers-reduced-motion: reduce) {
  .fn-beat { position: relative; grid-area: auto; opacity: 1; margin-bottom: 0.4em; }
  .fn-stage { display: block; }
}
</style>
