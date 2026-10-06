<script setup lang="ts">
import { ONE_EQUALS_TWO_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${ONE_EQUALS_TWO_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: ONE_EQUALS_TWO_BLOG.socialHook,
  ogTitle: ONE_EQUALS_TWO_BLOG.socialTitle,
  ogDescription: ONE_EQUALS_TWO_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${ONE_EQUALS_TWO_BLOG.slug}`,
  ogImage: `https://entertrainer.in${ONE_EQUALS_TWO_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: ONE_EQUALS_TWO_BLOG.socialTitle,
  twitterDescription: ONE_EQUALS_TWO_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${ONE_EQUALS_TWO_BLOG.hero}`
})

const proof = [
  { eq: 'a = b', why: 'start with two equal numbers' },
  { eq: 'a² = ab', why: 'multiply both sides by a' },
  { eq: 'a² − b² = ab − b²', why: 'subtract b² from both sides' },
  { eq: '(a + b)(a − b) = b(a − b)', why: 'factorise both sides' },
  { eq: 'a + b = b', why: 'cross out (a − b) on each side' },
  { eq: '1 + 1 = 1', why: 'now let a = b = 1' },
  { eq: '2 = 1', why: '', result: true }
]

const references = [
  {
    id: 1,
    title: 'Babylonian numerals',
    source: 'MacTutor History of Mathematics, University of St Andrews. Base sixty, inherited from the Sumerians, and the long years without a zero',
    href: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Babylonian_numerals/'
  },
  {
    id: 2,
    title: 'Mayan mathematics',
    source: 'MacTutor History of Mathematics, University of St Andrews. A counting system built on twenties',
    href: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Mayan_mathematics/'
  },
  {
    id: 3,
    title: 'Proof that π is irrational',
    source: 'Wikipedia. Lambert’s proof in the 1760s, and Lindemann’s 1882 proof that π is transcendental',
    href: 'https://en.wikipedia.org/wiki/Proof_that_pi_is_irrational'
  },
  {
    id: 4,
    title: 'Lindemann–Weierstrass theorem',
    source: 'Wikipedia. Why π is not the root of any polynomial with whole-number coefficients',
    href: 'https://en.wikipedia.org/wiki/Lindemann%E2%80%93Weierstrass_theorem'
  },
  {
    id: 5,
    title: 'Most accurate value of pi',
    source: 'Guinness World Records. 314 trillion digits by StorageReview and Micron, 18 November 2025, with every 13-digit string found inside',
    href: 'https://www.guinnessworldrecords.com/world-records/66179-most-accurate-value-of-pi'
  },
  {
    id: 6,
    title: 'Pi Day: Breakthrough “obliterates” the world record for calculating pi',
    source: 'ScienceAlert. The 110-day run, and NASA JPL’s 37 decimal places for the observable universe',
    href: 'https://www.sciencealert.com/pi-day-breakthrough-obliterates-the-world-record-for-calculating-pi'
  },
  {
    id: 7,
    title: 'Normal number',
    source: 'Wikipedia. π is strongly suspected to be normal, but nobody has proved it',
    href: 'https://en.wikipedia.org/wiki/Normal_number'
  },
  {
    id: 8,
    title: 'Mathematical fallacy: division by zero',
    source: 'Wikipedia. The classic 2 = 1 proof, and the line where it divides by zero',
    href: 'https://en.wikipedia.org/wiki/Mathematical_fallacy#Division_by_zero'
  }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ ONE_EQUALS_TWO_BLOG.category }} <span aria-hidden="true">·</span> {{ ONE_EQUALS_TWO_BLOG.minutes }} min read</p>
      <h1>{{ ONE_EQUALS_TWO_BLOG.title }}</h1>
      <p class="taj__dek">{{ ONE_EQUALS_TWO_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="ONE_EQUALS_TWO_BLOG.hero" :alt="ONE_EQUALS_TWO_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <EdMarginNote label="Hold this.">
        <p>Every ruler starts at a zero somebody chose.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">I was still in school, sitting on the kitchen floor one evening with a notebook full of long division, when my mother said the thing she always said. She was stirring a pot and not really looking at me. “The only thing that exists,” she said, “the only truth there is, is God himself.”</p>
        <p>I put my pencil down like a lawyer about to win the case. “No ma. Maths exists. It’s the truth.”</p>
        <p>I had evidence, too. Two plus two had been four on Monday and it was still four on Thursday. It was four in our kitchen and, I assumed, four on the Moon. God was harder to check.</p>
        <p>For years I carried that argument like a lucky coin. Maths was the universal language, the one thing that never changed its mind. And it is universal, in its way. What I understood only very recently is that the way we read it and lean on it has more to do with our own convenience than I ever wanted to admit.</p>
        <p>Today, while writing this post, I still cannot fully accept that it isn’t the truth. I am losing the argument anyway.</p>

        <h2>Ten fingers</h2>
        <p>Here is how I think of maths now. It is a way of giving names to geometry, so that we can pinpoint exactly where things sit in space. This cup is here. The Moon is roughly 384,000 kilometres over there. Because the world feels so solid, pinning down its coordinates sounds like an easy job.</p>
        <p>Start with the numbers themselves. We count in tens, and the reason is sitting at the ends of your arms. Ten fingers. Nobody carried that down from a mountain; it is just what we had on us when we started counting goats.</p>
        <p>Other people had other conveniences. The Babylonians counted in sixties, a habit they inherited from the Sumerians, which is why, some four thousand years later, your hour still breaks into sixty minutes and every minute into sixty seconds.<a href="#ref-1" aria-label="Reference 1">[1]</a> The Maya counted in twenties, probably fingers and toes together.<a href="#ref-2" aria-label="Reference 2">[2]</a> Three civilisations, three rulers, and each felt like the natural way to cut up the world to the people holding it. Think about this for a minute. Raised on sixties, you would find our tens a quaint local habit.</p>
        <p>In 1491 an Italian arithmetic book by Filippo Calandri spent two whole pages just showing readers how to hold numbers on their hands: a little alphabet of bent fingers that runs from one all the way to nine thousand.</p>

        <figure class="taj__visual taj__visual--book">
          <EdEditorialImage
            src="/blog/one-equals-two/calandri-finger-counting-1491.jpg"
            alt="An open fifteenth-century printed book with woodcut hands on both pages, each hand bending its fingers into a different number, with numerals from 1 to 9000 inside decorative borders."
          />
          <figcaption>
            Image: Public Domain /
            <a href="https://www.metmuseum.org/art/collection/search/347027" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a>,
            Filippo Calandri, De Arithmetica, 1491
          </figcaption>
        </figure>

        <p>So the grammar of our numbers is a choice. Fine. Surely the things we measure with it are solid. That is what I thought, until pi.</p>

        <h2>The point that will not be pinned</h2>
        <p>Pi is probably the most famous number on the planet. Personally, I am connected to this number in more ways than one, so forgive me if I get a little sentimental here.</p>
        <p>Take any circle: a bangle, a chapati, the rim of a steel tumbler. Measure all the way round it, divide by the distance straight across, and you always get the same answer, whatever the size. A little more than three. Roll a wheel exactly one metre wide along the floor for one full turn and mark where it stops. The mark lands just past three metres. Not three. Not three and a quarter. Somewhere in between, at a spot no ruler can name exactly.</p>
        <p>3.14159265358979323846264338327950, and on, and on. The digits never fall into a repeating pattern. In the 1760s Johann Heinrich Lambert proved that pi can never be written as one whole number divided by another, and in 1882 Ferdinand von Lindemann went further and showed that it is transcendental: no polynomial equation with whole-number coefficients will ever have pi as its answer.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a> Here is the part I love: switch to Babylonian sixties or Maya twenties and nothing changes. In any whole-number base, the digits still refuse to settle down. It is a point that refuses to be located, a place we cannot fully map from inside our own system of names.</p>
        <p>And yet it turns up wherever something goes round. In wheels and orbits. In the swing of a pendulum, the ripple from a stone in a pond, every wave of sound. We lean on it all day, and we have never finished writing it down.</p>
        <p>We do know ways to get there. In November 2025 a single server, running for about 110 days without a break, worked pi out to 314 trillion digits.<a href="#ref-5" aria-label="Reference 5">[5]</a> For scale, NASA’s Jet Propulsion Laboratory has pointed out that about 37 decimal places are enough to measure the circumference of the observable universe to within the width of a hydrogen atom.<a href="#ref-6" aria-label="Reference 6">[6]</a> We are trillions of digits past any possible use, and no closer to the end. There isn’t one. That much, at least, is proved.</p>
        <p>Now the thought that kept me up. According to Guinness World Records, every possible string of thirteen digits has been found somewhere inside those 314 trillion.<a href="#ref-5" aria-label="Reference 5">[5]</a> My mobile number has ten digits. So does yours. It is already in there, sitting quietly between strangers.</p>
        <p>And if pi is what most mathematicians suspect it is, a so-called normal number, the list never stops: your date of birth, your credit card, your entire contacts list, your name if you turn letters into numbers, everything that has ever been written. Nobody has proved it. Nobody has even proved that every digit keeps turning up forever.<a href="#ref-7" aria-label="Reference 7">[7]</a> But it is the kind of unproven idea that makes you look at a bangle differently.</p>

        <h2>The night 2 became 1</h2>
        <p>That rabbit hole sent me looking for the beautiful flaws in the maths they teach us at school. And I found this, older than any forum it is scribbled on.</p>

        <ol class="taj__proof" aria-label="A five-line proof that 2 equals 1">
          <li v-for="(line, i) in proof" :key="i" :class="{ 'is-result': line.result }">
            <span class="taj__proof-eq">{{ line.eq }}</span>
            <span v-if="line.why" class="taj__proof-why">{{ line.why }}</span>
          </li>
        </ol>

        <p class="taj__gasp">WTF?!</p>
        <p>That was my honest reaction, and I am not proud of the language. I went through it the way you pat your pockets for keys. Multiply, fine. Subtract the same thing from both sides, fine. Factorise, exactly the way our teacher did it on the board. Then the fifth line, where (a − b) slips away from both sides at once, like two guests leaving a party together so nobody notices either of them go.</p>
        <p>Look at that guest again. We began by saying a = b. So a − b is a number minus itself. It is zero. Crossing it out from both sides means dividing both sides by zero, and that is the one door arithmetic refuses to walk through.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>Think about what division even asks. Six divided by two asks: what number, times two, gives six? Three, happily. Now ask what, times zero, gives six. Nothing answers. Zero swallows whatever you multiply by it. Ask instead what, times zero, gives zero, and every number on earth raises its hand. Line four of the trick was secretly 0 = 0, true and completely empty. Divide by zero, and you can walk out of it holding 2 = 1, or anything you please.</p>
        <p>And here is the bit that undid my kitchen argument. None of this is the fault of base ten. Write the same lines in Babylonian sixties or Maya twenties and they break at exactly the same step. The Babylonians, for a long stretch, had no symbol for zero at all; an empty gap in a row of wedges had to do the job.<a href="#ref-1" aria-label="Reference 1">[1]</a> Even after we gave nothing a name, it kept one room locked.</p>

        <h2>What my mother meant</h2>
        <p>So here is where I have landed, and I do not love it. Maths is real the way a map is real. A good map gets you across the city and home in time for dinner, and you would be a fool to throw it away. But somebody drew it. Somebody chose the ten fingers. And at the edges, the map simply stops: a circle we can never finish measuring, a number we are not allowed to divide by, a mark on the floor that no ruler can name.</p>
        <p>The schoolboy in me still wants a world where you can point at anything and say there, exactly. But the closer I look, the more little places I find where the rules stop answering, as if the mapmaker had written in the margin: beyond this point, ask someone else.</p>
        <p>My mother never studied pi. She never needed to. When she told me the only truth there is, is God himself, I thought she was arguing with my maths. Maybe she was only pointing at its edges.</p>

        <p class="taj__closing">Perhaps the truth was never on the map at all, only waiting at its edges, where pi keeps walking and zero will not open the door.</p>
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
.taj__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 1800 / 1173; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj .taj__prose figure figcaption a { color: inherit; text-decoration: underline; text-decoration-color: var(--line); text-decoration-thickness: 1px; text-underline-offset: 3px; }
.taj__proof { margin: var(--space-34) 0; padding: var(--space-21) 0; list-style: none; border-top: var(--stroke) solid var(--ink); border-bottom: var(--stroke) solid var(--ink); counter-reset: proof; }
.taj__proof li { counter-increment: proof; display: grid; grid-template-columns: 34rem minmax(0, 1fr) minmax(0, auto); align-items: baseline; gap: 0 var(--space-21); padding: 7rem 0; }
.taj__proof li::before { content: counter(proof); color: var(--ink-soft); font: 400 13rem/1 var(--font-mono); }
.taj__proof-eq { font: 500 21rem/1.3 var(--font-mono); letter-spacing: -.01em; white-space: nowrap; }
.taj__proof-why { color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); text-align: right; }
.taj__proof li.is-result .taj__proof-eq { color: var(--signal-cobalt); font-size: 34rem; }
.taj__gasp { margin: 0 0 var(--space-21) !important; font: 500 var(--type-h2)/1 var(--font-display); letter-spacing: -.04em; }
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
  .taj__proof li { grid-template-columns: 26rem minmax(0, 1fr); }
  .taj__proof-eq { font-size: 18rem; white-space: normal; }
  .taj__proof-why { grid-column: 2; text-align: left; margin-top: 2rem; }
}
</style>
