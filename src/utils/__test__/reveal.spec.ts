import { describe, expect, it } from 'vitest'
import { revealProgress } from '../reveal'

const VIEWPORT = 1000
const SLOT = 200

describe('revealProgress', () => {
  it('should stay at zero while the slot is still below the fold', () => {
    expect(revealProgress(VIEWPORT + 50, SLOT, VIEWPORT)).toBe(0)
  })

  it('should still be zero the moment the slot first touches the bottom edge', () => {
    expect(revealProgress(VIEWPORT - SLOT, SLOT, VIEWPORT)).toBe(0)
  })

  it('should reach one once the slot has climbed to the lead line', () => {
    expect(revealProgress(VIEWPORT * 0.55 - SLOT, SLOT, VIEWPORT)).toBeCloseTo(1, 6)
  })

  it('should stay at one above the lead line rather than overshooting', () => {
    expect(revealProgress(-500, SLOT, VIEWPORT)).toBe(1)
  })

  it('should rise monotonically as the slot travels up', () => {
    const samples = [900, 800, 700, 600, 500, 400, 300].map((top) =>
      revealProgress(top, SLOT, VIEWPORT)
    )

    samples.forEach((value, index) => {
      if (index === 0) return
      expect(value).toBeGreaterThanOrEqual(samples[index - 1])
    })
  })

  it('should sit halfway at the midpoint of the travel', () => {
    const start = VIEWPORT - SLOT
    const end = VIEWPORT * 0.55 - SLOT

    expect(revealProgress((start + end) / 2, SLOT, VIEWPORT)).toBeCloseTo(0.5, 6)
  })

  it('should honour a custom lead line', () => {
    const early = revealProgress(500, SLOT, VIEWPORT, 0.9)
    const late = revealProgress(500, SLOT, VIEWPORT, 0.2)

    expect(early).toBe(1)
    expect(late).toBeLessThan(1)
  })

  it('should not divide by zero when the slot is taller than the travel allows', () => {
    const result = revealProgress(0, VIEWPORT, VIEWPORT)

    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })
})
