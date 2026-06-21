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
  const density = scene.gif!.density
  // big cinematic plates: one wide plate, or two slightly smaller side-by-side
  const vw = density > 1 ? 30 : 42
  const seed = (scene.id * 31 + i * 17) % 100 / 100
  const dx = (i - (density - 1) / 2) * (density > 1 ? 220 : 0) + (seed - 0.5) * 40
  const dy = (((scene.id * 13 + i * 29) % 100 / 100) - 0.5) * 70
  const rot = ((scene.id + i) % 2 === 0 ? 1 : -1) * (1.5 + i * 1.5)
  return {
    left: `calc(${a.x * 100}% + ${dx}rem)`,
    top: `calc(${a.y * 100}% + ${dy}rem)`,
    transform: `translate(-50%, -50%) rotate(${rot}deg)`,
    '--w': `clamp(300rem, ${vw}vw, ${density > 1 ? 520 : 760}rem)`,
    '--rot': `${rot}deg`,
  }
}

onMounted(async () => {
  document.documentElement.setAttribute('data-about', '')
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

  // ── GIF engine — prefer the prebuilt static manifest (no per-visit API) ─────
  // public/about/gifs/manifest.json is generated at author/deploy time by
  // scripts/prefetch-gifs.mjs. We only hit the live /api/giphy proxy as a dev
  // fallback when the manifest hasn't been generated yet.
  try {
    const manifest = await $fetch<Record<string, GifResult['items']>>('/about/gifs/manifest.json', { responseType: 'json' })
    SCENES.forEach(scene => {
      if (!scene.gif) return
      const items = manifest?.[String(scene.id)] ?? []
      gifs.value[scene.id] = { items, fallback: items.length === 0 }
    })
  } catch {
    SCENES.forEach(scene => {
      if (!scene.gif) return
      const density = isMobile.value ? Math.min(scene.gif.density, 1) : scene.gif.density
      fetchPool(scene.gif.keywords, Math.max(1, Math.ceil(density / scene.gif.keywords.length)))
        .then(res => { gifs.value[scene.id] = { items: res.items.slice(0, density), fallback: res.fallback } })
        .catch(() => { gifs.value[scene.id] = { items: [], fallback: true } })
    })
  }

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
  ScrollTrigger.config({ ignoreMobileResize: true })

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
        pinSpacing: true,
        scrub: 1.5,
        anticipatePin: 1,
        onEnter: () => gsap.to(beatEls, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }),
        onUpdate: self => {
          cut.setProgress(self.progress)
          atmos?.setIntensity(0.4 + self.progress * 0.5)
          atmos?.setFocus(0.5, 0.45)
        },
      })
      continue
    }

    // Generic / converge / antithesis / signature — scrubbed teleprompter.
    // The first scene's opening beat is revealed by an on-mount intro so the
    // hero line is alive on load rather than blank until first scroll.
    const isFirst = i === 0
    const tl = buildSceneTimeline(splits, { introFirst: isFirst })

    let intro: gsap.core.Tween | null = null
    if (isFirst && splits[0]) {
      // Scene 01 beat 0 is 'xl' tone — match TONE_WEIGHTS.xl: enterY:20, enterScale:0.95, enterBlur:10
      gsap.set(splits[0].chars, { transformOrigin: '50% 80%' })
      intro = gsap.from(splits[0].chars, {
        yPercent: 20, scale: 0.95, opacity: 0, filter: 'blur(10px)',
        duration: 1.1, ease: 'power3.out', delay: 0.25,
        stagger: { each: 0.024, from: 'start' },
      })
      // first scene active on load — focus-rack its thought cluster in
      const firstCluster = sceneEl.querySelector<HTMLElement>('.fn-thoughts')
      if (firstCluster) {
        gsap.fromTo([...firstCluster.children],
          { opacity: 0, filter: 'blur(14px)' },
          { opacity: 1, filter: 'blur(0px)', duration: 1.2, delay: 0.5, stagger: 0.1, ease: 'power2.out' }
        )
      }
    }

    const cluster = sceneEl.querySelector<HTMLElement>('.fn-thoughts')

    ScrollTrigger.create({
      trigger: sceneEl,
      start: 'top top',
      end: `+=${scrollLen}`,
      pin: true,
      pinSpacing: true,
      scrub: 1.5,
      anticipatePin: 1,
      animation: tl,
      onUpdate: self => {
        if (intro && self.progress > 0.002) { intro.kill(); intro = null }
        const anchor = scene.gif?.anchor
        atmos?.setIntensity(0.3 + self.progress * 0.45)
        atmos?.setFocus(anchor?.x ?? 0.5, anchor?.y ?? 0.5)
        // cinematic parallax — the thought cluster drifts as you move through
        if (cluster) cluster.style.setProperty('--py', `${(0.5 - self.progress) * 180}rem`)
      },
      onToggle: self => {
        if (cluster) {
          const kids = [...cluster.children] as HTMLElement[]
          if (self.isActive) {
            // Focus-rack in — filter:blur only, never x/scale which would clobber
            // the inline transform:translate+rotate positioning from thoughtStyle()
            gsap.fromTo(kids,
              { opacity: 0, filter: 'blur(14px)' },
              { opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: { each: 0.10, from: 'start' }, ease: 'power2.out', overwrite: true }
            )
          } else {
            gsap.to(kids, { opacity: 0, filter: 'blur(10px)', duration: 0.65, stagger: { each: 0.06, from: 'end' }, ease: 'power2.in', overwrite: true })
          }
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
  document.documentElement.removeAttribute('data-about')
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

      <!-- thought cluster (GIFs) — big cinematic plates -->
      <div v-if="scene.gif" class="fn-thoughts" aria-hidden="true">
        <template v-if="gifs[scene.id] && !gifs[scene.id].fallback">
          <figure
            v-for="(g, gi) in gifs[scene.id].items"
            :key="g.id"
            class="fn-thought"
            :style="thoughtStyle(scene, gi)"
          >
            <img class="fn-thought-media" :src="g.url" :alt="''" loading="lazy" />
          </figure>
        </template>
        <template v-else-if="gifs[scene.id]">
          <figure
            v-for="(kw, gi) in scene.gif.keywords.slice(0, scene.gif.density)"
            :key="gi"
            class="fn-thought fn-thought--placeholder"
            :style="thoughtStyle(scene, gi)"
          ><span>{{ kw }}</span></figure>
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
/* ── Root — always dark regardless of system theme ─────────────────────── */
.fn {
  position: relative;
  width: 100%;
  background: #0C0E14;
  color: #FAFAF8;
}

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
  /* shared perspective so all stacked beats share the same depth origin */
  perspective: 1400rem;
  perspective-origin: 50% 40%;
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
  /* perspective removed — now on .fn-stage for consistent depth across beats */
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

/* accent — Pi Blue brand signal; page is always dark so white text + blue glow */
.is-accent { position: relative; }
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
.fn .fx-to .fn-beat-text { text-shadow: 0 0 50rem rgba(36, 63, 106, 0.5); }

/* split-type chars must be inline-block to transform */
.fn-beat-text :deep(.char) {
  display: inline-block;
  will-change: transform, opacity, filter;
  transform-origin: 50% 80%;
  /* backface-visibility removed — was only needed for rotateX 3D flips */
}
.fn-beat-text :deep(.word) { display: inline-block; }

/* ── Thought cluster (GIFs) — big cinematic plates ────────────────────────── */
.fn-thoughts {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  /* parallax drift, set per-frame from scroll progress */
  --py: 0rem;
  transform: translateY(var(--py));
  will-change: transform;
}
.fn-thought {
  position: absolute;
  width: var(--w, 420rem);
  aspect-ratio: 16 / 10;
  margin: 0;
  border-radius: 14rem;
  overflow: hidden;
  opacity: 0;
  box-shadow:
    0 40rem 120rem rgba(0, 0, 0, 0.6),
    0 8rem 30rem rgba(36, 63, 106, 0.35);
  outline: 1.5rem solid rgba(36, 63, 106, 0.45);
  outline-offset: -1.5rem;
  will-change: transform, opacity;
}
/* Ken Burns — slow continuous drift/zoom inside the clip */
.fn-thought-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(0.12) contrast(1.06) brightness(0.98);
  transform: scale(1.08);
  animation: fn-kenburns 18s ease-in-out infinite alternate;
}
@keyframes fn-kenburns {
  0%   { transform: scale(1.06) translate3d(-1.5%, -1%, 0); }
  100% { transform: scale(1.16) translate3d(1.5%, 1.5%, 0); }
}
.fn-thought--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  background: rgba(36, 63, 106, 0.12);
  border: 1.5rem dashed rgba(36, 63, 106, 0.6);
  outline: none;
}
.fn-thought--placeholder span {
  color: #8C8C8C;
  font-size: 18rem;
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
  /* GIFs use desktop anchor coords that overlap mobile text — hide them */
  .fn-thoughts { display: none; }

  /* Let beat text fill the available width naturally */
  .fn-beat { max-width: 100%; }

  /* Hero beats like "HOUSEKEEPER." need to fit a ~340px content column */
  .t-hero { font-size: clamp(34rem, 8.5vw, 64rem); letter-spacing: -0.05em; }
  /* xl beats also tighten so they don't crowd */
  .t-xl   { font-size: clamp(36rem, 7.5vw, 96rem); }

  .fn-eyebrow { top: 90rem; }
}

@media (prefers-reduced-motion: reduce) {
  .fn-beat { position: relative; grid-area: auto; opacity: 1; margin-bottom: 0.4em; }
  .fn-stage { display: block; }
}
</style>
