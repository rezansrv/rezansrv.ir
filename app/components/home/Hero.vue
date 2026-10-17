<template>
  <section
    class="hero"
    style="background-image: url('/images/backGround.jpg')"
    aria-labelledby="hero-heading"
  >
    <h2
      id="hero-heading"
      class="visually-hidden"
    >
      I make things
    </h2>
    <svg
      class="hero__canvas"
      role="group"
      aria-labelledby="hero-title hero-description"
    >
      <title id="hero-title">{{ displayText }}</title>
      <desc id="hero-description">An animated network of dots and connecting lines.</desc>
      <text
        ref="headline"
        class="text-glitch"
        x="50%"
        y="50%"
        text-anchor="middle"
        role="button"
        tabindex="0"
        :aria-label="displayText"
        :aria-pressed="isAlternateHeadline"
      >{{ displayText }}</text>
      <g
        ref="dynamicLayer"
        aria-hidden="true"
      />
    </svg>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createHeroNetwork, type HeroNetwork } from '~/utils/heroNetwork'
import { createHeroAnimationLifecycle } from '~/utils/heroAnimationLifecycle'
import { createHeroAnimationRunState } from '~/utils/heroAnimationRunState'
import { applyHeroPointerInteraction, createHeroPointerState } from '~/utils/heroPointerInteraction'

const dynamicLayer = ref<SVGGElement | null>(null)
const headline = ref<SVGTextElement | null>(null)
const displayText = ref('I make things')
const isAlternateHeadline = ref(false)
const pointer = createHeroPointerState()
let lifecycle: ReturnType<typeof createHeroAnimationLifecycle> | null = null
let runState: ReturnType<typeof createHeroAnimationRunState> | null = null
let network: HeroNetwork | null = null
let circles: SVGCircleElement[] = []
let renderedRadii: number[] = []
let linePaths: SVGPathElement[] = []
let latestClientPointer: { x: number; y: number } | null = null
let resizeTimer: number | null = null

const handleSvgMouseMove: EventListener = (event) => {
  if (!runState?.isActive) return
  const svg = dynamicLayer.value?.ownerSVGElement
  if (!svg) return

  const mouseEvent = event as MouseEvent
  const bounds = svg.getBoundingClientRect()
  latestClientPointer = { x: mouseEvent.clientX, y: mouseEvent.clientY }
  pointer.moving = true
  pointer.x = mouseEvent.clientX - bounds.left
  pointer.y = mouseEvent.clientY - bounds.top
}

const handleHeadlineMouseOver = () => {
  displayText.value = 'I break things'
  isAlternateHeadline.value = true
  pointer.power = 55
}

const handleHeadlineMouseOut = () => {
  displayText.value = 'I make things'
  isAlternateHeadline.value = false
  pointer.power = 40
}

onMounted(() => {
  if (!dynamicLayer.value) return

  lifecycle = createHeroAnimationLifecycle({
    requestFrame: callback => window.requestAnimationFrame(callback),
    cancelFrame: handle => window.cancelAnimationFrame(handle),
  })

  const svg = dynamicLayer.value.ownerSVGElement
  if (!svg) return
  const coarsePointerQuery = window.matchMedia('(pointer: coarse)')

  const updateNetwork = () => {
    if (!network) return

    network.step()
    for (let dotIndex = 0; dotIndex < network.dots.length; dotIndex++) {
      const dot = network.dots[dotIndex]!
      const circle = circles[dotIndex]!
      circle.setAttribute('cx', String(dot.x))
      circle.setAttribute('cy', String(dot.y))
      if (renderedRadii[dotIndex] !== dot.radius) {
        circle.setAttribute('r', String(dot.radius))
        renderedRadii[dotIndex] = dot.radius
      }

      let pathData = ''
      for (const line of dot.lines) {
        pathData += `M${line.x1} ${line.y1}L${line.x2} ${line.y2}`
      }
      linePaths[dotIndex]!.setAttribute('d', pathData)
    }

    // The Vue 2 mouseInteraction ran after dotUpdate, so these model changes
    // become visible in the SVG on the following animation update.
    applyHeroPointerInteraction(network.dots, pointer)
  }

  let lastViewportWidth = Number.NaN
  let lastViewportHeight = Number.NaN

  const rebuildNetwork = () => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (viewportWidth === lastViewportWidth && viewportHeight === lastViewportHeight) return false

    lastViewportWidth = viewportWidth
    lastViewportHeight = viewportHeight
    pointer.moving = false
    pointer.distances = []
    lifecycle?.clearTracked()
    circles = []
    renderedRadii = []
    linePaths = []

    const layer = dynamicLayer.value
    if (!layer) return false

    const screenWidth = viewportWidth - 10
    const screenHeight = viewportHeight - 80
    svg.setAttribute('height', String(screenHeight))
    network = createHeroNetwork(viewportWidth, screenWidth, screenHeight)

    for (const dot of network.dots) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', String(dot.x))
      circle.setAttribute('cy', String(dot.y))
      circle.setAttribute('r', String(dot.radius))
      lifecycle?.track(circle)
      layer.appendChild(circle)
      circles.push(circle)
      renderedRadii.push(dot.radius)

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('class', 'hero__network-lines')
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', 'rgba(0,255,255,0.00)')
      path.setAttribute('stroke-width', '1')
      lifecycle?.track(path)
      layer.appendChild(path)
      linePaths.push(path)
    }

    // Preserve the legacy synchronous first update and style initialization.
    updateNetwork()
    for (const circle of circles) circle.setAttribute('fill', '#ADAAAA51')
    for (const path of linePaths) path.setAttribute('stroke', '#ADAAAA33')

    if (latestClientPointer && runState?.isActive) {
      const bounds = svg.getBoundingClientRect()
      pointer.x = latestClientPointer.x - bounds.left
      pointer.y = latestClientPointer.y - bounds.top
      pointer.moving = true
    }
    return true
  }

  const flushResize = () => {
    if (resizeTimer !== null) {
      window.clearTimeout(resizeTimer)
      resizeTimer = null
    }
    rebuildNetwork()
  }

  const handleResize: EventListener = () => {
    // Mobile Safari emits resize events while its browser chrome expands and
    // collapses during a scroll. The CSS viewport already adapts; rebuilding
    // the animated SVG here would replace hundreds of live nodes mid-gesture.
    // Real mobile orientation changes are handled separately below.
    if (coarsePointerQuery.matches) return
    if (resizeTimer !== null) window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(flushResize, 100)
  }

  const handleOrientationChange: EventListener = () => {
    if (resizeTimer !== null) window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(flushResize, 150)
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleMotionPreference: EventListener = (event) => {
    const change = event as MediaQueryListEvent
    if (change.matches) pointer.moving = false
    runState?.setReducedMotion(change.matches)
  }

  const handleVisibilityChange: EventListener = () => {
    const visible = document.visibilityState === 'visible'
    if (visible && resizeTimer !== null) flushResize()
    if (!visible) pointer.moving = false
    runState?.setVisible(visible)
  }

  // Build one meaningful static network even when motion is reduced or the tab starts hidden.
  rebuildNetwork()
  lifecycle.listen(svg, 'mousemove', handleSvgMouseMove)
  if (headline.value) {
    lifecycle.listen(headline.value, 'mouseover', handleHeadlineMouseOver)
    lifecycle.listen(headline.value, 'mouseout', handleHeadlineMouseOut)
    lifecycle.listen(headline.value, 'focus', handleHeadlineMouseOver)
    lifecycle.listen(headline.value, 'blur', handleHeadlineMouseOut)
  }
  lifecycle.listen(window, 'resize', handleResize)
  lifecycle.listen(window, 'orientationchange', handleOrientationChange)
  lifecycle.listen(document, 'visibilitychange', handleVisibilityChange)
  lifecycle.listen(mediaQuery, 'change', handleMotionPreference)

  runState = createHeroAnimationRunState({
    start: () => lifecycle?.start(updateNetwork),
    stop: () => lifecycle?.stop(),
  })
  runState.setReducedMotion(mediaQuery.matches)
  runState.setVisible(document.visibilityState === 'visible')

})

onUnmounted(() => {
  if (resizeTimer !== null) {
    window.clearTimeout(resizeTimer)
    resizeTimer = null
  }
  runState?.dispose()
  runState = null
  lifecycle?.dispose()
  lifecycle = null
  network = null
  circles = []
  renderedRadii = []
  linePaths = []
  latestClientPointer = null
  pointer.moving = false
  pointer.distances = []
})
</script>

<style scoped lang="scss">
@use "sass:list";

$glitch-red-blue: (1px, 2px, 3px, 4px, 5px, 4px, 3px, 2px, 1px, 0px, -1px);
$glitch-red-lime: (0.5px, 1px, 1.5px, 2px, 2.5px, 1.5px, 0.5px, -0.5px, -1.5px, -2.5px);
$glitch-blue-lime-rise: (0.7px, 1.4px, 2.1px, 2.8px, 3.5px, 4.2px, 4.9px, 5.6px, 6.3px, 7px);
$glitch-blue-lime-fall: (6px, 5px, 4px, 3px, 2px, 1px, 0px, -1px, -2px, -3px);
$glitch-red-lime-tail: (0.5px, 1px, 1.5px, 2px, 1px, 0px, -1px, -2px);
$glitch-red-blue-rise: (1px, 2px, 3px, 4px, 5px, 4px, 3px, 2px, 1px, 0px);
$glitch-red-blue-tail: (0.5px, 1px, 1.5px, 2px, 1px, 0px, -1px, -2px);
$glitch-red-blue-repeat: (1px, 2px, 3px, 4px, 3px, 2px, 1px, 0px);
$glitch-red-lime-long: (0.5px, 1px, 1.5px, 2px, 2.5px, 1.5px, 0.5px, -0.5px, -1.5px, -2.5px);
$glitch-blue-lime-end: (1.4px, 2.1px, 2.8px, 1.8px, 0.8px, -0.2px, -1.2px, -2.2px);

@mixin glitch-frame($percentage, $offset, $first-color, $second-color) {
  #{$percentage}% {
    text-shadow: $offset 0 0 $first-color, -$offset 0 0 $second-color;
  }
}

@mixin glitch-segment($start, $offsets, $first-color, $second-color) {
  @for $index from 1 through list.length($offsets) {
    @include glitch-frame($start + $index - 1, list.nth($offsets, $index), $first-color, $second-color);
  }
}

.hero {
  width: 100%;
  height: 90vh;
  min-height: 420px;
  overflow: hidden;
  overflow-anchor: none;
  contain: layout paint;
  background-repeat: no-repeat;
  background-position: 65% center;
  background-size: cover;
}

.hero__canvas {
  width: 100%;
  height: 100%;
  overflow-anchor: none;
}

@media (pointer: coarse) {
  .hero__canvas {
    touch-action: pan-y pinch-zoom;
  }
}

.text-glitch {
  fill: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 11.5vw;
  font-weight: bold;
  text-transform: uppercase;
  animation: glitch 2s steps(100) infinite;
}

.text-glitch:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 8px;
}

@media (prefers-reduced-motion: reduce) {
  .text-glitch {
    animation: none;
  }
}

@media (max-width: 600px) {
  .text-glitch {
    font-size: 11.5vw;
  }
}

@keyframes glitch {
  @include glitch-segment(0, $glitch-red-blue, red, blue);
  @include glitch-segment(11, $glitch-red-lime, red, lime);
  @include glitch-segment(21, $glitch-blue-lime-rise, blue, lime);
  @include glitch-segment(31, $glitch-blue-lime-fall, blue, lime);
  @include glitch-frame(41, 50px, blue, lime);
  @include glitch-frame(42, 0px, blue, lime);
  @include glitch-segment(43, $glitch-red-lime-tail, red, lime);
  @include glitch-segment(51, $glitch-red-blue-rise, red, blue);
  @include glitch-frame(61, 30px, red, lime);
  @include glitch-frame(62, 0px, red, lime);
  @include glitch-segment(63, $glitch-red-blue-tail, red, blue);
  @include glitch-frame(71, 70px, red, blue);
  @include glitch-frame(72, 0px, red, blue);
  @include glitch-segment(73, $glitch-red-blue-repeat, red, blue);
  @include glitch-segment(81, $glitch-red-lime-long, red, lime);
  @include glitch-frame(91, 60px, lime, blue);
  @include glitch-frame(92, 0px, lime, blue);
  @include glitch-frame(92, 0.7px, blue, lime);
  @include glitch-segment(93, $glitch-blue-lime-end, blue, lime);
}
</style>
