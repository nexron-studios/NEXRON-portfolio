import { AmbientLight, DirectionalLight, Group, PointLight } from 'three'
import { CREATIVE_HEX, DEV_HEX } from '@/three/palette'

/**
 * Shared three-point rig.
 *
 * The rim lights carry the two signal colours — cyan from the left, violet
 * from the right — so the object in the scene is lit by the same two hues
 * that classify everything else on the page.
 */
export const createSceneLighting = (): Group => {
  const group = new Group()

  const ambient = new AmbientLight(0xa8c4e0, 0.55)

  const key = new DirectionalLight(0xffffff, 1.5)
  key.position.set(3, 5, 4)

  const devRim = new PointLight(DEV_HEX, 14, 18, 2)
  devRim.position.set(-3.4, 1.6, 2.2)

  const creativeRim = new PointLight(CREATIVE_HEX, 9, 18, 2)
  creativeRim.position.set(3.2, -0.6, -2.4)

  // Keeps the underside from going fully black without flattening the form.
  const bounce = new DirectionalLight(0x4a6480, 0.35)
  bounce.position.set(0, -3, 1)

  group.add(ambient, key, devRim, creativeRim, bounce)

  return group
}
