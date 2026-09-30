<script setup lang="ts">
import { SCHWARZ_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${SCHWARZ_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: SCHWARZ_BLOG.socialHook,
  ogTitle: SCHWARZ_BLOG.socialTitle,
  ogDescription: SCHWARZ_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${SCHWARZ_BLOG.slug}`,
  ogImage: `https://entertrainer.in${SCHWARZ_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: SCHWARZ_BLOG.socialTitle,
  twitterDescription: SCHWARZ_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${SCHWARZ_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Schwarz minimal surface', source: 'Wikipedia', href: 'https://en.wikipedia.org/wiki/Schwarz_minimal_surface' },
  { id: 2, title: 'Schwarz’s Minimal Surface', source: 'Wolfram MathWorld', href: 'https://mathworld.wolfram.com/SchwarzsMinimalSurface.html' },
  { id: 3, title: 'Minimal surface', source: 'Wikipedia', href: 'https://en.wikipedia.org/wiki/Minimal_surface' },
  { id: 4, title: 'Infinite Periodic Minimal Surfaces Without Self-Intersections', source: 'Alan H. Schoen, NASA TN D-5541, 1970', href: 'https://ntrs.nasa.gov/citations/19700020472' },
  { id: 5, title: 'Can you reverse the spin of this Schwarz surface?', source: 'matharium, YouTube Short', href: 'https://www.youtube.com/shorts/gPqgCie0qpg' }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ SCHWARZ_BLOG.category }} <span aria-hidden="true">·</span> {{ SCHWARZ_BLOG.minutes }} min read</p>
      <h1>{{ SCHWARZ_BLOG.title }}</h1>
      <p class="taj__dek">{{ SCHWARZ_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="SCHWARZ_BLOG.hero" :alt="SCHWARZ_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>Not Schwartz.</p>
        <p>Hermann Schwarz. One z. The surface is older than the short that made it spin.</p>
      </aside>

      <div class="taj__prose">
        <p class="taj__lead">A clip asks if you can reverse the spin. The lattice does not care which way you look.</p>
        <p>The object is a Schwarz P surface. P for primitive. A soap film that does not stop at the rim of a wire. It keeps going, through the next cube, until the room is a corridor of tunnels.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>People write Schwartz because English likes tz. The man was Hermann Amandus Schwarz, in Berlin in the 1860s and 1870s. He was asking what smallest skin a given edge can wear.</p>

        <h2>The cheapest skin</h2>
        <p>Dip a twisted wire in soapy water. The film that forms is lazy in a precise way. At every point the surface bends up as much as it bends down. Mean curvature zero. That is the whole local law.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Schwarz noticed two extra permissions. If the edge is a straight line, you may reflect the film across that line and still have a minimal surface. If the film meets a plane at a right angle, you may mirror it in the plane and join the copy.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Do that inside a cube, again and again, and the patch stops being a patch. It becomes architecture. Two labyrinths, never touching, sharing a wall that has no thickness you can brag about.</p>

        <ClientOnly>
          <EdSchwarzSurfaceLab />
        </ClientOnly>

        <p>That widget is the same implicit sentence the video is dancing around:</p>
        <blockquote>
          <p>cos x + cos y + cos z = 0</p>
        </blockquote>
        <p>Three cosines. Set their sum to zero. The points that obey it are the wall. Colour them and turn the room. You have not added physics. You have only walked around a level set.</p>
        <p>Drag the picture. The spin follows your hand, including backwards. Reversing it is a camera trick. The surface did not change its mind. The wall is still the points where three cosines add to zero.</p>

        <h2>Why it looks alive</h2>
        <p>The short works because the eye wants a solid. A lattice with holes is a building. A building that also looks like a molecule is a magic trick. Alan Schoen, writing for NASA in 1970, gave these repeating films their modern names — P, D, gyroid — and pointed out that nature had been using the same habit in crystals and copolymers long before anyone rendered them in neon.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Architects borrow them because a wall that is also a corridor saves material. Biologists borrow them because a cell that wants maximum contact with a fluid will grow a Schwarz-shaped membrane if you leave it alone long enough. The video borrows them because rainbow plus rotation is hard to scroll past.</p>
        <p>None of that makes the equation harder. The equation stays three cosines and a zero.</p>

        <h2>The honest small print</h2>
        <p>The live model on this page is a cloud of points near the level set, not a laboratory soap film. A true P surface is smooth, periodic, and genus three in each unit cell. The cloud is a sketch that keeps the tunnels and throws away the polish. That is enough to see why the short feels like an object and not a graph.</p>
        <p>Also: spin is not a property of the surface. The surface has no preferred clock. You can orbit left. You can orbit right. The wall is still the set of points where three waves cancel.</p>

        <figure class="taj__visual">
          <div class="taj__yt">
            <iframe
              src="https://www.youtube.com/embed/gPqgCie0qpg"
              title="Can you reverse the spin of this Schwarz surface?"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <figcaption>
            The short that started the question.
            <a href="https://www.youtube.com/shorts/gPqgCie0qpg" target="_blank" rel="noreferrer">Watch on YouTube</a>
          </figcaption>
        </figure>

        <p class="taj__closing">If a wall can be a corridor in every direction at once, what exactly were you calling solid?</p>
        <p>Soap already knew. Schwarz wrote it down. The clip just turned on the lights and asked if you wanted it the other way around.</p>
      </div>
    </article>

    <section class="taj__sources" aria-labelledby="sources-title">
      <p class="taj__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>
    <div class="taj__newsletter-wrap"><EdNewsletter /></div>
  </div>
</template>

<style scoped>
.taj { padding-bottom: 112rem; }
.taj__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(28rem, 5vw, 56rem); }
.taj__back, .taj__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.taj__back { color: var(--ink); }
.taj__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.taj h1, .taj h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.taj h1 { max-width: 1080rem; margin: 0; font-size: clamp(40rem, 6.6vw, 100rem); line-height: .95; text-wrap: balance; }
.taj__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.taj__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.taj__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj figure figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.taj__article { max-width: 1100rem; margin: clamp(36rem, 6vw, 76rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.taj__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.taj__margin-note p { margin: 0; }
.taj__margin-note p + p { margin-top: 10rem; }
.taj__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.taj__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.taj__prose p { margin: 0 0 24rem; }
.taj__prose .taj__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.taj__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.taj__prose h2 { margin: 64rem 0 20rem; font-size: clamp(30rem, 3.6vw, 46rem); line-height: .98; }
.taj blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(22rem, 2.6vw, 32rem)/1.12 var(--font-display); letter-spacing: -.03em; }
.taj blockquote p { margin: 0; }
.taj__visual { margin: 50rem 0 45rem; }
.taj__yt { position: relative; width: 100%; aspect-ratio: 16 / 9; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: #0b0b0c; }
.taj__yt iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.taj__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.14 var(--font-display); letter-spacing: -.035em; }
.taj__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.taj__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.taj__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.taj__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.taj__sources a { color: inherit; }
@media (max-width: 820px) {
  .taj__article { grid-template-columns: 1fr; }
  .taj__margin-note { position: static; }
}
</style>
