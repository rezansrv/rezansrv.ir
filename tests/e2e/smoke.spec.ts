import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type ProjectRecord = {
  name: string
  url: string
  stars: number
  description: string
}

type PostRecord = {
  id: number
  title: string
  link: string
  publishDate: string
  source: string
  readingTime: string
  description: string
}

const projectRecords = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/projectsList.json'), 'utf8'),
) as ProjectRecord[]
const postRecords = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/postsList.json'), 'utf8'),
) as PostRecord[]

const routes = [
  { path: '/', heading: 'Software engineering across web, data, and AI.', title: 'Reza Naserivand | Software Engineer' },
  { path: '/projects', heading: 'Projects', title: 'Projects by Reza Naserivand | Software Engineer' },
  { path: '/writing', heading: 'Writing', title: 'Writing by Reza Naserivand | Software Engineer' },
]

async function openReadyPage(page: Page, route: typeof routes[number]) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      consoleErrors.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', error => pageErrors.push(error.message))

  const response = await page.goto(route.path, {
    waitUntil: 'domcontentloaded',
    timeout: 15_000,
  })

  expect(response, `Expected a document response for ${route.path}`).not.toBeNull()
  expect(response?.status(), `Expected ${route.path} to load directly`).toBe(200)

  await expect(page.locator('#__nuxt > *')).toHaveCount(1)
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('heading', { name: route.heading, exact: true }).first()).toBeVisible()
  await expect(page).toHaveTitle(route.title)
  await expect.poll(
    () => page.evaluate(() => document.readyState),
    { timeout: 5_000, message: `Expected ${route.path} document to become ready` },
  ).toBe('complete')

  await page.waitForTimeout(100)
  expect(consoleErrors, `Unexpected console or hydration errors on ${route.path}`).toEqual([])
  expect(pageErrors, `Unexpected runtime errors on ${route.path}`).toEqual([])

  return { consoleErrors, pageErrors }
}

async function installRafProbe(page: Page) {
  await page.addInitScript(() => {
    const probe = { callbacks: 0, cancellations: 0, pending: new Set<number>(), maxPending: 0 }
    Object.defineProperty(window, '__heroRafProbe', { value: probe })
    const request = window.requestAnimationFrame.bind(window)
    const cancel = window.cancelAnimationFrame.bind(window)
    window.requestAnimationFrame = (callback) => {
      let handle = 0
      handle = request((timestamp) => {
        probe.pending.delete(handle)
        probe.callbacks++
        callback(timestamp)
      })
      probe.pending.add(handle)
      probe.maxPending = Math.max(probe.maxPending, probe.pending.size)
      return handle
    }
    window.cancelAnimationFrame = (handle) => {
      probe.cancellations++
      probe.pending.delete(handle)
      cancel(handle)
    }
  })
}

async function pendingHeroFrames(page: Page) {
  return page.evaluate(() => (window as Window & { __heroRafProbe: { pending: Set<number> } }).__heroRafProbe.pending.size)
}

for (const route of routes) {
  test(`${route.path} loads directly with its baseline content`, async ({ page }) => {
    const diagnostics = await openReadyPage(page, route)
    await expect(page).toHaveURL(new RegExp(`${route.path === '/' ? '/$' : `${route.path}/?$`}`))

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalOverflow).toBe(false)

    if (route.path === '/') {
      await expect(page.getByText('I make things', { exact: true }).first()).toBeAttached()
      await expect(page.getByText('About Reza Naserivand', { exact: true })).toBeVisible()
      await expect(page.getByText('frontend development with Vue, Nuxt, and React', { exact: false })).toBeVisible()
      await expect(page.getByText('SQL Server–based data systems', { exact: false })).toBeVisible()
      await expect(page.locator('.home-about__alternate-name')).toHaveCount(0)
      await expect(page.locator('#home-about-persian')).toBeAttached()
      await expect(page.locator('#home-about-persian')).not.toBeVisible()
      await expect(page.locator('#home-about-persian')).toContainText('کارشناسی ارشد هوش مصنوعی می‌خوانم')
      await expect(page.locator('#home-about-persian')).toHaveAttribute('lang', 'fa')
      await expect(page.locator('#home-about-persian')).toHaveAttribute('dir', 'rtl')
      const profileImage = page.getByRole('img', { name: 'Portrait of Reza Naserivand' })
      await expect(profileImage).toHaveAttribute('src', '/images/me.jpg')
      await expect(profileImage).toHaveAttribute('loading', 'lazy')
      await expect(profileImage).toHaveAttribute('decoding', 'async')
      await expect(profileImage).toHaveJSProperty('complete', true)
      expect(await profileImage.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
      expect(await profileImage.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/\/images\/me-(?:560|840)\.webp$/)
      await expect(page.locator('.hero')).toHaveCSS('background-image', /backGround\.jpg/)
    }
    else if (route.path === '/projects') {
      const rows = page.locator('.github-table tbody tr')
      await expect(rows).toHaveCount(projectRecords.length)

      for (const [index, project] of projectRecords.entries()) {
        const row = rows.nth(index)
        const link = row.getByRole('link')
        await expect(row.locator('h3')).toHaveText(project.name)
        await expect(row.locator('p').first()).toContainText(String(project.stars))
        await expect(row.locator('p').nth(1)).toHaveText(project.description)
        await expect(link).toHaveCount(1)
        await expect(link).toHaveAttribute('href', project.url)
        await expect(link).toHaveAttribute('aria-label', project.name)
        await expect(link).not.toHaveAttribute('target', /.+/)
      }

      const firstRow = rows.first()
      await firstRow.hover()
      await expect(firstRow.locator('td')).toHaveCSS('filter', 'brightness(1.5)')
    }
    else if (route.path === '/writing') {
      const rows = page.locator('.posts-table tbody tr')
      await expect(rows).toHaveCount(postRecords.length)

      for (const [index, post] of postRecords.entries()) {
        const row = rows.nth(index)
        const links = row.getByRole('link')
        await expect(row.locator('h3')).toHaveText(post.title)
        await expect(row.locator('.post-publish')).toContainText(`Published on ${post.publishDate}, on ${post.source}.`)
        await expect(row.locator('.post-publish')).toContainText(`time: ${post.readingTime}`)
        await expect(row.locator('.post-describe')).toHaveText(post.description)
        await expect(links).toHaveCount(3)
        await expect(links.nth(0)).toHaveText(post.title)
        await expect(links.nth(0)).toHaveAttribute('href', post.link)
        await expect(links.nth(1)).toHaveText(post.source)
        await expect(links.nth(1)).toHaveAttribute('href', post.source)
        await expect(links.nth(2)).toHaveAttribute('href', post.link)
        await expect(links.nth(2)).toHaveAttribute('aria-label', `Read ${post.title}`)
        await expect(links.nth(2)).toBeVisible()
        await expect(links.nth(2)).toContainText(/see post/i)
        await expect(row.locator('a a')).toHaveCount(0)
        for (const link of await links.all()) {
          await expect(link).not.toHaveAttribute('target', /.+/)
        }
      }
    }
    const footer = page.getByRole('contentinfo')
    await expect(footer).toContainText('© 2026 Reza Naserivand')
    await expect(footer).toContainText('Made with Nuxt 4')
    await expect(footer.locator('.footer__nuxt svg')).toBeVisible()
    await expect(footer.locator('.footer__nuxt svg')).toHaveCSS('fill', 'rgb(0, 220, 130)')
    await expect(footer).not.toContainText('Made with Vue v2')

    const reloadResponse = await page.reload({ waitUntil: 'domcontentloaded' })
    expect(reloadResponse?.status(), `Expected ${route.path} to refresh directly`).toBe(200)
    await expect(page.getByRole('heading', { name: route.heading, exact: true }).first()).toBeVisible()
    await page.waitForTimeout(100)
    expect(diagnostics.consoleErrors, `Unexpected console or hydration errors after refreshing ${route.path}`).toEqual([])
    expect(diagnostics.pageErrors, `Unexpected runtime errors after refreshing ${route.path}`).toEqual([])
  })
}

test('an unknown route returns a server-rendered 404 with a working home link', async ({ page }) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  const failedRequests: string[] = []
  const errorResponses: Array<{ path: string, status: number }> = []
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) consoleErrors.push(message.text())
  })
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('requestfailed', request => failedRequests.push(request.url()))
  page.on('response', (response) => {
    if (response.status() >= 400) errorResponses.push({ path: new URL(response.url()).pathname, status: response.status() })
  })

  const response = await page.goto('/this-route-does-not-exist', { waitUntil: 'domcontentloaded' })
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'A little off the map.' })).toBeVisible()
  await expect(page.getByText('The page you are looking for could not be found.')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Explore the site' }).getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
  await expect(page.getByRole('navigation', { name: 'Explore the site' }).getByRole('link', { name: 'Writing' })).toHaveAttribute('href', '/writing')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const returnLink = page.getByRole('link', { name: 'Return to home' })
  await expect(returnLink).toHaveAttribute('href', '/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'REZA NASERIVAND', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(returnLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/)
  await expect(page.getByRole('heading', { name: 'Software engineering across web, data, and AI.', exact: true })).toBeVisible()
  expect(consoleErrors.filter(message => !message.includes('server responded with a status of 404 (Not Found)'))).toEqual([])
  expect(pageErrors).toEqual([])
  expect(failedRequests).toEqual([])
  expect(errorResponses).toEqual([{ path: '/this-route-does-not-exist', status: 404 }])
})

test('header navigation changes routes without a full-page dependency', async ({ page }) => {
  const diagnostics = await openReadyPage(page, routes[0])

  const header = page.getByRole('banner')
  await header.getByRole('link', { name: 'projects', exact: true }).click()
  await expect(page).toHaveURL(/\/projects\/?$/)
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible()
  await expect(header.getByRole('link', { name: 'projects', exact: true })).toHaveClass(/router-link-exact-active/)

  await header.getByRole('link', { name: 'writing', exact: true }).click()
  await expect(page).toHaveURL(/\/writing\/?$/)
  await expect(page.getByRole('heading', { name: 'Writing', exact: true })).toBeVisible()
  await expect(header.getByRole('link', { name: 'writing', exact: true })).toHaveClass(/router-link-exact-active/)
  await page.waitForTimeout(100)
  expect(diagnostics.consoleErrors, 'Unexpected console or hydration errors during internal navigation').toEqual([])
  expect(diagnostics.pageErrors, 'Unexpected runtime errors during internal navigation').toEqual([])
})

test('the header name keeps its geometry while providing a reduced-motion-safe neon glitch', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openReadyPage(page, routes[0])
  const logo = page.locator('.header--nav--logo')
  await expect(logo).toHaveText('REZA NASERIVAND.')
  await expect(logo.locator('.header--nav--logo-dot')).toHaveCSS('color', 'rgb(240, 53, 134)')
  await expect(logo).toHaveAttribute('data-text', 'REZA NASERIVAND')

  const beforeHover = await logo.boundingBox()
  const animatedStyle = await logo.evaluate(element => ({
    beforeContent: getComputedStyle(element, '::before').content,
    beforeAnimation: getComputedStyle(element, '::before').animationName,
    afterAnimation: getComputedStyle(element, '::after').animationName,
    textShadow: getComputedStyle(element).textShadow,
  }))
  expect(animatedStyle.beforeContent).toBe('"REZA NASERIVAND"')
  expect(animatedStyle.beforeAnimation).not.toBe('none')
  expect(animatedStyle.afterAnimation).not.toBe('none')
  expect(animatedStyle.textShadow).toBe('none')

  await logo.hover()
  const afterHover = await logo.boundingBox()
  expect(afterHover).toEqual(beforeHover)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reducedStyle = await logo.evaluate(element => ({
    beforeAnimation: getComputedStyle(element, '::before').animationName,
    afterAnimation: getComputedStyle(element, '::after').animationName,
  }))
  expect(reducedStyle.beforeAnimation).toBe('none')
  expect(reducedStyle.afterAnimation).toBe('none')
})

test('the homepage language control reveals the concise Persian About content', async ({ page }) => {
  const diagnostics = await openReadyPage(page, routes[0])
  const toggle = page.locator('.home-about__language-toggle')
  const englishPanel = page.locator('#home-about-english')
  const persianPanel = page.locator('#home-about-persian')

  await expect(toggle).toHaveAttribute('aria-label', 'نمایش معرفی فارسی')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect(toggle.locator('svg')).toBeVisible()
  await expect(englishPanel).toBeVisible()
  await expect(persianPanel).not.toBeVisible()
  await expect(englishPanel).toHaveAttribute('aria-hidden', 'false')
  await expect(persianPanel).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.home-about__card a')).toHaveCount(0)

  await toggle.focus()
  await expect(toggle).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-label', 'Show English introduction')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(englishPanel).not.toBeVisible()
  await expect(persianPanel).toBeVisible()
  await expect(englishPanel).toHaveAttribute('aria-hidden', 'true')
  await expect(persianPanel).toHaveAttribute('aria-hidden', 'false')
  await expect(page.locator('#home-about-persian-title')).toHaveText(
    'من رضا ناصری‌وند هستم؛ مهندس نرم‌افزار.',
  )
  await expect(persianPanel).toContainText('فرانت‌اند و کار با Vue، Nuxt و React')
  await expect(persianPanel).toContainText('بینایی ماشین و تحلیل تصاویر پزشکی')
  const portraitRole = page.locator('.home-about__portrait > p')
  await expect(portraitRole).toHaveText('مهندس نرم‌افزار')
  await expect(portraitRole).toHaveAttribute('lang', 'fa')
  await expect(portraitRole).toHaveCSS('font-family', /Tahoma/)

  await page.keyboard.press('Space')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect(englishPanel).toBeVisible()
  await expect(persianPanel).not.toBeVisible()
  await expect(portraitRole).toHaveText('Software Engineer')
  await expect(portraitRole).toHaveAttribute('lang', 'en')
  await page.waitForTimeout(100)
  expect(diagnostics.consoleErrors, 'Unexpected console or hydration errors during language switching').toEqual([])
  expect(diagnostics.pageErrors, 'Unexpected runtime errors during language switching').toEqual([])
})

test('the home network is removed and rebuilt across route unmount and remount', async ({ page }, testInfo) => {
  await installRafProbe(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const diagnostics = await openReadyPage(page, routes[0])
  const hero = page.locator('.hero__canvas')
  const expectedDots = testInfo.project.name === 'mobile-chromium' ? 150 : 120
  const expectedLines = testInfo.project.name === 'mobile-chromium' ? 750 : 720

  await expect(hero.locator('g[aria-hidden="true"]')).toHaveCount(1)
  await expect(hero.locator('circle')).toHaveCount(expectedDots)
  await expect(hero.locator('line')).toHaveCount(expectedLines)
  await expect(hero).not.toHaveAttribute('viewBox', /.+/)
  await expect(hero).toHaveAttribute('height', String(testInfo.project.name === 'mobile-chromium' ? 764 : 820))
  await expect(hero.locator('circle').first()).toHaveAttribute('fill', '#ADAAAA51')
  await expect(hero.locator('line').first()).toHaveAttribute('stroke', '#ADAAAA33')
  await expect(hero.locator('line').first()).toHaveAttribute('stroke-width', '1')
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)
  await expect.poll(() => hero.evaluate((svg) => {
    const circle = svg.querySelector('circle')
    const line = svg.querySelector('line')
    return circle && line
      && line.getAttribute('x1') === circle.getAttribute('cx')
      && line.getAttribute('y1') === circle.getAttribute('cy')
      && line.getAttribute('x2') === circle.getAttribute('cx')
      && line.getAttribute('y2') === circle.getAttribute('cy')
  })).toBe(true)

  const header = page.getByRole('banner')
  await header.getByRole('link', { name: 'projects', exact: true }).click()
  await expect(page.locator('.hero__canvas')).toHaveCount(0)
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)
  await header.getByRole('link', { name: 'Home', exact: true }).click()

  const remountedHero = page.locator('.hero__canvas')
  await expect(remountedHero).toHaveCount(1)
  await expect(remountedHero.locator('g[aria-hidden="true"]')).toHaveCount(1)
  await expect(remountedHero.locator('circle')).toHaveCount(expectedDots)
  await expect(remountedHero.locator('line')).toHaveCount(expectedLines)
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)
  await expect(page.getByText('I make things', { exact: true }).first()).toBeAttached()

  for (let cycle = 0; cycle < 2; cycle++) {
    await header.getByRole('link', { name: 'projects', exact: true }).click()
    await expect(page.locator('.hero__canvas')).toHaveCount(0)
    await expect.poll(() => pendingHeroFrames(page)).toBe(0)
    await header.getByRole('link', { name: 'Home', exact: true }).click()
    await expect(page.locator('.hero__canvas circle')).toHaveCount(expectedDots)
    await expect(page.locator('.hero__canvas line')).toHaveCount(expectedLines)
    await expect.poll(() => pendingHeroFrames(page)).toBe(1)
  }

  expect(diagnostics.consoleErrors, 'Unexpected console or hydration errors after remount').toEqual([])
  expect(diagnostics.pageErrors, 'Unexpected runtime errors after remount').toEqual([])
})

test('the network moves its dots and line endpoints while preserving server-rendered hero text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openReadyPage(page, routes[0])
  const hero = page.locator('.hero__canvas')
  const firstDot = hero.locator('circle').first()
  const firstLine = hero.locator('line').nth(1)
  const initial = await Promise.all([
    firstDot.getAttribute('cx'),
    firstDot.getAttribute('cy'),
    firstLine.getAttribute('x2'),
    firstLine.getAttribute('y2'),
  ])

  await expect.poll(async () => Promise.all([
    firstDot.getAttribute('cx'),
    firstDot.getAttribute('cy'),
    firstLine.getAttribute('x2'),
    firstLine.getAttribute('y2'),
  ]), { timeout: 3_000 }).not.toEqual(initial)
  await expect(page.getByRole('heading', { name: 'I make things', exact: true })).toBeAttached()
  await expect(hero.locator('text')).toHaveText('I make things')
})

test('the hero preserves pointer influence, headline hover states, and keyboard focus', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openReadyPage(page, routes[0])
  const svg = page.locator('.hero__canvas')
  const headline = page.locator('.text-glitch')
  const expectedDots = testInfo.project.name === 'mobile-chromium' ? 150 : 120

  await expect(headline).toHaveText('I make things')
  await expect(headline).toHaveAttribute('role', 'button')
  await expect(headline).toHaveAttribute('aria-pressed', 'false')
  await expect(svg.locator('circle')).toHaveCount(expectedDots)
  await expect(svg.locator('line')).toHaveCount(testInfo.project.name === 'mobile-chromium' ? 750 : 720)

  const svgBounds = await svg.boundingBox()
  expect(svgBounds).not.toBeNull()
  await page.mouse.move(svgBounds!.x + 10, svgBounds!.y + 10)
  await expect.poll(() => svg.locator('circle[r="2"]').count()).toBe(13)

  const headlineBounds = await headline.boundingBox()
  expect(headlineBounds).not.toBeNull()
  await page.mouse.move(headlineBounds!.x + headlineBounds!.width / 2, headlineBounds!.y + headlineBounds!.height / 2)
  await expect(headline).toHaveText('I break things')
  await page.mouse.move(headlineBounds!.x + headlineBounds!.width / 2 + 3, headlineBounds!.y + headlineBounds!.height / 2)
  await expect.poll(() => svg.locator('circle[r="2"]').count()).toBe(55)
  await expect(headline).toHaveAttribute('aria-pressed', 'true')

  await page.mouse.move(svgBounds!.x + 10, svgBounds!.y + 10)
  await expect(headline).toHaveText('I make things')
  await expect.poll(() => svg.locator('circle[r="2"]').count()).toBe(40)
  await expect(headline).toHaveAttribute('aria-pressed', 'false')

  let focused = false
  for (let index = 0; index < 12 && !focused; index++) {
    await page.keyboard.press('Tab')
    focused = await headline.evaluate(element => element === document.activeElement)
  }
  await expect(headline).toBeFocused()
  await expect(headline).toHaveText('I break things')
  const focusStyle = await headline.evaluate(element => ({
    focusVisible: element.matches(':focus-visible'),
    outlineStyle: getComputedStyle(element).outlineStyle,
    outlineWidth: getComputedStyle(element).outlineWidth,
  }))
  expect(focusStyle.focusVisible).toBe(true)
  expect(focusStyle.outlineStyle).toBe('solid')
  expect(focusStyle.outlineWidth).toBe('2px')
  await page.keyboard.press('Tab')
  await expect(headline).not.toBeFocused()
  await expect(headline).toHaveText('I make things')
  await expect(svg.locator('circle')).toHaveCount(expectedDots)
  await expect(svg.locator('line')).toHaveCount(testInfo.project.name === 'mobile-chromium' ? 750 : 720)
})

test('reduced motion starts with a static readable network and no recurring RAF', async ({ page }, testInfo) => {
  await installRafProbe(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openReadyPage(page, routes[0])
  const headline = page.locator('.text-glitch')
  const svg = page.locator('.hero__canvas')
  await expect(headline).toHaveText('I make things')
  await expect(headline).toBeVisible()
  const expectedDots = testInfo.project.name === 'mobile-chromium' ? 150 : 120
  await expect(svg.locator('circle')).toHaveCount(expectedDots)
  await expect(svg.locator('line')).toHaveCount(testInfo.project.name === 'mobile-chromium' ? 750 : 720)
  await expect(headline).toHaveCSS('animation-name', 'none')
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)

  const before = await svg.locator('circle').first().getAttribute('cx')
  const bounds = await svg.boundingBox()
  expect(bounds).not.toBeNull()
  await page.mouse.move(bounds!.x + 20, bounds!.y + 20)
  await page.waitForTimeout(150)
  await expect(svg.locator('circle').first()).toHaveAttribute('cx', before!)
  await expect(svg.locator('circle[r="2"]')).toHaveCount(0)
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)
})

test('motion preference changes cancel and resume exactly one original animation loop', async ({ page }) => {
  await installRafProbe(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openReadyPage(page, routes[0])
  const svg = page.locator('.hero__canvas')
  const headline = page.locator('.text-glitch')
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)
  await expect(headline).not.toHaveCSS('animation-name', 'none')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(headline).toHaveCSS('animation-name', 'none')
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)
  const frozenX = await svg.locator('circle').first().getAttribute('cx')
  const callbacksAtPause = await page.evaluate(() => (window as Window & { __heroRafProbe: { callbacks: number } }).__heroRafProbe.callbacks)
  await page.waitForTimeout(100)
  await expect(svg.locator('circle').first()).toHaveAttribute('cx', frozenX!)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(headline).not.toHaveCSS('animation-name', 'none')
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)
  await expect.poll(() => page.evaluate(() => (window as Window & { __heroRafProbe: { callbacks: number } }).__heroRafProbe.callbacks)).toBeGreaterThan(callbacksAtPause)
  const probe = await page.evaluate(() => {
    const state = (window as Window & { __heroRafProbe: { maxPending: number } }).__heroRafProbe
    return state.maxPending
  })
  expect(probe).toBe(1)
})

test('visibility pauses and resumes one loop, composing with reduced motion', async ({ page }) => {
  await installRafProbe(page)
  await page.addInitScript(() => {
    let visibility: DocumentVisibilityState = 'visible'
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility })
    Object.defineProperty(window, '__setHeroVisibility', {
      value: (value: DocumentVisibilityState) => {
        visibility = value
        document.dispatchEvent(new Event('visibilitychange'))
      },
    })
  })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openReadyPage(page, routes[0])
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)

  const setVisibility = (visibility: DocumentVisibilityState) => page.evaluate(value => {
    (window as Window & { __setHeroVisibility: (value: DocumentVisibilityState) => void }).__setHeroVisibility(value)
  }, visibility)
  await setVisibility('hidden')
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.hero__canvas circle')).toHaveCount(150)
  await expect(page.locator('.hero__canvas line')).toHaveCount(750)
  await expect(page.locator('.hero__canvas')).toHaveAttribute('height', '764')
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)
  await setVisibility('hidden')
  await setVisibility('visible')
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)
  await setVisibility('hidden')
  await setVisibility('visible')
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)
  const maxPending = await page.evaluate(() => (window as Window & { __heroRafProbe: { maxPending: number } }).__heroRafProbe.maxPending)
  expect(maxPending).toBe(1)
})

test('resizing rebuilds exact network configuration and keeps pointer interaction functional', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await openReadyPage(page, routes[0])
  const svg = page.locator('.hero__canvas')
  await expect(svg.locator('circle')).toHaveCount(120)
  await expect(svg.locator('line')).toHaveCount(720)

  await page.setViewportSize({ width: 599, height: 844 })
  await expect(svg.locator('circle')).toHaveCount(150)
  await expect(svg.locator('line')).toHaveCount(750)
  await expect(svg).toHaveAttribute('height', '764')
  await expect(svg.locator('circle')).toHaveCount(150)

  await page.setViewportSize({ width: 600, height: 844 })
  await expect(svg.locator('circle')).toHaveCount(120)
  await expect(svg.locator('line')).toHaveCount(720)
  await expect(svg).toHaveAttribute('height', '764')

  await page.setViewportSize({ width: 1200, height: 800 })
  await expect(svg.locator('circle')).toHaveCount(120)
  await expect(svg.locator('line')).toHaveCount(720)
  await expect(svg).toHaveAttribute('height', '720')
  const bounds = await svg.boundingBox()
  expect(bounds).not.toBeNull()
  await page.mouse.move(bounds!.x + 20, bounds!.y + 20)
  await expect.poll(() => svg.locator('circle[r="2"]').count()).toBe(13)
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
})

test('mobile hero preserves native scrolling during browser-chrome height resizes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openReadyPage(page, routes[0])

  const svg = page.locator('.hero__canvas')
  const firstCircle = await svg.locator('circle').first().elementHandle()
  const initialSvgHeight = await svg.getAttribute('height')
  expect(firstCircle).not.toBeNull()
  await expect(svg).toHaveCSS('touch-action', 'pan-y pinch-zoom')

  // A mobile address bar opening or closing changes only the viewport height.
  // The existing network must remain mounted so the gesture is not disrupted.
  await page.setViewportSize({ width: 390, height: 700 })
  await page.waitForTimeout(150)
  expect(await firstCircle!.evaluate(element => element.isConnected)).toBe(true)
  await expect(svg).toHaveAttribute('height', initialSvgHeight!)

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
})

test('mobile scrolling pauses offscreen hero work and avoids live backdrop blur', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium')
  await installRafProbe(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openReadyPage(page, routes[0])

  await expect.poll(() => pendingHeroFrames(page)).toBe(1)
  await expect(page.locator('.home-about__card')).toHaveCSS('backdrop-filter', 'none')

  await page.evaluate(() => document.querySelector('.home-about')?.scrollIntoView({ block: 'start' }))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500)
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)

  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)
})

test('resize while reduced motion is active rebuilds a static network without starting RAF', async ({ page }) => {
  await installRafProbe(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await openReadyPage(page, routes[0])
  const svg = page.locator('.hero__canvas')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(svg.locator('circle')).toHaveCount(150)
  await expect(svg.locator('line')).toHaveCount(750)
  await expect(svg).toHaveAttribute('height', '764')
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)
  await expect(page.getByRole('heading', { name: 'I make things', exact: true })).toBeAttached()
})

test('layout follows the baseline desktop and mobile breakpoints', async ({ page }, testInfo) => {
  await openReadyPage(page, routes[1])

  const layout = await page.evaluate(() => ({
    navDirection: getComputedStyle(document.querySelector('.header--nav')!).flexDirection,
    headingPosition: getComputedStyle(document.querySelector('.projectheading')!).position,
    viewportWidth: window.innerWidth,
  }))

  if (testInfo.project.name === 'mobile-chromium') {
    expect(layout.viewportWidth).toBe(390)
    expect(layout.navDirection).toBe('column')
    expect(layout.headingPosition).toBe('static')
  }
  else {
    expect(layout.viewportWidth).toBe(1440)
    expect(layout.navDirection).toBe('row')
    expect(layout.headingPosition).toBe('fixed')
  }
})

test('vertical page headings do not overlap content at an intermediate viewport', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 })

  for (const route of [routes[1], routes[2]]) {
    await openReadyPage(page, route)
    const heading = page.locator('.projectheading')
    const content = page.locator(route.path === '/projects' ? '.github' : '.posts-head')
    const [headingBounds, contentBounds] = await Promise.all([
      heading.boundingBox(),
      content.boundingBox(),
    ])

    expect(headingBounds).not.toBeNull()
    expect(contentBounds).not.toBeNull()
    expect(headingBounds!.x + headingBounds!.width).toBeLessThan(contentBounds!.x)
    await expect(heading).toHaveCSS('writing-mode', 'vertical-rl')

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalOverflow).toBe(false)
  }
})

test('the full project row activates its same-tab link without visiting GitHub', async ({ page }) => {
  await openReadyPage(page, routes[1])
  const firstProject = projectRecords[0]
  const firstRow = page.locator('.github-table tbody tr').first()
  const cell = firstRow.locator('td')
  const link = firstRow.getByRole('link', { name: firstProject.name })
  const [cellBounds, linkBounds] = await Promise.all([
    cell.boundingBox(),
    link.boundingBox(),
  ])

  expect(cellBounds).not.toBeNull()
  expect(linkBounds).not.toBeNull()
  expect(linkBounds!.x).toBeCloseTo(cellBounds!.x, 0)
  expect(linkBounds!.y).toBeCloseTo(cellBounds!.y, 0)
  expect(linkBounds!.width).toBeCloseTo(cellBounds!.width, 0)
  expect(Math.abs(linkBounds!.height - cellBounds!.height)).toBeLessThanOrEqual(1)

  const interceptedUrls: string[] = []
  await page.route('https://github.com/**', async (route) => {
    interceptedUrls.push(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>External navigation intercepted</title>',
    })
  })

  await cell.click({ position: { x: cellBounds!.width - 2, y: cellBounds!.height / 2 } })
  await expect(page).toHaveURL(firstProject.url)
  expect(interceptedUrls).toEqual([firstProject.url])
})

test('project links expose visible keyboard focus and activate with Enter', async ({ page }) => {
  await openReadyPage(page, routes[1])
  const firstProject = projectRecords[0]
  const link = page.locator('.github-table tbody tr').first().getByRole('link', { name: firstProject.name })

  let focusedHref: string | null = null
  for (let tabPress = 0; tabPress < 20 && focusedHref !== firstProject.url; tabPress += 1) {
    await page.keyboard.press('Tab')
    focusedHref = await page.evaluate(() => (document.activeElement as HTMLAnchorElement | null)?.href ?? null)
  }
  expect(focusedHref).toBe(firstProject.url)
  await expect(link).toBeFocused()

  const focusStyle = await link.evaluate(element => ({
    focusVisible: element.matches(':focus-visible'),
    outlineStyle: getComputedStyle(element).outlineStyle,
    outlineWidth: getComputedStyle(element).outlineWidth,
  }))
  expect(focusStyle.focusVisible).toBe(true)
  expect(focusStyle.outlineStyle).toBe('solid')
  expect(focusStyle.outlineWidth).toBe('3px')

  const interceptedUrls: string[] = []
  await page.route('https://github.com/**', async (route) => {
    interceptedUrls.push(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>External navigation intercepted</title>',
    })
  })
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(firstProject.url)
  expect(interceptedUrls).toEqual([firstProject.url])
})

test('writing post links preserve destinations and expose accessible keyboard behavior', async ({ page }) => {
  await openReadyPage(page, routes[2])
  const firstPost = postRecords[0]
  const row = page.locator('.posts-table tbody tr').first()
  const cell = row.locator('td')
  const titleLink = row.getByRole('link', { name: firstPost.title, exact: true })
  const sourceLink = row.getByRole('link', { name: firstPost.source, exact: true })
  const cta = row.getByRole('link', { name: `Read ${firstPost.title}`, exact: true })

  await expect(cta).toBeVisible()
  await cell.hover()
  await expect(cell).toHaveCSS('filter', 'brightness(1.5)')
  await cta.hover()
  await expect(cta).toHaveCSS('background-color', 'rgb(220, 219, 219)')
  await expect(cta).toHaveCSS('color', 'rgb(170, 7, 83)')
  await expect(cta).toHaveCSS('margin-left', '10px')
  await expect(titleLink).toHaveAttribute('href', firstPost.link)
  await expect(sourceLink).toHaveAttribute('href', firstPost.source)
  await expect(cta).toHaveAttribute('href', firstPost.link)
  await expect(cta).not.toHaveAttribute('target', /.+/)

  let focusedText = ''
  for (let tabPress = 0; tabPress < 20 && focusedText !== firstPost.title; tabPress += 1) {
    await page.keyboard.press('Tab')
    focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
  }
  await expect(titleLink).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(sourceLink).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(cta).toBeFocused()

  const focusStyle = await cta.evaluate(element => ({
    focusVisible: element.matches(':focus-visible'),
    outlineStyle: getComputedStyle(element).outlineStyle,
    outlineWidth: getComputedStyle(element).outlineWidth,
  }))
  expect(focusStyle.focusVisible).toBe(true)
  expect(focusStyle.outlineStyle).toBe('solid')
  expect(focusStyle.outlineWidth).toBe('3px')

  const interceptedUrls: string[] = []
  await page.route('https://g2tech.co/**', async (route) => {
    interceptedUrls.push(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>External navigation intercepted</title>',
    })
  })
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(firstPost.link)
  expect(interceptedUrls).toEqual([firstPost.link])
})
