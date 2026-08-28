<script setup lang="ts">
import { MOONLY_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${MOONLY_BLOG.title} · The Entertrainer Blogs`,
  description: MOONLY_BLOG.dek,
  ogTitle: MOONLY_BLOG.title,
  ogDescription: MOONLY_BLOG.dek,
  ogUrl: `https://entertrainer.in/blogs/${MOONLY_BLOG.slug}`,
  ogImage: MOONLY_BLOG.hero,
  twitterCard: 'summary_large_image',
  twitterTitle: MOONLY_BLOG.title,
  twitterDescription: MOONLY_BLOG.dek,
  twitterImage: MOONLY_BLOG.hero
})

const references = [
  { id: 1, title: 'What is a Collateral Adjective?', source: 'Merriam-Webster', href: 'https://www.merriam-webster.com/grammar/meaning-of-collateral-adjective' },
  { id: 2, title: 'Collateral adjective', source: 'Wikipedia', href: 'https://en.wikipedia.org/wiki/Collateral_adjective' },
  { id: 3, title: 'Borrowing in Middle English', source: 'Towson University', href: 'https://tigerweb.towson.edu/duncan/brmideng.html' },
  { id: 4, title: 'Blocking (linguistics)', source: 'Wikipedia, after Aronoff, Word Formation in Generative Grammar, 1976', href: 'https://en.wikipedia.org/wiki/Blocking_(linguistics)' },
  { id: 5, title: 'Blocking effects', source: 'Embick, Benz & Paparounas, University of Pennsylvania', href: 'https://www.ling.upenn.edu/~embick/block-over-21.pdf' },
  { id: 6, title: 'moony, adjective', source: 'Merriam-Webster', href: 'https://www.merriam-webster.com/dictionary/moony' },
  { id: 7, title: 'moon, etymology', source: 'Online Etymology Dictionary', href: 'https://www.etymonline.com/word/moon' },
  { id: 8, title: 'lunar, etymology', source: 'Online Etymology Dictionary', href: 'https://www.etymonline.com/word/lunar' },
  { id: 9, title: '-ly, suffix etymology', source: 'Online Etymology Dictionary', href: 'https://www.etymonline.com/word/-ly' }
]

// The machine that works, and the three places it refuses.
const ladder = [
  { noun: 'friend', made: 'friendly', ok: true },
  { noun: 'love', made: 'lovely', ok: true },
  { noun: 'cost', made: 'costly', ok: true },
  { noun: 'day', made: 'daily', ok: true },
  { noun: 'moon', made: 'moonly', ok: false, real: 'lunar' },
  { noun: 'sun', made: 'sunly', ok: false, real: 'solar' },
  { noun: 'tooth', made: 'toothly', ok: false, real: 'dental' }
]

// Three arrivals, three registers, one meaning.
const tiers = [
  { word: 'ask', from: 'Old English', note: 'the kitchen' },
  { word: 'question', from: 'French', note: 'the courtroom' },
  { word: 'interrogate', from: 'Latin', note: 'the report' }
]
</script>

<template>
  <main id="main" class="moonly">
    <header class="moonly__head">
      <NuxtLink to="/elevate" class="moonly__back">The Entertrainer Blogs</NuxtLink>
      <p class="moonly__meta">{{ MOONLY_BLOG.category }} <span aria-hidden="true">·</span> {{ MOONLY_BLOG.minutes }} min read</p>
      <h1>Friend, friendly. Love, lovely. So why isn’t the Moon moonly?</h1>
      <p class="moonly__dek">{{ MOONLY_BLOG.dek }}</p>
    </header>

    <article class="moonly__article">
      <aside class="moonly__margin-note" aria-label="Reading note">
        <p>One useful word.</p>
        <p>A <strong>collateral adjective</strong> is an adjective that belongs to a noun by meaning, but is not descended from it. Moon and lunar are not relatives. They are colleagues.</p>
      </aside>

      <div class="moonly__prose">
        <p class="moonly__lead">English has a small machine for turning a noun into an adjective. You take the noun, you add <em>-ly</em>, and you walk away.</p>
        <p>Friend becomes friendly. Love becomes lovely. Cost becomes costly. A day becomes daily. Nobody teaches you this. You absorb it and then use it for the rest of your life without thinking about it once.</p>
        <p>So one evening someone points at the sky and asks why the Moon is not moonly.</p>
        <p>And you open your mouth to answer, and nothing comes out.</p>

        <figure class="moonly__ladder" aria-label="A list of nouns turned into adjectives with -ly, showing four that work and three that do not.">
          <ul>
            <li v-for="row in ladder" :key="row.noun" :class="{ 'is-blocked': !row.ok }">
              <span class="moonly__ladder-noun">{{ row.noun }}</span>
              <span class="moonly__ladder-arrow" aria-hidden="true">→</span>
              <span class="moonly__ladder-made">{{ row.made }}</span>
              <span class="moonly__ladder-verdict">
                <template v-if="row.ok">✓</template>
                <template v-else>✗ <em>{{ row.real }}</em></template>
              </span>
            </li>
          </ul>
          <figcaption>The suffix is free and sitting right there. English uses it, then stops without explaining why.</figcaption>
        </figure>

        <h2>The rule that suddenly develops opinions</h2>
        <p>This is the part that bothers me. It is not that English ran out of ways to make the word. Moonly is easy to say. You understood it instantly just now, and you have never once heard it in your life.</p>
        <p>Instead English hands you a completely unrelated word. Lunar. A word with no visible connection to the moon at all, unless you happen to know Latin.</p>
        <p>Same for the sun, which gets solar. Same for teeth, which get dental. Same for a cat, which gets feline.</p>
        <p>These pairs have a name. They are called <strong>collateral adjectives</strong>: adjectives tied to a noun by meaning while being completely unrelated to it by descent.<a href="#ref-1" aria-label="Reference 1">[1]</a> The word collateral is doing honest work here. It comes from the sense of belonging to the same family stock but not in a direct line — a cousin, not a child.<a href="#ref-1" aria-label="Reference 1">[1]</a> Moon and lunar are not parent and child. They are two people who happen to have the same job.</p>

        <h2>Imagine the law passes tonight</h2>
        <p>Try this. Suppose English passes a law at midnight: every adjective must be grown from its own noun. All borrowed ones are deleted.</p>
        <p>Tomorrow morning, astronomers study the <em>moonly</em> surface. Engineers install <em>sunly</em> panels. You book an appointment with a <em>toothly</em> surgeon. Your cat has excellent <em>catly</em> reflexes.</p>
        <p>Now notice your own reaction. Nothing there is broken. Every word obeys the rule you already use for friendly and lovely. It is not wrong.</p>
        <p>It just sounds like a nine-year-old explaining space.</p>
        <p>Which is the actual question. If the words are well-formed, and you understand them perfectly, what exactly did we lose?</p>

        <h2>English did build the word. It just gave it a different job.</h2>
        <p>Here is the thing that made me sit up, and it quietly dismantles the whole question.</p>
        <p>Moony is a real word. It has been in English since about 1586. And one of its listed meanings is, straightforwardly, relating to or resembling the moon.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>So English did make the native adjective. It has been sitting there for four centuries.</p>
        <p>But you would never write “a moony eclipse.” Because moony drifted. It now mostly means dreamy, moonstruck, a bit absent — the face of someone in love, not the surface of a rock.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>Basically, English did not have a gap. It had a staffing decision. Lunar took the observatory. Moony took the poetry.</p>

        <blockquote>
          <p>The Moon has two adjectives. One went into science. One went into longing. Nobody consulted the Moon.</p>
        </blockquote>

        <h2>Why English keeps three words for everything</h2>
        <p>To understand the decision, you have to look at how English got its vocabulary, which was less a design and more a series of arrivals.</p>
        <p>Old English was already here. Then Norman French arrived with the aristocracy, the courts and the schools. Then Latin arrived, and stayed, as the language of the church, scholarship and record-keeping.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>English did not replace the old words with the new ones. It stacked them. The result is that modern English often carries three words for one idea, on three levels: the popular one from English, the literary one from French, and the learned one from Latin.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <figure class="moonly__tiers" aria-label="Three English words for one idea, arriving from three languages and settling into three levels of formality.">
          <div v-for="tier in tiers" :key="tier.word" class="moonly__tier">
            <strong>{{ tier.word }}</strong>
            <span class="moonly__tier-from">{{ tier.from }}</span>
            <span class="moonly__tier-note">{{ tier.note }}</span>
          </div>
          <figcaption>Ask, question, interrogate. One meaning, three arrivals, three rooms you would use them in.<a href="#ref-3" aria-label="Reference 3">[3]</a></figcaption>
        </figure>

        <p>Rise, mount, ascend. Fire, flame, conflagration. Holy, sacred, consecrated.<a href="#ref-3" aria-label="Reference 3">[3]</a> Every time you pick one of these over the others, you are not just choosing a word. You are choosing a century, and a room.</p>
        <p>So when the Renaissance needed a serious adjective for the moon, it did not reach for the farmyard shelf. It reached for the Latin one. Lunar entered English in the early 1400s meaning crescent-shaped, and settled into “pertaining to the moon” by the 1620s.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>

        <h2>The traffic warden called blocking</h2>
        <p>There is also a quieter mechanism at work, and linguists have a name for it: <strong>blocking</strong>.</p>
        <p>The idea, as Aronoff put it, is the non-occurrence of one form due to the simple existence of another.<a href="#ref-4" aria-label="Reference 4">[4]</a> If a word is already doing a job, a perfectly good rule that would produce a rival word quietly gets stopped at the door.</p>
        <p>Eg: English has a productive way of making a doer out of a verb. Teach, teacher. Sing, singer. Steal, then — stealer? No. Thief already occupies that seat, so stealer never really gets to sit down.<a href="#ref-4" aria-label="Reference 4">[4]</a> Same with went, which blocks the perfectly logical goed.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>By this account, lunar is parked in the space moonly wanted, and moony has drifted to the other side of the room. The rule still works. It just has nowhere to put the result.</p>

        <h2>Where I have to be honest</h2>
        <p>Blocking is a tidy story, and tidy stories about language deserve suspicion.</p>
        <p>It is not a settled law. Embick and colleagues argue that in word-building of this kind, some forms are ill-formed on their own terms rather than because a rival word exists — that the rival is not always the reason.<a href="#ref-5" aria-label="Reference 5">[5]</a> Blocking is also leaky in plain sight: moony survived, and so did moonlit and moonlike, all sitting comfortably next to lunar without anyone being evicted.</p>
        <p>You will also see these pairs called “suppletive adjectives.” That usage exists, but it is a loose and arguably incorrect stretch of the word suppletive, which properly describes cases like good and better.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>So: not a law. A pressure. English leans, it does not legislate.</p>

        <h2>Two words, one rock, two theories</h2>
        <p>Now the part I actually wanted to tell you.</p>
        <p>Moon comes from Old English <em>mōna</em>, and traces back to a reconstructed root meaning “to measure” — the same root that gives us month. The moon was named for being the thing that counts time.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>Lunar comes through Latin <em>luna</em>, from a root meaning “light, brightness.” The same root shows up in Old Church Slavonic and Middle Irish words for moon and light.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>Read that again slowly.</p>

        <figure class="moonly__split" aria-label="The two words for the Moon come from two different ancient roots: one meaning to measure, one meaning light.">
          <div class="moonly__split-side">
            <span class="moonly__split-word">moon</span>
            <span class="moonly__split-root">from a root meaning <strong>“to measure”</strong></span>
            <span class="moonly__split-idea">the Moon as a clock</span>
          </div>
          <div class="moonly__split-rock" aria-hidden="true"><i></i></div>
          <div class="moonly__split-side">
            <span class="moonly__split-word">lunar</span>
            <span class="moonly__split-root">from a root meaning <strong>“light”</strong></span>
            <span class="moonly__split-idea">the Moon as a lamp</span>
          </div>
          <figcaption>Same object. Two ancestries. Two completely different answers to what the Moon is <em>for</em>.<a href="#ref-7" aria-label="Reference 7">[7]</a><a href="#ref-8" aria-label="Reference 8">[8]</a></figcaption>
        </figure>

        <p>One set of ancestors looked up and saw a calendar. Another set looked up and saw a lamp. English ended up holding both, and never told anyone.</p>
        <p>And the suffix has its own small secret. That <em>-ly</em> comes from Old English <em>-lic</em>, from a root meaning appearance, form, body.<a href="#ref-9" aria-label="Reference 9">[9]</a> So friendly did not originally mean “full of friendship.” It meant something closer to friend-shaped. Having the form of a friend.</p>
        <p>Which, if you have ever met certain people, is a distinction worth keeping.</p>

        <h2>What this is actually about</h2>
        <p>This was never really about the Moon.</p>
        <p>English is not one language pretending to be tidy. It is several centuries of arrivals, stacked, still holding their old jobs. The vocabulary remembers who was in the field and who was at the table — which is why we raise a cow and eat beef, one word from the farmers, one from the people being served.</p>
        <p>Words are sediment. You can read the layers if you dig.</p>
        <p>So why isn’t the Moon moonly?</p>
        <p>Because English already had a word for the Moon’s time and a word for the Moon’s light, and somewhere along the way it decided that one of them should put on a lab coat.</p>
        <p class="moonly__closing">Moony is still around. It just took the poetry instead of the astronomy — which, for something that spends every night hanging over the sea doing nothing in particular, is arguably the more moonly career.</p>
      </div>
    </article>

    <section class="moonly__sources" aria-labelledby="sources-title">
      <p class="moonly__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="moonly__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
/* Collateral adjectives: same editorial rhythm as the entropy piece, with three
   plain-text visuals — the -ly ladder, the register stack, and the split root. */
.moonly { padding-bottom: 112rem; }
.moonly__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(36rem, 6vw, 76rem); }
.moonly__back, .moonly__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.moonly__back { color: var(--ink); }
.moonly__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.moonly h1, .moonly h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.moonly h1 { max-width: 1080rem; margin: 0; font-size: clamp(44rem, 7.4vw, 112rem); line-height: .93; text-wrap: balance; }
.moonly__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.moonly figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.moonly figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.moonly__article { max-width: 1100rem; margin: clamp(20rem, 4vw, 44rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.moonly__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.moonly__margin-note p { margin: 0; }
.moonly__margin-note p + p { margin-top: 10rem; }
.moonly__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.moonly__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.moonly__prose p { margin: 0 0 24rem; }
.moonly__prose .moonly__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.moonly__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.moonly__prose h2 { margin: 68rem 0 20rem; font-size: clamp(32rem, 3.8vw, 50rem); line-height: .98; }
.moonly blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(24rem, 2.9vw, 35rem)/1.08 var(--font-display); letter-spacing: -.035em; }
.moonly blockquote p { margin: 0; }

/* The -ly ladder */
.moonly__ladder { margin: 48rem 0 54rem; padding: 12rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.moonly__ladder ul { margin: 0; padding: 0; list-style: none; }
.moonly__ladder li { display: grid; grid-template-columns: minmax(78rem, 1fr) 24rem minmax(96rem, 1.3fr) minmax(84rem, 1fr); align-items: baseline; gap: 8rem; padding: 11rem 12rem; border-radius: calc(var(--radius-m) - 5rem); font: 400 16rem/1.3 var(--font-mono); }
.moonly__ladder li + li { margin-top: 4rem; }
.moonly__ladder li.is-blocked { background: var(--signal-field); }
.moonly__ladder-noun { color: var(--ink-soft); }
.moonly__ladder-arrow { color: var(--signal-cobalt); }
.moonly__ladder-made { font-weight: 700; }
.moonly__ladder li.is-blocked .moonly__ladder-made { text-decoration: line-through; text-decoration-color: var(--signal-cobalt); opacity: .55; font-weight: 400; }
.moonly__ladder-verdict { text-align: right; font-size: 14rem; color: var(--ink-soft); }
.moonly__ladder-verdict em { font-style: normal; font-weight: 700; color: var(--ink); }
.moonly__ladder figcaption { padding: 6rem 4rem 0; }

/* Three registers */
.moonly__tiers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10rem; margin: 50rem 0 56rem; }
.moonly__tier { display: flex; flex-direction: column; gap: 7rem; padding: 18rem 16rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.moonly__tier:nth-child(1) { background: var(--paper-2); }
.moonly__tier:nth-child(2) { background: color-mix(in srgb, var(--signal-field) 70%, var(--paper)); }
.moonly__tier:nth-child(3) { background: var(--signal-field); }
.moonly__tier strong { font: 500 clamp(24rem, 2.7vw, 34rem)/.96 var(--font-display); letter-spacing: -.04em; }
.moonly__tier-from { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--signal-cobalt); }
.moonly__tier-note { font: 400 13rem/1.35 var(--font-mono); color: var(--ink-soft); }
.moonly__tiers figcaption { grid-column: 1 / -1; }

/* Two roots, one rock */
.moonly__split { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: clamp(12rem, 2.5vw, 26rem); margin: 52rem 0 58rem; padding: 22rem 18rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.moonly__split-side { display: flex; flex-direction: column; gap: 8rem; text-align: center; }
.moonly__split-word { font: 500 clamp(28rem, 3.4vw, 44rem)/.94 var(--font-display); letter-spacing: -.04em; }
.moonly__split-root { font: 400 13rem/1.4 var(--font-mono); color: var(--ink-soft); }
.moonly__split-root strong { color: var(--ink); }
.moonly__split-idea { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--signal-cobalt); }
.moonly__split-rock i { display: block; width: clamp(34rem, 5vw, 52rem); aspect-ratio: 1; border-radius: 50%; background: var(--accent); border: var(--stroke) solid var(--ink); box-shadow: inset -8rem -6rem 0 color-mix(in srgb, var(--ink) 12%, transparent); }
.moonly__split figcaption { grid-column: 1 / -1; text-align: center; }

.moonly__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(24rem, 2.8vw, 37rem)/1.1 var(--font-display); letter-spacing: -.04em; }
.moonly__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.moonly__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.moonly__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.moonly__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.moonly__sources a { color: inherit; }
.moonly__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.moonly__sources em { color: var(--ink-soft); }
.moonly__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }

@media (max-width: 760px) {
  .moonly__article { display: block; }
  .moonly__margin-note { position: static; margin-bottom: 36rem; }
  .moonly__prose h2 { margin-top: 52rem; }
  .moonly__ladder li { grid-template-columns: minmax(64rem, 1fr) 18rem minmax(80rem, 1.2fr); grid-template-areas: 'noun arrow made' '. . verdict'; font-size: 15rem; }
  .moonly__ladder-noun { grid-area: noun; }
  .moonly__ladder-arrow { grid-area: arrow; }
  .moonly__ladder-made { grid-area: made; }
  .moonly__ladder-verdict { grid-area: verdict; text-align: left; }
  .moonly__tiers { grid-template-columns: 1fr; }
  .moonly__split { grid-template-columns: 1fr; gap: 18rem; }
  .moonly__split-rock { justify-self: center; }
}
</style>
