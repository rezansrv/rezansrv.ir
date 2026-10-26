import type { FetchRequest } from './github-projects.ts'

// Monday 2026-10-26 is the fixed anchor. Weeks alternate across month/year boundaries.
const anchor = Date.UTC(2026, 9, 26)
const weekMilliseconds = 7 * 24 * 60 * 60 * 1000

export function isRefreshWeek(now: Date): boolean {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid refresh date.')
  const week = Math.floor((now.getTime() - anchor) / weekMilliseconds)
  return week >= 0 && week % 2 === 0
}

interface RefreshOptions {
  event: string | undefined
  ref: string | undefined
  hookUrl: string | undefined
  now?: Date
  fetcher?: FetchRequest
}

export async function triggerProjectsRefresh({
  event,
  ref,
  hookUrl,
  now = new Date(),
  fetcher = fetch,
}: RefreshOptions): Promise<boolean> {
  if (ref !== 'refs/heads/main' || !['schedule', 'workflow_dispatch'].includes(event ?? '')) {
    throw new Error('Project refresh is allowed only for scheduled or manual runs on main.')
  }
  if (event === 'schedule' && !isRefreshWeek(now)) return false

  let hook: URL
  try {
    hook = new URL(hookUrl ?? '')
    if (hook.protocol !== 'https:' || hook.hostname !== 'api.cloudflare.com'
      || hook.port || hook.username || hook.password || hook.search || hook.hash
      || !/^\/client\/v4\/pages\/webhooks\/deploy_hooks\/[\w-]+$/.test(hook.pathname)) {
      throw new Error('Invalid hook')
    }
  }
  catch {
    throw new Error('Configure CLOUDFLARE_PAGES_DEPLOY_HOOK with a valid Cloudflare Pages deploy hook URL.')
  }

  let response: Response
  try {
    response = await fetcher(hook.href, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    })
  }
  catch {
    // Do not print an exception containing the secret hook URL.
    throw new Error('Cloudflare build request failed or timed out. Check the Pages dashboard before retrying.')
  }
  if (!response.ok) throw new Error(`Cloudflare rejected the build request (HTTP ${response.status}).`)

  let result: unknown
  try {
    result = await response.json()
  }
  catch {
    throw new Error('Cloudflare returned an invalid build response. Check the Pages dashboard before retrying.')
  }
  if (typeof result !== 'object' || result === null || !('success' in result) || result.success !== true) {
    throw new Error('Cloudflare did not confirm the build request. Check the Pages dashboard before retrying.')
  }
  return true
}

if (import.meta.main) {
  try {
    const triggered = await triggerProjectsRefresh({
      event: process.env.GITHUB_EVENT_NAME,
      ref: process.env.GITHUB_REF,
      hookUrl: process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK,
    })
    process.stdout.write(triggered
      ? 'Cloudflare accepted the build request. Monitor Pages for the build and deployment result.\n'
      : 'Skipping this week; project refresh runs every other Monday.\n')
  }
  catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : 'Project refresh failed.'}\n`)
    process.exitCode = 1
  }
}
