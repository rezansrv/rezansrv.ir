import { expect, test, type Page } from '@playwright/test'

async function installRafProbe(page: Page) {
  await page.addInitScript(() => {
    const probe = { callbacks: 0, pending: new Set<number>() }
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
      return handle
    }
    window.cancelAnimationFrame = (handle) => {
      probe.pending.delete(handle)
      cancel(handle)
    }
  })
}

async function heroProbe(page: Page) {
  return page.evaluate(() => {
    const probe = (
      window as Window & { __heroRafProbe: { callbacks: number; pending: Set<number> } }
    ).__heroRafProbe
    return { callbacks: probe.callbacks, pending: probe.pending.size }
  })
}

test('iPhone scrolling advances while the optimized Hero keeps animating', async ({ page }) => {
  await installRafProbe(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const hero = page.locator('.hero')
  const canvas = page.locator('.hero__canvas')
  const headline = page.locator('.text-glitch')
  await expect(hero).toBeVisible()
  await expect(canvas.locator('circle')).toHaveCount(150)
  await expect(canvas.locator('.hero__network-lines')).toHaveCount(150)
  await expect(canvas.locator('line')).toHaveCount(0)
  await expect(headline).toHaveCSS('animation-play-state', 'running')
  await expect.poll(async () => (await heroProbe(page)).pending).toBe(1)

  const callbacksBeforeScroll = (await heroProbe(page)).callbacks
  const scrollResult = await page.evaluate(async () => {
    window.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    }))

    const samples: number[] = []
    const target = Math.min(400, document.documentElement.scrollHeight - window.innerHeight)
    for (let step = 1; step <= 20; step++) {
      window.scrollTo(0, target * (step / 20))
      await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()))
      samples.push(window.scrollY)
    }

    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    }))
    return { samples, target }
  })

  expect(scrollResult.target).toBeGreaterThan(300)
  expect(scrollResult.samples.at(-1)).toBeGreaterThanOrEqual(scrollResult.target - 5)
  await expect(hero).not.toHaveClass(/hero--ios-scroll-paused/)
  await expect(headline).toHaveCSS('animation-play-state', 'running')
  await expect.poll(async () => (await heroProbe(page)).pending).toBe(1)
  await expect.poll(async () => (await heroProbe(page)).callbacks).toBeGreaterThan(callbacksBeforeScroll)

  const firstCircle = await canvas.locator('circle').first().elementHandle()
  const originalHeight = await canvas.getAttribute('height')
  expect(firstCircle).not.toBeNull()

  // iOS browser chrome produces height-only resize events while scrolling.
  // They must not replace the live network or interrupt the active gesture.
  const viewport = page.viewportSize()!
  await page.setViewportSize({ width: viewport.width, height: viewport.height - 80 })
  await page.waitForTimeout(200)
  expect(await firstCircle!.evaluate(element => element.isConnected)).toBe(true)
  await expect(canvas).toHaveAttribute('height', originalHeight!)
  await expect.poll(async () => (await heroProbe(page)).pending).toBe(1)
})
