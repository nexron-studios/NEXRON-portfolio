import { describe, expect, it } from 'vitest'
import {
  glintBoost,
  glintColumns,
  halftoneRadius,
  isBayerLit,
  isGlintPassing,
  secondsUntilGlint,
  windGust
} from '../dither'

const litShareOf = (level: number): number => {
  let lit = 0
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) if (isBayerLit(level, col, row)) lit++
  }
  return lit / 16
}

describe('isBayerLit', () => {
  it('should light no cell of a block at level 0', () => {
    expect(litShareOf(0)).toBe(0)
  })

  it('should light half the block at level 0.5', () => {
    expect(litShareOf(0.5)).toBe(0.5)
  })

  it('should light every cell at level 1', () => {
    expect(litShareOf(1)).toBe(1)
  })

  it('should repeat every four cells', () => {
    expect(isBayerLit(0.3, 1, 2)).toBe(isBayerLit(0.3, 5, 6))
  })
})

describe('halftoneRadius', () => {
  it('should draw no dot at level 0', () => {
    expect(halftoneRadius(0, 10)).toBe(0)
  })

  it('should cover the level as a share of the cell area', () => {
    const radius = halftoneRadius(0.25, 10)
    expect(Math.PI * radius * radius).toBeCloseTo(25)
  })

  it('should clamp levels above 1', () => {
    expect(halftoneRadius(3, 10)).toBe(halftoneRadius(1, 10))
  })
})

describe('windGust', () => {
  it('should leave the upper part of the picture still', () => {
    expect(windGust(17, 30, 100, 4.2)).toBe(1)
  })

  it('should stay within 35 % of the level on the ground', () => {
    for (let second = 0; second < 20; second += 0.7) {
      const gust = windGust(40, 90, 100, second)
      expect(gust).toBeGreaterThanOrEqual(0.65)
      expect(gust).toBeLessThanOrEqual(1.35)
    }
  })

  it('should change over time on the ground', () => {
    expect(windGust(40, 90, 100, 0)).not.toBe(windGust(40, 90, 100, 1))
  })
})

describe('glintBoost', () => {
  it('should brighten the middle of the picture most as the band crosses it', () => {
    expect(glintBoost(50, 50, 100, 100, 1.2)).toBeCloseTo(1.9)
  })

  it('should leave the picture as it is while the glint rests', () => {
    expect(glintBoost(50, 50, 100, 100, 3.5)).toBeCloseTo(1, 5)
  })
})

describe('isGlintPassing', () => {
  it('should be true while the band crosses the picture', () => {
    expect(isGlintPassing(1.2)).toBe(true)
  })

  it('should be false while the glint rests', () => {
    expect(isGlintPassing(3.5)).toBe(false)
  })
})

describe('glintColumns', () => {
  it('should span from the band to the right edge in the top row at mid pass', () => {
    expect(glintColumns(0, 100, 100, 1.2)).toEqual([80, 100])
  })
})

describe('secondsUntilGlint', () => {
  it('should be 0 while a pass is under way', () => {
    expect(secondsUntilGlint(1.2)).toBe(0)
  })

  it('should count down to the next pass while resting', () => {
    expect(secondsUntilGlint(3.5)).toBeCloseTo(0.5)
  })
})
