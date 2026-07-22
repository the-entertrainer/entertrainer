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
  { n: '01', slug: 'immerse', name: 'Immersive Gallery', blurb: 'Real 3D depth, full 16:9 artwork (no crop), swipe with momentum.' }
]
