<script setup lang="ts">
import gsap from 'gsap'

const sectionEl = ref<HTMLElement | null>(null)
const trailImages = ref<HTMLElement[]>([])
const mouseX = ref(0)
const mouseY = ref(0)
const smoothX = ref(0)
const smoothY = ref(0)
let currentIndex = 0
let lastX = 0
let lastY = 0
let rafId = 0

const stickers = [
  { color: '#1a1a2e', label: '✦' },
  { color: '#16213e', label: '◈' },
  { color: '#0f3460', label: '⬡' },
  { color: '#533483', label: '✿' },
  { color: '#1a1a2e', label: '◉' },
  { color: '#16213e', label: '✦' },
]

onMounted(() => {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const THRESHOLD = 80

  function loop() {
    smoothX.value = lerp(smoothX.value, mouseX.value, 0.1)
    smoothY.value = lerp(smoothY.value, mouseY.value, 0.1)

    const dist = Math.sqrt(
      Math.pow(mouseX.value - lastX, 2) + Math.pow(mouseY.value - lastY, 2)
    )
    if (dist > THRESHOLD && trailImages.value.length > 0) {
      const img = trailImages.value[currentIndex % trailImages.value.length]
      if (img) {
        const inner = img.querySelector('.sticker-inner')
        gsap.killTweensOf([img, inner])
        gsap.timeline()
          .fromTo(img,
            { opacity: 1, scale: 0, x: smoothX.value - 40, y: smoothY.value - 40 },
            { scale: 1, x: mouseX.value - 40, y: mouseY.value - 40, duration: 0.4, ease: 'power2.out' },
            0
          )
          .fromTo(inner,
            { scale: 2.5 },
            { scale: 1, duration: 0.4, ease: 'power2.out' },
            0
          )
          .to(img, { opacity: 0, scale: 0.8, duration: 0.3, delay: 0.6, ease: 'power2.in' })
        currentIndex++
      }
      lastX = mouseX.value
      lastY = mouseY.value
    }
    rafId = requestAnimationFrame(loop)
  }
  loop()
})

onUnmounted(() => cancelAnimationFrame(rafId))

function onMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}
</script>

<template>
  <div class="about-page" @mousemove="onMouseMove">
    <!-- Header — Logo & Menu are global in app.vue -->
    <header class="about-header">
      <NuxtLink to="/" class="back-link">← back</NuxtLink>
      <span class="about-emoji">😊</span>
    </header>

    <!-- Hero text -->
    <section class="about-hero" ref="sectionEl">
      <h1 class="about-title">
        <span>Motion designer</span>
        <br />
        <em>&amp; creative developer</em>
      </h1>
      <div class="about-bio">
        <p>
          I design and build digital experiences that exist at the intersection of
          motion, code, and craft. Every project is an exploration — a chance to push
          the boundaries of what's possible on screen.
        </p>
        <p>
          Available for freelance projects. Currently based somewhere interesting.
        </p>
        <a href="mailto:hello@example.com" class="email-link">hello@example.com</a>
      </div>
    </section>

    <!-- Sticker trail images (About page) -->
    <div
      v-for="(sticker, i) in Array(24).fill(null)"
      :key="i"
      :ref="(el) => { if (el) trailImages[i] = el as HTMLElement }"
      class="trail-sticker"
      :style="{ background: stickers[i % stickers.length].color }"
    >
      <span class="sticker-inner">{{ stickers[i % stickers.length].label }}</span>
    </div>

    <!-- Bottom nav -->
    <footer class="about-footer">
      <span>© 2025 — all rights reserved</span>
      <div class="social-row">
        <a href="https://instagram.com" target="_blank">instagram</a>
        <a href="https://behance.net" target="_blank">behance</a>
        <a href="https://linkedin.com" target="_blank">linkedin</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100dvh;
  background: var(--color-black);
  color: var(--color-white);
  padding: 0 var(--grid-margin);
  padding-bottom: 60rem;
  position: relative;
  overflow: hidden;
}
.about-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rem;
  padding-bottom: 60rem;
}
.back-link {
  font-size: 16rem;
  font-weight: 500;
  color: var(--color-white);
  opacity: 0.6;
  text-decoration: none;
  transition: opacity 0.2s ease;
}
.back-link:hover { opacity: 1; }
.about-emoji { font-size: 28rem; }

.about-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60rem;
  align-items: start;
  padding: 80rem 0;
}
.about-title {
  font-size: clamp(60rem, 8vw, 120rem);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1;
}
.about-title em {
  font-style: italic;
}
.about-bio {
  display: flex;
  flex-direction: column;
  gap: 24rem;
  padding-top: 12rem;
}
.about-bio p {
  font-size: 18rem;
  font-weight: 500;
  line-height: 1.6;
  opacity: 0.8;
}
.email-link {
  font-size: 20rem;
  font-weight: 600;
  color: var(--color-pop-green);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 2rem;
  width: fit-content;
}

.trail-sticker {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  width: 80rem;
  height: 80rem;
  border-radius: 50%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}
.sticker-inner {
  font-size: 32rem;
  display: block;
}

.about-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-white20);
  padding-top: 24rem;
  margin-top: 80rem;
  font-size: 14rem;
  opacity: 0.4;
}
.social-row {
  display: flex;
  gap: 24rem;
}
.social-row a {
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s ease;
}
.social-row a:hover { opacity: 0.7; }

@media (max-width: 900px) {
  .about-hero {
    grid-template-columns: 1fr;
    gap: 40rem;
  }
}
</style>
