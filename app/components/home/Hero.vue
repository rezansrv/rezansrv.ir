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
      role="img"
      aria-labelledby="hero-title hero-description"
    >
      <title id="hero-title">I make things</title>
      <desc id="hero-description">An animated network of dots and connecting lines.</desc>
      <text
        class="text-glitch"
        x="50%"
        y="50%"
        text-anchor="middle"
      >I make things</text>
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

const dynamicLayer = ref<SVGGElement | null>(null)
let lifecycle: ReturnType<typeof createHeroAnimationLifecycle> | null = null
let network: HeroNetwork | null = null
let circles: SVGCircleElement[] = []
let lines: SVGLineElement[] = []

onMounted(() => {
  if (!dynamicLayer.value) return

  lifecycle = createHeroAnimationLifecycle({
    requestFrame: callback => window.requestAnimationFrame(callback),
    cancelFrame: handle => window.cancelAnimationFrame(handle),
  })

  const screenWidth = window.innerWidth - 10
  const screenHeight = window.innerHeight - 80
  const svg = dynamicLayer.value.ownerSVGElement
  if (!svg) return

  svg.setAttribute('height', String(screenHeight))
  network = createHeroNetwork(window.innerWidth, screenWidth, screenHeight)

  for (const dot of network.dots) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', String(dot.x))
    circle.setAttribute('cy', String(dot.y))
    circle.setAttribute('r', String(dot.radius))
    lifecycle.track(circle)
    dynamicLayer.value.appendChild(circle)
    circles.push(circle)

    for (const line of dot.lines) {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      element.setAttribute('x1', String(line.x1))
      element.setAttribute('y1', String(line.y1))
      element.setAttribute('x2', String(line.x2))
      element.setAttribute('y2', String(line.y2))
      element.setAttribute('stroke', 'rgba(0,255,255,0.00)')
      element.setAttribute('stroke-width', '1')
      lifecycle.track(element)
      dynamicLayer.value.appendChild(element)
      lines.push(element)
    }
  }

  const updateNetwork = () => {
    if (!network) return

    network.step()
    let lineIndex = 0
    for (let dotIndex = 0; dotIndex < network.dots.length; dotIndex++) {
      const dot = network.dots[dotIndex]!
      const circle = circles[dotIndex]!
      circle.setAttribute('cx', String(dot.x))
      circle.setAttribute('cy', String(dot.y))
      circle.setAttribute('r', String(dot.radius))

      for (const line of dot.lines) {
        const element = lines[lineIndex++]!
        element.setAttribute('x1', String(line.x1))
        element.setAttribute('y1', String(line.y1))
        element.setAttribute('x2', String(line.x2))
        element.setAttribute('y2', String(line.y2))
      }
    }
  }

  // The legacy mounted sequence moves and draws once synchronously before RAF.
  updateNetwork()
  for (const circle of circles) circle.setAttribute('fill', '#ADAAAA51')
  for (const line of lines) line.setAttribute('stroke', '#ADAAAA33')
  lifecycle.start(updateNetwork)
})

onUnmounted(() => {
  lifecycle?.dispose()
  lifecycle = null
  network = null
  circles = []
  lines = []
})
</script>

<style scoped>
.hero {
  width: 100%;
  height: 90vh;
  min-height: 420px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: 65% center;
  background-size: cover;
}

.hero__canvas {
  width: 100%;
  height: 90vh;
}

.text-glitch {
  fill: #fff;
  font-family: "Gotham XNarrow A", "Gotham XNarrow B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 11.5vw;
  font-weight: bold;
  text-transform: uppercase;
  animation: glitch 2s steps(20) infinite;
}

@media (max-width: 600px) {
  .text-glitch {
    font-size: 11.5vw;
  }
}

@keyframes glitch {
  0%, 85%, 100% { text-shadow: 1px 0 0 red, -1px 0 0 blue; }
  88% { text-shadow: 5px 0 0 red, -5px 0 0 blue; }
  91% { text-shadow: -3px 0 0 blue, 3px 0 0 lime; }
  94% { text-shadow: 7px 0 0 blue, -7px 0 0 lime; }
  97% { text-shadow: -2px 0 0 red, 2px 0 0 blue; }
}
</style>
