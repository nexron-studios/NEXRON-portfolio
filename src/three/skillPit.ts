import {
  BoxGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
  type PerspectiveCamera
} from 'three'
import type { OrbSkillProps, SkillDomain } from '@/types/skill.type'
import { skillDomainList } from '@/types/skill.type'
import type { Theme } from '@/types/ui.type'
import { getDomainHex } from '@/three/palette'
import type { BodyProps, ChamberBoundsProps } from '@/utils/ballPit'
import { applyRadialImpulse, layoutChambers, stepBodies } from '@/utils/ballPit'

/**
 * The tech-stack pit: four walled chambers, one per domain, each holding the
 * technologies that belong to it as balls that fall, stack and get shoved
 * around by the cursor.
 *
 * The simulation itself is in `utils/ballPit.ts` — this file only owns the
 * geometry, the instancing and the mapping from body to instance. Rendered as
 * two `InstancedMesh`es (balls, walls) so the whole pit is two draw calls.
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

export interface PitBallProps extends BodyProps {
  skill: OrbSkillProps
  /** Accumulated roll, in radians. Per ball — a shared one smears across all. */
  roll: number
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
  /** Nearest ball to a world point within its radius, or null. */
  pick: (point: Vector3) => PitBallProps | null
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
      chamber: Math.max(0, chamberIndex),
      x: left + Math.random() * span,
      // Stagger the drop height so a chamber fills in rather than landing as
      // one slab.
      y: (bounds?.floor ?? 0) + 2.5 + Math.random() * 5,
      vx: 0,
      vy: 0,
      roll: Math.random() * Math.PI
    }
  })

export const createSkillPit = (
  skills: OrbSkillProps[],
  camera: PerspectiveCamera,
  theme: Theme,
  isCompact: boolean
): SkillPit => {
  const group = new Group()
  const domains = [...skillDomainList]

  let viewWidth = isCompact ? 6 : 11
  let viewHeight = isCompact ? 7 : 6
  let chambers = layoutChambers(viewWidth, -viewHeight / 2, domains.length, WALL_WIDTH)
  const balls = buildBalls(skills, chambers)

  // One geometry for every ball; the per-instance matrix carries the radius,
  // so a single low-poly sphere covers all of them.
  const ballGeometry = new IcosahedronGeometry(1, 2)
  const ballMaterial = new MeshStandardMaterial({
    roughness: 0.34,
    metalness: 0.1,
    flatShading: true
  })

  const ballMesh = new InstancedMesh(ballGeometry, ballMaterial, balls.length)
  ballMesh.frustumCulled = false
  group.add(ballMesh)

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

  const dummy = new Object3D()
  const scratchColor = new Color()

  const paintBalls = (currentTheme: Theme): void => {
    balls.forEach((ball, index) => {
      scratchColor.setHex(getDomainHex(ball.skill.domain, currentTheme))
      ballMesh.setColorAt(index, scratchColor)
    })
    if (ballMesh.instanceColor) ballMesh.instanceColor.needsUpdate = true

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

  const syncInstances = (delta: number): void => {
    balls.forEach((ball, index) => {
      // Roll each ball by how far it actually travelled, so it does not slide.
      // The angle lives on the ball: reusing the dummy's own rotation would
      // accumulate every previous ball's motion into the next one.
      ball.roll -= ball.vx * delta * ROLL_PER_UNIT

      dummy.position.set(ball.x, ball.y, 0)
      dummy.rotation.set(0, 0, ball.roll)
      dummy.scale.setScalar(ball.radius)
      dummy.updateMatrix()
      ballMesh.setMatrixAt(index, dummy.matrix)
    })
    ballMesh.instanceMatrix.needsUpdate = true
  }

  const update = (delta: number, pointer: Vector3 | null): void => {
    if (pointer) {
      applyRadialImpulse(balls, pointer.x, pointer.y, CURSOR_RADIUS, CURSOR_STRENGTH * delta)
    }

    stepBodies(balls, chambers, {
      gravity: GRAVITY,
      restitution: RESTITUTION,
      damping: DAMPING,
      delta
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

  const pick = (point: Vector3): PitBallProps | null => {
    let closest: PitBallProps | null = null
    let closestDistanceSq = Infinity

    for (const ball of balls) {
      const dx = ball.x - point.x
      const dy = ball.y - point.y
      const distanceSq = dx * dx + dy * dy

      if (distanceSq > ball.radius * ball.radius) continue
      if (distanceSq >= closestDistanceSq) continue

      closest = ball
      closestDistanceSq = distanceSq
    }

    return closest
  }

  /**
   * The pit is measured in world units that must match what the camera can
   * see, otherwise the chambers either overflow the canvas or float in the
   * middle of it. Both dimensions are recomputed from the frustum on resize
   * and the bodies are nudged back inside.
   */
  const resize = (width: number, height: number): void => {
    const distance = camera.position.z
    const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * distance

    viewHeight = halfHeight * 2
    viewWidth = viewHeight * (width / height)

    chambers = layoutChambers(viewWidth * 0.94, -viewHeight / 2, domains.length, WALL_WIDTH)

    balls.forEach((ball) => {
      const bounds = chambers[ball.chamber]
      if (!bounds) return
      ball.x = Math.min(Math.max(ball.x, bounds.left + ball.radius), bounds.right - ball.radius)
    })

    layoutWalls()
  }

  const setTheme = (nextTheme: Theme): void => {
    paintBalls(nextTheme)
  }

  const dispose = (): void => {
    ballGeometry.dispose()
    ballMaterial.dispose()
    wallGeometry.dispose()
    wallMaterial.dispose()
    ballMesh.dispose()
    wallMesh.dispose()
  }

  paintBalls(theme)
  layoutWalls()
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
    pick,
    resize,
    setTheme,
    dispose
  }
}
