import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const outputRoot = resolve(process.cwd(), '.output', 'public')
const notFoundHtml = readFileSync(resolve(outputRoot, '404.html'), 'utf8')
const robotsText = readFileSync(resolve(outputRoot, 'robots.txt'), 'utf8')
const sitemapText = readFileSync(resolve(outputRoot, 'sitemap.xml'), 'utf8')
const projectsData = JSON.parse(readFileSync(resolve(process.cwd(), 'data/projectsList.json'), 'utf8'))
const postsData = JSON.parse(readFileSync(resolve(process.cwd(), 'data/postsList.json'), 'utf8'))
const officialProfiles = [
  'https://github.com/rezansrv',
  'https://www.linkedin.com/in/reza-naserivand',
]

const routes = [
  {
    path: '/',
    file: 'index.html',
    title: 'Reza Naserivand | Software Engineer',
    canonical: 'https://rezansrv.ir/',
    heading: 'Software engineering across web, data, and AI.',
    content: [
      'I make things',
      'frontend development with Vue, Nuxt, and React',
      'SQL Server–based data systems',
      'pursuing an M.Sc. in Artificial Intelligence',
      'computer vision and medical image analysis',
      'کارشناسی ارشد هوش مصنوعی می‌خوانم',
      'فرانت‌اند و کار با Vue، Nuxt و React',
      'بینایی ماشین و تحلیل تصاویر پزشکی',
    ],
  },
  {
    path: '/projects',
    file: 'projects/index.html',
    title: 'Projects by Reza Naserivand | Software Engineer',
    canonical: 'https://rezansrv.ir/projects',
    heading: 'Projects',
    content: ['rezansrv.ir', 'website-health-check'],
    rowCount: 15,
  },
  {
    path: '/writing',
    file: 'writing/index.html',
    title: 'Writing by Reza Naserivand | Software Engineer',
    canonical: 'https://rezansrv.ir/writing',
    heading: 'Writing',
    content: ['Front-End Security', 'The best Front-End Design Patterns'],
    rowCount: 2,
  },
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseJsonLd(html, expectedType) {
  const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    .map(match => JSON.parse(match[1]))
  const schema = scripts.find(item => item['@type'] === expectedType)
  assert.ok(schema, `Generated HTML should include ${expectedType} structured data`)
  return schema
}

const descriptions = new Set()

for (const route of routes) {
  const html = readFileSync(resolve(outputRoot, route.file), 'utf8')
  assert.match(html, /<!DOCTYPE html>/i, `${route.path} should be a complete HTML document`)
  assert.ok(!html.includes('<div id="__nuxt"></div>'), `${route.path} should not be an empty SPA shell`)
  assert.ok(html.includes('<html  lang="en" dir="ltr">'), `${route.path} should declare its English document language`)
  assert.ok(html.includes(`<title>${route.title}</title>`), `${route.path} should have its unique title`)
  assert.ok(html.includes(`rel="canonical" href="${route.canonical}"`), `${route.path} should have its self-referencing canonical URL`)
  assert.ok(html.includes(`<meta property="og:url" content="${route.canonical}">`), `${route.path} should have the matching Open Graph URL`)
  assert.ok(html.includes(`<meta property="og:title" content="${route.title}">`), `${route.path} should have the matching Open Graph title`)
  assert.ok(html.includes(`<meta name="twitter:title" content="${route.title}">`), `${route.path} should have the matching Twitter title`)
  assert.ok(html.includes('<meta name="twitter:card" content="summary">'), `${route.path} should have a Twitter card`)
  assert.ok(html.includes('<meta property="og:image" content="https://rezansrv.ir/images/me.jpg">'), `${route.path} should use the existing portrait for social previews`)
  assert.ok(html.includes('<meta name="twitter:image" content="https://rezansrv.ir/images/me.jpg">'), `${route.path} should have a Twitter image`)
  assert.ok(html.includes('<meta name="robots" content="index, follow">'), `${route.path} should remain indexable`)
  assert.ok(!/noindex/i.test(html), `${route.path} should not contain a noindex directive`)
  assert.ok(!/<meta name="keywords"/i.test(html), `${route.path} should not contain keyword-stuffed metadata`)
  assert.ok(!/rel="alternate" hreflang=/i.test(html), `${route.path} should not claim a separate translated equivalent`)
  assert.doesNotMatch(html, /(?:localhost|127\.0\.0\.1|[A-Z]:\\Users\\)/i, `${route.path} should not expose local URLs or Windows paths`)
  assert.match(html, new RegExp(`<h1[^>]*>\\s*${escapeRegExp(route.heading)}\\s*</h1>`), `${route.path} should render its primary heading`)

  const descriptionMatch = html.match(/<meta name="description" content="([^"]+)">/)
  assert.ok(descriptionMatch?.[1], `${route.path} should have a description`)
  descriptions.add(descriptionMatch[1])
  assert.ok(html.includes(`<meta property="og:description" content="${descriptionMatch[1]}">`), `${route.path} should reuse its description for Open Graph`)

  for (const content of route.content) {
    assert.ok(html.includes(content), `${route.path} should render ${content}`)
  }

  assert.ok(html.includes('© 2026 Reza Naserivand'), `${route.path} should render the release year`)
  assert.ok(html.includes('Made with Nuxt 4'), `${route.path} should identify the Nuxt foundation`)
  assert.match(html, /<span class="footer__nuxt" aria-hidden="true"[^>]*><svg[^>]*viewBox="0 0 512 512"/, `${route.path} should render the inline Nuxt logo`)
  assert.ok(!html.includes('Made with Vue v2'), `${route.path} should not retain the Vue 2 attribution`)

  if (route.path === '/') {
    const heroSvgTag = html.match(/<svg[^>]*class="hero__canvas"[^>]*>/)?.[0]
    assert.ok(heroSvgTag, 'Generated home should contain the SSR hero SVG')
    assert.ok(!/\bviewBox=/i.test(heroSvgTag), 'Hero SVG should retain the legacy viewport coordinate system')
    const heroSvg = html.match(/<svg[^>]*class="hero__canvas"[^>]*>[\s\S]*?<\/svg>/)?.[0]
    assert.ok(heroSvg, 'Generated home should contain the complete SSR hero SVG')
    assert.match(html, /<g[^>]*aria-hidden="true"[^>]*><\/g>/, 'Generated home should include an empty isolated animation layer')
    assert.match(html, /<text[^>]*class="text-glitch"[^>]*>I make things<\/text>/, 'Generated home should contain the meaningful hero headline')
    assert.match(html, /<text[^>]*class="text-glitch"[^>]*role="button"[^>]*tabindex="0"[^>]*aria-label="I make things"[^>]*aria-pressed="false"/, 'Generated home should render the accessible default headline before hydration')
    assert.ok(!/<(?:circle|line)\b/i.test(heroSvg), 'Generated home should defer the SVG network until client mount')
    assert.match(html, /<button[^>]*class="home-about__language-toggle"[^>]*aria-controls="home-about-english home-about-persian"[^>]*aria-label="نمایش معرفی فارسی"[^>]*aria-pressed="false"/, 'Generated home should include the accessible language control')
    assert.match(html, /<section[^>]*id="home-about-english"[^>]*aria-hidden="false"/, 'Generated home should keep English readable before JavaScript')
    assert.match(html, /<section[^>]*id="home-about-persian"[^>]*class="[^"]*home-about__panel--persian[^"]*"[^>]*lang="fa"[^>]*dir="rtl"[^>]*aria-hidden="false"/, 'Generated home should expose accessible server-rendered Persian content before JavaScript')
    assert.match(html, /<noscript[^>]*><style>[\s\S]*\.home-about__panel[\s\S]*visibility: visible !important;[\s\S]*<\/style><\/noscript>/, 'Generated home should visibly expose both About languages when JavaScript is disabled')
    assert.match(html, /<h2[^>]*id="home-about-persian-title"[^>]*>من رضا ناصری‌وند هستم؛ مهندس نرم‌افزار\.<\/h2>/, 'Generated home should show the primary Persian full name in visible About content')
    assert.ok(!html.includes('home-about__alternate-name'), 'Generated home should keep alternate spellings out of the visible About UI')
    assert.ok(html.includes('rel="preload" as="image" href="/images/backGround.jpg" type="image/jpeg" fetchpriority="high"'), 'Generated home should preload the original full-quality hero image')
    assert.ok(html.includes('srcset="/images/me-560.webp 560w, /images/me-840.webp 840w"'), 'Generated home should offer responsive WebP portrait sources')
    assert.ok(html.includes('loading="lazy" decoding="async"'), 'Generated home should lazily decode the below-fold portrait')

    const person = parseJsonLd(html, 'Person')
    assert.equal(person['@id'], 'https://rezansrv.ir/#person')
    assert.equal(person.name, 'Reza Naserivand')
    assert.equal(person.jobTitle, 'Software Engineer')
    assert.deepEqual(person.alternateName, ['رضا ناصری‌وند', 'Reza Naseri Vand', 'رضا ناصری وند', 'رضا ناصریوند'])
    assert.deepEqual(person.sameAs, officialProfiles)
    assert.ok(person.knowsAbout.includes('SQL Server'))
    assert.ok(person.knowsAbout.includes('React'))
    assert.ok(person.knowsAbout.includes('Medical image analysis'))
    assert.ok(!('affiliation' in person), 'Structured data should not publish an educational institution')
    assert.ok(!('worksFor' in person), 'Structured data should not fabricate an employer')
    assert.ok(!('award' in person), 'Structured data should not fabricate awards')

    for (const profileUrl of officialProfiles) {
      assert.ok(html.includes(`href="${profileUrl}"`), `Home should link visibly to ${profileUrl}`)
    }
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

assert.equal(descriptions.size, routes.length, 'Every indexable route should have a unique meta description')
assert.ok(existsSync(resolve(outputRoot, 'images', 'me.jpg')), 'The existing portrait should exist in generated output')
for (const image of ['me-560.webp', 'me-840.webp', 'social/git-54.webp', 'social/li-54.webp', 'social/insta-54.webp']) {
  assert.ok(existsSync(resolve(outputRoot, 'images', image)), `Generated output should include optimized image ${image}`)
}
assert.ok(
  statSync(resolve(outputRoot, 'images', 'me-840.webp')).size < statSync(resolve(outputRoot, 'images', 'me.jpg')).size,
  'The optimized portrait should be smaller than its original fallback',
)

assert.match(robotsText, /^User-agent: \*$/m, 'robots.txt should address all crawlers')
assert.match(robotsText, /^Allow: \/$/m, 'robots.txt should allow the public site')
assert.match(robotsText, /^Sitemap: https:\/\/rezansrv\.ir\/sitemap\.xml$/m, 'robots.txt should advertise the canonical sitemap')
assert.ok(!/Disallow:\s*\//i.test(robotsText), 'robots.txt should not block the public site')

const sitemapLocations = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
assert.deepEqual(sitemapLocations, routes.map(route => route.canonical), 'sitemap.xml should contain each canonical public route exactly once')
assert.ok(!/hreflang=/i.test(sitemapText), 'The sitemap should not invent separate language routes')

assert.match(notFoundHtml, /<main[^>]*class="error-page"/, 'Generated 404 should contain the site error page')
assert.match(notFoundHtml, /<h1[^>]*>404<\/h1>/, 'Generated 404 should identify the not-found status')
assert.match(notFoundHtml, /The page you are looking for could not be found\./, 'Generated 404 should explain the missing route')
assert.match(notFoundHtml, /<a(?=[^>]*href="\/")(?=[^>]*class="error-page__home")[^>]*>[\s\S]*?Return to home\s*<\/a>/, 'Generated 404 should provide a route back to the homepage')
assert.ok(!notFoundHtml.includes('<div id="__nuxt"></div>'), 'Generated 404 should not be an empty SPA shell')
assert.match(notFoundHtml, /data-ssr="true"/, 'Generated 404 should be server-rendered')
assert.match(notFoundHtml, /<meta name="robots" content="noindex, follow">/, 'Generated 404 should be intentionally excluded from indexing')

process.stdout.write('Generated HTML, bilingual homepage content, Person structured data, sitemap, robots, and 404 output verified for three public routes.\n')
