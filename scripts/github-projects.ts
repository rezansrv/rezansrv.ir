import { randomUUID } from 'node:crypto'
import { rename, rm, writeFile } from 'node:fs/promises'
import type { Project } from '../app/types/content.ts'

const username = 'rezansrv'
const pageSize = 100
const maximumPages = 100

export type FetchRequest = (url: string, options: RequestInit) => Promise<Response>

interface SyncOptions {
  outputPath: string
  token?: string
  fetcher?: FetchRequest
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseRepository(value: unknown): { id: number, project: Project | null } {
  if (!isRecord(value)
    || !Number.isSafeInteger(value.id) || Number(value.id) <= 0
    || typeof value.name !== 'string' || !/^[\w.-]+$/.test(value.name)
    || typeof value.html_url !== 'string'
    || typeof value.private !== 'boolean'
    || typeof value.fork !== 'boolean'
    || !isRecord(value.owner) || typeof value.owner.login !== 'string'
    || !Number.isSafeInteger(value.stargazers_count) || Number(value.stargazers_count) < 0
    || !(value.description === null || typeof value.description === 'string')) {
    throw new Error('GitHub returned an invalid repository record. No project data was saved.')
  }

  if (value.owner.login.toLowerCase() !== username
    || value.html_url.toLowerCase() !== `https://github.com/${username}/${value.name}`.toLowerCase()) {
    throw new Error('GitHub returned an unexpected repository owner or URL. No project data was saved.')
  }

  return {
    id: value.id as number,
    project: value.private || value.fork
      ? null
      : {
          name: value.name,
          url: value.html_url,
          stars: value.stargazers_count as number,
          description: value.description ?? '',
        },
  }
}

export async function fetchGithubProjects({
  token,
  fetcher = fetch,
}: Omit<SyncOptions, 'outputPath'> = {}): Promise<Project[]> {
  const projects: Project[] = []
  const seenIds = new Set<number>()
  const seenNames = new Set<string>()
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
    'User-Agent': 'rezansrv-projects-build',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  for (let page = 1; page <= maximumPages; page++) {
    const url = `https://api.github.com/users/${username}/repos?type=owner&sort=full_name&direction=asc&per_page=${pageSize}&page=${page}`
    let response: Response
    try {
      response = await fetcher(url, {
        headers,
        redirect: 'error',
        signal: AbortSignal.timeout(15_000),
      })
    }
    catch {
      throw new Error('GitHub projects request failed or timed out. No project data was saved.')
    }
    if (!response.ok) {
      throw new Error(`GitHub projects request failed (HTTP ${response.status}). No project data was saved.`)
    }

    let records: unknown
    try {
      records = await response.json()
    }
    catch {
      throw new Error('GitHub returned invalid JSON. No project data was saved.')
    }
    if (!Array.isArray(records) || records.length > pageSize) {
      throw new Error('GitHub returned an invalid repository page. No project data was saved.')
    }

    for (const record of records) {
      const { id, project } = parseRepository(record)
      if (seenIds.has(id) || (project && seenNames.has(project.name.toLowerCase()))) {
        throw new Error('GitHub returned duplicate repositories. No project data was saved; retry the build.')
      }
      seenIds.add(id)
      if (project) {
        seenNames.add(project.name.toLowerCase())
        projects.push(project)
      }
    }

    if (records.length < pageSize) {
      if (!projects.length) {
        throw new Error('GitHub returned no eligible projects. Refusing to publish an empty project list.')
      }
      // Compare code points so equal-star ordering is identical on all build hosts.
      return projects.sort((left, right) => right.stars - left.stars
        || (left.name < right.name ? -1 : left.name > right.name ? 1 : 0))
    }
  }
  throw new Error('GitHub pagination exceeded the safety limit. No project data was saved.')
}

export async function syncGithubProjects({ outputPath, ...options }: SyncOptions): Promise<Project[]> {
  const projects = await fetchGithubProjects(options)
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(projects, null, 2)}\n`, { flag: 'wx' })
    await rename(temporaryPath, outputPath)
  }
  finally {
    await rm(temporaryPath, { force: true })
  }
  return projects
}
