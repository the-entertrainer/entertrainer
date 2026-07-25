// Shared nav set for the hidden /lab homepage-concept prototypes. Mirrors the
// real home destinations so each concept feels like the actual site.
export interface LabItem { n: string; label: string; href: string; desc: string; img: string }

export const LAB_NAV: LabItem[] = [
  { n: '01', label: 'About',                href: '/about',                desc: 'The short story of how I got here — hospitality to L&D.', img: '/about-me.png' },
  { n: '02', label: 'Instructional Design', href: '/instructional-design', desc: 'How I think about learning that actually lands.',          img: '/instructional-design.png' },
  { n: '03', label: 'My Work',              href: '/my-work',              desc: 'Case studies, a comic, and the projects behind them.',    img: '/my-work.png' },
  { n: '04', label: 'Web Apps',             href: '/tools',                desc: 'Free tools I built for instructional designers.',         img: '/web-apps.png' }
]

// The homepage candidates: one fixed Liquid Tower, ten design languages.
// Colour, type, chrome and motion all change; the 3D stage never does.
export const HOME_VARIANTS = [
  { n: '01', slug: 'home-01', name: 'Electric Cream', blurb: 'Warm paper, navy ink, a jolt of electric lime. Index rail, serif display.' },
  { n: '02', slug: 'home-02', name: 'Midnight Candy', blurb: 'Near-black neon — cyan ticker overhead, hot-pink glow bar under the title.' },
  { n: '03', slug: 'home-03', name: 'Sunset Pop',     blurb: 'Peach and plum. The caption arrives as a physical card sliding up.' },
  { n: '04', slug: 'home-04', name: 'Mint Studio',    blurb: 'Swiss grid, caption top-left, magenta rule, oversized numeral.' },
  { n: '05', slug: 'home-05', name: 'Cobalt Bold',    blurb: 'Poster energy — a yellow highlighter swipe redraws behind each name.' },
  { n: '06', slug: 'home-06', name: 'Paper Riot',     blurb: 'Bauhaus primaries, flat shapes, a hard black caption slab.' },
  { n: '07', slug: 'home-07', name: 'Dusk Violet',    blurb: 'Violet night, italic serif assembling letter by letter, lilac bloom.' },
  { n: '08', slug: 'home-08', name: 'Acid Lab',       blurb: 'Instrument panel — mono readouts, bracketed labels, acid green.' },
  { n: '09', slug: 'home-09', name: 'Terracotta',     blurb: 'Baked clay and cream serif, captions cross-fading through blur.' },
  { n: '10', slug: 'home-10', name: 'Ink & Ice',      blurb: 'Charcoal restraint, one ice-blue cut, title wiping up behind a mask.' }
]

// The Liquid Glass series — twelve homepage worlds sharing one optical engine
// (real transmission, IOR refraction, PMREM-lit bevels) but no two alike.
export const GLASS_CONCEPTS = [
  { n: 'G1',  slug: 'glass-helix',   name: 'Liquid Helix',   blurb: 'The spiral reborn in real glass — cards climb a helix, bezels bending the paper behind them.' },
  { n: 'G2',  slug: 'glass-river',   name: 'Liquid River',   blurb: 'A horizontal coverflow current. Giant ghost numerals, drag along the stream.' },
  { n: 'G3',  slug: 'glass-deck',    name: 'Liquid Deck',    blurb: 'A dusk-lit stack you peel through, one heavy glass card at a time.' },
  { n: 'G4',  slug: 'glass-orbit',   name: 'Liquid Orbit',   blurb: 'Cards orbit a still centre on a tilted ring, like a slow orrery.' },
  { n: 'G5',  slug: 'glass-fan',     name: 'Liquid Fan',     blurb: 'Held in the hand — cards fanned on an arc, editorial and calm.' },
  { n: 'G6',  slug: 'glass-gallery', name: 'Liquid Gallery', blurb: 'A hung wall of glass plates, parallaxing gently as you move.' },
  { n: 'G7',  slug: 'glass-tower',   name: 'Liquid Tower',   blurb: 'A vertical monolith you descend, each plate turning as it passes.' },
  { n: 'G8',  slug: 'glass-ribbon',  name: 'Liquid Ribbon',  blurb: 'Cards threaded along a flowing ribbon path over an oversized ghost word.' },
  { n: 'G9',  slug: 'glass-desk',    name: 'Liquid Desk',    blurb: 'Laid flat on a lit surface, seen from above, with true contact shadows.' },
  { n: 'G10', slug: 'glass-field',   name: 'Liquid Field',   blurb: 'Scattered through depth like a constellation, drifting out of the dark.' },
  { n: 'G11', slug: 'glass-wave',    name: 'Liquid Wave',    blurb: 'A sine wave of glass rolling across frame, steered from a floating pill.' },
  { n: 'G12', slug: 'glass-vortex',  name: 'Liquid Vortex',  blurb: 'A tunnel spiralling into the dark — cards rush past toward the throat.' }
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
  { n: '08', slug: 'riso',      name: 'Risograph',       blurb: 'Two-ink halftone print, grain, 70s overprint.' },
  { n: '09', slug: 'plasma',    name: 'Plasma Shader',   blurb: 'A living OGL aurora shader you push with the cursor.' },
  { n: '10', slug: 'physics',   name: 'Physics Toybox',  blurb: 'Matter.js — throw and stack the nav like real objects.' },
  { n: '11', slug: 'ascii',     name: 'ASCII Portrait',  blurb: 'The portrait rendered live as glowing ASCII text.' },
  { n: '12', slug: 'synthwave', name: 'Synthwave',       blurb: 'Neon sun, endless perspective grid, retro-future.' },
  { n: '13', slug: 'comic',     name: 'Pop Comic',       blurb: 'Ben-Day halftone, speech bubbles, POW! — your comic DNA.' },
  { n: '14', slug: 'blueprint', name: 'Blueprint',       blurb: 'Cyan technical drawing, dimension lines, annotations.' },
  { n: '15', slug: 'mesh',      name: 'Mesh Gradient',   blurb: 'Stripe-style animated mesh + grain, big serif.' },
  { n: '16', slug: 'glitch',    name: 'VHS Glitch',      blurb: 'RGB-split datamosh type, scanlines, signal noise.' }
]
