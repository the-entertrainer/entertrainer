export interface Panel {
  id: string
  label: string
  href: string
  /** Short kind line above the title, e.g. "Comic · Club Mahindra". */
  meta: string
  description: string
  image?: string
  /** The one colour this panel is allowed. Used on the index number and the
   *  hover state — never on body copy, which stays white. */
  accent: string
  /** Artwork is taller than it is wide, so frame it rather than crop it. */
  portrait?: boolean
}
