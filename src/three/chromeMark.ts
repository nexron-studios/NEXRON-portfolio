import {
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  Shape,
  type Texture,
  type WebGLRenderer
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * The NEXRON mark as a chrome solid.
 *
 * The letterform is a hand-authored `Shape` rather than text from a font
 * loader: a font JSON would be a runtime asset request, and the site fetches
 * nothing it does not ship. An "N" is six points, so this is cheaper anyway.
 *
 * Chrome needs something to reflect. `RoomEnvironment` builds that environment
 * procedurally — no HDR download, no image decode, and it looks like a studio
 * because that is what it is a model of.
 */

const DEPTH = 0.34
const BEVEL = 0.045

/** Stroke width and letter proportions, in the same units as the extrusion. */
const STROKE = 0.42
const WIDTH = 1.5
const HEIGHT = 2

export interface ChromeMark {
  group: Group
  /** Called once per frame with seconds elapsed. */
  update: (elapsed: number) => void
  dispose: () => void
}

/**
 * The letter N as one closed outline: up the left stem, down the diagonal,
 * up the right stem, and back along the top. Drawn counter-clockwise so the
 * extruded faces wind outwards.
 */
const buildLetterShape = (): Shape => {
  const shape = new Shape()
  const halfWidth = WIDTH / 2
  const halfHeight = HEIGHT / 2
  // Where the diagonal meets the top and bottom rails.
  const diagonalTop = halfHeight - STROKE * 0.35
  const diagonalBottom = -halfHeight + STROKE * 0.35

  shape.moveTo(-halfWidth, -halfHeight)
  shape.lineTo(-halfWidth + STROKE, -halfHeight)
  shape.lineTo(-halfWidth + STROKE, diagonalTop - STROKE * 1.1)
  shape.lineTo(halfWidth - STROKE, diagonalBottom + STROKE * 1.1)
  shape.lineTo(halfWidth - STROKE, -halfHeight)
  shape.lineTo(halfWidth, -halfHeight)
  shape.lineTo(halfWidth, halfHeight)
  shape.lineTo(halfWidth - STROKE, halfHeight)
  shape.lineTo(halfWidth - STROKE, diagonalTop - STROKE * 0.1)
  shape.lineTo(-halfWidth + STROKE, diagonalBottom + STROKE * 0.1)
  shape.lineTo(-halfWidth + STROKE, halfHeight)
  shape.lineTo(-halfWidth, halfHeight)
  shape.closePath()

  return shape
}

export const createChromeMark = (renderer: WebGLRenderer): ChromeMark => {
  const group = new Group()

  const geometry = new ExtrudeGeometry(buildLetterShape(), {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 4
  })
  geometry.center()

  const pmrem = new PMREMGenerator(renderer)
  const environment: Texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const material = new MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.12,
    envMap: environment,
    envMapIntensity: 1.35
  })

  const mesh = new Mesh(geometry, material)
  group.add(mesh)

  const update = (elapsed: number): void => {
    // A slow turn plus a much slower nod, so the highlights travel across the
    // bevel instead of strobing.
    group.rotation.y = elapsed * 0.42
    group.rotation.x = Math.sin(elapsed * 0.31) * 0.16
  }

  const dispose = (): void => {
    geometry.dispose()
    material.dispose()
    environment.dispose()
    pmrem.dispose()
  }

  return { group, update, dispose }
}
