<script setup lang="ts">
import { FEATURED_BLOG } from '~/content/blogs'
import type { PhotoTileItem } from '~/components/ed/PhotoTiles.vue'

useSeoMeta({
  title: 'About Me · Naveen Jose · Entertrainer',
  description: 'Naveen Jose: a farming village in central Kerala, Club Mahindra housekeeping, The SEWA Chronicles in Coorg, Marriott L&D in Mahabaleshwar, Concentrix, and building Entertrainer.',
  ogTitle: 'About Me · Naveen Jose',
  ogDescription: 'Zero dreams, a thousand fears, then floors, verification calls, and learning design.',
  ogUrl: 'https://entertrainer.in/about',
  ogImage: 'https://entertrainer.in/about/naveen-portrait.jpg'
})

const clubMahindraPhotos: PhotoTileItem[] = [
  {
    src: '/about/about-housekeeper-1.webp',
    alt: 'Naveen bent over an under-maintenance game table in Coorg, sketching on a whiteboard during the Club Mahindra years.'
  },
  {
    src: '/about/about-sewa-2.webp',
    alt: 'Printed SEWA comic draft pages spread across a round white table in Coorg.'
  }
]

const marriottPhotos: PhotoTileItem[] = [
  {
    src: '/about/naveen-speaking-stage.jpg',
    alt: 'Naveen presenting with a handheld microphone to an audience in a wood-panelled room at Courtyard by Marriott, Mahabaleshwar.'
  },
  {
    src: '/about/naveen-speaking-close.jpg',
    alt: 'Close portrait of Naveen speaking into a wireless microphone during a session at Courtyard by Marriott, Mahabaleshwar.'
  },
  {
    src: '/about/naveen-speaking-projector.jpg',
    alt: 'Naveen speaking to an audience with a projector visible in the foreground at Courtyard by Marriott, Mahabaleshwar.'
  },
  {
    src: '/about/about-cdt.webp',
    alt: 'CDT Masterclass Training the Trainers collage from Courtyard by Marriott, Mahabaleshwar.'
  },
  {
    src: '/about/about-ignite.webp',
    alt: 'Ignite by Marriott International event collage at Courtyard by Marriott, Mahabaleshwar.'
  },
  {
    src: '/about/about-onboarding.webp',
    alt: 'Gurukul Heroes on Board workshop collage at Courtyard by Marriott, Mahabaleshwar.'
  },
  {
    src: '/about/club-mahindra-resort.jpg',
    alt: 'Pool and tiered facade of Courtyard by Marriott, Mahabaleshwar.'
  }
]
</script>

<template>
  <main id="main" class="about-story">
    <header class="about-story__hero">
      <div class="about-story__intro">
        <h1>I am Naveen, I’m an instructional designer.</h1>
      </div>
      <figure class="about-story__hero-art">
        <EdEditorialImage
          src="/about/naveen-portrait.jpg"
          alt="Illustrated portrait of Naveen Jose in ink on cream paper, adjusting sunglasses."
        />
      </figure>
    </header>

    <article class="about-story__article">
      <p>
        I was a kid with zero dreams and a thousand fears.
      </p>
      <p>
        Yes — all through childhood.
        Severe introvert. Anxiety that showed up before people did.
        Confronting anyone felt like walking into weather I had not packed for.
      </p>
      <p>
        I hail from a farming family in a village in central Kerala.
        My father is a farmer — sharp, intelligent, quietly dangerous in the best way.
        Even as a child I could tell his perspectives were different.
        Same problem, extra doors. Different thought processes until the stuck thing stopped looking stuck.
        That habit is one of the greatest influencing factors in my later life.
        Not because he announced it. Because it stuck.
      </p>
      <p>
        School was not great.
        Soft discrimination — the indirect kind that stabs from behind and claims it “didn’t mean it.”
        Academics dropped. I dropped with them.
      </p>

      <h2 class="about-story__break">The cocoon years.</h2>
      <p>
        For the first thirteen years I lived like a caterpillar slowly weaving a cocoon around itself.
        And in that cocoon I found peace — a kind of calm you cannot share, because the calmness comes from being alone.
      </p>
      <p>
        Alone in a vast universe, I thought.
        Then my father’s style of thinking flipped it.
        Whatever I did inside the cocoon was hidden from the rest of the world.
        Plenty of space to try and fail without an audience keeping score.
        Once I heard it that way, everything changed. Quietly. Permanently.
      </p>
      <p>
        Computers were still a novelty then.
        I turned toward the machines and found they have no mind.
        They obey written rules. They do not form emotional judgements about whether you are interesting enough today.
        Nothing beats that if you want to work on yourself without performing it.
      </p>
      <p>
        So I closed up and learned.
        Machines. The internet — the fabric that connects everything.
        Books. Exploring. Trying stuff. Teaching myself.
      </p>
      <p>
        Later I understood what gets in the way of upgrading yourself: distractions.
        The hardest ones are humans.
        I am glad I did not have much of that then.
      </p>
      <p>
        I got addicted to logic.
        Logic equals rules — the base of what we call programming.
        Every machine, whatever language or build, is instructions that dictate when to do what.
        Later I learnt that minds want something similar.
        Messier compiler. Same hunger for structure.
      </p>

      <h2 class="about-story__break">A degree that could earn a job.</h2>
      <p>
        After school: college time.
        Honest version — zero idea what I should do with my life.
        No career map. Absolutely no one to guide me worth the name.
        Practical need only: a degree that earns a job right after graduating.
        That brought me to hospitality.
      </p>
      <p>
        IHMCT&amp;AN, Chennai — one of the most prestigious, often treated as the number one hotel-management institute in the country.
        I went. I studied. I still did not have a speech prepared about “calling.”
      </p>
      <p>
        Final year: selected for Club Mahindra (MHRIL) as a management trainee in housekeeping.
        First deployment: Udaipur, Rajasthan.
      </p>
      <p>
        Cleaned rooms. Mopped floors and stairs.
        Fifteen to eighteen hours a day. All days. No weekly offs.
        The hotel industry looks unforgiving at the start.
        Once it settles into your body, you hear that line in your head: I can do this all day.
        Corporates never taught me discipline like that.
      </p>

      <h2 class="about-story__break">Then South Goa.</h2>
      <p>
        Months passed. South Goa — Varca.
        This time they made me a supervisor.
      </p>
      <p>
        I still love housekeeping as a subject.
        Perfect blend of art and science.
        The beauty sits in the details — the kind guests register without knowing they registered them.
        Goa gave me that room to care about the craft before the work shifted again.
      </p>

      <h2 class="about-story__break">Coorg — where SEWA started.</h2>
      <p>
        After Goa I reached Coorg.
        One of the most beautiful places I have lived.
        Different task this time. A novel ask.
      </p>
      <p>
        I was one of the few people handpicked by Mr. Prakash Aranha — corporate L&amp;D for resort operations.
        He had a dream: something cultural Club Mahindra could unmistakably call ours.
        SEWA — Service with Empathy, Warmth and Attentiveness — told as illustrated employee appreciation.
        A unique attempt at recognising real service, not slogans.
        He asked the team for ideas on how to bring it into reality.
      </p>
      <p>
        I responded. We connected immediately.
        He spoke his vision and asked if I could do it.
        I said yes before I had a neat plan.
        Plans arrived after the phone calls started.
      </p>
      <p>
        My glamorous creative process: portal logs from day one of the company.
        Pick the stories that actually moved someone — and only if that employee was still with us.
        Call without revealing the purpose. Manager. Colleague. “Did this happen?”
        If the story survived the phone, it earned ink.
      </p>

      <EdPhotoTiles
        :photos="clubMahindraPhotos"
        label="Coorg — Club Mahindra sketching and SEWA drafts"
        :eager-count="2"
      />

      <p>
        About three months in: the first volume of <em>The SEWA Chronicles</em>.
        Ten selected stories from seventy-plus resorts across India.
        Printed. Real.
      </p>
      <p>
        Instant hit — not because the visuals alone were pretty.
        Because the verification was boring and ruthless.
        People could recognise themselves on the page.
        Early creative project: my design, Aranha’s vision.
        That combination is why it landed.
      </p>

      <figure class="about-story__figure about-story__figure--wide">
        <EdEditorialImage
          src="/about/about-sewa-1.webp"
          alt="Printed SEWA Comics booklet and comic pages from the Coorg project, laid out on a white table."
        />
      </figure>

      <aside id="sewa-chronicles" class="about-story__sewa" aria-labelledby="sewa-title">
        <NuxtLink to="/my-work/sewa-chronicles" class="about-story__destination about-story__destination--sewa" aria-labelledby="sewa-title" aria-describedby="sewa-description">
          <figure class="about-story__destination-visual">
            <EdEditorialImage src="/work/sewa/cover.webp" alt="The SEWA Chronicles comic cover, showing four resort staff around the words Service, Empathy, Warmth and Attentiveness." />
          </figure>
          <div class="about-story__destination-copy">
            <h2 id="sewa-title">The SEWA Chronicles</h2>
            <p id="sewa-description">First volume from Coorg: ten verified SEWA stories from seventy-plus Club Mahindra resorts, printed as employee appreciation.</p>
            <span class="about-story__destination-action">Open The SEWA Chronicles</span>
          </div>
        </NuxtLink>
      </aside>

      <h2 class="about-story__break">Mahabaleshwar.</h2>
      <p>
        I stayed with Mahindra until an Assistant L&amp;D Manager role opened at Courtyard by Marriott, Mahabaleshwar.
        Different room. Same job underneath — help people do the next shift cleaner than the last one.
      </p>
      <p>
        Wood-panelled room. Handheld mic.
        Genius minds around the table — people who already knew their jobs better than any slide deck.
        My task was not to sound smart.
        It was to carry real HR-shaped responsibility without turning learning into theatre.
        That stretch shaped me more than any soft-skill workshop.
      </p>

      <EdPhotoTiles
        :photos="marriottPhotos"
        label="Courtyard by Marriott, Mahabaleshwar"
        :eager-count="4"
      />

      <h2 class="about-story__break">Concentrix, and this.</h2>
      <p>
        From Marriott I wanted to chase learning as a science — instructional design, properly.
        Next move: Concentrix.
        I work there now.
        Days spent making learning that has to survive contact with real people — not deck theatre, not vibes.
      </p>
      <p>
        Entertrainer and Elevate are what you are reading: the same habit in a different room.
        Turning operational detail into something someone can actually use.
        No Concentrix photo dump. You’re welcome.
      </p>

      <EdNote label="A note from me">
        <p>
          You define yourself — who you want to be.
          Age, caste, creed, religion… none of that should stop you from knowledge.
        </p>
        <p>
          Chase knowledge. It is the language of the gods.
        </p>
        <p>
          Once you have decided to chase it down, only the gods may stop you.
        </p>
        <p class="about-story__signoff">
          With love,<br>
          Your Naveen
        </p>
      </EdNote>
    </article>

    <footer class="about-story__close">
      <NuxtLink to="/elevate" class="about-story__destination about-story__destination--elevate" aria-labelledby="elevate-preview-title" aria-describedby="elevate-preview-description">
        <figure class="about-story__destination-visual">
          <EdEditorialImage :src="FEATURED_BLOG.hero" :alt="FEATURED_BLOG.heroAlt" />
        </figure>
        <div class="about-story__destination-copy">
          <h2 id="elevate-preview-title">{{ FEATURED_BLOG.title }}</h2>
          <p id="elevate-preview-description">{{ FEATURED_BLOG.dek }}</p>
          <span class="about-story__destination-action">Open Elevate</span>
        </div>
      </NuxtLink>
    </footer>
  </main>
</template>

<style scoped>
.about-story { max-width: var(--shell-page); margin: 0 auto; padding: clamp(44rem, 8vw, 112rem) var(--shell-gutter) clamp(70rem, 10vw, 130rem); }
.about-story__hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(260rem, .85fr); gap: clamp(32rem, 8vw, 120rem); align-items: end; padding-bottom: clamp(46rem, 8vw, 86rem); border-bottom: var(--stroke) solid var(--ink); }
.about-story h1 { max-width: 18ch; margin: 0; font: 500 clamp(42rem, 7.2vw, 92rem)/.92 var(--font-display); letter-spacing: -.06em; }

/* Plain photo — rounded corners only, no heavy frame */
.about-story__hero-art {
  margin: 0;
  min-height: 280rem;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-l);
  background: #F7F1E4;
}
.about-story__hero-art :deep(.ed-editorial-image),
.about-story__hero-art :deep(img) {
  width: 100%;
  height: 100%;
  min-height: 280rem;
  object-fit: contain;
  object-position: center top;
  display: block;
  border: 0;
  border-radius: var(--radius-l);
  background: #F7F1E4;
}

.about-story__article { max-width: 720rem; margin: clamp(54rem, 9vw, 118rem) auto 0; font: 400 clamp(18rem, 1.85vw, 22rem)/1.62 var(--font-reading); }
.about-story__article > p { max-width: 42ch; margin: 0 0 18rem; }
.about-story__article h2 { max-width: 28ch; margin: clamp(54rem, 9vw, 96rem) 0 20rem; font: 500 clamp(36rem, 5.5vw, 68rem)/.94 var(--font-display); letter-spacing: -.055em; }
.about-story__article h2.about-story__break { max-width: 22ch; margin: clamp(44rem, 7vw, 72rem) 0 16rem; font: 500 clamp(26rem, 3.6vw, 40rem)/1.05 var(--font-display); letter-spacing: -.04em; color: var(--ink); }
.about-story__article h2.about-story__break::before { content: ''; display: block; width: 36rem; height: var(--stroke); background: var(--ink); margin: 0 0 14rem; opacity: .55; }

.about-story__figure {
  width: min(100%, 560rem);
  margin: clamp(42rem, 7vw, 80rem) 0 clamp(50rem, 8vw, 92rem) auto;
}
.about-story__figure--wide {
  width: min(100%, 640rem);
  margin-left: calc(clamp(0rem, 8vw, 110rem) * -1);
}
.about-story__figure :deep(.ed-editorial-image),
.about-story__figure :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  max-height: 520rem;
  object-fit: contain;
  object-position: center center;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--paper-2);
}

.about-story__article :deep(.photo-tiles) {
  margin-left: calc(clamp(0rem, 6vw, 80rem) * -1);
  margin-right: calc(clamp(0rem, 6vw, 80rem) * -1);
  width: auto;
  max-width: none;
}

.about-story__signoff {
  margin-top: 22rem;
  font: 500 17rem/1.45 var(--font-reading);
}

.about-story__article :deep(.note) {
  max-width: 42ch;
  margin: clamp(48rem, 8vw, 88rem) 0 clamp(24rem, 4vw, 40rem);
}

.about-story__sewa { margin: clamp(54rem, 9vw, 100rem) calc(clamp(0rem, 5vw, 68rem) * -1); }
.about-story__destination { display: grid; grid-template-columns: minmax(180rem, .72fr) minmax(0, 1.28fr); color: var(--ink); overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); background: var(--signal-field); text-decoration: none; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring); }
.about-story__destination-visual { min-height: 260rem; margin: 0; overflow: hidden; border-right: var(--stroke) solid var(--ink); background: var(--paper-2); }
.about-story__destination-visual :deep(.ed-editorial-image), .about-story__destination-visual :deep(img) { width: 100%; height: 100%; object-fit: contain; }
.about-story__destination-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(24rem, 5vw, 48rem); }
.about-story__destination h2 { max-width: 18ch; margin: 0; font: 500 clamp(34rem, 4.2vw, 58rem)/.95 var(--font-display); letter-spacing: -.055em; }
.about-story__destination-copy > p { max-width: 43ch; margin: 16rem 0 0; font: 400 17rem/1.5 var(--font-reading); }
.about-story__destination-action { display: inline-flex; margin-top: 24rem; padding: 10rem 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); font: 800 14rem/1.1 var(--font-body); background: var(--accent); color: var(--accent-ink); }
.about-story__destination:hover, .about-story__destination:focus-visible { background: var(--paper); transform: translateY(-3rem); }
.about-story__destination:focus-visible { outline: 3rem solid var(--ink); outline-offset: 5rem; }
.about-story__close { display: grid; gap: 28rem; max-width: 720rem; margin: clamp(64rem, 10vw, 118rem) auto 0; padding-top: 30rem; border-top: var(--stroke) solid var(--ink); }
.about-story__destination--elevate { grid-template-columns: minmax(220rem, .86fr) minmax(0, 1.14fr); background: var(--paper); }
.about-story__destination--elevate .about-story__destination-visual { min-height: 230rem; }

@media (max-width: 700px) {
  .about-story__hero { grid-template-columns: 1fr; }
  .about-story__hero-art { min-height: 220rem; }
  .about-story__figure, .about-story__figure--wide { width: 100%; margin-left: 0; }
  .about-story__article :deep(.photo-tiles) { margin-left: 0; margin-right: 0; }
  .about-story__sewa { margin-left: 0; margin-right: 0; }
  .about-story__destination, .about-story__destination--elevate { grid-template-columns: 1fr; }
  .about-story__destination-visual { border-right: 0; border-bottom: var(--stroke) solid var(--ink); }
}

@media (prefers-reduced-motion: reduce) {
  .about-story__destination { transition: none; }
}
</style>
