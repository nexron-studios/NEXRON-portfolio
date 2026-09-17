import {
  Box3,
  Euler,
  Group,
  MathUtils,
  Mesh,
  Quaternion,
  Vector3,
  type Object3D,
  type WebGLRenderer
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createStudioEnvironment } from '@/three/environment'
import { applyCharacterSurfaces, type SurfacePassProps } from '@/three/characterSurfaces'

/**
 * The figure that rises from behind a panel as its section scrolls into view,
 * and whose head follows the cursor.
 *
 * A head and shoulders cut of the hero character, exported on its own — no
 * podium, no props, no mascots. It is decoration sitting *behind* the content,
 * so it does not sway, cannot be dragged and is not bloomed: nothing about it
 * should compete with the panel in front of it.
 *
 * Its materials come from the same table as the hero's, because both models
 * come out of the same .blend with the same fifteen material names.
 *
 * Loading is asynchronous, so the group is returned empty and filled when the
 * file lands. A scene can add it immediately.
 */

const MODEL_URL = '/models/main_head_body.glb'

/**
 * The node the whole head hangs from — cap, hair, beard, ears and eyes are all
 * its children. Turning it turns the lot, which is why the file is built this
 * way and why following the cursor is one rotation rather than a chain.
 */
const HEAD_NODE = '01_Head'

/**
 * Blender has this figure facing −Z, exactly as the hero model does — every mesh
 * carries a 180° turn about Y. The camera sits on +Z, so the scene is turned to
 * meet it, or all that peeks over the panel is the back of a head.
 */
const MODEL_YAW = Math.PI

/**
 * How much of the figure stands above the clipping edge at full reveal.
 *
 * **The head alone is 48 % of this model's height** — it is drawn at chibi
 * proportions, not human ones. Showing the head at all therefore means better
 * than half the figure, not the quarter a realistic build would need; anything
 * less cuts the face off at the chin.
 *
 * Set at the jacket hem, which the file puts 76.7 % down: head and the whole
 * upper body clear the edge, and the cut lands on the waist instead of part-way
 * through the torso. Raising it also makes the figure *smaller*, since the
 * scale is what has to shrink for more of it to fit the same frame — which is
 * the point, the head was overbearing at 0.58.
 *
 * The figure is scaled against the **frame** rather than to a fixed size, so
 * changing the fov or the camera distance rescales it instead of cropping it.
 */
const VISIBLE_SHARE = 0.75

/**
 * Air above the head, as a share of the view height.
 *
 * Far more than the 4 % it started at, because the model is half as deep as it
 * is tall and the camera sits 3.4 away: the front of the cap stands ~0.9 units
 * towards the lens and is magnified by up to a third, so at 4 % it crossed the
 * top edge *at rest*. Perspective accounts for ~11 % and a full upward look
 * (`LOOK_PITCH`) for another ~8 %. The section boxes grew by the same share so
 * the figure stays the size it was.
 */
const TOP_MARGIN_SHARE = 0.2

/** How far the head turns to follow the pointer, in radians. */
const LOOK_YAW = 0.5
const LOOK_PITCH = 0.22

/**
 * How fast the look catches up, per second. Damped rather than tracked exactly:
 * a head that pins itself to the cursor reads as a mechanism, not a glance.
 *
 * This is now the **only** smoothing on the pointer path. It was 6 — a time
 * constant of ~167 ms — while `PeekCharacter.vue` also fed it the tracker's
 * pre-smoothed `smoothX/smoothY`, and two first-order lags in series added up to
 * over a third of a second before the head even started to arrive. The
 * component passes the raw pointer now, so this number alone is the knob.
 */
const LOOK_DAMPING = 14

export interface PeekCharacterOptionsProps {
  /**
   * How many world units tall the camera sees at the origin.
   *
   * Constant for a given fov and distance, and independent of the canvas aspect,
   * so the scene can be sized against the frame once instead of guessing.
   */
  viewHeight: number
  /** Fired once the model is in the group — the scene may need a fresh frame. */
  onLoaded?: () => void
  /** Fired when the file cannot be loaded, so a placeholder can stand down. */
  onLoadFailed?: () => void
}

export interface PeekCharacter {
  group: Group
  /** `0` hides it below the edge, `1` brings head and shoulders up. */
  setProgress: (progress: number) => void
  /** `elapsed` in seconds; pointer values are the smoothed −1…1 pair. */
  update: (elapsed: number, delta: number, pointerX: number, pointerY: number) => void
  /** Pose for a scene that renders a single frame — see `prefersReducedMotion`. */
  rest: () => void
  dispose: () => void
}

/** Centres the model horizontally, stands it on y = 0, and scales it to `targetHeight`. */
const fitToHeight = (model: Object3D, targetHeight: number): number => {
  const bounds = new Box3().setFromObject(model)
  const size = bounds.getSize(new Vector3())
  const center = bounds.getCenter(new Vector3())
  if (size.y === 0) return 0

  const scale = targetHeight / size.y

  // Centred on X and Z but pinned by the feet on Y, so the group's position can
  // be reasoned about as "how far the whole figure has risen".
  model.position.set(-center.x, -bounds.min.y, -center.z)
  model.scale.multiplyScalar(scale)
  model.position.multiplyScalar(scale)

  return targetHeight
}

export const createPeekCharacter = (
  renderer: WebGLRenderer,
  options: PeekCharacterOptionsProps
): PeekCharacter => {
  const group = new Group()
  const environment = createStudioEnvironment(renderer)

  let surfaces: SurfacePassProps | null = null
  let head: Object3D | null = null
  /**
   * The head's authored rotation. It carries the 180° turn that makes the figure
   * face the camera, so the look has to be applied *on top of* it — writing
   * `rotation.y` directly would drop that turn and face the head backwards.
   */
  const headRest = new Quaternion()
  const lookOffset = new Quaternion()
  const lookEuler = new Euler(0, 0, 0, 'YXZ')

  let modelHeight = 0
  let progress = 0
  let currentYaw = 0
  let currentPitch = 0
  let isDisposed = false
  let isResting = false

  /**
   * Where the group sits for the current progress.
   *
   * The camera looks at the origin, so the frame spans ±`viewHeight / 2`. Hidden
   * puts the top of the head exactly on the bottom edge; shown puts it just
   * under the top edge. Everything is derived from the frame, so changing the
   * fov or the camera distance moves the figure with it.
   */
  const applyProgress = (): void => {
    if (modelHeight === 0) return

    const halfView = options.viewHeight / 2
    const hidden = -halfView - modelHeight
    const shown = halfView - options.viewHeight * TOP_MARGIN_SHARE - modelHeight

    group.position.y = MathUtils.lerp(hidden, shown, progress)
  }

  const applyLook = (): void => {
    if (!head) return

    lookEuler.set(currentPitch, currentYaw, 0)
    lookOffset.setFromEuler(lookEuler)
    head.quaternion.copy(headRest).multiply(lookOffset)
  }

  const loader = new GLTFLoader()
  loader.load(
    MODEL_URL,
    (gltf) => {
      // The section may have scrolled away and unmounted while the file was in
      // flight; adopting the scene then would leak every buffer in it.
      if (isDisposed) {
        gltf.scene.traverse((object) => {
          if (object instanceof Mesh) object.geometry.dispose()
        })
        return
      }

      surfaces = applyCharacterSurfaces(gltf.scene, environment.texture)

      head = gltf.scene.getObjectByName(HEAD_NODE) ?? null
      if (head) headRest.copy(head.quaternion)
      else console.warn('peekcharacter.head_missing', { url: MODEL_URL, node: HEAD_NODE })

      gltf.scene.rotation.y = MODEL_YAW

      // Sized so the peeking part fills the frame, rather than to a fixed size.
      const usableFrame = options.viewHeight * (1 - TOP_MARGIN_SHARE)
      modelHeight = fitToHeight(gltf.scene, usableFrame / VISIBLE_SHARE)
      group.add(gltf.scene)

      applyProgress()
      applyLook()

      options.onLoaded?.()
    },
    undefined,
    (error) => {
      console.warn('peekcharacter.load_failed', { url: MODEL_URL, error })
      options.onLoadFailed?.()
    }
  )

  const setProgress = (nextProgress: number): void => {
    progress = MathUtils.clamp(nextProgress, 0, 1)
    applyProgress()
  }

  const update = (_elapsed: number, delta: number, pointerX: number, pointerY: number): void => {
    if (isResting) return

    const targetYaw = MathUtils.clamp(pointerX, -1, 1) * LOOK_YAW
    const targetPitch = MathUtils.clamp(-pointerY, -1, 1) * LOOK_PITCH

    currentYaw = MathUtils.damp(currentYaw, targetYaw, LOOK_DAMPING, delta)
    currentPitch = MathUtils.damp(currentPitch, targetPitch, LOOK_DAMPING, delta)

    applyLook()
  }

  /**
   * Reduced motion: the figure is present and looking straight ahead, and the
   * rise is left wherever the scroll position already put it. The latch has to
   * survive the model landing after the single frame was drawn.
   */
  const rest = (): void => {
    isResting = true
    currentYaw = 0
    currentPitch = 0
    applyLook()
  }

  const dispose = (): void => {
    isDisposed = true

    group.traverse((object) => {
      if (object instanceof Mesh) object.geometry.dispose()
    })

    surfaces?.dispose()
    surfaces = null
    head = null
    environment.dispose()
  }

  return { group, setProgress, update, rest, dispose }
}
