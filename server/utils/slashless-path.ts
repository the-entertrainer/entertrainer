/**
 * Slashless destination for a path that already has no trailing slash.
 * Mirrors nuxt routeRules so a slashed URL can jump straight to the final
 * target instead of bouncing through the slashless path first.
 */
const EXACT: Record<string, string> = {
  '/tools/training-cal-gen': '/tools/cadence',
  '/tools/storyforge-id': '/tools/storygen',
  '/tools/easymcq': '/empower',
  '/tools/better-emails': '/empower',
  '/tools': '/empower',
  '/blogs': '/elevate',
  '/educate': '/',
  '/downloads': '/',
  '/my-work': '/about#sewa-chronicles',
  '/engage/pictune': '/engage',
  '/engage/velocity': '/engage',
  '/engage/vilakku': '/engage',
  '/engage/vybe': '/engage',
  '/engage/squash': '/engage',
  '/engage/fever': '/engage',
  '/engage/netagiri': '/engage',
  '/engage/gateway': '/engage',
  '/engage/third-eye': '/engage',
  '/engage/solfeggio': '/engage',
  '/engage/brainwave': '/engage',
  '/elevate/if-you-are-intelligent-life-might-not-be-easy': '/elevate',
  '/elevate/does-ai-understand-you': '/elevate',
  '/elevate/how-to-lie-perfectly': '/elevate',
  '/elevate/the-voice-in-your-head-is-not-the-whole-of-you': '/elevate',
  '/elevate/you-are-the-centre-of-the-universe': '/elevate',
  '/elevate/can-you-reverse-the-spin-of-a-schwarz-surface': '/elevate',
  '/elevate/the-sacred-frequencies-are-not-a-scale': '/elevate/what-each-sacred-frequency-is-for',
  '/games': '/engage',
  '/dialogue/index.html': '/dialogue',
}

export function slashlessTarget(path: string): string {
  if (EXACT[path]) return EXACT[path]
  if (path === '/tools/easymcq' || path.startsWith('/tools/easymcq/')) return '/empower'
  if (path === '/tools/better-emails' || path.startsWith('/tools/better-emails/')) return '/empower'
  if (path === '/educate' || path.startsWith('/educate/')) return '/'
  if (path.startsWith('/blogs/')) {
    const elevated = '/elevate' + path.slice('/blogs'.length)
    return EXACT[elevated] || elevated
  }
  if (path.startsWith('/games/')) {
    const engaged = '/engage' + path.slice('/games'.length)
    return EXACT[engaged] || engaged
  }
  return path
}
