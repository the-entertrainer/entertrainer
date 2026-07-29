// Nav set mirroring the real home destinations. The /lab concepts now source
// their items from content/navigation.json via utils/labConcepts.ts; this list
// remains for components/home/Tower.vue.
/** `short` is the label used where a full one won't fit — phone-width pagers. */
export interface LabItem { n: string; label: string; short: string; href: string; desc: string; img: string }

export const LAB_NAV: LabItem[] = [
  { n: '01', label: 'About',                short: 'About',  href: '/about',                desc: 'The short story of how I got here — hospitality to L&D.', img: '/about-me.png' },
  { n: '02', label: 'Instructional Design', short: 'Design', href: '/instructional-design', desc: 'How I think about learning that actually lands.',          img: '/instructional-design.png' },
  { n: '03', label: 'My Work',              short: 'Work',   href: '/my-work',              desc: 'Case studies, a comic, and the projects behind them.',    img: '/my-work.png' },
  { n: '04', label: 'Web Apps',             short: 'Apps',   href: '/tools',                desc: 'Free tools I built for instructional designers.',         img: '/web-apps.png' }
]
