<script setup lang="ts">
import { CENTRE_UNIVERSE_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${CENTRE_UNIVERSE_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: CENTRE_UNIVERSE_BLOG.socialHook,
  ogTitle: CENTRE_UNIVERSE_BLOG.socialTitle,
  ogDescription: CENTRE_UNIVERSE_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${CENTRE_UNIVERSE_BLOG.slug}`,
  ogImage: `https://entertrainer.in${CENTRE_UNIVERSE_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: CENTRE_UNIVERSE_BLOG.socialTitle,
  twitterDescription: CENTRE_UNIVERSE_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${CENTRE_UNIVERSE_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Cosmological Principle', source: 'NASA / WMAP science overview', href: 'https://map.gsfc.nasa.gov/universe/bb_concepts.html' },
  { id: 2, title: 'What is the Universe Expanding Into?', source: 'NASA Space Place', href: 'https://spaceplace.nasa.gov/expansion/en/' },
  { id: 3, title: 'Hubble’s Law of Cosmic Expansion', source: 'ESA / Hubble', href: 'https://esahubble.org/wordbank/hubbles-law/' },
  { id: 4, title: 'A Relation between Distance and Radial Velocity among Extra-Galactic Nebulae', source: 'Hubble, PNAS 1929', href: 'https://www.pnas.org/doi/10.1073/pnas.15.3.168' }
]
</script>

<template>
  <div class="centre">
    <header class="centre__head">
      <NuxtLink to="/elevate" class="centre__back">The Entertrainer Blogs</NuxtLink>
      <p class="centre__meta">{{ CENTRE_UNIVERSE_BLOG.category }} <span aria-hidden="true">·</span> {{ CENTRE_UNIVERSE_BLOG.minutes }} min read</p>
      <h1>{{ CENTRE_UNIVERSE_BLOG.title }}</h1>
      <p class="centre__dek">{{ CENTRE_UNIVERSE_BLOG.dek }}</p>
    </header>

    <figure class="centre__hero">
      <EdEditorialImage :src="CENTRE_UNIVERSE_BLOG.hero" :alt="CENTRE_UNIVERSE_BLOG.heroAlt" />
    </figure>

    <article class="centre__article">
      <aside class="centre__margin-note" aria-label="Balloon aside">
        <p>Balloon note</p>
        <p>The middle of a balloon is in the air inside. The dots live on the rubber. Those are different places.</p>
      </aside>

      <div class="centre__prose">
        <p class="centre__lead">Someone on the terrace after dinner is pointing at the dark. Not at a star. At the idea of the whole thing.</p>
        <p>“If it started with a bang,” they say, “where is the bang now?”</p>
        <p>It is a reasonable question. It is also the wrong picture. A firework happens in a room. It has a middle. Smoke travels out from that middle. You could, in principle, walk back to the match.</p>
        <p>The universe is not a firework in a room.</p>

        <h2>Start with a balloon, then notice where the analogy leaks</h2>
        <p>Draw dots on the surface of a balloon. Blow it up. Every dot sees the others move away as the surface stretches.</p>
        <p>There is no special dot. No dot can point across the surface and say, “That is where the expansion began.” The surface has no centre on it. The centre is in the space inside the balloon, which the dots do not occupy.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>That last sentence is the honest part. The balloon is a two-dimensional skin living in a room. Our space is not a skin on something else we can step into. The picture is useful, then it lies. Keep the useful bit: expansion is a change in distances, not a crowd walking away from a chosen square.</p>

        <h2>Now watch the sky do the same thing</h2>
        <p>Imagine two photographs of the same patch of sky. In the second photograph, the gaps between the galaxies are larger. Nobody has walked away. Space has stretched between them.</p>
        <p>Press <strong>Stretch</strong>. Then hold one galaxy still. This is the part that matters: once you hold any galaxy still, every other galaxy appears to move away from it.</p>

        <ClientOnly>
          <EdExpansionCentreLab />
          <template #fallback>
            <p class="centre__lab-fallback">Loading the galaxy demonstration…</p>
          </template>
        </ClientOnly>

        <p>Now choose a different galaxy and hold that one still. The result does not break. The new observer also sees the rest receding in every direction.</p>
        <blockquote>
          <p>Everyone gets the same view from home.</p>
        </blockquote>

        <h2>So are you really the centre?</h2>
        <p><strong>Physically, no.</strong> Hubble’s 1929 result was not “everything is fleeing from us.” It was a relation: more distant nebulae recede faster. Once you grant that the same relation holds for any observer, the privileged middle disappears.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>The cosmological principle is the boring, stubborn claim underneath. On large scales, no place is special. No direction is special. From every galaxy, distant galaxies appear to move away in every direction.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p><strong>From your point of view, yes.</strong> Your address is the centre of the view you can make from your address. The same is true for your friend, a galaxy ten billion light-years away, and every other observer who can look out. That is not a compliment. It is a symmetry.</p>

        <h2>Where I have to be honest</h2>
        <p>The terrace question still feels unanswered, because the firework picture smuggled a room into the sentence. If the bang happened <em>in</em> space, there would be a place. If space itself is what stretched, the “where” does not sit on the map.</p>
        <p>We also do not have a photograph of the whole manifold from outside. The lab on this page is a reconstruction. So is every popular balloon. They are honest about the symmetry. They are not a view from the gods.</p>

        <h2>The useful part</h2>
        <p>When someone tells you that you are small, this will not refute them. You are small. So is Earth. So is the Sun compared with the universe.</p>
        <p>But small is not the same as sitting at the edge of someone else’s explosion. From where you stand, the whole sky opens outward. And it does the same for everyone else.</p>
        <p class="centre__closing">The bang is not somewhere else. There is no somewhere else of that kind.</p>
      </div>
    </article>

    <section class="centre__sources" aria-labelledby="sources-title">
      <p class="centre__meta">Sources</p>
      <h2 id="sources-title">The science behind the picture</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="centre__newsletter-wrap"><EdNewsletter /></div>
  </div>
</template>

<style scoped>
.centre { padding-bottom: 112rem; }
.centre__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(36rem, 6vw, 76rem); }
.centre__back, .centre__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.centre__back { color: var(--ink); }
.centre__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.centre h1, .centre h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.centre h1 { max-width: 1080rem; margin: 0; font-size: clamp(48rem, 8vw, 122rem); line-height: .91; text-wrap: balance; }
.centre__dek { max-width: 720rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.centre__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.centre__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.centre figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.centre__article { max-width: 1100rem; margin: clamp(44rem, 8vw, 112rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.centre__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.centre__margin-note p { margin: 0; }
.centre__margin-note p + p { margin-top: 10rem; }
.centre__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.centre__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.centre__prose p { margin: 0 0 24rem; }
.centre__prose .centre__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.centre__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.centre__prose h2 { margin: 68rem 0 20rem; font-size: clamp(34rem, 4vw, 53rem); line-height: .98; }
.centre blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(25rem, 3vw, 37rem)/1.06 var(--font-display); letter-spacing: -.035em; }
.centre blockquote p { margin: 0; }
.centre__lab-fallback { margin: 36rem 0; padding: 24rem; border: var(--stroke) dashed var(--line); border-radius: var(--radius-m); color: var(--ink-soft); font: 400 14rem/1.4 var(--font-mono); }
.centre__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(26rem, 3vw, 40rem)/1.08 var(--font-display); letter-spacing: -.04em; }
.centre__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.centre__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.centre__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.centre__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.centre__sources a { color: inherit; }
.centre__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.centre__sources em { color: var(--ink-soft); }
.centre__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .centre__hero { padding: 0; }
  .centre__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .centre__article { display: block; }
  .centre__margin-note { position: static; margin-bottom: 36rem; }
  .centre__prose h2 { margin-top: 52rem; }
}
</style>
