import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

function extractBlock(source, pattern) {
  const match = pattern.exec(source)
  assert.ok(match, `Expected to find ${pattern} in CSS`)
  const openingBrace = source.indexOf('{', match.index)
  let depth = 0
  for (let index = openingBrace; index < source.length; index++) {
    if (source[index] === '{') depth++
    if (source[index] === '}' && --depth === 0) return source.slice(openingBrace + 1, index)
  }
  assert.fail('Unterminated CSS block')
}

function normalizeColor(color) {
  const normalized = color.toLowerCase()
  const colors = {
    '#f00': 'red',
    '#ff0000': 'red',
    '#00f': 'blue',
    '#0000ff': 'blue',
    '#0f0': 'lime',
    '#00ff00': 'lime',
  }
  return colors[normalized] ?? normalized
}

function parseShadow(shadow) {
  const declarations = shadow.split(',')
  assert.equal(declarations.length, 2, `Expected exactly two opposing shadows: ${shadow}`)
  const parseOne = (declaration) => {
    const match = declaration.trim().match(/^(-?(?:\d+(?:\.\d*)?|\.\d+))(px)?\s+0(?:px)?(?:\s+0(?:px)?)?\s+(red|blue|lime|#[\da-f]{3,8})$/i)
    assert.ok(match, `Unexpected text-shadow structure: ${declaration}`)
    const offset = Number(match[1])
    assert.ok(offset === 0 || match[2] === 'px', `Nonzero shadow offset must remain in px: ${declaration}`)
    return { offset, color: normalizeColor(match[3]) }
  }
  const first = parseOne(declarations[0])
  const second = parseOne(declarations[1])
  assert.equal(second.offset, first.offset === 0 ? 0 : -first.offset, `Shadows must have opposing x offsets: ${shadow}`)
  return [first.offset, 0, 0, first.color, second.offset === 0 ? 0 : second.offset, 0, 0, second.color]
}

function effectiveKeyframes(block, strict = true) {
  const frames = new Map()
  for (const match of block.matchAll(/(\d+(?:\.\d+)?%|to)\s*\{([^{}]*)\}/gi)) {
    const shadow = match[2].match(/text-shadow\s*:\s*([^;]+);?/i)?.[1]
    if (!shadow) {
      if (strict) assert.fail(`Missing text-shadow at ${match[1]}`)
      continue
    }
    frames.set(match[1].toLowerCase() === 'to' ? 100 : Number.parseFloat(match[1]), parseShadow(shadow))
  }
  return frames
}

function approvedShadow(offset, firstColor, secondColor) {
  return [offset, 0, 0, firstColor, offset === 0 ? 0 : -offset, 0, 0, secondColor]
}

const approvedKeyframes = new Map()
const addFrame = (percentage, offset, firstColor, secondColor) => {
  approvedKeyframes.set(percentage, approvedShadow(offset, firstColor, secondColor))
}
const addSegment = (start, offsets, firstColor, secondColor) => {
  offsets.forEach((offset, index) => addFrame(start + index, offset, firstColor, secondColor))
}

addSegment(0, [1, 2, 3, 4, 5, 4, 3, 2, 1, 0, -1], 'red', 'blue')
addSegment(11, [0.5, 1, 1.5, 2, 2.5, 1.5, 0.5, -0.5, -1.5, -2.5], 'red', 'lime')
addSegment(21, [0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9, 5.6, 6.3, 7], 'blue', 'lime')
addSegment(31, [6, 5, 4, 3, 2, 1, 0, -1, -2, -3], 'blue', 'lime')
addFrame(41, 50, 'blue', 'lime')
addFrame(42, 0, 'blue', 'lime')
addSegment(43, [0.5, 1, 1.5, 2, 1, 0, -1, -2], 'red', 'lime')
addSegment(51, [1, 2, 3, 4, 5, 4, 3, 2, 1, 0], 'red', 'blue')
addFrame(61, 30, 'red', 'lime')
addFrame(62, 0, 'red', 'lime')
addSegment(63, [0.5, 1, 1.5, 2, 1, 0, -1, -2], 'red', 'blue')
addFrame(71, 70, 'red', 'blue')
addFrame(72, 0, 'red', 'blue')
addSegment(73, [1, 2, 3, 4, 3, 2, 1, 0], 'red', 'blue')
addSegment(81, [0.5, 1, 1.5, 2, 2.5, 1.5, 0.5, -0.5, -1.5, -2.5], 'red', 'lime')
addFrame(91, 60, 'lime', 'blue')
addFrame(92, 0, 'lime', 'blue')
addFrame(92, 0.7, 'blue', 'lime')
addSegment(93, [1.4, 2.1, 2.8, 1.8, 0.8, -0.2, -1.2, -2.2], 'blue', 'lime')
assert.equal(approvedKeyframes.size, 101, 'Approved glitch baseline should cover all percentages')

const cssRoot = resolve(process.cwd(), '.output/public/_nuxt')
const cssFiles = readdirSync(cssRoot).filter(file => file.endsWith('.css'))
assert.ok(cssFiles.length > 0, 'Static output should contain compiled CSS')
const compiledCss = cssFiles.map(file => readFileSync(join(cssRoot, file), 'utf8')).join('\n')
const animationRule = compiledCss.match(/\.text-glitch[^{}]*\{([^{}]*)\}/)
assert.ok(animationRule, 'Compiled CSS should contain the hero headline rule')
const animation = animationRule[1].match(/(?:^|;)animation\s*:\s*([^;]+)/)?.[1]
assert.ok(animation, 'Compiled headline CSS should include its animation shorthand')
assert.match(animation, /2s/, 'Glitch duration should remain 2s')
assert.match(animation, /steps\(100(?:,\s*end)?\)/, 'Glitch timing should remain the semantic equivalent of steps(100)')
assert.match(animation, /infinite/, 'Glitch should continue repeating')

const keyframeBlocks = [...compiledCss.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)]
const linkedKeyframe = keyframeBlocks.find(match => animation.split(/\s+/).includes(match[1]))
assert.ok(linkedKeyframe, 'The headline animation shorthand should reference its compiled keyframes')
const linkedBlock = extractBlock(compiledCss.slice(linkedKeyframe.index), /^@keyframes\s+[\w-]+\s*\{/)
const compiledKeyframes = effectiveKeyframes(linkedBlock, false)
assert.equal(compiledKeyframes.size, 101, 'The headline-linked animation should have 101 effective frames')
assert.deepEqual([...compiledKeyframes], [...approvedKeyframes], 'Compiled Nuxt keyframes must match the approved baseline')
assert.deepEqual(compiledKeyframes.get(41), [50, 0, 0, 'blue', -50, 0, 0, 'lime'])
assert.deepEqual(compiledKeyframes.get(61), [30, 0, 0, 'red', -30, 0, 0, 'lime'])
assert.deepEqual(compiledKeyframes.get(71), [70, 0, 0, 'red', -70, 0, 0, 'blue'])
assert.deepEqual(compiledKeyframes.get(91), [60, 0, 0, 'lime', -60, 0, 0, 'blue'])
assert.deepEqual(compiledKeyframes.get(92), [0.7, 0, 0, 'blue', -0.7, 0, 0, 'lime'])

process.stdout.write('Compiled Nuxt glitch keyframes match the approved 0%-100% baseline.\n')
