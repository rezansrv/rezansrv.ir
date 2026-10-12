import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const outputRoot = resolve(process.cwd(), '.output', 'public')
const projectsData = JSON.parse(readFileSync(resolve(process.cwd(), 'data/projectsList.json'), 'utf8'))
const routes = [
  {
    path: '/',
    file: 'index.html',
    title: 'Reza Naserivand | Front-End Developer',
    canonical: 'https://rezansrv.ir/',
    heading: 'Hello!',
    content: ['I make things', 'I’m Reza Naserivand'],
  },
  {
    path: '/projects',
    file: 'projects/index.html',
    title: 'Projects | Reza Naserivand',
    canonical: 'https://rezansrv.ir/projects',
    heading: 'Projects',
    content: ['rezansrv.ir', 'website-health-check'],
    rowCount: 15,
  },
  {
    path: '/writing',
    file: 'writing/index.html',
    title: 'Writing | Reza Naserivand',
    canonical: 'https://rezansrv.ir/writing',
    heading: 'Writing',
    content: ['Front-End Security', 'The best Front-End Design Patterns'],
    rowCount: 2,
  },
]

for (const route of routes) {
  const html = readFileSync(resolve(outputRoot, route.file), 'utf8')
  assert.match(html, /<!DOCTYPE html>/i, `${route.path} should be a complete HTML document`)
  assert.ok(!html.includes('<div id="__nuxt"></div>'), `${route.path} should not be an empty SPA shell`)
  assert.ok(html.includes(`<title>${route.title}</title>`), `${route.path} should have its unique title`)
  assert.ok(html.includes(`rel="canonical" href="${route.canonical}"`), `${route.path} should have its canonical URL`)
  assert.match(html, /<meta name="description" content="[^"]+">/, `${route.path} should have a description`)
  assert.match(html, /<meta property="og:title" content="[^"]+">/, `${route.path} should have Open Graph metadata`)
  assert.match(html, new RegExp(`<h1[^>]*>\\s*${route.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</h1>`), `${route.path} should render its primary heading`)

  for (const content of route.content) {
    assert.ok(html.includes(content), `${route.path} should render ${content}`)
  }

  if (route.rowCount) {
    const rows = html.match(/<tr(?:\s|>)/g) || []
    assert.equal(rows.length, route.rowCount, `${route.path} should render ${route.rowCount} content rows`)

    if (route.path === '/projects') {
      assert.equal(projectsData.length, route.rowCount, 'The project data should contain 15 records')
      for (const project of projectsData) {
        assert.ok(html.includes(`href="${project.url}"`), `Generated /projects should include ${project.url}`)
        assert.ok(html.includes(`aria-label="${project.name}"`), `Generated /projects should label the ${project.name} link`)
      }
    }
  }
}

process.stdout.write('Generated HTML verified for /, /projects, and /writing.\n')
