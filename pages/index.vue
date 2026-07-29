<script setup lang="ts">
/**
 * The home page — a broadsheet front page. Every other non-tool page on the
 * site now speaks this language (PressMast, PressFoot, PressHalftone, the
 * paper/ink palette in main.css's `--press-*` layer); this is where it was
 * proven out, section by section:
 *
 *   Masthead → Lead story (identity) → Section fronts → Thesis → Contact → Foot
 *
 * Nothing here is invented: every fact, credential and project description
 * already existed on the site (the About chapters, content/navigation.json,
 * the tools' own copy) — this page just gives it one coherent front page to
 * live on, instead of the borrowed-and-bolted-together design it replaces.
 */
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'Naveen Jose is a Certified Instructional Design Specialist who builds training people actually finish — plus four free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Instructional design, but fun. Training people actually finish, and the free tools that make it.',
  ogUrl: 'https://entertrainer.in/'
})
</script>

<template>
  <div class="press-page">
    <PressMast section="Front Page" />
    <PressHomeHero />
    <PressHomeSections />
    <PressHomeManifesto />
    <PressHomeContact />
    <PressFoot />
  </div>
</template>
