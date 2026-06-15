<script setup lang="ts">
import gsap from 'gsap'
import { useMenuStore } from '~/stores/menu'
import { useContentStore } from '~/stores/content'
import { useThemeStore } from '~/stores/theme'

const menuStore    = useMenuStore()
const contentStore = useContentStore()
const themeStore   = useThemeStore()
const isOpened     = computed(() => menuStore.isOpened)

const links = [
  { label: 'home',     to: '/',                                            external: false },
  { label: 'linkedin', to: 'https://www.linkedin.com/in/entertrainer/',    external: true  },
  { label: 'contact',  to: `mailto:${contentStore.email}`,                 external: true  }
]
const linkEls = ref<HTMLElement[]>([])

onMounted(() => {
  gsap.set(linkEls.value, { y: -20, x: 20, opacity: 0 })
})

watch(isOpened, (open) => {
  gsap.killTweensOf(linkEls.value)
  if (open) {
    gsap.to(linkEls.value, {
      y: 0, x: 0, opacity: 1,
      duration: 0.5, delay: 0.2, ease: 'power2.out', stagger: 0.1
    })
  } else {
    gsap.to(linkEls.value, {
      y: -20, x: 20, opacity: 0,
      duration: 0.2, ease: 'power4.out', stagger: -0.05
    })
  }
})

function setLinkEl(el: any, i: number) {
  if (!el) return
  linkEls.value[i] = el.$el ?? el
}
</script>

<template>
  <div class="menu">
    <div class="menu-subwrapper" :class="{ opened: isOpened }">
      <!-- Menu circle button (closed state) -->
      <button class="menu-button" @click="menuStore.toggle" aria-label="open menu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <!-- Close button -->
      <button class="menu-close" @click="menuStore.close" aria-label="close menu">×</button>

      <!-- Nav links -->
      <nav class="menu-links">
        <template v-for="(link, i) in links" :key="link.label">
          <a
            v-if="link.external"
            :href="link.to"
            target="_blank"
            rel="noopener noreferrer"
            class="menu-link"
            :ref="(el: any) => setLinkEl(el, i)"
            >{{ link.label }}</a
          >
          <NuxtLink
            v-else
            :to="link.to"
            class="menu-link"
            :ref="(el: any) => setLinkEl(el, i)"
            @click="menuStore.close()"
            >{{ link.label }}</NuxtLink
          >
        </template>
        <!-- Theme toggle inside menu -->
        <button class="menu-theme" :ref="(el: any) => setLinkEl(el, links.length)" @click="themeStore.set(themeStore.isDark ? 'light' : 'dark')">
          {{ themeStore.isDark ? 'light' : 'dark' }}
        </button>
      </nav>
    </div>
  </div>
</template>
