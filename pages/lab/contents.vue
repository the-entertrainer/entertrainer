<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'The Contents — Lab', robots: 'noindex' })
const active = ref(0)
</script>

<template>
  <LabFrame n="01" name="The Contents" hint="hover a line">
    <div class="ct">
      <div class="ct__intro">
        <p class="ct__eyebrow">Naveen Jose — Instructional Designer</p>
        <h1 class="ct__h">Contents</h1>
      </div>

      <ol class="ct__list" @mouseleave="active = 0">
        <li v-for="(item, i) in LAB_NAV" :key="item.href">
          <NuxtLink :to="item.href" class="ct__row" :class="{ dim: active !== i }" @mouseenter="active = i" @focus="active = i">
            <span class="ct__n">{{ item.n }}</span>
            <span class="ct__label">{{ item.label }}</span>
            <span class="ct__desc">{{ item.desc }}</span>
            <span class="ct__go" aria-hidden="true">→</span>
          </NuxtLink>
        </li>
      </ol>

      <div class="ct__peek" aria-hidden="true">
        <Transition name="peek" mode="out-in">
          <img :key="active" :src="LAB_NAV[active].img" :alt="''" />
        </Transition>
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.ct { position: absolute; inset: 0; display: grid; grid-template-columns: 1.05fr 0.95fr; align-items: center; padding: 0 clamp(24rem, 6vw, 96rem); }
.ct__intro { position: absolute; top: clamp(90rem, 14vh, 150rem); left: clamp(24rem, 6vw, 96rem); }
.ct__eyebrow { font-size: 12rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; opacity: 0.55; }
.ct__h { font-family: var(--serif); font-weight: 400; font-size: clamp(30rem, 4vw, 46rem); margin: 6rem 0 0; opacity: 0.85; }
.ct__list { list-style: none; margin: 0; padding: 0; z-index: 2; }
.ct__row { display: grid; grid-template-columns: auto 1fr auto; align-items: baseline; gap: 8rem 18rem; padding: clamp(14rem, 2.2vh, 22rem) 0; text-decoration: none; color: var(--color-text); border-bottom: 1px solid var(--color-glass-border); transition: opacity 0.3s ease, transform 0.35s var(--ease-spring); }
.ct__row.dim { opacity: 0.38; }
@media (hover: hover) { .ct__row:hover { transform: translateX(10rem); } }
.ct__row:focus-visible { outline: 2px solid var(--color-text); outline-offset: 4px; }
.ct__n { font-family: var(--serif); font-size: 15rem; opacity: 0.5; font-variant-numeric: tabular-nums; }
.ct__label { font-family: var(--serif); font-weight: 400; font-size: clamp(34rem, 5.5vw, 72rem); line-height: 1; letter-spacing: -0.02em; }
.ct__desc { grid-column: 2; font-size: 13.5rem; opacity: 0.6; max-width: 40ch; }
.ct__go { font-size: 22rem; opacity: 0.4; align-self: center; }
.ct__peek { position: relative; height: 62vh; border-radius: 16rem; overflow: hidden; box-shadow: 0 40rem 90rem -50rem rgba(0,0,0,0.6), 0 0 0 1px var(--color-glass-border); }
.ct__peek img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.peek-enter-active, .peek-leave-active { transition: opacity 0.4s ease, transform 0.6s cubic-bezier(.19,1,.22,1); }
.peek-enter-from { opacity: 0; transform: scale(1.06); }
.peek-leave-to { opacity: 0; }
@media (max-width: 820px) {
  .ct { grid-template-columns: 1fr; align-content: center; }
  .ct__peek { display: none; }
  .ct__intro { position: static; margin-bottom: 20rem; padding-top: 40rem; }
  .ct { padding-top: calc(80rem + var(--safe-top)); align-items: start; }
  .ct__label { font-size: clamp(30rem, 10vw, 52rem); }
}
</style>
