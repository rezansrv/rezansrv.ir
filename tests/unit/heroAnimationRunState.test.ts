import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHeroAnimationRunState } from '../../app/utils/heroAnimationRunState.ts'

test('reduced motion, document visibility, and viewport presence control one idempotent animation loop', () => {
  let starts = 0
  let stops = 0
  const state = createHeroAnimationRunState({ start: () => starts++, stop: () => stops++ })

  state.setReducedMotion(true)
  state.setVisible(true)
  assert.equal(state.isActive, false)
  assert.deepEqual([starts, stops], [0, 0])

  state.setReducedMotion(false)
  assert.equal(state.isActive, true)
  assert.deepEqual([starts, stops], [1, 0])
  state.setVisible(false)
  state.setVisible(false)
  assert.deepEqual([starts, stops], [1, 1])

  state.setReducedMotion(true)
  state.setVisible(true)
  assert.equal(state.isActive, false)
  assert.deepEqual([starts, stops], [1, 1])
  state.setReducedMotion(false)
  assert.equal(state.isActive, true)
  assert.deepEqual([starts, stops], [2, 1])

  state.setInViewport(false)
  state.setInViewport(false)
  assert.equal(state.isActive, false)
  assert.deepEqual([starts, stops], [2, 2])
  state.setVisible(false)
  state.setInViewport(true)
  assert.deepEqual([starts, stops], [2, 2])
  state.setVisible(true)
  assert.equal(state.isActive, true)
  assert.deepEqual([starts, stops], [3, 2])

  state.dispose()
  state.dispose()
  assert.equal(state.isDisposed, true)
  assert.equal(state.isActive, false)
  assert.deepEqual([starts, stops], [3, 3])
  state.setVisible(true)
  state.setInViewport(false)
  assert.deepEqual([starts, stops], [3, 3])
})
