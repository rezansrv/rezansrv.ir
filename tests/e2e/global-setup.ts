import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const baseURL = 'http://127.0.0.1:4173'
const startupTimeoutMs = 30_000

const delay = (milliseconds: number) => new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds))

async function waitForServer(server: ChildProcess, getOutput: () => string) {
  const deadline = Date.now() + startupTimeoutMs

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Static test server exited with code ${server.exitCode}.\n${getOutput()}`)
    }

    try {
      const response = await fetch(baseURL, {
        headers: { accept: 'text/html' },
        signal: AbortSignal.timeout(1_000),
      })
      if (response.ok) return
    }
    catch {
      // Retry until the bounded deadline while the process starts.
    }

    await delay(250)
  }

  throw new Error(`Static test server was not ready within ${startupTimeoutMs} ms.\n${getOutput()}`)
}

async function stopProcessTree(server: ChildProcess) {
  if (server.exitCode !== null || !server.pid) return

  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill.exe', ['/pid', String(server.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      })
    }
    catch {
      // The process may already have exited between the check and taskkill.
    }
  }
  else {
    try {
      process.kill(-server.pid, 'SIGTERM')
    }
    catch {
      return
    }

    const exited = await Promise.race([
      new Promise(resolveExit => server.once('exit', () => resolveExit(true))),
      delay(5_000).then(() => false),
    ])

    if (!exited) {
      try {
        process.kill(-server.pid, 'SIGKILL')
      }
      catch {
        // The process group exited during the timeout boundary.
      }
    }
  }

  await Promise.race([
    new Promise(resolveExit => server.once('exit', resolveExit)),
    delay(5_000),
  ])
}

export default async () => {
  const projectRoot = resolve(import.meta.dirname, '..', '..')
  const generatedIndex = resolve(projectRoot, '.output', 'public', 'index.html')

  if (!existsSync(generatedIndex)) {
    throw new Error('Missing .output/public/index.html. Run npm run generate before the generated-output smoke suite.')
  }

  let output = ''
  const rememberOutput = (chunk: Buffer) => {
    output = `${output}${chunk.toString()}`.slice(-12_000)
  }
  const server = spawn(
    process.execPath,
    [resolve(projectRoot, 'tests', 'e2e', 'static-server.mjs')],
    {
      cwd: projectRoot,
      detached: process.platform !== 'win32',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  server.stdout?.on('data', rememberOutput)
  server.stderr?.on('data', rememberOutput)

  try {
    await waitForServer(server, () => output)
  }
  catch (error) {
    await stopProcessTree(server)
    throw error
  }

  return async () => {
    await stopProcessTree(server)
  }
}
