import type { HeroNetworkDot } from '~/utils/heroNetwork'

export type HeroPointerState = {
  x: number
  y: number
  power: number
  moving: boolean
  distances: Array<[number, number]>
}

export function createHeroPointerState(): HeroPointerState {
  return { x: 0, y: 0, power: 13, moving: false, distances: [] }
}

export function applyHeroPointerInteraction(dots: HeroNetworkDot[], pointer: HeroPointerState): void {
  if (!pointer.moving) return

  for (let index = 0; index < dots.length; index++) {
    const dot = dots[index]!
    dot.radius = 1
    pointer.distances[index] = [
      index,
      Math.floor(Math.sqrt(Math.pow(pointer.x - dot.x, 2) + Math.pow(pointer.y - dot.y, 2))),
    ]
  }
  pointer.distances.sort((a, b) => a[1] - b[1])

  for (let index = 0; index < pointer.power && index < pointer.distances.length; index++) {
    const maxDistance = pointer.distances[pointer.power - 1]![1]
    const [dotIndex, thisDistance] = pointer.distances[index]!
    const dot = dots[dotIndex]!
    const repulsion = (maxDistance - thisDistance) / 15
    dot.radius = 2

    if (pointer.x >= dot.x) dot.x -= repulsion
    else dot.x += repulsion

    if (pointer.y >= dot.y) dot.y -= repulsion
    else dot.y += repulsion
  }

  pointer.moving = false
}
