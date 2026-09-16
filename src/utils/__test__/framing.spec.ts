import { describe, expect, it } from 'vitest'
import { STAGE_BLEED, bleedRadius, fitBoxDistance, fitDistance } from '../framing'

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

describe('fitBoxDistance', () => {
  it('should fit a unit square edge to edge at the sphere-free distance', () => {
    // A 90° fov sees ±d at distance d, so a half-width of 1 needs exactly 1.
    expect(fitBoxDistance(1, 1, RIGHT_ANGLE_FOV, 1, EXACT_FIT)).toBeCloseTo(1, 5)
  })

  it('should let the wider axis decide for a flat plate in a square view', () => {
    const wide = fitBoxDistance(3, 0.5, RIGHT_ANGLE_FOV, 1, EXACT_FIT)

    expect(wide).toBeCloseTo(3, 5)
  })

  it('should need less distance for the same plate in a wide view', () => {
    const square = fitBoxDistance(3, 0.5, RIGHT_ANGLE_FOV, 1, EXACT_FIT)
    const wide = fitBoxDistance(3, 0.5, RIGHT_ANGLE_FOV, 3, EXACT_FIT)

    expect(wide).toBeLessThan(square)
  })

  it('should sit closer than the sphere fit for a flat subject', () => {
    const sphere = fitDistance(Math.hypot(3, 0.5), RIGHT_ANGLE_FOV, 2, EXACT_FIT)
    const box = fitBoxDistance(3, 0.5, RIGHT_ANGLE_FOV, 2, EXACT_FIT)

    expect(box).toBeLessThan(sphere)
  })
})

describe('bleedRadius', () => {
  it('should grow the radius by the bleed on both sides', () => {
    expect(bleedRadius(1, 0.2)).toBeCloseTo(1.4)
  })

  it('should default to the stage bleed', () => {
    expect(bleedRadius(1)).toBeCloseTo(1 + 2 * STAGE_BLEED)
  })

  it('should keep a 0.72 fit share of the hero sphere inside the bled canvas', () => {
    // The whole swept sphere has to fit once the phone fit share is bled out.
    expect(bleedRadius(0.72)).toBeGreaterThanOrEqual(1)
  })
})
