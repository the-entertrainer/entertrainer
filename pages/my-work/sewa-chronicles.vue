<script setup lang="ts">
/**
 * The SEWA Chronicles is an editorial book journey.
 * Every personal note, project detail, and comic page belongs to the reader.
 */
useSeoMeta({
  title: 'The SEWA Chronicles — a hand-drawn resort-floor comic by Naveen Jose',
  description: 'A personal account of making The SEWA Chronicles, a hand-drawn comic book for Club Mahindra, from stories gathered on the resort floor.',
  ogTitle: 'The SEWA Chronicles',
  ogDescription: 'A hand-drawn comic book made from real service stories on the resort floor.',
  ogUrl: 'https://entertrainer.in/my-work/sewa-chronicles',
  ogImage: 'https://entertrainer.in/work/sewa/cover.webp',
})

const pages = [
  {
    id: 'cover', kind: 'cover', eyebrow: 'CLUB MAHINDRA · 2023', title: 'The SEWA Chronicles',
    kicker: 'A hand-drawn comic book from the resort floor.', src: 'cover',
    alt: 'The SEWA Chronicles cover: four resort staff around the title, calling out Service, Empathy, Warmth and Attentiveness.',
  },
  {
    id: 'opening', kind: 'narrative', eyebrow: 'A PERSONAL NOTE', kicker: 'Before this became a project page', title: 'I was a housekeeper who said yes to a book.',
    body: [
      'I was early in my career and still working as a housekeeper when the opportunity arrived. The brief was not a small poster or a few slides. It was a complete comic book.',
      'That sounded far bigger than anything I had made before. I took it up anyway.'
    ], quote: 'I wanted to make something people would want to keep, not something they were asked to finish.'
  },
  {
    id: 'brief', kind: 'narrative', eyebrow: 'THE BRIEF', kicker: 'Service values, made visible', title: 'The values needed a place to live.',
    body: [
      'Service, empathy, warmth, and attentiveness were already part of the work. The difficult part was making them feel close to the people expected to practise them.',
      'A comic could begin where a slide deck usually stops: with a real person, a small decision, and what happened next.'
    ], credit: 'CLUB MAHINDRA · LEARNING & DEVELOPMENT'
  },
  {
    id: 'leap', kind: 'process', eyebrow: 'THE JOB I TOOK UP', title: 'Find the stories. Then make them worth keeping.',
    body: ['The work became a chain of small, careful jobs. None of it could be handed off if the book was going to feel like it came from the same pair of hands.'],
    steps: ['Listen to the people behind the stories.', 'Write each moment as a short comic script.', 'Storyboard every panel before drawing it.', 'Illustrate, letter, and lay out the finished book.']
  },
  {
    id: 'floor', kind: 'narrative', eyebrow: 'THE SOURCE', kicker: 'Nothing needed to be invented', title: 'The resort floor gave me the material.',
    body: [
      'The people in these pages were already doing the work. A guest with a broken car. A child at dinner. A lost bracelet. A rainy day that needed some colour.',
      'My part was to pay attention, choose the details that mattered, and turn those moments into pages others could read.'
    ], quote: 'The people in the book were never a device. They were the reason to make it.'
  },
  {
    id: 'craft', kind: 'process', eyebrow: 'MAKING THE BOOK', title: 'One story at a time.',
    body: ['The rhythm was simple and demanding: a conversation, a rough sketch, a tighter storyboard, line work, lettering, colour, then the next page. The book grew slowly because every spread had to carry a real person with care.'],
    steps: ['A true service moment.', 'A clear story beat.', 'A thumbnail made for reading.', 'A hand-drawn final page.']
  },
  {
    id: 'extra-mile', kind: 'comic', src: 'extra-mile', caption: 'Come Back to the Resort', tag: 'GOING THE EXTRA MILE',
    alt: 'Comic strip: a member’s car breaks down on the highway, and the front office arranges another car to bring him back to the resort.'
  },
  {
    id: 'rain', kind: 'comic', src: 'colors-in-the-rain', caption: 'Colors in the Rain', tag: 'CREATIVE RESTLESSNESS',
    alt: 'Comic strip: staff hand out colourful umbrellas on a grey rainy day, and guests share photos of them.'
  },
  {
    id: 'sesame', kind: 'comic', src: 'open-sesame', caption: 'Open Sesame', tag: 'CAN DO, WILL DO',
    alt: 'Comic strip: a guest is locked out of a room, and a front-office colleague opens the door without damage using a simple trick.'
  },
  {
    id: 'lost', kind: 'comic', src: 'lost-and-found', caption: 'Lost Yet Found', tag: 'OWNERSHIP',
    alt: 'Comic strip: a housekeeper finds a guest’s lost bracelet and returns it safely.'
  },
  {
    id: 'origami', kind: 'comic', src: 'towel-origami', caption: 'Towel Origami Magic', tag: 'ATTENTION TO DETAIL',
    alt: 'Comic strip: staff calm a crying child at dinner by folding a towel into an origami rabbit.'
  },
  {
    id: 'reflection', kind: 'narrative', eyebrow: 'WHAT STAYED WITH ME', title: 'It changed the scale of what I thought I could make.',
    body: [
      'This was one of my biggest early creative ventures. I was not only making visuals. I was writing, observing, choosing, drawing, and putting a complete object together for other people.',
      'It taught me that learning work can be authored. It can have a voice, a point of view, and a little bit of life in it.'
    ], quote: 'The SEWA Chronicles is still one of the projects I love most because I made the whole thing from the ground up.'
  },
  {
    id: 'back', kind: 'closing', eyebrow: 'THE SEWA CHRONICLES', kicker: 'A project by Naveen Jose', title: 'Made by hand. Held together by real stories.',
    body: ['Concept, writing, illustration, and layout by Naveen Jose for Club Mahindra Learning & Development. Original artwork from the 2023 comic magazine.'],
    credit: 'THANK YOU FOR READING'
  },
] as const
</script>

<template>
  <EdBookReader :pages="pages" label="The SEWA Chronicles immersive case-study book" return-to="/my-work" return-label="All projects" />
</template>
