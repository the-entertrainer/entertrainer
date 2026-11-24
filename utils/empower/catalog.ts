export type ToolGroup = 'Write' | 'Read' | 'Decide' | 'Learn'

export interface EmpowerTool {
  slug: string
  href: string
  title: string
  group: ToolGroup
  task: string
  blurb: string
  keywords: string
}

export const TOOL_GROUPS: ToolGroup[] = ['Write', 'Read', 'Decide', 'Learn']

export const EMPOWER_TOOLS: EmpowerTool[] = [
  {
    slug: 'plain-speak',
    href: '/empower/plain-speak',
    title: 'Plain-Speak Meter',
    group: 'Write',
    task: 'Make a draft easier to read',
    blurb: 'Score readability, mark jargon and long sentences, and copy a plainer version.',
    keywords: 'write readability jargon clarity plain fog wording draft',
  },
  {
    slug: 'talk-track',
    href: '/empower/talk-track',
    title: 'Talk Track',
    group: 'Write',
    task: 'Turn slides into words you would say',
    blurb: 'Paste an outline or drop a deck. Get speaker notes and timing.',
    keywords: 'write slides notes presentation pptx narration speaker deck',
  },
  {
    slug: 'snap-to-text',
    href: '/empower/snap-to-text',
    title: 'Snap-to-Text',
    group: 'Read',
    task: 'Read text out of a photo',
    blurb: 'On-device OCR from a camera or an image. The photo stays here.',
    keywords: 'read ocr photo camera image scan receipt whiteboard text',
  },
  {
    slug: 'pdf-kit',
    href: '/empower/pdf-kit',
    title: 'PDF Kit',
    group: 'Read',
    task: 'Merge, split, reorder, or sign a PDF',
    blurb: 'PDFs that never go to a server.',
    keywords: 'read pdf merge split compress reorder sign document',
  },
  {
    slug: 'access-check',
    href: '/empower/access-check',
    title: 'Access Check',
    group: 'Read',
    task: 'A first pass on a PDF or Word file',
    blurb: 'Headings, missing alt text, and contrast hints. Not a formal audit.',
    keywords: 'read accessibility wcag pdf docx alt headings contrast',
  },
  {
    slug: 'goal-shaper',
    href: '/empower/goal-shaper',
    title: 'Goal Shaper',
    group: 'Decide',
    task: 'Turn a vague goal into a plan',
    blurb: 'A SMART statement and steps. Learning mode uses Bloom’s verbs.',
    keywords: 'decide smart goal plan objective deadline',
  },
  {
    slug: 'decision-matrix',
    href: '/empower/decision-matrix',
    title: 'Decision Matrix',
    group: 'Decide',
    task: 'Weight options and see what wins',
    blurb: 'Name the options. Weight what matters. See what wins.',
    keywords: 'decide weight options criteria choice winner matrix compare',
  },
  {
    slug: 'recall-cards',
    href: '/empower/recall-cards',
    title: 'Recall Cards',
    group: 'Learn',
    task: 'Remember notes later',
    blurb: 'Paste notes into a deck and review them with spaced repetition.',
    keywords: 'learn flashcards memory spaced notes study recall cards',
  },
]

export const LEARNING_MODE_LINK = {
  href: '/empower/goal-shaper?mode=learning',
  title: 'Goal Shaper in learning-objective mode',
  task: 'Write an objective with audience, behaviour, condition, and degree.',
  keywords: 'learn learning objective bloom goal shaper lesson teacher',
}

export const MORE_TOOLS = [
  {
    href: '/tools/cadence',
    title: 'Cadence',
    blurb: 'A monthly training calendar from a topic list.',
    keywords: 'calendar training schedule cadence more',
  },
  {
    href: '/tools/storygen',
    title: 'StoryGen',
    blurb: 'A storyboard for instructional design.',
    keywords: 'storyboard storygen lesson design more',
  },
]

export function toolBySlug(slug: string): EmpowerTool | undefined {
  return EMPOWER_TOOLS.find(tool => tool.slug === slug)
}

export function toolsInGroup(group: ToolGroup): EmpowerTool[] {
  return EMPOWER_TOOLS.filter(tool => tool.group === group)
}
