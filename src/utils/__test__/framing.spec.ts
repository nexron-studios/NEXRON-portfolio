import { describe, expect, it } from 'vitest'
import { fitDistance } from '../framing'

/** A 90° vertical fov makes the maths checkable by hand: sin(45°) = √½. */
const RIGHT_ANGLE_FOV = 90
const EXACT_FIT = 1

describe('fitDistance', () => {
  it('should fit a sphere by its vertical extent on a square stage', () => {
    expect(fitDistance(1, RIGHT_ANGLE_FOV, 1, EXACT_FIT)).toBeCloseTo(Math.SQRT2, 5)
  })

  it('should let the height decide on a wide stage', () => {
    const wide = fitDistance(1, RIGHT_ANGLE_FOV, 2, EXACT_FIT)

    expect(wide).toBeCloseTo(Math.SQRT2, 5)
  })

  it('should back off further on a narrow stage, where the width crops first', () => {
    const square = fitDistance(1, RIGHT_ANGLE_FOV, 1, EXACT_FIT)
    const narrow = fitDistance(1, RIGHT_ANGLE_FOV, 0.5, EXACT_FIT)

    expect(narrow).toBeGreaterThan(square)
  })

  it('should scale linearly with the radius', () => {
    const single = fitDistance(1, 40, 0.75, EXACT_FIT)
    const triple = fitDistance(3, 40, 0.75, EXACT_FIT)

    expect(triple).toBeCloseTo(single * 3, 5)
  })

  it('should scale linearly with the margin', () => {
    const tight = fitDistance(2, 40, 0.75, EXACT_FIT)
    const roomy = fitDistance(2, 40, 0.75, 1.5)

    expect(roomy).toBeCloseTo(tight * 1.5, 5)
  })

  it('should survive a stage that has collapsed to zero width', () => {
    expect(Number.isFinite(fitDistance(1, 40, 0))).toBe(true)
  })
})
