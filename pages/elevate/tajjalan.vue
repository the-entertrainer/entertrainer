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
      <EdMarginNote label="Arrival, staying, and leaving">
        <p>The cup stays on the step. The tea arrives, stays, and goes. Tajjalan names this way of watching.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">On a cold morning in Varanasi, an old man sits on the steps of a ghat with a clay cup of chai, and he watches the steam leave.</p>
        <p>The tea will not be in the cup in half an hour. First the heat goes, then the tea, and then the clay cup can be thrown onto a heap of other cups and return to the riverbank it was made from. The cup lasts longer than the tea. The look worth naming is the visit of the tea, not only the cup that holds it.</p>

        <h2>Four parts inside one word</h2>
        <p>The word is tajjalan. It comes from a short line in the Chandogya Upanishad. The line says that all this is Brahman, and that a person should sit with it calmly as tajjalan.<a href="#ref-1" aria-label="Reference 1">[1]</a> The word looks single. In Shankara's reading it folds four parts together.</p>
        <p>Tat means "that," the ground of everything. Ja means "born from." La means "dissolving back into." An means "living in" or "breathing in." Read through Shankara's commentary, the word says that whatever shows up is born from that ground, lives in that ground, and goes back into that ground.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Tajjalan is a way of looking at anything you can point at, including the tea, the cup, the man, the river, and yourself. The three questions are where it came from, what it is in while it is here, and where it goes when it is done.</p>

        <figure class="taj__visual taj__visual--wide">
          <EdEditorialImage
            src="/blog/tajjalan/chandogya-1849-devanagari.jpg"
            alt="Photograph of an 1849 CE Chandogya Upanishad manuscript page in Devanagari script, with aged paper and visible edge wear."
          />
          <figcaption>
            Image: Ms Sarah Welch /
            <a href="https://commons.wikimedia.org/wiki/File:Chandogya_Upanishad_verses_1.1.1-1.1.9,_Samaveda,_Sanskrit,_Devanagari_script,_1849_CE_manuscript.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
            CC BY-SA 4.0, 1849 manuscript
          </figcaption>
        </figure>

        <h2>The teaching does not sort objects into holy and ordinary</h2>
        <p>People often sort objects into two groups. One group holds a temple lamp, a wedding garland, or a prayer book. The other group holds an office mug, a bus ticket, or an ordinary Tuesday. Tajjalan does not make that sort. If each object is born from the same ground, lives in it, and returns to it, the line between a festival object and a Tuesday object is a habit of attention. The teaching does not make the festival object less important. It also does not make the ordinary object a different kind of thing.</p>
        <p>A common sentence says that mind is one thing and matter is another, and that the two do not meet. Everything a person has known arrived as experience, including a sound, a colour, a weight, a fear, a love, and a stretch of time. On this teaching, that living experience is not a side note added to a world outside it.</p>

        <figure class="taj__visual taj__visual--palm">
          <EdEditorialImage
            src="/blog/tajjalan/chandogya-1836-grantha-vivarana.jpg"
            alt="Long narrow palm-leaf manuscript strip of a Chandogya Upanishad commentary in Grantha script from the Whish collection."
          />
          <figcaption>
            Image: Ms Sarah Welch /
            <a href="https://commons.wikimedia.org/wiki/File:1836_CE_July_purchase,_Chandogya_Upanishad_vivarana,_Whish_manuscript_collection,_Kahle-Austin_Foundation,_Sanskrit,_Grantha_script.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
            CC BY-SA 4.0, palm leaf, 1836
          </figcaption>
        </figure>

        <h2>The line is Chandogya Upanishad 3.14.1</h2>
        <p>The line belongs to Chandogya Upanishad 3.14.1, in the teaching of a sage called Shandilya.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-3" aria-label="Reference 3">[3]</a> The four-part reading is how Shankara opens the word. Other teachers read the word differently. The text is old. The look it asks for can be tried on an ordinary morning.</p>
        <p>The instruction is calm on purpose. It does not say to shout, perform, or prove. It says to be peaceful, and to look. The same verse then says that a person is made of their resolve. As someone sets their will in this world, so they become.<a href="#ref-1" aria-label="Reference 1">[1]</a> What you keep treating as true becomes the shape of how you live.</p>
        <p>You can try the look on one breath. There is a wait before the breath, a movement while it lasts, and an end when it stops. The question is what the breath is appearing in.</p>

        <figure class="taj__visual taj__visual--wide">
          <EdEditorialImage
            src="/blog/tajjalan/chandogya-1865-sample.jpg"
            alt="Sample page from an 1865 CE Chandogya Upanishad manuscript in Devanagari script on aged paper."
          />
          <figcaption>
            Image: Ms Sarah Welch /
            <a href="https://commons.wikimedia.org/wiki/File:Chandogya_Upanishad_sample_i,_Samaveda,_Sanskrit,_Devanagari_script,_1865_CE_manuscript.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
            CC BY-SA 4.0, 1865 manuscript
          </figcaption>
        </figure>

        <p>Tajjalan does not ask anyone to leave ordinary life. The cup stays a cup, and a Tuesday stays a Tuesday. The claim is that the wall between holy and ordinary may be thinner than it feels.</p>

        <blockquote>
          <p>Whatever shows up is born from that ground, lives in that ground, and goes back into that ground.</p>
        </blockquote>

        <p class="taj__closing">The man finishes the chai and sets the cup down, and the tea has already started to leave.</p>
        <p>The verse asks for a calm look at that leaving. It does not ask for a forced conclusion.</p>
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
.taj { padding-bottom: var(--space-89); }
.taj__head { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: 0 auto; padding: var(--space-34) var(--shell-gutter) var(--space-21); }
.taj__back, .taj__meta { font: 500 var(--type-meta)/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.taj__back { color: var(--ink); }
.taj__meta { margin: var(--space-21) 0 var(--space-13); color: var(--signal-cobalt); }
.taj h1, .taj h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.taj h1 { max-width: var(--column); margin: 0; font-size: var(--type-h1); line-height: .95; text-wrap: balance; }
.taj__dek { max-width: var(--measure); margin: var(--space-13) 0 0; font: 400 var(--type-dek)/1.3 var(--font-body); }
.taj__hero { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: 0 auto; padding: 0 var(--shell-gutter); }
.taj__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: var(--crop); object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj figure figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.taj__article { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-34) auto 0; padding: 0 var(--shell-gutter); display: block; }
.taj__prose { max-width: var(--measure); font: 400 var(--type-body)/1.55 var(--font-body); }
.taj__prose p { margin: 0 0 var(--space-21); }
.taj__prose .taj__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.taj__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.taj__prose h2 { margin: var(--space-34) 0 var(--space-13); font-size: var(--type-h2); line-height: .98; }
.taj blockquote { margin: var(--space-34) 0; padding: var(--space-21); border-left: var(--stroke) solid var(--ink); background: var(--paper); border-radius: 0; font: 500 var(--type-h2)/1.15 var(--font-display); letter-spacing: -.03em; }
.taj blockquote p { margin: 0; }
.taj__visual { margin: 50rem 0 45rem; }
.taj__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: var(--crop); object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--signal-field); }
.taj__visual--wide :deep(.ed-editorial-image) { aspect-ratio: var(--crop); object-fit: cover; }
.taj__visual--palm :deep(.ed-editorial-image) { aspect-ratio: var(--crop); object-fit: cover; background: #f0e6d4; }
.taj__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 var(--type-h2)/1.15 var(--font-display); letter-spacing: -.035em; }
.taj__sources { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: var(--space-34) var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.taj__sources h2 { margin: var(--space-13) 0 var(--space-21); font-size: var(--type-h1); line-height: .95; }
.taj__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.taj__sources li { padding: var(--space-13) 0; border-top: var(--stroke) solid var(--line); font-size: var(--type-body); line-height: 1.45; }
.taj__sources a { color: inherit; }
.taj__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.taj__sources em { color: var(--ink-soft); }
.taj__newsletter-wrap { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: 0 var(--shell-gutter); }
/* Pen rewrite: archival figures keep their own proportions; credit links stay quiet ink. */
.taj__visual { margin: 50rem 0 45rem; }
.taj__visual--archive :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: var(--fig-ratio, var(--crop)); object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj__visual--portrait { max-width: 440rem; }
.taj .taj__prose figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj .taj__prose figure figcaption a { color: inherit; text-decoration: underline; text-decoration-color: var(--line); text-decoration-thickness: 1px; text-underline-offset: 3px; }
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: var(--crop); }
  .taj__article { display: block; }
  .taj__prose h2 { margin-top: 52rem; }
  .taj__visual { margin-left: 0; margin-right: 0; }
  .taj__visual--palm :deep(.ed-editorial-image) { aspect-ratio: var(--crop); }
}
</style>
