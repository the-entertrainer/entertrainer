// ─────────────────────────────────────────────────────────────
//  SINGLE SOURCE OF TRUTH for all site content.
//  Edit copy here — every panel reads from this file via useContent().
//  Placeholder copy is intentionally playful while Naveen finishes writing.
// ─────────────────────────────────────────────────────────────

export type SectionKind =
  | 'hero'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'testimonials'
  | 'contact'
  | 'footer'

export interface SectionContent {
  id: string
  kind: SectionKind
  /** Short label shown on the panel tab / chrome */
  tab: string
  eyebrow?: string
  title: string
  body?: string
  /** Accent token name used for this panel's glow */
  accent: 'cyan' | 'magenta' | 'violet' | 'yellow' | 'pink' | 'blue'
  items?: Array<Record<string, unknown>>
}

export interface SiteData {
  brand: string
  owner: string
  domain: string
  tagline: string
  sections: SectionContent[]
}

const wip = "This bit's still being written — Naveen's on it… though, between us, he's been a little lazy lately 😏"

export const site: SiteData = {
  brand: 'Entertrainer',
  owner: 'Naveen',
  domain: 'entertrainer.in',
  tagline: 'Interesting is the Mother of All Inventions.',
  sections: [
    {
      id: 'hero',
      kind: 'hero',
      tab: 'Start',
      eyebrow: 'Instructional Designer · Learning Architect',
      title: 'Interesting is the Mother of All Inventions.',
      body: 'A spiral of ideas from Naveen — instructional design that refuses to be boring. Drag the spiral. Poke around. Stay a while.',
      accent: 'cyan',
    },
    {
      id: 'about',
      kind: 'about',
      tab: 'About',
      eyebrow: 'Who is this guy',
      title: 'About Naveen',
      body: wip,
      accent: 'violet',
      items: [
        { fact: 'Turns dry content into experiences people actually finish.' },
        { fact: 'Believes if it is not engaging, it is not learning.' },
        { fact: 'Probably rebuilding this section right now. Or napping.' },
      ],
    },
    {
      id: 'skills',
      kind: 'skills',
      tab: 'Skills',
      eyebrow: 'The toolkit',
      title: 'Skills & Superpowers',
      body: wip,
      accent: 'magenta',
      items: [
        { name: 'Articulate Storyline', level: 95 },
        { name: 'Micro-learning Design', level: 92 },
        { name: 'Instructional Design', level: 90 },
        { name: 'UX for Learning', level: 84 },
        { name: 'Motion & Visual Design', level: 80 },
      ],
    },
    {
      id: 'experience',
      kind: 'experience',
      tab: 'Journey',
      eyebrow: 'The story so far',
      title: 'Experience',
      body: wip,
      accent: 'blue',
      items: [
        { year: '2024 →', role: 'Building Entertrainer', org: 'Self · entertrainer.in' },
        { year: '20XX', role: 'Lead Instructional Designer', org: 'Coming soon' },
        { year: '20XX', role: 'Learning Experience Designer', org: 'Coming soon' },
      ],
    },
    {
      id: 'projects',
      kind: 'projects',
      tab: 'Work',
      eyebrow: 'Free to grab',
      title: 'Projects & Storyline Examples',
      body: wip,
      accent: 'cyan',
      items: [
        { title: 'Decision-Making Scenario', tag: 'Branching', icon: '🎯' },
        { title: 'Knowledge Check Template', tag: 'Quiz', icon: '📊' },
        { title: 'Reveal Interaction', tag: 'Interactive', icon: '🔮' },
        { title: 'Video Hotspot Module', tag: 'Video', icon: '🎬' },
      ],
    },
    {
      id: 'testimonials',
      kind: 'testimonials',
      tab: 'Praise',
      eyebrow: 'Kind words',
      title: 'Testimonials',
      body: wip,
      accent: 'pink',
      items: [
        { quote: 'Reviews will appear here once Naveen stops being shy.', author: 'Future Happy Client' },
        { quote: 'Five stars, allegedly.', author: 'Someone, probably' },
      ],
    },
    {
      id: 'contact',
      kind: 'contact',
      tab: 'Say Hi',
      eyebrow: 'Get in touch',
      title: "Let's make something interesting.",
      body: 'Questions, collabs, or just want to share something cool you built? The form works — try it.',
      accent: 'yellow',
    },
    {
      id: 'footer',
      kind: 'footer',
      tab: 'Fin',
      eyebrow: '',
      title: 'Entertrainer',
      body: '© 2026 Entertrainer · entertrainer.in — handcrafted with too much CSS and just enough chaos.',
      accent: 'violet',
    },
  ],
}
