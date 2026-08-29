<script setup lang="ts">
import { ENTROPY_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${ENTROPY_BLOG.title} · The Entertrainer Blogs`,
  description: ENTROPY_BLOG.dek,
  ogTitle: ENTROPY_BLOG.title,
  ogDescription: ENTROPY_BLOG.dek,
  ogUrl: `https://entertrainer.in/elevate/${ENTROPY_BLOG.slug}`,
  ogImage: `https://entertrainer.in${ENTROPY_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: ENTROPY_BLOG.title,
  twitterDescription: ENTROPY_BLOG.dek,
  twitterImage: `https://entertrainer.in${ENTROPY_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Second Law – Entropy', source: 'NASA Glenn Research Center, 2023', href: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/second-law-entropy/' },
  { id: 2, title: 'The Second Law and Entropy Misconceptions Demystified', source: 'Entropy, 2020', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7517180/' },
  { id: 3, title: 'Landauer principle and thermodynamics of computation', source: 'Reports on Progress in Physics, 2025', href: 'https://iopscience.iop.org/article/10.1088/1361-6633/add6b3/meta' },
  { id: 4, title: 'Ask an Astrophysicist: Cosmology', source: 'NASA Goddard Space Flight Center', href: 'https://imagine.gsfc.nasa.gov/ask_astro/cosmology.html' }
]

const visuals = {
  tea: '/manus-storage/entropy-tea-heat-flow_1a9b1f65.jpg',
  differences: '/manus-storage/entropy-useful-differences_58dc4cfe.jpg',
  phone: '/manus-storage/entropy-phone-physical-world_4a5a614f.jpg',
  universe: '/manus-storage/hubble-ultra-deep-field-nasa_01b69516.jpg'
}
</script>

<template>
  <main id="main" class="entropy">
    <header class="entropy__head">
      <NuxtLink to="/elevate" class="entropy__back">The Entertrainer Blogs</NuxtLink>
      <p class="entropy__meta">{{ ENTROPY_BLOG.category }} <span aria-hidden="true">·</span> {{ ENTROPY_BLOG.minutes }} min read</p>
      <h1>You Are Not Lazy. You Are Helping the Universe Extend Its Life.</h1>
      <p class="entropy__dek">A small physics story about rest, hot tea, batteries, deleted files, and why the universe likes to spread things out.</p>
    </header>

    <figure class="entropy__hero">
      <EdEditorialImage :src="ENTROPY_BLOG.hero" :alt="ENTROPY_BLOG.heroAlt" />
    </figure>

    <article class="entropy__article">
      <aside class="entropy__margin-note" aria-label="Reading note">
        <p>One useful word.</p>
        <p>Entropy is what we call it when energy spreads out and becomes harder to use.</p>
      </aside>

      <div class="entropy__prose">
        <p class="entropy__lead">Imagine a cup of tea. You make it properly hot, leave it on the table, get distracted by your phone, and come back later to find it disappointingly normal.</p>
        <p>The tea did not lose all its energy. It gave some of its warmth to the cooler room. The room changed by a tiny amount. The tea changed enough for you to notice. That is the whole problem.</p>
        <p>Scientists have a word for this sort of spreading out: <strong>entropy</strong>. It sounds like a difficult word. The idea is not. When something useful is uneven, it can make something happen. When it becomes even, there is less left to do.</p>

        <figure class="entropy__visual entropy__visual--tea">
          <EdEditorialImage :src="visuals.tea" alt="A hot cup of tea on a table, with visible warmth spreading into the cooler room." />
          <span class="entropy__heat-loop" aria-hidden="true"><i></i><i></i><i></i></span>
          <figcaption>A hot cup and a cool room begin different. Over time, the warmth spreads out.</figcaption>
        </figure>

        <h2>Why a hot cup, a battery, and a waterfall are all cousins</h2>
        <p>Hot tea beside a cool room has a difference. A charged battery has a difference. Water sitting high above the ground has a difference. That difference is the useful part. Heat can move. A battery can run your phone. Falling water can turn a turbine.</p>
        <p>Then the difference slowly disappears. The tea cools. The battery goes flat. The water reaches the bottom. Nothing has vanished. It has simply become less useful for making something else happen.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Basically, the universe likes to smooth things out. Hot things cool down. Full batteries become empty batteries. A room with a window open eventually stops having one side that is dramatically colder than the other. The fancy name for this general direction is the second law of thermodynamics. You do not need to memorise it. You have watched it happen to your coffee.</p>

        <figure class="entropy__visual entropy__visual--differences">
          <EdEditorialImage :src="visuals.differences" alt="A charged battery and a waterfall, each showing how an uneven starting point can create movement." />
          <figcaption>A charged battery and raised water can do something because they begin uneven.</figcaption>
        </figure>

        <figure class="entropy__gradient" aria-label="A simple sequence showing a hot object and a cool object becoming more alike over time.">
          <div class="entropy__gradient-cell entropy__gradient-cell--hot"><span>hot</span></div>
          <div class="entropy__gradient-copy"><strong>the useful gap</strong><span>heat has somewhere to go</span></div>
          <div class="entropy__gradient-cell entropy__gradient-cell--cool"><span>cooler</span></div>
          <figcaption>The bigger the gap, the more change is possible. As the two sides become alike, there is less left for the heat to do.</figcaption>
        </figure>

        <h2>So, does staying in bed help?</h2>
        <p>This is where the joke begins. If you wake up and do a hundred things, you use energy. You walk, cook, travel, charge devices, turn on lights, make more tea because the first tea went cold. A slower day usually uses less of that immediate energy.</p>
        <p>But you are not a phone on airplane mode while you lie there. You are still breathing, keeping warm, thinking strange thoughts, and perhaps holding a phone that is quietly becoming hot in your hand. The universe will manage either way.</p>
        <p>What the joke gets right is smaller and nicer: rest does not need a cosmic excuse. Sometimes you are tired. Sometimes the body is saying, very politely at first, that it would like a chair.</p>

        <blockquote>
          <p>You are not saving the universe by staying in bed. But your back may be grateful that you stopped treating it like office furniture.</p>
        </blockquote>

        <h2>Why cleaning your room is still allowed</h2>
        <p>People hear “entropy” and immediately look at their bedroom. A messy room looks random. A tidy room looks organised. So surely cleaning is fighting entropy?</p>
        <p>Not really. Physics does not care where your socks are. You can make one little part of the world more organised all the time. A fridge keeps its inside cool. Your body keeps itself alive. You can fold a shirt. The work simply uses energy and sends some heat elsewhere.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>So please clean the room. Entropy is not going to do it for you.</p>

        <h2>Even deleting a file involves the real world</h2>
        <p>Your phone looks like it is dealing with invisible things: photos, messages, passwords, bad drafts, screenshots you should probably not keep. But the phone is a physical object. It moves tiny amounts of electricity around. It warms up. It needs to be charged again.</p>
        <p>Scientists have shown that resetting information has a tiny minimum energy cost. In real machines, the cost is much bigger and messier than the neat textbook version. The simple point is enough: information is not floating in space. Somebody, somewhere, is paying for it in electricity and heat.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <figure class="entropy__visual entropy__visual--phone">
          <EdEditorialImage :src="visuals.phone" alt="A phone resting beside a charging cable, a mug, and a lamp, showing that digital actions happen in a physical device using electricity and giving off warmth." />
          <figcaption>Your photos and messages feel invisible. The device holding them is still using electricity, warming up, and asking to be charged.</figcaption>
        </figure>

        <h2>The long version of the universe is very quiet</h2>
        <p>If you keep following this idea for an absurdly long time, you reach a strange picture of the future. No big differences left. No easy fuel. No bright stars doing their usual work. This possible ending is often called heat death.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>

        <figure class="entropy__visual entropy__visual--universe">
          <EdEditorialImage :src="visuals.universe" alt="NASA and ESA Hubble Ultra Deep Field image showing thousands of galaxies as small bright points and smudges against a dark background." />
          <figcaption>One small patch of sky, seen by Hubble: roughly 10,000 galaxies. Image: <a href="https://science.nasa.gov/asset/hubble/hubble-ultra-deep-field/" target="_blank" rel="noreferrer">NASA, ESA, S. Beckwith and the HUDF Team, and B. Mobasher</a>.</figcaption>
        </figure>

        <p>That is not something to worry about while deciding whether to get out of bed. It is simply the largest version of the same thing your tea is doing on the table: a useful difference slowly becoming ordinary.</p>
        <p class="entropy__closing">So yes, the universe is spreading things out. Your tea is cooling. Your battery is draining. Your phone is warm for no reason you asked for. And you are allowed to take a nap before replying to that message.</p>
      </div>
    </article>

    <section class="entropy__sources" aria-labelledby="sources-title">
      <p class="entropy__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="entropy__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
/* Entropy article: warm-yellow Entertrainer editorial layout, plain-text thermodynamics visual, and a narrow reading rhythm with evidence kept visible. */
.entropy { padding-bottom: 112rem; }
.entropy__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(36rem, 6vw, 76rem); }
.entropy__back, .entropy__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.entropy__back { color: var(--ink); }
.entropy__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.entropy h1, .entropy h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.entropy h1 { max-width: 1080rem; margin: 0; font-size: clamp(48rem, 8vw, 122rem); line-height: .91; text-wrap: balance; }
.entropy__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.entropy__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.entropy__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.entropy figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.entropy__article { max-width: 1100rem; margin: clamp(44rem, 8vw, 112rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.entropy__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.entropy__margin-note p { margin: 0; }
.entropy__margin-note p + p { margin-top: 10rem; }
.entropy__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.entropy__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.entropy__prose p { margin: 0 0 24rem; }
.entropy__prose .entropy__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.entropy__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.entropy__prose h2 { margin: 68rem 0 20rem; font-size: clamp(34rem, 4vw, 53rem); line-height: .98; }
.entropy blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(25rem, 3vw, 37rem)/1.06 var(--font-display); letter-spacing: -.035em; }
.entropy blockquote p { margin: 0; }
.entropy__gradient { display: grid; grid-template-columns: minmax(110rem, .75fr) minmax(130rem, 1fr) minmax(110rem, .75fr); gap: 12rem; align-items: stretch; margin: 52rem 0; padding: 12rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.entropy__gradient-cell, .entropy__gradient-copy { min-height: 170rem; display: flex; flex-direction: column; justify-content: flex-end; padding: 16rem; border-radius: calc(var(--radius-m) - 4rem); }
.entropy__gradient-cell { border: 1rem solid var(--ink); font: 700 13rem/1.2 var(--font-mono); text-transform: uppercase; letter-spacing: .08em; }
.entropy__gradient-cell--hot { background: var(--signal-cobalt); color: var(--paper); }
.entropy__gradient-cell--cool { background: color-mix(in srgb, var(--signal-field) 62%, var(--paper)); }
.entropy__gradient-copy { justify-content: center; align-items: center; gap: 7rem; text-align: center; }
.entropy__gradient-copy strong { font: 500 clamp(26rem, 3vw, 38rem)/.94 var(--font-display); letter-spacing: -.04em; }
.entropy__gradient-copy span { font: 400 12rem/1.35 var(--font-mono); color: var(--ink-soft); }
.entropy__gradient figcaption { grid-column: 1 / -1; padding: 0 4rem; }
.entropy__visual { position: relative; margin: 48rem 0 58rem; }
.entropy__visual :deep(.ed-editorial-image) { display: block; overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.entropy__visual :deep(img) { width: 100%; height: auto; object-fit: cover; }
.entropy__visual--tea :deep(.ed-editorial-image), .entropy__visual--differences :deep(.ed-editorial-image) { aspect-ratio: 16 / 9; }
.entropy__visual--phone, .entropy__visual--universe { max-width: 530rem; margin-left: auto; margin-right: 0; }
.entropy__visual--phone :deep(.ed-editorial-image) { aspect-ratio: 4 / 3; }
.entropy__visual--universe :deep(.ed-editorial-image) { aspect-ratio: 1; }
.entropy__heat-loop { position: absolute; left: 48%; top: 26%; display: flex; gap: 8rem; transform: translateX(-50%); pointer-events: none; }
.entropy__heat-loop i { width: 10rem; aspect-ratio: 1; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4rem color-mix(in srgb, var(--accent) 24%, transparent); opacity: .5; animation: entropy-heat-rise 3s ease-in-out infinite; }
.entropy__heat-loop i:nth-child(2) { animation-delay: .45s; }
.entropy__heat-loop i:nth-child(3) { animation-delay: .9s; }
@keyframes entropy-heat-rise { 0%, 100% { opacity: .15; transform: translateY(16rem) scale(.78); } 46% { opacity: .9; transform: translateY(-30rem) scale(1); } }
.entropy__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(26rem, 3vw, 40rem)/1.08 var(--font-display); letter-spacing: -.04em; }
.entropy__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.entropy__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.entropy__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.entropy__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.entropy__sources a { color: inherit; }
.entropy__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.entropy__sources em { color: var(--ink-soft); }
.entropy__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .entropy__hero { padding: 0; }
  .entropy__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .entropy__hero figcaption { padding: 0 var(--shell-gutter); }
  .entropy__article { display: block; }
  .entropy__margin-note { position: static; margin-bottom: 36rem; }
  .entropy__prose h2 { margin-top: 52rem; }
  .entropy__gradient { grid-template-columns: 1fr; }
  .entropy__gradient-cell, .entropy__gradient-copy { min-height: 112rem; }
  .entropy__visual { margin: 36rem 0 48rem; }
  .entropy__visual--phone, .entropy__visual--universe { max-width: none; }
  .entropy__visual--phone :deep(.ed-editorial-image) { aspect-ratio: 16 / 10; }
}
@media (prefers-reduced-motion: reduce) {
  .entropy__heat-loop i { animation: none; }
}
</style>
