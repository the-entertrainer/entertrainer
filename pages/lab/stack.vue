<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'The Stack — Lab', robots: 'noindex' })
</script>

<template>
  <LabFrame n="07" name="The Stack" hint="scroll to peel">
    <div class="st">
      <section class="st__hero">
        <span class="st__eyebrow">Naveen Jose — Instructional Designer</span>
        <h1 class="st__htitle">Scroll through<br>the rooms</h1>
        <span class="st__cue">↓</span>
      </section>
      <NuxtLink v-for="(item, i) in LAB_NAV" :key="item.href" :to="item.href" class="st__card" :style="{ top: `calc(8vh + ${i * 1.4}rem)`, zIndex: i + 1 }">
        <div class="st__img"><img :src="item.img" :alt="''" /></div>
        <div class="st__meta">
          <span class="st__n">{{ item.n }}</span>
          <h2 class="st__label">{{ item.label }}</h2>
          <p class="st__desc">{{ item.desc }}</p>
          <span class="st__go">Open →</span>
        </div>
      </NuxtLink>
      <div class="st__tail" aria-hidden="true" />
    </div>
  </LabFrame>
</template>

<style scoped>
.st { position: absolute; inset: 0; overflow-y: auto; scroll-behavior: smooth; }
.st__hero { height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 0 clamp(24rem, 6vw, 90rem); }
.st__eyebrow { font-size: 12rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; opacity: 0.5; }
.st__htitle { font-family: var(--serif); font-weight: 400; font-size: clamp(48rem, 10vw, 128rem); line-height: 0.95; letter-spacing: -0.02em; margin: 16rem 0 0; }
.st__cue { margin-top: 30rem; font-size: 22rem; opacity: 0.5; }
.st__card { position: sticky; display: grid; grid-template-columns: 1fr 1fr; gap: clamp(20rem, 4vw, 60rem); align-items: center; width: min(1000rem, 92%); margin: 0 auto 8vh; height: 78vh; padding: clamp(20rem, 3vw, 44rem); border-radius: 22rem; background: var(--color-bg); border: 1px solid var(--color-glass-border); box-shadow: 0 -8rem 60rem -30rem rgba(0,0,0,0.4), 0 40rem 80rem -50rem rgba(0,0,0,0.6); text-decoration: none; color: var(--color-text); overflow: hidden; }
.st__img { height: 100%; border-radius: 14rem; overflow: hidden; }
.st__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.st__n { font-family: var(--serif); font-size: 16rem; opacity: 0.5; }
.st__label { font-family: var(--serif); font-weight: 400; font-size: clamp(36rem, 5vw, 66rem); line-height: 1; margin: 6rem 0 0; }
.st__desc { margin: 16rem 0 0; font-size: 15rem; line-height: 1.55; opacity: 0.7; max-width: 34ch; }
.st__go { display: inline-block; margin-top: 24rem; font-family: var(--serif); font-style: italic; font-size: 18rem; opacity: 0.8; }
.st__tail { height: 20vh; }
@media (max-width: 720px) {
  .st__card { grid-template-columns: 1fr; height: auto; min-height: 74vh; }
  .st__img { height: 40vh; }
}
</style>
