<script setup lang="ts">
/**
 * The home page is the card stack and nothing else. Every previous pass kept
 * a masthead and a footer index around it "for navigation" — but the cards
 * already are the navigation (flick, then click one), and stacking a nav bar
 * and a footer on top of a UI that already does that job just reads as
 * clutter around the one thing that matters. Real destinations
 * (content/navigation.json's "home" array) are the sheets on the press bed;
 * selecting one routes straight to that page.
 *
 * The four links still exist in the DOM (sr-only) so the page stays
 * crawlable and usable without WebGL or a pointer — the visual design is
 * card-only, the markup isn't link-only-to-sighted-mouse-users.
 */
import concept from '~/experience/lab/concepts/press'
import { useContentStore } from '~/stores/content'
import type { NavItem } from '~/types/nav'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'Naveen Jose is a Certified Instructional Design Specialist who builds training people actually finish — plus four free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Instructional design, but fun. Training people actually finish, and the free tools that make it.',
  ogUrl: 'https://entertrainer.in/'
})

const contentStore = useContentStore()

function onSelect(item: NavItem) {
  navigateTo(item.href)
}
</script>

<template>
  <div class="home">
    <nav class="sr-only" aria-label="Sections">
      <NuxtLink v-for="item in contentStore.homeNav" :key="item.id" :to="item.href">{{ item.label }}</NuxtLink>
    </nav>

    <LabSpatialStage :concept="concept" :items="contentStore.homeNav" @select="onSelect">
      <p class="home__hint">Flick up to turn &middot; click the top sheet to open</p>
    </LabSpatialStage>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  height: 100dvh;
  overflow: hidden;
  background: #dedbd2;
}
.home__hint {
  position: absolute;
  bottom: calc(28px + var(--safe-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-family: var(--press-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--press-ink);
  opacity: 0.4;
}
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
