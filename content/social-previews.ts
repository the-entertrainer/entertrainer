import { ENTROPY_BLOG, INTELLIGENCE_BLOG, MOONLY_BLOG, AI_UNDERSTAND_BLOG } from './blogs'

export const SITE_URL = 'https://entertrainer.in'

export type SocialPreview = {
  key: string
  label: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  type?: 'article' | 'website'
}

export const SOCIAL_PREVIEWS: Record<string, SocialPreview> = {
  '/': {
    key: 'home',
    label: 'Stories, tools, and courses',
    title: 'Entertrainer · Elevate, Empower, Educate',
    description: 'Stories for the questions that keep returning, tools for the work that keeps repeating, and courses for the things nobody explained properly the first time.',
    image: `${SITE_URL}/og-card.png`,
    imageAlt: 'Entertrainer home: stories, tools, and courses by Naveen Jose.'
  },
  '/about': {
    key: 'about',
    label: 'About Me',
    title: 'About Me · Naveen Jose',
    description: 'Naveen Jose writes about moving from hotel operations into learning design, building tools, and making The SEWA Chronicles.'
  },
  '/elevate': {
    key: 'elevate',
    label: 'The Entertrainer Blogs',
    title: 'Elevate · The Entertrainer Blogs',
    description: 'Articles about work, learning, technology, and the questions that stay with you.',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/oLmjqBPjwBxcOjsd.jpg',
    imageAlt: 'Night city lights for the Elevate blog section.'
  },
  [`/elevate/${ENTROPY_BLOG.slug}`]: {
    key: 'entropy-laziness',
    label: ENTROPY_BLOG.category,
    title: ENTROPY_BLOG.title,
    description: ENTROPY_BLOG.dek,
    image: ENTROPY_BLOG.hero,
    imageAlt: ENTROPY_BLOG.heroAlt,
    type: 'article'
  },
  [`/elevate/${INTELLIGENCE_BLOG.slug}`]: {
    key: 'intelligence-blog',
    label: INTELLIGENCE_BLOG.category,
    title: INTELLIGENCE_BLOG.title,
    description: INTELLIGENCE_BLOG.dek,
    image: INTELLIGENCE_BLOG.hero,
    imageAlt: INTELLIGENCE_BLOG.heroAlt,
    type: 'article'
  },
  [`/elevate/${MOONLY_BLOG.slug}`]: {
    key: 'moon-moonly',
    label: MOONLY_BLOG.category,
    title: MOONLY_BLOG.title,
    description: MOONLY_BLOG.dek,
    imageAlt: MOONLY_BLOG.heroAlt,
    type: 'article'
  },
  [`/elevate/${AI_UNDERSTAND_BLOG.slug}`]: {
    key: 'ai-understand',
    label: AI_UNDERSTAND_BLOG.category,
    title: AI_UNDERSTAND_BLOG.title,
    description: AI_UNDERSTAND_BLOG.dek,
    imageAlt: AI_UNDERSTAND_BLOG.heroAlt,
    type: 'article'
  },
  '/empower': {
    key: 'empower',
    label: 'Free web apps',
    title: 'Empower · Free tools by Entertrainer',
    description: 'Small browser tools for writing, planning, quizzes, and the repetitive parts of learning work.'
  },
  '/tools': {
    key: 'tools',
    label: 'Free web apps',
    title: 'Free tools by Naveen Jose · Entertrainer',
    description: 'Free browser tools for planning, writing, making quizzes, and sketching ideas.'
  },
  '/tools/storygen': {
    key: 'storygen',
    label: 'Storyboard Studio',
    title: 'StoryGen · Storyboard Studio',
    description: 'Design instructional storyboards on an infinite canvas. Pick a framework, connect the screens, and export the working plan to Word or Excel.'
  },
  '/tools/easymcq': {
    key: 'easymcq',
    label: 'Distractor Generator',
    title: 'EasyMCQ · Distractor Generator',
    description: 'Give a question and its correct answer, and EasyMCQ writes three plausible wrong options that test real understanding.'
  },
  '/tools/cadence': {
    key: 'cadence',
    label: 'Training Calendar Generator',
    title: 'Cadence · Training Calendar Generator',
    description: 'Turn a topic list into a ready-to-present monthly training calendar, laid out around holidays, audiences, and time slots.'
  },
  '/tools/better-emails': {
    key: 'draftly',
    label: 'Email Polisher',
    title: 'Draftly · Email Polisher',
    description: 'Turn messy drafts into clear, professional emails, with a plain-language note on what changed and why.'
  },
  '/educate': {
    key: 'educate',
    label: 'Courses and lessons',
    title: 'Educate · Courses and lessons by Entertrainer',
    description: 'Courses and lessons by Naveen Jose, built to make complicated subjects easier to understand and use.'
  },
  '/courses/ai-atlas': {
    key: 'ai-atlas',
    label: 'Course',
    title: 'From No AI to Know AI · Entertrainer',
    description: 'A short, visual, beginner course tracing AI from early ideas to responsible modern use.',
    image: `${SITE_URL}/work/ai-course-cover.png`,
    imageAlt: 'Cover image for the From No AI to Know AI course.'
  },
  '/instructional-design': {
    key: 'instructional-design',
    label: 'Course',
    title: 'Introduction to Instructional Design · Entertrainer',
    description: 'A compact beginner e-learning module about planning learning experiences that help people do real work, starting with the task rather than the course.'
  },
  '/lessons': {
    key: 'lessons',
    label: 'Lessons',
    title: 'Lessons by Naveen Jose · Entertrainer',
    description: 'A short lesson on clear instructions and a longer course on artificial intelligence.'
  },
  '/games': {
    key: 'games',
    label: 'Games',
    title: 'Games · Entertrainer',
    description: 'Games from Entertrainer. New games will be added here.'
  },
  '/games/ekans': {
    key: 'ekans',
    label: 'Game',
    title: 'EKANS · Entertrainer',
    description: 'You don’t steer the snake. You place what it eats, and try to close every route it has left. A Snake tribute, inverted.'
  },
  '/my-work/sewa-chronicles': {
    key: 'sewa-chronicles',
    label: 'Comic',
    title: 'The SEWA Chronicles',
    description: 'A hand-drawn comic built from service stories gathered on the resort floor.',
    image: `${SITE_URL}/work/sewa/cover.webp`,
    imageAlt: 'The SEWA Chronicles cover, a comic about service, empathy, warmth, and attentiveness.',
    type: 'article'
  },
  '/my-work/strong': {
    key: 'strong',
    label: 'Interactive learning',
    title: 'Strong · How passwords really break',
    description: 'The real maths behind password strength, made playable. Nothing you type ever leaves your device.'
  },
  '/colophon': {
    key: 'colophon',
    label: 'Colophon',
    title: 'Colophon · How this site is built',
    description: 'How Entertrainer is put together: Nuxt, an editorial design system, and open-source typefaces.'
  }
}

export function getSocialPreview(path: string): SocialPreview {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path
  return SOCIAL_PREVIEWS[normalized] ?? SOCIAL_PREVIEWS['/']
}

export function getSocialPreviewByKey(key: string): SocialPreview | undefined {
  return Object.values(SOCIAL_PREVIEWS).find((preview) => preview.key === key)
}

export function getSocialImage(preview: SocialPreview): string {
  return preview.image ?? `${SITE_URL}/api/social-card/${preview.key}.png`
}
