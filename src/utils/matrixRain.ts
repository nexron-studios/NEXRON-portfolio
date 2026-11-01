/**
 * Digits, Latin capitals and a few code symbols: the rain's alphabet. No
 * katakana (removed 2026-11-01, Jonas did not want Asian characters on the
 * page); binary digits weigh double so it still reads as machine rain.
 */
export const MATRIX_GLYPHS = '0101010123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]/=+*#$'

/** The glyph for a random number in [0, 1). */
export const pickGlyph = (random: number): string => {
  const index = Math.min(MATRIX_GLYPHS.length - 1, Math.floor(random * MATRIX_GLYPHS.length))
  return MATRIX_GLYPHS[index]!
}

/** Below this share, a drop that has left the field waits a frame longer. */
const RESTART_CHANCE = 0.025

/**
 * Where a drop is on the next frame. It falls by its speed; once it is past
 * the last row it restarts above the field, but only now and then, so the
 * columns drift out of step instead of all returning together.
 */
export const nextDropRow = (row: number, speed: number, rows: number, random: number): number => {
  if (row > rows && random < RESTART_CHANCE) return -Math.floor(random * rows * 4)
  if (row > rows) return row
  return row + speed
}
