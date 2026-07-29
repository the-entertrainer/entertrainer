<script setup lang="ts">
/**
 * The home page — not a page styled like /lab/press, but the same Concept
 * mounted with the site's own content: the four real destinations
 * (content/navigation.json's "home" array) as the sheets on the press bed,
 * flicked and read exactly as they are in the lab. PressMast and PressFoot
 * carry the real, crawlable links above and below it — the stage itself is
 * the front page's lead story, not a hero graphic bolted on top of one.
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
  <div class="press-page">
    <div class="home-hero">
      <PressMast section="Front Page" />

      <div class="home-stage">
        <LabSpatialStage :concept="concept" :items="contentStore.homeNav" @select="onSelect">
          <p class="home-stage__hint">Flick up to turn &middot; click the top sheet to open</p>
        </LabSpatialStage>
      </div>
    </div>

    <PressFoot />
  </div>
</template>

<style scoped>
/* Mast + stage together claim exactly one viewport: the mast takes its own
   content height, and the stage — which has no in-flow content of its own,
   only the absolutely-positioned canvas — absorbs whatever's left. Pinning
   the stage to a flat 100dvh instead (regardless of the mast's height, which
   itself changes at the nav's responsive breakpoints) pushed the hero taller
   than one screen, so the card's own foot rule was cropped off by the
   viewport before you'd scrolled a pixel. */
.home-hero {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
.home-stage {
  position: relative;
  flex: 1 1 auto;
  min-height: 460px;
  overflow: hidden;
  background: #dedbd2;
}
.home-stage__hint {
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
  opacity: 0.45;
}
</style>
