import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { skillIcons } from '@/data/skillIcons'
import { atlasGridSize, atlasTile } from '@/utils/iconAtlas'

/**
 * Every skill mark drawn onto one canvas, handed to Three as a single texture.
 *
 * One texture and one upload, rather than 25. Each cube then takes a clone with
 * its own `offset` / `repeat` — clones share the underlying source, so the
 * image still reaches the GPU exactly once.
 *
 * The tiles are a white mark on a black ground, and the sheet is bound as an
 * `emissiveMap` rather than as `map`. `map` multiplies the base colour, which
 * on a metal reads as dirt on the chrome; emission adds instead — black emits
 * nothing and leaves the reflection alone, white lights the mark up. That is
 * also what keeps `setTheme` a colour assignment instead of a canvas redraw.
 */

/**
 * Tile resolution. 192 rather than 128 because the detailed marks — PostgreSQL,
 * scikit-learn — carry lettering of their own that turned to mush at the
 * smaller size.
 */
const TILE_PX = 192
/** Fraction of the tile the mark occupies. The rest is the ground it sits on. */
const MARK_INSET = 0.66
/** Default authoring box. Lucide and simple-icons both use 24; devicon uses 128. */
const ICON_VIEWBOX = 24
/** Lucide's own stroke width, in the 24-unit space the paths are authored in. */
const GLYPH_STROKE_WIDTH = 2
/** Monograms are set larger than a glyph: two letters have to carry the tile. */
const TEXT_SIZE_RATIO = 0.46
const TEXT_FONT_STACK = "'Geist Mono Variable', ui-monospace, monospace"

const GROUND_FILL = '#000000'
const MARK_FILL = '#ffffff'

export interface SkillAtlasProps {
  texture: CanvasTexture
  /** Side length in tiles — what `atlasTile` needs to place an index. */
  gridSize: number
}

/**
 * A monogram, centred in the tile.
 *
 * The mono face is the one the page already loads. Should it not be ready when
 * the atlas is built, the stack falls through to the platform's monospace — two
 * letters in the wrong face still say which tool it is, which a missing tile
 * would not.
 */
const drawText = (context: CanvasRenderingContext2D, label: string): void => {
  const available = TILE_PX * MARK_INSET

  context.save()
  context.fillStyle = MARK_FILL
  context.font = `600 ${TILE_PX * TEXT_SIZE_RATIO}px ${TEXT_FONT_STACK}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  // Two letters fit at the nominal size; a longer name has to come down to
  // stay inside the tile rather than run off both edges.
  const width = context.measureText(label).width
  if (width > available) {
    const fitted = TILE_PX * TEXT_SIZE_RATIO * (available / width)
    context.font = `600 ${fitted}px ${TEXT_FONT_STACK}`
  }

  context.fillText(label, TILE_PX / 2, TILE_PX / 2)
  context.restore()
}

const drawIcon = (context: CanvasRenderingContext2D, name: string): void => {
  const icon = skillIcons[name]
  if (!icon) return

  if (icon.mode === 'text') {
    drawText(context, icon.label)
    return
  }

  const drawn = TILE_PX * MARK_INSET
  const scale = drawn / (icon.viewBox ?? ICON_VIEWBOX)
  const margin = (TILE_PX - drawn) / 2

  context.save()
  context.translate(margin, margin)
  context.scale(scale, scale)

  const subpaths = Array.isArray(icon.d) ? icon.d : [icon.d as string]

  subpaths.forEach((subpath) => {
    const path = new Path2D(subpath)

    if (icon.mode === 'fill') {
      context.fillStyle = MARK_FILL
      context.fill(path)
      return
    }

    context.strokeStyle = MARK_FILL
    // The transform scales the line width with everything else, so this stays
    // the authored value rather than a number computed against the tile size.
    context.lineWidth = GLYPH_STROKE_WIDTH
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke(path)
  })

  context.restore()
}

/**
 * Returns `null` when a 2D context cannot be had — a headless run, or a
 * browser refusing the canvas. The pit then renders plain coloured cubes,
 * which is the previous behaviour rather than a broken scene.
 */
export const createSkillAtlas = (names: string[]): SkillAtlasProps | null => {
  const gridSize = atlasGridSize(names.length)
  const canvas = document.createElement('canvas')
  canvas.width = gridSize * TILE_PX
  canvas.height = gridSize * TILE_PX

  const context = canvas.getContext('2d')
  if (!context) return null

  // Ground the whole sheet, including any tile left over by a non-square
  // count. Opaque black rather than the transparent black a fresh canvas
  // starts as: an emissive map is read per channel, and leaving the alpha at
  // zero is a difference no renderer has to honour the same way twice.
  context.fillStyle = GROUND_FILL
  context.fillRect(0, 0, canvas.width, canvas.height)

  names.forEach((name, index) => {
    const tile = atlasTile(index, gridSize)

    context.save()
    context.translate(tile.column * TILE_PX, tile.row * TILE_PX)
    drawIcon(context, name)
    context.restore()
  })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  // No mipmaps: a reduced level averages neighbouring tiles together, and each
  // cube would pick up a smear of the logos next to it as the pit moves away.
  texture.generateMipmaps = false
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter

  return { texture, gridSize }
}
