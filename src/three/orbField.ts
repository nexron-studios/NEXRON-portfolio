import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3
} from 'three'
import type { OrbSkillProps, SkillDomain } from '@/types/skill.type'
import { DOMAIN_HEX } from '@/three/palette'

/**
 * Floating technology objects with a hand-rolled spring simulation.
 *
 * A physics engine would be several hundred kilobytes for behaviour that is
 * three forces: a spring pulling each orb back to its home, a push away from
 * the cursor, and a separation impulse so two orbs never occupy the same
 * space. Damping does the rest.
 */

const SPRING = 2.4
const DAMPING = 0.86
const CURSOR_RADIUS = 1.5
const CURSOR_STRENGTH = 26
const SEPARATION = 12
/** Physics blows up if a background tab hands us a one-second delta. */
const MAX_DELTA = 1 / 30

export interface Orb {
  mesh: Mesh
  home: Vector3
  velocity: Vector3
  radius: number
  label: string
  domain: SkillDomain
  /** Per-orb phase so the idle bob does not move in lockstep. */
  phase: number
}

export interface OrbField {
  orbs: Orb[]
  update: (delta: number, elapsed: number, pointerWorld: Vector3, hasPointer: boolean) => void
  dispose: () => void
}

/** Visible extent of the z = 0 plane, so orbs are laid out inside the frame. */
const visibleSize = (camera: PerspectiveCamera): { width: number; height: number } => {
  const height = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
  return { width: height * camera.aspect, height }
}

export const createOrbField = (
  skills: OrbSkillProps[],
  camera: PerspectiveCamera,
  isCompact: boolean
): OrbField => {
  const { width, height } = visibleSize(camera)

  // Lay out on a jittered grid rather than at random: pure random clumps,
  // and a clean grid looks like a table of contents.
  const columns = isCompact ? 3 : 4
  const rows = Math.ceil(skills.length / columns)
  const cellWidth = (width * 0.82) / columns
  const cellHeight = (height * 0.74) / rows

  const geometry = new IcosahedronGeometry(1, 1)

  const orbs: Orb[] = skills.map((skill, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)

    const jitterX = Math.sin(index * 12.9898) * cellWidth * 0.22
    const jitterY = Math.cos(index * 78.233) * cellHeight * 0.22

    const home = new Vector3(
      (column - (columns - 1) / 2) * cellWidth + jitterX,
      ((rows - 1) / 2 - row) * cellHeight + jitterY,
      Math.sin(index * 4.1) * 0.5
    )

    const radius = skill.weight * (isCompact ? 0.2 : 0.26)

    const material = new MeshStandardMaterial({
      color: new Color(DOMAIN_HEX[skill.domain]),
      roughness: 0.35,
      metalness: 0.1,
      // Faceted rather than smooth — a low-poly shell belongs to the same
      // language as the voxel figure; a glossy sphere does not.
      flatShading: true,
      emissive: new Color(DOMAIN_HEX[skill.domain]),
      emissiveIntensity: 0.16
    })

    const mesh = new Mesh(geometry, material)
    mesh.scale.setScalar(radius)
    mesh.position.copy(home)

    return {
      mesh,
      home,
      velocity: new Vector3(),
      radius,
      label: skill.name,
      domain: skill.domain,
      phase: index * 1.37
    }
  })

  // Scratch vectors — the update loop must not allocate.
  const force = new Vector3()
  const offset = new Vector3()

  const update = (
    delta: number,
    elapsed: number,
    pointerWorld: Vector3,
    hasPointer: boolean
  ): void => {
    const dt = Math.min(delta, MAX_DELTA)

    for (const orb of orbs) {
      const position = orb.mesh.position

      // 1. spring back home, with a slow bob layered onto the target
      force.copy(orb.home)
      force.y += Math.sin(elapsed * 0.6 + orb.phase) * 0.12
      force.sub(position).multiplyScalar(SPRING)

      // 2. push away from the cursor
      if (hasPointer) {
        offset.copy(position).sub(pointerWorld)
        const distance = offset.length()
        if (distance < CURSOR_RADIUS && distance > 0.0001) {
          const falloff = 1 - distance / CURSOR_RADIUS
          force.addScaledVector(offset.normalize(), falloff * falloff * CURSOR_STRENGTH)
        }
      }

      // 3. separation — orbs repel once their shells would intersect
      for (const other of orbs) {
        if (other === orb) continue
        offset.copy(position).sub(other.mesh.position)
        const distance = offset.length()
        const minimum = (orb.radius + other.radius) * 1.9
        if (distance < minimum && distance > 0.0001) {
          force.addScaledVector(offset.normalize(), (minimum - distance) * SEPARATION)
        }
      }

      orb.velocity.addScaledVector(force, dt)
      orb.velocity.multiplyScalar(DAMPING)
      position.addScaledVector(orb.velocity, dt)

      orb.mesh.rotation.x += dt * 0.22
      orb.mesh.rotation.y += dt * 0.3
    }
  }

  const dispose = (): void => {
    geometry.dispose()
    for (const orb of orbs) {
      ;(orb.mesh.material as MeshStandardMaterial).dispose()
    }
  }

  return { orbs, update, dispose }
}
