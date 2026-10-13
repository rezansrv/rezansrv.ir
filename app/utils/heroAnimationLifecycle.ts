export type HeroAnimationLifecycleOptions = {
  requestFrame: (callback: FrameRequestCallback) => number
  cancelFrame: (handle: number) => void
}

type RegisteredListener = {
  target: EventTarget
  type: string
  listener: EventListener
}

export function createHeroAnimationLifecycle(options: HeroAnimationLifecycleOptions) {
  let running = false
  let disposed = false
  let frameHandle: number | null = null
  let onFrame: (() => void) | null = null
  const listeners: RegisteredListener[] = []
  const generatedElements = new Set<SVGElement>()

  const schedule = () => {
    if (disposed || !running || frameHandle !== null || !onFrame) return

    frameHandle = options.requestFrame(() => {
      frameHandle = null
      if (disposed || !running || !onFrame) return

      onFrame()
      schedule()
    })
  }

  const stop = () => {
    running = false
    onFrame = null
    if (frameHandle !== null) {
      options.cancelFrame(frameHandle)
      frameHandle = null
    }
  }

  return {
    start(callback: () => void) {
      if (disposed || running) return false
      running = true
      onFrame = callback
      schedule()
      return true
    },
    stop,
    listen(target: EventTarget, type: string, listener: EventListener) {
      if (disposed || listeners.some(entry => entry.target === target && entry.type === type && entry.listener === listener)) {
        return false
      }
      target.addEventListener(type, listener)
      listeners.push({ target, type, listener })
      return true
    },
    track(element: SVGElement) {
      if (disposed) return false
      generatedElements.add(element)
      return true
    },
    dispose() {
      if (disposed) return
      stop()
      disposed = true

      for (const { target, type, listener } of listeners) {
        target.removeEventListener(type, listener)
      }
      listeners.length = 0

      for (const element of generatedElements) {
        element.remove()
      }
      generatedElements.clear()
      onFrame = null
    },
    get isRunning() {
      return running
    },
    get isDisposed() {
      return disposed
    },
    get pendingFrame() {
      return frameHandle
    },
  }
}
