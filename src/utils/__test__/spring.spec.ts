import { describe, expect, it } from 'vitest'
import { clampTo, relaxSpring, softLimit, type SpringConfigProps } from '../spring'

/** The LED sign's tuning, which the hero character reuses. */
const CONFIG: SpringConfigProps = { stiffness: 3, damping: 0.02, restSpeed: 0.002 }

const STEP = 1 / 60

describe('relaxSpring', () => {
  it('should pull a positive offset back towards zero', () => {
    const [offset] = relaxSpring(1, 0, STEP, CONFIG)

    expect(offset).toBeLessThan(1)
    expect(offset).toBeGreaterThan(0)
  })

  it('should pull a negative offset back towards zero', () => {
    const [offset] = relaxSpring(-1, 0, STEP, CONFIG)

    expect(offset).toBeGreaterThan(-1)
    expect(offset).toBeLessThan(0)
  })

  it('should park exactly at rest once both offset and speed are negligible', () => {
    expect(relaxSpring(0.0001, 0.0001, STEP, CONFIG)).toEqual([0, 0])
  })

  it('should stay at rest once parked', () => {
    expect(relaxSpring(0, 0, STEP, CONFIG)).toEqual([0, 0])
  })

  it('should settle without overshooting from a released throw', () => {
    let offset = 0.5
    let velocity = 4

    for (let frame = 0; frame < 60 * 10; frame++) {
      ;[offset, velocity] = relaxSpring(offset, velocity, STEP, CONFIG)
    }

    expect(offset).toBe(0)
    expect(velocity).toBe(0)
  })

  it('should never let the offset cross zero and run away', () => {
    let offset = 1
    let velocity = 0
    let mostNegative = 0

    for (let frame = 0; frame < 60 * 5; frame++) {
      ;[offset, velocity] = relaxSpring(offset, velocity, STEP, CONFIG)
      mostNegative = Math.min(mostNegative, offset)
    }

    expect(mostNegative).toBeGreaterThan(-1)
  })
})

describe('clampTo', () => {
  it('should leave a value inside the limit alone', () => {
    expect(clampTo(0.4, 1)).toBe(0.4)
  })

  it('should clamp both directions symmetrically', () => {
    expect(clampTo(5, 1.1)).toBe(1.1)
    expect(clampTo(-5, 1.1)).toBe(-1.1)
  })
})

describe('softLimit', () => {
  it('should track one-to-one near the middle', () => {
    expect(softLimit(0.05, 1)).toBeCloseTo(0.05, 3)
  })

  it('should never cross the limit, however far the drag goes', () => {
    expect(softLimit(100, 1)).toBeLessThanOrEqual(1)
    expect(softLimit(1e6, 1)).toBeLessThanOrEqual(1)
    expect(softLimit(-1e6, 1)).toBeGreaterThanOrEqual(-1)
  })

  it('should stay short of the limit across any distance a gesture covers', () => {
    expect(softLimit(3, 1)).toBeLessThan(1)
    expect(Math.abs(softLimit(-3, 0.5))).toBeLessThan(0.5)
  })

  it('should be symmetric about zero', () => {
    expect(softLimit(-0.7, 1)).toBeCloseTo(-softLimit(0.7, 1), 9)
  })

  it('should give way progressively — equal input steps move it less near the edge', () => {
    const nearMiddle = softLimit(0.2, 1) - softLimit(0.1, 1)
    const nearEdge = softLimit(2.1, 1) - softLimit(2, 1)

    expect(nearEdge).toBeLessThan(nearMiddle)
  })

  it('should rise monotonically so a drag never reverses direction', () => {
    let previous = softLimit(-3, 1)

    for (let value = -2.9; value <= 3; value += 0.1) {
      const next = softLimit(value, 1)
      expect(next).toBeGreaterThan(previous)
      previous = next
    }
  })

  it('should collapse to zero rather than divide by a limit of zero', () => {
    expect(softLimit(5, 0)).toBe(0)
  })
})
