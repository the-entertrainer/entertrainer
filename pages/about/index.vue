<template>
  <div class="about-wrap">
    <UiGlassBackdrop />

    <div class="about-container">
      <section class="glass-panel about-panel about-panel--hero anim">
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

    <!-- 3D Story Orbit powered by Three.js -->
    <div class="story-3d-wrapper">
      <div class="story-3d" ref="threeContainer" aria-label="Interactive 3D story: drag or swipe to orbit memory photos.">
        <canvas ref="threeCanvas" class="story-canvas"></canvas>
        <div class="swipe-hints" aria-hidden="true">
          <div class="hint">drag or swipe to orbit • tap dots to jump</div>
        </div>
      </div>

      <div class="chapter-info glass-panel">
        <p class="about-chapter"><span class="about-chapter__no">{{ String(currentIndex + 1).padStart(2, '0') }}</span> {{ chapters[currentIndex].title }}</p>
        <p class="about-body">{{ chapters[currentIndex].body }}</p>
        <p class="plane-footnote" v-if="chapters[currentIndex].footnote">{{ chapters[currentIndex].footnote }}</p>
        <div class="plane-questions" v-if="chapters[currentIndex].questions">
          <p v-for="(q, i) in chapters[currentIndex].questions" :key="i">{{ q }}</p>
        </div>
      </div>

      <div class="plane-dots" role="tablist" aria-label="Chapters">
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

useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'From folding towels at a hotel to designing learning for banking teams. The story and the thinking behind Entertrainer.',
  ogTitle: 'About Naveen Jose · Entertrainer',
  ogDescription: 'From folding towels at a hotel to designing learning for banking teams.',
  ogUrl: 'https://entertrainer.in/about'
})

// Data
const chapters = [
  { title: 'The Floor', body: "It started in hotel rooms. Club Mahindra, Marriott. I was the one turning chaos into something that made people exhale when they walked in. Making the bed just so. Folding towels into little animals because why not. It wasn't glamorous. It was the feeling that someone had their back.", footnote: 'I still fold towels that way at home. Small things add up.' },
  { title: 'The Spark', body: 'One day we turned a stack of dry service standards into a comic called SEWA Chronicles. People actually read it. They smiled at their desks. That was the first time I saw what happens when you wrap something useful in something that feels made by a person for a person. I wanted more of that.', footnote: '', questions: ['What makes someone actually remember something?', 'How do we help people feel capable instead of buried?', 'What turns information into something that quietly changes how a person sees their work?'] },
  { title: 'The Craft', body: "Later at Marriott I built leadership programs, trainer trainings, onboarding that didn't feel like a checklist. The best rooms were the ones where tired people leaned forward because a story landed. Not louder. Just more human.", footnote: "Those rooms showed me that when learning feels generous, people don't just remember it. They pass it on." },
  { title: 'The Present', body: "Now I'm with banking teams at Concentrix. We take tangled new ways of working and turn them into something a person can actually see themselves doing on Monday. The software changes. The heart of it doesn't.", footnote: 'The moment someone says "I think I can do this now" — that\'s the whole point.' }
]

let io: IntersectionObserver | null = null
let ioHl: IntersectionObserver | null = null
let reduceMotion = false

// Three.js state
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
    onUpdate: () => { currentRot = storyGroup!.rotation.y; updateCurrentFromRot() }
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
  camera = new THREE.PerspectiveCamera(58, threeContainer.value.clientWidth / threeContainer.value.clientHeight, 0.1, 100)
  camera.position.set(0, 0.7, 8.0)

  const dpr = Math.min(window.devicePixelRatio || 1, reduceMotion ? 1 : 1.5)
  renderer = new THREE.WebGLRenderer({ canvas: threeCanvas.value, antialias: true, alpha: true })
  renderer.setPixelRatio(dpr)
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)

  scene.add(new THREE.AmbientLight(0xffffff, 0.68))
  const key = new THREE.DirectionalLight(0xffffff, 0.95); key.position.set(4, 5, 7); scene.add(key)
  const rim = new THREE.DirectionalLight(0x99aaff, 0.32); rim.position.set(-5, 1, -6); scene.add(rim)

  storyGroup = new THREE.Group()
  scene.add(storyGroup)

  const loader = new THREE.TextureLoader()
  const urls = ['/about/about-housekeeper-1.webp', '/about/about-sewa-1.webp', '/about/about-ignite.webp', '/about/about-concentrix.webp']
  const pw = 4.35, ph = 2.9

  urls.forEach((url, i) => {
    const mat = new THREE.MeshPhongMaterial({ color: 0x334455, shininess: 36, specular: 0x222222, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat)
    const ang = i * angleStep
    mesh.position.x = Math.sin(ang) * orbitRadius
    mesh.position.z = Math.cos(ang) * orbitRadius
    mesh.rotation.y = ang + Math.PI
    storyGroup!.add(mesh)

    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      ;(mat as any).map = tex
      ;(mat as any).color.set(0xffffff)
      ;(mat as any).needsUpdate = true
    })
  })

  currentRot = 0
  targetRot = 0
  storyGroup.rotation.y = 0

  const viewer = threeContainer.value
  const downFn = (e: PointerEvent) => onThreePointerDown(e)
  const moveFn = (e: PointerEvent) => onThreePointerMove(e)
  const upFn = (e: PointerEvent) => onThreePointerUp(e)
  const keyFn = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') goToPlane(currentIndex.value - 1); if (e.key === 'ArrowRight') goToPlane(currentIndex.value + 1) }

  viewer.addEventListener('pointerdown', downFn)
  window.addEventListener('pointermove', moveFn)
  window.addEventListener('pointerup', upFn)
  window.addEventListener('pointerleave', upFn)
  window.addEventListener('keydown', keyFn)

  ;(viewer as any)._td = downFn
  ;(window as any)._tm = moveFn; ;(window as any)._tu = upFn; ;(window as any)._tk = keyFn

  window.addEventListener('resize', onThreeResize)
  animateThree()
  currentIndex.value = 0
}

// Hero + init
onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io!.unobserve(e.target) } }) }, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' })
  document.querySelectorAll('.anim').forEach((el, i) => { if (i < 2) (el as HTMLElement).style.transitionDelay = `${i * 0.08}s`; io!.observe(el) })

  const hlEls = document.querySelectorAll('.hl')
  if (reduceMotion) hlEls.forEach(el => el.classList.add('lit'))
  else {
    ioHl = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lit'); ioHl!.unobserve(e.target) } }) }, { threshold: 0, rootMargin: '0px 0px -28% 0px' })
    hlEls.forEach(el => ioHl!.observe(el))
  }

  initThree()
})

onBeforeUnmount(() => {
  io?.disconnect(); ioHl?.disconnect()
  window.removeEventListener('resize', onThreeResize)

  const viewer = threeContainer.value
  if (viewer && (viewer as any)._td) viewer.removeEventListener('pointerdown', (viewer as any)._td)
  if ((window as any)._tm) window.removeEventListener('pointermove', (window as any)._tm)
  if ((window as any)._tu) {
    window.removeEventListener('pointerup', (window as any)._tu)
    window.removeEventListener('pointerleave', (window as any)._tu)
  }
  if ((window as any)._tk) window.removeEventListener('keydown', (window as any)._tk)

  if (renderer) { renderer.dispose(); renderer = null }
  scene = camera = storyGroup = null
})
</script>

<style scoped>
.about-wrap { position: relative; z-index: 1; min-height: 100dvh; padding: calc(108rem + var(--safe-top)) 0 96rem; overflow-x: clip; }
.about-container { position: relative; z-index: 1; max-width: 720rem; margin: 0 auto; padding: 0 24rem; }
.anim { opacity: 0; transform: translateY(26rem) scale(0.985); transition: opacity .7s ease, transform .9s var(--ease-spring); }
.anim.in-view { opacity: 1; transform: none; }
.about-panel { position: relative; z-index: 1; margin: 0 0 18rem; padding: 40rem 40rem; border-radius: 26rem; background: linear-gradient(180deg, rgba(255,255,255,.1), transparent 38%), color-mix(in srgb, var(--color-bg) 62%, transparent); backdrop-filter: blur(26px) saturate(1.4); -webkit-backdrop-filter: blur(26px) saturate(1.4); border: 1px solid var(--color-glass-border); box-shadow: 0 34rem 90rem -42rem rgba(0,0,0,.6), inset 0 1px 1px color-mix(in srgb, var(--color-text) 16%, transparent), inset 0 0 60rem color-mix(in srgb, var(--color-text) 3%, transparent); }
.about-panel--hero { padding: 48rem 40rem 44rem; margin-bottom: 26rem; position: relative; overflow: hidden; }
.hero-decor { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: .12; mix-blend-mode: screen; pointer-events: none; z-index: 0; }
.about-panel--closing { margin-bottom: 0; }
.about-intro { font-size: clamp(32rem, 4vw, 50rem); font-weight: 700; line-height: 1.18; letter-spacing: -.04em; color: var(--color-text); }
.about-rule { border: none; border-top: 1px solid var(--color-divider); margin: 28rem 0 24rem; }
.about-lead { font-size: clamp(18rem, 2.1vw, 23rem); font-weight: 500; line-height: 1.55; letter-spacing: -.025em; color: var(--color-text); }
.hl { background-image: linear-gradient(112deg, rgb(var(--grad-1,200,120,255)), rgb(var(--grad-2,130,150,255)), rgb(var(--grad-3,120,200,255)), rgb(var(--grad-2,130,150,255)), rgb(var(--grad-1,200,120,255))); background-size: 220% auto; background-position: 0% 50%; -webkit-background-clip: text; -webkit-text-fill-color: var(--color-text); transition: -webkit-text-fill-color .8s; }
.hl.lit { -webkit-text-fill-color: transparent; animation: hl-flow 7s ease-in-out infinite alternate; }
@keyframes hl-flow { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
.about-chapter { display: flex; align-items: baseline; gap: 14rem; margin: 0 0 22rem; font-size: 13rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--color-text); opacity: .62; }
.about-chapter__no { font-size: 13rem; font-weight: 700; letter-spacing: .05em; color: var(--color-text); padding: 3rem 8rem; border: 1px solid color-mix(in srgb, var(--color-text) 35%, transparent); border-radius: 5rem; opacity: .9; }
.about-body { font-size: var(--text-body); font-weight: 400; line-height: 1.78; letter-spacing: -.018em; color: var(--color-text); opacity: .82; }
.about-asatoma { font-size: var(--text-body); font-weight: 500; font-style: italic; letter-spacing: -.018em; color: var(--color-text); opacity: .5; margin-top: 28rem; }
.story-3d-wrapper { max-width: 980px; margin: 22rem auto 36rem; padding: 0 12px; position: relative; }
.story-3d { position: relative; width: 100%; height: 420px; border-radius: 18px; overflow: hidden; background: rgba(0,0,0,.02); touch-action: none; cursor: grab; }
.story-3d:active { cursor: grabbing; }
.story-canvas { width: 100%; height: 100%; display: block; }
.chapter-info { margin: 18px auto 0; max-width: 620px; padding: 22px 24px; }
.chapter-info .about-chapter { margin-bottom: 14px; }
.chapter-info .about-body { margin-bottom: 10px; }
.plane-dots { display: flex; justify-content: center; gap: 10px; margin-top: 12px; }
.dot { width: 11px; height: 11px; border-radius: 999px; border: 1px solid var(--color-glass-border); background: transparent; cursor: pointer; transition: background .12s ease, transform .12s ease; }
.dot.active { background: var(--color-text); border-color: var(--color-text); transform: scale(1.1); }
@media (prefers-reduced-motion: reduce) { .anim, .hl { transition: none; } .hl.lit { animation: none; } }
@media (max-width: 600px) { .story-3d { height: 380px; } .chapter-info { padding: 18px 18px; } }
</style>