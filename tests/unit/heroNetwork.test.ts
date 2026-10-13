import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { createHeroNetwork } from '../../app/utils/heroNetwork.ts'

const seed = 0x4e554c54

function createSeededRandom() {
  let state = seed
  let calls = 0
  return {
    random() {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      calls++
      return state / 0x100000000
    },
    get calls() {
      return calls
    },
  }
}

function snapshot(network: ReturnType<typeof createHeroNetwork>, styles: boolean) {
  return {
    circles: network.dots.map(dot => ({
      x: String(dot.x),
      y: String(dot.y),
      r: String(dot.radius),
    })),
    lines: network.dots.flatMap(dot => dot.lines.map(line => styles
      ? {
          x1: String(line.x1),
          y1: String(line.y1),
          x2: String(line.x2),
          y2: String(line.y2),
          stroke: '#ADAAAA33',
          width: '1',
        }
      : {
          x1: String(line.x1),
          y1: String(line.y1),
          x2: String(line.x2),
          y2: String(line.y2),
        })),
  }
}

function digest(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

test('seeded desktop positions and connections match the captured legacy frames', () => {
  const source = createSeededRandom()
  // The legacy browser run consumes one seeded value before the component's init().
  source.random()
  const network = createHeroNetwork(1440, 1430, 820, source.random)
  assert.equal(network.dotCount, 120)
  assert.equal(network.linesPerDot, 6)
  assert.equal(source.calls, 241)

  network.step()
  assert.equal(source.calls, 481)
  assert.equal(digest(snapshot(network, true)), '7f1eb594d4773423b045e1bc5ff4afc5a8acaee20d2cad199445e911724098d4')

  network.step()
  assert.equal(source.calls, 721)
  assert.equal(digest(snapshot(network, false)), '65f24221ba87a5d37999f17e72452c551d03c4a6be7e34f0ce04f6abede59f5f')

  for (let frame = 0; frame < 59; frame++) network.step()
  assert.equal(source.calls, 1 + 240 * 62)
  const afterSixtyUpdates = snapshot(network, false)
  afterSixtyUpdates.lines = afterSixtyUpdates.lines.slice(0, 12)
  assert.equal(digest(afterSixtyUpdates), '50167ab513932658d0f95eba5dcf6b863f5b11960ec4c5be0fee24d14e80921b')
})

test('seeded mobile positions and connections match the captured legacy frames', () => {
  const source = createSeededRandom()
  // The legacy browser run consumes one seeded value before the component's init().
  source.random()
  const network = createHeroNetwork(390, 380, 764, source.random)
  assert.equal(network.dotCount, 150)
  assert.equal(network.linesPerDot, 5)
  assert.equal(source.calls, 301)

  network.step()
  assert.equal(source.calls, 601)
  assert.equal(digest(snapshot(network, true)), '8eb440dc58fbd6665f8eaed838c20afe5acfae71adba018b9f08f7d636a90692')

  network.step()
  assert.equal(source.calls, 901)
  assert.equal(digest(snapshot(network, false)), '5015687a003025261ab8ae52aca7d9cae3c2a7b240b2bd359cdc8892cc5e8e2b')

  for (let frame = 0; frame < 59; frame++) network.step()
  assert.equal(source.calls, 1 + 300 * 62)
  const afterSixtyUpdates = snapshot(network, false)
  afterSixtyUpdates.lines = afterSixtyUpdates.lines.slice(0, 12)
  assert.equal(digest(afterSixtyUpdates), '92ebb37fc1554a43998b93a02f6204a860a4cd27679970e099a1605a804710ef')
})

test('nearest-neighbor connections retain self-links and legacy stable tie order', () => {
  const network = createHeroNetwork(1440, 1430, 820, () => 0.5)
  network.step()

  assert.deepEqual(network.dots[0]!.lines[0], {
    x1: 50.5,
    y1: 50.5,
    x2: 50.5,
    y2: 50.5,
  })
  assert.equal(network.dots[0]!.lines.length, 6)
})

test('the strict 600px breakpoint and original coordinate clamping are preserved', () => {
  assert.deepEqual(
    [createHeroNetwork(599, 589, 820, () => 0.5).dotCount, createHeroNetwork(600, 590, 820, () => 0.5).dotCount],
    [150, 120],
  )

  const lowerBound = createHeroNetwork(1440, 1430, 820, () => 0)
  lowerBound.dots[0]!.x = 1
  lowerBound.dots[0]!.y = 1
  lowerBound.step()
  assert.equal(lowerBound.dots[0]!.x, 0)
  assert.equal(lowerBound.dots[0]!.y, 0)

  const upperBound = createHeroNetwork(1440, 1430, 820, () => 0.999999)
  upperBound.dots[0]!.x = 1429
  upperBound.dots[0]!.y = 819
  upperBound.step()
  assert.equal(upperBound.dots[0]!.x, 1430)
  assert.equal(upperBound.dots[0]!.y, 820)
})
