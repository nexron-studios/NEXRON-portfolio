import { describe, expect, it, vi } from 'vitest'
import { advanceHop, createHopState, hopArc, HOP_DURATION } from '../hop'

describe('hopArc', () => {
  it('should start and end on the ground', () => {
    expect(hopArc(0)).toBeCloseTo(0, 6)
    expect(hopArc(1)).toBeCloseTo(0, 6)
  })

  it('should peak halfway through', () => {
    expect(hopArc(0.5)).toBeCloseTo(1, 6)
  })

  it('should be slowest at the top', () => {
    const nearPeak = hopArc(0.55) - hopArc(0.5)
    const nearGround = hopArc(0.05) - hopArc(0)

    expect(Math.abs(nearPeak)).toBeLessThan(Math.abs(nearGround))
  })
})

describe('advanceHop', () => {
  const nextDelay = () => 3

  it('should stay on the ground before the scheduled time', () => {
    const result = advanceHop(createHopState(2), 1, nextDelay)

    expect(result.offset).toBe(0)
    expect(result.state.startedAt).toBeNull()
  })

  it('should start a jump once the scheduled time is reached', () => {
    const result = advanceHop(createHopState(2), 2, nextDelay)

    expect(result.state.startedAt).toBe(2)
  })

  it('should rise while the jump is running', () => {
    const started = { nextAt: 2, startedAt: 2 }
    const result = advanceHop(started, 2 + HOP_DURATION / 2, nextDelay)

    expect(result.offset).toBeCloseTo(1, 6)
  })

  it('should land and schedule the next jump when the arc completes', () => {
    const started = { nextAt: 2, startedAt: 2 }
    const landed = advanceHop(started, 2 + HOP_DURATION, nextDelay)

    expect(landed.offset).toBe(0)
    expect(landed.state.startedAt).toBeNull()
    expect(landed.state.nextAt).toBe(2 + HOP_DURATION + 3)
  })

  it('should only ask for a delay when a jump actually finishes', () => {
    const delay = vi.fn(() => 3)

    advanceHop(createHopState(2), 1, delay)
    advanceHop(createHopState(2), 2, delay)
    advanceHop({ nextAt: 2, startedAt: 2 }, 2.1, delay)

    expect(delay).not.toHaveBeenCalled()

    advanceHop({ nextAt: 2, startedAt: 2 }, 2 + HOP_DURATION, delay)

    expect(delay).toHaveBeenCalledTimes(1)
  })

  it('should never leave the ground when the scene clock jumps a long way', () => {
    const started = { nextAt: 2, startedAt: 2 }
    const result = advanceHop(started, 2 + HOP_DURATION * 40, nextDelay)

    expect(result.offset).toBe(0)
    expect(result.state.startedAt).toBeNull()
  })
})
