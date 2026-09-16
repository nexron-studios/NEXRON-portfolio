/**
 * 2D ball-pit physics, as pure functions.
 *
 * The tech-stack scene is a pit of blocks falling into four walled chambers.
 * That needs collisions, not a spring field, but it does not need a physics
 * engine either: the whole simulation is a few hundred lines of arithmetic and
 * no dependency.
 *
 * Everything here is plain maths on plain objects: no Three.js, no Vue, no
 * time source. `three/skillPit.ts` owns the meshes and calls `stepBodies`
 * once per frame.
 *
 * A body is a circle unless it carries `halfExtent`, in which case it collides
 * as the rotated square it is drawn as. Bodies that stop moving fall asleep and
 * are not integrated again until something hits them: that, and not any amount
 * of damping, is what lets a settled pile hold perfectly still.
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
  /**
   * Half the side of the square the body is *drawn* as, when it is drawn as
   * one. Set it and the body collides as that square, rotated by `angle`,
   * against walls, floor and other squares.
   *
   * The pit draws cubes, and a cube's corner reaches a fifth further than the
   * circle the solver used to keep clear — which is exactly the overlap that
   * showed on a settled pile. Switching to squares only at rest fixed the pile
   * and broke the landing: the reach jumped between the two models at the
   * threshold and every block on its way down took a visible hop. The rotated
   * square is right in every pose, so there is nothing to switch.
   */
  halfExtent?: number
  /** Rotation of that square in the simulation plane, in radians. `0` if unset. */
  angle?: number
  /**
   * Frames in a row the body has spent under `settleSpeed`. Past
   * `SLEEP_AFTER_FRAMES` it is asleep: not integrated, velocity zero, and
   * immovable to anything slower than a real hit. Managed by `stepBodies`.
   */
  sleepFrames?: number
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
   * itself; a handful of passes is what makes a pile look like solid blocks.
   */
  iterations?: number
  /**
   * Below this combined speed a body counts as at rest and starts falling
   * asleep. Without it nothing ever sleeps and a pile simmers forever on the
   * per-frame restitution bounce.
   */
  settleSpeed?: number
  /**
   * Extra condition a body has to meet before it may sleep, on top of being
   * slow. The pit uses it to keep a block awake until it has snapped upright:
   * the snap is kinematic and changes the square the solver collides, so a
   * block that slept mid-turn would be woken by its own straightening every
   * frame — and one that finished turning while asleep would sink into its
   * neighbour unresolved.
   */
  canSleep?: (body: BodyProps) => boolean
}

const DEFAULT_ITERATIONS = 6

/**
 * A long frame (tab was backgrounded, a GC pause) would otherwise let a body
 * tunnel through a wall. Clamping the step is cheaper and steadier than
 * sub-stepping for a decorative pit.
 */
export const MAX_DELTA = 1 / 30

/**
 * Frames under `settleSpeed` before a body sleeps. Longer than a block needs to
 * come down from its circle contact onto the floor as a square (~7 frames), so
 * nothing dozes off while still visibly sinking into place.
 */
export const SLEEP_AFTER_FRAMES = 20

/**
 * A positional correction larger than this wakes a sleeping body. Below it the
 * push is a rounding residue of the relaxation and moving a whole pile for it
 * would be the jitter this exists to remove.
 */
const WAKE_DISTANCE = 0.02

/** Ground friction, or a block dropped in a corner slides forever. */
const FLOOR_FRICTION = 0.92

export const clampDelta = (delta: number): number => Math.min(Math.max(delta, 0), MAX_DELTA)

/** Squared distance — used everywhere the actual distance is not needed. */
export const distanceSquared = (a: BodyProps, b: BodyProps): number => {
  const dx = b.x - a.x
  const dy = b.y - a.y

  return dx * dx + dy * dy
}

/** Circle overlap. The circle is the body's coarse bound whatever it is drawn as. */
export const areOverlapping = (a: BodyProps, b: BodyProps): boolean => {
  const reach = a.radius + b.radius

  return distanceSquared(a, b) < reach * reach
}

/**
 * `a`'s share of the push when a pair is separated, from the two radii.
 *
 * Mass in 2D goes with area, so the weights are `r²` and the heavier body moves
 * less. A flat 50/50 split let a large block resting on small ones be shoved out
 * as easily as it shoved, which is why a loaded stack never converged and kept a
 * little interpenetration however many passes it got.
 *
 * Equal radii give exactly 0.5, so the common case is unchanged.
 */
export const pushShare = (a: BodyProps, b: BodyProps): number => {
  const massA = a.radius * a.radius
  const massB = b.radius * b.radius
  const total = massA + massB

  return total === 0 ? 0.5 : massB / total
}

/** True when a body is slow enough to be treated as settled. */
export const isSettled = (body: BodyProps, settleSpeed: number): boolean =>
  Math.abs(body.vx) + Math.abs(body.vy) < settleSpeed

export const isAsleep = (body: BodyProps): boolean => (body.sleepFrames ?? 0) >= SLEEP_AFTER_FRAMES

export const wake = (body: BodyProps): void => {
  body.sleepFrames = 0
}

const isSquare = (body: BodyProps): boolean => body.halfExtent !== undefined

/**
 * How far the body reaches from its centre along a unit axis `(nx, ny)`: the
 * radius for a circle, the projected half-diagonal for a rotated square.
 */
export const reachAlong = (body: BodyProps, nx: number, ny: number): number => {
  if (body.halfExtent === undefined) return body.radius

  const angle = body.angle ?? 0
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  // The square's own axes, projected onto n. Both contribute their absolute
  // share, which is what makes a 45° square reach √2 times its half-side.
  return body.halfExtent * (Math.abs(nx * cos + ny * sin) + Math.abs(-nx * sin + ny * cos))
}

/** The furthest any point of the body gets from its centre, in any direction. */
export const outerReach = (body: BodyProps): number =>
  body.halfExtent === undefined ? body.radius : body.halfExtent * Math.SQRT2

/**
 * Where two bodies touch: the unit normal from `a` to `b` and how deep they
 * interpenetrate along it. Null when they do not.
 */
export interface ContactProps {
  nx: number
  ny: number
  depth: number
}

const circleContact = (a: BodyProps, b: BodyProps): ContactProps | null => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const reach = a.radius + b.radius
  const distanceSq = dx * dx + dy * dy

  if (distanceSq >= reach * reach) return null

  // Two bodies spawned exactly on top of each other have no normal to push
  // along; pick x and let the next frame sort it out.
  if (distanceSq === 0) return { nx: 1, ny: 0, depth: reach }

  const distance = Math.sqrt(distanceSq)

  return { nx: dx / distance, ny: dy / distance, depth: reach - distance }
}

/**
 * Separating-axis test for two rotated squares.
 *
 * Each square contributes its two edge normals; the pair overlaps only if it
 * overlaps on all four. The axis with the *least* overlap is the shortest way
 * out and becomes the contact normal — a block on a stack then slides off a
 * neighbour sideways instead of being launched up through it.
 */
const squareContact = (a: BodyProps, b: BodyProps): ContactProps | null => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  let best: ContactProps | null = null

  for (const body of [a, b]) {
    const angle = body.angle ?? 0
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    for (const [axisX, axisY] of [
      [cos, sin],
      [-sin, cos]
    ] as const) {
      const distance = dx * axisX + dy * axisY
      const overlap = reachAlong(a, axisX, axisY) + reachAlong(b, axisX, axisY) - Math.abs(distance)

      if (overlap <= 0) return null
      if (best && overlap >= best.depth) continue

      const sign = distance < 0 ? -1 : 1
      best = { nx: axisX * sign, ny: axisY * sign, depth: overlap }
    }
  }

  return best
}

export const contactOf = (a: BodyProps, b: BodyProps): ContactProps | null =>
  isSquare(a) && isSquare(b) ? squareContact(a, b) : circleContact(a, b)

/**
 * How the push splits between two bodies, with sleep taken into account.
 *
 * A sleeping body is treated as immovable: the awake one takes the whole
 * correction, the way it would against a wall. Otherwise the pile under a
 * settling block would be nudged every frame by the block's own creep, and a
 * pile that is nudged never sleeps.
 */
const shareOf = (a: BodyProps, b: BodyProps): number => {
  const aAsleep = isAsleep(a)
  const bAsleep = isAsleep(b)

  if (aAsleep && !bAsleep) return 0
  if (bAsleep && !aAsleep) return 1

  return pushShare(a, b)
}

const pushApart = (a: BodyProps, b: BodyProps, contact: ContactProps, shareA: number): void => {
  const moveA = contact.depth * shareA
  const moveB = contact.depth * (1 - shareA)

  a.x -= contact.nx * moveA
  a.y -= contact.ny * moveA
  b.x += contact.nx * moveB
  b.y += contact.ny * moveB

  if (moveA > WAKE_DISTANCE) wake(a)
  if (moveB > WAKE_DISTANCE) wake(b)
}

/**
 * Pushes two overlapping bodies apart and exchanges the component of their
 * velocities along the contact normal, both weighted by mass — see `pushShare`.
 * Mutates both bodies: this runs per pair per frame, and allocating a result
 * object here shows up in a profile.
 *
 * `settleSpeed`, when given, is the approach speed that counts as a real hit:
 * faster than that bounces with `restitution` and wakes a sleeping partner.
 * Slower is a resting contact and is resolved without any bounce at all. That
 * is what stops a pile simmering: gravity presses two resting blocks together
 * every frame, and a bounce on every one of those contacts is energy from
 * nowhere — enough to keep a block wedged against a wall rattling forever.
 */
export const resolvePair = (
  a: BodyProps,
  b: BodyProps,
  restitution: number,
  settleSpeed?: number
): boolean => {
  if (a.chamber !== b.chamber) return false
  if (isAsleep(a) && isAsleep(b)) return false

  const contact = contactOf(a, b)
  if (!contact) return false

  const relative = (b.vx - a.vx) * contact.nx + (b.vy - a.vy) * contact.ny

  const isHit = settleSpeed === undefined || -relative > settleSpeed

  if (isHit && settleSpeed !== undefined) {
    wake(a)
    wake(b)
  }

  const shareA = shareOf(a, b)
  pushApart(a, b, contact, shareA)

  if (relative > 0) return true

  // Same mass weighting as the positional push, so the lighter body takes more
  // of the bounce. At equal radii both shares are 0.5 and this is a plain swap.
  const bounce = isHit ? restitution : 0
  const impulseA = -(1 + bounce) * relative * shareA
  const impulseB = -(1 + bounce) * relative * (1 - shareA)

  a.vx -= impulseA * contact.nx
  a.vy -= impulseA * contact.ny
  b.vx += impulseB * contact.nx
  b.vy += impulseB * contact.ny

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
  if (isAsleep(a) && isAsleep(b)) return false

  const contact = contactOf(a, b)
  if (!contact) return false

  pushApart(a, b, contact, shareOf(a, b))

  return true
}

/**
 * Keeps a body inside its chamber, bouncing off the walls and the floor.
 *
 * A square-drawn body meets them with its actual extent in that direction: an
 * upright block sits flat on its face, one lying on a corner sits on the
 * corner. On circles alone a settled block hovered a fraction of a radius above
 * the floor and stood off each wall by the same amount.
 *
 * `restingSpeed` is the same threshold as `resolvePair` uses: slower than that
 * the wall or floor simply stops the body instead of bouncing it. Without it a
 * block pressed into a wall by its neighbour bounces off it every frame.
 */
export const constrainToChamber = (
  body: BodyProps,
  bounds: ChamberBoundsProps,
  restitution: number,
  restingSpeed = 0
): void => {
  const bounceX = Math.abs(body.vx) > restingSpeed ? restitution : 0
  const bounceY = Math.abs(body.vy) > restingSpeed ? restitution : 0

  const halfWidth = reachAlong(body, 1, 0)
  const halfHeight = reachAlong(body, 0, 1)

  const minX = bounds.left + halfWidth
  const maxX = bounds.right - halfWidth

  // A chamber narrower than one body would flip min and max and shoot the
  // body out; park it in the middle instead.
  if (minX >= maxX) {
    body.x = (bounds.left + bounds.right) * 0.5
    body.vx = 0
  } else if (body.x < minX) {
    body.x = minX
    body.vx = Math.abs(body.vx) * bounceX
  } else if (body.x > maxX) {
    body.x = maxX
    body.vx = -Math.abs(body.vx) * bounceX
  }

  const floor = bounds.floor + halfHeight

  if (body.y < floor) {
    body.y = floor
    body.vy = Math.abs(body.vy) * bounceY
    body.vx *= FLOOR_FRICTION
  }
}

/**
 * Pushes bodies away from a point, falling off with distance. Used both for
 * the cursor (gentle, continuous) and for a click (sharp, one frame). Anything
 * it touches wakes up — this is the one input that is allowed to disturb a
 * sleeping pile.
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
    wake(body)
  }
}

/** Counts the quiet frames and puts a body to sleep once there are enough. */
const updateSleep = (
  body: BodyProps,
  settleSpeed: number,
  canSleep?: (body: BodyProps) => boolean
): void => {
  if (!isSettled(body, settleSpeed) || (canSleep && !canSleep(body))) {
    body.sleepFrames = 0
    return
  }

  body.sleepFrames = (body.sleepFrames ?? 0) + 1

  if (isAsleep(body)) {
    body.vx = 0
    body.vy = 0
  }
}

/**
 * Advances every body, then resolves collisions.
 *
 * Pairs are found with a uniform grid keyed on cell size rather than by
 * testing all pairs: at ~30 blocks the difference is small, but the grid keeps
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
  const settleSpeed = options.settleSpeed

  for (const body of bodies) {
    // A sleeping body is exactly where it was, by definition. Gravity would only
    // press it into the floor for the clamp to lift it back out, every frame.
    if (isAsleep(body)) continue

    body.vy += options.gravity * delta
    body.vx *= drag
    body.vy *= drag
    body.x += body.vx * delta
    body.y += body.vy * delta
  }

  // Walls are re-applied inside the loop, not once at the end: a pair pushed
  // apart on the last pass would otherwise be left sticking through a wall.
  const iterations = Math.max(1, options.iterations ?? DEFAULT_ITERATIONS)

  const separateAll = (): void => {
    for (const pair of findCandidatePairs(bodies)) {
      separatePair(pair[0], pair[1])
    }
  }

  const constrainAll = (restitution: number): void => {
    for (const body of bodies) {
      const bounds = chambers[body.chamber]
      if (!bounds) continue

      const { x, y } = body
      constrainToChamber(body, bounds, restitution, settleSpeed)

      // The chambers can move under a sleeping body (a resize); a body the
      // walls had to move is not where it fell asleep any more.
      if (Math.hypot(body.x - x, body.y - y) > WAKE_DISTANCE) wake(body)
    }
  }

  // Every pass runs the full impulse response, not just the first. `resolvePair`
  // only cancels the *relative* approach of a pair, so a block resting on
  // another is matched to whatever its neighbour is doing at that moment — and
  // in a stack of three the top is matched before the middle has been stopped
  // by the bottom, and keeps a helping of gravity it never loses. Iterating the
  // velocities lets that drain down the stack. It adds no energy: a pair that
  // has bounced is separating, and a separating pair is skipped.
  //
  // Floor and walls go first each pass for the same reason: they are the
  // reference the stack is matched against.
  for (let pass = 0; pass < iterations; pass += 1) {
    constrainAll(options.restitution)

    for (const pair of findCandidatePairs(bodies)) {
      resolvePair(pair[0], pair[1], options.restitution, settleSpeed)
    }

    constrainAll(options.restitution)
  }

  // The wall clamp is the last thing each pass does, which covers one half of
  // the problem and creates the other: a body shoved back inside its chamber on
  // the final pass can be pushed straight into a neighbour, and the loop is
  // over. One separation afterwards closes that. It can nudge a body back
  // towards a wall by the residue that survived every pass above — a fraction
  // of a unit, against a corner visibly inside a face without it. No further
  // clamp, or the two just take turns.
  separateAll()

  if (settleSpeed === undefined) return

  for (const body of bodies) {
    updateSleep(body, settleSpeed, options.canSleep)
  }
}

/**
 * Broad phase: bins bodies into a uniform grid and returns only the pairs
 * sharing a cell or a neighbouring one. Cell size is the largest possible
 * contact distance, so two touching bodies can never land more than one cell
 * apart — for squares that is corner to corner, not the circle diameter.
 */
export const findCandidatePairs = (bodies: BodyProps[]): [BodyProps, BodyProps][] => {
  if (bodies.length < 2) return []

  let cellSize = 0
  for (const body of bodies) {
    cellSize = Math.max(cellSize, outerReach(body) * 2)
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
