import { describe, expect, it } from 'vitest'
import { pulse, scatterStars, spawnMeteor } from '../starField'

/** A tiny deterministic generator, so the scatter can be checked. */
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

describe('scatterStars', () => {
  it('should place as many stars as the density asks for', () => {
    expect(scatterStars(1000, 1000, 0.0001, seeded(1))).toHaveLength(100)
  })

  it('should keep every star inside the viewport', () => {
    const stars = scatterStars(400, 300, 0.001, seeded(2))
    expect(stars.every((star) => star.x >= 0 && star.x < 400 && star.y >= 0 && star.y < 300)).toBe(
      true
    )
  })

  it('should only use the three depths', () => {
    const stars = scatterStars(400, 300, 0.001, seeded(3))
    expect(new Set(stars.map((star) => star.depth)).size).toBeLessThanOrEqual(3)
    expect(stars.every((star) => [0, 1, 2].includes(star.depth))).toBe(true)
  })

  it('should place nothing in an empty viewport', () => {
    expect(scatterStars(0, 0, 0.001, seeded(4))).toHaveLength(0)
  })
})

describe('spawnMeteor', () => {
  it('should start inside the upper half and fall downwards', () => {
    const random = seeded(5)
    for (let i = 0; i < 50; i++) {
      const meteor = spawnMeteor(800, 600, 10, random)
      expect(meteor.x).toBeGreaterThanOrEqual(0)
      expect(meteor.x).toBeLessThanOrEqual(800)
      expect(meteor.y).toBeGreaterThanOrEqual(0)
      expect(meteor.y).toBeLessThanOrEqual(300)
      expect(meteor.dy).toBeGreaterThan(0)
      expect(meteor.start).toBe(10)
    }
  })
})

describe('pulse', () => {
  it('should be dark before, at the end and after', () => {
    expect(pulse(-1, 1)).toBe(0)
    expect(pulse(0, 1)).toBe(0)
    expect(pulse(1, 1)).toBe(0)
    expect(pulse(2, 1)).toBe(0)
  })

  it('should peak a fifth of the way in', () => {
    expect(pulse(0.2, 1)).toBe(1)
    expect(pulse(0.1, 1)).toBeCloseTo(0.5)
  })
})
