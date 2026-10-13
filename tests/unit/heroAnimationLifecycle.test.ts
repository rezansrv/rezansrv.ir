import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHeroAnimationLifecycle } from '../../app/utils/heroAnimationLifecycle.ts'

function createFrameQueue() {
  let nextHandle = 0
  const callbacks = new Map<number, FrameRequestCallback>()
  const canceled: number[] = []

  return {
    callbacks,
    canceled,
    requestFrame(callback: FrameRequestCallback) {
      const handle = ++nextHandle
      callbacks.set(handle, callback)
      return handle
    },
    cancelFrame(handle: number) {
      canceled.push(handle)
      callbacks.delete(handle)
    },
    flush(handle: number) {
      const callback = callbacks.get(handle)
      assert.ok(callback, `Expected frame ${handle} to be pending`)
      callbacks.delete(handle)
      callback(16)
    },
  }
}

test('the animation loop is singular and start/stop are idempotent', () => {
  const frames = createFrameQueue()
  const lifecycle = createHeroAnimationLifecycle(frames)
  let updates = 0

  assert.equal(lifecycle.start(() => updates++), true)
  assert.equal(lifecycle.start(() => updates++), false)
  assert.equal(frames.callbacks.size, 1)
  frames.flush(lifecycle.pendingFrame!)
  assert.equal(updates, 1)
  assert.equal(frames.callbacks.size, 1)

  const pending = lifecycle.pendingFrame!
  lifecycle.stop()
  lifecycle.stop()
  assert.deepEqual(frames.canceled, [pending])
  assert.equal(frames.callbacks.size, 0)
  assert.equal(lifecycle.isRunning, false)
})

test('dispose cancels a pending frame and prevents late callbacks from restarting', () => {
  const frames = createFrameQueue()
  const lifecycle = createHeroAnimationLifecycle(frames)
  let updates = 0

  lifecycle.start(() => updates++)
  const pending = lifecycle.pendingFrame!
  const lateCallback = frames.callbacks.get(pending)!
  lifecycle.dispose()
  lifecycle.dispose()
  lateCallback(16)

  assert.deepEqual(frames.canceled, [pending])
  assert.equal(frames.callbacks.size, 0)
  assert.equal(updates, 0)
  assert.equal(lifecycle.start(() => updates++), false)
  assert.equal(lifecycle.isDisposed, true)
})

test('dispose removes stable event listeners and tracked SVG nodes', () => {
  const frames = createFrameQueue()
  const lifecycle = createHeroAnimationLifecycle(frames)
  const target = new EventTarget()
  let events = 0
  const listener: EventListener = () => events++
  let removed = 0
  const element = {
    remove() { removed++ },
  } as unknown as SVGElement

  assert.equal(lifecycle.listen(target, 'pointermove', listener), true)
  assert.equal(lifecycle.listen(target, 'pointermove', listener), false)
  assert.equal(lifecycle.track(element), true)
  target.dispatchEvent(new Event('pointermove'))
  assert.equal(events, 1)

  lifecycle.dispose()
  target.dispatchEvent(new Event('pointermove'))
  assert.equal(events, 1)
  assert.equal(removed, 1)
  assert.equal(lifecycle.listen(target, 'pointermove', listener), false)
  assert.equal(lifecycle.track(element), false)
})

test('stop allows a fresh single loop until disposal', () => {
  const frames = createFrameQueue()
  const lifecycle = createHeroAnimationLifecycle(frames)
  lifecycle.start(() => {})
  lifecycle.stop()

  assert.equal(lifecycle.start(() => {}), true)
  assert.equal(frames.callbacks.size, 1)
  lifecycle.dispose()
  assert.equal(frames.callbacks.size, 0)
})
