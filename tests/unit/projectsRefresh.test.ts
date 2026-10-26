import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isRefreshWeek, triggerProjectsRefresh } from '../../scripts/trigger-projects-refresh.ts'

const hookUrl = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/test-only-hook'
const ref = 'refs/heads/main'

test('alternates Monday refresh weeks across month and year boundaries', () => {
  const cases = [
    ['2026-10-26T04:17:00Z', true],
    ['2026-11-02T04:17:00Z', false],
    ['2026-11-09T04:17:00Z', true],
    ['2026-12-28T04:17:00Z', false],
    ['2027-01-04T04:17:00Z', true],
    ['2027-01-11T04:17:00Z', false],
  ] as const
  for (const [date, expected] of cases) assert.equal(isRefreshWeek(new Date(date)), expected, date)
  assert.throws(() => isRefreshWeek(new Date('invalid')), /Invalid refresh date/)
})

test('off weeks do not need the hook secret or make a network request', async () => {
  const result = await triggerProjectsRefresh({
    event: 'schedule',
    ref,
    hookUrl: undefined,
    now: new Date('2026-11-02T04:17:00Z'),
    fetcher: async () => { throw new Error('Must not request a build') },
  })
  assert.equal(result, false)
})

test('due weeks and manual runs request a build, including manual runs on off weeks', async () => {
  for (const event of ['schedule', 'workflow_dispatch']) {
    let calls = 0
    const result = await triggerProjectsRefresh({
      event,
      ref,
      hookUrl,
      now: new Date(event === 'schedule' ? '2026-11-09T04:17:00Z' : '2026-11-02T04:17:00Z'),
      fetcher: async (url, options) => {
        calls++
        assert.equal(url, hookUrl)
        assert.equal(options.method, 'POST')
        assert.equal(options.redirect, 'error')
        assert.ok(options.signal instanceof AbortSignal)
        return Response.json({ success: true })
      },
    })
    assert.equal(result, true)
    assert.equal(calls, 1)
  }
})

test('rejects other branches and event types before contacting Cloudflare', async () => {
  for (const options of [
    { event: 'workflow_dispatch', ref: 'refs/heads/feature/github-projects-sync' },
    { event: 'pull_request', ref },
    { event: 'push', ref },
  ]) {
    await assert.rejects(triggerProjectsRefresh({ ...options, hookUrl }), /only for scheduled or manual runs on main/)
  }
})

test('rejects absent or unexpected hook URLs without exposing their contents', async () => {
  for (const invalidUrl of [undefined, 'http://api.cloudflare.com/secret', 'https://example.com/secret', `${hookUrl}?secret=hidden`]) {
    await assert.rejects(triggerProjectsRefresh({ event: 'workflow_dispatch', ref, hookUrl: invalidUrl }), {
      message: 'Configure CLOUDFLARE_PAGES_DEPLOY_HOOK with a valid Cloudflare Pages deploy hook URL.',
    })
  }
})

test('network errors do not expose the secret hook, and HTTP/API failures are reported', async () => {
  await assert.rejects(triggerProjectsRefresh({ event: 'workflow_dispatch', ref, hookUrl, fetcher: async () => {
    throw new Error(`Could not fetch ${hookUrl}`)
  } }), { message: 'Cloudflare build request failed or timed out. Check the Pages dashboard before retrying.' })
  for (const response of [
    new Response('Unavailable', { status: 503 }),
    Response.json({ success: false, errors: [{ message: 'Rejected' }] }),
    new Response('Invalid JSON'),
  ]) {
    await assert.rejects(triggerProjectsRefresh({ event: 'workflow_dispatch', ref, hookUrl, fetcher: async () => response }))
  }
})
