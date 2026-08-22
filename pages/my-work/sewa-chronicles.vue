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
    id: 'opening', kind: 'narrative', title: 'Club Mahindra asked me to make sixteen comic pages.',
    body: [
      'At the time, I was working as a housekeeper and was still early in my career.',
      'The comic had to come from real service stories at the resort. I began by asking the people around me what had happened.'
    ]
  },
  {
    id: 'brief', kind: 'narrative', title: 'The book had to turn real service moments into short stories.',
    body: [
      'Club Mahindra wanted a comic that staff could read and discuss. Each page had to show what a service decision looked like in a specific moment.',
      'The values were already written down. I needed the pages to show a guest, a problem, and what a colleague did next.'
    ], credit: 'CLUB MAHINDRA · LEARNING & DEVELOPMENT · 2023'
  },
  {
    id: 'leap', kind: 'process', title: 'I began by asking staff what had happened.',
    body: ['A usable page needed a person, a real problem, and one decision. I wrote the incident as a short scene before I drew anything.'],
    steps: ['Talk to the person involved.', 'Write a short scene from what happened.', 'Plan the panel sequence.', 'Draw, letter, and lay out the page.']
  },
  {
    id: 'floor', kind: 'narrative', title: 'A stranded guest. A missing bracelet. A child at dinner.',
    body: [
      'There was also a rainy afternoon, when colleagues gave guests colourful umbrellas. None of these incidents were invented for the comic.',
      'They happened on the resort floor. My job was to notice enough detail to make each scene recognisable on the page.'
    ]
  },
  {
    id: 'craft', kind: 'process', title: 'I wrote the moment down before I drew it.',
    body: ['Then came the thumbnail, the panels, the lines, the lettering, the colour, and the corrections. I repeated that work sixteen times.'],
    steps: ['A real moment.', 'A readable sequence.', 'A rough storyboard.', 'A finished comic page.']
  },
  {
    id: 'extra-mile', kind: 'comic', src: 'extra-mile', caption: 'Come Back to the Resort',
    alt: 'Comic strip: a member’s car breaks down on the highway, and the front office arranges another car to bring him back to the resort.'
  },
  {
    id: 'rain', kind: 'comic', src: 'colors-in-the-rain', caption: 'Colors in the Rain',
    alt: 'Comic strip: staff hand out colourful umbrellas on a grey rainy day, and guests share photos of them.'
  },
  {
    id: 'sesame', kind: 'comic', src: 'open-sesame', caption: 'Open Sesame',
    alt: 'Comic strip: a guest is locked out of a room, and a front-office colleague opens the door without damage using a simple trick.'
  },
  {
    id: 'lost', kind: 'comic', src: 'lost-and-found', caption: 'Lost Yet Found',
    alt: 'Comic strip: a housekeeper finds a guest’s lost bracelet and returns it safely.'
  },
  {
    id: 'origami', kind: 'comic', src: 'towel-origami', caption: 'Towel Origami Magic',
    alt: 'Comic strip: staff calm a crying child at dinner by folding a towel into an origami rabbit.'
  },
  {
    id: 'reflection', kind: 'narrative', title: 'Sixteen pages were finished.',
    body: [
      'The book was written, illustrated, and laid out for Club Mahindra Learning and Development.',
      'It was the first time I took a commission from the first conversation through the final layout.'
    ]
  },
  {
    id: 'back', kind: 'closing', title: 'Credits',
    body: ['Concept, writing, illustration, and layout by Naveen Jose for Club Mahindra Learning and Development. Original artwork from the 2023 comic magazine.']
  },
] as const
</script>

<template>
  <EdBookReader :pages="pages" label="The SEWA Chronicles immersive case-study book" return-to="/my-work" return-label="All projects" />
</template>
