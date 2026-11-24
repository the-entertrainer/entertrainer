// Shared nav set for the hidden /lab homepage concepts. Mirrors the real home
// destinations so each concept behaves like the actual site.
/** `short` is the label used where a full one won't fit — phone-width pagers. */
export interface LabItem { n: string; label: string; short: string; href: string; desc: string; img: string }

export const LAB_NAV: LabItem[] = [
  { n: '01', label: 'About',                short: 'About',  href: '/about',                desc: 'Hotel management, a comic, and a change of direction.', img: '/about-me.png' },
  { n: '02', label: 'Instructional Design', short: 'Design', href: '/instructional-design', desc: 'Watch a page redesign itself while you read it.',          img: '/instructional-design.png' },
  { n: '03', label: 'My Work',              short: 'Work',   href: '/my-work',              desc: 'Two projects, taken apart to show the working.',    img: '/my-work.png' },
  { n: '04', label: 'Web Apps',             short: 'Apps',   href: '/tools',                desc: 'Four tools I built because I needed them first.',         img: '/web-apps.png' }
]

export interface LabConcept { n: string; slug: string; name: string; note: string }

/**
 * Fifteen homepages, one optical engine. Every concept renders real Liquid
 * Glass — rounded-rect SDF, normal from the distance-field gradient, edge-
 * weighted refraction, chromatic dispersion, Fresnel and specular — over a
 * procedural backdrop the glass genuinely bends. What changes between them is
 * the art direction: palette, backdrop, typography, panel geometry, layout.
 */
export const CONCEPTS: LabConcept[] = [
  { n: '01', slug: 'g01', name: 'Prism',       note: 'Magenta-violet mesh, Instrument Serif, a four-card deck and a wide status bar.' },
  { n: '02', slug: 'g02', name: 'Monolith',    note: 'Black-and-bone strata. Anton at poster scale over one segmented glass slab.' },
  { n: '03', slug: 'g03', name: 'Sunset Pier', note: 'Warm interference waves, Bricolage Grotesque, buoyant glass pills.' },
  { n: '04', slug: 'g04', name: 'Arctic',      note: 'Pale aurora, Fraunces, tall glass columns. Light, cold, quiet.' },
  { n: '05', slug: 'g05', name: 'Primary',     note: 'Bauhaus grid in red and blue, Archivo Black, hard-cornered glass blocks.' },
  { n: '06', slug: 'g06', name: 'Abyss',       note: 'Deep teal bokeh with circular glass orbs and heavy dispersion.' },
  { n: '07', slug: 'g07', name: 'Neon Grid',   note: 'Pink-cyan concentric rings, Space Grotesk, tight glass tiles.' },
  { n: '08', slug: 'g08', name: 'Dune',        note: 'Sand strata and Fraunces; a stacked list of wide glass rows.' },
  { n: '09', slug: 'g09', name: 'Verdant',     note: 'Emerald mesh behind a single centred glass plate.' },
  { n: '10', slug: 'g10', name: 'Graphite',    note: 'Pointer-tracked spotlight, Inter only, one thin glass rail. Maximum restraint.' },
  { n: '11', slug: 'g11', name: 'Citrus',      note: 'Lime waves on cream, chunky glass pills, deliberately loud.' },
  { n: '12', slug: 'g12', name: 'Dusk',        note: 'Violet aurora with staggered glass cards at two heights.' },
  { n: '13', slug: 'g13', name: 'Copper',      note: 'Bronze rings and Anton; glass panels arranged on an arc.' },
  { n: '14', slug: 'g14', name: 'Cryo',        note: 'Near-white grid, high dispersion, crystalline tiles. The most fragile-looking.' },
  { n: '15', slug: 'g15', name: 'Ember',       note: 'Red-black bokeh, thick bevel, one dramatic hero plate.' }
]
