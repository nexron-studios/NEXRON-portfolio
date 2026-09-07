import { Box3, Group, Mesh, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createStudioEnvironment } from '@/three/environment'
import { createContactShadow, type ContactShadowProps } from '@/three/contactShadow'
import { applyCharacterSurfaces, type SurfacePassProps } from '@/three/characterSurfaces'
import { advanceHop, createHopState, type HopStateProps } from '@/utils/hop'
import {
  clampTo,
  relaxSpring,
  softLimit,
  MAX_SPRING_DELTA,
  type SpringConfigProps
} from '@/utils/spring'
import type { Theme } from '@/types/ui.type'

/**
 * The hero object: Jonas at his setup, swaying slowly on a lit podium.
 *
 * It replaced the rounded chrome cube, which was a placeholder from the day the
 * voxel character came out. The file is a diorama rather than a figure — laptop,
 * controller, phone, AirPods and two Clawd mascots are arranged around the disc
 * the character stands on.
 *
 * It sways on a fixed path rather than revolving, for the same reason the LED
 * sign does: the back of a character is not its showing side. `FRONT_LIMIT` is
 * what guarantees that, for the sway and a drag together.
 *
 * It can be dragged like the sign: the scene follows the pointer, and on release
 * a spring returns it to the path the idle sway would have taken it along.
 *
 * Loading is asynchronous, so the group is returned empty and filled when the
 * file lands. A scene can add it immediately.
 */

const MODEL_URL = '/models/mainCharakter.glb'

/**
 * Radius the whole diorama is normalised to, in world units. The camera derives
 * its distance from this rather than assuming a size, so re-exporting the model
 * at another scale changes nothing here.
 */
export const CHARACTER_RADIUS = 1.5

/**
 * Blender has the figure facing −Z: every character mesh carries a 180° turn
 * about Y, which puts the back brim of the cap — the one part whose orientation
 * is unambiguous — on +Z. The camera sits on +Z, so the model is turned to meet
 * it.
 */
const MODEL_YAW = Math.PI

/**
 * A three-quarter view rather than a flat frontal: it shows the face and the
 * laptop at once, and gives the podium an ellipse instead of a line.
 */
const RESTING_YAW = 0.42

/** The idle motion: a sway across the front, never a revolution. */
const SWAY_AMPLITUDE = 0.55
/** Radians per second of phase — one sway out and back takes about 25 seconds. */
const SWAY_RATE = 0.25
/** The slow nod on top, so highlights travel across the form instead of sitting still. */
const NOD_RATE = 0.21
const NOD_AMPLITUDE = 0.05

/**
 * Never turn further than this from the resting yaw, or the back comes round.
 *
 * Wide enough that a drag has somewhere to go — the reachable range used to run
 * out after a third of a drag across the stage — but no wider. With the resting
 * yaw on top, this tops out just past profile; a limit that let the drag reach
 * 110° turned the figure's back to the reader, which is the one thing the limit
 * exists to prevent.
 */
const FRONT_LIMIT = 1.25

/** How far a drag may push on top of the sway before the back would show. */
const MAX_SPIN_OFFSET = FRONT_LIMIT - SWAY_AMPLITUDE

/**
 * Turn per drag across the full stage width. Gentle on purpose: the reachable
 * range is under a radian, and a sensitive drag would spend most of its travel
 * pressed against the limit.
 */
const TURN_PER_WIDTH = 1.2
/** Vertical drags tilt rather than turn, and far less — the figure never flips. */
const TILT_PER_HEIGHT = 0.7
const TILT_LIMIT = 0.32

/**
 * Softer and slower than the LED sign's, which is why the two no longer share
 * one set of numbers: this scene is a figure being turned rather than a plate
 * being spun, and the stiffer pull read as the model snapping back. Released
 * from the far edge it is about 39 % of the way home after a second and settles
 * over roughly six, with a fraction of a degree of overshoot at the end — enough
 * to read as coming to rest instead of stopping.
 */
const SPRING: SpringConfigProps = { stiffness: 1.6, damping: 0.12, restSpeed: 0.002 }

/**
 * Cap on the speed a release can hand to the spring. A flick covering half the
 * stage in one frame is worth about 90 rad/s uncapped, which reads as the scene
 * coming loose rather than as a throw.
 */
const MAX_RELEASE_SPEED = 8

/** The gentle float, in world units. */
const FLOAT_AMPLITUDE = 0.03
const FLOAT_RATE = 0.6

/**
 * Where the podium's floor sits in model units — the shadow lies on it, a hair
 * above so it does not z-fight. The figure's feet reach down to 0.031, so
 * anything higher floats the shadow at ankle height instead of under the boots.
 */
const PODIUM_SURFACE_Y = 0.0385
const SHADOW_RADIUS = 0.3

/**
 * The framing centre is biased up towards the figure. Centring the raw bounding
 * box puts the podium in the middle of the stage and the head against the top
 * edge, because the disc is wider than the character is tall.
 */
const VERTICAL_BIAS = 0.16

/** The material every Clawd mascot is painted with. Their handle for animation. */
const CLAWD_MATERIAL = 'clawd'

/**
 * A Clawd whose origin sits above this — in model units, before the fit — is
 * not standing on the podium.
 *
 * **It currently matches nothing**, and that is the point of keeping it. An
 * earlier export carried a third mascot floating free in mid-air behind the
 * character's head, where the two real ones sit at y 0.09 and 0.15 — a
 * duplicate someone forgot to move back, hidden from the resting angle by luck
 * and swung into view by the first drag. The .blend no longer has it. The guard
 * costs five lines and catches that class of export accident the next time.
 */
const STRAY_MASCOT_MIN_Y = 0.4

/** How high a mascot hops, as a share of its own height. */
const HOP_HEIGHT_RATIO = 0.55
/** Seconds between one mascot's jumps, drawn fresh after each landing. */
const HOP_DELAY_MIN = 2.5
const HOP_DELAY_MAX = 6

/**
 * The emissive podium reads differently against a near-white page: in the light
 * theme the rig is brighter overall, and the lamps start blooming into a smear.
 * Same white, turned down.
 */
const EMISSIVE_SCALE: Record<Theme, number> = { dark: 1, light: 0.7 }

interface MascotProps {
  root: Object3D
  /** The node's own resting height, so a hop is an offset rather than a position. */
  baseY: number
  hopHeight: number
  hop: HopStateProps
}

export interface HeroCharacterOptionsProps {
  /** Fired once the model is in the group — the scene may need a fresh frame. */
  onLoaded?: () => void
}

export interface HeroCharacter {
  group: Group
  /** Called once per frame. `elapsed` and `delta` are in seconds. */
  update: (elapsed: number, delta: number) => void
  /** Takes hold: the idle sway keeps running, the spring stops pulling. */
  beginDrag: () => void
  /**
   * Turns the scene by a drag, in fractions of the stage — `1` is a drag across
   * its full width. Positive x drags to the right. Stops at `FRONT_LIMIT`.
   */
  dragBy: (fractionX: number, fractionY: number) => void
  /** Lets go. Whatever speed the drag had carries into the spring. */
  endDrag: () => void
  setTheme: (theme: Theme) => void
  /** Freezes the scene at a readable angle for `prefers-reduced-motion`. */
  rest: () => void
  dispose: () => void
}

/**
 * The radius the scene sweeps as it turns, and the point it turns around.
 *
 * The scene only ever rotates about Y, so a vertex traces a circle of radius
 * √(x²+z²) at its own height and the enclosing radius is measured against that
 * axis rather than against a point. A bounding sphere would have to contain the
 * podium's diagonal — half again as large as anything ever visible — and would
 * push the camera back far enough to leave the figure swimming in empty stage.
 *
 * Walks the vertices once, on load — a few thousand of them, and only the once.
 */
const measureSweptBounds = (model: Object3D): { center: Vector3; radius: number } => {
  const center = new Box3().setFromObject(model).getCenter(new Vector3())

  const vertex = new Vector3()
  let radiusSquared = 0

  model.updateWorldMatrix(true, true)
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return

    const positions = object.geometry.getAttribute('position')
    for (let index = 0; index < positions.count; index++) {
      vertex.fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld)

      const horizontal = (vertex.x - center.x) ** 2 + (vertex.z - center.z) ** 2
      const vertical = (vertex.y - center.y) ** 2
      radiusSquared = Math.max(radiusSquared, horizontal + vertical)
    }
  })

  return { center, radius: Math.sqrt(radiusSquared) }
}

/**
 * Centres the model on the origin, biased towards the figure, and scales it so
 * the radius it sweeps becomes `CHARACTER_RADIUS`.
 */
const fitToTarget = (model: Object3D): void => {
  const { center, radius } = measureSweptBounds(model)
  if (radius === 0) return

  const scale = CHARACTER_RADIUS / radius
  center.y -= VERTICAL_BIAS * radius

  model.position.sub(center)
  model.scale.multiplyScalar(scale)
  model.position.multiplyScalar(scale)
}

/** The child of `scene` that an object hangs under, which is what a hop moves. */
const topLevelParent = (object: Object3D, scene: Object3D): Object3D | null => {
  let node: Object3D = object
  while (node.parent && node.parent !== scene) node = node.parent
  return node.parent === scene ? node : null
}

/**
 * Groups the mascot meshes under the node each one hangs from, and measures how
 * high that mascot should hop from its own visible height — the two are
 * different sizes, and one hop height would have the small one taking flight.
 */
const collectMascots = (meshes: Mesh[], scene: Object3D): MascotProps[] => {
  const byRoot = new Map<Object3D, Mesh[]>()

  meshes.forEach((mesh) => {
    const root = topLevelParent(mesh, scene)
    if (!root) return

    const existing = byRoot.get(root)
    if (existing) existing.push(mesh)
    else byRoot.set(root, [mesh])
  })

  return [...byRoot.entries()].map(([root, ownMeshes]) => {
    // Measured over the mascot's own meshes rather than with `setFromObject`,
    // which would also swallow the hidden stray sharing this node and return a
    // box seven times too tall.
    const box = new Box3()
    ownMeshes.forEach((mesh) => box.expandByObject(mesh))

    return {
      root,
      baseY: root.position.y,
      hopHeight: box.getSize(new Vector3()).y * HOP_HEIGHT_RATIO,
      hop: createHopState(HOP_DELAY_MIN + Math.random() * (HOP_DELAY_MAX - HOP_DELAY_MIN))
    }
  })
}

export const createHeroCharacter = (
  renderer: WebGLRenderer,
  theme: Theme,
  options: HeroCharacterOptionsProps = {}
): HeroCharacter => {
  const group = new Group()
  const environment = createStudioEnvironment(renderer)

  let surfaces: SurfacePassProps | null = null
  let mascots: MascotProps[] = []
  let shadow: ContactShadowProps | null = null
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
  /**
   * What the pointer has actually travelled this drag, before the soft limit
   * bends it. Kept apart so the easing is applied once to the total rather than
   * compounding on every increment.
   */
  let rawSpinOffset = 0
  let rawTiltOffset = 0

  const applyEmissiveTheme = (nextTheme: Theme): void => {
    const scale = EMISSIVE_SCALE[nextTheme]
    surfaces?.emissive.forEach((entry) => {
      entry.material.emissiveIntensity = entry.baseIntensity * scale
    })
  }

  const loader = new GLTFLoader()
  loader.load(
    MODEL_URL,
    (gltf) => {
      // The component may have unmounted while the model was still
      // in flight; adopting the scene then would leak every buffer in it.
      if (isDisposed) {
        gltf.scene.traverse((object) => {
          if (object instanceof Mesh) object.geometry.dispose()
        })
        return
      }

      surfaces = applyCharacterSurfaces(gltf.scene, environment.texture)
      const clawdMeshes = surfaces.byMaterialName.get(CLAWD_MATERIAL) ?? []

      applyEmissiveTheme(theme)

      gltf.scene.updateWorldMatrix(true, true)
      const worldPosition = new Vector3()
      const standingMascots = clawdMeshes.filter((mesh) => {
        mesh.getWorldPosition(worldPosition)
        if (worldPosition.y <= STRAY_MASCOT_MIN_Y) return true

        mesh.visible = false
        return false
      })

      // Measured before the fit, so the hop heights are in the same units the
      // node positions are still in.
      mascots = collectMascots(standingMascots, gltf.scene)

      shadow = createContactShadow(SHADOW_RADIUS, PODIUM_SURFACE_Y)
      // Parented before the fit, so it takes the same centring and scale.
      if (shadow) gltf.scene.add(shadow.mesh)

      gltf.scene.rotation.y = MODEL_YAW
      fitToTarget(gltf.scene)
      group.add(gltf.scene)

      if (isResting) rest()

      options.onLoaded?.()
    },
    undefined,
    (error) => {
      console.warn('herocharacter.load_failed', { url: MODEL_URL, error })
    }
  )

  const nextHopDelay = (): number => HOP_DELAY_MIN + Math.random() * (HOP_DELAY_MAX - HOP_DELAY_MIN)

  const updateMascots = (elapsed: number): void => {
    mascots.forEach((mascot) => {
      const { state, offset } = advanceHop(mascot.hop, elapsed, nextHopDelay)
      mascot.hop = state
      mascot.root.position.y = mascot.baseY + offset * mascot.hopHeight
    })
  }

  const update = (elapsed: number, delta: number): void => {
    if (isResting) return

    const step = Math.min(delta, MAX_SPRING_DELTA)

    if (isDragging) {
      // The drag writes the offsets directly, so its speed is whatever they
      // moved this frame. Measuring it here rather than from pointer events
      // keeps the release velocity in the same units as the spring's.
      if (step > 0) {
        spinVelocity = clampTo((spinOffset - previousSpinOffset) / step, MAX_RELEASE_SPEED)
        tiltVelocity = clampTo((tiltOffset - previousTiltOffset) / step, MAX_RELEASE_SPEED)
      }
    } else {
      // The spring runs on the offset from the idle sway, not on the angle
      // itself — that is what lets a drag play out and still end up back on the
      // original path.
      ;[spinOffset, spinVelocity] = relaxSpring(spinOffset, spinVelocity, step, SPRING)
      ;[tiltOffset, tiltVelocity] = relaxSpring(tiltOffset, tiltVelocity, step, SPRING)

      // A thrown release still has to stop at the wall. Dropping the velocity
      // with it means the scene settles against the limit instead of pressing
      // into it and springing off.
      if (Math.abs(spinOffset) > MAX_SPIN_OFFSET) {
        spinOffset = Math.sign(spinOffset) * MAX_SPIN_OFFSET
        spinVelocity = 0
      }
    }

    previousSpinOffset = spinOffset
    previousTiltOffset = tiltOffset

    group.rotation.y = RESTING_YAW + Math.sin(elapsed * SWAY_RATE) * SWAY_AMPLITUDE + spinOffset
    group.rotation.x = Math.sin(elapsed * NOD_RATE) * NOD_AMPLITUDE + tiltOffset
    group.position.y = Math.sin(elapsed * FLOAT_RATE) * FLOAT_AMPLITUDE

    updateMascots(elapsed)
  }

  const beginDrag = (): void => {
    if (isResting) return

    isDragging = true
    previousSpinOffset = spinOffset
    previousTiltOffset = tiltOffset
    // Take up wherever the spring left the scene, so a second grab does not jump.
    rawSpinOffset = spinOffset
    rawTiltOffset = tiltOffset
  }

  const dragBy = (fractionX: number, fractionY: number): void => {
    if (!isDragging) return

    rawSpinOffset += fractionX * TURN_PER_WIDTH
    rawTiltOffset += fractionY * TILT_PER_HEIGHT

    // Both axes give way towards their limit rather than stopping at it — the
    // back of the figure still never comes into view, but the drag runs out of
    // travel gradually instead of going dead under the pointer. It also means a
    // release at the edge hands the spring almost no speed, because the last
    // stretch of the drag barely moved the scene.
    spinOffset = softLimit(rawSpinOffset, MAX_SPIN_OFFSET)
    tiltOffset = softLimit(rawTiltOffset, TILT_LIMIT)
  }

  const endDrag = (): void => {
    isDragging = false
  }

  const setTheme = (nextTheme: Theme): void => {
    applyEmissiveTheme(nextTheme)
  }

  /**
   * The pose a single frame is caught at under reduced motion. The latch matters
   * as much as the pose: the model usually lands after that frame was drawn, so
   * the load callback has to be able to ask for it again.
   */
  const rest = (): void => {
    isResting = true
    group.rotation.set(0, RESTING_YAW, 0)
    group.position.y = 0
  }

  const dispose = (): void => {
    isDisposed = true

    group.traverse((object) => {
      if (object instanceof Mesh) object.geometry.dispose()
    })

    surfaces?.dispose()
    surfaces = null
    mascots = []

    shadow?.dispose()
    environment.dispose()
  }

  return { group, update, beginDrag, dragBy, endDrag, setTheme, rest, dispose }
}
