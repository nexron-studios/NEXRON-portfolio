import { describe, expect, it } from 'vitest'
import {
  PERSPECTIVE_DEPTH,
  insetQuad,
  projectCell,
  projectWell,
  rowScale,
  towardVanishingPoint,
  vanishingPoint,
  type QuadProps,
  type WellLayoutProps
} from '../tetrisPerspective'

/**
 * The board ships straight on (`PERSPECTIVE_DEPTH` is 0), so the flight is
 * exercised with an explicit depth: the projection still has to be right for
 * it, since that constant is the one dial that brings it back.
 */
const RECEDING_DEPTH = 0.45

const layout: WellLayoutProps = {
  columns: 10,
  rows: 20,
  width: 400,
  height: 500,
  depth: RECEDING_DEPTH
}

const widthOf = (row: number): number => {
  const left = projectCell(0, row, layout)
  const right = projectCell(layout.columns - 1, row, layout)

  return right.topRight.x - left.topLeft.x
}

describe('rowScale', () => {
  it('should leave the floor at full size', () => {
    expect(rowScale(20, 20, RECEDING_DEPTH)).toBe(1)
  })

  it('should shrink the ceiling by the depth', () => {
    expect(rowScale(0, 20, RECEDING_DEPTH)).toBeCloseTo(1 / (1 + RECEDING_DEPTH))
  })

  it('should keep every row at full size when there is no depth', () => {
    expect(rowScale(0, 20, 0)).toBe(1)
    expect(rowScale(10, 20, 0)).toBe(1)
  })

  it('should never invert or vanish a row', () => {
    for (let row = 0; row <= 20; row += 1) {
      const scale = rowScale(row, 20, RECEDING_DEPTH)
      expect(scale).toBeGreaterThan(0)
      expect(scale).toBeLessThanOrEqual(1)
    }
  })
})

describe('projectCell', () => {
  it('should draw the far end of the shaft narrower than the near end', () => {
    expect(widthOf(0)).toBeLessThan(widthOf(19))
  })

  it('should keep the well centred on the canvas axis', () => {
    const left = projectCell(0, 0, layout)
    const right = projectCell(layout.columns - 1, 0, layout)

    expect((left.topLeft.x + right.topRight.x) / 2).toBeCloseTo(layout.width / 2)
  })

  it('should leave no gap between neighbouring cells in a row', () => {
    const left = projectCell(3, 8, layout)
    const right = projectCell(4, 8, layout)

    expect(right.topLeft.x).toBeCloseTo(left.topRight.x)
    expect(right.bottomLeft.x).toBeCloseTo(left.bottomRight.x)
  })

  it('should leave no gap between stacked rows', () => {
    const upper = projectCell(5, 8, layout)
    const lower = projectCell(5, 9, layout)

    expect(lower.topLeft.y).toBeCloseTo(upper.bottomLeft.y)
  })

  it('should make near rows taller than far ones', () => {
    const far = projectCell(5, 1, layout)
    const near = projectCell(5, 19, layout)

    expect(near.bottomLeft.y - near.topLeft.y).toBeGreaterThan(far.bottomLeft.y - far.topLeft.y)
  })

  it('should fall back to a rectangular grid at depth zero', () => {
    const flat = { ...layout, depth: 0 }
    const top = projectCell(0, 0, flat)
    const bottom = projectCell(0, 19, flat)

    expect(top.topLeft.x).toBeCloseTo(bottom.topLeft.x)
    expect(top.topRight.x).toBeCloseTo(bottom.topRight.x)
  })

  it('should keep the floor inside the canvas', () => {
    const floor = projectCell(0, layout.rows - 1, layout)

    expect(floor.bottomLeft.y).toBeLessThanOrEqual(layout.height)
  })
})

describe('projectWell', () => {
  it('should span the mouth and the floor of the shaft', () => {
    const well = projectWell(layout)

    expect(well.topLeft.y).toBeLessThan(well.bottomLeft.y)
    expect(well.bottomRight.x - well.bottomLeft.x).toBeGreaterThan(well.topRight.x - well.topLeft.x)
  })
})

describe('the depth the board actually ships with', () => {
  const shipped = { ...layout, depth: PERSPECTIVE_DEPTH }

  it('should be straight on, so every cell is the same size', () => {
    const top = projectCell(4, 0, shipped)
    const bottom = projectCell(4, 19, shipped)

    expect(top.topRight.x - top.topLeft.x).toBeCloseTo(bottom.topRight.x - bottom.topLeft.x)
    expect(top.bottomLeft.y - top.topLeft.y).toBeCloseTo(bottom.bottomLeft.y - bottom.topLeft.y)
  })

  it('should fill the canvas edge to edge', () => {
    const first = projectCell(0, 0, shipped)
    const last = projectCell(9, 19, shipped)

    expect(first.topLeft.x).toBeCloseTo(0)
    expect(first.topLeft.y).toBeCloseTo(0)
    expect(last.bottomRight.x).toBeCloseTo(shipped.width)
    expect(last.bottomRight.y).toBeCloseTo(shipped.height)
  })
})

describe('insetQuad', () => {
  const cell = projectCell(3, 12, layout)

  it('should leave a face alone at zero', () => {
    expect(insetQuad(cell, 0)).toEqual(cell)
  })

  it('should shrink a face towards its own centre', () => {
    const inner = insetQuad(cell, 0.2)

    expect(inner.topLeft.x).toBeGreaterThan(cell.topLeft.x)
    expect(inner.topLeft.y).toBeGreaterThan(cell.topLeft.y)
    expect(inner.bottomRight.x).toBeLessThan(cell.bottomRight.x)
    expect(inner.bottomRight.y).toBeLessThan(cell.bottomRight.y)
  })

  it('should keep the inner face concentric with the outer one', () => {
    // The centroid of all four corners, not the midpoint of one diagonal: a
    // cell under perspective is a trapezoid, and the two are not the same
    // point there.
    const centroid = (quad: QuadProps): { x: number; y: number } => ({
      x: (quad.topLeft.x + quad.topRight.x + quad.bottomRight.x + quad.bottomLeft.x) / 4,
      y: (quad.topLeft.y + quad.topRight.y + quad.bottomRight.y + quad.bottomLeft.y) / 4
    })

    const inner = insetQuad(cell, 0.3)

    expect(centroid(inner).x).toBeCloseTo(centroid(cell).x)
    expect(centroid(inner).y).toBeCloseTo(centroid(cell).y)
  })

  it('should collapse a face to a point at full inset', () => {
    const inner = insetQuad(cell, 1)

    expect(inner.topLeft.x).toBeCloseTo(inner.bottomRight.x)
    expect(inner.topLeft.y).toBeCloseTo(inner.bottomRight.y)
  })
})

describe('towardVanishingPoint', () => {
  it('should not move a face at all when the amount is zero', () => {
    const face = projectCell(2, 10, layout)

    expect(towardVanishingPoint(face, layout, 0)).toEqual(face)
  })

  it('should pull a face towards the shaft axis and mouth', () => {
    const face = projectCell(0, 19, layout)
    const back = towardVanishingPoint(face, layout, 0.08)
    const vanishing = vanishingPoint(layout)

    expect(back.bottomLeft.x).toBeGreaterThan(face.bottomLeft.x)
    expect(back.bottomLeft.y).toBeLessThan(face.bottomLeft.y)
    expect(vanishing.x).toBeCloseTo(layout.width / 2)
  })

  it('should collapse a face onto the vanishing point at full amount', () => {
    const face = projectCell(7, 4, layout)
    const back = towardVanishingPoint(face, layout, 1)
    const vanishing = vanishingPoint(layout)

    expect(back.topLeft.x).toBeCloseTo(vanishing.x)
    expect(back.bottomRight.y).toBeCloseTo(vanishing.y)
  })
})
