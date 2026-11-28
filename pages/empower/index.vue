<script setup lang="ts">
import { APPS } from '~/content/family'

useSeoMeta({
  title: 'Empower · Entertrainer',
  description: 'Free apps for people who train people: write measurable objectives, make instructions plain, plan a session minute by minute.',
  ogTitle: 'Empower · Entertrainer apps',
  ogDescription: 'Aim, Plain and Cue. Free, in the browser, no sign-up.'
})
</script>

<template>
  <div class="hubpage hubpage--empower">
    <div class="hp">
      <EdHubHero title="Empower" no="02" kicker="Apps for people who train people" deck="Three small, sharp tools from the Entertrainer workshop. Free, no sign-up, and your work stays in your browser.">
        <template #art>
          <div class="hp__marks">
            <BrandMark v-for="(a, i) in APPS" :key="a.id" :id="a.id" :size="160" :class="`hp__m hp__m--${i}`" />
          </div>
        </template>
      </EdHubHero>
      <BrandFamilyIndex :members="APPS" tone="ink" class="hp__list" />
      <p class="hp__note br-meta">More apps are on the bench. They land here when they are ready.</p>
    </div>
  </div>
</template>

<style scoped>
.hp { padding: var(--space-34) var(--hub-gutter) 0; max-width: 1600px; margin: 0 auto; }
.hp__marks { position: relative; width: min(36vw, 420px); aspect-ratio: 1; }
.hp__m { position: absolute; width: 46%; height: auto; animation: hp-float 9s ease-in-out infinite; }
.hp__m--0 { left: 0; top: 8%; }
.hp__m--1 { right: 0; top: 0; animation-delay: -3s; }
.hp__m--2 { left: 26%; bottom: 0; animation-delay: -6s; }
@keyframes hp-float { 50% { transform: translateY(-14px) rotate(6deg); } }
@media (prefers-reduced-motion: reduce) { .hp__m { animation: none; } }
:global(html[data-reduce-motion="on"]) .hp__m { animation: none; }
.hp__list { margin-top: clamp(40px, 6vw, 96px); }
.hp__note { margin: 28px 0 80px; color: var(--gray-500); }
@media (max-width: 760px) { .hp__marks { width: 220px; } }
</style>
