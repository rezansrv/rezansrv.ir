import { expect, test, type Page } from '@playwright/test'

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
      await expect(page.locator('.github-table tbody tr')).toHaveCount(15)
    }
    else {
      await expect(page.locator('.posts-table tbody tr')).toHaveCount(2)
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
