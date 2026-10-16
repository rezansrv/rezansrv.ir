import { expect, test, type Page } from '@playwright/test'

async function installRafProbe(page: Page) {
  await page.addInitScript(() => {
    const probe = { pending: new Set<number>() }
    Object.defineProperty(window, '__heroRafProbe', { value: probe })
    const request = window.requestAnimationFrame.bind(window)
    const cancel = window.cancelAnimationFrame.bind(window)

    window.requestAnimationFrame = (callback) => {
      let handle = 0
      handle = request((timestamp) => {
        probe.pending.delete(handle)
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

async function pendingHeroFrames(page: Page) {
  return page.evaluate(() => (
    window as Window & { __heroRafProbe: { pending: Set<number> } }
  ).__heroRafProbe.pending.size)
}

test('iPhone touch scrolling suspends Hero rendering only while the gesture is active', async ({ page }) => {
  await installRafProbe(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const hero = page.locator('.hero')
  const headline = page.locator('.text-glitch')
  await expect(hero).toBeVisible()
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)

  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    }))
  })
  await expect(hero).toHaveClass(/hero--ios-scroll-paused/)
  await expect(headline).toHaveCSS('animation-play-state', 'paused')
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)

  await page.evaluate(() => {
    window.scrollTo(0, 600)
  })
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await expect(hero).toHaveClass(/hero--ios-scroll-paused/)
  await expect.poll(() => pendingHeroFrames(page)).toBe(0)

  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    }))
  })
  await expect(hero).not.toHaveClass(/hero--ios-scroll-paused/)
  await expect.poll(() => pendingHeroFrames(page)).toBe(1)
})
