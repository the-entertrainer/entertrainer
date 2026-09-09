<script setup lang="ts">
import { CENTRE_UNIVERSE_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${CENTRE_UNIVERSE_BLOG.title} · The Entertrainer Blogs`,
  description: CENTRE_UNIVERSE_BLOG.dek,
  ogTitle: CENTRE_UNIVERSE_BLOG.title,
  ogDescription: CENTRE_UNIVERSE_BLOG.dek,
  ogUrl: `https://entertrainer.in/elevate/${CENTRE_UNIVERSE_BLOG.slug}`,
  ogImage: `https://entertrainer.in${CENTRE_UNIVERSE_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: CENTRE_UNIVERSE_BLOG.title,
  twitterDescription: CENTRE_UNIVERSE_BLOG.dek,
  twitterImage: `https://entertrainer.in${CENTRE_UNIVERSE_BLOG.hero}`
})

const references = [
  {
    id: 1,
    title: 'Cosmological Principle',
    source: 'NASA / WMAP science overview',
    href: 'https://map.gsfc.nasa.gov/universe/bb_concepts.html'
  },
  {
    id: 2,
    title: 'What is the Universe Expanding Into?',
    source: 'NASA Space Place',
    href: 'https://spaceplace.nasa.gov/expansion/en/'
  },
  {
    id: 3,
    title: 'Hubble’s Law of Cosmic Expansion',
    source: 'ESA / Hubble',
    href: 'https://esahubble.org/wordbank/hubbles-law/'
  },
  {
    id: 4,
    title: 'Friedmann–Lemaître–Robertson–Walker metric',
    source: 'Scholarpedia',
    href: 'https://www.scholarpedia.org/article/Friedmann-Lemaitre-Robertson-Walker_metric'
  },
  {
    id: 5,
    title: 'Cosmic Microwave Background',
    source: 'ESA Planck mission',
    href: 'https://www.esa.int/Science_Exploration/Space_Science/Planck/Cosmic_Microwave_Background_CMB_radiation'
  },
  {
    id: 6,
    title: 'Is the Universe homogeneous and isotropic?',
    source: 'American Museum of Natural History — Cosmic Horizons',
    href: 'https://www.amnh.org/learn-teach/curriculum-collections/cosmic-horizons/the-cosmological-principle'
  },
  {
    id: 7,
    title: 'Tests of large-scale homogeneity',
    source: 'Monthly Notices of the Royal Astronomical Society (overview via arXiv)',
    href: 'https://arxiv.org/abs/1610.03071'
  },
  {
    id: 8,
    title: 'Expanding universe demonstration (popular visualisation)',
    source: 'Soft credit for a widely shared classroom-style demo of the same geometry',
    href: 'https://youtu.be/3pAnRKD4raY'
  }
]
</script>

<template>
  <main id="main" class="centre">
    <header class="centre__head">
      <NuxtLink to="/elevate" class="centre__back">The Entertrainer Blogs</NuxtLink>
      <p class="centre__meta">{{ CENTRE_UNIVERSE_BLOG.category }} <span aria-hidden="true">·</span> {{ CENTRE_UNIVERSE_BLOG.minutes }} min read</p>
      <h1>You Are the Centre of the Universe — and Here’s Why</h1>
      <p class="centre__dek">{{ CENTRE_UNIVERSE_BLOG.dek }}</p>
    </header>

    <figure class="centre__hero">
      <EdEditorialImage :src="CENTRE_UNIVERSE_BLOG.hero" :alt="CENTRE_UNIVERSE_BLOG.heroAlt" />
    </figure>

    <article class="centre__article">
      <aside class="centre__margin-note" aria-label="Reading note">
        <p>One useful distinction.</p>
        <p><strong>Looking</strong> like the centre is not the same as <em>owning</em> the centre. Expansion flatters every honest observer the same way.</p>
      </aside>

      <div class="centre__prose">
        <p class="centre__lead">Look up on a clear night and the sky does its usual trick.</p>
        <p>It makes you feel tiny. Billions of stars. Galaxies behind those. Then so much empty that your vocabulary starts sweating.</p>
        <p>So a title like this sounds like either a joke at your expense…</p>
        <p>…or a motivational poster stuck on a gym wall.</p>
        <p>It is neither.</p>
        <p>It is a precise claim about geometry.</p>
        <p>And once you see it, you cannot unsee it.</p>

        <h2>The claim, said carefully</h2>
        <p>You are not the <em>privileged</em> centre of the universe.</p>
        <p>There is no throne in the middle of everything. No cosmic VIP lounge with your name on the door. Sorry.</p>
        <p>But — and this is the fun part — if you pick yourself (or your galaxy) as the frame of reference, the expansion of space looks like it is rushing away from <em>you</em>.</p>
        <p>Pick a different galaxy.</p>
        <p>Same expansion. Now it looks like it is rushing away from <em>them</em>.</p>
        <p>Every honest observer gets to feel central.</p>
        <p>That is not mysticism.</p>
        <p>That is what homogeneous expansion does.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <blockquote>
          <p>Apparent centre ≠ privileged centre. The sky is allowed to flatter everyone at once.</p>
        </blockquote>

        <h2>Raisins, balloons, and a universe with no middle</h2>
        <p>Imagine raisins sitting in bread dough.</p>
        <p>The dough rises. Every raisin moves away from every other raisin. Stand on any raisin and you would swear the others were fleeing <em>you</em> specifically. Dramatic little raisin. Wrong, but understandable.</p>
        <p>Or ink some dots on a balloon and blow it up.</p>
        <p>The dots drift apart. The balloon’s “centre” is inside the rubber — in a direction the dots on the surface do not live in. On the surface itself, there is no unique middle to point at.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Basically, our three-dimensional space is doing something like that.</p>
        <p>Only without needing a kitchen and a rubber balloon.</p>
        <p>Space itself stretches. Galaxies are not zooming through a fixed room so much as riding the stretch.</p>

        <h2>Try it yourself</h2>
        <p>Below is a small lab of the same idea.</p>
        <p>Two layers of the same field of galaxies: a muted past, and a slightly expanded present.</p>
        <p>Click any galaxy — or drag the present layer until the blue ring sits on that galaxy’s red past ring — and watch.</p>

        <ClientOnly>
          <EdExpansionCentreLab />
          <template #fallback>
            <p class="centre__lab-fallback">Loading the expansion lab…</p>
          </template>
        </ClientOnly>

        <p>You know what happens?</p>
        <p>The moment one galaxy’s past and present coincide, every other present-galaxy sits farther out along a ray from that point.</p>
        <p>Change the reference.</p>
        <p>A different galaxy becomes the “centre.”</p>
        <p>Nothing else in the simulation changed.</p>
        <p>Only who you decided to stand on.</p>

        <h2>What the textbooks actually say</h2>
        <p>Cosmologists have a name for this: the <strong>cosmological principle</strong>.</p>
        <p>On large enough scales, the universe looks much the same wherever you are, and in every direction — roughly homogeneous and isotropic.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>That assumption is not a vibe.</p>
        <p>It is the starting point for the simplest working models of the expanding cosmos — the Friedmann–Lemaître–Robertson–Walker geometry, if you like the full name, FLRW if you like breathing.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>In those models, a single function of time — the scale factor <em>a(t)</em> — stretches distances between comoving points. As <em>a</em> grows, every pair of galaxies that are not glued together by local gravity drifts farther apart.</p>
        <p>From that stretch you get Hubble’s law: recession speed proportional to distance. <em>v ∝ d</em>.</p>
        <p>The constant is the same for every observer who is roughly at rest with the cosmic expansion.</p>
        <p>Which is why the law does not secretly nominate Earth as special.</p>
        <p>It nominates <em>nobody</em>.</p>
        <p>Or everybody.</p>
        <p>Depending on your mood.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <h2>Where the story gets honest</h2>
        <p>None of this means your bedroom is the geometric navel of reality.</p>
        <p>Please do not put that on a T-shirt and argue with your landlord.</p>
        <p>Locally, the universe is a mess. You live in a galaxy. The galaxy lives in a group. Groups gather into clusters and filaments, with emptier voids between them. Gravity binds the nearby stuff; it does not coast apart on the Hubble flow the way distant clusters do.</p>
        <p>We also move.</p>
        <p>The cosmic microwave background — leftover glow from when the universe was young and hot — is slightly warmer in one direction of the sky and cooler in the opposite. That dipole is largely <em>us</em> drifting through the cosmos, not a preferred centre carved for our feelings.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>And the cosmological principle is still being tested. Surveys keep asking how homogeneous the large-scale map really is, and at what distance the “average” picture kicks in.</p>
        <p>So far the broad brush holds.</p>
        <p>The footnotes keep scientists busy.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>

        <h2>What every galaxy sees</h2>
        <p>Here is the part that stays with me after the equations go quiet.</p>
        <p>Somewhere, hundreds of millions of light-years away, there is a spiral galaxy that will never know your name.</p>
        <p>If anyone there is looking out tonight — or whatever “tonight” means for them — their sky also runs away in every direction.</p>
        <p>Their telescopes would draw the same Hubble diagram.</p>
        <p>Their children, if they have children, could write the same strange sentence: we appear to sit at the centre of the expansion.</p>
        <p>They would be right in exactly the same limited, beautiful way you are.</p>

        <p class="centre__closing">So look up again. Feel small if you like. Then remember the other half: the universe does not have a unique middle to exile you from. Wherever you stand, the expansion writes you into the middle of the story — and then, politely, does the same for everyone else.</p>
      </div>
    </article>

    <section class="centre__sources" aria-labelledby="sources-title">
      <p class="centre__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="centre__newsletter-wrap"><EdNewsletter /></div>
  </main>
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
