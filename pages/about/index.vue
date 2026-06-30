<template>
  <div class="about-wrap">
    <!-- Living fluted-glass gradient — the site's signature backdrop -->
    <UiGlassBackdrop />

    <div class="about-container">

      <!-- ───────────────── Hero panel ───────────────── -->
      <section class="glass-panel about-panel about-panel--hero anim">
        <!-- Decorative subtle light leak (generated asset, blended gently for cinematic warmth) -->
        <div class="hero-decor" style="background-image: url('/decorative-light-leak.jpg');"></div>
        
        <h1 class="about-intro">
          I am <span class="hl" data-text="Naveen">Naveen</span>.
        </h1>
        <hr class="about-rule" />
        <p class="about-lead">
          My path here didn't start with a big plan or a fancy title. It started with making beds at a hotel, folding towels into little roses just to make someone's day a tiny bit brighter.
        </p>
        <p class="about-lead">
          Somewhere along the way, I realized that the same care — the attention to how things feel, how they land, how they stay with you — could be used to help people learn. Not through lectures or dry slides, but through experiences that feel alive, human, and a little bit magical.
        </p>
      </section>

    </div>

    <!-- 3D Story Orbit — powered by Three.js (interactive narrative) -->
    <!-- Drag or swipe the 3D memory photos. Real depth, lighting, and physical-feeling orbit. -->
    <!-- Follows scroll-experience (cinematic interactive stories, perf, reduced-motion, accessibility), threejs-skills (proper setup, interaction, textures, damping), ui-ux-pro-max (touch targets, a11y, timing, glass consistency, mobile-first). -->
    <div class="story-3d-wrapper">
      <div class="story-3d" ref="threeContainer" aria-label="Interactive 3D story: drag or swipe to orbit through four chapters of memories. Photos appear as floating planes in space.">
        <canvas ref="threeCanvas" class="story-canvas"></canvas>
        <div class="swipe-hints" aria-hidden="true">
          <div class="hint">drag or swipe to orbit the memories • tap dots to jump</div>
        </div>
      </div>

      <!-- Synced chapter info — crisp readable text outside the 3D for accessibility and polish -->
      <div class="chapter-info glass-panel">
        <p class="about-chapter"><span class="about-chapter__no">{{ String(currentIndex + 1).padStart(2, '0') }}</span> {{ chapters[currentIndex].title }}</p>
        <p class="about-body">{{ chapters[currentIndex].body }}</p>
        <p class="plane-footnote" v-if="chapters[currentIndex].footnote">{{ chapters[currentIndex].footnote }}</p>
        <div class="plane-questions" v-if="chapters[currentIndex].questions">
          <p v-for="(q, i) in chapters[currentIndex].questions" :key="i">{{ q }}</p>
        </div>
      </div>

      <div class="plane-dots" role="tablist" aria-label="Jump to chapter">
        <button 
          v-for="(ch, i) in chapters" 
          :key="i" 
          class="dot" 
          :class="{ active: currentIndex === i }" 
          :aria-label="'Go to ' + ch.title"
          :aria-selected="currentIndex === i"
          role="tab"
          @click="goToPlane(i)"
        ></button>
      </div>
    </div>

    <div class="about-container">
      <section class="glass-panel about-panel about-panel--closing">
        <p class="about-body">At the end of it, I like the part where an idea stops being just an idea and becomes something someone carries with them. That quiet shift.</p>
        <p class="about-asatoma">Asatoma Sadgamaya.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import * as THREE from 'three'

definePageMeta({ layout: 'default' })

let io: IntersectionObserver | null = null
let ioHl: IntersectionObserver | null = null
let reduceMotion = false

// Chapters data (warm, human voice — human-writing patterns)
const chapters = [
  {
    title: 'The Floor',
    body: "It started in hotel rooms. Club Mahindra, Marriott. I was the one turning chaos into something that made people exhale when they walked in. Making the bed just so. Folding towels into little animals because why not. It wasn't glamorous. It was the feeling that someone had their back.",
    footnote: 'I still fold towels that way at home. Small things add up.'
  },
  {
    title: 'The Spark',
    body: 'One day we turned a stack of dry service standards into a comic called SEWA Chronicles. People actually read it. They smiled at their desks. That was the first time I saw what happens when you wrap something useful in something that feels made by a person for a person. I wanted more of that.',
    footnote: '',
    questions: [
      'What makes someone actually remember something?',
      'How do we help people feel capable instead of buried?',
      'What turns information into something that quietly changes how a person sees their work?'
    ]
  },
  {
    title: 'The Craft',
    body: "Later at Marriott I built leadership programs, trainer trainings, onboarding that didn't feel like a checklist. The best rooms were the ones where tired people leaned forward because a story landed. Not louder. Just more human.",
    footnote: "Those rooms showed me that when learning feels generous, people don't just remember it. They pass it on."
  },
  {
    title: 'The Present',
    body: "Now I'm with banking teams at Concentrix. We take tangled new ways of working and turn them into something a person can actually see themselves doing on Monday. The software changes. The heart of it doesn't.",
    footnote: 'The moment someone says "I think I can do this now" — that\'s the whole point.'
  }
]

// ── Three.js 3D Interactive Story (threejs-skills + scroll-experience interactive narrative + ui-ux-pro-max rules) ──
const threeContainer = ref<HTMLElement | null>(null)
const threeCanvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let storyGroup: THREE.Group | null = null
let currentRot = 0
let targetRot = 0
let isThreeDragging = false
let lastPointerX = 0

const currentIndex = ref(0)
const numPlanes = 4
const angleStep = Math.PI / 2
const orbitRadius = 5.8

function onThreeResize() {
  if (!threeContainer.value || !camera || !renderer) return
  const w = threeContainer.value.clientWidth
  const h = threeContainer.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function updateCurrentFromRot() {
  const normalized = ((currentRot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const idx = Math.round(normalized / angleStep) % numPlanes
  if (idx !== currentIndex.value) currentIndex.value = idx
}

function goToPlane(index: number) {
  const idx = (index + numPlanes) % numPlanes
  currentIndex.value = idx
  targetRot = -idx * angleStep
}

function onThreePointerDown(e: PointerEvent) {
  isThreeDragging = true
  lastPointerX = e.clientX
  threeContainer.value?.setPointerCapture(e.pointerId)
}

function onThreePointerMove(e: PointerEvent) {
  if (!isThreeDragging || !storyGroup) return
  const delta = (e.clientX - lastPointerX) * 0.0042
  currentRot += delta
  storyGroup.rotation.y = currentRot
  lastPointerX = e.clientX
  updateCurrentFromRot()
}

function onThreePointerUp(e: PointerEvent) {
  if (!isThreeDragging || !storyGroup) return
  isThreeDragging = false
  threeContainer.value?.releasePointerCapture(e.pointerId)

  const snapped = Math.round(currentRot / angleStep) * angleStep
  currentRot = snapped
  targetRot = snapped

  gsap.to(storyGroup.rotation, {
    y: targetRot,
    duration: reduceMotion ? 0.1 : 0.22,
    ease: 'power2.out',
    onUpdate: () => {
      currentRot = storyGroup!.rotation.y
      updateCurrentFromRot()
    }
  })
}

function animateThree() {
  if (!renderer || !scene || !camera || !storyGroup) return
  requestAnimationFrame(animateThree)

  if (!isThreeDragging) {
    const diff = targetRot - currentRot
    currentRot += diff * (reduceMotion ? 0.3 : 0.09)
    storyGroup.rotation.y = currentRot
  }
  renderer.render(scene, camera)
}

function initThree() {
  if (!threeCanvas.value || !threeContainer.value) return

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    58,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 0.7, 8.0)

  const dpr = Math.min(window.devicePixelRatio || 1, reduceMotion ? 1 : 1.5)
  renderer = new THREE.WebGLRenderer({ canvas: threeCanvas.value, antialias: true, alpha: true })
  renderer.setPixelRatio(dpr)
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)

  // Lights for depth and "glass" highlight on photos
  scene.add(new THREE.AmbientLight(0xffffff, 0.68))
  const key = new THREE.DirectionalLight(0xffffff, 0.95)
  key.position.set(4, 5, 7)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x99aaff, 0.32)
  rim.position.set(-5, 1, -6)
  scene.add(rim)

  storyGroup = new THREE.Group()
  scene.add(storyGroup)

  const loader = new THREE.TextureLoader()
  const urls = [
    '/about/about-housekeeper-1.webp',
    '/about/about-sewa-1.webp',
    '/about/about-ignite.webp',
    '/about/about-concentrix.webp'
  ]
  const pw = 4.35
  const ph = 2.9

  urls.forEach((url, i) => {
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      const mat = new THREE.MeshPhongMaterial({ map: tex, shininess: 36, specular: 0x222222, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat)
      const ang = i * angleStep
      mesh.position.x = Math.sin(ang) * orbitRadius
      mesh.position.z = Math.cos(ang) * orbitRadius
      mesh.rotation.y = ang + Math.PI
      storyGroup!.add(mesh)
    })
  })

  currentRot = 0
  targetRot = 0
  storyGroup.rotation.y = 0

  const viewer = threeContainer.value
  viewer.addEventListener('pointerdown', onThreePointerDown)
  window.addEventListener('pointermove', onThreePointerMove)
  window.addEventListener('pointerup', onThreePointerUp)
  window.addEventListener('pointerleave', onThreePointerUp)

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToPlane(currentIndex.value - 1)
    if (e.key === 'ArrowRight') goToPlane(currentIndex.value + 1)
  })

  window.addEventListener('resize', onThreeResize)
  animateThree()
  currentIndex.value = 0
}

// Hero reveal + hl (minimal)
onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io!.unobserve(e.target) } })
  }, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' })

  document.querySelectorAll('.anim').forEach((el, i) => {
    if (i < 2) (el as HTMLElement).style.transitionDelay = `${i * 0.08}s`
    io!.observe(el)
  })

  const hlEls = document.querySelectorAll('.hl')
  if (reduceMotion) hlEls.forEach(el => el.classList.add('lit'))
  else {
    ioHl = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lit'); ioHl!.unobserve(e.target) } })
    }, { threshold: 0, rootMargin: '0px 0px -28% 0px' })
    hlEls.forEach(el => ioHl!.observe(el))
  }

  initThree()
})

onBeforeUnmount(() => {
  io?.disconnect()
  ioHl?.disconnect()
  window.removeEventListener('resize', onThreeResize)
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
/* ─── Wrap ─── (transparent so the living gradient shows through) */
.about-wrap {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  padding: calc(108rem + var(--safe-top)) 0 96rem;
  overflow-x: clip;
}

/* ─── Container ─── */
.about-container {
  position: relative;
  z-index: 1;
  max-width: 720rem;
  margin: 0 auto;
  padding: 0 24rem;
}

/* ─── Base reveal ─── (clean spring rise — crisp text, no blur layer) */
.anim {
  opacity: 0;
  transform: translateY(26rem) scale(0.985);
  transition:
    opacity 0.7s ease,
    transform 0.9s var(--ease-spring);
}
.anim.in-view {
  opacity: 1;
  transform: none;
}

/* ─── Frosted glass story panel ─── */
.about-panel {
  position: relative;
  z-index: 1;
  margin: 0 0 18rem;
  padding: 40rem 40rem;
  border-radius: 26rem;
  /* theme-true frosted glass: dark panel in dark theme, light in light theme */
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.10), transparent 38%),
    color-mix(in srgb, var(--color-bg) 62%, transparent);
  backdrop-filter: blur(26px) saturate(1.4);
  -webkit-backdrop-filter: blur(26px) saturate(1.4);
  border: 1px solid var(--color-glass-border);
  box-shadow:
    0 34rem 90rem -42rem rgba(0, 0, 0, 0.6),
    inset 0 1px 1px color-mix(in srgb, var(--color-text) 16%, transparent),
    inset 0 0 60rem color-mix(in srgb, var(--color-text) 3%, transparent);
}
.about-panel--hero {
  padding: 48rem 40rem 44rem;
  margin-bottom: 26rem;
  position: relative;
  overflow: hidden;
}

.hero-decor {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.12;
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: 0;
}
.about-panel--callout { padding: 30rem 36rem; }
.about-panel--closing { margin-bottom: 0; }

/* ─── Intro ─── */
.about-intro {
  font-size: clamp(32rem, 4vw, 50rem);
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: -0.04em;
  color: var(--color-text);
}

/* ─── Rule ─── */
.about-rule {
  border: none;
  border-top: 1px solid var(--color-divider);
  margin: 28rem 0 24rem;
}

/* ─── Lead ─── */
.about-lead {
  font-size: clamp(18rem, 2.1vw, 23rem);
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

/* ─── Scroll-emphasised headline words ─── */
/* Key words sit in normal ink until they scroll into the reading band, then
   cross-fade to the live backdrop palette (the same gradient stops the WebGL
   backdrop publishes). Wrap-safe: it tints the real text, so multi-word
   phrases never break across lines. */
.hl {
  /* symmetric stops so the flow loops seamlessly under `alternate` */
  background-image: linear-gradient(112deg,
    rgb(var(--grad-1, 200,120,255)),
    rgb(var(--grad-2, 130,150,255)),
    rgb(var(--grad-3, 120,200,255)),
    rgb(var(--grad-2, 130,150,255)),
    rgb(var(--grad-1, 200,120,255)));
  background-size: 220% auto;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--color-text);
  transition: -webkit-text-fill-color 0.8s ease;
}
.hl.lit {
  -webkit-text-fill-color: transparent;
  /* the gradient drifts back and forth once lit — the hero "moves" */
  animation: hl-flow 7s ease-in-out infinite alternate;
}
@keyframes hl-flow {
  from { background-position: 0% 50%; }
  to   { background-position: 100% 50%; }
}

/* ─── Chapter marker ─── */
.about-chapter {
  display: flex;
  align-items: baseline;
  gap: 14rem;
  margin: 0 0 22rem;
  font-size: 13rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.62;
}
.about-chapter__no {
  font-size: 13rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text);
  padding: 3rem 8rem;
  border: 1px solid color-mix(in srgb, var(--color-text) 35%, transparent);
  border-radius: 5rem;
  opacity: 0.9;
  transform-origin: left center;
  transition: transform 0.6s var(--ease-spring) 0.14s;
}
/* Micro-pop: the chapter chip springs in once its panel reveals */
.about-panel:not(.in-view) .about-chapter__no { transform: scale(0.55); }

/* ─── Body copy ─── */
.about-body {
  font-size: var(--text-body);
  font-weight: 400;
  line-height: 1.78;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.82;
}
.about-body + .about-body { margin-top: 18rem; }

/* ─── Callout ─── */
.about-callout {
  font-size: var(--text-body);
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: -0.02em;
  color: var(--color-text);
  border-left: 2px solid var(--color-accent);
  padding-left: 18rem;
}

/* ─── Pull ─── */
.about-pull {
  font-size: clamp(22rem, 2.6vw, 30rem);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.032em;
  color: var(--color-text);
  margin-bottom: 28rem;
}

/* ─── Questions ─── */
.about-questions {
  margin-bottom: 28rem;
}
.about-questions p {
  font-size: var(--text-body);
  font-weight: 400;
  font-style: italic;
  line-height: 2.0;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.72;
}

/* ───────────────── Cinematic photo shots — float on the gradient ───────────────── */
.shot {
  position: relative;
  z-index: 1;
  /* break out wider than the panels, floating directly on the gradient */
  width: min(92vw, 920rem);
  left: 50%;
  translate: -50% 0;
  margin: 34rem 0;
}

.shot__grid { display: grid; gap: 12rem; }
.shot__grid--duo { grid-template-columns: 1fr 1fr; }
.shot__grid--editorial { grid-template-columns: 1.5fr 1fr; }
.shot__grid--gallery { grid-template-columns: repeat(3, 1fr); gap: 16rem; }

/* Glass-framed cell — a floating "film still" */
.shot__cell {
  position: relative;
  overflow: hidden;
  border-radius: 16rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 30%, transparent);
  box-shadow:
    0 40rem 90rem -38rem rgba(0, 0, 0, 0.7),
    inset 0 1px 1px rgba(255, 255, 255, 0.28);
}
/* Duo / editorial use a fixed cinematic band height with cover crop */
.shot--duo .shot__cell      { aspect-ratio: 4 / 5; }
.shot__cell--wide           { aspect-ratio: 16 / 10; }
.shot__cell--tall           { aspect-ratio: 3 / 4; }

.shot__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 1.12;                                    /* cinematic settle (independent prop) */
  transition: scale 1.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.shot.in-view .shot__img { scale: 1.04; }

/* Solo portrait — a single centred glass-framed illustration */
.shot--solo { width: min(58vw, 360rem); }
.shot__cell--portrait { aspect-ratio: 1 / 1; }
.shot--solo .shot__img { scale: 1.06; }
.shot--solo.in-view .shot__img { scale: 1; }

/* Gallery items show the full collage (titles are baked in) — no crop, no overscan */
.shot__grid--gallery .shot__cell { aspect-ratio: auto; box-shadow: 0 34rem 76rem -34rem rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.24); }
.shot__grid--gallery .shot__img  { height: auto; object-fit: contain; scale: 1; }
.shot__item { margin: 0; }
.shot__tag {
  display: inline-block;
  margin-top: 12rem;
  padding: 6rem 11rem;
  border-radius: 9rem;
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.75;
  background: color-mix(in srgb, var(--color-bg) 52%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--color-glass-border);
}

/* Staggered reveal across gallery columns */
.shot--gallery .shot__item { opacity: 0; transform: translateY(18rem); transition: opacity 0.7s ease, transform 0.7s ease; }
.shot--gallery.in-view .shot__item:nth-child(1) { opacity: 1; transform: none; transition-delay: 0.05s; }
.shot--gallery.in-view .shot__item:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.16s; }
.shot--gallery.in-view .shot__item:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.27s; }

/* Caption — a frosted glass chip so it stays legible over the vivid gradient */
.shot__cap {
  display: flex;
  gap: 14rem;
  margin-top: 18rem;
  max-width: 640rem;
  padding: 15rem 18rem;
  border-radius: 14rem;
  font-size: var(--text-sm);
  line-height: 1.6;
  letter-spacing: -0.012em;
  color: var(--color-text);
  opacity: 0.92;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border: 1px solid var(--color-glass-border);
  box-shadow: inset 0 1px 1px color-mix(in srgb, var(--color-text) 14%, transparent);
  transition: opacity 0.6s ease 0.16s, transform 0.7s var(--ease-spring) 0.16s;
}
/* Caption settles in just after its photo frame */
.shot:not(.in-view) .shot__cap { opacity: 0; transform: translateY(10rem); }
.shot__cap em     { font-style: italic; opacity: 0.95; }
.shot__cap strong { font-weight: 600; }
.shot__cap-rule {
  flex: 0 0 auto;
  width: 2px;
  align-self: stretch;
  background: var(--color-accent);
  border-radius: 2px;
}

/* ─── Asatoma ─── */
.about-asatoma {
  font-size: var(--text-body);
  font-weight: 500;
  font-style: italic;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.5;
  margin-top: 28rem;
}

/* ─── Peak web dev wordplay extravaganza ─── */
.about-extravaganza {
  margin-top: 24rem;
  display: flex;
  align-items: center;
  gap: 12rem;
  font-family: ui-monospace, monospace;
  font-size: 13rem;
  letter-spacing: 0.08em;
  opacity: 0.65;
}
.about-extravaganza .code-word {
  padding: 4rem 10rem;
  border-radius: 6rem;
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}
.about-extravaganza .code-word:hover {
  opacity: 1;
  transform: translateY(-1rem) scale(1.02);
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  border-color: var(--color-glass-border-hover);
  box-shadow: 0 4rem 14rem -6rem rgba(0,0,0,0.3);
}

/* Little "compiling" pulse on the pipeline — feels like the whole site is one big render loop */
.about-extravaganza .code-word:nth-child(1) { animation: code-pulse 2.4s ease-in-out infinite; }
.about-extravaganza .code-word:nth-child(3) { animation: code-pulse 2.4s ease-in-out 0.4s infinite; }
.about-extravaganza .code-word:nth-child(5) { animation: code-pulse 2.4s ease-in-out 0.8s infinite; }

@keyframes code-pulse {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 0.95; }
}



/* ───────────────── Desktop micro-interactions (hover-capable only) ───────────────── */
/* A soft specular highlight tracks the cursor across each glass surface — the
   "liquid glass catches the light" tell. Driven by --mx/--my from pointermove
   (set in script, rAF-throttled). Pointer-fine devices only; phones never bind. */
.about-panel, .shot__cell { --mx: 50%; --my: 50%; --sheen: 0; }

@media (hover: hover) and (pointer: fine) {
  .about-panel::after,
  .shot__cell::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 3;
    background: radial-gradient(200rem circle at var(--mx) var(--my),
      rgba(255, 255, 255, 0.14), transparent 60%);
    opacity: var(--sheen);
    transition: opacity 0.4s ease;
    mix-blend-mode: screen;
  }

  /* Photo frames lift gently toward the viewer on hover */
  .shot__cell {
    transition: transform 0.5s var(--ease-spring), box-shadow 0.5s ease;
  }
  .shot__cell:hover {
    transform: translateY(-5rem);
    box-shadow:
      0 56rem 110rem -38rem rgba(0, 0, 0, 0.78),
      inset 0 1px 1px rgba(255, 255, 255, 0.34);
  }
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .anim,
  .shot__item,
  .shot__cap,
  .shot__cell,
  .about-chapter__no,
  .shot__img { transition: none; }
  .hl { transition: none; }
  .hl.lit { animation: none; }
  .shot__img { scale: 1; }
  .about-panel::after, .shot__cell::after { display: none; }
}

/* Simple story progress bar (top, non-intrusive, works on mobile) */
.story-progress {
  position: fixed;
  top: calc(80rem + var(--safe-top));
  left: 0;
  right: 0;
  height: 3rem;
  background: color-mix(in srgb, var(--color-glass-border) 30%, transparent);
  z-index: 90;
  pointer-events: none;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, var(--color-accent), var(--color-text));
  transition: width 0.1s linear;
  will-change: width;
}

/* Chapter nav - mobile optimized: horizontal scroll, thumb friendly */
.chapter-nav {
  position: sticky;
  top: calc(88rem + var(--safe-top));
  z-index: 95;
  display: flex;
  overflow-x: auto;
  gap: 8rem;
  padding: 12rem 16rem;
  margin-bottom: 20rem;
  border-radius: 16rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.chapter-nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  flex: 0 0 auto;
  padding: 8rem 16rem;
  font-size: 12rem;
  border-radius: 999rem;
  background: color-mix(in srgb, var(--color-bg) 60%, transparent);
  border: 1px solid var(--color-glass-border);
  color: var(--color-text);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item.active {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

@media (min-width: 820px) {
  .chapter-nav {
    flex-direction: column;
    position: fixed;
    top: 180rem;
    left: 24rem;
    width: 160rem;
    overflow: visible;
  }
  .nav-item {
    padding: 10rem 14rem;
    font-size: 13rem;
  }
}

/* Image reveals - keep light for mobile perf */
.shot__img {
  transition: transform 1.2s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}

.shot.in-view .shot__img {
  transform: scale(1);
}

/* ─── Tablet ─── */
@media (max-width: 820px) {
  .shot { width: min(94vw, 720rem); }
  .shot__grid--editorial { grid-template-columns: 1.4fr 1fr; }
}

/* ─── Mobile ─── */
@media (max-width: 600px) {
  .about-wrap { padding-top: calc(92rem + var(--safe-top)); }
  .about-container { padding: 0 14rem; }

  /* Lighter backdrop blur on phones — backdrop-filter is the heaviest GPU cost */
  .about-panel {
    padding: 28rem 24rem;
    border-radius: 22rem;
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
  }
  .about-panel--hero { padding: 34rem 24rem 30rem; }
  .about-panel--callout { padding: 24rem 22rem; }

  .shot { width: 100%; left: 0; translate: none; margin: 26rem 0; }
  .shot--solo { width: min(70vw, 280rem); left: 50%; translate: -50% 0; }
  .shot__grid--duo { grid-template-columns: 1fr 1fr; gap: 10rem; }
  .shot__grid--editorial { grid-template-columns: 1fr; }
  .shot__cell--wide { aspect-ratio: 16 / 10; }
  .shot__cell--tall { aspect-ratio: 16 / 11; }
  .shot__grid--gallery { grid-template-columns: 1fr; gap: 22rem; }
  .shot__cap { font-size: 13rem; }

  /* Mobile chapter nav: easy horizontal swipe */
  .chapter-nav {
    top: calc(84rem + var(--safe-top));
    padding: 8rem 12rem;
    gap: 6rem;
  }
  .nav-item {
    padding: 6rem 12rem;
    font-size: 11rem;
  }

  /* Progress thinner */
  .story-progress {
    height: 2rem;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   3D STORY SPACE
   Planes arranged in 3D circle. Swipe/drag to navigate.
   Cohesive glass + gradient theme, cinematic, mobile optimized.
   ═══════════════════════════════════════════════════════════════════════ */

.story-3d-wrapper {
  perspective: 1200px;
  height: 72vh;
  margin: 40rem 0;
  position: relative;
  touch-action: pan-y; /* allow vertical scroll, capture horizontal swipes */
  overflow: visible;
}

.story-3d {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: grab;
}

.story-3d:active {
  cursor: grabbing;
}

.story-group {
  width: 100%;
  height: 100%;
  position: absolute;
  transform-style: preserve-3d;
  will-change: transform;
}

.story-plane {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  background: color-mix(in srgb, var(--color-bg) 58%, transparent);
  border: 1px solid var(--color-glass-border);
  border-radius: 20rem;
  padding: 24rem 28rem;
  backdrop-filter: blur(22px) saturate(1.35);
  -webkit-backdrop-filter: blur(22px) saturate(1.35);
  box-shadow: 0 30rem 80rem -30rem rgba(0,0,0,0.55);
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: box-shadow 0.3s ease, opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.story-plane.active {
  box-shadow: 0 40rem 100rem -24rem rgba(0,0,0,0.65),
              0 0 0 1px var(--color-glass-border-hover);
  z-index: 2;
}

.plane-inner {
  width: 100%;
  max-height: 100%;
  overflow: auto;
  font-size: 15rem;
  line-height: 1.45;
}

.plane-inner .about-chapter {
  font-size: 18rem;
  margin-bottom: 14rem;
}

.plane-image {
  margin: 20rem 0;
}

.story-img {
  width: 100%;
  border-radius: 14rem;
  display: block;
  box-shadow: 0 10rem 30rem -10rem rgba(0,0,0,0.4);
}

.plane-caption {
  font-size: 13rem;
  opacity: 0.85;
  margin-top: 12rem;
  line-height: 1.4;
}

.plane-questions {
  margin-top: 16rem;
  font-size: 13rem;
  opacity: 0.8;
}

.plane-questions p {
  margin: 6rem 0;
}

.swipe-hint {
  text-align: center;
  margin-top: 16rem;
  font-size: 12rem;
  opacity: 0.55;
  letter-spacing: 0.04em;
}

.plane-indicators {
  display: flex;
  justify-content: center;
  gap: 10rem;
  margin-top: 18rem;
}

.plane-indicators .dot {
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  background: var(--color-glass-border);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plane-indicators .dot.active {
  background: var(--color-accent);
  transform: scale(1.3);
}

/* Desktop: slightly larger planes */
@media (min-width: 820px) {
  .story-3d-wrapper {
    height: 78vh;
  }
  .story-plane {
    width: 70%;
    left: 15%;
    padding: 32rem 36rem;
  }
}

/* ─── Three.js 3D Story Orbit (immersive, accessible, performant) ─── */
.story-3d-wrapper {
  max-width: 980px;
  margin: 22rem auto 36rem;
  padding: 0 12px;
  position: relative;
}

.story-3d {
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0,0,0,0.02);
  touch-action: none;
  cursor: grab;
}
.story-3d:active { cursor: grabbing; }

.story-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.chapter-info {
  margin: 18px auto 0;
  max-width: 620px;
  padding: 22px 24px;
}
.chapter-info .about-chapter { margin-bottom: 14px; }
.chapter-info .about-body { margin-bottom: 10px; }

.plane-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
}
.dot {
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 1px solid var(--color-glass-border);
  background: transparent;
  cursor: pointer;
  transition: background .12s ease, transform .12s ease;
}
.dot.active {
  background: var(--color-text);
  border-color: var(--color-text);
  transform: scale(1.1);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .story-3d { transition: none; }
}

/* ─── 3D Story Orbit (immersive swipe carousel) ─── */
.story-3d-wrapper {
  perspective: 1300px;
  margin: 28rem auto 48rem;
  max-width: 980px;
  padding: 0 16px;
  position: relative;
}

.story-3d {
  position: relative;
  height: 520px;
  width: 100%;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
}
.story-3d:active { cursor: grabbing; }

.story-group {
  position: absolute;
  left: 50%;
  top: 48%;
  transform-style: preserve-3d;
}

.story-plane {
  position: absolute;
  width: min(86vw, 480px);
  min-height: 410px;
  padding: 26px 22px;
  border-radius: 20px;
  transform-origin: 50% 50%;
  background: color-mix(in srgb, var(--color-bg) 66%, transparent);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(22px) saturate(1.35);
  -webkit-backdrop-filter: blur(22px) saturate(1.35);
  box-shadow:
    0 28px 90px -26px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255,255,255,0.12);
  will-change: transform;
  display: flex;
  align-items: center;
}
.story-plane.is-active {
  box-shadow:
    0 38px 110px -22px rgba(0, 0, 0, 0.72),
    inset 0 1px 0 rgba(255,255,255,0.18);
}

.plane-content { width: 100%; }
.plane-media {
  margin: 16px 0 12px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-glass-border);
  background: rgba(0,0,0,0.06);
}
.plane-media img { width: 100%; height: auto; display: block; }

.plane-footnote {
  font-size: 12.5px;
  line-height: 1.45;
  opacity: .72;
  margin-top: 8px;
}
.plane-questions {
  margin-top: 12px;
  font-size: 13.5px;
  line-height: 1.55;
  font-style: italic;
  opacity: .78;
}

.swipe-hints {
  text-align: center;
  margin-top: 12px;
  font-size: 11px;
  letter-spacing: 0.02em;
  opacity: 0.55;
}

.plane-dots {
  display: flex;
  justify-content: center;
  gap: 9px;
  margin-top: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid var(--color-glass-border);
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;
}
.dot.active {
  background: var(--color-text);
  border-color: var(--color-text);
  transform: scale(1.15);
}

@media (max-width: 640px) {
  .story-3d { height: 460px; }
  .story-plane { min-height: 360px; padding: 20px 16px; }
}
</style>
