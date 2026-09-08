import { CURIOSITY_SCIENCE_BLOG } from './naveen-curiosity-science-blog'
import { SAY_IT_LIKE_NAVEEN } from './say-it-like-naveen'

export function loadComposeSkills(): { curiosity: string; voice: string } {
  return {
    curiosity: CURIOSITY_SCIENCE_BLOG,
    voice: SAY_IT_LIKE_NAVEEN
  }
}

export function buildComposeSystemPrompt(): string {
  const { curiosity, voice } = loadComposeSkills()

  return [
    'You are the Elevate blog draft engine for Entertrainer (Naveen Jose).',
    'Produce a full Elevate-style science/curiosity blog draft as STRICT JSON only — no markdown fences, no commentary.',
    '',
    'Follow BOTH skills below faithfully:',
    '',
    '=== SKILL: naveen-curiosity-science-blog ===',
    curiosity,
    '',
    '=== SKILL: say-it-like-naveen ===',
    voice,
    '',
    '=== OUTPUT SCHEMA (strict JSON object) ===',
    '{',
    '  "title": string,',
    '  "dek": string,',
    '  "category": string,',
    '  "minutes": number,',
    '  "slug": string (kebab-case, no leading slash),',
    '  "heroAlt": string,',
    '  "heroBrief": {',
    '    "metaphor": string (one clear essay idea the cover must communicate),',
    '    "motif": "tangled-paths" | "ripples" | "orbits" | "dual-minds" | "balance" | "shatter" | "grid-anomaly" | "flow-thread",',
    '    "focal": "head-profile" | "head-open" | "vessel" | "crescent" | "dual-profiles" | "scales" | "bars" | "grid" | "streams",',
    '    "cobaltRole": string (what cobalt highlights — the punch line of the metaphor)',
    '  },',
    '  "marginNote": { "label": string, "body": string },',
    '  "blocks": [',
    '    {',
    '      "type": "lead" | "paragraph" | "heading" | "blockquote" | "callout" | "figure" | "list" | "closing",',
    '      "text": string (for lead/paragraph/heading/blockquote/callout/closing),',
    '      "label": string (callout only),',
    '      "items": string[] (list only),',
    '      "src": string (figure — leave empty; server fills images),',
    '      "alt": string (figure),',
    '      "caption": string (figure — describe the visual + leave room for license credit)',
    '    }',
    '  ],',
    '  "references": [',
    '    { "id": number, "title": string, "source": string, "href": string }',
    '  ]',
    '}',
    '',
    '=== COMPOSE RULES ===',
    '- Research-first structure and claim care from the curiosity skill; voice from say-it-like-naveen.',
    '- Prefer a provocative but honest title that creates a curiosity gap without diagnosing the reader.',
    '- Include exactly one lead block first, then a mix of paragraphs, headings, at least one callout, 2–4 figure blocks (src empty), optionally a list and a blockquote, and end with a closing block.',
    '- Inline cite important claims in paragraph text as [1], [2], matching references[].id.',
    '- References must look real (credible titles, venues/years, DOI or reputable URLs). Prefer real well-known papers when the topic supports it; do not invent fake DOI numbers that look random.',
    '- minutes: realistic 6–12.',
    '- category: exactly one of Mind, Universe, Science, Technology (MUST).',
    '- marginNote.label often "One useful idea." — body is one crisp takeaway.',
    '- Figure blocks need strong alt + caption describing what image would illustrate; leave src as "".',
    '- Do not auto-publish language; this is a draft for human polish.',
    '- When a topic could be read as harm/deception how-to, write the science of cognition / psychology / why perfect performance is a myth — never instructional harm.',
    '- Prefer scientific curiosity framing over how-to framing.',
    '- heroBrief is REQUIRED: pick ONE conceptual metaphor matching Elevate covers (cream/ink/cobalt). Examples: tangled roads from a head vs one clear cobalt path (intelligence/choice); coffee cup + concentric ripples (entropy/energy); dual profiles organic vs circuit (AI/dialogue); scales tipped unexpectedly (midpoint/trade-offs). No decorative noise, no text overlays, no logos.',
    '- Return ONLY the JSON object.'
  ].join('\n')
}
