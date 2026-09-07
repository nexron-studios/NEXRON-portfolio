import {
  CanvasTexture,
  CircleGeometry,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  type Texture
} from 'three'

/**
 * The soft dark patch that puts the figure on the podium instead of above it.
 *
 * A painted gradient rather than a shadow map: the podium is 93k triangles for
 * what is visually a disc, and a depth pass over it every frame buys nothing
 * that a blurred ellipse does not already sell. It also needs no light to cast
 * it, so the character rig stays free to be lit for the figure alone.
 *
 * The same `CanvasTexture` approach the skill atlas uses, at a fraction of the
 * size — one radial gradient is all the detail a contact shadow has.
 */

/** Wide enough for a smooth falloff, small enough to be free. */
const TEXTURE_PX = 128

/** Where the gradient starts giving way — inside this it is at full strength. */
const CORE_STOP = 0.35
const MID_STOP = 0.7
const CORE_ALPHA = 0.62
const MID_ALPHA = 0.24

const RADIAL_SEGMENTS = 48

export interface ContactShadowProps {
  mesh: Mesh
  dispose: () => void
}

const createGradientTexture = (): Texture | null => {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_PX
  canvas.height = TEXTURE_PX

  const context = canvas.getContext('2d')
  if (!context) return null

  const center = TEXTURE_PX / 2
  const gradient = context.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, `rgba(0, 0, 0, ${CORE_ALPHA})`)
  gradient.addColorStop(CORE_STOP, `rgba(0, 0, 0, ${CORE_ALPHA})`)
  gradient.addColorStop(MID_STOP, `rgba(0, 0, 0, ${MID_ALPHA})`)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  context.fillStyle = gradient
  context.fillRect(0, 0, TEXTURE_PX, TEXTURE_PX)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

/**
 * `radius` and `height` are in the model's own units — the shadow is parented
 * into the loaded scene before it is fitted, so it takes the same transform.
 */
export const createContactShadow = (radius: number, height: number): ContactShadowProps | null => {
  const texture = createGradientTexture()
  if (!texture) return null

  const geometry = new CircleGeometry(radius, RADIAL_SEGMENTS)
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    // Laid flat on a surface it is coplanar with; without this it would z-fight
    // with the podium and flicker as the scene turns.
    depthWrite: false
  })

  const mesh = new Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = height
  mesh.renderOrder = 1

  const dispose = (): void => {
    geometry.dispose()
    material.dispose()
    texture.dispose()
  }

  return { mesh, dispose }
}
