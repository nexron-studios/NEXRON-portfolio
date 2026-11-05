const BROWSER_DEFAULT_REM_PX = 16

/**
 * How much the page has grown past the 1920 layout (see `html` in `main.css`).
 * Canvas art is drawn in px the root font size does not reach, so a dot or
 * glyph has to multiply by this to stay the same share of the picture. Read it
 * when sizing, not per frame: it forces a style pass.
 */
export const pageScale = (): number =>
  parseFloat(getComputedStyle(document.documentElement).fontSize) / BROWSER_DEFAULT_REM_PX
