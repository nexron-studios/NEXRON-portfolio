import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
  type WebGLRenderer
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createStudioEnvironment } from '@/three/environment'

/**
 * The NEXRON LED sign, swaying slowly in chrome.
 *
 * It sways rather than revolves, and both the sway and the drag stop short of
 * showing the back — see `FRONT_LIMIT`.
 *
 * The model is authored in Blender and arrives Blender-sized: a fraction of a
 * unit across and offset from the origin, so it is centred and scaled on load
 * and the camera pose in the component does not depend on how it was exported.
 *
 * Its materials are honoured rather than flattened. The file separates the
 * extruded body (`SVGMat.*`) from two thin plates laid over its front and back
 * (`Material.001`, authored black), and that split is the whole legibility of
 * the sign: mirror-chrome on every surface alike reflects one evenly lit room
 * and turns the lettering into a blank slab. Dark faces inside brighter edges
 * are what makes it read as type.
 *
 * Loading is asynchronous, so the group is returned empty and filled when the
 * file lands. A scene can add it immediately.
 *
 * It can also be dragged: the sign follows the pointer, and on release a
 * spring returns it to the path the idle sway would have taken it along.
 */

const MODEL_URL = '/models/nexron_3dledsign.glb'

/**
 * Longest edge in world units the sign is scaled to, whatever the file says.
 * The longest edge rather than the height: the sign is a wide plate, and
 * fitting it by height would push it out of frame sideways.
 */
const TARGET_SIZE = 3

/**
 * The sign is a face, not a sculpture: its back is an unlit shell nobody was
 * meant to look at. So it never turns past this — it sways within the front
 * half and a drag runs into a wall rather than carrying on round.
 */
const FRONT_LIMIT = 1.1

/** The idle motion: a sway across the front, not a revolution. */
const SWAY_AMPLITUDE = 0.42
/** Radians per second of phase — one sway out and back takes about 45 seconds. */
const SWAY_RATE = 0.14
/** The much slower nod on top of it, so highlights travel instead of strobing. */
const NOD_RATE = 0.09
const NOD_AMPLITUDE = 0.14

/** How far a drag may push on top of the sway before the face would turn away. */
const MAX_SPIN_OFFSET = FRONT_LIMIT - SWAY_AMPLITUDE

/**
 * Turn per drag across the full stage width. Deliberately gentle: the reachable
 * range is under a radian, and a sensitive drag would spend most of its travel
 * pressed against the limit.
 */
const TURN_PER_WIDTH = 1.6
/** Vertical drags tilt rather than turn, and far less — the sign never flips. */
const TILT_PER_HEIGHT = 1.2
const TILT_LIMIT = 0.5

/**
 * Return-to-path, as a spring rather than a decay.
 *
 * The spring pulls the *offset* from the idle sway back to zero, not the angle
 * itself — so after a drag the sign carries on swaying from wherever it was
 * left and a few seconds later is back on the path it would have been on
 * anyway, instead of staying permanently out of phase.
 *
 * Tuned rather than guessed: releasing a half-width drag swings roughly a
 * quarter revolution and settles over about five seconds without a single
 * overshoot. Softer springs wobble, stiffer ones snap back like a rubber band.
 */
const SPRING_STIFFNESS = 3
/** Share of the offset's velocity kept per second. */
const SPRING_DAMPING = 0.02
/** Below this the spring is done; parking it exactly avoids an endless crawl. */
const SPRING_REST_SPEED = 0.002
/**
 * A long frame — a tab coming back, a GC pause — would otherwise integrate the
 * spring in one huge step and fling the sign. Same guard as the ball pit.
 */
const MAX_SPRING_DELTA = 1 / 30
/**
 * Cap on the speed a release can hand to the spring. A flick covering half the
 * stage in one frame is worth about 90 rad/s uncapped, which reads as the sign
 * having come loose rather than as a throw.
 */
const MAX_RELEASE_SPEED = 10

export interface LedSign {
  group: Group
  /** Called once per frame. `elapsed` and `delta` are in seconds. */
  update: (elapsed: number, delta: number) => void
  /** Takes hold: the idle sway keeps running, the spring stops pulling. */
  beginDrag: () => void
  /**
   * Turns the sign by a drag, in fractions of the stage — `1` is a drag across
   * its full width. Positive x drags to the right. Stops at `FRONT_LIMIT`.
   */
  dragBy: (fractionX: number, fractionY: number) => void
  /** Lets go. Whatever speed the drag had carries into the spring. */
  endDrag: () => void
  /** Pose for a scene that renders a single frame — see `prefersReducedMotion`. */
  rest: () => void
  dispose: () => void
}

const STILL_POSE_X = 0.12
const STILL_POSE_Y = 0.6

/** Centres the model on the origin and scales its longest edge to `TARGET_SIZE`. */
const fitToTarget = (model: Object3D): void => {
  const bounds = new Box3().setFromObject(model)
  const size = bounds.getSize(new Vector3())
  const center = bounds.getCenter(new Vector3())

  const largest = Math.max(size.x, size.y, size.z)
  if (largest === 0) return

  const scale = TARGET_SIZE / largest

  model.position.sub(center)
  model.scale.multiplyScalar(scale)
  model.position.multiplyScalar(scale)
}

const clampTo = (value: number, limit: number): number => Math.min(limit, Math.max(-limit, value))

const clampSpeed = (speed: number): number => clampTo(speed, MAX_RELEASE_SPEED)

/**
 * One damped spring step towards zero, as `[offset, velocity]`.
 *
 * Semi-implicit Euler — the velocity is integrated before the position, which
 * is what keeps a spring stable at a frame rate it was not tuned for.
 */
const relax = (offset: number, velocity: number, step: number): [number, number] => {
  const nextVelocity =
    (velocity - SPRING_STIFFNESS * offset * step) * Math.pow(SPRING_DAMPING, step)
  const nextOffset = offset + nextVelocity * step

  if (Math.abs(nextVelocity) < SPRING_REST_SPEED && Math.abs(nextOffset) < SPRING_REST_SPEED) {
    return [0, 0]
  }

  return [nextOffset, nextVelocity]
}

export interface LedSignOptionsProps {
  /** Fired once the model is in the group — the scene may need a fresh frame. */
  onLoaded?: () => void
}

export const createLedSign = (
  renderer: WebGLRenderer,
  options: LedSignOptionsProps = {}
): LedSign => {
  const group = new Group()
  const environment = createStudioEnvironment(renderer)

  // Brushed rather than mirrored: at roughness 0.12 the body reflected the
  // environment so evenly that the letterforms disappeared into one bright
  // plate. Some roughness lets the key light model the edges instead.
  const bodyMaterial = new MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.92,
    roughness: 0.3,
    envMap: environment.texture,
    envMapIntensity: 0.85
  })

  // The plates the file authored black, kept dark but not flat black — dark
  // metal still catches the rim lights, so the type has a form rather than
  // being a hole in the sign.
  const faceMaterial = new MeshStandardMaterial({
    color: 0x2a2536,
    metalness: 0.55,
    roughness: 0.42,
    envMap: environment.texture,
    envMapIntensity: 0.5
  })

  /** The file's own material names decide; anything unexpected takes the body. */
  const materialFor = (name: string): MeshStandardMaterial =>
    name.startsWith('SVGMat') ? bodyMaterial : faceMaterial

  let isDisposed = false
  let isResting = false

  /** Radians away from the idle pose, and how fast each gap is closing. */
  let spinOffset = 0
  let spinVelocity = 0
  let tiltOffset = 0
  let tiltVelocity = 0

  let isDragging = false
  /** Last frame's offsets — what the drag speed is measured from on release. */
  let previousSpinOffset = 0
  let previousTiltOffset = 0

  const loader = new GLTFLoader()
  loader.load(
    MODEL_URL,
    (gltf) => {
      // The component may have unmounted while the four megabytes were in
      // flight; adopting the scene then would leak every buffer in it.
      if (isDisposed) {
        gltf.scene.traverse((object) => {
          if (object instanceof Mesh) object.geometry.dispose()
        })
        return
      }

      gltf.scene.traverse((object) => {
        if (!(object instanceof Mesh)) return

        const original = Array.isArray(object.material) ? object.material[0] : object.material
        object.material = materialFor(original?.name ?? '')
        original?.dispose()
      })

      fitToTarget(gltf.scene)
      group.add(gltf.scene)

      if (isResting) group.rotation.set(STILL_POSE_X, STILL_POSE_Y, 0)

      options.onLoaded?.()
    },
    undefined,
    (error) => {
      console.warn('ledsign.load_failed', { url: MODEL_URL, error })
    }
  )

  const update = (elapsed: number, delta: number): void => {
    if (isResting) return

    const step = Math.min(delta, MAX_SPRING_DELTA)

    if (isDragging) {
      // The drag writes the offsets directly, so its speed is whatever they
      // moved this frame. Measuring it here rather than from pointer events
      // keeps the release velocity in the same units as the spring's.
      if (step > 0) {
        spinVelocity = clampSpeed((spinOffset - previousSpinOffset) / step)
        tiltVelocity = clampSpeed((tiltOffset - previousTiltOffset) / step)
      }
    } else {
      // The spring runs on the offset from the idle sway, not on the angle
      // itself — that is what lets a drag play out and still end up back on
      // the original path.
      ;[spinOffset, spinVelocity] = relax(spinOffset, spinVelocity, step)
      ;[tiltOffset, tiltVelocity] = relax(tiltOffset, tiltVelocity, step)

      // A thrown release still has to stop at the wall. Dropping the velocity
      // with it means the sign settles against the limit instead of pressing
      // into it and springing off.
      if (Math.abs(spinOffset) > MAX_SPIN_OFFSET) {
        spinOffset = Math.sign(spinOffset) * MAX_SPIN_OFFSET
        spinVelocity = 0
      }
    }

    previousSpinOffset = spinOffset
    previousTiltOffset = tiltOffset

    group.rotation.y = Math.sin(elapsed * SWAY_RATE) * SWAY_AMPLITUDE + spinOffset
    group.rotation.x = Math.sin(elapsed * NOD_RATE) * NOD_AMPLITUDE + tiltOffset
  }

  const beginDrag = (): void => {
    if (isResting) return

    isDragging = true
    previousSpinOffset = spinOffset
    previousTiltOffset = tiltOffset
  }

  const dragBy = (fractionX: number, fractionY: number): void => {
    if (!isDragging) return

    // Both axes run into a wall rather than wrapping: past the turn limit the
    // back of the sign comes into view, and past the tilt limit its top.
    spinOffset = clampTo(spinOffset + fractionX * TURN_PER_WIDTH, MAX_SPIN_OFFSET)
    tiltOffset = clampTo(tiltOffset + fractionY * TILT_PER_HEIGHT, TILT_LIMIT)
  }

  const endDrag = (): void => {
    isDragging = false
  }

  /**
   * Frame zero would catch the sign flat on and unreadable, so the still pose
   * is set deliberately. It also has to survive the model arriving afterwards.
   */
  const rest = (): void => {
    isResting = true
    group.rotation.set(STILL_POSE_X, STILL_POSE_Y, 0)
  }

  const dispose = (): void => {
    isDisposed = true

    group.traverse((object) => {
      if (object instanceof Mesh) object.geometry.dispose()
    })

    bodyMaterial.dispose()
    faceMaterial.dispose()
    environment.dispose()
  }

  return { group, update, beginDrag, dragBy, endDrag, rest, dispose }
}
