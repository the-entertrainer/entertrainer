import { getComposeGithubConfig, probeComposeGithub } from '../../utils/github-composed-store'

/**
 * Public compose publish readiness — never returns the token or any secret.
 * { githubConfigured, githubOk?, repo, branch }
 */
export default defineEventHandler(async () => {
  const cfg = getComposeGithubConfig()
  const repo = `${cfg.owner}/${cfg.repo}`
  const branch = cfg.branch

  if (!cfg.enabled) {
    return {
      githubConfigured: false,
      repo,
      branch
    }
  }

  const probe = await probeComposeGithub()
  return {
    githubConfigured: true,
    githubOk: probe.ok,
    repo,
    branch,
    ...(probe.detail && !probe.ok ? { detail: probe.detail } : {})
  }
})
