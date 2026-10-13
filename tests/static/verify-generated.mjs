import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const outputRoot = resolve(process.cwd(), '.output', 'public')
const projectsData = JSON.parse(readFileSync(resolve(process.cwd(), 'data/projectsList.json'), 'utf8'))
const postsData = JSON.parse(readFileSync(resolve(process.cwd(), 'data/postsList.json'), 'utf8'))
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

  if (route.path === '/') {
    assert.match(html, /<svg[^>]*class="hero__canvas"/, 'Generated home should contain the SSR hero SVG')
    assert.ok(!/<svg[^>]*\bviewBox=/i.test(html), 'Hero SVG should retain the legacy viewport coordinate system')
    assert.match(html, /<g[^>]*aria-hidden="true"[^>]*><\/g>/, 'Generated home should include an empty isolated animation layer')
    assert.match(html, /<text[^>]*class="text-glitch"[^>]*>I make things<\/text>/, 'Generated home should contain the meaningful hero headline')
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

    if (route.path === '/writing') {
      assert.equal(postsData.length, route.rowCount, 'The writing data should contain two records')
      let previousTitlePosition = -1
      for (const post of postsData) {
        const titlePosition = html.indexOf(post.title)
        assert.ok(titlePosition > previousTitlePosition, `Generated /writing should preserve the order at ${post.title}`)
        previousTitlePosition = titlePosition
        assert.ok(html.includes(post.publishDate), `Generated /writing should include ${post.publishDate}`)
        assert.ok(html.includes(post.readingTime), `Generated /writing should include ${post.readingTime}`)
        assert.ok(html.includes(post.description), `Generated /writing should include the complete description for ${post.title}`)
        assert.ok(html.includes(`href="${post.link}"`), `Generated /writing should include the post URL for ${post.title}`)
        assert.ok(html.includes(`aria-label="Read ${post.title}"`), `Generated /writing should provide a contextual CTA name for ${post.title}`)
        assert.ok(html.includes(`href="${post.source}"`), `Generated /writing should include the source URL for ${post.title}`)
      }
    }
  }
}

process.stdout.write('Generated HTML verified for /, /projects, and /writing.\n')
