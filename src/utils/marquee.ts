/**
 * Where a looping band sits for a given travel: always within one
 * repetition's width, so `translate(-offset)` shows an endless band. Works
 * for travel in either direction; a band with no width stays put.
 */
export const wrapOffset = (travel: number, unitWidth: number): number => {
  if (unitWidth <= 0) return 0
  return ((travel % unitWidth) + unitWidth) % unitWidth
}
