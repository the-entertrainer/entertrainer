<script setup lang="ts">
import gsap from 'gsap'
import { useMenuStore } from '~/stores/menu'
import { useContentStore } from '~/stores/content'

const menuStore = useMenuStore()
const contentStore = useContentStore()
const isOpened = computed(() => menuStore.isOpened)

// ── Menu button elastic letters ────────────────────────────
const letters = ref<HTMLElement[]>([])
let btnTl: gsap.core.Timeline | null = null

const links = [
  { label: 'home',     to: '/',                                            external: false },
  { label: 'linkedin', to: 'https://www.linkedin.com/in/entertrainer/',    external: true  },
  { label: 'contact',  to: `mailto:${contentStore.email}`,                 external: true  }
]
const linkEls = ref<HTMLElement[]>([])

onMounted(() => {
  btnTl = gsap
    .timeline({ paused: true })
    .to(letters.value, {
      rotation: () => gsap.utils.random(-15, 15),
      scale: () => gsap.utils.random(1.15, 1.4),
      fontWeight: 600,
      duration: 0.25,
      ease: 'power2.out',
      stagger: 0.05
    })
    .to(letters.value, {
      rotation: 0,
      scale: 1,
      fontWeight: 500,
      duration: 0.25,
      ease: 'elastic.out(1, 0.8)',
      stagger: 0.05
    })

  gsap.set(linkEls.value, { y: -20, x: 20, opacity: 0 })
})

watch(isOpened, (open) => {
  gsap.killTweensOf(linkEls.value)
  if (open) {
    gsap.to(linkEls.value, {
      y: 0,
      x: 0,
      opacity: 1,
      duration: 0.5,
      delay: 0.2,
      ease: 'power2.out',
      stagger: 0.1
    })
  } else {
    gsap.to(linkEls.value, {
      y: -20,
      x: 20,
      opacity: 0,
      duration: 0.2,
      ease: 'power4.out',
      stagger: -0.05
    })
  }
})

function onBtnEnter() {
  btnTl?.restart()
}

function onLinkClick(link: typeof links[0]) {
  if (!link.external) menuStore.close()
}

function setLinkEl(el: any, i: number) {
  if (!el) return
  linkEls.value[i] = el.$el ?? el
}
</script>

<template>
  <div class="menu">
    <div class="menu-subwrapper" :class="{ opened: isOpened }">
      <!-- Menu pill button (closed state) -->
      <button class="menu-button" @mouseenter="onBtnEnter" @click="menuStore.toggle">
        <span
          v-for="(l, i) in ['m', 'e', 'n', 'u']"
          :key="i"
          :ref="(el) => { if (el) letters[i] = el as HTMLElement }"
          class="letter"
          >{{ l }}</span
        >
      </button>

      <!-- Close button -->
      <button class="menu-close" @click="menuStore.close" aria-label="close menu">×</button>

      <!-- Nav links -->
      <nav class="menu-links">
        <a
          v-for="(link, i) in links"
          :key="link.label"
          :href="link.to"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
          class="menu-link"
          :ref="(el: any) => setLinkEl(el, i)"
          @click="onLinkClick(link)"
          >{{ link.label }}</a
        >
      </nav>
    </div>
  </div>
</template>
