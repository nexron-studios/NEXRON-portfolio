import { describe, expect, it } from 'vitest'
import type { BodyProps } from '../ballPit'
import {
  MAX_DELTA,
  applyRadialImpulse,
  areOverlapping,
  clampDelta,
  constrainToChamber,
  distanceSquared,
  findCandidatePairs,
  layoutChambers,
  resolvePair,
  separatePair,
  stepBodies
} from '../ballPit'

const makeBody = (overrides: Partial<BodyProps> = {}): BodyProps => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  radius: 0.5,
  chamber: 0,
  ...overrides
})

describe('clampDelta', () => {
  it('should pass a normal frame through untouched', () => {
    expect(clampDelta(1 / 60)).toBeCloseTo(1 / 60)
  })

  it('should cap a long frame so a body cannot tunnel through a wall', () => {
    expect(clampDelta(2)).toBe(MAX_DELTA)
  })

  it('should treat a negative delta as zero', () => {
    expect(clampDelta(-1)).toBe(0)
  })
})

describe('distanceSquared', () => {
  it('should return the squared distance between two bodies', () => {
    expect(distanceSquared(makeBody(), makeBody({ x: 3, y: 4 }))).toBe(25)
  })

  it('should return zero for two bodies in the same place', () => {
    expect(distanceSquared(makeBody(), makeBody())).toBe(0)
  })
})

describe('areOverlapping', () => {
  it('should report an overlap when the bodies interpenetrate', () => {
    expect(areOverlapping(makeBody(), makeBody({ x: 0.5 }))).toBe(true)
  })

  it('should report no overlap when the bodies merely touch', () => {
    expect(areOverlapping(makeBody(), makeBody({ x: 1 }))).toBe(false)
  })

  it('should report no overlap for bodies well apart', () => {
    expect(areOverlapping(makeBody(), makeBody({ x: 5 }))).toBe(false)
  })
})

describe('resolvePair', () => {
  it('should not touch bodies in different chambers', () => {
    const a = makeBody()
    const b = makeBody({ x: 0.2, chamber: 1 })

    expect(resolvePair(a, b, 0.5)).toBe(false)
    expect(b.x).toBe(0.2)
  })

  it('should push overlapping bodies apart to exactly touching', () => {
    const a = makeBody()
    const b = makeBody({ x: 0.4 })

    resolvePair(a, b, 0.5)

    expect(Math.abs(b.x - a.x)).toBeCloseTo(1)
  })

  it('should separate two bodies stacked at the same point', () => {
    const a = makeBody()
    const b = makeBody()

    expect(resolvePair(a, b, 0.5)).toBe(true)
    expect(a.x).not.toBe(b.x)
  })

  it('should reverse the approach so the bodies move apart afterwards', () => {
    const a = makeBody({ vx: 2 })
    const b = makeBody({ x: 0.4, vx: -2 })

    resolvePair(a, b, 1)

    expect(a.vx).toBeLessThan(0)
    expect(b.vx).toBeGreaterThan(0)
  })

  it('should leave velocities alone when the bodies are already separating', () => {
    const a = makeBody({ vx: -1 })
    const b = makeBody({ x: 0.4, vx: 1 })

    resolvePair(a, b, 0.5)

    expect(a.vx).toBe(-1)
    expect(b.vx).toBe(1)
  })

  it('should do nothing to bodies that are not overlapping', () => {
    const a = makeBody()
    const b = makeBody({ x: 3 })

    expect(resolvePair(a, b, 0.5)).toBe(false)
    expect(b.x).toBe(3)
  })
})

describe('separatePair', () => {
  it('should push overlapping bodies apart to exactly touching', () => {
    const a = makeBody()
    const b = makeBody({ x: 0.4 })

    separatePair(a, b)

    expect(Math.abs(b.x - a.x)).toBeCloseTo(1)
  })

  it('should leave velocities untouched so repeated passes add no energy', () => {
    const a = makeBody({ vx: 2, vy: -1 })
    const b = makeBody({ x: 0.4, vx: -2, vy: 3 })

    separatePair(a, b)

    expect(a.vx).toBe(2)
    expect(a.vy).toBe(-1)
    expect(b.vx).toBe(-2)
    expect(b.vy).toBe(3)
  })

  it('should not touch bodies in different chambers', () => {
    const a = makeBody()
    const b = makeBody({ x: 0.2, chamber: 1 })

    expect(separatePair(a, b)).toBe(false)
    expect(b.x).toBe(0.2)
  })

  it('should do nothing to bodies that are not overlapping', () => {
    const a = makeBody()
    const b = makeBody({ x: 3 })

    expect(separatePair(a, b)).toBe(false)
    expect(b.x).toBe(3)
  })

  it('should separate two bodies stacked at the same point', () => {
    const a = makeBody()
    const b = makeBody()

    expect(separatePair(a, b)).toBe(true)
    expect(a.x).not.toBe(b.x)
  })
})

describe('constrainToChamber', () => {
  const bounds = { left: -2, right: 2, floor: -3 }

  it('should hold a body inside the left wall', () => {
    const body = makeBody({ x: -5, vx: -4 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.x).toBe(-1.5)
    expect(body.vx).toBeGreaterThan(0)
  })

  it('should hold a body inside the right wall', () => {
    const body = makeBody({ x: 5, vx: 4 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.x).toBe(1.5)
    expect(body.vx).toBeLessThan(0)
  })

  it('should bounce a body off the floor', () => {
    const body = makeBody({ y: -8, vy: -6 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.y).toBe(-2.5)
    expect(body.vy).toBe(3)
  })

  it('should bleed horizontal speed on floor contact so a ball settles', () => {
    const body = makeBody({ y: -8, vx: 4, vy: -1 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.vx).toBeLessThan(4)
  })

  it('should park a body in the middle when the chamber is narrower than it', () => {
    const body = makeBody({ radius: 5, x: 40 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.x).toBe(0)
    expect(body.vx).toBe(0)
  })

  it('should leave a body inside the chamber untouched', () => {
    const body = makeBody({ x: 0.5, y: 0, vx: 1 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.x).toBe(0.5)
    expect(body.vx).toBe(1)
  })
})

describe('applyRadialImpulse', () => {
  it('should push a body directly away from the point', () => {
    const body = makeBody({ x: 1 })

    applyRadialImpulse([body], 0, 0, 3, 6)

    expect(body.vx).toBeGreaterThan(0)
  })

  it('should not touch a body outside the radius', () => {
    const body = makeBody({ x: 10 })

    applyRadialImpulse([body], 0, 0, 3, 6)

    expect(body.vx).toBe(0)
  })

  it('should push a near body harder than a far one', () => {
    const near = makeBody({ x: 0.5 })
    const far = makeBody({ x: 2.5 })

    applyRadialImpulse([near, far], 0, 0, 3, 6)

    expect(near.vx).toBeGreaterThan(far.vx)
  })

  it('should skip a body exactly on the point rather than dividing by zero', () => {
    const body = makeBody()

    applyRadialImpulse([body], 0, 0, 3, 6)

    expect(body.vx).toBe(0)
    expect(body.vy).toBe(0)
  })
})

describe('findCandidatePairs', () => {
  it('should return nothing for fewer than two bodies', () => {
    expect(findCandidatePairs([makeBody()])).toEqual([])
  })

  it('should find two bodies sharing a cell', () => {
    const pairs = findCandidatePairs([makeBody(), makeBody({ x: 0.3 })])

    expect(pairs).toHaveLength(1)
  })

  it('should report each pair only once', () => {
    const bodies = [makeBody(), makeBody({ x: 0.2 }), makeBody({ x: 0.4 })]
    const pairs = findCandidatePairs(bodies)

    expect(pairs).toHaveLength(3)
  })

  it('should not pair bodies several cells apart', () => {
    expect(findCandidatePairs([makeBody(), makeBody({ x: 50 })])).toEqual([])
  })
})

describe('layoutChambers', () => {
  it('should build one bounds object per chamber', () => {
    expect(layoutChambers(10, -3, 4, 0)).toHaveLength(4)
  })

  it('should return nothing for a count of zero', () => {
    expect(layoutChambers(10, -3, 0, 0)).toEqual([])
  })

  it('should centre the chambers on zero', () => {
    const chambers = layoutChambers(10, -3, 2, 0)

    expect(chambers[0]?.left).toBe(-5)
    expect(chambers[1]?.right).toBe(5)
  })

  it('should leave a wall-sized gap between neighbouring chambers', () => {
    const chambers = layoutChambers(10, -3, 2, 1)

    expect((chambers[1]?.left ?? 0) - (chambers[0]?.right ?? 0)).toBeCloseTo(1)
  })

  it('should give every chamber the same floor', () => {
    const chambers = layoutChambers(10, -3, 4, 0.2)

    expect(chambers.every((chamber) => chamber.floor === -3)).toBe(true)
  })
})

describe('stepBodies', () => {
  const chambers = layoutChambers(10, -3, 1, 0)
  const options = { gravity: -10, restitution: 0.5, damping: 0.5, delta: 1 / 60 }

  it('should pull a body downwards under gravity', () => {
    const body = makeBody({ y: 5 })

    stepBodies([body], chambers, options)

    expect(body.vy).toBeLessThan(0)
    expect(body.y).toBeLessThan(5)
  })

  it('should do nothing for a zero delta', () => {
    const body = makeBody({ y: 5 })

    stepBodies([body], chambers, { ...options, delta: 0 })

    expect(body.y).toBe(5)
    expect(body.vy).toBe(0)
  })

  it('should keep a body above the floor no matter how long it falls', () => {
    const body = makeBody({ y: 5 })

    for (let frame = 0; frame < 600; frame += 1) {
      stepBodies([body], chambers, options)
    }

    expect(body.y).toBeGreaterThanOrEqual(-3)
  })

  it('should keep a body inside its chamber walls', () => {
    const body = makeBody({ y: 2, vx: 90 })

    for (let frame = 0; frame < 300; frame += 1) {
      stepBodies([body], chambers, options)
    }

    expect(body.x).toBeLessThanOrEqual(5)
    expect(body.x).toBeGreaterThanOrEqual(-5)
  })

  it('should never let two bodies in one chamber end up overlapping deeply', () => {
    const bodies = [makeBody({ y: 4 }), makeBody({ x: 0.1, y: 4.4 })]

    for (let frame = 0; frame < 300; frame += 1) {
      stepBodies(bodies, chambers, options)
    }

    const [first, second] = bodies
    if (!first || !second) throw new Error('bodies were dropped')

    expect(Math.sqrt(distanceSquared(first, second))).toBeGreaterThan(0.9)
  })

  it('should let a full chamber come to rest instead of gaining energy', () => {
    const bodies = Array.from({ length: 8 }, (_, index) =>
      makeBody({ x: -2 + index * 0.55, y: 2 + index * 0.4 })
    )

    for (let frame = 0; frame < 900; frame += 1) {
      stepBodies(bodies, chambers, options)
    }

    const fastest = Math.max(...bodies.map((b) => Math.hypot(b.vx, b.vy)))

    expect(fastest).toBeLessThan(0.5)
  })

  it('should keep a settled pile from sinking into itself', () => {
    const bodies = Array.from({ length: 6 }, (_, index) =>
      makeBody({ x: -1.5 + index * 0.6, y: 3 })
    )

    for (let frame = 0; frame < 900; frame += 1) {
      stepBodies(bodies, chambers, options)
    }

    for (let i = 0; i < bodies.length; i += 1) {
      for (let j = i + 1; j < bodies.length; j += 1) {
        const a = bodies[i]
        const b = bodies[j]
        if (!a || !b) continue
        // Allow a sliver of interpenetration; a visible sink is what fails.
        expect(Math.sqrt(distanceSquared(a, b))).toBeGreaterThan(0.85)
      }
    }
  })
})
