export interface NavItem {
  id: string
  label: string
  description: string
  href: string
  color: string
  /** Artwork for index rows — the cursor plate on desktop, the row thumb on touch. */
  img?: string
  /** Short mono metadata shown at the end of an index row, e.g. "Comic · 2024". */
  meta?: string
}
