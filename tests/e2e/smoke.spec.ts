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
  { path: '/', heading: 'Hello!', title: 'Reza Naserivand | Front-End Developer' },
  { path: '/projects', heading: 'Projects', title: 'Projects | Reza Naserivand' },
  { path: '/writing', heading: 'Writing', title: 'Writing | Reza Naserivand' },
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
      await expect(page.getByText('I’m Reza Naserivand', { exact: false })).toBeVisible()
      const profileImage = page.getByRole('img', { name: 'Reza Naserivand' })
      await expect(profileImage).toHaveJSProperty('complete', true)
      expect(await profileImage.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
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
    else {
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

    const reloadResponse = await page.reload({ waitUntil: 'domcontentloaded' })
    expect(reloadResponse?.status(), `Expected ${route.path} to refresh directly`).toBe(200)
    await expect(page.getByRole('heading', { name: route.heading, exact: true }).first()).toBeVisible()
    await page.waitForTimeout(100)
    expect(diagnostics.consoleErrors, `Unexpected console or hydration errors after refreshing ${route.path}`).toEqual([])
    expect(diagnostics.pageErrors, `Unexpected runtime errors after refreshing ${route.path}`).toEqual([])
  })
}

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

test('the home network is removed and rebuilt across route unmount and remount', async ({ page }, testInfo) => {
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
  await header.getByRole('link', { name: 'Home', exact: true }).click()

  const remountedHero = page.locator('.hero__canvas')
  await expect(remountedHero).toHaveCount(1)
  await expect(remountedHero.locator('g[aria-hidden="true"]')).toHaveCount(1)
  await expect(remountedHero.locator('circle')).toHaveCount(expectedDots)
  await expect(remountedHero.locator('line')).toHaveCount(expectedLines)
  await expect(page.getByText('I make things', { exact: true }).first()).toBeAttached()
  expect(diagnostics.consoleErrors, 'Unexpected console or hydration errors after remount').toEqual([])
  expect(diagnostics.pageErrors, 'Unexpected runtime errors after remount').toEqual([])
})

test('the network moves its dots and line endpoints while preserving server-rendered hero text', async ({ page }) => {
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
