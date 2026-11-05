/**
 * Glyphs from empty to dense, in the spirit of the reference poster: thin
 * punctuation for the light edges, letters and figures for the body, the
 * heaviest symbols for the brightest core. Index 0 is blank.
 */
export const ASCII_RAMP = ' .`:-~^!?7YJ5PGB#&@'

/**
 * Brightness of one sampled pixel, 0…1, after levels: everything at or below
 * `low` is empty ground, everything at or above `high` is full, and `gamma`
 * below 1 lifts the mid-tones so the figure reads as a body, not an outline.
 */
export const asciiLevel = (luminance: number, low = 0.06, high = 0.85, gamma = 0.8): number => {
  if (luminance <= low) return 0
  const span = Math.max(high - low, 0.0001)
  return Math.min(1, (luminance - low) / span) ** gamma
}

/** sRGB channels 0…255 to perceived luminance 0…1. */
export const luminanceOf = (red: number, green: number, blue: number): number =>
  (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255

/**
 * The glyph for a level, optionally nudged one step along the ramp (the
 * shimmer). Zero stays blank; a nudge never empties a cell or runs past the
 * densest glyph.
 */
export const glyphForLevel = (level: number, nudge = 0): string => {
  if (level <= 0) return ' '
  const last = ASCII_RAMP.length - 1
  const step = Math.max(1, Math.round(Math.min(1, level) * last))
  return ASCII_RAMP[Math.min(last, Math.max(1, step + nudge))]!
}

/**
 * Whether a cell holds detail finer than one glyph (a thin line, a spike's
 * tip): its four quarters differ by at least `contrast`. Such a cell is
 * drawn as four half-size glyphs instead of one.
 */
export const isDetailCell = (quarters: ArrayLike<number>, contrast: number): boolean => {
  let low = 1
  let high = 0
  for (let index = 0; index < quarters.length; index++) {
    low = Math.min(low, quarters[index]!)
    high = Math.max(high, quarters[index]!)
  }
  return high - low >= contrast
}

/** RGBA pixels (as `getImageData` returns them) to one level per pixel. */
export const levelsOf = (pixels: ArrayLike<number>, white: number): Float32Array<ArrayBuffer> => {
  const levels = new Float32Array(pixels.length / 4)
  for (let index = 0; index < levels.length; index++) {
    const base = index * 4
    levels[index] = asciiLevel(
      luminanceOf(pixels[base]!, pixels[base + 1]!, pixels[base + 2]!),
      0.05,
      white
    )
  }
  return levels
}

/** Index on the half-size grid of quarter `sub` (0 to 3, row by row) of a cell. */
export const quarterIndex = (index: number, sub: number, cols: number): number => {
  const row = Math.floor(index / cols) * 2 + (sub >> 1)
  const col = (index % cols) * 2 + (sub & 1)
  return row * cols * 2 + col
}

/** Marks (1) every cell whose four quarters on the half-size grid hold detail. */
export const detailCells = (
  fine: ArrayLike<number>,
  cols: number,
  rows: number,
  contrast: number
): Uint8Array<ArrayBuffer> => {
  const split = new Uint8Array(cols * rows)
  const quarters = new Float32Array(4)
  for (let index = 0; index < split.length; index++) {
    for (let sub = 0; sub < 4; sub++) quarters[sub] = fine[quarterIndex(index, sub, cols)]!
    split[index] = isDetailCell(quarters, contrast) ? 1 : 0
  }
  return split
}

/** Marks (1) every inked cell that touches empty ground: the figure's outline. */
export const edgeCells = (
  levels: ArrayLike<number>,
  cols: number,
  rows: number
): Uint8Array<ArrayBuffer> => {
  const edge = new Uint8Array(cols * rows)
  const isEmpty = (col: number, row: number): boolean =>
    col < 0 || row < 0 || col >= cols || row >= rows || levels[row * cols + col]! <= 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (levels[row * cols + col]! <= 0) continue
      const isOnEdge =
        isEmpty(col - 1, row) ||
        isEmpty(col + 1, row) ||
        isEmpty(col, row - 1) ||
        isEmpty(col, row + 1)
      edge[row * cols + col] = isOnEdge ? 1 : 0
    }
  }
  return edge
}

/**
 * When each cell of the grid finishes decoding, in ms: top rows first over
 * `sweep`, plus a random wait of up to `spread` so the rows do not snap.
 */
export const decodeDelays = (
  cols: number,
  rows: number,
  sweep: number,
  spread: number,
  random: () => number
): Float32Array<ArrayBuffer> => {
  const delays = new Float32Array(cols * rows)
  for (let index = 0; index < delays.length; index++) {
    delays[index] = (Math.floor(index / cols) / rows) * sweep + random() * spread
  }
  return delays
}

/** A block of cells: columns and rows from (inclusive) to (exclusive). */
export interface CellRangeProps {
  colFrom: number
  colTo: number
  rowFrom: number
  rowTo: number
}

/** How a grid of cells sits in its field, in CSS px. */
export interface CellGridProps {
  cols: number
  rows: number
  offsetX: number
  offsetY: number
  cellW: number
  cellH: number
}

/** The cells within `reach` px of a point, clamped to the grid. */
export const cellRangeAround = (
  x: number,
  y: number,
  reach: number,
  grid: CellGridProps
): CellRangeProps => ({
  colFrom: Math.max(0, Math.floor((x - reach - grid.offsetX) / grid.cellW)),
  colTo: Math.min(grid.cols, Math.ceil((x + reach - grid.offsetX) / grid.cellW)),
  rowFrom: Math.max(0, Math.floor((y - reach - grid.offsetY) / grid.cellH)),
  rowTo: Math.min(grid.rows, Math.ceil((y + reach - grid.offsetY) / grid.cellH))
})

/**
 * The cells that shimmer this beat: about `share` of all cells, inked ones
 * only, each nudged one step up or down the ramp. Returns the nudge per cell
 * and the list of nudged cells.
 */
export const pickShimmer = (
  levels: ArrayLike<number>,
  share: number,
  random: () => number
): { jitter: Int8Array<ArrayBuffer>; picked: number[] } => {
  const jitter = new Int8Array(levels.length)
  const picked: number[] = []
  const count = Math.round(levels.length * share)
  for (let hit = 0; hit < count; hit++) {
    const index = Math.floor(random() * levels.length)
    if (levels[index]! <= 0) continue
    jitter[index] = random() < 0.5 ? -1 : 1
    picked.push(index)
  }
  return { jitter, picked }
}

/** Whether a point (relative to a box's top left) lies within `reach` px of the box. */
export const isWithinReach = (
  x: number,
  y: number,
  box: { width: number; height: number },
  reach: number
): boolean => x > -reach && y > -reach && x < box.width + reach && y < box.height + reach
