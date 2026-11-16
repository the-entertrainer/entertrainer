import { isListed } from '~/utils/listed'

export type LearnVisual = 'lesson' | 'process' | 'evidence'

export interface LearnItem {
  title: string
  description: string
  detail: string
  action: string
  href: string
  visual: LearnVisual
  /**
   * Public catalogs default to listed. Set false to drop the row
   * without deleting the route. Re-list with `listed: true`.
   */
  listed?: boolean
}

export const LEARN_ITEMS: LearnItem[] = [
  {
    title: 'How to make instructions people can actually follow',
    description: 'Take an instruction that makes people stop and reread it, then turn it into something another person can use.',
    detail: '4 min',
    action: 'Try the lesson',
    href: '/instructional-design',
    visual: 'lesson',
    listed: true,
  },
  {
    title: '1=2: Let’s break maths',
    description: 'The first Elevate essay turned into a block-by-block lesson. Follow the proof, find the crack, and keep the map’s edges in view.',
    detail: '8 min',
    action: 'Open the lesson',
    href: '/learn/one-equals-two',
    visual: 'process',
    listed: true,
  },
  {
    title: 'Instructional design workflow',
    description: 'Source, analyse, structure, storyboard, develop assets, build the module, then polish. The path we use to turn material into lessons.',
    detail: 'Tool',
    action: 'Open the workflow',
    href: '/tools/id-workflow',
    visual: 'evidence',
    listed: false,
  },
  {
    title: 'From No AI to Know AI',
    description: 'See where AI came from, how prediction works, and why its use matters. The machinery is less mysterious once you look at the moving parts.',
    detail: '95 min',
    action: 'Start the course',
    href: '/courses/ai-atlas',
    visual: 'process',
    listed: true,
  },
  {
    title: 'Strong',
    description: 'The same password can take a second or a century to crack, depending entirely on who is doing the cracking.',
    detail: '10 min',
    action: 'Open the module',
    href: '/work/strong',
    visual: 'evidence',
    listed: true,
  },
]

export function listedLearn(items: LearnItem[] = LEARN_ITEMS): LearnItem[] {
  return items.filter(isListed)
}
