// The real spiral — the WebGL helix carousel that used to be the home page —
// went through six genuinely distinct art-direction eras before landing on
// its current look. Each one is reconstructed here from the actual commit
// history (see experience/spiral-lab/s0N/), not invented after the fact.
import navigation from '~/content/navigation.json'
import type { NavItem } from '~/types/nav'

export const SPIRAL_ITEMS = navigation.home as NavItem[]

export interface SpiralEra { n: string; slug: string; name: string; note: string; commit: string }

export const SPIRAL_ERAS: SpiralEra[] = [
  { n: '01', slug: 's01', name: 'Foundational Helix',
    note: 'The original build: fractal-glass gradient backdrop, warm bevelled cards, no bloom.',
    commit: '8147b36' },
  { n: '02', slug: 's02', name: 'Clean Editorial',
    note: 'A calm, paper-quiet backdrop — soft central wash and a whisper of grain — so the cards lead.',
    commit: '5be3975' },
  { n: '03', slug: 's03', name: 'Physical Bevel',
    note: 'Cards gain real material presence: a physical bevel and weight, same quiet backdrop.',
    commit: '44b9492' },
  { n: '04', slug: 's04', name: 'Futuristic',
    note: 'Parallax depth, edge iridescence and the first pass of soft UnrealBloom.',
    commit: '35cdd16' },
  { n: '05', slug: 's05', name: 'Frosted & Iridescent Pool',
    note: 'Backdrop and cards both go frosted depth-of-field, with an iridescent contact pool beneath.',
    commit: '98e371f' },
  { n: '06', slug: 's06', name: 'Ripple-Glass (current)',
    note: 'The current build — the backdrop reimagined in the preloader’s ripple-glass style.',
    commit: '8b9d4d4' }
]
