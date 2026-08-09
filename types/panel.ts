/** How a panel arranges its title, copy and artwork. Each destination on the
 *  home wall picks one, so no two neighbours are laid out the same way. */
export type PanelVariant =
  /** Type in the left column, artwork filling the right. */
  | 'split'
  /** Full-bleed artwork with the title sitting over it. */
  | 'bleed'
  /** Oversized title, artwork dropped below and pushed to the outer edge. */
  | 'stack'
  /** Narrow artwork at the leading edge, type set against it and bottom-aligned. */
  | 'edge'
  /** No artwork at all — the title carries the panel on its own. */
  | 'type'

export interface Panel {
  id: string
  label: string
  href: string
  /** Short kind line above the title, e.g. "Comic · Club Mahindra". */
  meta: string
  description: string
  image?: string
  /** The one colour this panel is allowed. Used on the index number, the rule
   *  and the hover state — never on body copy, which stays white. */
  accent: string
  variant: PanelVariant
  /** Artwork is taller than it is wide, so frame it rather than crop it. */
  portrait?: boolean
}
