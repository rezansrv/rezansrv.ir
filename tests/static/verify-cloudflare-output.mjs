import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const outputRoot = resolve(process.cwd(), '.output/public')

for (const file of ['index.html', 'projects/index.html', 'writing/index.html', '404.html', '_headers', '_redirects']) {
  assert.ok(existsSync(resolve(outputRoot, file)), `Cloudflare must publish ${file} from .output/public`)
}

const redirects = readFileSync(resolve(outputRoot, '_redirects'), 'utf8')
assert.match(redirects, /^\/\* \/404\.html 404$/m, 'Cloudflare should retain the generated 404 fallback')
const headers = readFileSync(resolve(outputRoot, '_headers'), 'utf8')
assert.match(headers, /^\/_nuxt\/\*$/m, 'Cloudflare should retain the generated asset cache headers')
assert.ok(!existsSync(resolve(outputRoot, '_worker.js')), 'The static Pages artifact must not include a runtime Worker')

process.stdout.write('Cloudflare routes, 404 fallback, and cache headers share .output/public without a runtime Worker.\n')
