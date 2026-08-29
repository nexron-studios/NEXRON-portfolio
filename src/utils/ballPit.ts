/**
 * 2D ball-pit physics, as pure functions.
 *
 * The tech-stack scene is a pit of balls falling into four walled chambers.
 * That needs collisions, not a spring field, but it does not need a physics
 * engine either — the whole simulation is circles in a box, which is a few
 * hundred lines of arithmetic and no dependency.
 *
 * Everything here is plain maths on plain objects: no Three.js, no Vue, no
 * time source. `three/skillPit.ts` owns the meshes and calls `stepBodies`
 * once per frame.
 *
 * Coordinates are scene units with y pointing up, so gravity is negative.
 */

export interface BodyProps {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  /** Which chamber the body is confined to — it can never cross a wall. */
  chamber: number
}

export interface ChamberBoundsProps {
  left: number
  right: number
  floor: number
}

export interface StepOptionsProps {
  gravity: number
  /** Velocity retained per second of contact with a wall or floor. */
  restitution: number
  /** Velocity retained per second in free flight. */
  damping: number
  /** Seconds. Callers must clamp this — see `MAX_DELTA`. */
  delta: number
  /**
   * Relaxation passes per frame. One pass separates a pair but immediately
   * re-overlaps it against the next one, so a settled stack visibly sinks into
   * itself; a handful of passes is what makes a pile look like solid balls.
   */
  iterations?: number
}

const DEFAULT_ITERATIONS = 4

/**
 * A long frame (tab was backgrounded, a GC pause) would otherwise let a body
 * tunnel through a wall. Clamping the step is cheaper and steadier than
 * sub-stepping for a decorative pit.
 */
export const MAX_DELTA = 1 / 30

export const clampDelta = (delta: number): number => Math.min(Math.max(delta, 0), MAX_DELTA)

/** Squared distance — used everywhere the actual distance is not needed. */
export const distanceSquared = (a: BodyProps, b: BodyProps): number => {
  const dx = b.x - a.x
  const dy = b.y - a.y

  return dx * dx + dy * dy
}

export const areOverlapping = (a: BodyProps, b: BodyProps): boolean => {
  const reach = a.radius + b.radius

  return distanceSquared(a, b) < reach * reach
}

/**
 * Pushes two overlapping bodies apart and swaps the component of their
 * velocities along the contact normal. Equal mass, so the exchange is a plain
 * swap scaled by restitution. Mutates both bodies — this runs per pair per
 * frame, and allocating a result object here shows up in a profile.
 */
export const resolvePair = (a: BodyProps, b: BodyProps, restitution: number): boolean => {
  if (a.chamber !== b.chamber) return false

  const dx = b.x - a.x
  const dy = b.y - a.y
  const reach = a.radius + b.radius
  const distanceSq = dx * dx + dy * dy

  if (distanceSq >= reach * reach) return false

  // Two bodies spawned exactly on top of each other have no normal to push
  // along; nudge them apart on x and let the next frame separate them.
  if (distanceSq === 0) {
    a.x -= reach * 0.5
    b.x += reach * 0.5
    return true
  }

  const distance = Math.sqrt(distanceSq)
  const nx = dx / distance
  const ny = dy / distance
  const overlap = (reach - distance) * 0.5

  a.x -= nx * overlap
  a.y -= ny * overlap
  b.x += nx * overlap
  b.y += ny * overlap

  const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
  if (relative > 0) return true

  const impulse = -(1 + restitution) * relative * 0.5

  a.vx -= impulse * nx
  a.vy -= impulse * ny
  b.vx += impulse * nx
  b.vy += impulse * ny

  return true
}

/**
 * Position-only separation: pushes two overlapping bodies apart without
 * touching their velocities.
 *
 * The relaxation passes after the first use this. Running the full impulse
 * response several times in one frame would apply the bounce once per pass and
 * inject energy, so a settled pile would slowly start to simmer.
 */
export const separatePair = (a: BodyProps, b: BodyProps): boolean => {
  if (a.chamber !== b.chamber) return false

  const dx = b.x - a.x
  const dy = b.y - a.y
  const reach = a.radius + b.radius
  const distanceSq = dx * dx + dy * dy

  if (distanceSq >= reach * reach) return false

  if (distanceSq === 0) {
    a.x -= reach * 0.5
    b.x += reach * 0.5
    return true
  }

  const distance = Math.sqrt(distanceSq)
  const overlap = (reach - distance) * 0.5

  a.x -= (dx / distance) * overlap
  a.y -= (dy / distance) * overlap
  b.x += (dx / distance) * overlap
  b.y += (dy / distance) * overlap

  return true
}

/** Keeps a body inside its chamber, bouncing off the walls and the floor. */
export const constrainToChamber = (
  body: BodyProps,
  bounds: ChamberBoundsProps,
  restitution: number
): void => {
  const minX = bounds.left + body.radius
  const maxX = bounds.right - body.radius

  // A chamber narrower than one ball would flip min and max and shoot the
  // body out; park it in the middle instead.
  if (minX >= maxX) {
    body.x = (bounds.left + bounds.right) * 0.5
    body.vx = 0
  } else if (body.x < minX) {
    body.x = minX
    body.vx = Math.abs(body.vx) * restitution
  } else if (body.x > maxX) {
    body.x = maxX
    body.vx = -Math.abs(body.vx) * restitution
  }

  const floor = bounds.floor + body.radius

  if (body.y < floor) {
    body.y = floor
    body.vy = Math.abs(body.vy) * restitution
    // Ground friction, or a ball dropped in a corner slides forever.
    body.vx *= 0.92
  }
}

/**
 * Pushes bodies away from a point, falling off with distance. Used both for
 * the cursor (gentle, continuous) and for a click (sharp, one frame).
 */
export const applyRadialImpulse = (
  bodies: BodyProps[],
  x: number,
  y: number,
  radius: number,
  strength: number
): void => {
  const radiusSq = radius * radius

  for (const body of bodies) {
    const dx = body.x - x
    const dy = body.y - y
    const distanceSq = dx * dx + dy * dy

    if (distanceSq > radiusSq || distanceSq === 0) continue

    const distance = Math.sqrt(distanceSq)
    const falloff = 1 - distance / radius

    body.vx += (dx / distance) * falloff * strength
    body.vy += (dy / distance) * falloff * strength
  }
}

/**
 * Advances every body, then resolves collisions.
 *
 * Pairs are found with a uniform grid keyed on cell size rather than by
 * testing all pairs: at ~30 balls the difference is small, but the grid keeps
 * the cost flat if the pit ever grows.
 */
export const stepBodies = (
  bodies: BodyProps[],
  chambers: ChamberBoundsProps[],
  options: StepOptionsProps
): void => {
  const delta = clampDelta(options.delta)
  if (delta === 0) return

  const drag = Math.pow(options.damping, delta)

  for (const body of bodies) {
    body.vy += options.gravity * delta
    body.vx *= drag
    body.vy *= drag
    body.x += body.vx * delta
    body.y += body.vy * delta
  }

  // Walls are re-applied inside the loop, not once at the end: a pair pushed
  // apart on the last pass would otherwise be left sticking through a wall.
  const iterations = Math.max(1, options.iterations ?? DEFAULT_ITERATIONS)

  for (let pass = 0; pass < iterations; pass += 1) {
    for (const pair of findCandidatePairs(bodies)) {
      if (pass === 0) resolvePair(pair[0], pair[1], options.restitution)
      else separatePair(pair[0], pair[1])
    }

    for (const body of bodies) {
      const bounds = chambers[body.chamber]
      if (!bounds) continue
      // Only the first pass bounces; the rest just put the body back inside.
      constrainToChamber(body, bounds, pass === 0 ? options.restitution : 0)
    }
  }
}

/**
 * Broad phase: bins bodies into a uniform grid and returns only the pairs
 * sharing a cell or a neighbouring one. Cell size is the largest diameter, so
 * two touching bodies can never land more than one cell apart.
 */
export const findCandidatePairs = (bodies: BodyProps[]): [BodyProps, BodyProps][] => {
  if (bodies.length < 2) return []

  let cellSize = 0
  for (const body of bodies) {
    cellSize = Math.max(cellSize, body.radius * 2)
  }
  if (cellSize === 0) return []

  // Bin indices, not bodies: the dedupe below needs an ordering, and looking
  // an index back up with `indexOf` per pair would make this O(n²) again —
  // exactly what the grid is here to avoid.
  const grid = new Map<string, number[]>()

  bodies.forEach((body, index) => {
    const key = `${Math.floor(body.x / cellSize)}:${Math.floor(body.y / cellSize)}`
    const bucket = grid.get(key)
    if (bucket) bucket.push(index)
    else grid.set(key, [index])
  })

  const pairs: [BodyProps, BodyProps][] = []

  bodies.forEach((body, index) => {
    const cellX = Math.floor(body.x / cellSize)
    const cellY = Math.floor(body.y / cellSize)

    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        const bucket = grid.get(`${cellX + offsetX}:${cellY + offsetY}`)
        if (!bucket) continue

        for (const otherIndex of bucket) {
          // Only the lower index emits the pair, which dedupes without a set.
          if (otherIndex <= index) continue

          const other = bodies[otherIndex]
          if (other) pairs.push([body, other])
        }
      }
    }
  })

  return pairs
}

/**
 * Splits a width into `count` chambers separated by walls of `wallWidth`,
 * centred on zero. Returns the inner bounds each chamber's bodies live in.
 */
export const layoutChambers = (
  width: number,
  floor: number,
  count: number,
  wallWidth: number
): ChamberBoundsProps[] => {
  if (count <= 0) return []

  const totalWalls = wallWidth * (count - 1)
  const chamberWidth = (width - totalWalls) / count
  const start = -width / 2

  return Array.from({ length: count }, (_, index) => {
    const left = start + index * (chamberWidth + wallWidth)

    return { left, right: left + chamberWidth, floor }
  })
}
