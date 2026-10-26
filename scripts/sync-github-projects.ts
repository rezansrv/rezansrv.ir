import { fileURLToPath } from 'node:url'
import { syncGithubProjects } from './github-projects.ts'

try {
  const projects = await syncGithubProjects({
    outputPath: fileURLToPath(new URL('../data/projectsList.json', import.meta.url)),
    token: process.env.GITHUB_PROJECTS_TOKEN,
  })
  process.stdout.write(`Prepared ${projects.length} public, non-fork projects for this build.\n`)
}
catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : 'Project synchronization failed.'}\n`)
  process.exitCode = 1
}
