export const ditherModeList = ['halftone', 'bayer'] as const
export type DitherMode = (typeof ditherModeList)[number]

/** The 4 × 4 Bayer matrix, row by row: the order in which a block's cells light up. */
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const

/** Ordered dithering: whether the cell at `col`, `row` is lit at `level` (0 to 1). */
export const isBayerLit = (level: number, col: number, row: number): boolean =>
  level > (BAYER_4[(row % 4) * 4 + (col % 4)]! + 0.5) / 16

/**
 * Halftone: the dot radius for `level` in a square cell of side `cell`. The
 * dot's area, not its radius, follows the level, so a mid grey reads as mid
 * grey; at full the dots just touch their neighbours.
 */
export const halftoneRadius = (level: number, cell: number): number =>
  cell * Math.sqrt(Math.min(1, Math.max(0, level)) / Math.PI)

/** How far a gust brightens or darkens the ground, as a share of its level. */
const WIND_STRENGTH = 0.35

/**
 * Wind over a landscape: a multiplier for the level of the cell at `col`,
 * `row` at time `seconds`. Two waves of different length roll to the right,
 * so the gusts never repeat in lockstep. Only the ground moves: it is 1 in
 * the upper 40 % of the picture (sky, distant buildings) and eases in below.
 */
export const windGust = (col: number, row: number, rows: number, seconds: number): number => {
  const depth = Math.min(1, Math.max(0, (row / rows - 0.4) / 0.3))
  const ground = depth * depth * (3 - 2 * depth)
  if (ground === 0) return 1
  const wave =
    0.5 * Math.sin(col * 0.07 + row * 0.02 - seconds * 1.3) +
    0.5 * Math.sin(col * 0.023 - row * 0.01 - seconds * 0.6)
  return 1 + ground * WIND_STRENGTH * wave
}

/** How much a passing glint brightens the cells it crosses. */
const GLINT_GAIN = 0.9
/** Width of the glint band, as a share of the picture's diagonal. */
const GLINT_WIDTH = 0.08
/** One pass every this many seconds: the band crosses in 60 % of it, then rests. */
const GLINT_PERIOD_S = 4
const GLINT_TRAVEL_SHARE = 0.6

/**
 * A glint over metal: a multiplier for the level of the cell at `col`, `row`
 * at time `seconds`. A soft band runs diagonally from top left to bottom
 * right, then the picture rests before the next pass. Empty cells stay
 * empty, because the band multiplies.
 */
export const glintBoost = (
  col: number,
  row: number,
  cols: number,
  rows: number,
  seconds: number
): number => {
  const along = (col / cols + row / rows) / 2
  const distance = (along - glintCentre(seconds)) / GLINT_WIDTH
  return 1 + GLINT_GAIN * Math.exp(-distance * distance)
}

/**
 * Band widths from the centre past which the boost changes no glyph: beyond
 * it the level moves by less than one step of the ramp. Repainting wider
 * (it was 2.5) redrew most of the picture every frame and made the page lag.
 */
const GLINT_REACH = 1.2

/** Where the band's centre is along the diagonal (0 top left, 1 bottom right). */
const glintCentre = (seconds: number): number => {
  const phase = (seconds % GLINT_PERIOD_S) / (GLINT_PERIOD_S * GLINT_TRAVEL_SHARE)
  return phase * (1 + 4 * GLINT_WIDTH) - 2 * GLINT_WIDTH
}

/** Whether the band is over the picture at `seconds`, rather than resting. */
export const isGlintPassing = (seconds: number): boolean =>
  glintCentre(seconds) < 1 + GLINT_REACH * GLINT_WIDTH

/** Seconds until the next pass starts; 0 while one is under way. */
export const secondsUntilGlint = (seconds: number): number =>
  isGlintPassing(seconds) ? 0 : GLINT_PERIOD_S - (seconds % GLINT_PERIOD_S)

/**
 * The columns of `row` the band touches at `seconds`, as `[from, to)`; an
 * empty span when it touches none. Lets a picture repaint only the band.
 */
export const glintColumns = (
  row: number,
  cols: number,
  rows: number,
  seconds: number
): [number, number] => {
  const centre = glintCentre(seconds)
  const reach = GLINT_REACH * GLINT_WIDTH
  const from = Math.max(0, Math.floor(cols * (2 * (centre - reach) - row / rows)))
  const to = Math.min(cols, Math.ceil(cols * (2 * (centre + reach) - row / rows)))
  return [from, Math.max(from, to)]
}
