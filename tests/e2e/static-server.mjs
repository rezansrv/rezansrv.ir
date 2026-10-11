import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const host = '127.0.0.1'
const port = 4173
const publicRoot = resolve(process.cwd(), '.output', 'public')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function resolveRequest(pathname) {
  const decodedPath = decodeURIComponent(pathname)
  const relativePath = decodedPath.replace(/^\/+/, '')
  const candidates = extname(relativePath)
    ? [relativePath]
    : [relativePath, `${relativePath}.html`, `${relativePath}/index.html`]

  if (!relativePath) candidates.unshift('index.html')

  for (const candidate of candidates) {
    const absolutePath = resolve(publicRoot, candidate)
    if (absolutePath !== publicRoot && !absolutePath.startsWith(`${publicRoot}${sep}`)) continue
    if (existsSync(absolutePath) && statSync(absolutePath).isFile()) return absolutePath
  }

  return null
}

const server = createServer((request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${host}:${port}`)
    const filePath = resolveRequest(url.pathname)

    if (!filePath) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }

    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': contentTypes[extname(filePath)] || 'application/octet-stream',
    })
    createReadStream(filePath).pipe(response)
  }
  catch {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Bad request')
  }
})

server.listen(port, host, () => {
  process.stdout.write(`Serving ${publicRoot} at http://${host}:${port}\n`)
})
