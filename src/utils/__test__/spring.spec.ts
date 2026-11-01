import { describe, expect, it } from 'vitest'
import { clampTo, relaxSpring, type SpringConfigProps } from '../spring'

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
