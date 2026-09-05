<script setup lang="ts">
import { LIE_PERFECTLY_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${LIE_PERFECTLY_BLOG.title} · The Entertrainer Blogs`,
  description: LIE_PERFECTLY_BLOG.dek,
  ogTitle: LIE_PERFECTLY_BLOG.title,
  ogDescription: LIE_PERFECTLY_BLOG.dek,
  ogUrl: `https://entertrainer.in/elevate/${LIE_PERFECTLY_BLOG.slug}`,
  ogImage: `https://entertrainer.in${LIE_PERFECTLY_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: LIE_PERFECTLY_BLOG.title,
  twitterDescription: LIE_PERFECTLY_BLOG.dek,
  twitterImage: `https://entertrainer.in${LIE_PERFECTLY_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Accuracy of Deception Judgments', source: 'Bond & DePaulo, Personality and Social Psychology Review, 2006', href: 'https://doi.org/10.1207/s15327957pspr1003_2' },
  { id: 2, title: 'A Fresh View of the Veracity Effect in Deception Research: Bond and DePaulo Re-examined', source: 'Communication Research, 2025', href: 'https://doi.org/10.1177/00936502251316927' },
  { id: 3, title: 'Cues to Deception', source: 'DePaulo et al., Psychological Bulletin, 2003', href: 'https://doi.org/10.1037/0033-2909.129.1.74' },
  { id: 4, title: 'A World of Lies', source: 'The Global Deception Research Team, Journal of Cross-Cultural Psychology, 2006', href: 'https://doi.org/10.1177/0022022105282295' },
  { id: 5, title: 'Lying takes time: A meta-analysis on reaction time measures of deception', source: 'Suchotzki et al., Psychological Bulletin, 2017', href: 'https://doi.org/10.1037/bul0000087' },
  { id: 6, title: 'Detecting deception by manipulating cognitive load', source: 'Vrij et al., Trends in Cognitive Sciences, 2006', href: 'https://doi.org/10.1016/j.tics.2006.02.003' },
  { id: 7, title: 'Outsmarting the Liars: Toward a Cognitive Lie Detection Approach', source: 'Vrij et al., Current Directions in Psychological Science, 2011', href: 'https://doi.org/10.1177/0963721410391245' },
  { id: 8, title: 'Measuring the cognitive resources consumed per second for real-time lie-production and recollection: a dual-tasking paradigm', source: 'Hu et al., Frontiers in Psychology, 2015', href: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.00596/full' },
  { id: 9, title: 'Truth-Default Theory (TDT): A Theory of Human Deception and Deception Detection', source: 'Levine, Journal of Language and Social Psychology, 2014', href: 'https://doi.org/10.1177/0261927X14535916' },
  { id: 10, title: 'Truth-default theory and the psychology of lying and deception detection', source: 'Levine, Current Opinion in Psychology, 2022', href: 'https://doi.org/10.1016/j.copsyc.2022.101380' },
  { id: 11, title: 'Information Manipulation Theory 2: A Propositional Theory of Deceptive Discourse Production', source: 'McCornack et al., Journal of Language and Social Psychology, 2014', href: 'https://doi.org/10.1177/0261927X14534656' },
  { id: 12, title: 'Can We Be Honest? Cognition, Intention, Speech Production, and the Future of Deception Research', source: 'Morrison & McCornack, Journal of Language and Social Psychology, 2025', href: 'https://doi.org/10.1177/0261927X251364005' },
  { id: 13, title: 'Learning to lie: Effects of practice on the cognitive cost of lying', source: 'Van Bockstaele et al., Frontiers in Psychology, 2012', href: 'https://doi.org/10.3389/fpsyg.2012.00526' }
]

const visuals = {
  conversation: '/blog/how-to-lie-perfectly/conversation-women.jpg',
  gaze: '/blog/how-to-lie-perfectly/gaze-looking.jpg',
  typing: '/blog/how-to-lie-perfectly/typing-laptop.jpg',
  dualTask: '/blog/how-to-lie-perfectly/dual-task.svg',
  doctor: '/blog/how-to-lie-perfectly/doctor-patient.jpg',
  elders: '/blog/how-to-lie-perfectly/conversation-old.jpg'
}
</script>

<template>
  <main id="main" class="lie">
    <header class="lie__head">
      <NuxtLink to="/elevate" class="lie__back">The Entertrainer Blogs</NuxtLink>
      <p class="lie__meta">{{ LIE_PERFECTLY_BLOG.category }} <span aria-hidden="true">·</span> {{ LIE_PERFECTLY_BLOG.minutes }} min read</p>
      <h1>What It Would Take to Lie Perfectly</h1>
      <p class="lie__dek">{{ LIE_PERFECTLY_BLOG.dek }}</p>
    </header>

    <figure class="lie__hero">
      <EdEditorialImage :src="LIE_PERFECTLY_BLOG.hero" :alt="LIE_PERFECTLY_BLOG.heroAlt" />
      <figcaption>Perfect lying looks like a performance problem. The research keeps turning it into a bandwidth problem.</figcaption>
    </figure>

    <article class="lie__article">
      <aside class="lie__margin-note" aria-label="Reading note">
        <p>One useful hinge.</p>
        <p>A “perfect” lie is less about calm eyes than about spare attention — and about listeners who usually start by believing you.</p>
      </aside>

      <div class="lie__prose">
        <p class="lie__lead">Someone across the table is telling a story that fits a little too well.</p>
        <p>The timeline lines up. The details are neat. The voice is calm. No awkward laugh. No sudden interest in the floor tiles. If this were a movie, the camera would already be circling them, waiting for the tell.</p>
        <p>You watch their eyes anyway.</p>
        <p>Because somewhere between school corridors, crime dramas, and that uncle who swears he “just knows,” you absorbed a quiet rule: liars leak. Perfect liars don’t.</p>
        <p>Which raises a stranger question than “Is this person lying?”</p>
        <p>What would it actually take to lie <em>perfectly</em>?</p>
        <p>Not charmingly. Not well enough. Perfectly — as in: consistent under pressure, emotionally seamless, socially tuned, and invisible to the kind of scrutiny humans think they are good at.</p>

        <h2>Imagine a perfect liar machine</h2>
        <p>Imagine you could build one. Not a scammer. A machine.</p>
        <p>It would need at least four modules.</p>
        <p>First, <strong>memory</strong>: every invented detail stored, indexed, and ready for the follow-up question you forgot was coming. Where were you. Who else was there. What colour was the bag. What did you order. What did <em>they</em> order.</p>
        <p>Second, <strong>emotion</strong>: a dial that can suppress guilt, fear, delight, boredom — whatever the moment requires — without freezing the face into that weird “I am being natural” mask.</p>
        <p>Third, <strong>theory of mind</strong>: a live model of what the other person already knows, what they are likely to check, what would sound suspiciously polished, and what would sound boring enough to be believed.</p>
        <p>Fourth, <strong>cognitive spare capacity</strong>: enough leftover attention to keep speaking while also monitoring your own story, their face, the room, and the version of yourself you are performing.</p>
        <p>That is the thought experiment. Now notice what it assumes.</p>
        <p>It assumes a perfect lie is mainly a <em>performance</em> problem — like acting, but with higher stakes and worse rehearsal time.</p>
        <p>A lot of research suggests that framing is incomplete.</p>

        <figure class="lie__visual lie__visual--wide">
          <EdEditorialImage :src="visuals.conversation" alt="Two women sitting at a table outdoors, talking face to face against a city backdrop." />
          <figcaption>Everyday talk is not an interrogation. Image: <a href="https://commons.wikimedia.org/wiki/File:Pexels-photo-1181717.jpg" target="_blank" rel="noreferrer">Christina Morillo / Pexels</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a> (published before July 2018).</figcaption>
        </figure>

        <h2>What intuition gets wrong</h2>
        <p>Intuition treats lying like theatre and detection like spotting bad acting.</p>
        <p>Look away? Lying.<br>Fidget? Lying.<br>Too still? Also somehow lying.</p>
        <p>Across 75 countries and 43 languages, the Global Deception Research Team found a dominant pan-cultural stereotype: liars avert their gaze.<a href="#ref-4" aria-label="Reference 4">[4]</a> People really do believe the eyes are the leak.</p>
        <p>But belief is not evidence.</p>
        <p>In a large meta-analysis of behavioural cues, DePaulo and colleagues combined more than a thousand estimates across 158 possible tells. Many behaviours showed no clear link to deceit, or only weak ones. Liars were, on average, a bit less forthcoming, a bit less compelling, a bit more tense or negative — not cartoonishly shifty.<a href="#ref-3" aria-label="Reference 3">[3]</a> Gaze aversion, the world’s favourite tell, sits near the bottom of usefulness in that literature; later summaries put its average effect close to zero.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>So the first crack in “perfect lying” is this: most people are trying to hide from cues that do not reliably exist.</p>
        <p>Which means a huge amount of amateur deception energy is spent managing folklore.</p>

        <figure class="lie__visual lie__visual--portrait">
          <EdEditorialImage :src="visuals.gaze" alt="A woman outdoors looking off into the distance rather than toward the camera." />
          <figcaption>Looking away is the world’s favourite “tell.” On average, it barely tells. Image: <a href="https://commons.wikimedia.org/wiki/File:Woman_looking_into_distance_(Unsplash).jpg" target="_blank" rel="noreferrer">John-Mark Kuznietsov / Unsplash</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a> (published before June 2017).</figcaption>
        </figure>

        <h2>Lying is often extra work</h2>
        <p>Here is the scientific hinge.</p>
        <p>Truth-telling can be hard — especially when the truth is awkward, emotional, or socially expensive. But in many controlled settings, <em>adding</em> deception adds operations: suppress the true answer, construct or select an alternative, keep it consistent with known facts, and manage how it lands.</p>
        <p>A 2017 meta-analysis of 114 computerised reaction-time studies found a large average slowdown for lying versus truth-telling, even after correction for publication bias.<a href="#ref-5" aria-label="Reference 5">[5]</a> Lying took time. The effect was messy across paradigms, and it shrank when people were instructed to avoid detection — which is already a hint that “perfect” liars are partly people fighting their own latency.</p>
        <p>Interview researchers such as Aldert Vrij have pushed a related idea: if lying burns more cognitive fuel, then adding load — reverse-order recall, unexpected questions, secondary tasks — can widen the gap between liars and truth-tellers.<a href="#ref-6" aria-label="Reference 6">[6]</a><a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>A dual-task study made that tradeoff unusually concrete. Participants answered interview questions while tracking a randomly moving dot with a mouse. A frequency measure of how continuously they could adjust their tracking dropped more during lying than truth-telling, and more during first-time encoding than later retrieval. Their verbal consistency was also lower for lies — and worse still when the tracking task was running.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>Read that carefully.</p>
        <p>It is not “science proves you cannot lie.”</p>
        <p>It is closer to: under concurrent demand, fabrication and consistency compete for the same limited budget.</p>
        <p>That is what “perfect” would have to defeat.</p>

        <figure class="lie__diagram" aria-label="Diagram comparing attention budgets for truth-telling versus lying under a concurrent tracking task.">
          <EdEditorialImage :src="visuals.dualTask" alt="Original cream, black, and cobalt diagram: truth-telling uses less story bandwidth and leaves more for tracking; lying uses more story bandwidth and leaves less for tracking." />
          <figcaption>A dual-task sketch of the bandwidth problem: the story and the secondary task draw from the same account.</figcaption>
        </figure>

        <figure class="lie__visual lie__visual--wide">
          <EdEditorialImage :src="visuals.typing" alt="Close-up of hands typing on a laptop keyboard, suggesting concurrent cognitive work." />
          <figcaption>Extra operations cost attention — even when the face stays calm. Image: <a href="https://commons.wikimedia.org/wiki/File:Typing_on_a_laptop_(Unsplash).jpg" target="_blank" rel="noreferrer">Simon Hattinga Verschure / Unsplash</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a> (published before June 2017).</figcaption>
        </figure>

        <h2>The social cheat code: people start on your side</h2>
        <p>Now the part intuition almost never includes.</p>
        <p>You do not only need to perform the lie. You need to survive a listener. And listeners are not continuous lie scanners.</p>
        <p>Timothy Levine’s truth-default theory argues that honesty is the starting place of human communication. People generally tell the truth unless they have a reason not to, and people generally accept messages as honest unless something triggers suspicion.<a href="#ref-9" aria-label="Reference 9">[9]</a><a href="#ref-10" aria-label="Reference 10">[10]</a> In everyday talk, the thought “wait — is this false?” often does not even boot up.</p>
        <p>That sounds naive until you notice what communication would become without it.</p>
        <p>If every sentence required active verification, conversation would feel like airport security. Slow. Expensive. Exhausting. The truth-default is less a moral virtue than cognitive infrastructure.</p>

        <figure class="lie__visual lie__visual--wide">
          <EdEditorialImage :src="visuals.elders" alt="An older man and woman standing outdoors near a doorway, conversing while holding walking sticks." />
          <figcaption>Most conversations begin in belief, not audit mode. Image: <a href="https://commons.wikimedia.org/wiki/File:Old_people_conversing_(Unsplash).jpg" target="_blank" rel="noreferrer">Cristina Gottardi / Unsplash</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a> (published before June 2017).</figcaption>
        </figure>

        <p>This also helps explain a famous laboratory number.</p>
        <p>Across hundreds of studies, people asked to judge lies and truths in real time, without special aids, average about 54% accuracy — correctly calling truths more often than lies.<a href="#ref-1" aria-label="Reference 1">[1]</a> A 2025 reanalysis argues that this headline figure is easy to misread: it is tangled up with truth bias, the veracity effect, and experimental setups that often force 50/50 lie–truth base rates that do not match ordinary life.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>So if your definition of a perfect lie is “nobody ever notices,” reality offers an uncomfortable shortcut:</p>
        <p>Many imperfect lies succeed because nobody was hunting.</p>
        <p>That is not mastery. That is the default.</p>

        <blockquote>
          <p>Perfect lying is a myth of infinite bandwidth.</p>
        </blockquote>

        <h2>What the evidence actually shows</h2>
        <p>Put the pieces together and “perfect lying” starts looking less like a ninja skill and more like a stack of simultaneous constraints.</p>
        <p><strong>Constraint 1 — Content consistency.</strong> A lie is not one sentence. It is a branching tree of future questions. Dual-task work suggests consistency is one of the first things to wobble when attention is split.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p><strong>Constraint 2 — Cognitive load.</strong> In reaction-time and many interview paradigms, deception carries an average cost.<a href="#ref-5" aria-label="Reference 5">[5]</a><a href="#ref-6" aria-label="Reference 6">[6]</a> Novel, bald-faced fabrication seems especially expensive. The more your story has to be invented from scratch, the more the machine needs spare RAM.</p>
        <p><strong>Constraint 3 — Cue folklore.</strong> People monitor the wrong dashboard. Gaze, fidgeting, “looking nervous” — culturally sticky, weakly diagnostic on average.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a> A liar trying to look “honest” by starring in a documentary about eye contact is solving the wrong puzzle.</p>
        <p><strong>Constraint 4 — Listener psychology.</strong> Detection improves more when people seek diagnostic information and context than when they stare harder at cheeks and blink rate.<a href="#ref-9" aria-label="Reference 9">[9]</a><a href="#ref-10" aria-label="Reference 10">[10]</a> Perfect performance against cue-watching is partly theatre for an audience using a broken instrument.</p>
        <p><strong>Constraint 5 — Motivation backfire.</strong> DePaulo’s cue review found that cues can become <em>more</em> visible when people are highly motivated to succeed, especially when identity is on the line.<a href="#ref-3" aria-label="Reference 3">[3]</a> Wanting the lie to be perfect can itself make the performance noisier.</p>

        <figure class="lie__visual lie__visual--portrait">
          <EdEditorialImage :src="visuals.doctor" alt="A doctor sitting with a patient during a consultation, both engaged in conversation." />
          <figcaption>High-trust talk is the ordinary setting — not a lie-detection lab. Image: <a href="https://commons.wikimedia.org/wiki/File:Doctor_talking_with_a_patient.jpg" target="_blank" rel="noreferrer">National Cancer Institute / NIH</a>, U.S. government work (public domain).</figcaption>
        </figure>

        <p>So the honest thesis is not “lying is impossible.”</p>
        <p>People lie. Often. Sometimes casually. Sometimes skilfully.</p>
        <p>The honest thesis is: <strong>perfect lying is a myth of infinite bandwidth.</strong></p>
        <p>What usually works is not perfection. It is efficiency — staying close enough to truth, rehearsing the expensive parts, avoiding needless invention, and surfing the fact that most listeners are not in interrogation mode.</p>

        <h2>Where the tidy story breaks</h2>
        <p>If the article stopped here, it would oversell cognitive load as destiny.</p>
        <p>It is not.</p>
        <p>Information Manipulation Theory 2 (IMT2) argues that deceptive discourse is often incremental problem-solving, not a pre-planned alternative universe. On that view, lying is not intrinsically always harder than honesty. People frequently stay close to available truth, edit mid-utterance, and choose the communicative path of least resistance.<a href="#ref-11" aria-label="Reference 11">[11]</a><a href="#ref-12" aria-label="Reference 12">[12]</a> Commentaries on IMT2 explicitly challenge the idea that deception must be more load-inducing by nature.</p>
        <p>There is also evidence that practice can shrink the cost of lying in some laboratory tasks.<a href="#ref-13" aria-label="Reference 13">[13]</a> A repeated lie is not the same mental object as a fresh one. Hu and colleagues themselves note exceptions for repeated lies, and their dual-task findings are clearest for bald-faced, low-consequence fabrications in a specific sample.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>And the big accuracy meta-analyses are mostly about certain kinds of judgments under certain base rates.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> Life is not a DVD of strangers answering trivia while strangers vote “lie” or “truth.”</p>
        <p>So the competing interpretation matters:</p>
        <p>Sometimes the “perfect” move is not maximal acting.</p>
        <p>It is minimal invention.</p>
        <p>That is still not perfection. It is strategy under constraint.</p>

        <h2>What this is actually about</h2>
        <p>Strip away the crime-show lighting and the question becomes almost philosophical.</p>
        <p>Why do we want perfect lies to exist?</p>
        <p>Maybe because a perfect liar would prove something flattering about control: that a human mind can fully author social reality, edit the self in real time, and leave no residue.</p>
        <p>But minds are not clean editors. They are predictive, leaky, resource-limited systems running conversation on a trust protocol that assumes most packets are fine.</p>
        <p>A perfect lie would require you to outrun your own memory limits, your own emotional leftovers, your model of another mind, and the listener’s occasional decision to stop defaulting to belief — all at once.</p>
        <p>That is less like talent and more like trying to edit a document while the document is also editing you.</p>

        <h2>Return to the question</h2>
        <p>So: how do you lie perfectly?</p>
        <p>By the standards of folklore — calm eyes, locked story, zero tells — you mostly don’t. The tells people hunt are weak, and the work of fabrication is real enough that dual demands expose the budget.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-5" aria-label="Reference 5">[5]</a><a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>By the standards of social life — getting an imperfect falsehood accepted — you often “succeed” without perfection, because listeners begin in truth-default and only sometimes switch modes.<a href="#ref-9" aria-label="Reference 9">[9]</a><a href="#ref-10" aria-label="Reference 10">[10]</a></p>
        <p>By the standards of cognitive science, the closest thing to a perfect lie is probably not a masterpiece of performance. It is a small edit that stays near the truth, costs less to maintain, and never wakes the trigger that turns a conversation into an audit.<a href="#ref-11" aria-label="Reference 11">[11]</a></p>
        <p>Which means the title was a trap.</p>
        <p>The useful skill was never learning to lie perfectly.</p>
        <p>It was noticing that “perfect” was the wrong engineering target for a brain that runs on tradeoffs.</p>
        <p>Maybe the most honest sentence in the whole literature is also the least cinematic:</p>
        <p>A perfect lie would need more working memory than most moments are willing to lend you.</p>
        <p>And if that sounds unsatisfying, good.</p>
        <p class="lie__closing">Satisfaction is what a too-perfect story tries to sell.</p>
      </div>
    </article>

    <section class="lie__sources" aria-labelledby="sources-title">
      <p class="lie__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="lie__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
/* How-to-lie-perfectly: cream/black/cobalt Elevate feature rhythm — sticky margin note, drop-cap lead, wide and portrait visuals, dual-task diagram. */
.lie { padding-bottom: 112rem; }
.lie__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(36rem, 6vw, 76rem); }
.lie__back, .lie__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.lie__back { color: var(--ink); }
.lie__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.lie h1, .lie h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.lie h1 { max-width: 1080rem; margin: 0; font-size: clamp(48rem, 8vw, 122rem); line-height: .91; text-wrap: balance; }
.lie__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.lie__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.lie__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.lie figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.lie__article { max-width: 1100rem; margin: clamp(44rem, 8vw, 112rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.lie__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.lie__margin-note p { margin: 0; }
.lie__margin-note p + p { margin-top: 10rem; }
.lie__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.lie__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.lie__prose p { margin: 0 0 24rem; }
.lie__prose .lie__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.lie__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.lie__prose h2 { margin: 68rem 0 20rem; font-size: clamp(34rem, 4vw, 53rem); line-height: .98; }
.lie blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(25rem, 3vw, 37rem)/1.06 var(--font-display); letter-spacing: -.035em; }
.lie blockquote p { margin: 0; }
.lie__visual { position: relative; margin: 48rem 0 58rem; }
.lie__visual :deep(.ed-editorial-image) { display: block; overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.lie__visual :deep(img) { width: 100%; height: auto; object-fit: cover; }
.lie__visual--wide :deep(.ed-editorial-image) { aspect-ratio: 16 / 9; }
.lie__visual--portrait { max-width: 430rem; margin-left: auto; margin-right: 0; }
.lie__visual--portrait :deep(.ed-editorial-image) { aspect-ratio: 4 / 5; }
.lie__diagram { margin: 48rem 0 58rem; padding: 12rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.lie__diagram :deep(.ed-editorial-image) { display: block; width: 100%; background: #fffaf0; }
.lie__diagram :deep(img) { width: 100%; height: auto; }
.lie__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(26rem, 3vw, 40rem)/1.08 var(--font-display); letter-spacing: -.04em; }
.lie__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.lie__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.lie__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.lie__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.lie__sources a { color: inherit; }
.lie__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.lie__sources em { color: var(--ink-soft); }
.lie__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .lie__hero { padding: 0; }
  .lie__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .lie__hero figcaption { padding: 0 var(--shell-gutter); }
  .lie__article { display: block; }
  .lie__margin-note { position: static; margin-bottom: 36rem; }
  .lie__prose h2 { margin-top: 52rem; }
  .lie__visual { margin: 36rem 0 48rem; }
  .lie__visual--portrait { max-width: none; }
  .lie__visual--portrait :deep(.ed-editorial-image) { aspect-ratio: 16 / 10; }
}
</style>
