/**
 * Camera framing maths.
 *
 * A perspective camera crops on whichever axis is tighter, and which one that
 * is flips with the stage. The hero stage is portrait on desktop and landscape
 * on a phone, so fitting by height alone (the usual shortcut) crops the sides
 * of a wide subject exactly where the layout is narrowest.
 */

const DEGREES_TO_RADIANS = Math.PI / 180

/**
 * Distance at which a sphere of `radius` fits inside **both** axes of the view.
 *
 * `fovDegrees` is the vertical field of view, the way Three.js defines it. The
 * horizontal one follows from the aspect ratio, and the larger of the two
 * required distances wins — that is the one that would otherwise crop.
 *
 * `margin` is breathing room around the subject: `1` fits it edge to edge.
 */
export const fitDistance = (
  radius: number,
  fovDegrees: number,
  aspect: number,
  margin = 1.15
): number => {
  const halfVertical = (fovDegrees * DEGREES_TO_RADIANS) / 2
  const halfHorizontal = Math.atan(Math.tan(halfVertical) * Math.max(aspect, 0.01))

  const forHeight = radius / Math.sin(halfVertical)
  const forWidth = radius / Math.sin(halfHorizontal)

  return Math.max(forHeight, forWidth) * margin
}
