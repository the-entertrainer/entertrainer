<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Pop Comic — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bangers&family=Archivo:wght@600;800&display=swap' }] })
const bursts = ['POW!', 'ZAP!', 'BAM!', 'WOW!']
</script>

<template>
  <div class="cm">
    <NuxtLink to="/lab" class="cm__lab">◂ lab</NuxtLink>
    <header class="cm__hero">
      <span class="cm__kicker">Meanwhile, in instructional design…</span>
      <h1 class="cm__title">NAVEEN <em>JOSE</em></h1>
      <div class="cm__bubble">“I turn boring training into stuff people actually finish!”</div>
      <span v-for="(b, i) in bursts" :key="b" class="cm__burst" :class="`cm__burst--${i}`">{{ b }}</span>
    </header>
    <nav class="cm__panels">
      <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="cm__panel" :style="{ '--rot': (i % 2 ? 1.4 : -1.4) + 'deg' }">
        <span class="cm__num">#{{ it.n }}</span>
        <span class="cm__label">{{ it.label }}</span>
        <span class="cm__desc">{{ it.desc }}</span>
        <span class="cm__go">READ ›</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.cm { position: fixed; inset: 0; overflow-y: auto; background: #ffd23f; background-image: radial-gradient(#00000022 1.5rem, transparent 1.6rem); background-size: 16rem 16rem; color: #111; font-family: 'Archivo', sans-serif; padding: clamp(20rem, 4vw, 48rem); }
.cm__lab { position: fixed; top: 14rem; right: 18rem; z-index: 20; color: #111; font-weight: 800; text-decoration: none; font-size: 13rem; background: #fff; border: 3rem solid #111; border-radius: 8rem; padding: 4rem 10rem; box-shadow: 4rem 4rem 0 #111; }
.cm__hero { position: relative; max-width: 1100rem; margin: 0 auto 40rem; background: #fff; border: 5rem solid #111; border-radius: 18rem; padding: clamp(28rem, 5vw, 60rem); box-shadow: 12rem 12rem 0 #e63946; text-align: center; }
.cm__kicker { display: inline-block; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; font-size: 13rem; background: #4361ee; color: #fff; padding: 5rem 12rem; border: 3rem solid #111; border-radius: 6rem; }
.cm__title { font-family: 'Bangers', cursive; font-weight: 400; font-size: clamp(56rem, 13vw, 168rem); line-height: 0.9; letter-spacing: 0.02em; margin: 18rem 0 20rem; -webkit-text-stroke: 3rem #111; color: #ffd23f; text-shadow: 8rem 8rem 0 #e63946; }
.cm__title em { font-style: normal; color: #4361ee; }
.cm__bubble { position: relative; display: inline-block; max-width: 40ch; font-weight: 700; font-size: clamp(15rem, 2vw, 20rem); background: #fff; border: 4rem solid #111; border-radius: 28rem; padding: 16rem 24rem; box-shadow: 5rem 5rem 0 #111; }
.cm__bubble::after { content: ''; position: absolute; left: 40rem; bottom: -22rem; border: 12rem solid transparent; border-top-color: #111; }
.cm__burst { position: absolute; font-family: 'Bangers', cursive; font-size: clamp(22rem, 4vw, 48rem); color: #fff; -webkit-text-stroke: 2.5rem #111; text-shadow: 4rem 4rem 0 #e63946; rotate: -12deg; }
.cm__burst--0 { top: -22rem; left: -10rem; color: #ff5d8f; }
.cm__burst--1 { top: 30rem; right: -14rem; color: #4cc9f0; rotate: 14deg; }
.cm__burst--2 { bottom: -20rem; right: 40rem; color: #ffd23f; }
.cm__burst--3 { bottom: 24rem; left: -20rem; color: #4361ee; rotate: 10deg; }
.cm__panels { max-width: 1100rem; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220rem, 1fr)); gap: 22rem; }
.cm__panel { rotate: var(--rot); display: flex; flex-direction: column; gap: 6rem; background: #fff; border: 4rem solid #111; border-radius: 14rem; padding: 20rem; text-decoration: none; color: #111; box-shadow: 7rem 7rem 0 #111; transition: transform 0.16s, box-shadow 0.16s, rotate 0.16s; }
.cm__panel:hover { rotate: 0deg; transform: translate(-3rem, -3rem); box-shadow: 12rem 12rem 0 #4361ee; }
.cm__panel:focus-visible { outline: 3rem solid #4361ee; outline-offset: 3rem; }
.cm__num { font-family: 'Bangers', cursive; font-size: 30rem; color: #e63946; }
.cm__label { font-weight: 800; font-size: 22rem; text-transform: uppercase; }
.cm__desc { font-size: 13rem; font-weight: 600; opacity: 0.75; flex: 1; }
.cm__go { align-self: flex-start; margin-top: 8rem; font-weight: 800; font-size: 13rem; background: #ffd23f; border: 3rem solid #111; border-radius: 6rem; padding: 4rem 10rem; }
</style>
