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
  isSettled,
  layoutChambers,
  pushShare,
  resolvePair,
  separatePair,
  isAsleep,
  contactOf,
  reachAlong,
  SLEEP_AFTER_FRAMES,
  wake,
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

describe('pushShare', () => {
  it('should split the push evenly between bodies of equal size', () => {
    expect(pushShare(makeBody(), makeBody())).toBe(0.5)
  })

  it('should give the smaller body the larger share of the push', () => {
    const small = makeBody({ radius: 0.25 })
    const large = makeBody({ radius: 0.75 })

    expect(pushShare(small, large)).toBeGreaterThan(0.5)
    expect(pushShare(large, small)).toBeLessThan(0.5)
  })

  it('should fall back to an even split for two zero-radius bodies', () => {
    expect(pushShare(makeBody({ radius: 0 }), makeBody({ radius: 0 }))).toBe(0.5)
  })
})

describe('isSettled', () => {
  it('should report a slow body as settled', () => {
    expect(isSettled(makeBody({ vx: 0.1, vy: -0.1 }), 0.4)).toBe(true)
  })

  it('should report a body as moving once its combined speed passes the threshold', () => {
    expect(isSettled(makeBody({ vx: 0.3, vy: -0.3 }), 0.4)).toBe(false)
  })
})

describe('separatePair with unequal radii', () => {
  it('should move the larger body less than the smaller one', () => {
    const small = makeBody({ radius: 0.25, x: 0 })
    const large = makeBody({ radius: 0.75, x: 0.6 })

    separatePair(small, large)

    expect(Math.abs(large.x - 0.6)).toBeLessThan(Math.abs(small.x))
  })

  it('should still separate the pair to exactly touching', () => {
    const small = makeBody({ radius: 0.25 })
    const large = makeBody({ radius: 0.75, x: 0.6 })

    separatePair(small, large)

    expect(Math.abs(large.x - small.x)).toBeCloseTo(1)
  })
})

describe('reachAlong', () => {
  const block = (angle: number): BodyProps => makeBody({ radius: 0.5, halfExtent: 0.43, angle })

  it('should reach exactly its half side along its own axis when upright', () => {
    expect(reachAlong(block(0), 1, 0)).toBeCloseTo(0.43)
    expect(reachAlong(block(0), 0, 1)).toBeCloseTo(0.43)
  })

  it('should reach its half diagonal along an axis when turned 45 degrees', () => {
    expect(reachAlong(block(Math.PI / 4), 1, 0)).toBeCloseTo(0.43 * Math.SQRT2)
  })

  it('should reach its radius for a body that is not a square', () => {
    expect(reachAlong(makeBody(), 1, 0)).toBe(0.5)
  })
})

describe('separatePair between squares', () => {
  const makeBlock = (overrides: Partial<BodyProps> = {}): BodyProps =>
    makeBody({ radius: 0.5, halfExtent: 0.43, ...overrides })

  it('should separate two upright squares to exactly face to face', () => {
    const a = makeBlock()
    const b = makeBlock({ x: 0.5 })

    expect(separatePair(a, b)).toBe(true)
    expect(b.x - a.x).toBeCloseTo(0.86)
  })

  it('should leave squares alone at a distance their circles would still fight over', () => {
    // 0.9 apart: clear of the squares' 0.86 reach, inside the circles' 1.0.
    const a = makeBlock()
    const b = makeBlock({ x: 0.9 })

    expect(separatePair(a, b)).toBe(false)
    expect(areOverlapping(a, b)).toBe(true)
  })

  it('should separate a square on its corner from an upright one at corner contact', () => {
    // A 45° square reaches √2 × its half side along x; the upright one 1 ×.
    const a = makeBlock({ angle: Math.PI / 4 })
    const b = makeBlock({ x: 0.8 })

    expect(separatePair(a, b)).toBe(true)
    expect(b.x - a.x).toBeCloseTo(0.43 * Math.SQRT2 + 0.43)
  })

  it('should push along the axis of least penetration', () => {
    // Deeply overlapped on x, barely on y — the way out is vertical.
    const a = makeBlock()
    const b = makeBlock({ x: 0.05, y: 0.8 })

    separatePair(a, b)

    expect(b.y - a.y).toBeCloseTo(0.86)
    expect(b.x - a.x).toBeCloseTo(0.05)
  })

  it('should report the contact normal along that same axis', () => {
    const contact = contactOf(makeBlock(), makeBlock({ x: 0.05, y: 0.8 }))

    expect(contact?.nx).toBeCloseTo(0)
    expect(contact?.ny).toBeCloseTo(1)
  })

  it('should leave velocities untouched so repeated passes add no energy', () => {
    const a = makeBlock({ vx: 2, vy: -1 })
    const b = makeBlock({ x: 0.5, vx: -2, vy: 3 })

    separatePair(a, b)

    expect(a.vx).toBe(2)
    expect(a.vy).toBe(-1)
    expect(b.vx).toBe(-2)
    expect(b.vy).toBe(3)
  })

  it('should separate two squares stacked at the same point', () => {
    const a = makeBlock()
    const b = makeBlock()

    expect(separatePair(a, b)).toBe(true)
    // Which axis breaks the tie does not matter; that they no longer share a
    // centre does.
    expect(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y))).toBeCloseTo(0.86)
  })

  it('should fall back to circles when only one body is a square', () => {
    const a = makeBlock()
    const b = makeBody({ x: 0.5 })

    expect(separatePair(a, b)).toBe(true)
    expect(b.x - a.x).toBeCloseTo(1)
  })
})

describe('sleeping', () => {
  const asleep = (overrides: Partial<BodyProps> = {}): BodyProps =>
    makeBody({ sleepFrames: SLEEP_AFTER_FRAMES, ...overrides })

  it('should report a body asleep once it has enough quiet frames', () => {
    expect(isAsleep(asleep())).toBe(true)
    expect(isAsleep(makeBody({ sleepFrames: SLEEP_AFTER_FRAMES - 1 }))).toBe(false)
  })

  it('should wake a body by resetting its quiet frames', () => {
    const body = asleep()

    wake(body)

    expect(isAsleep(body)).toBe(false)
  })

  it('should not move two sleeping bodies even when they overlap', () => {
    const a = asleep()
    const b = asleep({ x: 0.4 })

    expect(separatePair(a, b)).toBe(false)
    expect(a.x).toBe(0)
    expect(b.x).toBe(0.4)
  })

  it('should move only the awake body out of a sleeping one', () => {
    const sleeper = asleep()
    const mover = makeBody({ x: 0.4 })

    separatePair(sleeper, mover)

    expect(sleeper.x).toBe(0)
    expect(mover.x).toBeCloseTo(1)
  })

  it('should keep a sleeping body asleep when a slow body settles onto it', () => {
    const sleeper = asleep()
    const settling = makeBody({ x: 0.4, vx: -0.1 })

    resolvePair(sleeper, settling, 0.5, 0.4)

    expect(isAsleep(sleeper)).toBe(true)
  })

  it('should wake a sleeping body when something hits it hard', () => {
    const sleeper = asleep()
    const projectile = makeBody({ x: 0.4, vx: -3 })

    resolvePair(sleeper, projectile, 0.5, 0.4)

    expect(isAsleep(sleeper)).toBe(false)
  })

  it('should wake a sleeping body that a radial impulse reaches', () => {
    const body = asleep({ x: 1 })

    applyRadialImpulse([body], 0, 0, 3, 6)

    expect(isAsleep(body)).toBe(false)
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

  it('should seat an upright square body on the floor by its half side', () => {
    const body = makeBody({ y: -8, halfExtent: 0.43 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.y).toBeCloseTo(-2.57)
  })

  it('should seat a square on its corner by its half diagonal', () => {
    const body = makeBody({ y: -8, halfExtent: 0.43, angle: Math.PI / 4 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.y).toBeCloseTo(-3 + 0.43 * Math.SQRT2)
  })

  it('should hold an upright square body off the wall by its half side', () => {
    const body = makeBody({ x: -5, halfExtent: 0.43 })

    constrainToChamber(body, bounds, 0.5)

    expect(body.x).toBeCloseTo(-1.57)
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

  it('should leave no pair overlapping after a body is pushed off a wall', () => {
    // Both start jammed into the left wall, so the clamp inside the loop has to
    // shove one of them into the other on the final pass. The separation that
    // runs after the loop is what has to clean that up.
    const narrow = layoutChambers(2, -3, 1, 0)
    const bodies = [makeBody({ x: -1.4, y: -2.5 }), makeBody({ x: -1.3, y: -2.5 })]

    stepBodies(bodies, narrow, options)

    const [first, second] = bodies
    if (!first || !second) throw new Error('bodies were dropped')

    expect(areOverlapping(first, second)).toBe(false)
  })

  it('should settle square blocks face to face rather than at their circle reach', () => {
    const blocks = Array.from({ length: 4 }, (_, index) =>
      makeBody({ x: -1.2 + index * 0.9, y: 3, halfExtent: 0.43 })
    )

    for (let frame = 0; frame < 900; frame += 1) {
      stepBodies(blocks, chambers, { ...options, settleSpeed: 0.4 })
    }

    for (let i = 0; i < blocks.length; i += 1) {
      for (let j = i + 1; j < blocks.length; j += 1) {
        const a = blocks[i]
        const b = blocks[j]
        if (!a || !b) continue

        const gapX = 0.86 - Math.abs(b.x - a.x)
        const gapY = 0.86 - Math.abs(b.y - a.y)

        // Separated on at least one axis: that is what "not interpenetrating"
        // means for two axis-aligned squares.
        expect(Math.min(gapX, gapY)).toBeLessThan(0.01)
      }
    }
  })

  it('should let a settled pile fall asleep and then hold perfectly still', () => {
    const blocks = Array.from({ length: 5 }, (_, index) =>
      makeBody({ x: -1.2 + index * 0.9, y: 2 + index * 0.3, halfExtent: 0.43, sleepFrames: 0 })
    )

    for (let frame = 0; frame < 600; frame += 1) {
      stepBodies(blocks, chambers, { ...options, settleSpeed: 0.4 })
    }

    expect(blocks.every(isAsleep)).toBe(true)

    const before = blocks.map((block) => [block.x, block.y, block.angle ?? 0])

    for (let frame = 0; frame < 300; frame += 1) {
      stepBodies(blocks, chambers, { ...options, settleSpeed: 0.4 })
    }

    blocks.forEach((block, index) => {
      expect(block.x).toBe(before[index]?.[0])
      expect(block.y).toBe(before[index]?.[1])
    })
  })

  it('should wake a sleeping pile when a block is dropped onto it', () => {
    const sleeper = makeBody({ y: -2.57, halfExtent: 0.43, sleepFrames: SLEEP_AFTER_FRAMES })
    const dropped = makeBody({ y: 3, halfExtent: 0.43, sleepFrames: 0 })

    for (let frame = 0; frame < 60; frame += 1) {
      stepBodies([sleeper, dropped], chambers, { ...options, settleSpeed: 0.4 })
    }

    // The drop lands fast enough to count as a hit, and the pair ends up stacked.
    expect(dropped.y).toBeGreaterThan(sleeper.y)
    expect(dropped.y - sleeper.y).toBeGreaterThanOrEqual(0.86 - 0.01)
  })

  it('should keep a mixed pile of squares and circles apart', () => {
    const bodies = [
      makeBody({ x: -1, y: 3, halfExtent: 0.43 }),
      makeBody({ x: -0.4, y: 3.6 }),
      makeBody({ x: 0.3, y: 4.2, halfExtent: 0.43 })
    ]

    for (let frame = 0; frame < 900; frame += 1) {
      stepBodies(bodies, chambers, { ...options, settleSpeed: 0.4 })
    }

    const fastest = Math.max(...bodies.map((body) => Math.hypot(body.vx, body.vy)))

    expect(fastest).toBeLessThan(0.5)
  })
})
