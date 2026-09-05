/**
 * The playable Tetris well, projected as a shaft receding into the screen.
 *
 * Pure geometry: no canvas, no Vue, no colours. `useTetrisBoard` paints what
 * this returns, and the specs pin the shape without a browser.
 *
 * The near edge of the well is its bottom. A row's scale falls off with its
 * distance from that edge, so the top of the shaft is both narrower and
 * shallower than the floor — which is what lets twenty rows occupy far less
 * height than a square grid of the same cell size would need.
 */

export interface PointProps {
  x: number
  y: number
}

/** A cell's face, corners clockwise from the top-left. */
export interface QuadProps {
  topLeft: PointProps
  topRight: PointProps
  bottomRight: PointProps
  bottomLeft: PointProps
}

export interface WellLayoutProps {
  columns: number
  rows: number
  /** Canvas size in CSS pixels. */
  width: number
  height: number
  /**
   * How hard the shaft recedes. 0 is a flat rectangular grid; the further up,
   * the smaller the far end.
   */
  depth: number
}

/**
 * Zero: the well is drawn straight on.
 *
 * It was tried at 0.45 — a real shaft, far end at about 70 % of the near one —
 * and it looked wrong and played worse: with no two rows the same size, the
 * grid stops reading as a grid and lining a piece up becomes guesswork. The
 * projection stays because it is what places every cell, and this is the one
 * dial that brings the flight back if it is ever wanted.
 */
export const PERSPECTIVE_DEPTH = 0

/** How much of the canvas height the well occupies. */
const WELL_HEIGHT_RATIO = 1

/**
 * Scale of a horizontal line at `row`, where row 0 is the ceiling and
 * `rows` is the floor. The floor is 1 and everything above it shrinks.
 */
export const rowScale = (row: number, rows: number, depth: number): number => {
  if (rows <= 0) return 1

  const distance = 1 - row / rows

  return 1 / (1 + depth * distance)
}

/**
 * Vertical placement of a row line, in canvas pixels.
 *
 * Rows are laid out by accumulating their scaled heights rather than spacing
 * them evenly: a row that is drawn 30 % narrower has to be 30 % shorter too,
 * or the cells shear instead of receding.
 */
const rowOffsets = (rows: number, depth: number): number[] => {
  const offsets: number[] = [0]
  let total = 0

  for (let row = 0; row < rows; row += 1) {
    // The band between two lines takes the scale of its lower (nearer) edge,
    // so the floor row is the tallest one.
    total += rowScale(row + 1, rows, depth)
    offsets.push(total)
  }

  return offsets.map((offset) => offset / total)
}

/** The four corners of one cell. */
export const projectCell = (column: number, row: number, layout: WellLayoutProps): QuadProps => {
  const { columns, rows, width, height, depth } = layout

  const offsets = rowOffsets(rows, depth)
  const wellHeight = height * WELL_HEIGHT_RATIO
  const top = height - wellHeight

  const lineY = (index: number): number => top + (offsets[index] ?? 0) * wellHeight

  const lineX = (index: number, cell: number): number => {
    const scale = rowScale(index, rows, depth)
    const centre = width / 2
    const halfWidth = (width / 2) * scale

    return centre - halfWidth + ((cell * 2) / columns) * halfWidth
  }

  return {
    topLeft: { x: lineX(row, column), y: lineY(row) },
    topRight: { x: lineX(row, column + 1), y: lineY(row) },
    bottomRight: { x: lineX(row + 1, column + 1), y: lineY(row + 1) },
    bottomLeft: { x: lineX(row + 1, column), y: lineY(row + 1) }
  }
}

/**
 * The outline of the whole well — the shaft mouth at the top, the floor at the
 * bottom. Used for the frame and the side walls behind the stack.
 */
export const projectWell = (layout: WellLayoutProps): QuadProps => {
  const ceiling = projectCell(0, 0, layout)
  const floor = projectCell(layout.columns - 1, layout.rows - 1, layout)

  return {
    topLeft: ceiling.topLeft,
    topRight: { x: layout.width - ceiling.topLeft.x, y: ceiling.topLeft.y },
    bottomRight: floor.bottomRight,
    bottomLeft: { x: layout.width - floor.bottomRight.x, y: floor.bottomRight.y }
  }
}

/** The centre of a face — what an inset shrinks towards. */
const centreOf = (quad: QuadProps): PointProps => ({
  x: (quad.topLeft.x + quad.topRight.x + quad.bottomRight.x + quad.bottomLeft.x) / 4,
  y: (quad.topLeft.y + quad.topRight.y + quad.bottomRight.y + quad.bottomLeft.y) / 4
})

/**
 * A face shrunk towards its own centre — the inner edge of a bevel.
 *
 * `amount` is the fraction taken off each side: 0 leaves the face alone, 1
 * collapses it to a point.
 */
export const insetQuad = (quad: QuadProps, amount: number): QuadProps => {
  const centre = centreOf(quad)
  const pull = (point: PointProps): PointProps => ({
    x: point.x + (centre.x - point.x) * amount,
    y: point.y + (centre.y - point.y) * amount
  })

  return {
    topLeft: pull(quad.topLeft),
    topRight: pull(quad.topRight),
    bottomRight: pull(quad.bottomRight),
    bottomLeft: pull(quad.bottomLeft)
  }
}

/**
 * Where every line of the shaft converges: on its axis, at the mouth.
 *
 * Both the walls and the depth of a single block are drawn towards this one
 * point. Two different vanishing points in one picture is the reliable way to
 * make a scene look wrong without anyone being able to say why.
 */
export const vanishingPoint = (layout: WellLayoutProps): PointProps => ({
  x: layout.width / 2,
  y: layout.height * (1 - WELL_HEIGHT_RATIO)
})

/**
 * A cell's face pushed towards the vanishing point, which is what gives a
 * block its depth: the front face is the cell itself, this is its back.
 *
 * `amount` is the fraction of the way there — a small number. Anything much
 * above 0.1 and the block reads as a tunnel rather than as a solid.
 */
export const towardVanishingPoint = (
  quad: QuadProps,
  layout: WellLayoutProps,
  amount: number
): QuadProps => {
  const vanishing = vanishingPoint(layout)

  const pull = (point: PointProps): PointProps => ({
    x: point.x + (vanishing.x - point.x) * amount,
    y: point.y + (vanishing.y - point.y) * amount
  })

  return {
    topLeft: pull(quad.topLeft),
    topRight: pull(quad.topRight),
    bottomRight: pull(quad.bottomRight),
    bottomLeft: pull(quad.bottomLeft)
  }
}
