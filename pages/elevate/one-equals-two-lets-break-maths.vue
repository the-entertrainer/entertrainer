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
      <EdMarginNote label="A hidden division by zero">
        <p>The school lines that turn 2 into 1 divide by zero. Arithmetic does not allow that step.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">I was still in school, sitting on the kitchen floor with a notebook of long division, when my mother said what she always said.</p>
        <p>She was stirring a pot. "The only thing that exists," she said, "the only truth there is, is God himself."</p>
        <p>I put the pencil down. "No ma. Maths exists. It's the truth."</p>
        <p>My evidence was that two plus two was four on Monday and still four on Thursday, in our kitchen and, I assumed, on the Moon. God was harder to check.</p>
        <p>For years I treated that answer as settled. Maths looked like the system that never changed its mind. Maths is widely usable. The way we count, and the way we lean on the results, also depends on choices we made because they were convenient.</p>
        <p>While writing this, I still want maths to be the whole truth. The examples below are why that want does not hold.</p>

        <h2>We count in tens because we have ten fingers</h2>
        <p>One way to describe maths is that it gives names to positions and shapes, so we can say where something is. A cup is here. The Moon is about 384,000 kilometres away. A solid-looking world makes that naming job sound easy.</p>
        <p>We count in tens because we have ten fingers. The choice was not handed down as a law of nature. It was the count we already had when people counted goats.</p>
        <p>Other people used other counts. The Babylonians counted in sixties, a habit they inherited from the Sumerians, which is why an hour still breaks into sixty minutes and a minute into sixty seconds, about four thousand years later.<a href="#ref-1" aria-label="Reference 1">[1]</a> The Maya counted in twenties, probably using fingers and toes.<a href="#ref-2" aria-label="Reference 2">[2]</a> Three societies used three counts, and each count felt natural to the people who used it. A person raised on sixties would treat tens as a local habit.</p>
        <p>In 1491 an Italian arithmetic book by Filippo Calandri used two pages to show readers how to hold numbers on their hands, with bent fingers standing for values from 1 to 9,000.</p>

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

        <p>The grouping of our numbers is a choice. The things we measure with those numbers are a separate question. Pi is the example that broke my confidence.</p>

        <h2>Pi does not end in a repeating decimal</h2>
        <p>Pi is the ratio of the distance around a circle to the distance straight across it. Take a bangle, a chapati, or the rim of a steel tumbler. Measure around it, divide by the distance across, and the result is the same for every size. The result is a little more than three. Roll a wheel 1 metre across along the floor for one full turn, and the mark lands a little past 3 metres. The mark is not at 3, and it is not at 3.25. No ordinary ruler names the spot exactly.</p>
        <p>The decimal begins 3.14159265358979323846264338327950 and does not fall into a repeating pattern. In the 1760s Johann Heinrich Lambert proved that pi cannot be written as one whole number divided by another. In 1882 Ferdinand von Lindemann showed that pi is transcendental, meaning no polynomial equation with whole-number coefficients has pi as a root.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a> Changing from tens to Babylonian sixties or Maya twenties does not finish the expansion. In any whole-number base, the digits do not settle into a finite or repeating form.</p>
        <p>Pi appears wherever something turns or waves, including wheels, orbits, a pendulum, a ripple, and a sound wave. We use it every day, and we do not have a finished decimal for it.</p>
        <p>There are ways to compute more digits. In November 2025 a single server, running for about 110 days, computed pi to 314 trillion digits.<a href="#ref-5" aria-label="Reference 5">[5]</a> NASA's Jet Propulsion Laboratory has said that about 37 decimal places are enough to measure the circumference of the observable universe to within the width of a hydrogen atom.<a href="#ref-6" aria-label="Reference 6">[6]</a> The extra trillions of digits do not reach an end. The proofs say there is no end of that kind.</p>
        <p>Guinness World Records notes that every possible string of thirteen digits has been found somewhere in those 314 trillion digits.<a href="#ref-5" aria-label="Reference 5">[5]</a> A ten-digit phone number is shorter than that string, so a ten-digit number of that kind can appear in the expansion.</p>
        <p>If pi is what many mathematicians suspect, a normal number, then longer strings would keep appearing, including dates and names written as digits. Nobody has proved that pi is normal. Nobody has even proved that every digit appears forever.<a href="#ref-7" aria-label="Reference 7">[7]</a> The suspicion is not a proof.</p>

        <h2>The school lines that get 2 equals 1</h2>
        <p>The proof is older than the forums that still copy it.</p>

        <ol class="taj__proof" aria-label="A five-line proof that 2 equals 1">
          <li v-for="(line, i) in proof" :key="i" :class="{ 'is-result': line.result }">
            <span class="taj__proof-eq">{{ line.eq }}</span>
            <span v-if="line.why" class="taj__proof-why">{{ line.why }}</span>
          </li>
        </ol>

        <p>My first reaction was disbelief. I checked each line. Multiplying both sides is allowed. Subtracting the same amount from both sides is allowed. Factoring is the same move a teacher writes on a board. On the fifth line, (a - b) is removed from both sides at once.</p>
        <p>We began by saying a = b. So a - b is a number minus itself, which is zero. Removing that factor from both sides means dividing both sides by zero, and arithmetic does not allow that step.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>Division asks a multiplication question. Six divided by two asks which number, times two, gives six. The answer is three. Six divided by zero asks which number, times zero, gives six. No number does, because zero times any number is zero. Zero divided by zero asks which number, times zero, gives zero, and every number does. Line four of the trick was 0 = 0, which is true and does not pick a number. After you divide by zero, you can reach 2 = 1, or many other false results.</p>
        <p>The break is not a fault of base ten. The same lines fail at the same step in Babylonian sixties or Maya twenties. For a long period the Babylonians had no symbol for zero, and an empty gap in a row of wedges had to do that job.<a href="#ref-1" aria-label="Reference 1">[1]</a> After zero received a name, division by zero stayed forbidden.</p>

        <h2>What the kitchen argument can still say</h2>
        <p>Maths is a system of names and rules that measures many real things, and you should not throw the system away because it has edges. Someone chose the ten fingers. At the edges, the rules stop giving the finished answer a school exercise expects. A circle's ratio does not end as a finished decimal, and division by zero is not allowed.</p>
        <p>I still want a world where every question has an exact mark. The closer look finds places where the rules do not answer, including the unfinished decimal and the forbidden division.</p>
        <p>My mother never studied pi. When she said the only truth is God, I heard an argument against my maths. She may have been pointing at the questions the rules do not close.</p>

        <p class="taj__closing">Pi does not finish, and division by zero is not a legal step, so a tidy school proof can still print 2 = 1.</p>
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
.taj__proof li.is-result .taj__proof-eq { color: var(--ink); font-size: 34rem; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 5px; text-underline-offset: 7px; text-decoration-skip-ink: none; }
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
  .taj__proof li.is-result .taj__proof-eq { font-size: 28rem; }
  .taj__proof-why { grid-column: 2; text-align: left; margin-top: 2rem; }
}
</style>
