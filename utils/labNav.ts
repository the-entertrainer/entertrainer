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
  { n: '★', slug: 'flux',      name: 'WebGL Flux (OGL)', blurb: 'Award-site image distortion — drag to liquify, momentum, touch ripple. Built on OGL, the library Lusion/Unseen/BDSN use.' },
  { n: '01', slug: 'brutalist', name: 'Brutalist',      blurb: 'Raw concrete, monster type, one acid accent.' },
  { n: '02', slug: 'chrome',    name: 'Y2K Chrome',      blurb: 'Liquid-metal chrome, iridescence, early-web bling.' },
  { n: '03', slug: 'noir',      name: 'Editorial Noir',  blurb: 'High-fashion serif, full-bleed, elegant and slow.' },
  { n: '04', slug: 'terminal',  name: 'Terminal',        blurb: 'Phosphor-green CRT with a typed boot sequence.' },
  { n: '05', slug: 'aurora',    name: 'Liquid Aurora',   blurb: 'Flowing gradient mesh, dreamy glassmorphism.' },
  { n: '06', slug: 'swiss',     name: 'Kinetic Swiss',   blurb: 'Red/black grid, giant type in constant motion.' },
  { n: '07', slug: 'clay',      name: 'Claymorphic',     blurb: 'Soft 3D clay, pastel, bouncy and playful.' },
  { n: '08', slug: 'riso',      name: 'Risograph',       blurb: 'Two-ink halftone print, grain, 70s overprint.' }
]
