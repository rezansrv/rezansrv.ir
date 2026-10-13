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

const legacyPath = resolve(process.cwd(), 'src/components/home/GlitchApp.vue')
const legacySource = readFileSync(legacyPath, 'utf8')
const legacyKeyframes = effectiveKeyframes(extractBlock(legacySource, /@keyframes\s+glitch\s*\{/))
assert.equal(legacyKeyframes.size, 101, 'Legacy source should declare all 101 percentages')

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
let compiledKeyframes = null
const linkedBlock = extractBlock(compiledCss.slice(linkedKeyframe.index), /^@keyframes\s+[\w-]+\s*\{/)
compiledKeyframes = effectiveKeyframes(linkedBlock, false)
assert.ok(compiledKeyframes, 'Compiled CSS should contain 101 effective glitch keyframes')
assert.equal(compiledKeyframes.size, 101, 'The headline-linked animation should have 101 effective frames')
assert.deepEqual([...compiledKeyframes], [...legacyKeyframes], 'Compiled Nuxt keyframes must match effective legacy CSS')
assert.deepEqual(compiledKeyframes.get(41), [50, 0, 0, 'blue', -50, 0, 0, 'lime'])
assert.deepEqual(compiledKeyframes.get(61), [30, 0, 0, 'red', -30, 0, 0, 'lime'])
assert.deepEqual(compiledKeyframes.get(71), [70, 0, 0, 'red', -70, 0, 0, 'blue'])
assert.deepEqual(compiledKeyframes.get(91), [60, 0, 0, 'lime', -60, 0, 0, 'blue'])
assert.deepEqual(compiledKeyframes.get(92), [0.7, 0, 0, 'blue', -0.7, 0, 0, 'lime'])

process.stdout.write('Compiled Nuxt glitch keyframes match all effective legacy declarations (0%-100%).\n')
