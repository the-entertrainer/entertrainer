<script setup lang="ts">
import { SACRED_FREQUENCIES_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${SACRED_FREQUENCIES_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: SACRED_FREQUENCIES_BLOG.socialHook,
  ogTitle: SACRED_FREQUENCIES_BLOG.socialTitle,
  ogDescription: SACRED_FREQUENCIES_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${SACRED_FREQUENCIES_BLOG.slug}`,
  ogImage: `https://entertrainer.in${SACRED_FREQUENCIES_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: SACRED_FREQUENCIES_BLOG.socialTitle,
  twitterDescription: SACRED_FREQUENCIES_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${SACRED_FREQUENCIES_BLOG.hero}`
})

const tones = [174, 285, 396, 417, 528, 639, 741, 852, 963]

const references = [
  {
    id: 1,
    title: 'Solfeggio Frequencies Guide: History, Science & Benefits',
    source: 'Mind Vibrations. The nine tones and the job each is traditionally given in sound healing',
    href: 'https://www.mindvibrations.com/solfeggio-frequencies/'
  },
  {
    id: 2,
    title: 'Solfeggio frequencies: list, chart, meaning, generator',
    source: 'Mind University. Names, uses, and chakra pairings for each tone in the practice',
    href: 'https://mind.university/tools/solfeggio-frequencies'
  },
  {
    id: 3,
    title: 'Ut queant laxis',
    source: 'Wikipedia. The hymn to John the Baptist that gave Guido of Arezzo the syllables ut, re, mi, fa, sol, la',
    href: 'https://en.wikipedia.org/wiki/Ut_queant_laxis'
  },
  {
    id: 4,
    title: 'The Solfeggio Frequencies vs. The Solfège System',
    source: 'Sylvia Villa. Joseph Puleo’s six tones in the 1970s, and the three added later',
    href: 'https://sylviavilla.com/blog/the-solfeggio-frequencies-vs-the-solfege-system'
  },
  {
    id: 5,
    title: 'Healing Codes for the Biological Apocalypse',
    source: 'Leonard G. Horowitz and Joseph E. Barber, Tetrahedron Publishing LLC, 1999',
    href: 'https://books.google.com/books/about/Healing_Codes_for_the_Biological_Apocaly.html?id=0kALAAAACAAJ'
  }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ SACRED_FREQUENCIES_BLOG.category }} <span aria-hidden="true">·</span> {{ SACRED_FREQUENCIES_BLOG.minutes }} min read</p>
      <h1>{{ SACRED_FREQUENCIES_BLOG.title }}</h1>
      <p class="taj__dek">{{ SACRED_FREQUENCIES_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="SACRED_FREQUENCIES_BLOG.hero" :alt="SACRED_FREQUENCIES_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <EdMarginNote label="Hold this.">
        <p>The tone you need is usually the one you would rather not name.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">The woman at the counter held a tuning fork in each hand, one stamped 396 and the other 528, and she looked like someone choosing between two doctors. The shopkeeper, a patient man in a linen kurta, had just told her that the first was for fear and guilt, and the second was for love. She lifted the 528. She put it down. She turned the 396 over, as if the answer might be engraved on the back.</p>
        <p>Think about this for a minute. Most shopping lets us buy the person we would like to be: the running shoes, the cookbook, the plant we will definitely remember to water. Her choice was stranger. Each fork named a problem, and to buy one she had to admit which problem was hers.</p>
        <p>Strike a fork like that on your knee and you get one clean pitch that hangs in the air like a held breath. You can try all nine right here. These are the tones people call the sacred, or Solfeggio, frequencies. Each button is a pure sine, one at a time.</p>
        <EdHzRow :hertz="tones" />

        <h2>The nine tones</h2>
        <p>Nine numbers, then: 174, 285, 396, 417, 528, 639, 741, 852 and 963 hertz. In sound-healing practice each one has a job, the way each key on a caretaker’s ring opens one particular door.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> Healers hold them as forks near the chest, play them as long humming tracks for sleep, or tune whole songs around them.</p>
        <p>The names reach back further than the numbers. The middle six borrow the old singing syllables ut, re, mi, fa, sol and la, which a Benedictine monk named Guido of Arezzo lifted, around the year 1000, from the first word of each line of a hymn to John the Baptist.<a href="#ref-3" aria-label="Reference 3">[3]</a> The hymn is a small plea from singers who want their voices set free. One line asks for the guilt of stained lips to be washed away. Keep that line in your pocket. It comes back.</p>

        <figure class="taj__visual taj__visual--manuscript">
          <EdEditorialImage
            src="/blog/sacred-frequencies/monks-singing-1476.jpg"
            alt="Fifteenth-century manuscript illumination of black-robed monks singing before a lectern with an open choir book, inside a gilded initial K."
          />
          <figcaption>
            Image: Public Domain /
            <a href="https://www.metmuseum.org/art/collection/search/929276" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a>,
            choir book leaf, 1476
          </figcaption>
        </figure>

        <p>The numbers themselves turned up in the 1970s. As the story is usually told, a man named Joseph Puleo sat with the Book of Numbers and came away certain that six healing tones were tucked inside its verses.<a href="#ref-4" aria-label="Reference 4">[4]</a> Leonard Horowitz carried them into a 1999 book, and later teachers added three more at the edges: 174 at the bottom, 285 just above it, and 963 at the very top.<a href="#ref-4" aria-label="Reference 4">[4]</a><a href="#ref-5" aria-label="Reference 5">[5]</a> Nine tones. Nine jobs. A chart small enough to stick on a fridge.</p>

        <h2>The low tones</h2>
        <p>Start at the floor. <strong>174 Hz</strong> is the lowest note on the list, and the practice treats it like a heavy blanket: comfort, safety, the easing of pain and tension. When the body is clenched like a fist around a bad week, this is the one people reach for.</p>
        <p><strong>285 Hz</strong> sits just above it and is the tone of healing and renewal, said to restore tissue and what healers call the energy field. If 174 says you are safe, 285 says now you can mend.</p>
        <p><strong>396 Hz</strong> is where the hymn walks back in. In the tradition it carries ut, the very first syllable of Guido’s hymn, and its job is liberating fear and guilt.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a> It is tied to the root, the base of the spine, the cellar where old fears like to keep their boxes. Right after it comes <strong>417 Hz</strong>, re, the tone of change: undoing stuck situations and clearing old patterns so something new has room to land. Think of it as the tone for moving house inside your own head.</p>

        <h2>The heart tones</h2>
        <p><strong>528 Hz</strong> is the celebrity of the nine. Mi. The love frequency. In the tradition it stands for love and transformation, and in its most devoted circles it is even credited with repairing DNA, which is why it shows up on more playlists than the other eight put together.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> People press it when they want warmth, a lift, the sense that something good is quietly rearranging the furniture.</p>
        <p>Its neighbour, <strong>639 Hz</strong>, fa, is gentler and more sociable. This is the tone for relationships and connection: reconciliation, honest conversation, the slow work of being near other people without armour. If 528 is falling in love, 639 is the long Sunday afternoon of staying there.</p>

        <h2>The high tones</h2>
        <p>Above the heart, the jobs get airier. <strong>741 Hz</strong>, sol, belongs to the throat. It is the tone of expression and clarity, of cleansing and solving problems. It is for the sentence you have been rehearsing in the shower for three weeks.</p>
        <p><strong>852 Hz</strong>, la, belongs to the third eye. The practice gives it intuition and a return to spiritual order, the quiet knowing that shows up once the mental chatter finally sits down and takes its coat off.</p>
        <p>And at the top, <strong>963 Hz</strong>. The crown. Some call it the frequency of the gods. Its job is oneness: the feeling of belonging to something larger than your to-do list, of being one wave in a very big sea.</p>

        <h2>Choosing a tone</h2>
        <p>Here is the funny part. Lay all nine on a counter and almost everyone reaches for 528 first. Of course they do. Love is a flattering thing to shop for. Nobody walks in and says, I will take the guilt one, please.</p>
        <p>Now imagine the shopkeeper sets out only three forks. A shiny 528 for love. A 396 for fear and guilt. And a third, another 528, with a dent in the stem and a sticker that says seconds. Suddenly the shiny 528 looks like the sensible, grown-up choice, and the 396 slips quietly out of the conversation. The dented fork did nothing except make one option feel safer to pick. We do this with restaurants, with flats, with partners. Why would our insides be any different?</p>
        <p>The tradition seems to know this about us. It puts fear and guilt low on the ladder, below love, as if the road up has to pass through the thing we would rather skip. Guido’s singers asked for the same release a thousand years ago: wash the guilt from our lips first, and then we will sing.</p>
        <p>So if you press one, press the one that names your actual week. 174 when the body is tight. 285 when you are worn thin. 396 when fear is running the room. 417 when you are stuck. 528 when you want warmth. 639 when someone you love feels far away. 741 when the words will not come. 852 when you want to hear yourself think. 963 when you simply want to sit open. Keep the volume low, give it fifteen quiet minutes, and notice what answers.</p>
        <p>In the version of the shop story I like best, the woman bought the 396. She said love could wait until she had put something else down. I think she understood the chart better than most of us do. A list of nine tones is also a list of nine honest sentences, and the hard part was never the hertz.</p>

        <p class="taj__closing">Perhaps every tone on the list is the same quiet instruction, sung at a different height: first, name what you are carrying.</p>
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
.taj__article { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-34) auto 0; padding: 0 var(--shell-gutter); display: block; }
.taj__prose { max-width: var(--measure); font: 400 var(--type-body)/1.55 var(--font-body); }
.taj__prose p { margin: 0 0 var(--space-21); }
.taj__prose .taj__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.taj__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.taj__prose h2 { margin: var(--space-34) 0 var(--space-13); font-size: var(--type-h2); line-height: .98; }
.taj__visual { margin: 50rem 0 45rem; }
.taj__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 1800 / 1604; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj figure figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.taj__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 var(--type-h2)/1.15 var(--font-display); letter-spacing: -.035em; }
.taj__sources { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: var(--space-34) var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.taj__sources h2 { margin: var(--space-13) 0 var(--space-21); font-size: var(--type-h1); line-height: .95; }
.taj__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.taj__sources li { padding: var(--space-13) 0; border-top: var(--stroke) solid var(--line); font-size: var(--type-body); line-height: 1.45; }
.taj__sources a { color: inherit; }
.taj__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.taj__sources em { color: var(--ink-soft); }
.taj__newsletter-wrap { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: var(--crop); }
  .taj__prose h2 { margin-top: 52rem; }
}
</style>
