import {
  DoubleSide,
  FrontSide,
  Mesh,
  MeshStandardMaterial,
  type Material,
  type Object3D,
  type Texture
} from 'three'
import { DEV_HEX } from '@/three/palette'

/**
 * How light behaves on every material the character files carry.
 *
 * Shared by both models — the hero diorama and the head-and-shoulders figure
 * that peeks out behind the panels. They come out of the same .blend and use the
 * same material names, so one table covers both.
 *
 * The models arrive from Blender with no textures at all — flat
 * `baseColorFactor` slots, and the character meshes have no UVs, so image maps
 * are not an option without re-unwrapping. What makes them read as skin, wool,
 * rubber and chrome is therefore entirely roughness, metalness and how much of
 * the studio environment each surface is allowed to catch.
 *
 * **Blender keeps the colour, this file owns the light.** The base colour is
 * taken from the loaded material rather than retyped here, so re-exporting with
 * a different jacket follows automatically; only where the authored colour is
 * wrong for the page does `colorHex` override it. Same stance as the LED sign,
 * whose materials are honoured rather than flattened — just across 27 slots
 * instead of two.
 *
 * The names are the API: they come out of the .blend file, and a renamed
 * material there silently falls through to `FALLBACK_SURFACE` here.
 */
export interface SurfaceProps {
  roughness: number
  metalness: number
  envMapIntensity: number
  /** Only where the authored colour is wrong — otherwise `baseColorFactor` wins. */
  colorHex?: number
  emissiveHex?: number
  emissiveIntensity?: number
  /** For single-plane geometry, which vanishes when seen from behind. */
  isDoubleSided?: boolean
}

/**
 * Cloth is the largest surface on the figure and the least reflective thing on
 * it — but not fully matte. The jacket is authored at an albedo of about 0.04,
 * and a coloured rim light on a diffuse surface that dark returns almost
 * nothing; what separates the silhouette from the page is the specular lobe, so
 * the roughness has to stay short of the 0.9 the file asks for.
 */
const CLOTH: SurfaceProps = { roughness: 0.72, metalness: 0, envMapIntensity: 0.5 }

/**
 * The file exports everything double-sided. The disc alone is 93k triangles, so
 * that is a lot of fragment work for closed volumes that never show a backface —
 * only the genuinely flat pieces keep it.
 */
export const CHARACTER_SURFACES: Record<string, SurfaceProps> = {
  // --- Figure -------------------------------------------------------------
  Skin: { roughness: 0.72, metalness: 0, envMapIntensity: 0.35 },
  Lips: { roughness: 0.65, metalness: 0, envMapIntensity: 0.35 },
  Hair: { roughness: 0.85, metalness: 0, envMapIntensity: 0.25 },
  Beard: { roughness: 0.85, metalness: 0, envMapIntensity: 0.25 },
  // The one specular highlight in the face. Without it the eyes are two matte
  // dots and the whole head reads as a mannequin.
  Eyes: { roughness: 0.08, metalness: 0, envMapIntensity: 1.2, colorHex: 0x0b0a10 },

  Cap: CLOTH,
  Strap: CLOTH,
  Sweater: CLOTH,
  Jacket: CLOTH,
  Seams: CLOTH,
  Fleece: { roughness: 0.95, metalness: 0, envMapIntensity: 0.2 },
  Trousers: CLOTH,
  Shoes: { roughness: 0.55, metalness: 0, envMapIntensity: 0.45 },
  Soles: { roughness: 0.95, metalness: 0, envMapIntensity: 0.15 },
  // The only metal on the figure, so it is the only thing allowed to shine.
  Silver: { roughness: 0.22, metalness: 0.95, envMapIntensity: 1 },

  // --- Podium -------------------------------------------------------------
  'Material.003': { roughness: 0.35, metalness: 0.1, envMapIntensity: 0.6 },
  // The lamps around the rim, white as the file authored them. Pushed past 1 on
  // purpose: `bloom.ts` picks what glows by luminance, and only what exceeds 1
  // before tone mapping gets a halo. The base colour stays dark — emissive adds
  // on top of the lit surface, so a light grey base washes the whole thing out
  // instead of reading as a lamp.
  'Material.004': {
    roughness: 0.4,
    metalness: 0,
    envMapIntensity: 0.2,
    colorHex: 0x14121a,
    emissiveHex: 0xffffff,
    emissiveIntensity: 3.4
  },
  // The floor the figure stands on. White too, but deliberately just under the
  // bloom threshold: it is the largest single area in the scene, and a second
  // haloed surface that size pulls the eye off the character. The emissive has
  // to stay strong enough to out-argue the violet rim lights landing on it —
  // let them win and the floor goes pink.
  'Material.011': {
    roughness: 0.1,
    metalness: 0,
    envMapIntensity: 0.25,
    colorHex: 0x121118,
    emissiveHex: 0xffffff,
    emissiveIntensity: 0.92
  },

  // --- Mascots ------------------------------------------------------------
  // Clawd stays orange — see the palette exception in CLAUDE.md. Matte, so the
  // one warm hue on the page sits next to the violet instead of shouting over it.
  clawd: { roughness: 0.6, metalness: 0, envMapIntensity: 0.3 },
  'Material.001': { roughness: 0.5, metalness: 0, envMapIntensity: 0.3 },

  // --- Props --------------------------------------------------------------
  // The AirPods are the lightest thing in the scene, so they are also the first
  // to blow out — held back rather than let loose on the environment.
  plastic: { roughness: 0.28, metalness: 0, envMapIntensity: 0.45 },
  matt: { roughness: 0.25, metalness: 0.6, envMapIntensity: 0.7 },
  'Material.008': { roughness: 0.04, metalness: 0.3, envMapIntensity: 1.1 },
  'Material.005': { roughness: 0.04, metalness: 0.3, envMapIntensity: 1.1 },
  'Material.002': { roughness: 0.4, metalness: 0, envMapIntensity: 0.5 },
  'Material.009': { roughness: 0.6, metalness: 0, envMapIntensity: 0.35 },
  // Authored as pure blue. There is no blue in this palette — see CLAUDE.md.
  'Material.010': { roughness: 0.2, metalness: 0, envMapIntensity: 0.8, colorHex: DEV_HEX }
}

/**
 * Anything the table does not name, including the desk mat — which the file
 * exports with **no material at all** and which would otherwise render in
 * Three's default white, in the middle of the scene.
 */
export const FALLBACK_SURFACE: SurfaceProps = {
  roughness: 0.7,
  metalness: 0,
  envMapIntensity: 0.4,
  colorHex: 0x1a1626,
  isDoubleSided: true
}

/** Flat pieces that would disappear from behind if they were single-sided. */
export const DOUBLE_SIDED_MESHES = new Set(['Cube.024', '05_Face', '05_Face.002'])

export const getSurface = (materialName: string): SurfaceProps =>
  CHARACTER_SURFACES[materialName] ?? FALLBACK_SURFACE

const asStandardMaterial = (material: Material | Material[]): MeshStandardMaterial | null => {
  const single = Array.isArray(material) ? material[0] : material
  return single instanceof MeshStandardMaterial ? single : null
}

/** Builds the replacement material for one authored slot. */
const createSurfaceMaterial = (
  source: MeshStandardMaterial | null,
  surface: SurfaceProps,
  environmentTexture: Texture | null,
  isDoubleSided: boolean
): MeshStandardMaterial => {
  const material = new MeshStandardMaterial({
    roughness: surface.roughness,
    metalness: surface.metalness,
    envMap: environmentTexture,
    envMapIntensity: surface.envMapIntensity,
    side: isDoubleSided || surface.isDoubleSided ? DoubleSide : FrontSide
  })

  // Blender keeps the colour: the authored base colour is copied over unless
  // the table names a replacement.
  if (surface.colorHex !== undefined) material.color.setHex(surface.colorHex)
  else if (source?.color) material.color.copy(source.color)

  if (surface.emissiveHex !== undefined) {
    material.emissive.setHex(surface.emissiveHex)
    material.emissiveIntensity = surface.emissiveIntensity ?? 1
  }

  return material
}

export interface SurfacePassProps {
  /** One material per authored slot, shared by every mesh that used it. */
  materials: Map<string, MeshStandardMaterial>
  /** The emissive slots and the intensity the table authored, for theme scaling. */
  emissive: { material: MeshStandardMaterial; baseIntensity: number }[]
  /**
   * Meshes grouped by the material name the **file** gave them.
   *
   * The only chance to record that: a moment later every mesh carries a shared
   * replacement whose name says nothing. The hero uses it to find the mascots.
   */
  byMaterialName: Map<string, Mesh[]>
  dispose: () => void
}

/**
 * Swaps every authored material on a loaded model for one built from the table.
 *
 * Both scenes do exactly this, so it lives here rather than twice. The originals
 * are disposed as they are replaced — a GLTF material holds GPU state whether
 * anything still points at it or not.
 */
export const applyCharacterSurfaces = (
  root: Object3D,
  environmentTexture: Texture | null
): SurfacePassProps => {
  const materials = new Map<string, MeshStandardMaterial>()
  const emissive: SurfacePassProps['emissive'] = []
  const byMaterialName = new Map<string, Mesh[]>()

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return

    const source = asStandardMaterial(object.material)
    const name = source?.name ?? ''

    const seen = byMaterialName.get(name)
    if (seen) seen.push(object)
    else byMaterialName.set(name, [object])

    const isDoubleSided = DOUBLE_SIDED_MESHES.has(object.name)
    const key = `${name}::${isDoubleSided}`

    let material = materials.get(key)
    if (!material) {
      const surface = getSurface(name)
      material = createSurfaceMaterial(source, surface, environmentTexture, isDoubleSided)
      materials.set(key, material)

      if (surface.emissiveHex !== undefined) {
        emissive.push({ material, baseIntensity: surface.emissiveIntensity ?? 1 })
      }
    }

    object.material = material
    source?.dispose()
  })

  const dispose = (): void => {
    materials.forEach((material) => material.dispose())
    materials.clear()
    emissive.length = 0
    byMaterialName.clear()
  }

  return { materials, emissive, byMaterialName, dispose }
}
