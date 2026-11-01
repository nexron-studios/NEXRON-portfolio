export interface StarProps {
  x: number
  y: number
  /** 0 far, 1 middle, 2 near. */
  depth: number
  glyph: string
  /** 0.4…1, multiplied into the depth's alpha. */
  brightness: number
  isAccent: boolean
}

/** Mostly dots, now and then a cross or a spark; the rare one is the event. */
const GLYPHS = ['.', '.', '.', '·', '·', ':', '+', '*', '✦'] as const
const ACCENT_SHARE = 0.06

/**
 * A field of stars for a `width` × `height` viewport, `density` per square
 * pixel. `random` is injected so the scatter is testable and stable.
 */
export const scatterStars = (
  width: number,
  height: number,
  density: number,
  random: () => number
): StarProps[] => {
  const count = Math.max(0, Math.round(width * height * density))
  return Array.from({ length: count }, () => {
    const depthRoll = random()
    const depth = depthRoll < 0.55 ? 0 : depthRoll < 0.85 ? 1 : 2
    return {
      x: random() * width,
      y: random() * height,
      depth,
      glyph: GLYPHS[Math.floor(random() * GLYPHS.length)]!,
      brightness: 0.4 + random() * 0.6,
      isAccent: random() < ACCENT_SHARE
    }
  })
}

/** A shooting star: where it starts, how far it travels, when and how long. */
export interface Meteor {
  x: number
  y: number
  dx: number
  dy: number
  /** Seconds, on the same clock as the frame time. */
  start: number
  duration: number
}

/**
 * A shooting star that starts in the upper half of the sky and falls
 * diagonally, left or right, across about a third of it.
 */
export const spawnMeteor = (
  width: number,
  height: number,
  start: number,
  random: () => number
): Meteor => {
  const direction = random() < 0.5 ? -1 : 1
  const angle = ((18 + random() * 22) * Math.PI) / 180
  const distance = Math.max(width, height) * (0.25 + random() * 0.2)
  return {
    x: width * (0.15 + random() * 0.7),
    y: height * random() * 0.5,
    dx: Math.cos(angle) * distance * direction,
    dy: Math.sin(angle) * distance,
    start,
    duration: 0.7 + random() * 0.5
  }
}

/** 0 → 1 → 0 over `duration`: a fast rise and a slow fade, so it reads as a flash. */
export const pulse = (age: number, duration: number): number => {
  if (age <= 0 || age >= duration) return 0
  const t = age / duration
  return t < 0.2 ? t / 0.2 : ((1 - t) / 0.8) ** 2
}
