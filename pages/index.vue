<script setup lang="ts">
/**
 * The home page, built to match the section spine, palette, type scale and
 * motion vocabulary recorded in /Inspiration/wodniack-scrape-2026.md.
 *
 *   Head → Hero → About(+Credentials+Gallery) → Work → My Way → Contact → Footer
 *
 * That is the original's order exactly, including the single flooded, pinned
 * Work section that everything else is quiet around. The one structural
 * departure is the footer, which carries an index: that site is one page with
 * three anchors, this one is the front door to a Lab, a Downloads library and
 * two long-form pages that still have to be reachable.
 *
 * What is *not* borrowed is the content — the awards record, the bio, the 34
 * project films and the three commercial typefaces are Antoine Wodniack's.
 * Every slot here is filled from this repo: the About chapters, the content
 * store, and navigation.json.
 *
 * The page commits to the paper palette rather than following the site's
 * light/dark toggle, because the original has no such toggle — it has a
 * contrast control, which lives in the header and is wired to `data-contrast`.
 *
 * The WebGL card stack that used to live here (HomeTower, HomeGallery) is
 * untouched in components/home/; it is simply no longer what `/` renders.
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
    <HomeAbout />
    <HomeRule :seed="23" />
    <HomeWork />
    <HomeMyWay />
    <HomeCta />
    <HomeFoot />
  </div>
</template>

<style scoped>
/* The sheet. Every section inherits it; only Work sets its own, and it floods.
   The base type setting is scoped here so it cannot leak into the tools, which
   have their own. */
.w {
  position: relative;
  min-height: 100dvh;
  background: var(--w-paper);
  color: var(--w-ink);
  font-family: var(--w-serif);
  font-size: 16px;
  line-height: 1.48;
  letter-spacing: -0.025em;
  overflow-x: clip;
}
</style>
