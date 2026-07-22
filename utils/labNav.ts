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
  { n: '01', slug: 'contents', name: 'The Contents',   blurb: 'Editorial index with a cursor-driven peek-preview.' },
  { n: '02', slug: 'arc',      name: 'The Arc',         blurb: 'The spiral, flattened — cards ride a 2D curve you rotate.' },
  { n: '03', slug: 'deck',     name: 'The Deck',        blurb: 'Flick through a stack of paper cards.' },
  { n: '04', slug: 'drum',     name: 'The Drum',        blurb: 'A rotating serif odometer of sections.' },
  { n: '05', slug: 'magnetic', name: 'Magnetic List',   blurb: 'Oversized serif links that drift toward your cursor.' },
  { n: '06', slug: 'filmstrip',name: 'The Filmstrip',   blurb: 'A horizontal rail of editorial cards, drag with momentum.' },
  { n: '07', slug: 'stack',    name: 'The Stack',       blurb: 'Full-width cards that pin and peel as you scroll.' },
  { n: '08', slug: 'flap',     name: 'Split-flap Board',blurb: 'An airport board that flips into each destination.' },
  { n: '09', slug: 'desk',     name: 'The Desk',        blurb: 'A pannable paper canvas of scattered section cards.' },
  { n: '10', slug: 'path',     name: 'The Path',        blurb: 'Stations along a drawn journey line you travel.' }
]
