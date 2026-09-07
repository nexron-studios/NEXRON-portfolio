import { AmbientLight, DirectionalLight, Group, PointLight } from 'three'
import { CREATIVE_HEX, DEV_HEX } from '@/three/palette'
import type { Theme } from '@/types/ui.type'

/**
 * Shared three-point rig.
 *
 * The rim lights carry the two signal colours — violet from the left, magenta
 * from the right — so the object in the scene is lit by the same two hues that
 * classify everything else on the page.
 *
 * Built for the chrome surfaces: a lot of fill, because a mirror has no form of
 * its own to model. A figure wants the opposite — see `createCharacterLighting`.
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

/** Warm, because a neutral white key renders skin as a morgue exhibit. */
const KEY_HEX = 0xfff2e0
/** Cool and weak, only there to keep the shadow side from closing to black. */
const FILL_HEX = 0x8e9ecb

const KEY_INTENSITY: Record<Theme, number> = { dark: 2.2, light: 3.1 }
const AMBIENT_INTENSITY: Record<Theme, number> = { dark: 0.35, light: 0.8 }
/**
 * The rims all but vanish in the light theme: a magenta edge against `#f7f5fb`
 * is invisible and costs fill rate for nothing. In the dark theme they are the
 * only thing separating a figure in a dark jacket from a dark page.
 */
const RIM_INTENSITY: Record<Theme, number> = { dark: 1, light: 0.25 }

/**
 * Point lights fall off with the square of the distance, so the rims have to sit
 * close to the figure to read at all — parked out where the chrome rig keeps
 * them they contribute a rounding error and the silhouette stays unseparated.
 */
const DEV_RIM_POWER = 26
const CREATIVE_RIM_POWER = 18
const RIM_DISTANCE = 12
const RIM_DECAY = 2

export interface CharacterLightingProps {
  group: Group
  setTheme: (theme: Theme) => void
}

/**
 * The rig for the hero figure.
 *
 * Deliberately not the chrome rig above. That one fills the scene evenly, which
 * is right for a mirror and wrong for a character: flat light on a low-poly
 * figure erases the form the modelling put there. So the fill is cut back and
 * the work is handed to a warm key and two coloured rims from behind, which is
 * what gives the silhouette an edge to read against the page.
 *
 * Ambient stays low because `RoomEnvironment` is already carrying the scene as
 * an image-based light — see `environment.ts`.
 */
export const createCharacterLighting = (theme: Theme): CharacterLightingProps => {
  const group = new Group()

  const ambient = new AmbientLight(0xbcc8e8, AMBIENT_INTENSITY[theme])

  const key = new DirectionalLight(KEY_HEX, KEY_INTENSITY[theme])
  key.position.set(-2.6, 4, 3.6)

  const fill = new DirectionalLight(FILL_HEX, 0.45)
  fill.position.set(3.2, 0.4, 2.4)

  const devRim = new PointLight(DEV_HEX, DEV_RIM_POWER, RIM_DISTANCE, RIM_DECAY)
  devRim.position.set(-2.1, 1.5, -1.9)

  const creativeRim = new PointLight(CREATIVE_HEX, CREATIVE_RIM_POWER, RIM_DISTANCE, RIM_DECAY)
  creativeRim.position.set(2.2, 1, -1.6)

  group.add(ambient, key, fill, devRim, creativeRim)

  const setTheme = (nextTheme: Theme): void => {
    ambient.intensity = AMBIENT_INTENSITY[nextTheme]
    key.intensity = KEY_INTENSITY[nextTheme]
    devRim.intensity = DEV_RIM_POWER * RIM_INTENSITY[nextTheme]
    creativeRim.intensity = CREATIVE_RIM_POWER * RIM_INTENSITY[nextTheme]
  }

  setTheme(theme)

  return { group, setTheme }
}
