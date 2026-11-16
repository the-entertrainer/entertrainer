import type { AppIconId } from '~/utils/appIcons'
import { isListed } from '~/utils/listed'

export interface EngageItem {
  id: string
  href: string
  title: string
  blurb: string
  icon: AppIconId
  /**
   * Public catalogs default to listed. Set false to drop the card
   * without deleting the route. Re-list with `listed: true`.
   */
  listed?: boolean
}

export const ENGAGE_ITEMS: EngageItem[] = [
  {
    id: 'stack',
    href: '/engage/stack',
    title: 'Stack',
    blurb: 'Tap to drop. Only the overlap stays.',
    icon: 'stack',
    listed: true,
  },
  {
    id: 'mind-reader',
    href: '/engage/read-my-mind',
    title: 'The Mind Reader',
    blurb: 'Example: 42. Add 4 + 2, subtract, and the mark is on 36.',
    icon: 'mind-reader',
    listed: false,
  },
  {
    id: 'astroclock',
    href: '/engage/astroclock',
    title: 'AstroClock',
    blurb: 'Birth place and time. A live dial. What today is doing.',
    icon: 'astroclock',
    listed: false,
  },
  {
    id: 'whatto',
    href: '/engage/whatto',
    title: 'Whatto',
    blurb: 'Live crypto rebound signals with the odds shown.',
    icon: 'whatto',
    listed: false,
  },
]

export function listedEngage(items: EngageItem[] = ENGAGE_ITEMS): EngageItem[] {
  return items.filter(isListed)
}
