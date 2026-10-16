import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHeroPointerState, applyHeroPointerInteraction } from '../../app/utils/heroPointerInteraction.ts'
import { createHeroNetwork } from '../../app/utils/heroNetwork.ts'

function fixtureDots() {
  const network = createHeroNetwork(600, 590, 400, () => 0.5)
  const dots = network.dots.slice(0, 3)
  dots[0]!.x = 3
  dots[0]!.y = 4
  dots[1]!.x = 6
  dots[1]!.y = 8
  dots[2]!.x = 30
  dots[2]!.y = 40
  return dots
}

test('pointer selects nearest dots, sets their radii, and applies legacy repulsion once', () => {
  const dots = fixtureDots()
  const pointer = createHeroPointerState()
  pointer.x = 0
  pointer.y = 0
  pointer.power = 2
  pointer.moving = true

  applyHeroPointerInteraction(dots, pointer)

  assert.equal(pointer.moving, false)
  assert.deepEqual(pointer.distances.slice(0, 3), [[0, 5], [1, 10], [2, 50]])
  assert.equal(dots[0]!.radius, 2)
  assert.equal(dots[1]!.radius, 2)
  assert.equal(dots[2]!.radius, 1)
  assert.ok(Math.abs(dots[0]!.x - (3 + 5 / 15)) < Number.EPSILON * 4)
  assert.ok(Math.abs(dots[0]!.y - (4 + 5 / 15)) < Number.EPSILON * 4)
  assert.equal(dots[1]!.x, 6)
  assert.equal(dots[1]!.y, 8)
  assert.equal(dots[2]!.x, 30)
  assert.equal(dots[2]!.y, 40)

  applyHeroPointerInteraction(dots, pointer)
  assert.equal(dots[0]!.x, 3 + 5 / 15)
})

test('pointer movement uses original axis directions and stable nearest-distance ties', () => {
  const dots = fixtureDots()
  dots[0]!.x = -3
  dots[0]!.y = 4
  dots[1]!.x = 3
  dots[1]!.y = -4
  dots[2]!.x = 20
  dots[2]!.y = 0
  const pointer = createHeroPointerState()
  pointer.x = 0
  pointer.y = 0
  pointer.power = 3
  pointer.moving = true

  applyHeroPointerInteraction(dots, pointer)

  assert.deepEqual(pointer.distances.slice(0, 3), [[0, 5], [1, 5], [2, 20]])
  assert.equal(dots[0]!.x, -4)
  assert.equal(dots[0]!.y, 5)
  assert.equal(dots[1]!.x, 4)
  assert.equal(dots[1]!.y, -5)
  assert.equal(dots[0]!.radius, 2)
  assert.equal(dots[1]!.radius, 2)
  assert.equal(dots[2]!.radius, 2)
})

test('default pointer influence is 13 and every frame resets old radii before applying it', () => {
  const network = createHeroNetwork(600, 590, 400, () => 0.5)
  const pointer = createHeroPointerState()
  assert.equal(pointer.power, 13)
  pointer.moving = true

  applyHeroPointerInteraction(network.dots, pointer)
  assert.equal(network.dots.filter(dot => dot.radius === 2).length, 13)

  pointer.power = 55
  pointer.moving = true
  applyHeroPointerInteraction(network.dots, pointer)
  assert.equal(network.dots.filter(dot => dot.radius === 2).length, 55)

  pointer.power = 40
  pointer.moving = true
  applyHeroPointerInteraction(network.dots, pointer)
  assert.equal(network.dots.filter(dot => dot.radius === 2).length, 40)
})

test('repulsion follows the network SVG update and is reflected by the next network update', () => {
  const network = createHeroNetwork(600, 590, 400, () => 0.5)
  network.dots[0]!.x = 3
  network.dots[0]!.y = 4
  network.dots[1]!.x = 6
  network.dots[1]!.y = 8
  const pointer = createHeroPointerState()
  pointer.x = 0
  pointer.y = 0
  pointer.power = 2
  pointer.moving = true

  network.step()
  const svgPositionWrittenByNetwork = network.dots[0]!.lines[0]!.x1
  applyHeroPointerInteraction(network.dots, pointer)

  assert.equal(svgPositionWrittenByNetwork, 3)
  assert.ok(network.dots[0]!.x > svgPositionWrittenByNetwork)
  assert.equal(network.dots[0]!.lines[0]!.x1, svgPositionWrittenByNetwork)

  network.step()
  assert.equal(network.dots[0]!.lines[0]!.x1, network.dots[0]!.x)
})
