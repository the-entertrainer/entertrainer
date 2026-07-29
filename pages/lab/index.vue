<script setup lang="ts">
import { LAB_CONCEPTS } from '~/utils/labConcepts'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Five spatial systems — Lab', robots: 'noindex' })
const R = useReveal()
</script>

<template>
  <div class="lab">
    <div class="lab__inner">
      <header class="lab__head">
        <p class="lab__eyebrow" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">Hidden · Lab</p>
        <h1 class="lab__title" v-motion :initial="R.rise(70).initial" :visible-once="R.rise(70).visibleOnce">
          Five ways to<br>stand in the work
        </h1>
        <p class="lab__deck" v-motion :initial="R.rise(150).initial" :visible-once="R.rise(150).visibleOnce">
          The spiral was right about one thing: a portfolio can be a place you move through
          rather than a page you scroll. What it never tested is that <em>the geometry is the
          argument</em> — a drum, a press bed, a whirlpool, a twisted band and a morphing
          lattice each say something different about the same four sections.
        </p>
        <p class="lab__deck lab__deck--sub" v-motion :initial="R.rise(210).initial" :visible-once="R.rise(210).visibleOnce">
          So each concept below fixes four things at once, and they have to agree:
          <b>geometry</b>, <b>motion</b>, <b>material</b>, and the <b>page</b> you land on when
          you pick a card. Open one and select a card to see its inner page — that's the part
          that decides the rest of the site. Tools stay as they are; a form should never be an
          art direction.
        </p>
      </header>

      <ol class="lab__grid">
        <li v-for="(c, i) in LAB_CONCEPTS" :key="c.slug" v-motion
            :initial="R.riseIn(i, 60).initial" :visible-once="R.riseIn(i, 60).visibleOnce">
          <NuxtLink :to="`/lab/${c.slug}`" class="card">
            <span class="card__n">{{ c.n }}</span>

            <span class="card__body">
              <strong class="card__name">{{ c.name }}</strong>
              <span class="card__thesis">{{ c.thesis }}</span>

              <span class="card__specs">
                <span class="spec"><i>Geometry</i>{{ c.geometry }}</span>
                <span class="spec"><i>Motion</i>{{ c.motion }}</span>
                <span class="spec"><i>Material</i>{{ c.material }}</span>
                <span class="spec spec--page"><i>Page</i>{{ c.page }}</span>
              </span>
            </span>

            <span class="card__go" aria-hidden="true">→</span>
          </NuxtLink>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.lab { position: fixed; inset: 0; overflow-y: auto; background: var(--color-bg); color: var(--color-text); --serif: var(--display-font); }
.lab__inner { max-width: 940rem; margin: 0 auto; padding: calc(80rem + var(--safe-top)) clamp(20rem, 5vw, 40rem) 100rem; }

.lab__eyebrow { font-family: var(--mono-font); font-weight: 500; font-size: 12rem; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.55; }
.lab__title { font-family: var(--serif); font-weight: 400; font-size: clamp(34rem, 6vw, 62rem); line-height: 1.02; letter-spacing: -0.02em; margin: 14rem 0 0; }
.lab__deck { margin: 22rem 0 0; max-width: 64ch; font-size: 15rem; line-height: 1.68; opacity: 0.72; }
.lab__deck em { font-style: italic; }
.lab__deck b { font-weight: 700; opacity: 0.92; }
.lab__deck--sub { margin-top: 16rem; font-size: 14rem; opacity: 0.6; }

.lab__grid { list-style: none; margin: 46rem 0 0; padding: 0; display: grid; gap: 12rem; }

.card {
  display: grid; grid-template-columns: 44rem 1fr 24rem; align-items: start; gap: 18rem;
  padding: 24rem 24rem 26rem;
  border: 1px solid var(--color-glass-border); border-radius: 16rem;
  background: var(--color-glass-bg); color: var(--color-text); text-decoration: none;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}
@media (hover: hover) {
  .card:hover { transform: translateY(-3rem); border-color: var(--color-glass-border-hover); background: var(--color-glass-bg-hover); }
  .card:hover .card__go { transform: translateX(4rem); }
}
.card:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }

.card__n { font-family: var(--serif); font-size: 26rem; opacity: 0.35; font-variant-numeric: tabular-nums; padding-top: 1rem; }
.card__body { display: grid; gap: 8rem; min-width: 0; }
.card__name { font-size: 21rem; font-weight: 700; letter-spacing: -0.015em; }
.card__thesis { font-family: var(--serif); font-size: 16rem; line-height: 1.4; opacity: 0.85; }

.card__specs { display: grid; gap: 6rem; margin-top: 8rem; }
.spec {
  display: grid; grid-template-columns: 78rem 1fr; gap: 12rem;
  font-size: 12.5rem; line-height: 1.55; opacity: 0.62;
}
.spec i {
  font-style: normal; font-family: var(--mono-font); font-size: 10rem;
  letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.7; padding-top: 3rem;
}
/* The page row is the load-bearing one — it's what the whole site inherits. */
.spec--page { opacity: 0.9; }
.spec--page i { color: var(--color-accent, currentColor); opacity: 1; }

.card__go { font-size: 18rem; opacity: 0.35; transition: transform 0.22s ease; padding-top: 6rem; }

@media (max-width: 560px) {
  .card { grid-template-columns: 34rem 1fr; }
  .card__go { display: none; }
  .spec { grid-template-columns: 1fr; gap: 1rem; }
  .spec i { padding-top: 0; }
}
@media (prefers-reduced-motion: reduce) { .card, .card__go { transition: none; } }
</style>
