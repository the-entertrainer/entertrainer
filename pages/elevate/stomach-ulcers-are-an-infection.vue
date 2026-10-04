<script setup lang="ts">
import { ULCER_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${ULCER_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: ULCER_BLOG.socialHook,
  ogTitle: ULCER_BLOG.socialTitle,
  ogDescription: ULCER_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${ULCER_BLOG.slug}`,
  ogImage: `https://entertrainer.in${ULCER_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: ULCER_BLOG.socialTitle,
  twitterDescription: ULCER_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${ULCER_BLOG.hero}`
})

const references = [
  {
    id: 1,
    title: 'Helicobacter — the ease and difficulty of a new discovery',
    source: 'J. Robin Warren, Nobel Lecture, 8 Dec 2005',
    href: 'https://www.nobelprize.org/uploads/2018/06/warren-lecture.pdf'
  },
  {
    id: 2,
    title: 'Helicobacter connections',
    source: 'Barry J. Marshall, Nobel Lecture, 8 Dec 2005',
    href: 'https://www.nobelprize.org/uploads/2018/06/marshall-lecture.pdf'
  },
  {
    id: 3,
    title: 'Unidentified curved bacilli in the stomach of patients with gastritis and peptic ulceration',
    source: 'Marshall & Warren, The Lancet, 16 June 1984',
    href: 'https://doi.org/10.1016/S0140-6736(84)91816-6'
  },
  {
    id: 4,
    title: 'Unidentified curved bacilli on gastric epithelium in active chronic gastritis',
    source: 'Warren & Marshall, The Lancet, 4 June 1983',
    href: 'https://doi.org/10.1016/S0140-6736(83)92719-8'
  },
  {
    id: 5,
    title: 'The Nobel Prize in Physiology or Medicine 2005',
    source: 'Press release, Nobel Assembly at Karolinska Institutet, 3 Oct 2005',
    href: 'https://www.nobelprize.org/prizes/medicine/2005/press-release/'
  },
  {
    id: 6,
    title: 'Helicobacter pylori: a Nobel pursuit?',
    source: 'Marshall, interviewed by Adams, Canadian Journal of Gastroenterology, 2008',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2661189/'
  },
  {
    id: 7,
    title: "Attempt to fulfil Koch's postulates for pyloric Campylobacter",
    source: 'Marshall, Armstrong, McGechie & Glancy, Medical Journal of Australia, April 1985',
    href: 'https://doi.org/10.5694/j.1326-5377.1985.tb113443.x'
  },
  {
    id: 8,
    title: 'Prospective double-blind trial of duodenal ulcer relapse after eradication of Campylobacter pylori',
    source: 'Marshall and colleagues, The Lancet, 24–31 Dec 1988',
    href: 'https://doi.org/10.1016/S0140-6736(88)90929-4'
  }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ ULCER_BLOG.category }} <span aria-hidden="true">·</span> {{ ULCER_BLOG.minutes }} min read</p>
      <h1>{{ ULCER_BLOG.title }}</h1>
      <p class="taj__dek">{{ ULCER_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="ULCER_BLOG.hero" :alt="ULCER_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>Hold this.</p>
        <p>One man, fourteen days, gastritis. Not a chronic ulcer in him.</p>
      </aside>

      <div class="taj__prose">
        <p class="taj__lead">In June 1979, Robin Warren examined a routine stomach biopsy in Perth and found a thin blue line he thought was bacteria.</p>
        <p>The slide was severe active chronic gastritis. On the ordinary stain the line looked like nothing much. Warren stained it with Warthin-Starry silver, and at high power the line was small curved and spiral bacilli, packed against the stomach lining.<a href="#ref-1" aria-label="Reference 1">[1]</a> He found them in about a third of the gastric biopsies that followed. Clinicians told him the stomach was sterile. If the bacteria were real, they said, they had only arrived after the inflammation.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>The acid theory</h2>
        <p>By 1982, when Barry Marshall was working beside Warren at Royal Perth Hospital, peptic ulcer already had an official cause. Too much acid, Marshall later wrote, blamed on personality, stress, smoking, or an inherited tendency. Cimetidine and ranitidine could heal most ulcers. Stop the drug and the ulcer usually returned. The other reliable option was to cut out the lower third of the stomach. About one in ten people who had that operation, he wrote, became “gastric cripples,” unable to enjoy food for the rest of their lives.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>

        <h2>The Perth biopsies</h2>
        <p>Warren had been collecting cases for about two years. Marshall, a young registrar told to find a project, was the first clinician who asked to see the slides.<a href="#ref-1" aria-label="Reference 1">[1]</a> From about August 1981 he biopsied intact antral mucosa, away from any ulcer, so a nearby crater could not explain the inflammation.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>In 1982 they studied 100 consecutive patients who agreed to a gastroscopy. Curved bacilli were in 58. All 13 with a duodenal ulcer carried them. Eighteen of 22 with a gastric ulcer did. Together, 27 of 31 ulcer patients were infected. The rows overlap, because some people had more than one finding.<a href="#ref-2" aria-label="Reference 2">[2]</a> Cultures from 11 biopsies grew a Gram-negative rod with flagella, related to Campylobacter but not a known species. It grew when oxygen was low.<a href="#ref-3" aria-label="Reference 3">[3]</a> On 16 June 1984 The Lancet published the series. The bacteria were present in almost all patients with active chronic gastritis, duodenal ulcer, or gastric ulcer, and might be an important factor in those diseases.<a href="#ref-3" aria-label="Reference 3">[3]</a> Letters on 4 June 1983 had already described the curved bacilli in active chronic gastritis.<a href="#ref-4" aria-label="Reference 4">[4]</a> Warren later wrote that the journal could not find a reviewer who believed the 1984 paper until Martin Skirrow repeated the work.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>The culture was five extra days. For months the lab threw the research plates away at 48 hours, as if they were throat swabs. Patient 37, a 70-year-old man with a duodenal ulcer, was biopsied on Thursday 8 April 1982, before Easter. A methicillin-resistant staph outbreak kept the bench busy, so nobody looked until Tuesday 13 April. Small transparent colonies had grown. John Pearman showed them to Marshall and admitted the earlier plates had been discarded.<a href="#ref-2" aria-label="Reference 2">[2]</a> The name Helicobacter pylori came later.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>

        <h2>The swallow</h2>
        <p>Skeptics still called the bacteria harmless guests in people whose ulcers had another cause. Marshall had no animal that developed the disease. In 1984 he decided the only person who could consent with full knowledge was himself. He did not ask an ethics committee. A refusal, he wrote later, would not have stopped him, and then he could not have published.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>A baseline endoscopy in early July 1984 found no infection. About three weeks later he swallowed the culture.<a href="#ref-6" aria-label="Reference 6">[6]</a> He skipped breakfast, took 400 milligrams of cimetidine to lower his acid, and drank a meat broth that Neil Noakes had loaded from one four-day culture plate. The beaker was 200 millilitres, about a quarter full. He finished it at 10 in the morning, in one gulp, and ate nothing else that day.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Three quiet days. Then fullness after dinner, and breath his wife called putrid. From about day five to day eight he woke at dawn and vomited clear liquid with no acid in it. On day ten, spiral bacteria were on the stain, and the next day the tissue was full of the organism and pus cells. On day fourteen eight samples showed no bacteria, only healing gastritis. He took the antibiotic tinidazole only after that endoscopy. The infection was already gone.<a href="#ref-2" aria-label="Reference 2">[2]</a> Later stories say his wife ordered the antibiotics and that they cured him. A 2008 interview still puts the tablets earlier, on her orders.<a href="#ref-6" aria-label="Reference 6">[6]</a> The Nobel lecture does not.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>The paper, in April 1985, was written in the third person. One volunteer, a normal lining, a mild illness of fourteen days, gastritis on day ten, largely gone by day fourteen. It proposed that the acute infection might become chronic and then predispose to peptic ulcer. It reported no ulcer in the volunteer.<a href="#ref-7" aria-label="Reference 7">[7]</a> Marshall later said he had expected to feel little and, if he was right, maybe an ulcer years afterward. What he proved in himself was gastritis.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>

        <h2>The Nobel lecture and the limits</h2>
        <p>Trials, not the swallow, carried the treatment claim. In 1988 Marshall, Warren, and colleagues followed 100 patients who had both a duodenal ulcer and the bacteria, with no maintenance therapy afterward. When the bacteria persisted, 61 percent of ulcers healed and 84 percent relapsed. When the bacteria were cleared, 92 percent healed and 21 percent relapsed over twelve months.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>In 1994, Marshall writes, a National Institutes of Health consensus meeting in Washington said the first step in peptic ulcer was to find Helicobacter pylori and eradicate it.<a href="#ref-2" aria-label="Reference 2">[2]</a> On 3 October 2005 the Nobel Assembly gave the Prize in Physiology or Medicine jointly to Marshall and Warren for the discovery of the bacterium and its role in gastritis and peptic ulcer disease. The press release said the infection causes more than 90 percent of duodenal ulcers and up to 80 percent of gastric ulcers. Most infections are silent. About 10 to 15 percent of infected people ever get a peptic ulcer. About half of all humans carry the organism. The cure it described is antibiotics plus drugs that suppress acid.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>Not every ulcer is the infection. In the 1982 series, four gastric-ulcer patients had normal stomach histology and were taking nonsteroidal anti-inflammatory drugs. When an ulcer appears without this bacterium, Marshall wrote, drugs of that kind are usually involved.<a href="#ref-2" aria-label="Reference 2">[2]</a> By 2008 he said that in Australia those drug ulcers were more than half of cases, and that the ulcer population there had fallen by 70 percent.<a href="#ref-6" aria-label="Reference 6">[6]</a> The 2005 press release also links the infection to stomach cancer and to a lymphoma of the stomach lining that can shrink when the bacteria are cleared.<a href="#ref-5" aria-label="Reference 5">[5]</a> In 2008 he said cure lowers cancer risk and does not erase it.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>

        <blockquote>
          <p>One swallow proved a pathogen. It did not prove an ulcer in the man who drank it.</p>
        </blockquote>

        <p class="taj__closing">Acid still matters, and so do the painkillers that injure a stomach with no infection in it. If those are separate causes, how many ulcers are still being treated as if they were one disease?</p>
        <p>Sit with the beaker. The ulcer people remember was not in that glass.</p>
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
.taj__margin-note { position: static; max-width: var(--measure); margin: 0 0 var(--space-21); padding: var(--space-13); background: var(--accent); color: var(--accent-ink); border: var(--stroke) solid var(--ink); border-radius: 0; font: 400 var(--type-body)/1.45 var(--font-body); }
.taj__margin-note p { margin: 0; }
.taj__margin-note p + p { margin-top: 10rem; }
.taj__margin-note p:first-child { font: 500 var(--type-meta)/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
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
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: var(--crop); }
  .taj__article { display: block; }
  .taj__margin-note { position: static; margin-bottom: var(--space-21); }
  .taj__prose h2 { margin-top: 52rem; }
}
</style>
