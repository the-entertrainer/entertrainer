<script setup lang="ts">
/**
 * The SEWA Chronicles is an editorial book journey.
 * Every personal note, project detail, and comic page belongs to the reader.
 */
useSeoMeta({
  title: 'The SEWA Chronicles — a hand-drawn comic built from real resort-floor stories by Naveen Jose',
  description: 'How I made The SEWA Chronicles for Club Mahindra: a hand-drawn comic built from stories gathered on the resort floor.',
  ogTitle: 'The SEWA Chronicles',
  ogDescription: 'A hand-drawn comic built from service stories gathered on the resort floor. The scenes were based on incidents colleagues shared with me.',
  ogUrl: 'https://entertrainer.in/my-work/sewa-chronicles',
  ogImage: 'https://entertrainer.in/work/sewa/cover.webp',
})

const pages = [
  {
    id: 'cover', kind: 'cover', src: 'cover',
    alt: 'The SEWA Chronicles cover: four resort staff around the title, calling out Service, Empathy, Warmth and Attentiveness.',
  },
  {
    id: 'opening', kind: 'narrative', title: 'Club Mahindra asked me for sixteen comic pages.',
    body: [
      'At the time, I was working as a housekeeper, still fairly early in my career.',
      'The comic had to come from real service stories at the resort. So I started with the obvious thing: asking the people around me what had actually happened.'
    ]
  },
  {
    id: 'brief', kind: 'narrative', title: 'The book had one job: turn real service moments into short stories people could follow.',
    body: [
      'Club Mahindra wanted something staff could read and discuss. Each page had to show what a service decision looked like when the moment was real and specific.',
      'The values were already written down. My task was to put them on the page: a guest, a problem, and the decision a colleague made next.'
    ], credit: 'CLUB MAHINDRA · LEARNING & DEVELOPMENT · 2023'
  },
  {
    id: 'leap', kind: 'process', title: 'I started by asking staff what had happened.',
    body: ['A usable page needed three things: a person, a real problem, and one decision. I wrote the incident as a short scene first. The drawing came later.'],
    steps: ['Talk to the person involved.', 'Write a short scene from what happened.', 'Plan the panel sequence.', 'Draw, letter, and lay out the page.']
  },
  {
    id: 'floor', kind: 'narrative', title: 'A stranded guest. A missing bracelet. A child at dinner.',
    body: [
      'There was also a rainy afternoon, when colleagues gave guests colourful umbrellas. None of these incidents were invented for the comic.',
      'They happened on the resort floor. My job was to notice enough detail that each scene still felt recognisable once it reached the page.'
    ]
  },
  {
    id: 'craft', kind: 'process', title: 'I wrote the moment down before I drew it.',
    body: ['Then came the thumbnail, the panels, the lines, the lettering, the colour, and the corrections. I repeated that whole chain sixteen times.'],
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
    id: 'reflection', kind: 'narrative', title: 'Sixteen pages were finished. The idea had survived contact with the actual work.',
    body: [
      'The book was written, illustrated, and laid out for Club Mahindra Learning and Development.',
      'It was the first time I carried a commission from the first conversation all the way to the final layout. No handoff. No disappearing act.'
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
