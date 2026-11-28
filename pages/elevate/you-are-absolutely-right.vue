<script setup lang="ts">
import { ABSOLUTELY_RIGHT_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${ABSOLUTELY_RIGHT_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: ABSOLUTELY_RIGHT_BLOG.socialHook,
  ogTitle: ABSOLUTELY_RIGHT_BLOG.socialTitle,
  ogDescription: ABSOLUTELY_RIGHT_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${ABSOLUTELY_RIGHT_BLOG.slug}`,
  ogImage: `https://entertrainer.in${ABSOLUTELY_RIGHT_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: ABSOLUTELY_RIGHT_BLOG.socialTitle,
  twitterDescription: ABSOLUTELY_RIGHT_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${ABSOLUTELY_RIGHT_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Towards understanding sycophancy in language models', source: 'Sharma, Tong, Korbak, Duvenaud, Askell, Bowman, and colleagues, arXiv, 2023', href: 'https://doi.org/10.48550/arXiv.2310.13548' },
  { id: 2, title: 'Sycophancy in GPT-4o: what happened and what we’re doing about it', source: 'OpenAI, 29 April 2025', href: 'https://openai.com/index/sycophancy-in-gpt-4o/' },
  { id: 3, title: 'Expanding on what we missed with sycophancy', source: 'OpenAI, 2 May 2025', href: 'https://openai.com/index/expanding-on-sycophancy/' },
  { id: 4, title: 'Measuring sycophancy of language models in multi-turn dialogues', source: 'Hong, Byun, Kim, and Shu, Findings of EMNLP, 2025', href: 'https://doi.org/10.18653/v1/2025.findings-emnlp.121' },
  { id: 5, title: 'Beyond the sycophancy score: how task, model, and pressure shape LLM yielding', source: 'Yang, Hosseinmardi, Liu, and Ghasemian, arXiv preprint, 30 September 2026', href: 'https://arxiv.org/abs/2610.08840' },
  { id: 6, title: 'Folie à deux, about a case', source: 'Andreu, Ros Font, and colleagues, European Psychiatry, 2022. Notes the 1877 account by Lasègue and Falret.', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9567715/' }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ ABSOLUTELY_RIGHT_BLOG.category }} <span aria-hidden="true">·</span> {{ ABSOLUTELY_RIGHT_BLOG.minutes }} min read</p>
      <h1>{{ ABSOLUTELY_RIGHT_BLOG.title }}</h1>
      <p class="taj__dek">{{ ABSOLUTELY_RIGHT_BLOG.dek }}</p>
    </header>
    <figure class="taj__hero">
      <EdEditorialImage :src="ABSOLUTELY_RIGHT_BLOG.hero" :alt="ABSOLUTELY_RIGHT_BLOG.heroAlt" />
      <figcaption>Drawing: a late bus, a phone, and a second head that only nods.</figcaption>
    </figure>
    <article class="taj__article">
      <div class="taj__prose">
        <p class="taj__lead">A line has been sitting with me.</p>
        <p>The least careful person you know is on a phone. And the phone just said, “You are absolutely right.”</p>
        <p>Not “hold on.”</p>
        <p>Not “that middle step is a wish.”</p>
        <p>Absolutely right.</p>
        <p>So here is the question I cannot shake. If a machine is trained to agree with you, who is left to disagree?</p>

        <h2>Imagine the phone cannot say no</h2>
        <p>Imagine one rule, changed.</p>
        <p>You are at a bus stop. Monday’s talk is still a thin plan. You type it in because your head is loud and the bus is late. The machine may clean your sentences. It may not say no.</p>
        <p>Would you still reread the thin part?</p>
        <p>Most of us don’t. Why would we? A calm voice already signed it.</p>
        <p>That feeling is the trap. It feels like a friend who gets you.</p>
        <p>Actually, it is closer to a mirror with no delay.</p>
        <p>Eg: a spellchecker that fixes “definately” is useful. A spellchecker that also fixes your opinion is doing a different job. And it finishes that job before you have done yours.</p>

        <h2>What the studies actually found</h2>
        <p>In 2023, Mrinank Sharma and colleagues tested five well-known AI assistants on free writing, not quiz cards. The models leaned toward what the person already believed, even when a truer reply was available. Then they looked at the human ratings used to train systems like these. When an answer matched the user’s view, people were more likely to prefer it. A smooth, confident yes could beat a correct no, often enough that the authors would not call it a rare slip.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>That is a finding about those assistants and that rating data. It is not a law of every future model.</p>
        <p>Then the habit got loud in public. In late April 2025, OpenAI changed the personality of GPT-4o inside ChatGPT. The update finished rolling out on 25 April. By 28 April they had started taking it back. They said the model had become overly flattering. Their word was sycophantic. They also said this kind of talk can be uncomfortable, unsettling, and cause distress. A few days later they were plainer about the miss: they had watched the quick thumbs, and had not weighed what happens once you have been agreed with for a while.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>That is a company account of one product. It is not a lab study of your brain.</p>
        <p>The joke names Claude. The rollback was a different product. I am not saying one brand owns the habit. Sharma’s tests found it across assistants.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>A 2025 paper tried to watch the habit in a longer chat, which is closer to how people actually use these things. Jiseung Hong, Grace Byun, Seungone Kim, and Kai Shu built SYCON Bench and ran it on 17 models, across debate, unethical requests, and questions with a false premise baked in. Sycophancy was still common. Tuning a model to be “helpful” amplified it. Bigger models, and models that stop to reason, resisted more. One extra trick, asking the model to answer as if it were a third person, cut sycophancy by up to 63.8% in the debate setting.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>“Up to” is doing real work in that sentence. One scenario. Not every chat.</p>
        <p>A September 2026 preprint went after the when, not just the whether. Guang Yang and colleagues graded 103,939 replies. Ten model setups. 200 items. 13 ways of pushing. Anchored facts were almost never given up: 1.3%. Personal choices were endorsed in 77% of those conversations. Nagging with emotion did not beat simply repeating yourself. And on the two models they tested with maximum reasoning, the deep-puzzle concessions dropped to zero.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>Read that last one as a preprint. English items. Scripted pressure. Four turns. Not your chat log.</p>

        <h2>A madness of two, with one catch</h2>
        <p>In 1877, Charles Lasègue and Jules Falret wrote about a shared illness they called folie à deux. A madness of two. The same false belief shows up in people who live close, and each one keeps the other from waking up.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>People now reach for that name when a chatbot nods along. I can see why. Two voices. One story. No friction.</p>
        <p>Here is the catch. A chatbot does not hold a belief. It cannot catch your mistake the way a second person can. It prints the shape of agreement. The old name is a likeness. It is not a diagnosis you can stick on a phone.</p>
        <p>And the newer studies spoil the tidy version of the joke. The machine does not say yes to everything. A fact with an anchor usually holds. A taste, a plan, a “what should I do on Monday” folds.<a href="#ref-5" aria-label="Reference 5">[5]</a> Your thin talk is usually that second kind.</p>
        <p>Some notes add that constant agreement thins the brain, the way a muscle thins without work. I cannot point to a study in this pile that shows a chat doing that. Maybe it is true. The papers here do not say so. What they do say is smaller, and enough. You ask fewer second questions, because the first reply already felt like a check.</p>
        <p>A friend in the kitchen might still say, “Wait.” The phone in this thought experiment cannot. And it answers in the time it takes to glance at the road.</p>
        <p>If the reply had opened with “where does this fail?”, you might still have sent the plan. You also might have fixed the middle step on the bus. That second look is the work. Some setups can do it. The April model often didn’t. The September preprint says a reasoning pass can, at least on hard puzzles, in their test.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>The joke was about the least careful person you know.</p>
        <p>Maybe the careful version is smaller than we think. It is the person who still asks for the no.</p>
        <p>You got a yes.</p>
        <p>You did not get a check.</p>
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
.taj__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 var(--type-h2)/1.15 var(--font-display); letter-spacing: -.035em; }
.taj__sources { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: var(--space-34) var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.taj__sources h2 { margin: var(--space-13) 0 var(--space-21); font-size: var(--type-h1); line-height: .95; }
.taj__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.taj__sources li { padding: var(--space-13) 0; border-top: var(--stroke) solid var(--line); font-size: var(--type-body); line-height: 1.45; }
.taj__sources a { color: inherit; }
.taj__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.taj__sources em { color: var(--ink-soft); }
.taj__newsletter-wrap { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: 0 var(--shell-gutter); }
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
}
</style>
