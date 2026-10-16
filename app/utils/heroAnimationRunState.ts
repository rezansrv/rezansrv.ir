export type HeroAnimationRunStateOptions = {
  start: () => void
  stop: () => void
}

export function createHeroAnimationRunState({ start, stop }: HeroAnimationRunStateOptions) {
  let reducedMotion = false
  let visible = false
  let inViewport = true
  let active = false
  let disposed = false

  const reconcile = () => {
    const shouldRun = !disposed && visible && inViewport && !reducedMotion
    if (shouldRun === active) return

    active = shouldRun
    if (active) start()
    else stop()
  }

  return {
    setReducedMotion(value: boolean) {
      if (disposed || reducedMotion === value) return
      reducedMotion = value
      reconcile()
    },
    setVisible(value: boolean) {
      if (disposed || visible === value) return
      visible = value
      reconcile()
    },
    setInViewport(value: boolean) {
      if (disposed || inViewport === value) return
      inViewport = value
      reconcile()
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (active) {
        active = false
        stop()
      }
    },
    get isActive() {
      return active
    },
    get isDisposed() {
      return disposed
    },
  }
}
