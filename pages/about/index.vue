<script setup lang="ts">
import { FEATURED_BLOG } from '~/content/blogs'
import type { PhotoTileItem } from '~/components/ed/PhotoTiles.vue'

useSeoMeta({
  title: 'About Me · Naveen Jose · Entertrainer',
  description: 'Naveen Jose: a farming village in central Kerala, Club Mahindra housekeeping, The SEWA Chronicles in Coorg, Marriott L&D in Mahabaleshwar, and building Entertrainer.',
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
        Severe introvert. Anxiety that showed up before people did.
        Farming family. Village in central Kerala.
        Father: farmer. Quietly sharp. The kind of mind that finds a side door in a problem until the problem stops looking stuck.
        Later I understood he was my greatest influence. Not because he said so. Because the habit stuck.
      </p>
      <p>
        School was not great.
        Soft discrimination — the “didn’t mean it” kind.
        Academics dropped. I dropped with them.
      </p>

      <h2>Thirteen years inside a cocoon.</h2>
      <p>
        The first thirteen years felt like a caterpillar weaving its own cover.
        Alone. Peaceful in a way you cannot lend to anyone else.
        That calm does not photograph well. It also does not explain itself at family functions.
      </p>
      <p>
        My father read the cocoon differently.
        Not “alone in a vast universe.”
        Cover. A place to try and fail without an audience keeping score.
      </p>
      <p>
        Computers were still a novelty then.
        Machines have no mind. They obey rules. No emotional judgements.
        Best companion if you are trying to work on yourself without performing it.
      </p>
      <p>
        So I closed up and learned.
        Machines. Internet. Books. Exploring. Teaching myself.
        Human distraction was the hard part. I am glad I did not have much of it then.
      </p>
      <p>
        Logic became the addiction.
        Rules. Instructions. The base of programming.
        Machines run on that. Later I noticed minds want something similar — messier compiler, same hunger for structure.
      </p>

      <h2>No map. Just a degree that could earn a job.</h2>
      <p>
        Zero idea of career. No guidance worth the name.
        Practical question only: what pays.
        Answer: hospitality.
      </p>
      <p>
        IHMCT&amp;AN Chennai. Prestigious. Often treated as the number one hotel-management college in the country.
        I went. I studied. I still did not have a speech prepared about “calling.”
      </p>
      <p>
        Final year: Club Mahindra — MHRIL — management trainee in housekeeping.
        First posting: Udaipur.
      </p>
      <p>
        Rooms. Mopping floors. Stairs.
        Fifteen to eighteen hours. All days. No weekly offs.
        Hotels were unforgiving then. That was the point.
        Somewhere between the landings I thought, quietly: I can do this all day.
      </p>
      <p>
        South Goa, Varca: supervisor.
        I still love housekeeping as art plus science — the details guests register without knowing they registered them.
      </p>

      <h2>Coorg, and the calls that made the comic real.</h2>
      <p>
        Coorg was beautiful. That is the easy sentence.
      </p>
      <p>
        Prakash Aranha — corporate L&amp;D for resort ops — handpicked me.
        Brief: something Club Mahindra could call ours.
        SEWA — Service with Empathy, Warmth and Attentiveness — as illustrated employee appreciation.
        I said yes before I had a neat plan. Plans arrive after you start answering the phone.
      </p>
      <p>
        My glamorous creative process: portal logs from day one.
        Pick stories that actually moved someone — and only if that employee was still in the company.
        Call without revealing the purpose. Manager. Colleague. “Did this happen?”
        If the story survived the phone, it earned ink.
      </p>

      <EdPhotoTiles
        :photos="clubMahindraPhotos"
        label="Coorg — Club Mahindra sketching and SEWA drafts"
        :eager-count="2"
      />

      <p>
        About three months in: first volume of <em>The SEWA Chronicles</em>.
        Ten stories from seventy-plus resorts. Printed. Real.
        Early creative project — my design, Aranha’s vision.
        It hit because the verification was boring and ruthless. People could recognise themselves on the page.
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

      <h2>Mahabaleshwar: different room, same job underneath.</h2>
      <p>
        I stayed with Mahindra until I moved as Assistant L&amp;D Manager at Courtyard by Marriott, Mahabaleshwar.
        Rooms full of sharp people. Genius minds, if you want the short label.
        Carrying real HR-shaped responsibility shaped me more than any soft-skill workshop.
      </p>
      <p>
        Wood-panelled room. Handheld mic.
        My task was not to sound smart.
        It was to make the next shift slightly less chaotic than the last one.
      </p>

      <EdPhotoTiles
        :photos="marriottPhotos"
        label="Courtyard by Marriott, Mahabaleshwar"
        :eager-count="4"
      />

      <h2>Now I chase work that matters.</h2>
      <p>
        Instructional design pulled me next — Concentrix by day.
        Creating learning that has to survive contact with real people.
        Entertrainer and Elevate are what you are reading now: the same habit, different room.
      </p>

      <EdNote label="A note from me">
        <p>
          If you came looking for a neat arc — village kid, mop, comic, designer — close enough.
        </p>
        <p>
          The quieter continuity is this: I still trust systems that do not lie to me.
          Floors. Logs. Lessons. A page that holds when someone checks.
        </p>
        <p>
          That kid with a thousand fears did not become fearless.
          He just found better work for the fear — make something true enough that it can leave the room without you.
        </p>
        <p>
          If you want the comic, open SEWA above. If you want the thinking, open Elevate below.
          Either way — welcome.
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
