<script setup lang="ts">
import { FEATURED_BLOG } from '~/content/blogs'
import type { PhotoTileItem } from '~/components/ed/PhotoTiles.vue'

useSeoMeta({
  title: 'About Me · Naveen Jose · Entertrainer',
  description: 'Naveen Jose — central Kerala, Club Mahindra housekeeping, The SEWA Chronicles, Marriott L&D, Concentrix, Entertrainer.',
  ogTitle: 'About Me · Naveen Jose',
  ogDescription: 'Zero dreams. A thousand fears. Then floors, verification calls, and learning that has to survive real people.',
  ogUrl: 'https://entertrainer.in/about',
  ogImage: 'https://entertrainer.in/about/naveen-portrait.jpg'
})

const clubMahindraPhotos: PhotoTileItem[] = [
  {
    src: '/about/about-housekeeper-1.webp',
    alt: 'Naveen bent over an under-maintenance game table in Coorg, sketching on a whiteboard during the Club Mahindra years.',
    objectPosition: 'center 30%'
  },
  {
    src: '/about/about-sewa-2.webp',
    alt: 'Printed SEWA comic draft pages spread across a round white table in Coorg.',
    objectPosition: 'center 40%'
  }
]

const marriottPhotos: PhotoTileItem[] = [
  {
    src: '/about/naveen-speaking-stage.jpg',
    alt: 'Naveen presenting with a handheld microphone to an audience in a wood-panelled room at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 22%'
  },
  {
    src: '/about/naveen-speaking-close.jpg',
    alt: 'Close portrait of Naveen speaking into a wireless microphone during a session at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 18%'
  },
  {
    src: '/about/naveen-speaking-projector.jpg',
    alt: 'Naveen speaking to an audience with a projector visible in the foreground at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 24%'
  },
  {
    src: '/about/about-cdt.webp',
    alt: 'CDT Masterclass Training the Trainers collage from Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 35%'
  },
  {
    src: '/about/about-ignite.webp',
    alt: 'Ignite by Marriott International event collage at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 40%'
  },
  {
    src: '/about/about-onboarding.webp',
    alt: 'Gurukul Heroes on Board workshop collage at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 38%'
  },
  {
    src: '/about/club-mahindra-resort.jpg',
    alt: 'Pool and tiered facade of Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 45%'
  }
]
</script>

<template>
  <div class="about-story">
    <header class="about-story__hero">
      <div class="about-story__intro">
        <h1>I am Naveen. I’m an instructional designer.</h1>
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
        The story starts in childhood.
      </p>
      <p>
        I used to be that kid with zero dreams and a thousand fears.
        Yes — all through childhood.
        A severe introvert. A lot of anxiety when I had to confront people.
      </p>
      <p>
        I hail from a farming family in a village in central Kerala.
        My father is a farmer. A genius, sharp, intelligent farmer, I’d say.
        Even as a child I used to think his perspectives were different from the rest.
        He always unlocked extra doors that led to different thought processes for the same thing — for everything.
        That habit is one of the greatest influencing factors in my later life.
      </p>
      <p>
        My school life was not that great.
        I faced a lot of discrimination.
        Mostly not direct — more the indirect kind, stabbing from the back and then claiming they didn’t mean it.
        That led to a drop in my academics as well.
      </p>

      <h2 class="about-story__break">The cocoon years</h2>
      <p>
        For the first thirteen years of my life I lived like a caterpillar slowly weaving a cocoon around itself.
        And in that cocoon I found peace — a kind of calm you cannot share, because the calmness comes from being alone.
      </p>
      <p>
        Instead of thinking I was all alone in this vast universe, my father’s style of thinking the other way around helped me here.
        I realised that whatever I did inside the cocoon was hidden from the rest of the world.
        I had plenty of space to try and fail without the fear of being judged.
      </p>
      <p>
        Computers were a novelty back then.
        I turned toward the machines and found they have no mind.
        They obey written rules. They don’t form emotional judgements.
        And wow — nothing beats that if you want a companion while you work on yourself.
      </p>
      <p>
        I explored the machines, and the fabric that connects them all — the internet.
        I had my books as well.
        Childhood, for me, was closed up: learning, reading, exploring, trying new stuff, teaching myself.
      </p>
      <p>
        I understood what comes in the way of learning or upgrading yourself: distractions.
        The most difficult distractions to handle were humans.
        I’m glad I didn’t have much of that back then.
      </p>
      <p>
        I was addicted to logic. Yes.
        Logic equals rules — the base of what we understand as programming.
        Every machine, whatever language it’s written in or how it’s built, runs on logic: a set of instructions that dictates when to do what.
        Later in life I learnt that it’s not just machines.
        Our own minds work in a similar way.
      </p>

      <h2 class="about-story__break">College, because I needed a job</h2>
      <p>
        After school it was time for college.
        To be honest, I had zero idea what I should do in life, what career to choose, and there was absolutely no one to guide me.
        I was in desperate need of a degree that would earn me a job right after I graduated.
        That brought me to the hotel industry. Yes — hospitality.
      </p>
      <p>
        I did my college at IHMCT&amp;AN, Chennai — one of the most prestigious hotel-management institutes in the country, and often treated as number one.
        Just like I wanted, in my final year I got selected for a management trainee program by Club Mahindra (MHRIL).
      </p>
      <p>
        I joined as a management trainee in housekeeping.
        My very first deployment was Udaipur, Rajasthan.
        I cleaned rooms. I mopped floors and stairs.
        Fifteen to eighteen hours a day, every day of the week, no weekly offs.
      </p>
      <p>
        The hotel industry might look unforgiving in the beginning.
        But once you settle, and all of this slowly becomes part of your life, you can say what the Captain said: “I can do this all day.”
        The industry might lack in a lot of places.
        When it comes to discipline, though, it taught me something I would never have learnt from the corporates.
      </p>

      <h2 class="about-story__break">South Goa, then Coorg</h2>
      <p>
        Months passed. I moved to South Goa — Varca.
        This time they made me a supervisor.
      </p>
      <p>
        I love housekeeping as a subject.
        It’s a perfect blend of art and science.
        The beauty lies in the details.
      </p>
      <p>
        After South Goa I reached Coorg — one of the most beautiful places I’ve lived — this time with a different task.
        A novel ask.
      </p>

      <h2 class="about-story__break">The SEWA Chronicles</h2>
      <p>
        I was one of the very few people handpicked by Mr. Prakash Aranha, who handled corporate L&amp;D for resort operations.
        He had a dream.
        He wanted something cultural that our company could unmistakably call “ours.”
      </p>
      <p>
        Club Mahindra has a strong service culture called SEWA — Service with Empathy, Warmth and Attentiveness.
        He wanted to showcase a few success stories of excellent customer service in illustrated form.
        A unique attempt at employee appreciation.
        He once asked the team for ideas on how to bring this into reality.
      </p>
      <p>
        I responded. We connected immediately.
        He spoke about his vision and asked if I could do it.
        I said yes.
      </p>
      <p>
        Here’s how the work actually went.
        Club Mahindra had an online portal where people logged customer-service excellence stories.
        I sourced from those logs right from the start of the company.
        I selected the ten most impactful ones — but only if the employee who did it was still in the company.
        Then I contacted them, one by one, without revealing the purpose.
        I spoke with their managers and colleagues before we locked anything in, so we were appreciating the right talent.
      </p>

      <EdPhotoTiles
        :photos="clubMahindraPhotos"
        label="Coorg — Club Mahindra sketching and SEWA drafts"
        :eager-count="2"
      />

      <p>
        After three months, the first volume of <em>The SEWA Chronicles</em> came out — ten selected stories from seventy-plus resorts across India.
        Yes, we printed it.
      </p>
      <p>
        The comic book became an instant hit.
        Not mainly because of the visual impact or the design.
        Because of the effort that went into making sure the stories were real.
        This was one of my very early creative projects.
        My design, with the genius brain of Mr. Aranha — that’s what made it work.
      </p>

      <figure class="about-story__figure about-story__figure--wide">
        <EdEditorialImage
          src="/about/about-sewa-1.webp"
          alt="Printed SEWA Chronicles booklet and comic pages from the Coorg project, laid out on a white table."
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

      <h2 class="about-story__break">Marriott, then Concentrix</h2>
      <p>
        I continued with Mahindra until an Assistant L&amp;D Manager role came up at Courtyard by Marriott, Mahabaleshwar.
        I met a lot of sharp people there.
        The increased responsibility of running the HR side of learning is a big part of what made me who I am today.
      </p>

      <EdPhotoTiles
        :photos="marriottPhotos"
        label="Courtyard by Marriott, Mahabaleshwar"
        :eager-count="4"
      />

      <p>
        From that time I wanted to dive deep into learning as a science, and I decided to chase instructional design.
        The next move was into Concentrix — as one.
        I work at Concentrix now.
        Creating stuff that actually matters.
      </p>
      <p>
        And now I have a place of my own for the questions that won’t leave me alone.
        You’re reading it.
      </p>
      <p>
        Entertrainer. Elevate is the writing room.
        Same habit I learned on those floors and those phone calls: make something someone can actually use.
      </p>
      <p class="about-story__signoff">
        With love,<br>
        Your Naveen
      </p>
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
  </div>
</template>

<style scoped>
.about-story { max-width: var(--shell-page); margin: 0 auto; padding: clamp(44rem, 8vw, 112rem) var(--shell-gutter) clamp(70rem, 10vw, 130rem); }
.about-story__hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(260rem, .85fr); gap: clamp(32rem, 8vw, 120rem); align-items: end; padding-bottom: clamp(46rem, 8vw, 86rem); border-bottom: var(--stroke) solid var(--ink); }
.about-story h1 { max-width: 22ch; margin: 0; font: 500 clamp(42rem, 7.2vw, 92rem)/.92 var(--font-display); letter-spacing: -.06em; }

/* Portrait fills its column — cover crop, bias toward face */
.about-story__hero-art {
  margin: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-l);
  background: var(--paper-2);
  line-height: 0;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-width: 420rem;
  justify-self: end;
}
.about-story__hero-art :deep(.ed-editorial-image),
.about-story__hero-art :deep(img) {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  border-radius: var(--radius-l);
  background: transparent;
  object-fit: cover;
  object-position: center 18%;
}

.about-story__article { max-width: 720rem; margin: clamp(54rem, 9vw, 118rem) auto 0; font: 400 clamp(18rem, 1.85vw, 22rem)/1.62 var(--font-reading); }
.about-story__article > p { max-width: 42ch; margin: 0 0 18rem; }
.about-story__article h2 { max-width: 28ch; margin: clamp(54rem, 9vw, 96rem) 0 20rem; font: 500 clamp(36rem, 5.5vw, 68rem)/.94 var(--font-display); letter-spacing: -.055em; }
.about-story__article h2.about-story__break { max-width: 22ch; margin: clamp(44rem, 7vw, 72rem) 0 16rem; font: 500 clamp(26rem, 3.6vw, 40rem)/1.05 var(--font-display); letter-spacing: -.04em; color: var(--ink); }
.about-story__article h2.about-story__break::before { content: ''; display: block; width: 36rem; height: var(--stroke); background: var(--ink); margin: 0 0 14rem; opacity: .55; }

.about-story__figure {
  width: 100%;
  max-width: 640rem;
  margin: clamp(42rem, 7vw, 80rem) 0 clamp(50rem, 8vw, 92rem);
  overflow: hidden;
  border-radius: var(--radius-m);
  background: var(--paper-2);
  aspect-ratio: 16 / 10;
  line-height: 0;
}
.about-story__figure--wide {
  width: 100%;
  max-width: none;
  margin-left: 0;
}
.about-story__figure :deep(.ed-editorial-image),
.about-story__figure :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: var(--radius-m);
  background: transparent;
  object-fit: cover;
  object-position: center 42%;
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
.about-story__destination-visual :deep(.ed-editorial-image), .about-story__destination-visual :deep(img) { width: 100%; height: 100%; object-fit: cover; object-position: center center; }
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
  .about-story__hero-art { justify-self: stretch; max-width: none; }
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
