<script setup lang="ts">
/**
 * The home page, rebuilt against the structural analysis in
 * /Inspiration/wodniack-scrape-2026.md.
 *
 * The spine is the reference's, with exactly one section inserted:
 *
 *   Head → Hero → About → [Work] → Web apps → My way → Contact → Footer
 *                          ^ accent flood, pinned stage
 *
 * "Web apps" is the insertion, and it is the one place this site should refuse
 * to follow the reference. A creative-dev portfolio has client work and nothing
 * else to sell; this one ships four working products, and filing them inside a
 * "Work" list would bury the thing that actually differentiates it.
 *
 * The binary strips between sections are load-bearing in a way that looks
 * decorative: with this much whitespace, the eye needs something machined to
 * land on between blocks, or the page reads as unfinished rather than
 * confident. Each gets its own seed so no two strips are twins.
 *
 * The WebGL card stack that used to live here (HomeTower + HomeGallery) is
 * untouched in components/home/ — it is simply no longer what `/` renders.
 */
import { useHomeViewStore } from '~/stores/homeview'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'Naveen Jose is a Certified Instructional Design Specialist who builds training people actually finish — plus four free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Instructional design, but fun. Training people actually finish, and the free tools that make it.',
  ogUrl: 'https://entertrainer.in/'
})

// The tower is gone from this route, but the menu still emits its back/home
// signals globally — acknowledge them so the store never latches.
const homeViewStore = useHomeViewStore()
homeViewStore.setIsHome(true)
watch(() => homeViewStore.pendingBack, (p) => { if (p) homeViewStore.ackBack() })
watch(() => homeViewStore.pendingHome, (p) => { if (p) homeViewStore.ackHome() })
</script>

<template>
  <div class="w">
    <HomeSiteHead />
    <HomeHero />

    <HomeRule :seed="7" />
    <HomeAbout />

    <HomeRule :seed="23" />
    <HomeWork />

    <HomeRule :seed="41" />
    <HomeApps />

    <HomeRule :seed="59" />
    <HomeMyWay />

    <HomeCta />
    <HomeFoot />
  </div>
</template>

<style scoped>
/* The editorial layer's paper, applied once at the root of the page. Every
   section below inherits it and nothing sets its own background except Work,
   which floods. */
.w {
  position: relative;
  min-height: 100dvh;
  background: var(--w-paper);
  color: var(--w-ink);
  /* The reference sets its base leading and tracking globally; scoped here so
     it cannot leak into the tools, which have their own type. */
  letter-spacing: -0.025em;
  overflow-x: clip;
}
</style>
