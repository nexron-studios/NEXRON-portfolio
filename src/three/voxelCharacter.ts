import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Object3D
} from 'three'

/**
 * Procedural voxel stand-in for the Blender model.
 *
 * This exists so the hero is never empty and never shows a borrowed human
 * model: it is a designed placeholder in the same visual language as the rest
 * of the site. `HeroScene` swaps it out the moment /models/jonas.glb appears.
 *
 * The figure is described as axis-aligned blocks rather than a voxel list —
 * far easier to adjust by hand — and expanded into voxels at build time.
 */

interface VoxelBlock {
  /** Inclusive voxel ranges. x is right, y is up, z is forward. */
  x: [number, number]
  y: [number, number]
  z: [number, number]
  color: number
}

const PALETTE = {
  skin: 0xe3ab7d,
  skinShadow: 0xc98f63,
  hair: 0x35271f,
  shirt: 0x162232,
  shirtPrint: 0x2ee8ff,
  pants: 0x272f3c,
  shoe: 0xe9eef6,
  shoeSole: 0x0e7d91,
  frame: 0x080b11,
  lens: 0x9ad9e8
} as const

/** Everything from the neck down. */
const bodyBlocks: VoxelBlock[] = [
  // sneakers — chunky, slightly wider than the legs
  { x: [-4, -1], y: [0, 1], z: [-2, 3], color: PALETTE.shoe },
  { x: [1, 4], y: [0, 1], z: [-2, 3], color: PALETTE.shoe },
  { x: [-4, -1], y: [0, 0], z: [-2, 3], color: PALETTE.shoeSole },
  { x: [1, 4], y: [0, 0], z: [-2, 3], color: PALETTE.shoeSole },

  // legs
  { x: [-3, -1], y: [2, 8], z: [-1, 2], color: PALETTE.pants },
  { x: [1, 3], y: [2, 8], z: [-1, 2], color: PALETTE.pants },

  // torso
  { x: [-4, 4], y: [9, 15], z: [-2, 2], color: PALETTE.shirt },
  // the funny shirt: a cyan bracket pair printed across the chest
  { x: [-2, -2], y: [11, 13], z: [3, 3], color: PALETTE.shirtPrint },
  { x: [-1, -1], y: [13, 13], z: [3, 3], color: PALETTE.shirtPrint },
  { x: [-1, -1], y: [11, 11], z: [3, 3], color: PALETTE.shirtPrint },
  { x: [2, 2], y: [11, 13], z: [3, 3], color: PALETTE.shirtPrint },
  { x: [1, 1], y: [13, 13], z: [3, 3], color: PALETTE.shirtPrint },
  { x: [1, 1], y: [11, 11], z: [3, 3], color: PALETTE.shirtPrint },

  // Arms sit one voxel clear of the torso — without that gap the sleeves
  // share the shirt colour and the whole silhouette reads as one slab.
  // The right arm is raised slightly, which is what makes the pose relaxed
  // rather than symmetric.
  { x: [-7, -6], y: [10, 15], z: [-1, 1], color: PALETTE.shirt },
  { x: [-7, -6], y: [8, 9], z: [-1, 1], color: PALETTE.skin },
  { x: [6, 7], y: [11, 16], z: [-1, 1], color: PALETTE.shirt },
  { x: [6, 7], y: [9, 10], z: [-1, 1], color: PALETTE.skin },

  // shoulder caps bridge the gap so the arms still read as attached
  { x: [-5, -5], y: [15, 15], z: [-1, 1], color: PALETTE.shirt },
  { x: [5, 5], y: [15, 15], z: [-1, 1], color: PALETTE.shirt },

  // neck
  { x: [-1, 1], y: [16, 16], z: [-1, 1], color: PALETTE.skinShadow }
]

/** Head group — rotated independently so it can follow the cursor. */
const headBlocks: VoxelBlock[] = [
  { x: [-4, 4], y: [0, 6], z: [-3, 3], color: PALETTE.skin },

  // hair: full cap plus a fringe that overhangs the forehead
  { x: [-4, 4], y: [6, 7], z: [-3, 3], color: PALETTE.hair },
  { x: [-4, 4], y: [5, 5], z: [-3, -3], color: PALETTE.hair },
  { x: [-4, -4], y: [3, 5], z: [-3, 3], color: PALETTE.hair },
  { x: [4, 4], y: [3, 5], z: [-3, 3], color: PALETTE.hair },
  { x: [-4, 4], y: [5, 5], z: [3, 3], color: PALETTE.hair },

  // glasses: frames around both eyes plus a bridge
  { x: [-3, -1], y: [2, 2], z: [4, 4], color: PALETTE.frame },
  { x: [-3, -1], y: [4, 4], z: [4, 4], color: PALETTE.frame },
  { x: [-3, -3], y: [3, 3], z: [4, 4], color: PALETTE.frame },
  { x: [-1, -1], y: [3, 3], z: [4, 4], color: PALETTE.frame },
  { x: [-2, -2], y: [3, 3], z: [4, 4], color: PALETTE.lens },

  { x: [1, 3], y: [2, 2], z: [4, 4], color: PALETTE.frame },
  { x: [1, 3], y: [4, 4], z: [4, 4], color: PALETTE.frame },
  { x: [3, 3], y: [3, 3], z: [4, 4], color: PALETTE.frame },
  { x: [1, 1], y: [3, 3], z: [4, 4], color: PALETTE.frame },
  { x: [2, 2], y: [3, 3], z: [4, 4], color: PALETTE.lens },

  { x: [0, 0], y: [3, 3], z: [4, 4], color: PALETTE.frame },
  // temples
  { x: [-4, -4], y: [3, 3], z: [2, 3], color: PALETTE.frame },
  { x: [4, 4], y: [3, 3], z: [2, 3], color: PALETTE.frame }
]

const voxelKey = (x: number, y: number, z: number): string => `${x}|${y}|${z}`

interface Voxel {
  x: number
  y: number
  z: number
  color: number
}

const expandBlocks = (blocks: VoxelBlock[]): Voxel[] => {
  const filled = new Map<string, number>()

  for (const block of blocks) {
    for (let x = block.x[0]; x <= block.x[1]; x += 1) {
      for (let y = block.y[0]; y <= block.y[1]; y += 1) {
        for (let z = block.z[0]; z <= block.z[1]; z += 1) {
          // Later blocks win, which is what makes the shirt print and the
          // glasses sit on top of the surfaces underneath them.
          filled.set(voxelKey(x, y, z), block.color)
        }
      }
    }
  }

  // Drop voxels enclosed on all six sides — they can never be seen, and each
  // one would still cost an instance and a matrix update.
  const voxels: Voxel[] = []
  for (const [key, color] of filled) {
    const parts = key.split('|')
    const x = Number(parts[0])
    const y = Number(parts[1])
    const z = Number(parts[2])

    const isEnclosed =
      filled.has(voxelKey(x + 1, y, z)) &&
      filled.has(voxelKey(x - 1, y, z)) &&
      filled.has(voxelKey(x, y + 1, z)) &&
      filled.has(voxelKey(x, y - 1, z)) &&
      filled.has(voxelKey(x, y, z + 1)) &&
      filled.has(voxelKey(x, y, z - 1))

    if (!isEnclosed) voxels.push({ x, y, z, color })
  }

  return voxels
}

/**
 * Rotates hue by a seeded amount. Near-greyscale voxels (the white sneakers,
 * the black frames) have no saturation to rotate, so they stay put on their
 * own — which is why the variants still read as the same character.
 */
const applyVariant = (hex: number, seed: number, target: Color): Color => {
  target.setHex(hex)
  if (seed === 0) return target

  const noise = Math.sin(seed * 12.9898) * 43_758.5453
  target.offsetHSL(noise - Math.floor(noise), 0, 0)
  return target
}

const buildInstancedMesh = (voxels: Voxel[], voxelSize: number, variantSeed: number): InstancedMesh => {
  // A hair gap between voxels keeps the block structure readable under light.
  const geometry = new BoxGeometry(voxelSize * 0.94, voxelSize * 0.94, voxelSize * 0.94)
  const material = new MeshStandardMaterial({ roughness: 0.72, metalness: 0.04 })
  const mesh = new InstancedMesh(geometry, material, voxels.length)

  const matrix = new Matrix4()
  const color = new Color()

  voxels.forEach((voxel, index) => {
    matrix.makeTranslation(voxel.x * voxelSize, voxel.y * voxelSize, voxel.z * voxelSize)
    mesh.setMatrixAt(index, matrix)
    mesh.setColorAt(index, applyVariant(voxel.color, variantSeed, color))
  })

  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  mesh.castShadow = true
  mesh.receiveShadow = true

  return mesh
}

export interface VoxelCharacter {
  /** Whole figure — translate/scale this. */
  group: Group
  /** Head pivot, rotate this to aim the gaze. */
  head: Group
  dispose: () => void
}

/**
 * Builds the figure. `variantSeed` reshuffles the palette so the Lab module
 * can show the same generator producing different characters; 0 is Jonas.
 */
export const createVoxelCharacter = (voxelSize = 0.1, variantSeed = 0): VoxelCharacter => {
  const group = new Group()
  const head = new Group()

  const bodyMesh = buildInstancedMesh(expandBlocks(bodyBlocks), voxelSize, variantSeed)
  const headMesh = buildInstancedMesh(expandBlocks(headBlocks), voxelSize, variantSeed)

  // The head group sits at the neck so rotation pivots there, not at the feet.
  head.position.set(0, 17 * voxelSize, 0)
  head.add(headMesh)

  group.add(bodyMesh)
  group.add(head)

  // Centre the figure on its own mass so the caller can place it at origin.
  group.position.y = -11 * voxelSize

  const dispose = (): void => {
    for (const mesh of [bodyMesh, headMesh]) {
      mesh.geometry.dispose()
      const material = mesh.material as MeshStandardMaterial
      material.dispose()
      mesh.dispose()
    }
  }

  return { group, head, dispose }
}

/** Shared scratch object for look-at maths, so the loop allocates nothing. */
export const gazeHelper = new Object3D()
