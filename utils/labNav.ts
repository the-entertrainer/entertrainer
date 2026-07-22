// Shared nav set for the hidden /lab homepage-concept prototypes. Mirrors the
// real home destinations so each concept feels like the actual site.
export interface LabItem { n: string; label: string; href: string; desc: string; img: string }

export const LAB_NAV: LabItem[] = [
  { n: '01', label: 'About',                href: '/about',                desc: 'The short story of how I got here — hospitality to L&D.', img: '/about-me.png' },
  { n: '02', label: 'Instructional Design', href: '/instructional-design', desc: 'How I think about learning that actually lands.',          img: '/instructional-design.png' },
  { n: '03', label: 'My Work',              href: '/my-work',              desc: 'Case studies, a comic, and the projects behind them.',    img: '/my-work.png' },
  { n: '04', label: 'Web Apps',             href: '/tools',                desc: 'Free tools I built for instructional designers.',         img: '/web-apps.png' }
]

export const LAB_CONCEPTS = [
  { n: '01', slug: 'liquid',    name: 'Liquid Displacement', blurb: 'Images melt into each other with a WebGL ripple.' },
  { n: '02', slug: 'ring',      name: 'Momentum Ring',       blurb: 'An infinite, physics-driven wheel you flick.' },
  { n: '03', slug: 'metaballs', name: 'Gooey Metaballs',     blurb: 'Liquid blobs that merge and drip open.' },
  { n: '04', slug: 'ink',       name: 'Fluid Ink Field',     blurb: 'Stir a cursor-reactive flow to reveal the nav.' },
  { n: '05', slug: 'type',      name: 'Morphing Type',       blurb: 'Giant serif that liquifies between sections.' },
  { n: '06', slug: 'ribbon',    name: 'Bent Ribbon',         blurb: 'A curved plane of cards that flexes to the cursor.' },
  { n: '07', slug: 'dolly',     name: 'Smooth Dolly',        blurb: 'A scroll-scrubbed cinematic push through depth.' },
  { n: '08', slug: 'peel',      name: 'Elastic Peel',        blurb: 'Peel and toss cards with spring physics.' },
  { n: '09', slug: 'portal',    name: 'Portal Morph',        blurb: 'A morphing liquid blob you dive through.' },
  { n: '10', slug: 'orbital',   name: 'Orbital Depth',       blurb: 'Float in 3D; drag to orbit, the near card snaps to focus.' }
]
