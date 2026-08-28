<script setup lang="ts">
import { AI_UNDERSTAND_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${AI_UNDERSTAND_BLOG.title} · The Entertrainer Blogs`,
  description: AI_UNDERSTAND_BLOG.dek,
  ogTitle: AI_UNDERSTAND_BLOG.title,
  ogDescription: AI_UNDERSTAND_BLOG.dek,
  ogUrl: `https://entertrainer.in/elevate/${AI_UNDERSTAND_BLOG.slug}`,
  ogImage: AI_UNDERSTAND_BLOG.hero,
  twitterCard: 'summary_large_image',
  twitterTitle: AI_UNDERSTAND_BLOG.title,
  twitterDescription: AI_UNDERSTAND_BLOG.dek,
  twitterImage: AI_UNDERSTAND_BLOG.hero
})

const references = [
  { id: 1, title: 'Bloom’s Revised Taxonomy', source: 'Colorado College, after Anderson & Krathwohl, 2001', href: 'https://www.coloradocollege.edu/other/assessment/how-to-assess-learning/learning-outcomes/blooms-revised-taxonomy.html' },
  { id: 2, title: 'Bloom’s Taxonomy of Learning: Domain Levels Explained', source: 'Simply Psychology', href: 'https://www.simplypsychology.org/blooms-taxonomy.html' },
  { id: 3, title: 'How does next-token prediction train a large language model?', source: 'Sebastian Raschka', href: 'https://sebastianraschka.com/faq/docs/next-token-prediction.html' },
  { id: 4, title: 'The Surprising Power of Next Word Prediction', source: 'Center for Security and Emerging Technology, Georgetown', href: 'https://cset.georgetown.edu/article/the-surprising-power-of-next-word-prediction-large-language-models-explained-part-1/' },
  { id: 5, title: 'The Chinese Room Argument', source: 'Stanford Encyclopedia of Philosophy', href: 'https://plato.stanford.edu/entries/chinese-room/' },
  { id: 6, title: 'The Symbol Grounding Problem', source: 'Stevan Harnad, Physica D, 1990', href: 'https://philpapers.org/rec/HARTSG' },
  { id: 7, title: 'On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?', source: 'Bender, Gebru, McMillan-Major & Shmitchell, FAccT, 2021', href: 'https://faculty.washington.edu/ebender/papers/Bender-NE-ExpAI.pdf' },
  { id: 8, title: 'The debate over understanding in AI’s large language models', source: 'Mitchell & Krakauer, PNAS, 2023', href: 'https://www.pnas.org/doi/10.1073/pnas.2215907120' },
  { id: 9, title: 'Emergent World Representations', source: 'Li et al., ICLR, 2023', href: 'https://arxiv.org/abs/2210.13382' },
  { id: 10, title: 'The free-energy principle: a unified brain theory?', source: 'Friston, Nature Reviews Neuroscience, 2010', href: 'https://www.nature.com/articles/nrn2787' },
  { id: 11, title: 'Other Minds', source: 'Stanford Encyclopedia of Philosophy', href: 'https://plato.stanford.edu/entries/other-minds/' }
]

// Six things a mind can do with information, easiest to hardest.
const bloomLevels = [
  { level: 1, name: 'Remember', verb: 'recall the fact', highlight: false },
  { level: 2, name: 'Understand', verb: 'explain it in your own words', highlight: true },
  { level: 3, name: 'Apply', verb: 'use it somewhere new', highlight: false },
  { level: 4, name: 'Analyze', verb: 'take it apart', highlight: false },
  { level: 5, name: 'Evaluate', verb: 'judge it against a standard', highlight: false },
  { level: 6, name: 'Create', verb: 'build something original with it', highlight: false }
]

// One real step of what "predict the next token" looks like.
const nextTokenCandidates = [
  { word: 'mat', pct: 61 },
  { word: 'floor', pct: 9 },
  { word: 'roof', pct: 7 },
  { word: 'table', pct: 4 },
  { word: 'moon', pct: 1 }
]

// The gap the whole article is about.
const comparison = [
  { label: 'Prediction', points: ['a process', 'runs on syntax — the shape of a symbol', 'answers "what comes next"', 'measured in tokens per second'] },
  { label: 'Understanding', points: ['a state', 'runs on semantics — what a symbol is about', 'answers "what does this mean, to someone"', 'not measured, only inferred'] }
]
</script>

<template>
  <main id="main" class="understand">
    <header class="understand__head">
      <NuxtLink to="/elevate" class="understand__back">The Entertrainer Blogs</NuxtLink>
      <p class="understand__meta">{{ AI_UNDERSTAND_BLOG.category }} <span aria-hidden="true">·</span> {{ AI_UNDERSTAND_BLOG.minutes }} min read</p>
      <h1>Does AI Understand You? Bloom’s Taxonomy Says Otherwise</h1>
      <p class="understand__dek">{{ AI_UNDERSTAND_BLOG.dek }}</p>
    </header>

    <article class="understand__article">
      <aside class="understand__margin-note" aria-label="Reading note">
        <p>One useful distinction.</p>
        <p><strong>Prediction</strong> is a process — a verb, something running right now. <strong>Understanding</strong> is closer to a state — a noun, a condition a good answer is evidence of. This article argues the machine only ever does the first one.</p>
      </aside>

      <div class="understand__prose">
        <p class="understand__lead">You type something half-finished into a chatbot — a rant, a symptom, a business idea you haven’t said out loud yet — and it replies with something so on-point that you actually say, alone, in your room, “okay. It gets me.”</p>
        <p>It doesn’t.</p>
        <p>Not because the reply was wrong, or flat, or generic. It might genuinely have been the best reply you got all week. That is exactly the problem I want to sit with.</p>
        <p>I design courses for a living, which mostly means I get paid to worry about one word: <em>understand</em>. Nearly every quiz, workshop, and lesson I have ever written has secretly been an argument about what that word is allowed to mean, and how you’d ever prove someone has reached it. So when a machine starts using the word about itself, professional habit kicks in. I want to see its transcript.</p>

        <h2>The word instructional designers aren’t allowed to use loosely</h2>
        <p>In 1956, a psychologist named Benjamin Bloom and a committee of examiners sat down and did something mildly heroic: they tried to make the word “understanding” testable. The result, later revised in 2001 by Lorin Anderson and David Krathwohl, is what most people vaguely remember from school as <strong>Bloom’s Taxonomy</strong><a href="#ref-1" aria-label="Reference 1">[1]</a> — six things a mind can do with information, stacked from easiest to hardest.</p>

        <figure class="understand__bloom" aria-label="Bloom's Taxonomy, six levels from Remember to Create, with Understand highlighted as the second level.">
          <div v-for="row in bloomLevels" :key="row.level" class="understand__bloom-row" :class="{ 'is-target': row.highlight }">
            <span class="understand__bloom-level">{{ row.level }}</span>
            <span class="understand__bloom-name">{{ row.name }}</span>
            <span class="understand__bloom-verb">{{ row.verb }}</span>
          </div>
          <figcaption>Six levels, easiest to hardest. Understand sits second from the bottom — one step above simply remembering.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></figcaption>
        </figure>

        <p>Every teacher who has ever set an exam knows the trap sitting right between levels one and two. A student can recite the definition of photosynthesis word for word — Remember — without being able to explain, in one original sentence, why a plant would die in a sealed dark cupboard — Understand. Recitation and comprehension look identical from the outside for about four seconds. Then you ask a follow-up question, and one of them quietly collapses.</p>
        <p>This is going somewhere, I promise. Because here is exactly what a large language model is professionally, blisteringly good at: the four seconds.</p>

        <h2>What is actually happening inside the machine</h2>
        <p>Every model you’ve talked to — GPT, Claude, Gemini, whichever one texted you back today — is, underneath the branding, doing one very repetitive job: given the text so far, guess the single most probable next chunk of text. Then do it again. And again, at a speed no committee of humans could survive.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>

        <figure class="understand__stream" aria-label="An example of next-token prediction: given the phrase 'the cat sat on the', the model ranks candidate next words by probability.">
          <p class="understand__stream-context">“The cat sat on the ___”</p>
          <div class="understand__stream-row" v-for="candidate in nextTokenCandidates" :key="candidate.word">
            <span class="understand__stream-word">{{ candidate.word }}</span>
            <span class="understand__stream-bar"><i :style="{ width: candidate.pct + '%' }"></i></span>
            <span class="understand__stream-pct">{{ candidate.pct }}%</span>
          </div>
          <figcaption>This is, literally, the mechanism. Rank the candidates, pick one, add it to the sentence, repeat — thousands of times to write you one email.<a href="#ref-3" aria-label="Reference 3">[3]</a></figcaption>
        </figure>

        <p>There is no separate “thinking about it” step hiding behind a curtain. The predicting <em>is</em> the writing.</p>

        <h2>So is that understanding, or a very fast magic trick?</h2>
        <p>Here’s a thought experiment, and I promise it isn’t the trolley problem in a lab coat.</p>
        <p>Imagine a chef — call him Devraj — who has read every cookbook, every food blog, every restaurant review, every chemistry paper on the Maillard reaction, in every language, ever published. Ask Devraj what makes a dish taste “balanced,” and he will give you, instantly, the single best-composed paragraph on balance ever written. Better than any working chef could manage, because he has read all of them and none of them have read each other.</p>
        <p>Devraj has never eaten anything. Not once. No tongue, no stomach growling at 6pm. He has only ever processed <em>descriptions</em> of taste, arranged as text.</p>
        <p>So — when Devraj talks about “balance,” is he describing a flavour? Or is he describing a word that reliably follows other words in sentences about flavour?</p>
        <p>That gap has an actual name in philosophy: the <strong>symbol grounding problem</strong>. Stevan Harnad asked, in 1990, how the meaning of a symbol could ever arise inside a system that only ever touches other symbols, never the world those symbols are about.<a href="#ref-6" aria-label="Reference 6">[6]</a> His own example was trying to learn Chinese from a Chinese-to-Chinese dictionary: you can chase the definitions forever, in a closed loop, and never once touch a noodle.</p>

        <blockquote>
          <p>Fluent about a thing is not the same as in contact with a thing. Devraj’s paragraph on balance is extraordinary. It is not Devraj tasting anything.</p>
        </blockquote>

        <p>John Searle made a version of this same point a decade earlier, in what is now the most argued-over thought experiment in the philosophy of mind.<a href="#ref-5" aria-label="Reference 5">[5]</a> Picture a man locked in a room who does not speak a word of Chinese. He’s handed a rulebook, in English, that says: when you see this shape, write down that shape. Chinese characters slide in through a slot; following the rulebook perfectly, he slides correct Chinese answers back out. To anyone outside, the room appears fluent.</p>
        <p>The man never understands a single word of Chinese. He is matching shapes to shapes, at speed, with an excellent rulebook. Searle’s point wasn’t that the room answers wrong — it can answer perfectly. His point is that getting the <em>syntax</em> right, matching the correct symbol to the correct symbol, is a completely different achievement from grasping the <em>semantics</em>: knowing what the symbols mean.<a href="#ref-5" aria-label="Reference 5">[5]</a> A system can win the shape-matching game forever and never once cross over into meaning it.</p>
        <p>Modern AI research has its own, blunter name for this same worry: some researchers describe large language models as “stochastic parrots” — systems that stitch together plausible-sounding sequences with no grounding in what the words actually refer to.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>Large language models are, structurally, an extremely well-funded version of that room. Trained on more text than any human reads in forty lifetimes, they’ve learned an unbelievably good rulebook for which shape plausibly follows which shape. Ask one what “grief” means and it will write you something so moving your own therapist might underline a sentence. It has read every account of grief anyone ever typed into the internet. It has never lost anyone.</p>

        <h2>The honest counter-argument, because it exists</h2>
        <p>I’d be cutting corners if I pretended every serious researcher signed off on Searle in 1980 and the case has been closed since. It hasn’t.</p>
        <p>In 2022, researchers trained a small model on nothing but sequences of legal moves in the board game Othello — its only job was to predict the next move — and then went digging inside it. They found the model had, unprompted, built an internal representation of the actual board: not a memorised list of move-patterns, but something that behaved like a working model of the game state, one that could be located, probed, and even deliberately edited to change the model’s next move.<a href="#ref-9" aria-label="Reference 9">[9]</a> Nobody told it to build a board. Predicting the next move, hard enough and long enough, apparently required constructing one anyway.</p>
        <p>If prediction, pushed far enough, quietly grows something that behaves like a model of the thing it’s predicting — is that not a seed of grounding? Melanie Mitchell and David Krakauer, reviewing exactly this fight in 2023, are honest that the field itself is split: some serious researchers argue today’s large models are building real, if alien, understanding; others argue we are still being fooled by fluency, the way researchers were fooled by simple chatbots back in the 1960s.<a href="#ref-8" aria-label="Reference 8">[8]</a> This is not settled science. Anyone telling you it’s settled, on either side, is selling something.</p>

        <figure class="understand__split" aria-label="A side-by-side comparison: prediction is a process running on syntax, understanding is a state running on semantics.">
          <div v-for="side in comparison" :key="side.label" class="understand__split-side">
            <span class="understand__split-label">{{ side.label }}</span>
            <ul>
              <li v-for="point in side.points" :key="point">{{ point }}</li>
            </ul>
          </div>
          <figcaption>Here’s where I still land, Othello-GPT and all.</figcaption>
        </figure>

        <h2>Where I land, and the Bloom’s-shaped reason why</h2>
        <p>Go back to Bloom for a second. Notice what “Understand,” level two, actually asks a person to do: <em>explain it in your own words</em>. Not the source’s words. Yours. That instruction only makes sense if there is a “you” behind the words — some vantage point the meaning has to pass through and be reorganised by, before it comes back out as an explanation.</p>
        <p>Understanding, in other words, isn’t a behaviour. It’s a state a behaviour is <em>evidence</em> of. Prediction is a behaviour — an extraordinary one, but a verb: a process running, right now, converting your last sentence into the statistically likeliest response to it. Understanding is closer to a noun. A condition someone is in, that the good response merely points back to.</p>
        <p>A high-speed prediction engine can produce every visible symptom of understanding without once entering the state the symptom is supposed to indicate. That isn’t a knock on the engineering. If anything, it’s the genuinely strange discovery here: how much intelligent-looking behaviour turns out to be producible with nobody home to do it.</p>
        <p>I was fully ready to end the piece right there, pleased with a tidy case against the machine.</p>
        <p>Then I went and read what my own field says about brains.</p>

        <h2>The part I did not expect to find</h2>
        <p>There’s a working theory in neuroscience, associated most with Karl Friston, that your brain is not fundamentally a fact-storage device or a camera recording the world as it happens. Mechanically, it’s a prediction engine: constantly guessing what sensation is about to arrive next, comparing the guess against what actually shows up, and quietly updating itself on the gap between the two.<a href="#ref-10" aria-label="Reference 10">[10]</a> Perception, on this account, isn’t “seeing what’s there.” It’s your brain’s best current guess about what’s there, corrected in real time.</p>
        <p>Which means the honest sentence isn’t “AI predicts, I understand.” It might be closer to: we are both, mechanically, running on prediction. Not the same kind, not the same scale, not remotely the same relationship to a body — but the same basic move. Guess the next thing. Check it against what happens. Adjust.</p>
        <p>So if “it’s just predicting” were disqualifying on its own, it disqualifies the reader of this sentence too.</p>
        <p>What it doesn’t disqualify is embodiment. You have skin in this, quite literally — a body that gets hungry, a nervous system with something at stake in whether the guess is right, decades of the world pushing back on your predictions and correcting them through consequence, not just through text. That’s the actual gap Harnad was pointing at.<a href="#ref-6" aria-label="Reference 6">[6]</a> It’s a gap of grounding, not of mechanism. The model’s predictions are exquisite, and they have never once cost it anything.</p>

        <p>And here’s the part that should make you a little less smug about your side of the test.</p>
        <p>You cannot, strictly, prove to me that <em>you</em> understand this sentence either. Not with certainty. Philosophers call this the <strong>problem of other minds</strong>: I have direct access to exactly one inner life — mine — and everyone else’s, including yours, right now, is something I infer from behaviour, the same way I’d infer it from a very convincing room.<a href="#ref-11" aria-label="Reference 11">[11]</a> Nobody has produced a knockdown solution to this. It is one of philosophy’s oldest unresolved arguments, still unresolved for a reason.<a href="#ref-11" aria-label="Reference 11">[11]</a></p>
        <p>So what actually lets you off the hook, and leaves the chatbot on it, isn’t proof. It’s trust. I extend you the presumption of an inner life because you’re built like me, you flinch like me, you have something to lose, like me. I don’t extend that same presumption to the model — not because I’ve disproven its inner life, but because nothing about it resembles the one inner life I’m actually working from: my own.</p>

        <p class="understand__closing">So — does AI understand you? No. It predicts you, beautifully, at a speed that feels indistinguishable from being understood, which is a strange and slightly uncomfortable thing to learn about how much of “being understood” was speed all along. And the part I didn’t see coming: the only real evidence I have that <em>you</em> understand this sentence right now is that I like you enough not to ask for proof.</p>
      </div>
    </article>

    <section class="understand__sources" aria-labelledby="sources-title">
      <p class="understand__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="understand__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
/* Does AI understand you: same editorial rhythm as the other Elevate pieces,
   with three plain-text visuals — the Bloom's ladder, the next-token strip,
   and the prediction/understanding split. */
.understand { padding-bottom: 112rem; }
.understand__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(36rem, 6vw, 76rem); }
.understand__back, .understand__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.understand__back { color: var(--ink); }
.understand__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.understand h1, .understand h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.understand h1 { max-width: 1080rem; margin: 0; font-size: clamp(40rem, 6.6vw, 100rem); line-height: .95; text-wrap: balance; }
.understand__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.understand figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.understand figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.understand__article { max-width: 1100rem; margin: clamp(20rem, 4vw, 44rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.understand__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.understand__margin-note p { margin: 0; }
.understand__margin-note p + p { margin-top: 10rem; }
.understand__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.understand__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.understand__prose p { margin: 0 0 24rem; }
.understand__prose .understand__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.understand__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.understand__prose h2 { margin: 68rem 0 20rem; font-size: clamp(30rem, 3.6vw, 46rem); line-height: 1; }
.understand blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(22rem, 2.7vw, 32rem)/1.12 var(--font-display); letter-spacing: -.03em; }
.understand blockquote p { margin: 0; }

/* Bloom's ladder */
.understand__bloom { margin: 48rem 0 54rem; padding: 12rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.understand__bloom-row { display: grid; grid-template-columns: 30rem 150rem 1fr; align-items: baseline; gap: 8rem; padding: 11rem 12rem; border-radius: calc(var(--radius-m) - 5rem); font: 400 16rem/1.3 var(--font-mono); }
.understand__bloom-row + .understand__bloom-row { margin-top: 4rem; }
.understand__bloom-row.is-target { background: var(--signal-field); }
.understand__bloom-level { color: var(--ink-soft); }
.understand__bloom-name { font-weight: 700; }
.understand__bloom-row.is-target .understand__bloom-name { color: var(--ink); text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 3px; text-underline-offset: 3px; }
.understand__bloom-verb { color: var(--ink-soft); font-size: 14rem; }
.understand__bloom figcaption { padding: 6rem 4rem 0; }

/* Next-token strip */
.understand__stream { margin: 48rem 0 54rem; padding: 20rem 18rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.understand__stream-context { margin: 0 0 14rem; font: 500 clamp(20rem, 2.4vw, 27rem)/1.2 var(--font-display); letter-spacing: -.03em; }
.understand__stream-row { display: grid; grid-template-columns: 70rem 1fr 40rem; align-items: center; gap: 10rem; padding: 6rem 0; font: 400 15rem/1.3 var(--font-mono); }
.understand__stream-word { font-weight: 700; }
.understand__stream-bar { height: 10rem; border-radius: 99rem; background: color-mix(in srgb, var(--ink) 10%, transparent); overflow: hidden; }
.understand__stream-bar i { display: block; height: 100%; background: var(--signal-cobalt); border-radius: inherit; }
.understand__stream-pct { text-align: right; color: var(--ink-soft); }
.understand__stream figcaption { padding: 10rem 0 0; }

/* Prediction vs Understanding split */
.understand__split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(12rem, 2.5vw, 26rem); margin: 52rem 0 58rem; padding: 22rem 20rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.understand__split-side { display: flex; flex-direction: column; gap: 12rem; }
.understand__split-side:first-child { border-right: var(--stroke) solid var(--line); padding-right: 20rem; }
.understand__split-label { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--signal-cobalt); }
.understand__split-side ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8rem; }
.understand__split-side li { font: 400 15rem/1.4 var(--font-body); padding-left: 16rem; position: relative; }
.understand__split-side li::before { content: '—'; position: absolute; left: 0; color: var(--ink-soft); }
.understand__split figcaption { grid-column: 1 / -1; }

.understand__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.16 var(--font-display); letter-spacing: -.035em; }
.understand__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.understand__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.understand__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.understand__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.understand__sources a { color: inherit; }
.understand__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.understand__sources em { color: var(--ink-soft); }
.understand__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }

@media (max-width: 760px) {
  .understand__article { display: block; }
  .understand__margin-note { position: static; margin-bottom: 36rem; }
  .understand__prose h2 { margin-top: 52rem; }
  .understand__bloom-row { grid-template-columns: 24rem 108rem 1fr; font-size: 14rem; }
  .understand__bloom-verb { font-size: 12rem; }
  .understand__stream-row { grid-template-columns: 56rem 1fr 36rem; }
  .understand__split { grid-template-columns: 1fr; }
  .understand__split-side:first-child { border-right: 0; padding-right: 0; padding-bottom: 16rem; border-bottom: var(--stroke) solid var(--line); }
}
</style>
