<script setup lang="ts">
import { TAJJALAN_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${TAJJALAN_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: TAJJALAN_BLOG.socialHook,
  ogTitle: TAJJALAN_BLOG.socialTitle,
  ogDescription: TAJJALAN_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${TAJJALAN_BLOG.slug}`,
  ogImage: `https://entertrainer.in${TAJJALAN_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: TAJJALAN_BLOG.socialTitle,
  twitterDescription: TAJJALAN_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${TAJJALAN_BLOG.hero}`
})

const references = [
  {
    id: 1,
    title: 'Chāndogya Upaniṣad 3.14.1 (Śāṇḍilya vidyā)',
    source: 'Sanskrit text and translations of the Upaniṣad',
    href: 'https://www.wisdomlib.org/hinduism/book/chandogya-upanishad-english/d/doc239314.html'
  },
  {
    id: 2,
    title: 'Śaṅkara’s bhāṣya on Chāndogya 3.14.1',
    source: 'Four-part reading of tajjalan (tat–ja–la–an) in the Advaita commentarial tradition',
    href: 'https://www.wisdomlib.org/hinduism/book/chandogya-upanishad-shankara-bhashya/d/doc145211.html'
  },
  {
    id: 3,
    title: 'Śāṇḍilya vidyā',
    source: 'The teaching thread in Chāndogya 3.14 on Brahman as the ground of all this',
    href: 'https://en.wikipedia.org/wiki/Chandogya_Upanishad'
  }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ TAJJALAN_BLOG.category }} <span aria-hidden="true">·</span> {{ TAJJALAN_BLOG.minutes }} min read</p>
      <h1>{{ TAJJALAN_BLOG.title }}</h1>
      <p class="taj__dek">{{ TAJJALAN_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="TAJJALAN_BLOG.hero" :alt="TAJJALAN_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>Four pieces.</p>
        <p><strong>Tat</strong> (That), <strong>Ja</strong> (born from), <strong>La</strong> (returns into), <strong>An</strong> (lives and breathes in). One word. One look you can try on a cup, a day, or a breath.</p>
      </aside>

      <div class="taj__prose">
        <p class="taj__lead">There is an old word most people never hear.</p>
        <p>Once you see what it is pointing at, something quiet shifts: the wall between “me” and “everything else” starts looking thinner than you were taught.</p>

        <h2>What is it?</h2>
        <p>Tajjalan.</p>
        <p>It comes from a short line in the Chāndogya Upaniṣad: all this is Brahman; sit with it calmly as <em>tajjalan</em>.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>The word itself is made of four pieces. That is the whole key.</p>
        <p><strong>Tat</strong> means That — the ground of everything. <strong>Ja</strong> means born from, or coming out of. <strong>La</strong> means going back into, or dissolving into. <strong>An</strong> means living and breathing in.</p>
        <p>So Śaṅkara reads the word like this: whatever shows up is born from That, lives and breathes in That, and goes back into That.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Tajjalan is not a fancy name for God.</p>
        <p>It is a four-part way of looking at anything you can point at — a cup, your body, a thought, a whole day.</p>
        <p>Where did this come from? Where does it go when it ends? What is it living in while it is here?</p>
        <p>Those three questions are just the four pieces of the word, turned into a look you can actually use. If the answers keep landing in the same place, the old habit of “holy over here, ordinary over there” starts looking like a habit, not a truth.</p>

        <figure class="taj__visual">
          <EdEditorialImage
            src="/blog/tajjalan/four-parts.jpg"
            alt="Four cream editorial panels for Tat, Ja, La, and An: a seed-ground, a sprout, a living orbit, and a return into dark earth, linked by cobalt marks."
          />
          <figcaption>Four word-parts as one continuous look: Tat (That), Ja (born from), An (lives and breathes in), La (returns into).</figcaption>
        </figure>

        <figure class="taj__visual taj__visual--wide">
          <EdEditorialImage
            src="/blog/tajjalan/chandogya-1849-devanagari.jpg"
            alt="Photograph of an 1849 CE Chandogya Upanishad manuscript page in Devanagari script, with aged paper and visible edge wear."
          />
          <figcaption>
            Chāndogya Upaniṣad manuscript page (Devanagari, 1849 CE copy), Lalchand Research Library / DAV College Digital Library.
            Photo: Ms Sarah Welch,
            <a href="https://commons.wikimedia.org/wiki/File:Chandogya_Upanishad_verses_1.1.1-1.1.9,_Samaveda,_Sanskrit,_Devanagari_script,_1849_CE_manuscript.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>
            (CC BY-SA 4.0).
          </figcaption>
        </figure>

        <h2>Why is it significant?</h2>
        <p>Most of us walk through life like guests who arrived late.</p>
        <p>The room was already set. The rules were already printed. We just try to cope.</p>
        <p>That feeling rests on a quiet story we almost never question: the stuff out there is one thing, and the mind in here is another, and they do not really meet.</p>
        <p>It sounds grown-up. It also misses something you already know from living.</p>
        <p>Everything you have ever known came to you as experience. A sound. A colour. A weight. A fear. A love. A stretch of time.</p>
        <p>You never meet a “world” outside that. You meet experience, and you call some of it the world.</p>
        <p>Tajjalan sits right on that point. If everything that shows up comes from one ground, stays in it, and returns to it, then your living is not a small side story stuck onto a dead outside. On this teaching, the living is the main stage.</p>
        <p>You are not a guest in a finished building. You are inside the thing that is also making and taking back every room.</p>
        <p>That changes how careful you get with what you put into the day — what you think, what you look at, what you mean — because those are not smoke floating above life. They are movements inside it.</p>

        <figure class="taj__visual taj__visual--palm">
          <EdEditorialImage
            src="/blog/tajjalan/chandogya-1836-grantha-vivarana.jpg"
            alt="Long narrow palm-leaf manuscript strip of a Chandogya Upanishad commentary in Grantha script from the Whish collection."
          />
          <figcaption>
            Palm-leaf Chāndogyopaniṣad-vivaraṇa (Grantha script), Whish collection purchase, 1836 CE, Thanjavur.
            Photo: Ms Sarah Welch,
            <a href="https://commons.wikimedia.org/wiki/File:1836_CE_July_purchase,_Chandogya_Upanishad_vivarana,_Whish_manuscript_collection,_Kahle-Austin_Foundation,_Sanskrit,_Grantha_script.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>
            (CC BY-SA 4.0).
          </figcaption>
        </figure>

        <h2>Interesting facts and thoughts</h2>
        <p>The line is from Chāndogya Upaniṣad 3.14.1, in the teaching of Śāṇḍilya.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-3" aria-label="Reference 3">[3]</a> The four-piece reading (tat–ja–la–an) is how Śaṅkara opens the word; other teachers read it differently. The text is old. The look it asks for is still available.</p>
        <p>The instruction is calm on purpose. It does not say shout. It does not say put on a show. It says: be calm, and pay attention.</p>
        <p>Then it gets sharp about the mind. A person is made of what they hold firmly. What you keep treating as true slowly becomes the shape of your life. Your picture of reality is not decoration. It is training.</p>
        <p>Treat the world as dead stuff you are only passing through, and you will live like a passer-by. Treat what appears as belonging to one living ground, and you start watching differently.</p>
        <p>You can try the look on one breath.</p>
        <p>There was a waiting before it. There is a moving while it lasts. There is a going when it ends.</p>
        <p>Ask: what is this breath appearing in? What is holding the appearing?</p>
        <p>Stay a little longer than habit wants. The story of a sealed private universe gets harder to believe.</p>

        <figure class="taj__visual">
          <EdEditorialImage
            src="/blog/tajjalan/breath.jpg"
            alt="A single cobalt ripple expanding across a cream field of quiet concentric rings, like one breath moving through a shared ground."
          />
          <figcaption>One breath as a ripple in a field: appearing, moving, returning — without leaving the ground it moves in.</figcaption>
        </figure>

        <figure class="taj__visual taj__visual--wide">
          <EdEditorialImage
            src="/blog/tajjalan/chandogya-1865-sample.jpg"
            alt="Sample page from an 1865 CE Chandogya Upanishad manuscript in Devanagari script on aged paper."
          />
          <figcaption>
            Chāndogya Upaniṣad sample page (Devanagari, 1865 CE manuscript), Lalchand Research Library / DAV College Digital Library.
            Photo: Ms Sarah Welch,
            <a href="https://commons.wikimedia.org/wiki/File:Chandogya_Upanishad_sample_i,_Samaveda,_Sanskrit,_Devanagari_script,_1865_CE_manuscript.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>
            (CC BY-SA 4.0).
          </figcaption>
        </figure>

        <p>One more quiet fact: tajjalan does not ask you to leave ordinary life. The cup stays a cup. The day stays a day. The claim is only this — the wall between “holy” and “ordinary” may be thinner than it feels.</p>

        <blockquote>
          <p>Whatever shows up is born from That, lives and breathes in That, and goes back into That.</p>
        </blockquote>

        <p class="taj__closing">If everything you can know only ever shows up as experience — and experience itself is coming from, living in, and going back into one ground — what exactly are you standing outside of when you call something “just ordinary”?</p>
        <p>Sit with that. Do not force an answer. See what the night does with it.</p>
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
.taj__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--signal-field); }
.taj__visual--wide :deep(.ed-editorial-image) { aspect-ratio: 16 / 7; object-fit: cover; }
.taj__visual--palm :deep(.ed-editorial-image) { aspect-ratio: 16 / 3.2; object-fit: cover; background: #f0e6d4; }
.taj__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.14 var(--font-display); letter-spacing: -.035em; }
.taj__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.taj__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.taj__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.taj__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.taj__sources a { color: inherit; }
.taj__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.taj__sources em { color: var(--ink-soft); }
.taj__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .taj__article { display: block; }
  .taj__margin-note { position: static; margin-bottom: 36rem; }
  .taj__prose h2 { margin-top: 52rem; }
  .taj__visual { margin-left: 0; margin-right: 0; }
  .taj__visual--palm :deep(.ed-editorial-image) { aspect-ratio: 16 / 4.5; }
}
</style>
