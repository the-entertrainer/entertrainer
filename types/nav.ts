export interface NavItem {
  id: string
  label: string
  description: string
  href: string
  color: string
  /** Card artwork for the section index plates. Omit and the card sets its own
   *  name as the artwork instead of showing an empty frame. */
  image?: string
  /** Short kind label above the card title, e.g. "Comic · Club Mahindra". */
  meta?: string
  /** Set when `image` is taller than it is wide, so the card frames it as a
   *  portrait instead of centre-cropping it into a landscape plate. */
  portrait?: boolean
}
