import type { ButtonCraftIconName } from '~/components/tools/buttoncraft/Icon.vue'

// Single source of truth for every ButtonCraft icon's inner SVG markup
// (viewBox 0 0 24 24). Icon.vue renders this for the live editor; the PNG
// exporter (utils/buttonExport.ts) serializes the same markup into an
// offscreen SVG so exported artwork matches the preview exactly.
export const BUTTON_ICON_MARKUP: Record<ButtonCraftIconName, string> = {
  close: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></g>',
  'chevron-down': '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M6 9.5 12 15.5 18 9.5" />',
  'chevron-right': '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M9.5 6 15.5 12 9.5 18" />',
  plus: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M12 5v14M5 12h14" />',
  trash: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16" /><path d="M9 7V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V7" /><path d="M18.3 7 17.5 19.2A2 2 0 0 1 15.5 21h-7a2 2 0 0 1-2-1.8L5.7 7" /><path d="M10.2 11v6M13.8 11v6" /></g>',
  duplicate: '<g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.2" /><path d="M5.5 15H4.8A1.8 1.8 0 0 1 3 13.2V4.8A1.8 1.8 0 0 1 4.8 3h8.4A1.8 1.8 0 0 1 15 4.8v.7" /></g>',
  download: '<g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12.5M7 11.5 12 16.5 17 11.5" /><path d="M4.5 17.5v1.8A1.7 1.7 0 0 0 6.2 21h11.6a1.7 1.7 0 0 0 1.7-1.7v-1.8" /></g>',
  check: '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M20 6.5 9.5 17 4 11.5" />',
  'arrow-right': '<path fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" d="M4 12h16M13 5l7 7-7 7" />',
  'arrow-left': '<path fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" d="M20 12H4M11 5l-7 7 7 7" />',
  play: '<path fill="currentColor" stroke="none" d="M7 4.5 20 12 7 19.5Z" />',
  lock: '<g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9.5" rx="2.2" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></g>',
  star: '<path fill="currentColor" stroke="none" d="M12 2.8 15 9.3l7.1.8-5.3 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 10.1l7.1-.8Z" />'
}
