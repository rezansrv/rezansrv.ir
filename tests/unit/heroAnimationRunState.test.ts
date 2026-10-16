import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHeroAnimationRunState } from '../../app/utils/heroAnimationRunState.ts'

test('reduced motion and visibility jointly control one idempotent animation loop', () => {
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

  state.dispose()
  state.dispose()
  assert.equal(state.isDisposed, true)
  assert.equal(state.isActive, false)
  assert.deepEqual([starts, stops], [2, 2])
  state.setVisible(true)
  assert.deepEqual([starts, stops], [2, 2])
})
