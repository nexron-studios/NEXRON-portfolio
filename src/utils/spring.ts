/**
 * A damped spring, integrated one frame at a time.
 *
 * Both draggable scenes pull the *offset from their idle path* back to zero
 * rather than the angle itself. That is what lets an object carry on swaying
 * from wherever it was let go and end up back on the path it would have taken
 * anyway, instead of staying permanently out of phase.
 */

export interface SpringConfigProps {
  /** How hard the offset is pulled back towards zero. */
  stiffness: number
  /** Share of the offset's velocity kept per second. */
  damping: number
  /** Below this the spring is done; parking it exactly avoids an endless crawl. */
  restSpeed: number
}

/**
 * A long frame — a tab coming back, a GC pause — would otherwise integrate the
 * spring in one huge step and fling the object across its whole range.
 */
export const MAX_SPRING_DELTA = 1 / 30

/**
 * One step towards zero, as `[offset, velocity]`.
 *
 * Semi-implicit Euler: the velocity is integrated before the position, which is
 * what keeps a spring stable at a frame rate it was not tuned for.
 */
export const relaxSpring = (
  offset: number,
  velocity: number,
  step: number,
  config: SpringConfigProps
): [number, number] => {
  const nextVelocity =
    (velocity - config.stiffness * offset * step) * Math.pow(config.damping, step)
  const nextOffset = offset + nextVelocity * step

  if (Math.abs(nextVelocity) < config.restSpeed && Math.abs(nextOffset) < config.restSpeed) {
    return [0, 0]
  }

  return [nextOffset, nextVelocity]
}

export const clampTo = (value: number, limit: number): number =>
  Math.min(limit, Math.max(-limit, value))

/**
 * A limit the value eases into instead of hitting.
 *
 * `clampTo` stops dead: the object tracks the pointer one-to-one and then simply
 * refuses to move, which reads as the drag having broken. This gives way
 * gradually — one-to-one near the middle, progressively more resistance towards
 * the edge. The same rubber-banding a scroll view uses at the end of its
 * content, and the reason a drag can no longer arrive at the wall with speed
 * on it.
 *
 * The limit is approached asymptotically and never crossed. It can be *reached*
 * exactly: past roughly twenty times the limit `Math.tanh` saturates at 1, which
 * is a distance no gesture covers and still on the right side of the wall.
 */
export const softLimit = (value: number, limit: number): number =>
  limit <= 0 ? 0 : limit * Math.tanh(value / limit)
