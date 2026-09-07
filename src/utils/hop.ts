/**
 * The little jump the mascots make every few seconds.
 *
 * Kept as pure functions so the timing can be tested without a scene and
 * without stubbing `Math.random` — the delay arrives as a callback instead.
 */

export interface HopStateProps {
  /** Seconds on the scene clock at which the next jump starts. */
  nextAt: number
  /** When the running jump started, or null while idle. */
  startedAt: number | null
}

export interface HopResultProps {
  state: HopStateProps
  /** Height above the resting position, 0 while idle. */
  offset: number
}

/** How long one jump takes, in seconds. */
export const HOP_DURATION = 0.45

/**
 * The arc. A sine half-wave rather than a triangle: it is slowest at the top,
 * which is what a jump actually does, and it leaves and meets the ground at a
 * speed instead of a corner.
 */
export const hopArc = (phase: number): number => Math.sin(Math.PI * phase)

export const createHopState = (firstDelay: number): HopStateProps => ({
  nextAt: firstDelay,
  startedAt: null
})

/**
 * Advances one mascot by a frame. `nextDelay` is asked for the gap before the
 * following jump, and only when one has just finished.
 */
export const advanceHop = (
  state: HopStateProps,
  elapsed: number,
  nextDelay: () => number
): HopResultProps => {
  if (state.startedAt === null) {
    if (elapsed < state.nextAt) return { state, offset: 0 }
    return { state: { ...state, startedAt: elapsed }, offset: 0 }
  }

  const phase = (elapsed - state.startedAt) / HOP_DURATION
  if (phase >= 1) {
    return { state: { nextAt: elapsed + nextDelay(), startedAt: null }, offset: 0 }
  }

  return { state, offset: hopArc(phase) }
}
