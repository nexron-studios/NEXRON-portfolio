import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  Vector3,
  type PerspectiveCamera,
  type WebGLRenderer
} from 'three'
import type { OrbSkillProps, SkillDomain } from '@/types/skill.type'
import { skillDomainList } from '@/types/skill.type'
import type { Theme } from '@/types/ui.type'
import { createStudioEnvironment } from '@/three/environment'
import { getDomainHex } from '@/three/palette'
import { createSkillAtlas } from '@/three/skillAtlas'
import type { BodyProps, ChamberBoundsProps } from '@/utils/ballPit'
import { applyRadialImpulse, layoutChambers, stepBodies } from '@/utils/ballPit'
import { atlasTile } from '@/utils/iconAtlas'

/**
 * The tech-stack pit: four walled chambers, one per domain, each holding the
 * technologies that belong to it as blocks that fall, stack and get shoved
 * around by the cursor.
 *
 * The simulation itself is in `utils/ballPit.ts` — this file only owns the
 * geometry and the mapping from body to mesh.
 *
 * The blocks used to be one `InstancedMesh` of icosahedra in four domain
 * colours, which meant twenty-five technologies were told apart by four hues
 * and nothing else. They now carry their own logo, and a per-instance texture
 * is the one thing instancing cannot express without a custom shader. So each
 * block is its own `Mesh` sharing one geometry and one atlas: twenty-five draw
 * calls where there was one, which at twenty-five objects costs nothing
 * measurable and buys the whole point of the section.
 *
 * The bodies are boxes rather than spheres for the same reason — a logo on a
 * sphere is legible from one angle and distorted from every other.
 *
 * The blocks are chrome tinted with their domain colour, and the logo is
 * emissive white on top of it — see `three/skillAtlas.ts` for why the mark is
 * added rather than multiplied.
 */

const GRAVITY = -9.4
const RESTITUTION = 0.42
/** Velocity retained per second in flight — stops the pit jittering forever. */
const DAMPING = 0.55
const WALL_WIDTH = 0.12
const BASE_RADIUS = 0.3
/** Dividers only need to clear a full chamber, not the whole frustum. */
const WALL_HEIGHT_RATIO = 0.55
/** Radians of roll per world unit travelled. */
const ROLL_PER_UNIT = 2.2
const QUARTER_TURN = Math.PI / 2
/**
 * Cube side as a multiple of the body radius.
 *
 * The radius is the coarse bound the broad phase bins by and the mass the
 * solver weighs with; the cube the solver actually collides is `halfExtent`,
 * half of this, rotated by the body's `angle`. The ratio is what packs the
 * settled pile: faces meet, and nothing reaches into a neighbour at any angle.
 */
const BLOCK_FILL = 1.72
/**
 * How far a block reaches past its collision radius, as a multiple of it.
 *
 * The simulation keeps the *circle* inside the chamber, but what the camera
 * sees is a square of side `radius * BLOCK_FILL` that spins — at 45° its
 * corner is half a diagonal from the centre, a good fifth further out than the
 * radius. Without that reserve the floor and the outer walls sit exactly on
 * the frustum edge and every settled block is clipped along the bottom and the
 * sides.
 */
const BLOCK_REACH = BLOCK_FILL * Math.SQRT1_2
/** Half the cube's depth, in radii — how far its front face stands out of the plane. */
const BLOCK_HALF_DEPTH = BLOCK_FILL / 2
/** Breathing room between the outermost block and the frustum edge. */
const PIT_MARGIN = 0.12

/**
 * Chamber width the block sizes are authored against, in world units.
 *
 * The blocks used to be a world-space constant, which meant the chambers
 * narrowed on a phone — from roughly this to about 1.1 — around blocks that
 * stayed the same size, leaving barely more than one across. The radius is
 * scaled by how much of this reference width a chamber actually has.
 */
const REFERENCE_CHAMBER_WIDTH = 2.75

/**
 * Floor on that scaling, rather than letting it run proportional.
 *
 * Strictly proportional, a phone gets blocks a little over half their desktop
 * size and the logo on the face stops being readable — and a readable logo is
 * the entire reason these are cubes and not spheres. Below this the pit is
 * allowed to look tight instead.
 */
const MIN_RADIUS_SCALE = 0.55
/**
 * Below this combined speed a block is treated as coming to rest.
 *
 * Used twice and deliberately shared: it decides when a block snaps to the
 * nearest quarter turn, and it is handed to `stepBodies` as `settleSpeed` so the
 * same block starts falling asleep. One threshold, so a block never sleeps while
 * still visibly askew.
 */
const SETTLE_SPEED = 0.4
/** How fast a resting block swings to the nearest quarter turn, per second. */
const UPRIGHT_RATE = 6
/** Within this of a quarter turn a block counts as upright and may sleep. */
const UPRIGHT_TOLERANCE = 0.01

const nearestQuarterTurn = (angle: number): number =>
  Math.round(angle / QUARTER_TURN) * QUARTER_TURN

const isUpright = (body: BodyProps): boolean =>
  Math.abs(nearestQuarterTurn(body.angle ?? 0) - (body.angle ?? 0)) < UPRIGHT_TOLERANCE

/** Cursor shove: gentle, continuous, and only close by. */
const CURSOR_RADIUS = 1.6
const CURSOR_STRENGTH = 9
/**
 * Click shove: sharp, one frame. Deliberately modest — at the original 16 the
 * balls shot out of frame and took a second to fall back, which read as a bug
 * rather than as a nudge.
 */
const CLICK_RADIUS = 2.5
const CLICK_STRENGTH = 11
const CLICK_LIFT = 3.5

/**
 * One light per chamber, hung above it.
 *
 * The shared rig in `three/lighting.ts` places its rim lights at x ±3.4, which
 * is a sensible frame for a single object at the origin and leaves the outer
 * chambers of an eleven-unit-wide pit in the dark. These sit over each chamber
 * instead, so all four read at the same brightness.
 */
const CHAMBER_LIGHT_INTENSITY = 16
const CHAMBER_LIGHT_HEIGHT_RATIO = 0.46
const CHAMBER_LIGHT_Z = 2.4
const CHAMBER_LIGHT_DECAY = 2

/**
 * How much of their authored size the blocks get, from the width available.
 *
 * `layoutChambers` splits the width into `count` chambers separated by walls, so
 * the per-chamber width is what a block is actually competing for — the frustum
 * width on its own says nothing once it is divided four ways.
 */
const radiusScaleFor = (availableWidth: number, count: number): number => {
  if (count <= 0) return 1

  const chamberWidth = (availableWidth - (count - 1) * WALL_WIDTH) / count

  return Math.min(1, Math.max(MIN_RADIUS_SCALE, chamberWidth / REFERENCE_CHAMBER_WIDTH))
}

export interface PitBallProps extends BodyProps {
  skill: OrbSkillProps
  /**
   * The roll, in radians, is `angle` on the body itself: the solver collides the
   * block as the rotated square it is drawn at, so the two cannot drift apart.
   */
  angle: number
}

export interface SkillPit {
  group: Group
  balls: PitBallProps[]
  chambers: ChamberBoundsProps[]
  /** Chamber index per domain, in `skillDomainList` order. */
  domains: SkillDomain[]
  update: (delta: number, pointer: Vector3 | null) => void
  /** One-off outward shove, e.g. on click. */
  shove: (point: Vector3) => void
  resize: (width: number, height: number) => void
  setTheme: (theme: Theme) => void
  dispose: () => void
}

const buildBalls = (skills: OrbSkillProps[], chambers: ChamberBoundsProps[]): PitBallProps[] =>
  skills.map((skill) => {
    const chamberIndex = skillDomainList.indexOf(skill.domain)
    const bounds = chambers[chamberIndex]
    const radius = BASE_RADIUS * skill.weight
    const left = (bounds?.left ?? -1) + radius
    const right = (bounds?.right ?? 1) - radius
    const span = Math.max(0, right - left)

    return {
      skill,
      radius,
      // The solver collides the block as the square it is drawn as — see
      // `halfExtent` in `utils/ballPit.ts`. Kept in step with the radius by
      // `applyRadiusScale`.
      halfExtent: radius * BLOCK_HALF_DEPTH,
      chamber: Math.max(0, chamberIndex),
      x: left + Math.random() * span,
      // Stagger the drop height so a chamber fills in rather than landing as
      // one slab.
      y: (bounds?.floor ?? 0) + 2.5 + Math.random() * 5,
      vx: 0,
      vy: 0,
      angle: Math.random() * Math.PI,
      sleepFrames: 0
    }
  })

export const createSkillPit = (
  skills: OrbSkillProps[],
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  theme: Theme,
  isCompact: boolean
): SkillPit => {
  const group = new Group()
  const domains = [...skillDomainList]

  let viewWidth = isCompact ? 6 : 11
  let viewHeight = isCompact ? 7 : 6
  let chambers = layoutChambers(viewWidth, -viewHeight / 2, domains.length, WALL_WIDTH)
  const balls = buildBalls(skills, chambers)

  let maxRadius = 0
  /** How far the pit has to stay clear of the frustum edge — see `BLOCK_REACH`. */
  let edgeInset = 0
  /**
   * The blocks are cubes, not cards: their front faces stand this far out of
   * the plane the simulation runs in, and everything is measured against that
   * plane instead — a face closer to the camera projects larger, which is what
   * pushed the outer blocks past the edge even with the inset above.
   */
  let frontFaceOffset = 0

  /** The three values that follow from the block sizes, and only from those. */
  const measureRadii = (): void => {
    maxRadius = balls.length === 0 ? 0 : Math.max(...balls.map((ball) => ball.radius))
    edgeInset = maxRadius * (BLOCK_REACH - 1) + PIT_MARGIN
    frontFaceOffset = maxRadius * BLOCK_HALF_DEPTH
  }

  /**
   * Resizes every block, keeping its collision circle, its drawn square and the
   * pit's own insets in step.
   */
  const applyRadiusScale = (scale: number): void => {
    balls.forEach((ball) => {
      ball.radius = BASE_RADIUS * ball.skill.weight * scale
      ball.halfExtent = ball.radius * BLOCK_HALF_DEPTH
    })

    measureRadii()
  }

  measureRadii()

  // One geometry for every block; the matrix carries the size, so a single
  // unit cube covers all of them.
  const ballGeometry = new BoxGeometry(1, 1, 1)
  const atlas = createSkillAtlas(skills.map((skill) => skill.name))
  const environment = createStudioEnvironment(renderer)

  const ballMaterials = balls.map((ball, index) => {
    // Chrome, not plastic: the block is what the domain colour tints, and the
    // room reflection is what makes it read as a solid object rather than a
    // flat square.
    const material = new MeshStandardMaterial({
      roughness: 0.18,
      metalness: 0.9,
      envMap: environment.texture,
      envMapIntensity: 1.1
    })

    if (atlas) {
      // A clone shares the source image, so the atlas still uploads once; only
      // the UV window differs per block.
      const emissiveMap = atlas.texture.clone()
      const tile = atlasTile(index, atlas.gridSize)

      emissiveMap.offset.set(tile.offsetX, tile.offsetY)
      emissiveMap.repeat.set(tile.scale, tile.scale)
      emissiveMap.needsUpdate = true

      material.emissiveMap = emissiveMap
      // White in both themes — the mark is the label, and a tinted label on a
      // tinted block is what made the logos hard to read in the first place.
      material.emissive.setHex(0xffffff)
      material.emissiveIntensity = 0.9
    }

    material.color.setHex(getDomainHex(ball.skill.domain, theme))

    return material
  })

  const ballMeshes = ballMaterials.map((material) => {
    const mesh = new Mesh(ballGeometry, material)
    mesh.frustumCulled = false
    group.add(mesh)

    return mesh
  })

  const wallCount = Math.max(0, domains.length - 1)
  // A box, not a scaled sphere: stretching an icosahedron into a divider gives
  // a spindle with points at both ends, which read as spikes rather than walls.
  const wallGeometry = new BoxGeometry(1, 1, 1)
  const wallMaterial = new MeshStandardMaterial({
    roughness: 0.8,
    metalness: 0,
    transparent: true,
    opacity: 0.25,
    flatShading: true
  })
  const wallMesh = new InstancedMesh(wallGeometry, wallMaterial, Math.max(1, wallCount))
  wallMesh.frustumCulled = false
  group.add(wallMesh)

  const chamberLights = domains.map(() => {
    const light = new PointLight(0xffffff, CHAMBER_LIGHT_INTENSITY, 0, CHAMBER_LIGHT_DECAY)
    group.add(light)

    return light
  })

  const dummy = new Object3D()
  const scratchColor = new Color()

  const paintBalls = (currentTheme: Theme): void => {
    balls.forEach((ball, index) => {
      ballMaterials[index]?.color.setHex(getDomainHex(ball.skill.domain, currentTheme))
    })

    // Each chamber is lit in its own hue, so the blocks reflect the colour the
    // label above them announces rather than only carrying it as a tint.
    chamberLights.forEach((light, index) => {
      light.color.setHex(getDomainHex(domains[index] ?? 'dev', currentTheme))
    })

    // Walls take the colour of the chamber to their left, so each divider
    // reads as the edge of the group it closes off.
    for (let index = 0; index < wallCount; index += 1) {
      const domain = domains[index] ?? 'dev'
      scratchColor.setHex(getDomainHex(domain, currentTheme))
      wallMesh.setColorAt(index, scratchColor)
    }
    if (wallMesh.instanceColor) wallMesh.instanceColor.needsUpdate = true
  }

  const layoutWalls = (): void => {
    for (let index = 0; index < wallCount; index += 1) {
      const bounds = chambers[index]
      if (!bounds) continue

      // Dividers rise from the floor rather than spanning the full frustum —
      // they only have to be tall enough to keep a stacked chamber apart.
      const height = viewHeight * WALL_HEIGHT_RATIO

      dummy.position.set(bounds.right + WALL_WIDTH / 2, bounds.floor + height / 2, 0)
      dummy.scale.set(WALL_WIDTH, height, WALL_WIDTH)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      wallMesh.setMatrixAt(index, dummy.matrix)
    }
    wallMesh.instanceMatrix.needsUpdate = true
  }

  /** Hangs one light over the middle of each chamber. Follows every resize. */
  const layoutChamberLights = (): void => {
    chamberLights.forEach((light, index) => {
      const bounds = chambers[index]
      if (!bounds) return

      light.position.set(
        (bounds.left + bounds.right) / 2,
        viewHeight * CHAMBER_LIGHT_HEIGHT_RATIO,
        CHAMBER_LIGHT_Z
      )
      // Reach is tied to the frustum: a fixed distance would fade out on a wide
      // viewport and blow out on a narrow one.
      light.distance = viewHeight * 2.2
    })
  }

  const syncInstances = (delta: number): void => {
    balls.forEach((ball, index) => {
      // Roll each block by how far it actually travelled, so it does not slide.
      // The angle lives on the ball: a shared one would accumulate every
      // previous block's motion into the next.
      //
      // Roll and snap are exclusive, not stacked. A slow block wedged between a
      // neighbour's corner and a wall is nudged sideways every frame, and that
      // trickle of `vx` rolled it back exactly as fast as the snap straightened
      // it: a permanent lean, and a block that could never sleep. Below the
      // settle speed the snap alone owns the angle.
      if (Math.abs(ball.vx) + Math.abs(ball.vy) < SETTLE_SPEED) {
        // A block that has come to rest swings to the nearest quarter turn.
        // Leaving a settled stack at whatever angle it stopped on means every
        // logo sits crooked, and reading them is the point of putting them there.
        const upright = nearestQuarterTurn(ball.angle)
        ball.angle += (upright - ball.angle) * Math.min(1, delta * UPRIGHT_RATE)
      } else {
        ball.angle -= ball.vx * delta * ROLL_PER_UNIT
      }

      const mesh = ballMeshes[index]
      if (!mesh) return

      mesh.position.set(ball.x, ball.y, 0)
      mesh.rotation.set(0, 0, ball.angle)
      mesh.scale.setScalar(ball.radius * BLOCK_FILL)
    })
  }

  const update = (delta: number, pointer: Vector3 | null): void => {
    if (pointer) {
      applyRadialImpulse(balls, pointer.x, pointer.y, CURSOR_RADIUS, CURSOR_STRENGTH * delta)
    }

    stepBodies(balls, chambers, {
      gravity: GRAVITY,
      restitution: RESTITUTION,
      damping: DAMPING,
      delta,
      // Blocks under this speed start falling asleep, and only once the snap in
      // `syncInstances` has them upright: a block that slept mid-turn would be
      // woken by its own straightening every frame.
      settleSpeed: SETTLE_SPEED,
      canSleep: isUpright
    })

    syncInstances(delta)
  }

  const shove = (point: Vector3): void => {
    applyRadialImpulse(balls, point.x, point.y, CLICK_RADIUS, CLICK_STRENGTH)

    // A click should feel like hitting the pit from below, not merely pushing
    // it sideways. Nearby balls receive a short upward kick as well.
    const radiusSq = CLICK_RADIUS * CLICK_RADIUS
    balls.forEach((ball) => {
      const dx = ball.x - point.x
      const dy = ball.y - point.y
      const distanceSq = dx * dx + dy * dy
      if (distanceSq >= radiusSq) return

      ball.vy += (1 - Math.sqrt(distanceSq) / CLICK_RADIUS) * CLICK_LIFT
    })
  }

  /**
   * The pit is measured in world units that must match what the camera can
   * see, otherwise the chambers either overflow the canvas or float in the
   * middle of it. Both dimensions are recomputed from the frustum on resize
   * and the bodies are nudged back inside.
   *
   * Two corrections keep the blocks off the edge: the frustum is measured at
   * the plane of their front faces rather than at their centres, and the pit
   * is then inset by how far a spinning block reaches past its own radius. See
   * `BLOCK_HALF_DEPTH` and `BLOCK_REACH`.
   *
   * The block size is derived here too, from the chamber width the frustum
   * actually allows — see `REFERENCE_CHAMBER_WIDTH`.
   */
  const resize = (width: number, height: number): void => {
    const aspect = width / Math.max(height, 1)
    const halfFov = Math.tan((camera.fov * Math.PI) / 360)

    // The block size and the frustum depend on each other: the exact frustum is
    // measured at the plane of the front faces, which stands `frontFaceOffset`
    // out of the simulation plane — and that offset is a multiple of the block
    // size the frustum is about to decide. Broken by ordering rather than by
    // iterating: the size is picked off a provisional frustum measured at the
    // simulation plane itself, and only feeds a value that is clamped anyway.
    const provisionalWidth = halfFov * camera.position.z * 2 * aspect
    applyRadiusScale(radiusScaleFor(provisionalWidth, domains.length))

    // Everything below now reads the offsets that belong to the new size.
    viewHeight = halfFov * (camera.position.z - frontFaceOffset) * 2
    viewWidth = viewHeight * aspect

    chambers = layoutChambers(
      Math.max(0, viewWidth - edgeInset * 2),
      -viewHeight / 2 + edgeInset,
      domains.length,
      WALL_WIDTH
    )

    balls.forEach((ball) => {
      const bounds = chambers[ball.chamber]
      if (!bounds) return
      ball.x = Math.min(Math.max(ball.x, bounds.left + ball.radius), bounds.right - ball.radius)
    })

    layoutWalls()
    layoutChamberLights()
  }

  const setTheme = (nextTheme: Theme): void => {
    paintBalls(nextTheme)
  }

  const dispose = (): void => {
    ballGeometry.dispose()
    // One material and one texture clone per block now, where there used to be
    // a single shared pair. Missing these leaks the whole atlas on every
    // remount of the section.
    ballMaterials.forEach((material) => {
      material.emissiveMap?.dispose()
      material.dispose()
    })
    atlas?.texture.dispose()
    environment.dispose()
    wallGeometry.dispose()
    wallMaterial.dispose()
    wallMesh.dispose()
  }

  paintBalls(theme)
  layoutWalls()
  layoutChamberLights()
  syncInstances(0)

  return {
    group,
    // Getters, not snapshots: `resize` rebuilds the chamber list, and a
    // caller holding the array from construction time would keep measuring
    // against the old layout.
    get balls() {
      return balls
    },
    get chambers() {
      return chambers
    },
    domains,
    update,
    shove,
    resize,
    setTheme,
    dispose
  }
}
