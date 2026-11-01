/**
 * How far down a track the reader is, 0…1: the share of the track that has
 * passed a reading line `line` px from the top of the viewport. `top` and
 * `height` are the track's bounding box. Before the track reaches the line
 * it is 0, once its end has passed it is 1.
 */
export const pathProgress = (top: number, height: number, line: number): number => {
  if (height <= 0) return 0
  return Math.min(1, Math.max(0, (line - top) / height))
}
