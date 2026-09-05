/**
 * Mixing two colours, by hand.
 *
 * CSS can do this with `color-mix()`, and everywhere a stylesheet is involved
 * that is what should be used. A canvas cannot: `fillStyle` and gradient stops
 * go through the browser's colour parser, and `color-mix()` is not reliably
 * accepted there — where it is refused the assignment is dropped silently and
 * the previous fill is used instead, which shows up as one shape wearing
 * another's colour rather than as an error.
 *
 * Kept to hex in, `rgb()` out: the palette tokens this reads are hex in both
 * themes, and anything else is handed back untouched rather than guessed at.
 */

export interface RgbProps {
  red: number
  green: number
  blue: number
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/** `#8b5cf6` or `#abc` to channels. Null for anything else. */
export const parseHex = (value: string): RgbProps | null => {
  const match = HEX_PATTERN.exec(value.trim())
  if (!match) return null

  const digits = match[1] ?? ''
  const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits

  return {
    red: Number.parseInt(full.slice(0, 2), 16),
    green: Number.parseInt(full.slice(2, 4), 16),
    blue: Number.parseInt(full.slice(4, 6), 16)
  }
}

const clampChannel = (value: number): number => Math.max(0, Math.min(255, Math.round(value)))

export const toRgbString = ({ red, green, blue }: RgbProps, alpha = 1): string =>
  alpha >= 1
    ? `rgb(${clampChannel(red)} ${clampChannel(green)} ${clampChannel(blue)})`
    : `rgb(${clampChannel(red)} ${clampChannel(green)} ${clampChannel(blue)} / ${alpha})`

/**
 * Moves a colour towards white (`amount > 0`) or black (`amount < 0`), where 1
 * is all the way. A colour that cannot be parsed comes back unchanged, so a
 * token in an unexpected format costs a highlight, not the whole block.
 */
export const shade = (color: string, amount: number, alpha = 1): string => {
  const rgb = parseHex(color)
  if (!rgb) return color

  const target = amount >= 0 ? 255 : 0
  const strength = Math.min(1, Math.abs(amount))

  return toRgbString(
    {
      red: rgb.red + (target - rgb.red) * strength,
      green: rgb.green + (target - rgb.green) * strength,
      blue: rgb.blue + (target - rgb.blue) * strength
    },
    alpha
  )
}
