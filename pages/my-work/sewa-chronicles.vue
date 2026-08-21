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
    id: 'cover', kind: 'cover', src: 'cover',
    alt: 'The SEWA Chronicles cover: four resort staff around the title, calling out Service, Empathy, Warmth and Attentiveness.',
  },
  {
    id: 'opening', kind: 'narrative', eyebrow: 'BEFORE THE BOOK', title: 'I had never made anything this big.',
    body: [
      'I was working as a housekeeper when Club Mahindra asked for a sixteen-page comic. I was early in my career. The job was to take service stories and turn them into something people would actually read.',
      'I did not have a ready-made system for it. I had a notebook, the people around me, and a decision to take the work seriously.'
    ]
  },
  {
    id: 'brief', kind: 'narrative', eyebrow: 'THE BRIEF', title: 'The brief was simple. The work was not.',
    body: [
      'Find real service moments. Turn them into short comic stories. Make a book that could sit in a team space without feeling like another instruction sheet.',
      'The values were already known. The challenge was showing how they looked when someone had to make a choice.'
    ], credit: 'CLUB MAHINDRA · LEARNING & DEVELOPMENT · 2023'
  },
  {
    id: 'leap', kind: 'process', eyebrow: 'THE WORK', title: 'First, I needed stories that could carry a page.',
    body: ['A good story did not need to be dramatic. It needed a clear person, a real problem, and one moment of care that changed what happened next.'],
    steps: ['Talk to the people involved.', 'Write a short scene from what happened.', 'Plan the panel sequence.', 'Draw, letter, and lay out the final page.']
  },
  {
    id: 'floor', kind: 'narrative', eyebrow: 'THE MATERIAL', title: 'The stories were already there.',
    body: [
      'A guest stuck on the road. A child having a difficult evening. A bracelet left behind. A rainy day that could have stayed grey.',
      'These were not invented examples. They were moments from the resort floor. My job was to notice enough detail to make each one true on the page.'
    ]
  },
  {
    id: 'craft', kind: 'process', eyebrow: 'MAKING THE PAGES', title: 'The drawing came after the listening.',
    body: ['I wrote the moment down first. Then came the thumbnail, the panels, the lines, the lettering, the colour, and the corrections. Sixteen pages meant doing that again and again until the book felt whole.'],
    steps: ['A real moment.', 'A readable sequence.', 'A rough storyboard.', 'A finished comic page.']
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
    id: 'reflection', kind: 'narrative', eyebrow: 'AFTER THE LAST PAGE', title: 'Finishing it changed the next thing I said yes to.',
    body: [
      'The book showed me that I could take a real experience, give it shape, and make something other people could hold onto. That mattered more than having a polished portfolio piece.',
      'I still care about The SEWA Chronicles because I made it from the first conversation to the last page, while learning what I could handle by actually handling it.'
    ]
  },
  {
    id: 'back', kind: 'closing', eyebrow: 'CREDITS', title: 'The SEWA Chronicles',
    body: ['Concept, writing, illustration, and layout by Naveen Jose for Club Mahindra Learning & Development. Original artwork from the 2023 comic magazine.'],
    credit: 'READ FROM THE COVER ANY TIME'
  },
] as const
</script>

<template>
  <EdBookReader :pages="pages" label="The SEWA Chronicles immersive case-study book" return-to="/my-work" return-label="All projects" />
</template>
