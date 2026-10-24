export type HeroNetworkLine = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export type HeroNetworkDot = {
  x: number
  y: number
  radius: number
  distances: Array<[number, number]>
  lines: HeroNetworkLine[]
}

export type HeroNetwork = {
  dots: HeroNetworkDot[]
  dotCount: number
  linesPerDot: number
  step: () => void
}

export function createHeroNetwork(
  viewportWidth: number,
  screenWidth: number,
  screenHeight: number,
  random: () => number = Math.random,
): HeroNetwork {
  const dotCount = viewportWidth < 600 ? 150 : 120
  const linesPerDot = viewportWidth < 600 ? 5 : 6
  const dotRandomMax = 2

  const dotRows = Math.sqrt(dotCount * (screenHeight / screenWidth))
  let dotColumns = dotCount / dotRows
  const dotPositionStepX = Math.round(screenWidth / dotColumns)
  const dotPositionStepY = Math.round(screenHeight / dotRows)
  // The legacy code rounds dotRows here, but never reads it again.
  dotColumns = Math.round(dotColumns)

  const dots: HeroNetworkDot[] = []

  for (let i = 0, j = 0, k = 0; i < dotCount; i++, k++) {
    if (i % dotColumns === 0) {
      j++
      k = 0
    }

    const x = k * dotPositionStepX + dotPositionStepX / 2
      + Math.floor((random() * dotRandomMax) + 1 - dotRandomMax / 2)
    const y = j * dotPositionStepY - dotPositionStepY / 2
      + Math.floor((random() * dotRandomMax) + 1 - dotRandomMax / 2)

    dots[i] = {
      x,
      y,
      radius: 1,
      distances: Array.from({ length: linesPerDot }, () => [-1, Number.POSITIVE_INFINITY]),
      lines: Array.from({ length: linesPerDot }, () => ({
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      })),
    }
  }

  const step = () => {
    for (let i = 0; i < dotCount; i++) {
      const dot = dots[i]!
      dot.x += Math.floor((random() * 5) - 2)
      dot.y += Math.floor((random() * 5) - 2)
      dot.x = Math.max(0, Math.min(screenWidth, dot.x))
      dot.y = Math.max(0, Math.min(screenHeight, dot.y))

      const distances = dot.distances
      for (const nearest of distances) {
        nearest[0] = -1
        nearest[1] = Number.POSITIVE_INFINITY
      }

      for (let j = 0; j < dotCount; j++) {
        const other = dots[j]!
        const distance = Math.floor(Math.sqrt(
          Math.pow(dot.x - other.x, 2) + Math.pow(dot.y - other.y, 2),
        ))

        let insertAt = linesPerDot
        for (let nearestIndex = 0; nearestIndex < linesPerDot; nearestIndex++) {
          if (distance < distances[nearestIndex]![1]) {
            insertAt = nearestIndex
            break
          }
        }
        if (insertAt === linesPerDot) continue

        for (let nearestIndex = linesPerDot - 1; nearestIndex > insertAt; nearestIndex--) {
          distances[nearestIndex]![0] = distances[nearestIndex - 1]![0]
          distances[nearestIndex]![1] = distances[nearestIndex - 1]![1]
        }
        distances[insertAt]![0] = j
        distances[insertAt]![1] = distance
      }

      for (let k = 0; k < linesPerDot; k++) {
        const line = dot.lines[k]!
        const other = dots[distances[k]![0]]!
        line.x1 = dot.x
        line.y1 = dot.y
        line.x2 = other.x
        line.y2 = other.y
      }
    }
  }

  return { dots, dotCount, linesPerDot, step }
}
