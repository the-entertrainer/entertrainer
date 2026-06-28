<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScoringVector { ati?: number; sgi?: number; rbi?: number }
type VisualType = 'color' | 'photo' | 'gradient' | 'shape'

interface VisualOption {
  visual:   string
  fallback?: string
  label:    string
  desc:     string
  scores:   ScoringVector
}

interface Question {
  prompt:     string
  visualType: VisualType
  options:    VisualOption[]
}

// ─── Pexels CDN helper ────────────────────────────────────────────────────────
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=480&h=480&dpr=1`

// ─── SVG shape keys ───────────────────────────────────────────────────────────
const SHAPES: Record<string, string> = {
  'spike-ring': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="16" stroke="currentColor" stroke-width="1.5"/>
    ${Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;const x1=40+22*Math.cos(a);const y1=40+22*Math.sin(a);const x2=40+34*Math.cos(a);const y2=40+34*Math.sin(a);return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="currentColor" stroke-width="1.5"/>`}).join('')}
  </svg>`,
  'soft-blob': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 16 C54 16, 66 26, 66 40 C66 58, 54 66, 40 66 C24 66, 14 56, 14 40 C14 24, 26 16, 40 16Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
    <circle cx="40" cy="40" r="10" fill="currentColor" fill-opacity="0.2"/>
  </svg>`,
  'tangle': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 40 Q25 20 40 35 Q55 50 65 30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M20 55 Q35 30 50 45 Q60 55 70 40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    <path d="M10 30 Q30 50 45 25 Q55 10 70 50" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
  </svg>`,
  'flat-line': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="10" y1="40" x2="70" y2="40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="10" cy="40" r="2" fill="currentColor"/>
    <circle cx="70" cy="40" r="2" fill="currentColor"/>
  </svg>`,
  'heartbeat': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="5,40 18,40 24,20 30,58 36,28 42,52 48,36 54,40 75,40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'slow-wave': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 40 Q20 20 40 40 Q60 60 75 40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </svg>`,
  'flat-ekg': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="5" y1="40" x2="36" y2="40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <polyline points="36,40 40,34 44,46 48,40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="48" y1="40" x2="75" y2="40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  'erratic': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="5,40 12,40 16,20 20,55 24,10 28,60 32,35 36,45 42,15 46,65 52,30 56,50 60,40 75,40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'dense-cluster': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    ${[{x:40,y:40,r:3},{x:34,y:36,r:2},{x:46,y:36,r:2},{x:37,y:46,r:2},{x:44,y:44,r:2},{x:30,y:42,r:1.5},{x:50,y:40,r:1.5},{x:40,y:30,r:1.5},{x:36,y:50,r:1.5},{x:48,y:50,r:1.5}].map(d=>`<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="currentColor"/>`).join('')}
    ${[{x:25,y:35,r:1},{x:54,y:32,r:1},{x:28,y:50,r:1},{x:52,y:55,r:1}].map(d=>`<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="currentColor" opacity="0.4"/>`).join('')}
  </svg>`,
  'scattered': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    ${[{x:12,y:18},{x:65,y:12},{x:20,y:60},{x:70,y:55},{x:40,y:72},{x:8,y:40},{x:75,y:38},{x:35,y:15},{x:55,y:65},{x:48,y:40}].map(d=>`<circle cx="${d.x}" cy="${d.y}" r="2" fill="currentColor"/>`).join('')}
  </svg>`,
  'single-dot': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="5" fill="currentColor"/>
    <circle cx="40" cy="40" r="18" stroke="currentColor" stroke-width="0.75" opacity="0.2"/>
    <circle cx="40" cy="40" r="30" stroke="currentColor" stroke-width="0.5" opacity="0.1"/>
  </svg>`,
  'empty-void': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="28" stroke="currentColor" stroke-width="0.75" opacity="0.3"/>
  </svg>`,
  'open-arch': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 65 L20 42 Q20 20 40 20 Q60 20 60 42 L60 65" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  'door-ajar': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="18" width="30" height="46" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M25 18 L18 22 L18 68 L25 64" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="33" cy="42" r="2" fill="currentColor"/>
  </svg>`,
  'door-closed': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="18" width="36" height="46" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="50" cy="42" r="2.5" fill="currentColor"/>
  </svg>`,
  'door-sealed': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="16" width="40" height="48" rx="3" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
    <line x1="14" y1="40" x2="66" y2="40" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <line x1="40" y1="14" x2="40" y2="66" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <circle cx="40" cy="40" r="4" fill="currentColor"/>
  </svg>`,
  'close-circle': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="22" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="40" cy="40" r="10" fill="currentColor" fill-opacity="0.25"/>
  </svg>`,
  'gap-circle': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="27" cy="40" r="12" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="53" cy="40" r="12" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </svg>`,
  'far-circle': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="40" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="66" cy="40" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </svg>`,
  'glass-wall': `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="36" y="12" width="8" height="56" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="1"/>
    <circle cx="18" cy="40" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="62" cy="40" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </svg>`,
}

// ─── Full question bank (27 questions) ────────────────────────────────────────
const ALL_QUESTIONS: Question[] = [
  // ── Color ──
  {
    prompt: 'The color of the speed moving through you right now',
    visualType: 'color',
    options: [
      { visual: '#dc2626', label: 'Crimson',      desc: 'burning crimson — high kinetic urgency, heat at the surface', scores: { ati: 3, sgi: 1 } },
      { visual: '#f59e0b', label: 'Amber Gold',   desc: 'warm amber gold — elevated energy, searching and alert', scores: { ati: 1, sgi: -1 } },
      { visual: '#64748b', label: 'Slate',         desc: 'still slate grey — moderate pace, neither racing nor frozen', scores: { ati: -1 } },
      { visual: '#312e81', label: 'Deep Indigo',   desc: 'deep indigo — depleted, withdrawn, almost frozen', scores: { ati: -2, rbi: -1 } },
    ],
  },
  {
    prompt: 'A color that feels honest about today',
    visualType: 'color',
    options: [
      { visual: '#ef4444', label: 'Burning Red',  desc: 'burning red — raw, exposed, near the surface', scores: { ati: 2, rbi: -1 } },
      { visual: '#d97706', label: 'Warm Amber',   desc: 'warm amber — elevated but manageable, reaching', scores: { ati: 1, sgi: 1, rbi: 1 } },
      { visual: '#0d9488', label: 'Still Teal',   desc: 'still teal — grounded, quiet, body-aware', scores: { sgi: 2, ati: -1 } },
      { visual: '#374151', label: 'Cold Charcoal', desc: 'cold charcoal — muted, shielded, held back from the world', scores: { rbi: -2, sgi: 1, ati: -1 } },
    ],
  },
  {
    prompt: 'The light inside your chest',
    visualType: 'color',
    options: [
      { visual: '#ffffff', label: 'Harsh White',  desc: 'harsh white glare — overexposed, everything visible, no shadows to rest in', scores: { ati: 2 } },
      { visual: '#fbbf24', label: 'Golden',       desc: 'warm golden glow — soft and full, afternoon settling', scores: { ati: -1, sgi: 1, rbi: 1 } },
      { visual: '#93c5fd', label: 'Steel Blue',   desc: 'cool steel blue — calm on the surface, depth beneath', scores: { sgi: 1, rbi: -1, ati: -1 } },
      { visual: '#111827', label: 'Near-Black',   desc: 'near darkness — very low light inside, deeply turned inward', scores: { ati: -3, rbi: -2 } },
    ],
  },
  {
    prompt: 'The color of the distance between you and others',
    visualType: 'color',
    options: [
      { visual: '#fda4af', label: 'Warm Rose',    desc: 'warm rose — close, soft, tender, wanting nearness', scores: { rbi: 3, sgi: 1 } },
      { visual: '#93c5fd', label: 'Dusty Blue',   desc: 'dusty blue — comfortable distance, holding space', scores: { rbi: 0 } },
      { visual: '#d1d5db', label: 'Fog Grey',     desc: 'fog grey — disconnected, others feel muffled and far', scores: { rbi: -2, sgi: -1 } },
      { visual: '#4c1d95', label: 'Deep Violet',  desc: 'deep violet — sealed away, the world kept at significant distance', scores: { rbi: -3, ati: -1 } },
    ],
  },
  {
    prompt: 'What color is today pressing on you',
    visualType: 'color',
    options: [
      { visual: '#fef08a', label: 'Electric Yellow', desc: 'electric yellow — relentless brightness, nowhere to hide', scores: { ati: 2, sgi: -1 } },
      { visual: '#6b7280', label: 'Muted Olive',  desc: 'muted olive grey — dull weight, low saturation day', scores: { ati: -1, sgi: 1, rbi: -1 } },
      { visual: '#c4b5fd', label: 'Pale Lavender', desc: 'pale lavender — diffused and light, slightly unreal', scores: { sgi: -1, rbi: 1 } },
      { visual: '#92400e', label: 'Dark Rust',    desc: 'dark rust — heavy, residual, something that has been burning slowly', scores: { ati: 1, sgi: 1, rbi: -1 } },
    ],
  },
  // ── Photo — landscape ──
  {
    prompt: 'A landscape that matches where you are',
    visualType: 'photo',
    options: [
      { visual: px(1295138), fallback: 'linear-gradient(135deg,#1e3a5f,#0f172a)', label: 'Stormy Coast',   desc: 'a storm-ravaged coastline — churning, relentless, demanding everything', scores: { ati: 2, sgi: 1, rbi: -1 } },
      { visual: px(1179229), fallback: 'linear-gradient(135deg,#14532d,#052e16)', label: 'Misty Forest',   desc: 'a misty forest — enclosed, quiet, alive and unknowable', scores: { ati: -1, sgi: 2, rbi: 1 } },
      { visual: px(1252869), fallback: 'linear-gradient(135deg,#cbd5e1,#f8fafc)', label: 'Mountain Peak',  desc: 'an open mountain peak — exposed, vast, above everything', scores: { sgi: -1, rbi: -2, ati: 1 } },
      { visual: px(1105019), fallback: 'linear-gradient(135deg,#ca8a04,#fef9c3)', label: 'Golden Field',   desc: 'a golden sun-lit field — warm, open, gently held by the light', scores: { ati: -1, sgi: 1, rbi: 2 } },
    ],
  },
  {
    prompt: 'A sky that feels like your inner weather',
    visualType: 'photo',
    options: [
      { visual: px(314726),  fallback: 'linear-gradient(180deg,#0f172a,#334155)', label: 'Dark Storm',     desc: 'dark storm clouds building — pressured, electric, something breaking open', scores: { ati: 2, rbi: -1 } },
      { visual: px(209831),  fallback: 'linear-gradient(180deg,#bae6fd,#e0f2fe)', label: 'Crystal Blue',   desc: 'crystal clear open sky — light, breathable, nothing pressing', scores: { ati: -1, sgi: 1, rbi: 1 } },
      { visual: px(2116673), fallback: 'linear-gradient(180deg,#94a3b8,#e2e8f0)', label: 'Dense Fog',      desc: 'dense fog — no clear edge anywhere, drifting, edges dissolved', scores: { sgi: -2, ati: 0, rbi: -1 } },
      { visual: px(956981),  fallback: 'linear-gradient(180deg,#f97316,#fbbf24)', label: 'Shifting Clouds', desc: 'partly cloudy sky — moving between states, neither here nor there', scores: { ati: 0, sgi: 0, rbi: 0 } },
    ],
  },
  {
    prompt: 'A body of water speaking to today',
    visualType: 'photo',
    options: [
      { visual: px(2387873), fallback: 'linear-gradient(180deg,#1e40af,#bfdbfe)', label: 'Waterfall',      desc: 'a raging waterfall — continuous, consuming, nothing quiet about it', scores: { ati: 3, sgi: 1 } },
      { visual: px(1001682), fallback: 'linear-gradient(180deg,#0f4c75,#1b6ca8)', label: 'Still Lake',     desc: 'a still, deep lake — quiet surface, unknown depths, pulled inward', scores: { ati: -1, sgi: 1, rbi: -1 } },
      { visual: px(3369569), fallback: 'linear-gradient(180deg,#a3c4bc,#e8f4f8)', label: 'Gentle Rain',    desc: 'gentle rain on still water — soft, persistent, everything slowly washing', scores: { rbi: 1, ati: -1, sgi: -1 } },
      { visual: px(1698483), fallback: 'linear-gradient(180deg,#92400e,#fef3c7)', label: 'Cracked Earth',  desc: 'cracked dry earth where water used to be — deeply depleted, waiting', scores: { ati: -3, sgi: -2, rbi: -1 } },
    ],
  },
  {
    prompt: 'The season living inside you',
    visualType: 'photo',
    options: [
      { visual: px(931177),  fallback: 'linear-gradient(135deg,#86efac,#f0fdf4)', label: 'Spring',         desc: 'spring blossom — something tender just beginning to stir', scores: { ati: 1, sgi: 1, rbi: 2 } },
      { visual: px(1323550), fallback: 'linear-gradient(135deg,#ca8a04,#fef08a)', label: 'Summer',         desc: 'full summer — at peak exposure, everything in high saturation', scores: { ati: 2, sgi: 1 } },
      { visual: px(1108701), fallback: 'linear-gradient(135deg,#b45309,#7c2d12)', label: 'Autumn',         desc: 'autumn mist — gathering inward, something slowly fading and releasing', scores: { ati: -1, sgi: 1, rbi: -1 } },
      { visual: px(235621),  fallback: 'linear-gradient(135deg,#e2e8f0,#f8fafc)', label: 'Winter',         desc: 'bare winter branch — dormant, sealed, waiting below the surface', scores: { ati: -2, rbi: -2, sgi: 1 } },
    ],
  },
  {
    prompt: 'A space that feels right for where you are',
    visualType: 'photo',
    options: [
      { visual: px(1648771), fallback: 'linear-gradient(135deg,#7c2d12,#1c1917)', label: 'Firelit Room',   desc: 'a tiny firelit room — small, sealed, warm at the very center', scores: { ati: -1, sgi: 2, rbi: -1 } },
      { visual: px(1268468), fallback: 'linear-gradient(135deg,#a3e635,#f7fee7)', label: 'Empty Field',    desc: 'an open empty field — vast, no walls, the world at a distance', scores: { rbi: -2, sgi: 1 } },
      { visual: px(302804),  fallback: 'linear-gradient(135deg,#d97706,#fef9c3)', label: 'Warm Café',      desc: 'a crowded warm café — other people near, heat and sound, belonging', scores: { rbi: 2, ati: 1 } },
      { visual: px(1179229), fallback: 'linear-gradient(135deg,#14532d,#052e16)', label: 'Forest Alone',   desc: 'a dense forest, alone — enclosed, living, but entirely private', scores: { sgi: 2, rbi: -1, ati: -1 } },
    ],
  },
  // ── Photo — light quality ──
  {
    prompt: 'A kind of light you\'re living inside',
    visualType: 'photo',
    options: [
      { visual: px(1105019), fallback: 'linear-gradient(180deg,#fef08a,#ffffff)', label: 'Harsh Noon',     desc: 'harsh midday sun — exposed, merciless, nowhere to hide', scores: { ati: 2 } },
      { visual: px(1108701), fallback: 'linear-gradient(180deg,#f97316,#7c3aed)', label: 'Golden Dusk',   desc: 'golden dusk — amber, soft, already passing, the day letting go', scores: { ati: -1, sgi: 1, rbi: 1 } },
      { visual: px(956981),  fallback: 'linear-gradient(180deg,#bfdbfe,#dbeafe)', label: 'Sterile Blue',  desc: 'sterile cold blue-white — artificial, clinical, humming quietly', scores: { ati: 1, sgi: -2, rbi: -1 } },
      { visual: px(1648771), fallback: 'linear-gradient(180deg,#451a03,#78350f)', label: 'Single Candle', desc: 'a single candle — small, flickering, a warm circle in the dark', scores: { ati: -1, sgi: 1, rbi: 2 } },
    ],
  },
  // ── Gradient / abstract ──
  {
    prompt: 'The movement inside you right now',
    visualType: 'gradient',
    options: [
      { visual: 'linear-gradient(135deg,#ef4444 0%,#f97316 50%,#fbbf24 100%)', label: 'Rapid Burst',    desc: 'rapid, kinetic bursting — energy moving faster than it can be directed', scores: { ati: 3 } },
      { visual: 'linear-gradient(180deg,#6366f1 0%,#818cf8 50%,#a5b4fc 100%)', label: 'Slow Undulation', desc: 'slow gentle undulation — rhythmic, unhurried, finding its own pace', scores: { ati: -1, sgi: 2 } },
      { visual: 'linear-gradient(180deg,#1e293b 0%,#334155 50%,#475569 100%)', label: 'Stillness',      desc: 'near-complete stillness — very little moving, held in suspension', scores: { ati: -3, sgi: 1 } },
      { visual: 'linear-gradient(135deg,#7c3aed,#ec4899,#f97316,#06b6d4)', label: 'Erratic Scatter',  desc: 'erratic scattered movement — no clear direction, pulled in multiple ways at once', scores: { ati: 1, rbi: -1 } },
    ],
  },
  {
    prompt: 'The texture of today',
    visualType: 'gradient',
    options: [
      { visual: 'repeating-linear-gradient(45deg,#6b7280 0px,#6b7280 1px,#9ca3af 1px,#9ca3af 4px)', label: 'Rough Gravel',  desc: 'rough gravel — coarse, real, every edge noticeable underfoot', scores: { sgi: 2, ati: 1 } },
      { visual: 'linear-gradient(135deg,#e0f2fe,#f0f9ff,#bae6fd)', label: 'Smooth Glass',  desc: 'smooth cold glass — seamless, no friction, slightly impersonal', scores: { sgi: -1, rbi: -1, ati: -1 } },
      { visual: 'linear-gradient(135deg,#4c1d95,#7c3aed,#6d28d9)', label: 'Deep Velvet',   desc: 'deep soft velvet — enveloping, dark, folding softly around you', scores: { ati: -2, sgi: 1, rbi: 1 } },
      { visual: 'linear-gradient(135deg,#d4b483,#e8d5a3,#c9a96e)', label: 'Wet Sand',      desc: 'wet sand — heavy and yielding, each step leaves a mark', scores: { sgi: 2, ati: -1 } },
    ],
  },
  {
    prompt: 'How time is moving through your body',
    visualType: 'gradient',
    options: [
      { visual: 'linear-gradient(90deg,#ef4444,#f97316,#fbbf24,#ef4444)', label: 'Racing Away',   desc: 'time racing and slipping — never enough, always escaping just ahead of you', scores: { ati: 2, rbi: -1 } },
      { visual: 'linear-gradient(90deg,#818cf8,#a5b4fc,#c7d2fe,#818cf8)', label: 'Slow Ripples',  desc: 'time moving in slow heavy ripples — manageable but weighted', scores: { ati: -1, sgi: 1 } },
      { visual: 'linear-gradient(180deg,#0f172a,#1e293b,#334155)', label: 'Frozen',         desc: 'time frozen — dense, stuck, impossible to move through', scores: { ati: -2, rbi: -2, sgi: 1 } },
      { visual: 'linear-gradient(180deg,#e0f2fe,#f0f9ff,transparent)', label: 'Weightless',   desc: 'time weightless and irrelevant — floating free, untethered from the clock', scores: { sgi: -2 } },
    ],
  },
  {
    prompt: 'The pressure of the atmosphere around you',
    visualType: 'gradient',
    options: [
      { visual: 'radial-gradient(circle,#1e293b 0%,#0f172a 100%)', label: 'Crushing Dense',  desc: 'crushing and dense — heavy, compressing, hard to breathe', scores: { ati: 2, sgi: 2, rbi: -2 } },
      { visual: 'linear-gradient(135deg,#fbbf24,#f97316,#ef4444)', label: 'Electric',        desc: 'electric and charged — live, vibrating, anticipating something', scores: { ati: 2 } },
      { visual: 'linear-gradient(135deg,#e0f2fe,#f0fdf4,#fefce8)', label: 'Light & Open',    desc: 'light and breathable — open, clear, almost floating', scores: { ati: -1, sgi: 1, rbi: 1 } },
      { visual: 'linear-gradient(180deg,#e2e8f0,#f8fafc,#ffffff)', label: 'Thin & Cold',    desc: 'thin and cold — empty, distant, the air too sparse to hold much warmth', scores: { sgi: -1, rbi: -2 } },
    ],
  },
  {
    prompt: 'The quality of your attention right now',
    visualType: 'gradient',
    options: [
      { visual: 'radial-gradient(circle at 50% 50%,#ffffff 0%,#fef9c3 30%,#0f172a 100%)', label: 'Sharp Spotlight', desc: 'a sharp spotlight — concentrated, everything else in shadow', scores: { ati: 2, rbi: -1 } },
      { visual: 'radial-gradient(circle at 40% 40%,#fbbf24 0%,#f97316 40%,#7c3aed 100%)', label: 'Warm Diffused',  desc: 'warm diffused glow — soft, spreading, touching everything gently', scores: { rbi: 1, sgi: 1 } },
      { visual: 'linear-gradient(135deg,#7c3aed,#0f172a,#ec4899,#0f172a,#06b6d4)', label: 'Scattered Flickers', desc: 'scattered flickering — never quite settling, moving from surface to surface', scores: { ati: 1, sgi: -1 } },
      { visual: 'radial-gradient(circle,#451a03 0%,#0f172a 70%)', label: 'Barely There',   desc: 'barely-there ember — present but very dim, close to going out', scores: { ati: -2, sgi: -1 } },
    ],
  },
  {
    prompt: 'The temperature of your inner world',
    visualType: 'gradient',
    options: [
      { visual: 'linear-gradient(135deg,#ef4444,#dc2626,#b91c1c)', label: 'Fever Heat',     desc: 'fever heat — running too hot, something burning from inside', scores: { ati: 3, sgi: 1 } },
      { visual: 'linear-gradient(135deg,#fbbf24,#f97316)', label: 'Comfortable Warmth', desc: 'comfortable warmth — the temperature of something living and resting', scores: { ati: 0, sgi: 1, rbi: 1 } },
      { visual: 'linear-gradient(135deg,#93c5fd,#bfdbfe)', label: 'Cool Stillness',  desc: 'cool stillness — clear, unheated, like air just before morning', scores: { ati: -1, sgi: 1 } },
      { visual: 'linear-gradient(135deg,#1e3a5f,#0f172a)', label: 'Deep Cold',       desc: 'deep cold — something inside has stopped generating heat', scores: { ati: -3, rbi: -2, sgi: -1 } },
    ],
  },
  // ── Shape / SVG ──
  {
    prompt: 'The shape your thoughts are making',
    visualType: 'shape',
    options: [
      { visual: 'spike-ring', label: 'Sharp Spikes',  desc: 'sharp radiating spikes — thoughts with edges, striking outward', scores: { ati: 2, rbi: -1 } },
      { visual: 'soft-blob',  label: 'Soft Blob',     desc: 'a soft amorphous blob — thoughts spreading, yielding, without hard edge', scores: { sgi: 1, rbi: 1 } },
      { visual: 'tangle',     label: 'Tangled',       desc: 'tangled overlapping lines — thoughts looping, no clear path through', scores: { ati: 1, sgi: -1 } },
      { visual: 'flat-line',  label: 'Flat Line',     desc: 'a perfectly flat line — thoughts very still or completely absent', scores: { ati: -3 } },
    ],
  },
  {
    prompt: 'The rhythm of today',
    visualType: 'shape',
    options: [
      { visual: 'heartbeat', label: 'Racing Pulse',   desc: 'a racing heartbeat waveform — fast, irregular, too much coming at once', scores: { ati: 3 } },
      { visual: 'slow-wave', label: 'Slow Wave',      desc: 'a slow undulating breath wave — unhurried, rhythmic, steady and patient', scores: { ati: -1, sgi: 2 } },
      { visual: 'flat-ekg',  label: 'Near Flat',      desc: 'a nearly flat line with one faint beat — very quiet, almost stopped', scores: { ati: -2, rbi: -1 } },
      { visual: 'erratic',   label: 'Erratic',        desc: 'an erratic chaotic signal — no pattern, energy with nowhere to land', scores: { ati: 2, sgi: -1 } },
    ],
  },
  {
    prompt: 'What your energy looks like as a pattern',
    visualType: 'shape',
    options: [
      { visual: 'dense-cluster', label: 'Dense Cluster', desc: 'a tight dense cluster of particles — concentrated, compressed, holding much in a small space', scores: { ati: 1, sgi: 1, rbi: -1 } },
      { visual: 'scattered',    label: 'Scattered',    desc: 'particles scattered wide across an empty field — dispersed, diffuse, hard to gather', scores: { sgi: -1, rbi: -1 } },
      { visual: 'single-dot',   label: 'Single Point', desc: 'a single point at the center — contained, quiet, drawing inward', scores: { ati: -2, rbi: -2 } },
      { visual: 'empty-void',   label: 'Empty Space',  desc: 'an empty circle — very little energy present, or energy turned completely inward', scores: { ati: -3, sgi: -2 } },
    ],
  },
  {
    prompt: 'How open is the door of your energy today',
    visualType: 'shape',
    options: [
      { visual: 'open-arch',   label: 'Wide Open',    desc: 'a wide open arch — fully available, no threshold, the world can walk in', scores: { rbi: 3 } },
      { visual: 'door-ajar',   label: 'Slightly Ajar', desc: 'a door slightly ajar — open enough to feel, not enough to fully enter', scores: { rbi: 1 } },
      { visual: 'door-closed', label: 'Mostly Closed', desc: 'a door mostly closed — politely unavailable, keeping the interior private', scores: { rbi: -2 } },
      { visual: 'door-sealed', label: 'Sealed',        desc: 'a sealed vault — no way in or out right now, fully retreated', scores: { rbi: -3, ati: -1 } },
    ],
  },
  {
    prompt: 'What the space between you and others feels like',
    visualType: 'shape',
    options: [
      { visual: 'close-circle', label: 'Close',         desc: 'two overlapping warm circles — close enough to feel the other\'s presence without space between', scores: { rbi: 3, sgi: 1 } },
      { visual: 'gap-circle',   label: 'Comfortable',   desc: 'two separate circles nearby — comfortable gap, independent but not distant', scores: { rbi: 1 } },
      { visual: 'far-circle',   label: 'Distant',       desc: 'two circles far apart on opposite ends — significant distance, self-contained', scores: { rbi: -2, sgi: 1 } },
      { visual: 'glass-wall',   label: 'Separated',     desc: 'two circles with a glass wall between — visible but not reachable, something transparent blocking the way', scores: { rbi: -3, ati: -1 } },
    ],
  },
  {
    prompt: 'The sound that would help most',
    visualType: 'gradient',
    options: [
      { visual: 'linear-gradient(180deg,#1e40af 0%,#3b82f6 40%,#bfdbfe 100%)', label: 'Heavy Waterfall', desc: 'a heavy continuous waterfall — consuming, masking, something to disappear inside', scores: { sgi: 1, ati: -1 } },
      { visual: 'linear-gradient(135deg,#14532d,#16a34a,#86efac)', label: 'Rustling Leaves', desc: 'nearby rustling dry leaves — gentle, almost a whisper, the world brushing against itself', scores: { sgi: 1, rbi: 1 } },
      { visual: 'linear-gradient(180deg,#e2e8f0,#cbd5e1,#94a3b8)', label: 'Distant Bird',   desc: 'a single bird calling far away — singular, unreachable, not quite lonely but alone', scores: { sgi: -1, rbi: -1 } },
      { visual: 'linear-gradient(180deg,#0f172a,#1e293b)', label: 'Silence',        desc: 'absolute silence — nothing at all, total stillness, the absence of everything incoming', scores: { ati: -2, rbi: -2 } },
    ],
  },
  {
    prompt: 'The terrain underfoot in your mind',
    visualType: 'photo',
    options: [
      { visual: px(1295503), fallback: 'linear-gradient(135deg,#475569,#1e293b)', label: 'Rocky Shore',   desc: 'a rocky shore — uneven, demanding balance, wildly beautiful', scores: { ati: 1, sgi: 2 } },
      { visual: px(167698),  fallback: 'linear-gradient(135deg,#166534,#14532d)', label: 'Forest Floor',  desc: 'soft forest floor — thick with accumulated life, cushioned and dark', scores: { sgi: 2, rbi: 1, ati: -1 } },
      { visual: px(1174732), fallback: 'linear-gradient(135deg,#f0c674,#e8d5a3)', label: 'Sandy Beach',   desc: 'open sandy beach — exposed, shifting under every step, something releasing', scores: { sgi: 1, rbi: 0 } },
      { visual: px(1001435), fallback: 'linear-gradient(135deg,#92400e,#fef3c7)', label: 'Arid Desert',   desc: 'arid desert — sparse, relentless space, a kind of lonely that has its own grandeur', scores: { sgi: -2, rbi: -2 } },
    ],
  },
  {
    prompt: 'The building your inner world lives in',
    visualType: 'photo',
    options: [
      { visual: px(380769),  fallback: 'linear-gradient(180deg,#1e3a5f,#bfdbfe)', label: 'Glass Tower',   desc: 'a swaying glass tower — high, exposed, slightly trembling, visible from everywhere', scores: { ati: 2, sgi: -1 } },
      { visual: px(1619232), fallback: 'linear-gradient(135deg,#78350f,#292524)', label: 'Crumbling Ruin', desc: 'a crumbling ruin — beautiful once, slowly releasing what it was holding', scores: { ati: -1, sgi: 1, rbi: -1 } },
      { visual: px(2082090), fallback: 'linear-gradient(135deg,#7c2d12,#1c1917)', label: 'Stone Cottage',  desc: 'a small firelit stone cottage — contained, warm, safe at the very core', scores: { ati: -1, sgi: 2, rbi: 2 } },
      { visual: px(956981),  fallback: 'linear-gradient(180deg,#f8fafc,#ffffff)', label: 'Blank White Room', desc: 'a vast blank white room — empty, infinite, without edges or warmth', scores: { sgi: -2, rbi: -2 } },
    ],
  },
]

// ─── Random question selection ────────────────────────────────────────────────
function pickQuestions(n = 10): Question[] {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const DISCLAIMER = `This platform generates a poetic simulation based on projective sensory preferences. It operates as an artistic mirror for self-reflection — not a substitute for medical or psychological assistance. If you are in distress, please connect with a licensed practitioner or support network.`

// ─── State ────────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'question' | 'loading' | 'result'

const phase    = ref<Phase>('intro')
const currentQ = ref(0)
const choosing = ref(false)
const showDisclaimer = ref(false)
const ati      = ref(0)
const sgi      = ref(0)
const rbi      = ref(0)
const selectedChoices = ref<string[]>([])
const questions = ref<Question[]>([])

interface ResultData { mirror: string; insight: string; invitation: string }
const result = ref<ResultData | null>(null)

// ─── Particle canvas ──────────────────────────────────────────────────────────
const canvasEl = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let mouseX = -999; let mouseY = -999

interface Particle {
  x: number; y: number; vx: number; vy: number
  baseR: number; baseAlpha: number; hue: number; phaseOffset: number
}

let particles: Particle[] = []
let targetHue = 240

function initParticles(w: number, h: number) {
  particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    baseR: 1.2 + Math.random() * 1.8,
    baseAlpha: 0.18 + Math.random() * 0.3,
    hue: 225 + Math.random() * 40,
    phaseOffset: Math.random() * Math.PI * 2,
  }))
}

function animateParticles(t: number) {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const w = canvas.width; const h = canvas.height

  // Slowly shift all hues toward targetHue
  particles.forEach(p => { p.hue += (targetHue + (Math.random() - 0.5) * 30 - p.hue) * 0.003 })

  ctx.clearRect(0, 0, w, h)

  const cx = w / 2; const cy = h / 2
  const isLoading = phase.value === 'loading'
  const breathe = 1 + Math.sin(t * 0.0008) * 0.15

  particles.forEach((p, i) => {
    const perParticle = Math.sin(t * 0.001 + p.phaseOffset)

    // Vortex pull during loading
    if (isLoading) {
      p.vx += (cx - p.x) * 0.00035
      p.vy += (cy - p.y) * 0.00035
    } else {
      // Gentle drift back to normal speed
      const speed = Math.hypot(p.vx, p.vy)
      if (speed > 0.5) { p.vx *= 0.99; p.vy *= 0.99 }
    }

    // Mouse repulsion
    const dx = p.x - mouseX; const dy = p.y - mouseY
    const dist = Math.hypot(dx, dy)
    if (dist < 120 && dist > 0) {
      const force = (120 - dist) / 120 * 0.8
      p.vx += (dx / dist) * force
      p.vy += (dy / dist) * force
    }

    p.x += p.vx; p.y += p.vy
    if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0

    const r = p.baseR * breathe * (1 + perParticle * 0.12)
    const a = p.baseAlpha * (0.8 + perParticle * 0.2) * breathe

    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${p.hue},55%,70%,${a})`
    ctx.fill()

    // Connection lines
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j]
      const qd = Math.hypot(p.x - q.x, p.y - q.y)
      if (qd < 90) {
        const la = (1 - qd / 90) * 0.11 * breathe
        ctx.beginPath()
        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
        ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2},55%,70%,${la})`
        ctx.lineWidth = 0.6
        ctx.stroke()
      }
    }
  })

  rafId = requestAnimationFrame(animateParticles)
}

watch(phase, (p) => {
  if (p === 'loading') targetHue = 290
  else if (p === 'result') targetHue = 200
  else targetHue = 240
})

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return

  const resize = () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    if (!particles.length) initParticles(canvas.width, canvas.height)
  }
  resize()
  window.addEventListener('resize', resize)

  const onMove = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      mouseX = e.touches[0]?.clientX ?? -999
      mouseY = e.touches[0]?.clientY ?? -999
    } else {
      mouseX = e.clientX; mouseY = e.clientY
    }
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('touchmove', onMove, { passive: true })

  rafId = requestAnimationFrame(animateParticles)

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('touchmove', onMove)
  })
})

// ─── Flow ─────────────────────────────────────────────────────────────────────
function begin() {
  questions.value     = pickQuestions(10)
  currentQ.value      = 0
  ati.value           = 0
  sgi.value           = 0
  rbi.value           = 0
  selectedChoices.value = []
  result.value        = null
  phase.value         = 'question'
}

async function selectOption(opt: VisualOption) {
  if (choosing.value) return
  choosing.value = true

  ati.value += opt.scores.ati ?? 0
  sgi.value += opt.scores.sgi ?? 0
  rbi.value += opt.scores.rbi ?? 0
  selectedChoices.value.push(opt.desc)

  await new Promise(r => setTimeout(r, 260))

  if (currentQ.value < questions.value.length - 1) {
    currentQ.value++
    choosing.value = false
  } else {
    phase.value    = 'loading'
    choosing.value = false
    await callUniverse()
  }
}

async function callUniverse() {
  const minDisplay = new Promise(r => setTimeout(r, 2600))
  try {
    const data = await $fetch<any>('/api/youniverse', {
      method: 'POST',
      body: { ati: ati.value, sgi: sgi.value, rbi: rbi.value, choices: selectedChoices.value }
    })
    await minDisplay
    result.value = { mirror: data.mirror, insight: data.insight, invitation: data.invitation }
  } catch (e: any) {
    await minDisplay
    if (e?.response?.status === 429 || e?.data?.statusCode === 429) {
      result.value = {
        mirror:     `There is a great deal of seeking happening in this space right now — more than the field can hold all at once.`,
        insight:    `The mirror will still be here when you return.`,
        invitation: `Step away for a few minutes. Drink something warm.`
      }
    } else {
      result.value = {
        mirror:     `There is something moving through the space around you today that doesn't have a name yet.`,
        insight:    `The part of you that has been carrying this already knows what it is.`,
        invitation: `Place both palms flat on the nearest surface and feel it push back.`
      }
    }
  }
  phase.value = 'result'
}

function restart() { phase.value = 'intro' }

// ─── Computed helpers ─────────────────────────────────────────────────────────
const q = computed(() => questions.value[currentQ.value])
const isPhotoQ = computed(() => q.value?.visualType === 'photo')

// Track photo load errors per tile index
const imgErrors = ref<boolean[]>([false, false, false, false])
watch(currentQ, () => { imgErrors.value = [false, false, false, false] })
function onImgError(i: number) { imgErrors.value[i] = true }
</script>

<template>
  <div class="yu-page">

    <!-- Particle canvas — always behind everything -->
    <canvas ref="canvasEl" class="yu-canvas" />

    <!-- Disclaimer toggle -->
    <button
      class="yu-help"
      :class="{ active: showDisclaimer }"
      @click="showDisclaimer = !showDisclaimer"
      aria-label="Disclaimer"
    >?</button>

    <Transition name="fade">
      <div v-if="showDisclaimer" class="yu-disclaimer-popup" @click="showDisclaimer = false">
        <p>{{ DISCLAIMER }}</p>
      </div>
    </Transition>

    <Transition name="phase" mode="out-in">

      <!-- ── Intro ──────────────────────────────────────────────── -->
      <div v-if="phase === 'intro'" key="intro" class="yu-intro">
        <span class="yu-eyebrow">YOUniverse</span>
        <h1 class="yu-intro-title">What are you<br>carrying today?</h1>
        <p class="yu-intro-sub">Ten images. No right answers. Only what resonates.</p>
        <button class="yu-orb" @click="begin" aria-label="Begin">
          <span class="yu-orb-inner" />
        </button>
      </div>

      <!-- ── Question ──────────────────────────────────────────── -->
      <div v-else-if="phase === 'question'" key="question" class="yu-q-wrap">

        <!-- Progress -->
        <div class="yu-progress">
          <div
            class="yu-progress-fill"
            :style="{ width: `${(currentQ / questions.length) * 100}%` }"
          />
          <div
            class="yu-progress-glow"
            :style="{ left: `${(currentQ / questions.length) * 100}%` }"
          />
        </div>

        <Transition name="qslide" mode="out-in">
          <div :key="currentQ" class="yu-question">

            <div class="yu-q-meta">
              <span class="yu-q-num">{{ currentQ + 1 }} / {{ questions.length }}</span>
            </div>

            <h2 class="yu-q-prompt">{{ q.prompt }}</h2>

            <!-- Visual tiles -->
            <div class="yu-tiles">
              <button
                v-for="(opt, i) in q.options"
                :key="opt.label"
                class="yu-tile"
                :class="[`yu-tile--${q.visualType}`]"
                :disabled="choosing"
                @click="selectOption(opt)"
              >
                <!-- Color type -->
                <span
                  v-if="q.visualType === 'color'"
                  class="yu-tile-color"
                  :style="{ background: opt.visual }"
                />

                <!-- Photo type -->
                <template v-else-if="q.visualType === 'photo'">
                  <img
                    v-if="!imgErrors[i]"
                    :src="opt.visual"
                    :alt="opt.label"
                    class="yu-tile-img"
                    loading="lazy"
                    @error="onImgError(i)"
                  />
                  <span
                    v-else
                    class="yu-tile-gradient"
                    :style="{ background: opt.fallback }"
                  />
                </template>

                <!-- Gradient type -->
                <span
                  v-else-if="q.visualType === 'gradient'"
                  class="yu-tile-gradient"
                  :style="{ background: opt.visual }"
                />

                <!-- Shape type -->
                <span
                  v-else-if="q.visualType === 'shape'"
                  class="yu-tile-shape"
                  v-html="SHAPES[opt.visual]"
                />

                <span class="yu-tile-label">{{ opt.label }}</span>
              </button>
            </div>

            <small v-if="isPhotoQ" class="yu-photo-credit">
              Photos: <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a>
            </small>

          </div>
        </Transition>
      </div>

      <!-- ── Loading ───────────────────────────────────────────── -->
      <div v-else-if="phase === 'loading'" key="loading" class="yu-loading">
        <p class="yu-loading-text">Reading the field…</p>
      </div>

      <!-- ── Result ────────────────────────────────────────────── -->
      <div v-else key="result" class="yu-result">
        <span class="yu-eyebrow">YOUniverse</span>

        <div v-if="result" class="yu-result-lines">
          <p class="yu-line yu-line--mirror"     style="--d:0ms">{{ result.mirror }}</p>
          <p class="yu-line yu-line--insight"    style="--d:700ms">{{ result.insight }}</p>
          <p class="yu-line yu-line--invitation" style="--d:1400ms">{{ result.invitation }}</p>
        </div>

        <button class="yu-restart" style="--d:2100ms" @click="restart">
          Listen again today
        </button>
      </div>

    </Transition>
  </div>
</template>

<style scoped>
/* ── Base ── */
.yu-page {
  min-height: 100dvh;
  background: #08080f;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.yu-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* ── Disclaimer ── */
.yu-help {
  position: fixed;
  bottom: calc(24rem + var(--safe-bottom, 0px));
  right: 24rem;
  z-index: 10;
  width: 32rem;
  height: 32rem;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.4);
  font-family: inherit;
  font-size: 13rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
}
.yu-help.active { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }

.yu-disclaimer-popup {
  position: fixed;
  bottom: calc(68rem + var(--safe-bottom, 0px));
  right: 24rem;
  max-width: 280rem;
  background: rgba(15,17,30,0.95);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12rem;
  padding: 14rem 16rem;
  z-index: 10;
  cursor: pointer;
}
.yu-disclaimer-popup p {
  font-size: 11rem;
  line-height: 1.65;
  opacity: 0.55;
  margin: 0;
  font-style: italic;
}

/* ── Intro ── */
.yu-intro {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 28rem;
  padding: 0 24rem;
}

.yu-eyebrow {
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.3;
}

.yu-intro-title {
  font-size: clamp(28rem, 5vw, 48rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
}

.yu-intro-sub {
  font-size: 14rem;
  opacity: 0.4;
  margin: 0;
  letter-spacing: 0.01em;
}

/* Pulsing orb button */
.yu-orb {
  width: 64rem;
  height: 64rem;
  border-radius: 50%;
  border: 1.5px solid rgba(148,163,184,0.4);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: orbBreathe 3.5s ease-in-out infinite;
  transition: border-color 0.2s;
}
.yu-orb:hover { border-color: rgba(148,163,184,0.8); }
.yu-orb-inner {
  width: 24rem;
  height: 24rem;
  border-radius: 50%;
  background: rgba(148,163,184,0.25);
  animation: orbBreathe 3.5s ease-in-out infinite reverse;
}

@keyframes orbBreathe {
  0%, 100% { transform: scale(0.88); opacity: 0.6; }
  50%       { transform: scale(1.12); opacity: 1; }
}

/* ── Question ── */
.yu-q-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 640rem;
  padding: var(--page-top, 80rem) 24rem 40rem;
}

.yu-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255,255,255,0.06);
  z-index: 5;
}
.yu-progress-fill {
  height: 100%;
  background: rgba(148,163,184,0.5);
  border-radius: 2px;
  transition: width 0.45s ease;
}
.yu-progress-glow {
  position: absolute;
  top: -1px;
  width: 6px;
  height: 4px;
  background: #a5b4fc;
  border-radius: 50%;
  filter: blur(3px);
  transform: translateX(-50%);
  transition: left 0.45s ease;
  pointer-events: none;
}

.yu-question {
  display: flex;
  flex-direction: column;
  gap: 24rem;
}

.yu-q-meta { display: flex; justify-content: flex-end; }
.yu-q-num {
  font-size: 11rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  opacity: 0.25;
}

.yu-q-prompt {
  font-size: clamp(18rem, 3vw, 26rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0;
  opacity: 0.9;
}

/* ── Tiles ── */
.yu-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10rem;
}

.yu-tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: 16rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s;
  animation: tileIn 0.4s ease both;
}
.yu-tile:nth-child(1) { animation-delay: 0ms }
.yu-tile:nth-child(2) { animation-delay: 70ms }
.yu-tile:nth-child(3) { animation-delay: 140ms }
.yu-tile:nth-child(4) { animation-delay: 210ms }

@keyframes tileIn {
  from { opacity: 0; transform: translateY(22rem) scale(0.93) }
  to   { opacity: 1; transform: none }
}

.yu-tile:hover:not(:disabled) {
  transform: scale(1.04);
  border-color: rgba(165,180,252,0.4);
  box-shadow: 0 0 20px rgba(99,102,241,0.2);
}
.yu-tile:active:not(:disabled) { transform: scale(0.94); }
.yu-tile:disabled { opacity: 0.45; cursor: default; }

/* Color tile */
.yu-tile-color {
  width: 65%;
  aspect-ratio: 1;
  border-radius: 50%;
  display: block;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}

/* Photo tile */
.yu-tile-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15rem;
}

/* Gradient tile */
.yu-tile-gradient {
  position: absolute;
  inset: 0;
  border-radius: 15rem;
}

/* Shape tile */
.yu-tile-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72%;
  height: 72%;
  color: rgba(165,180,252,0.8);
}
.yu-tile-shape :deep(svg) {
  width: 100%;
  height: 100%;
}

/* Label — tiny, at bottom */
.yu-tile-label {
  position: absolute;
  bottom: 8rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10rem;
  font-weight: 500;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.04em;
  pointer-events: none;
  z-index: 2;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
}

/* Photo labels need stronger contrast */
.yu-tile--photo .yu-tile-label {
  color: rgba(255,255,255,0.85);
  text-shadow: 0 1px 6px rgba(0,0,0,0.9);
}

.yu-photo-credit {
  font-size: 10rem;
  opacity: 0.25;
  text-align: right;
}
.yu-photo-credit a { color: inherit; }

/* ── Loading ── */
.yu-loading {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.yu-loading-text {
  font-size: 14rem;
  opacity: 0;
  letter-spacing: 0.08em;
  font-style: italic;
  margin: 0;
  animation: fadeInDelayed 0.6s ease 0.5s forwards;
}
@keyframes fadeInDelayed { to { opacity: 0.35; } }

/* ── Result ── */
.yu-result {
  position: relative;
  z-index: 1;
  max-width: 560rem;
  padding: var(--page-top, 80rem) 28rem 80rem;
  display: flex;
  flex-direction: column;
  gap: 48rem;
}

.yu-result-lines {
  display: flex;
  flex-direction: column;
  gap: 28rem;
}

.yu-line {
  margin: 0;
  opacity: 0;
  transform: translateY(14rem);
  animation: lineReveal 0.65s ease forwards;
  animation-delay: var(--d, 0ms);
}
@keyframes lineReveal { to { opacity: 1; transform: none } }

.yu-line--mirror {
  font-size: clamp(17rem, 2.4vw, 22rem);
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.01em;
}
.yu-line--insight {
  font-size: clamp(14rem, 1.9vw, 18rem);
  line-height: 1.7;
  opacity: 0; /* set by animation */
  color: rgba(226,232,240,0.65);
}
.yu-line--invitation {
  font-size: clamp(12rem, 1.6vw, 15rem);
  font-style: italic;
  line-height: 1.75;
  color: rgba(165,180,252,0.7);
}

.yu-restart {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.3);
  font-family: inherit;
  font-size: 13rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.02em;
  opacity: 0;
  animation: lineReveal 0.5s ease forwards;
  animation-delay: var(--d, 2100ms);
  transition: color 0.15s;
}
.yu-restart:hover { color: rgba(255,255,255,0.7); }

/* ── Phase transitions ── */
.phase-enter-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.phase-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.phase-enter-from { opacity: 0; transform: translateY(20rem); }
.phase-leave-to  { opacity: 0; transform: translateY(-16rem); }

/* ── Question transitions ── */
.qslide-enter-active { transition: opacity 0.36s ease, transform 0.36s ease; }
.qslide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.qslide-enter-from   { opacity: 0; transform: translateY(24rem); }
.qslide-leave-to     { opacity: 0; transform: translateY(-18rem); }

/* ── Fade ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Mobile ── */
@media (max-width: 480px) {
  .yu-tiles { gap: 8rem; }
  .yu-q-prompt { font-size: 18rem; }
}
</style>
