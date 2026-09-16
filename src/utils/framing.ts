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

/**
 * Distance at which a box of `halfWidth` × `halfHeight`, facing the camera,
 * fits inside both axes of the view.
 *
 * For a flat, wide subject the sphere is the wrong frame: a sign three units
 * wide and under one tall sweeps a sphere that is mostly air above and below
 * it, and fitting that sphere into a short box leaves the sign a third of the
 * width it could have. Each axis is fitted on its own here and the tighter one
 * wins, as in `fitDistance`.
 */
export const fitBoxDistance = (
  halfWidth: number,
  halfHeight: number,
  fovDegrees: number,
  aspect: number,
  margin = 1.15
): number => {
  const halfVertical = (fovDegrees * DEGREES_TO_RADIANS) / 2
  const halfHorizontal = Math.atan(Math.tan(halfVertical) * Math.max(aspect, 0.01))

  const forHeight = halfHeight / Math.tan(halfVertical)
  const forWidth = halfWidth / Math.tan(halfHorizontal)

  return Math.max(forHeight, forWidth) * margin
}

/**
 * How far a draggable scene's canvas overhangs its layout box on each side, as
 * a share of that box.
 *
 * The WebGL viewport is the only thing that ever clips a model, and a canvas
 * that ends exactly where the layout box ends clips the moment the model is
 * turned or tilted past its resting pose. So the canvas is positioned
 * `absolute -inset-[20%]` inside the box (the class is the CSS half of this
 * number) and the camera keeps fitting the model to the *inner* box, through
 * `bleedRadius`. The model is pixel for pixel as large as before; it just has
 * somewhere to go.
 *
 * 20 % is what makes the hero safe: its phone fit takes 0.72 of the swept
 * sphere, and 0.72 × (1 + 2 × 0.2) is the whole sphere. Nothing the diorama
 * can do under any rotation reaches outside it.
 */
export const STAGE_BLEED = 0.2

/**
 * The radius to hand `fitDistance` so that `radius` fills the inner layout box
 * while the camera renders the bled canvas around it.
 *
 * The bleed is symmetric, so the canvas aspect equals the box aspect and one
 * scale factor on the radius is exact.
 */
export const bleedRadius = (radius: number, bleed = STAGE_BLEED): number => radius * (1 + 2 * bleed)
