/**
 * Where each mark sits on a square texture atlas, and what UV window shows it.
 *
 * Pure, and separate from the drawing in `three/skillAtlas.ts`, because this is
 * the half that goes wrong silently: a row counted from the wrong edge shows
 * every cube its neighbour's logo, and nothing throws. A canvas cannot be
 * asserted in jsdom; this can.
 *
 * Canvas rows are counted from the top, texture coordinates from the bottom.
 * Flipping between the two is the whole job.
 */

export interface AtlasTileProps {
  /** Column on the canvas, from the left. */
  column: number
  /** Row on the canvas, from the top. */
  row: number
  /** Texture offset, in UV space. */
  offsetX: number
  offsetY: number
  /** Width and height of one tile in UV space — the texture's `repeat`. */
  scale: number
}

/** Side length, in tiles, of the smallest square grid that holds `count`. */
export const atlasGridSize = (count: number): number => Math.max(1, Math.ceil(Math.sqrt(count)))

export const atlasTile = (index: number, gridSize: number): AtlasTileProps => {
  const size = Math.max(1, gridSize)
  const column = index % size
  const row = Math.floor(index / size)
  const scale = 1 / size

  return {
    column,
    row,
    offsetX: column * scale,
    // The flip: canvas row 0 is at the top, UV row 0 is at the bottom.
    offsetY: 1 - (row + 1) * scale,
    scale
  }
}
