/**
 * Short authentic Sanskrit sayings for the music-on preloader stage.
 * Themes: knowledge, light, learning, awareness. Translations kept plain.
 */
export interface PreloaderQuote {
  sa: string
  en: string
}

export const PRELOADER_QUOTES: readonly PreloaderQuote[] = [
  {
    sa: 'तमसो मा ज्योतिर्गमय',
    en: 'Lead me from darkness to light'
  },
  {
    sa: 'सा विद्या या विमुक्तये',
    en: 'Knowledge is that which liberates'
  },
  {
    sa: 'विद्ययाऽमृतमश्नुते',
    en: 'Through knowledge one attains immortality'
  },
  {
    sa: 'ज्ञानं परमं बलम्',
    en: 'Knowledge is the supreme strength'
  },
  {
    sa: 'आ नो भद्राः क्रतवो यन्तु विश्वतः',
    en: 'Let noble thoughts come to us from every side'
  },
  {
    sa: 'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते',
    en: 'Nothing here is as purifying as knowledge'
  },
  {
    sa: 'श्रद्धावान् लभते ज्ञानम्',
    en: 'The faithful attain knowledge'
  },
  {
    sa: 'प्रज्ञानं ब्रह्म',
    en: 'Consciousness is Brahman'
  },
  {
    sa: 'सत्यमेव जयते नानृतम्',
    en: 'Truth alone triumphs, not falsehood'
  },
  {
    sa: 'विद्या ददाति विनयम्',
    en: 'Learning gives humility'
  },
  {
    sa: 'एकं सद्विप्रा बहुधा वदन्ति',
    en: 'Truth is one; the wise call it by many names'
  },
  {
    sa: 'योगः कर्मसु कौशलम्',
    en: 'Yoga is skillfulness in action'
  }
] as const

/** Pick one quote per preloader mount (stable for that session). */
export function pickPreloaderQuote(seed = Math.random()): PreloaderQuote {
  const list = PRELOADER_QUOTES
  const i = Math.floor(seed * list.length) % list.length
  return list[i]!
}
