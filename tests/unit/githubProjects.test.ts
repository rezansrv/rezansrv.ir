import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, rmdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fetchGithubProjects, syncGithubProjects, type FetchRequest } from '../../scripts/github-projects.ts'

function repository(id: number, changes: Record<string, unknown> = {}) {
  return {
    id,
    name: `project-${id}`,
    html_url: `https://github.com/rezansrv/project-${id}`,
    owner: { login: 'rezansrv' },
    private: false,
    fork: false,
    stargazers_count: 5,
    description: `Description ${id}`,
    ...changes,
  }
}

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status })

test('collects all pages, excludes forks/private repositories, and retains archived projects', async () => {
  const pages = [
    [repository(1, { archived: true }), ...Array.from({ length: 99 }, (_, index) => repository(index + 2, { fork: true }))],
    [repository(101, { stargazers_count: 12 }), repository(102, { private: true })],
  ]
  const calls: URL[] = []
  const projects = await fetchGithubProjects({
    token: 'test-only-token',
    fetcher: async (url, options) => {
      calls.push(new URL(url))
      const headers = new Headers(options.headers)
      assert.equal(headers.get('Authorization'), 'Bearer test-only-token')
      assert.equal(options.redirect, 'error')
      assert.ok(options.signal instanceof AbortSignal)
      return json(pages[calls.length - 1])
    },
  })
  assert.deepEqual(calls.map(url => url.searchParams.get('page')), ['1', '2'])
  assert.ok(calls.every(url => url.origin === 'https://api.github.com'
    && url.searchParams.get('per_page') === '100' && url.searchParams.get('type') === 'owner'))
  assert.deepEqual(projects.map(project => project.name), ['project-101', 'project-1'])
  assert.deepEqual(Object.keys(projects[0]!).sort(), ['description', 'name', 'stars', 'url'])
})

test('equal-star ordering is deterministic and null descriptions become empty text', async () => {
  const records = [repository(2, { description: null }), repository(1), repository(3, { stargazers_count: 9 })]
  const projects = await fetchGithubProjects({ fetcher: async () => json(records) })
  assert.deepEqual(projects.map(project => project.name), ['project-3', 'project-1', 'project-2'])
  assert.equal(projects[2]!.description, '')
})

test('public requests work without a credential', async () => {
  await fetchGithubProjects({ fetcher: async (_url, options) => {
    assert.equal(new Headers(options.headers).has('Authorization'), false)
    return json([repository(1)])
  } })
})

test('an exactly full final page is followed by an empty page', async () => {
  let calls = 0
  const projects = await fetchGithubProjects({ fetcher: async () => json(++calls === 1
    ? Array.from({ length: 100 }, (_, index) => repository(index + 1))
    : []) })
  assert.equal(projects.length, 100)
  assert.equal(calls, 2)
})

test('rejects empty results, malformed records, unsafe URLs, and unexpected owners', async () => {
  const invalidPages = [
    [],
    [repository(1, { fork: true })],
    { message: 'Bad credentials' },
    [null],
    [repository(1, { stargazers_count: -1 })],
    [repository(1, { stargazers_count: 1.5 })],
    [repository(1, { description: 42 })],
    [repository(1, { name: 'unsafe/name' })],
    [repository(1, { html_url: 'javascript:alert(1)' })],
    [repository(1, { owner: { login: 'another-owner' } })],
    [repository(1, { fork: undefined })],
  ]
  for (const page of invalidPages) {
    await assert.rejects(fetchGithubProjects({ fetcher: async () => json(page) }))
  }
})

test('rejects duplicate ids or names rather than silently saving a partial snapshot', async () => {
  for (const records of [
    [repository(1), repository(1)],
    [repository(1), repository(2, { name: 'PROJECT-1', html_url: 'https://github.com/rezansrv/PROJECT-1' })],
  ]) {
    await assert.rejects(fetchGithubProjects({ fetcher: async () => json(records) }), /duplicate repositories/)
  }
})

test('rate limits, server errors, malformed JSON, and network failures stop synchronization', async () => {
  for (const status of [403, 429, 500]) {
    await assert.rejects(fetchGithubProjects({ fetcher: async () => json({}, status) }), new RegExp(`HTTP ${status}`))
  }
  await assert.rejects(fetchGithubProjects({ fetcher: async () => new Response('not JSON') }), /invalid JSON/)
  await assert.rejects(fetchGithubProjects({ fetcher: async () => {
    throw new Error('Network unavailable')
  } }), /request failed or timed out/)
})

test('a later-page failure leaves the existing data file byte-for-byte unchanged', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'rezansrv-projects-'))
  const outputPath = join(directory, 'projects.json')
  context.after(async () => {
    for (const file of await readdir(directory)) await rm(join(directory, file))
    await rmdir(directory)
  })
  const original = '[{"name":"existing snapshot"}]\r\n'
  await writeFile(outputPath, original)
  let calls = 0
  const fetcher: FetchRequest = async () => ++calls === 1
    ? json(Array.from({ length: 100 }, (_, index) => repository(index + 1)))
    : json({}, 503)
  await assert.rejects(syncGithubProjects({ outputPath, fetcher }), /HTTP 503/)
  assert.equal(await readFile(outputPath, 'utf8'), original)
  assert.deepEqual(await readdir(directory), ['projects.json'])
})

test('writes a complete snapshot atomically, preserving descriptions as plain text', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'rezansrv-projects-'))
  const outputPath = join(directory, 'projects.json')
  context.after(async () => {
    for (const file of await readdir(directory)) await rm(join(directory, file))
    await rmdir(directory)
  })
  await writeFile(outputPath, 'old snapshot')
  const description = 'فارسی & <script>plain text</script> "quoted"'
  const projects = await syncGithubProjects({
    outputPath,
    fetcher: async () => json([repository(1, { description })]),
  })
  assert.deepEqual(JSON.parse(await readFile(outputPath, 'utf8')), projects)
  assert.equal(projects[0]!.description, description)
  assert.deepEqual(await readdir(directory), ['projects.json'])
})
