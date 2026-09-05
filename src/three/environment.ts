import { PMREMGenerator, type Texture, type WebGLRenderer } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * The studio box every chrome surface on the site reflects.
 *
 * `RoomEnvironment` builds it procedurally — no HDR download, no image decode,
 * and it looks like a studio because that is what it is a model of. Two scenes
 * need one now (the LED sign and the tech-stack blocks), so the PMREM pass
 * lives here rather than being copied into both.
 *
 * The generator holds GPU memory of its own, which is why `dispose` returns
 * with the texture instead of being left to the caller to remember.
 */
export interface StudioEnvironmentProps {
  texture: Texture
  dispose: () => void
}

/** Blur applied while pre-filtering — enough to smear the room into highlights. */
const SIGMA = 0.04

export const createStudioEnvironment = (renderer: WebGLRenderer): StudioEnvironmentProps => {
  const pmrem = new PMREMGenerator(renderer)
  const texture = pmrem.fromScene(new RoomEnvironment(), SIGMA).texture

  const dispose = (): void => {
    texture.dispose()
    pmrem.dispose()
  }

  return { texture, dispose }
}
