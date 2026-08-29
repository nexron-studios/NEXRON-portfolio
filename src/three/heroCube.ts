import {
  Group,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  MathUtils,
  type Texture,
  type WebGLRenderer
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Theme } from '@/types/ui.type'

/**
 * The hero object: a rounded cube in polished violet metal.
 *
 * It replaced the voxel character. Rounded rather than hard-edged so it agrees
 * with the rest of the interface, and metallic rather than flat so the light
 * moving across the bevels does the work a spinning wireframe would otherwise
 * have to do.
 *
 * Chrome needs something to reflect. `RoomEnvironment` builds that environment
 * procedurally — no HDR download, no image decode, and it looks like a studio
 * because that is what it is a model of.
 */

const SIZE = 1.65
const SEGMENTS = 6
const BEVEL = 0.22

/** How far the cube leans toward the cursor, in radians. */
const TILT_RANGE = 0.34
/** Idle turn rate, radians per second. */
const SPIN_RATE = 0.28

/** The angle it rests at when nothing is animating. */
const STILL_POSE_X = -0.18
const STILL_POSE_Y = 0.62

const SURFACE_HEX: Record<Theme, number> = {
  dark: 0x8b5cf6,
  light: 0x6d28d9
}

export interface HeroCube {
  group: Group
  /** `elapsed` in seconds; pointer values are the smoothed −1…1 pair. */
  update: (elapsed: number, pointerX: number, pointerY: number) => void
  setTheme: (theme: Theme) => void
  /** Freezes the cube at a readable angle for `prefers-reduced-motion`. */
  rest: () => void
  dispose: () => void
}

export const createHeroCube = (renderer: WebGLRenderer, theme: Theme): HeroCube => {
  const group = new Group()

  const geometry = new RoundedBoxGeometry(SIZE, SIZE, SIZE, SEGMENTS, BEVEL)

  const pmrem = new PMREMGenerator(renderer)
  const environment: Texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const material = new MeshStandardMaterial({
    color: SURFACE_HEX[theme],
    metalness: 0.92,
    roughness: 0.18,
    envMap: environment,
    envMapIntensity: 1.5
  })

  const mesh = new Mesh(geometry, material)
  group.add(mesh)

  const update = (elapsed: number, pointerX: number, pointerY: number): void => {
    // A slow turn carries the highlights across the bevels; the pointer adds a
    // lean on top, clamped so the cube never rolls onto a corner.
    group.rotation.y = elapsed * SPIN_RATE + MathUtils.clamp(pointerX, -1, 1) * TILT_RANGE
    group.rotation.x =
      Math.sin(elapsed * 0.34) * 0.12 + MathUtils.clamp(-pointerY, -1, 1) * TILT_RANGE * 0.6
    group.position.y = Math.sin(elapsed * 0.7) * 0.05
  }

  const setTheme = (nextTheme: Theme): void => {
    material.color.setHex(SURFACE_HEX[nextTheme])
  }

  const rest = (): void => {
    group.rotation.set(STILL_POSE_X, STILL_POSE_Y, 0)
    group.position.y = 0
  }

  const dispose = (): void => {
    geometry.dispose()
    material.dispose()
    environment.dispose()
    pmrem.dispose()
  }

  return { group, update, setTheme, rest, dispose }
}
