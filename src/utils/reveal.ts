/**
 * How far a decorative element has risen as its slot scrolls up the viewport.
 *
 * Scrubbed rather than triggered: the value tracks the scroll position both
 * ways, so scrolling back down puts the figure back where it came from instead
 * of leaving it stranded at the top of a one-shot animation.
 */

/**
 * Where in the viewport the rise finishes, as a share of the viewport height.
 *
 * Not at the very top: the slot sits above a panel, and by the time it reaches
 * the middle of the screen the figure should already be all the way up rather
 * than still climbing.
 */
const DEFAULT_LEAD = 0.55

/**
 * `0` while the slot is still below the fold, `1` once its top has climbed past
 * the lead line, linear in between.
 *
 * `rectTop` and `rectHeight` are the slot's viewport-relative box — what
 * `useElementBounding` reports — and `viewportHeight` is `window.innerHeight`.
 */
export const revealProgress = (
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
  lead = DEFAULT_LEAD
): number => {
  // The rise starts when the slot's bottom edge crosses into view and ends when
  // its top reaches the lead line, so the travel is the distance between those.
  const start = viewportHeight - rectHeight
  const end = viewportHeight * lead - rectHeight
  const travel = start - end

  if (travel <= 0) return rectTop <= end ? 1 : 0

  return Math.min(1, Math.max(0, (start - rectTop) / travel))
}
