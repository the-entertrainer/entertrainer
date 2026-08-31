<script setup lang="ts">
import { LIFE_MIDPOINT_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${LIFE_MIDPOINT_BLOG.title} · The Entertrainer Blogs`,
  description: LIFE_MIDPOINT_BLOG.dek,
  ogTitle: LIFE_MIDPOINT_BLOG.title,
  ogDescription: LIFE_MIDPOINT_BLOG.dek,
  ogUrl: `https://entertrainer.in/elevate/${LIFE_MIDPOINT_BLOG.slug}`,
  ogImage: `https://entertrainer.in${LIFE_MIDPOINT_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: LIFE_MIDPOINT_BLOG.title,
  twitterDescription: LIFE_MIDPOINT_BLOG.dek,
  twitterImage: `https://entertrainer.in${LIFE_MIDPOINT_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Paul Janet and Changes in the Apparent Speed of Passage of Time with Aging', source: 'Timing & Time Perception, 2022', href: 'https://brill.com/abstract/journals/time/10/3/article-p279_006.xml' },
  { id: 2, title: 'Logtime: Logarithmic Time Perception With Aging', source: 'James Main Kenney', href: 'https://kafalas.com/Logtime.html' },
  { id: 3, title: 'What is your earliest memory? It depends', source: 'Memory, 2021', href: 'https://www.tandfonline.com/doi/full/10.1080/09658211.2021.1918174' },
  { id: 4, title: 'The Fate of Childhood Memories: Children Postdated Their Earliest Memories as They Grew Older', source: 'Frontiers in Psychology, via PMC', href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4709485/' },
  { id: 5, title: 'Aging and the speed of time', source: 'Friedman & Janssen, Acta Psychologica, 2010', href: 'https://www.sciencedirect.com/science/article/abs/pii/S0001691810000132' },
  { id: 6, title: 'Why the Days Seem Shorter as We Get Older', source: 'Bejan, European Review, 2019', href: 'https://www.cambridge.org/core/journals/european-review/article/why-the-days-seem-shorter-as-we-get-older/2CB8EC9B0B30537230C7442B826E42F1' },
  { id: 7, title: 'On Soft Mathematical Models of Subjective Time Acceleration with Age', source: 'arXiv, 2023', href: 'https://arxiv.org/abs/2310.05945' },
  { id: 8, title: 'How does U.S. life expectancy compare to other countries?', source: 'Peterson-KFF Health System Tracker', href: 'https://www.healthsystemtracker.org/chart-collection/u-s-life-expectancy-compare-countries/' }
]

// sqrt(memory-onset age × 81) — the same formula, four different honest inputs.
const sensitivity = [
  { onset: '2.5', midpoint: '14' },
  { onset: '3.5', midpoint: '17' },
  { onset: '4', midpoint: '18' },
  { onset: '5', midpoint: '20' }
]
</script>

<template>
  <main id="main" class="mid">
    <header class="mid__head">
      <NuxtLink to="/elevate" class="mid__back">The Entertrainer Blogs</NuxtLink>
      <p class="mid__meta">{{ LIFE_MIDPOINT_BLOG.category }} <span aria-hidden="true">·</span> {{ LIFE_MIDPOINT_BLOG.minutes }} min read</p>
      <h1>The Midpoint of Your Life Isn't 40. It's 18.</h1>
      <p class="mid__dek">{{ LIFE_MIDPOINT_BLOG.dek }}</p>
    </header>

    <figure class="mid__hero">
      <EdEditorialImage :src="LIFE_MIDPOINT_BLOG.hero" :alt="LIFE_MIDPOINT_BLOG.heroAlt" />
    </figure>

    <article class="mid__article">
      <aside class="mid__margin-note" aria-label="Reading note">
        <p>One useful idea.</p>
        <p>Your brain doesn't log time in equal units. Each year registers as a fraction of the years you've already lived — which means, mathematically, your life runs on a <strong>logarithmic</strong> scale, not a linear one.</p>
      </aside>

      <div class="mid__prose">
        <p class="mid__lead">A video landed in front of me the other day. Thirty seconds, confident voice, one big number.</p>
        <p>It said: you think the middle of your life is 40. It's actually 18.</p>
        <p>My first reaction was the correct one. Excuse me?</p>
        <p>My second reaction was worse. I did the arithmetic myself, expecting to catch the video being clever with numbers.</p>
        <p>It wasn't. The maths is real. It's also not new — it's about 150 years old, it was never really "discovered," and the honest version of this claim comes with three asterisks the video didn't have time for.</p>

        <h2>The question underneath the number</h2>
        <p>Here's the assumption we're all quietly making: a year is a year. Age 4 to 5 is one unit. Age 40 to 41 is one unit. Same size, every time, because a clock doesn't care how old you are.</p>
        <p>Your clock doesn't. Your brain does.</p>
        <p>Actually, think about how a single summer holiday felt at age eight — endless, structurally significant, practically its own era — against how the last twelve months just... happened. Same twelve months, both times. Wildly different weight.</p>

        <h2>The theory is from 1877, and it's disarmingly simple</h2>
        <p>The French philosopher Paul Janet proposed an explanation for this in 1877, and it's one of those ideas that sounds almost too obvious once you hear it: the felt length of a year is proportional to how much life you've already lived.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Eg: to a 10-year-old, one year is a tenth of everything they've ever known. To a 50-year-old, that same 365 days is a fiftieth. Same calendar year. Different denominator.</p>
        <p>Run that idea forward mathematically — each year's subjective weight shrinking in proportion to your age — and you don't get a straight line. You get a logarithm. Time, experienced this way, front-loads. The early years take up disproportionate psychological space; the later ones compress toward each other, which is the actual mechanism behind that very ordinary complaint: <em>where did this year go.</em></p>

        <figure class="mid__diagram" aria-label="Two number lines for an 81-year life: a linear scale marking the midpoint at 40, and a logarithmic scale starting at age 4 marking the midpoint at 18.">
          <EdEditorialImage src="/blog/life-midpoint/linear-vs-log.svg" alt="An original diagram comparing a linear number line from 0 to 81 with the midpoint at 40, against a logarithmic number line from 4 to 81 with the midpoint at 18." />
        </figure>

        <h2>Where the "18" actually comes from</h2>
        <p>Midway on a logarithmic scale isn't the average of the two ends. It's the <strong>geometric mean</strong> — the number you'd multiply by itself to land exactly between them. For a scale running from a start age <em>s</em> to a life expectancy <em>L</em>, that midpoint is <code>√(s × L)</code>.</p>
        <p>Now the honest part: a pure logarithm has no zero. You can't start the scale at birth, because log(0) doesn't exist — mathematically, an infinite stretch of subjective time would sit between age 0 and age 1. So every version of this calculation quietly picks a starting age instead of using birth. The video used age 4, roughly where reliable autobiographical memory is usually said to begin.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Plug in 4 and 81: √(4 × 81) = √324 = <strong>18</strong>, exactly. That's not a coincidence or a rounding trick — those two numbers were chosen because they produce a clean answer. It's real maths, correctly done, sitting on top of a distinctly personal-blog trace: a <strong>Logtime</strong> model built by an engineer named James Main Kenney in the 1960s, who only later found out Janet had described the underlying idea a century earlier.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>

        <blockquote>
          <p>The formula is legitimate. The number "18" is one specific answer it gives — not the answer.</p>
        </blockquote>

        <h2>What happens when you change the inputs</h2>
        <p>The video presented 18 as though it were a constant of nature. It's the output of two choices: when memory starts, and how long you expect to live. Move either one, and the "true midpoint" moves with it.</p>
        <p>Take the memory-onset age. "4" is a reasonable, commonly cited figure — but it's contested. The traditional estimate for the average age of a person's earliest memory is closer to 3.5, and some more recent work puts it nearer 2.5.<a href="#ref-3" aria-label="Reference 3">[3]</a> Complicating it further, a longitudinal study that re-interviewed the same children found they systematically <em>postdated</em> their own earliest memories as they got older — the "first memory" people report as adults may not be reliably anchored to a fixed age at all.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>

        <figure class="mid__sensitivity" aria-label="How the calculated midpoint changes depending on which age you use for when memory begins, using the same formula each time.">
          <div v-for="row in sensitivity" :key="row.onset" class="mid__sensitivity-card" :class="{ 'is-video': row.onset === '4' }">
            <span class="mid__sensitivity-label">memory starts at</span>
            <strong class="mid__sensitivity-onset">{{ row.onset }}</strong>
            <span class="mid__sensitivity-arrow" aria-hidden="true">→</span>
            <span class="mid__sensitivity-label">midpoint is</span>
            <strong class="mid__sensitivity-mid">{{ row.midpoint }}</strong>
          </div>
          <figcaption>Same formula, same life expectancy, four defensible starting ages. "18" is the one that happens to come out a whole number.<a href="#ref-3" aria-label="Reference 3">[3]</a></figcaption>
        </figure>

        <p>The life-expectancy figure moves the answer too. 81 is a reasonable round number, close to several wealthy countries' averages, but it isn't a fixed global constant — current U.S. life expectancy sits nearer 80, the global average is closer to 73, and some high-income countries run past 82.<a href="#ref-8" aria-label="Reference 8">[8]</a> Swap in your own country's figure and your personal "18" quietly becomes a 17 or a 19.</p>

        <h2>Does the underlying feeling actually hold up?</h2>
        <p>Here's the part the video really didn't have time for: does time actually speed up the way the proportional theory predicts, or does it just feel that way in hindsight?</p>
        <p>A large study by William Friedman and Steve Janssen asked nearly 1,900 adults, aged 16 to 80, how fast the past week, month, year, and ten years felt like they'd gone.<a href="#ref-5" aria-label="Reference 5">[5]</a> Almost everyone, at every age, said the past week and month felt like they flew by — that part isn't an aging effect at all, it's just how short intervals feel to a brain in general. The clear age difference only showed up on the long span: older adults were far more likely to say the past decade had rushed past. The pure "everything speeds up smoothly, every day, from childhood onward" story oversells what the data shows. The effect is real, but it's mostly a long-lens phenomenon, not something you'd clock hour to hour.</p>

        <h2>A competing explanation, and an honest shrug</h2>
        <p>The proportional theory isn't the only account on the table, and it isn't obviously the winning one. Duke engineering professor Adrian Bejan has argued the cause is more physical than mathematical: as the neural pathways behind our eyes' rapid scanning movements (saccades) grow longer and slower with age, the brain simply processes fewer distinct mental images per second — so a day that once contained many perceived "frames" now contains fewer, and feels shorter for it.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>A 2023 mathematical review went further, testing several competing models against each other and concluding that a version built around the <em>declining novelty of experience</em> — familiar routines compressing subjectively, genuinely new experiences expanding — fit the pattern of decade-scale time acceleration better than the pure age-ratio version.<a href="#ref-7" aria-label="Reference 7">[7]</a> Its own conclusion is careful about this: these remain "soft," exploratory models, not a settled mechanism.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>So: real phenomenon, several plausible explanations, no single confirmed mechanism. That's an unglamorous sentence for a video that wants a clean 30-second payoff, and an accurate one.</p>

        <h2>What this is actually about</h2>
        <p>This was never really about proving 18, or 17, or 20.</p>
        <p>It's about what each of these theories agrees on even while disagreeing on the exact number: your twenties do not get equal billing with your fifties in your own memory, whatever the calendar says. Not because the twenties matter more as facts. Because — under the proportional account, the novelty account, or Bejan's frame-rate account — those are the years still doing the heaviest lifting in how "long" your life feels from the inside.</p>
        <p>Which points to something more useful than the number itself: if compressed, repetitive time is what makes decades vanish, the lever isn't a countdown to some invisible midpoint. It's novelty. New places, new skills, new difficulty — the kind of experience dense enough to leave a mark, at any age, not just before eighteen.</p>
        <p>So is the true midpoint of your life 18? Depends which starting age you plug in, which life expectancy you assume, and which of three competing theories you trust most.</p>
        <p class="mid__closing">What isn't in dispute is the mechanism underneath the headline: a brain that measures years in ratios, not units — which means the days that feel long right now are the ones actually worth having.</p>
      </div>
    </article>

    <section class="mid__sources" aria-labelledby="sources-title">
      <p class="mid__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="mid__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
/* Life midpoint: same editorial rhythm as the jamais-vu piece, plus a real
   hero image, an original two-number-line SVG diagram, and a four-card
   sensitivity grid showing how the "18" answer moves with its inputs. */
.mid { padding-bottom: 112rem; }
.mid__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(28rem, 5vw, 56rem); }
.mid__back, .mid__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.mid__back { color: var(--ink); }
.mid__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.mid h1, .mid h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.mid h1 { max-width: 1080rem; margin: 0; font-size: clamp(40rem, 6.6vw, 100rem); line-height: .95; text-wrap: balance; }
.mid__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.mid__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.mid__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.mid figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.mid figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.mid__article { max-width: 1100rem; margin: clamp(36rem, 6vw, 76rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.mid__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.mid__margin-note p { margin: 0; }
.mid__margin-note p + p { margin-top: 10rem; }
.mid__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.mid__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.mid__prose p { margin: 0 0 24rem; }
.mid__prose .mid__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.mid__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.mid__prose code { padding: 2rem 6rem; background: var(--paper-2); border: 1rem solid var(--line); border-radius: 5rem; font: 400 15rem/1 var(--font-mono); }
.mid__prose h2 { margin: 64rem 0 20rem; font-size: clamp(30rem, 3.6vw, 46rem); line-height: .98; }
.mid blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(22rem, 2.6vw, 32rem)/1.12 var(--font-display); letter-spacing: -.03em; }
.mid blockquote p { margin: 0; }

/* Original number-line diagram */
.mid__diagram { margin: 50rem 0 20rem; padding: 12rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.mid__diagram :deep(.ed-editorial-image) { display: block; width: 100%; height: auto; background: var(--paper-2); }
.mid__diagram :deep(img) { width: 100%; height: auto; object-fit: contain; }

/* Sensitivity grid */
.mid__sensitivity { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10rem; margin: 46rem 0 12rem; }
.mid__sensitivity-card { display: flex; flex-direction: column; align-items: flex-start; gap: 3rem; padding: 16rem 15rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.mid__sensitivity-card.is-video { background: var(--signal-field); }
.mid__sensitivity-label { font: 700 10rem/1.2 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); }
.mid__sensitivity-onset { font: 500 26rem/1 var(--font-display); letter-spacing: -.03em; }
.mid__sensitivity-arrow { color: var(--signal-cobalt); font-weight: 700; margin: 2rem 0; }
.mid__sensitivity-mid { font: 500 34rem/1 var(--font-display); letter-spacing: -.03em; color: var(--signal-cobalt); }
.mid__sensitivity figcaption { grid-column: 1 / -1; }

.mid__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.14 var(--font-display); letter-spacing: -.035em; }
.mid__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.mid__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.mid__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.mid__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.mid__sources a { color: inherit; }
.mid__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.mid__sources em { color: var(--ink-soft); }
.mid__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }

@media (max-width: 760px) {
  .mid__hero { padding: 0; }
  .mid__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .mid__article { display: block; }
  .mid__margin-note { position: static; margin-bottom: 36rem; }
  .mid__prose h2 { margin-top: 52rem; }
  .mid__sensitivity { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
