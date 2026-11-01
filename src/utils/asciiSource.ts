import { levelsOf } from '@/utils/ascii'

/**
 * The two canvas steps that turn a source picture into levels for
 * `AsciiArt`. They need a DOM (an offscreen canvas) but hold no state.
 */

/** The source at its own size, blurred by `softness` px; null without a 2D context. */
export const softenImage = (
  image: HTMLImageElement,
  softness: number
): HTMLCanvasElement | null => {
  const soft = document.createElement('canvas')
  soft.width = image.naturalWidth
  soft.height = image.naturalHeight
  const softContext = soft.getContext('2d')
  if (!softContext) return null
  softContext.filter = `blur(${softness}px)`
  softContext.drawImage(image, 0, 0)
  return soft
}

/** Shrinks the softened source to `columns` × `lines` pixels, one level each. */
export const probeLevels = (
  soft: HTMLCanvasElement,
  columns: number,
  lines: number,
  white: number
): Float32Array<ArrayBuffer> => {
  const probe = document.createElement('canvas')
  probe.width = columns
  probe.height = lines
  const probeContext = probe.getContext('2d', { willReadFrequently: true })
  if (!probeContext) return new Float32Array(columns * lines)
  probeContext.imageSmoothingQuality = 'high'
  probeContext.drawImage(soft, 0, 0, columns, lines)
  return levelsOf(probeContext.getImageData(0, 0, columns, lines).data, white)
}

/** The colours an ASCII picture paints with. */
export interface ArtPaletteProps {
  ink: string
  violet: string
  outline: string
  /** The glint: a soft step lighter than the angels' grey, never full white. */
  shine: string
}

/** Fallbacks until the tokens are read: the values of `tokens.css`. */
export const DEFAULT_PALETTE: ArtPaletteProps = {
  ink: '#f3f3f1',
  violet: '#8b5cf6',
  outline: '#4a4a48',
  shine: '#c4c4c2'
}

/** Reads the palette from the tokens as they apply to `element`. */
export const readPalette = (element: HTMLElement): ArtPaletteProps => {
  const style = getComputedStyle(element)
  const page = getComputedStyle(document.documentElement)
  const read = (from: CSSStyleDeclaration, token: string, fallback: string): string =>
    from.getPropertyValue(token).trim() || fallback
  return {
    ink: read(style, '--color-ink', DEFAULT_PALETTE.ink),
    violet: read(style, '--color-violet', DEFAULT_PALETTE.violet),
    outline: read(style, '--color-ink-dim', DEFAULT_PALETTE.outline),
    shine: read(page, '--color-ink-muted', DEFAULT_PALETTE.shine)
  }
}
