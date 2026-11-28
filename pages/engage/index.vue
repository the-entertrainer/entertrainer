<script setup lang="ts">
import { GAMES } from '~/content/family'

useSeoMeta({
  title: 'Engage · Entertrainer',
  description: 'Small games about how we learn: climb Bloom’s ladder, match learning-science pairs, put shuffled steps back in order.',
  ogTitle: 'Engage · Entertrainer games',
  ogDescription: 'Ladder, Pairs and Steps. Quick games, no sign-up.'
})
</script>

<template>
  <div class="hubpage hubpage--engage">
    <div class="hp">
      <EdHubHero title="Engage" no="03" kicker="Games about how we learn" deck="Three quick games where the rules are learning science in disguise. A minute or two each. You will learn something by accident.">
        <template #art>
          <div class="hp__marks">
            <BrandMark v-for="(a, i) in GAMES" :key="a.id" :id="a.id" :size="160" tone="ink" :class="`hp__m hp__m--${i}`" />
          </div>
        </template>
      </EdHubHero>
      <BrandFamilyIndex :members="GAMES" tone="sun" class="hp__list" />
      <p class="hp__note br-meta">New games arrive when they are fun enough to ship.</p>
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
html[data-reduce-motion="on"] .hp__m { animation: none; }
.hp__list { margin-top: clamp(40px, 6vw, 96px); }
.hp__note { margin: 28px 0 80px; color: var(--gray-500); }
@media (max-width: 760px) { .hp__marks { width: 220px; } }
</style>
