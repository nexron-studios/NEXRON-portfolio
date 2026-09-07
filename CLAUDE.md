# nexron-portfolio

Personal portfolio of Jonas Glatz — NEXRON Studios.

Stack: Vue 3 + TypeScript (Composition API, `<script setup>`), Pinia, axios,
vue-i18n, vue-sonner, @vueuse/core, Vitest. Three.js scenes live in `src/three/`.

Typeface is Geist Sans + Geist Mono, self-hosted through `@fontsource-variable`.

## What deviates here

The web conventions are loaded globally from `~/.claude/rules/`. These things in
this repo differ from them on purpose:

- **Generic components are `Nxr*` in `src/components/ui/`**, not `common/`.
  There is no component-library CLI in this project, so nothing needs `ui/` kept
  free for it.
- **Specs live in `__test__/`** (singular), which is what `vite.config.ts`
  globs for.
- **`usePointerTracker` returns a plain object, not refs.** It is read inside
  render loops; `useMouse` would put a reactivity notification on every frame
  for no benefit. VueUse owns the listener lifecycle there, not the value.
  `useScrollProgress` coalesces scroll into its own rAF for the same reason.
- **The terminal in `AboutSection` is not translated.** A shell prompt is a
  shell prompt in either language.
- **Stylesheets live in `src/styles/`, not `src/assets/`.** That includes the
  copy of `Rules/assets/debug.css`, which sits at `src/styles/debug.css`
  alongside `tokens.css` and `transitions.css`.
- **Icons come from `@respeak/lucide-motion-vue`, not `@lucide/vue`.** Same
  Lucide shapes, but animated on hover. It is the one place an animation
  library (`motion-v`) is allowed — the rule against pulling one in for a
  simple fade still holds for everything else, which stays on native
  `<Transition>` and `transitions.css`.
  The library does **not** read `prefers-reduced-motion`; every icon therefore
  gets `v-bind="iconMotion"` from `useIconMotion`, never a hand-written
  `animateOnHover`. Bind the trigger to the surrounding link or button with
  `triggerTarget="parent"` so hovering the whole control plays the icon.
- **Brand marks are local simple-icons paths in `src/components/ui/brand/`.**
  Lucide carries none, so GitHub, LinkedIn, Instagram and Spotify are plain
  `<svg>` components with `fill="currentColor"` (CC0, no CDN, no dependency),
  mapped by `brandIcons`. They animate through native CSS transitions — the
  motion runtime stays reserved for Lucide icons. This is the only place a
  non-Lucide icon belongs; anything that is a UI concept rather than a brand
  still comes from `@respeak/lucide-motion-vue`.
- **The palette is violet → magenta. There is no cyan and no blue.**
  `--color-dev` is violet and carries everything interactive; `--color-creative`
  is magenta and belongs to the 3D / design half. `SkillDomain`'s four values
  are four steps along that one axis, so the tech-stack pit reads as four
  chambers without a fifth hue being introduced. There are exactly three
  exceptions: status green and amber; the seven `--color-piece-*` tokens of the
  Tetris easter egg, which are the colours that game has always had — cyan I,
  yellow O, red Z and the rest; and the orange of the two Clawd mascots in the
  hero model. Tetris' well (`--color-well`) stays dark in both schemes for the
  same reason as its pieces, or the yellow and the cyan would be unreadable in
  the light one. Nothing outside `NxrTetrisGame` and `useTetrisBoard` may reach
  for the piece colours.
  The Clawd orange is a deliberate brand cameo and the only one — it lives in
  the GLB's own `clawd` material, is never named as a token, and no other
  surface may pick it up. The controller's accent, which the file authored as
  pure blue, is retinted to `--color-dev` in `characterSurfaces.ts` for exactly
  that reason.
- **Corners are rounded, never chamfered.** The `--radius-*` scale in
  `tokens.css` generates the `rounded-*` utilities; `.nx-panel` and `.nx-glass`
  use `--radius-lg`. The cut-corner clip-paths and `NxrCornerTicks` this project
  started with have been removed — do not reintroduce either.
- **Colour tokens keep their dark-flavoured names in both schemes.** `--color-void`
  is the page ground and `--color-panel` the surface on top of it, whichever
  way the theme runs; the light palette overrides the same slots under
  `:root[data-theme='light']`. Renaming them would touch every `bg-void` in the
  repo for nothing.
- **`.nx-glass` and `.nx-holo` are component classes, not utilities.** Both need
  pseudo-elements and `mix-blend-mode`, which have no utility form. They live in
  the `@layer components` block of `main.css` with everything else that cannot
  be expressed in the template.
  `.nx-glass` keeps its blur and its refraction in **two** layers on purpose:
  `backdrop-filter` is all-or-nothing, so `url(#nx-liquid) blur(...)` in one
  declaration drops the blur too wherever the filter cannot be resolved, and the
  pane goes clear with sharp text behind it. The displacement therefore lives on
  `::after` at `z-index: -1` — behind the pane's own children, or the header
  ripples its own nav labels along with the page. `LiquidGlassFilter.vue` must
  stay mounted once in `App.vue` for the filter id to resolve.
- **`src/utils/theme.ts` reads `window.localStorage`, not the bare global.**
  Node ships its own inert `localStorage` that shadows jsdom's under Vitest.
  This mirrors `resolveInitialLocale` in `src/i18n/index.ts` otherwise: the
  scheme has to be resolved before the first paint, which is before Pinia
  exists, so the store owns it and stamps `<html data-theme>` in `setTheme`.
  Do not reach for `useColorMode` — one instance per component means two
  copies of the state that quietly disagree.

Everything localStorage-shaped goes through VueUse or Pinia — except the locale
in `src/i18n/index.ts` and the theme in `src/utils/theme.ts`, both resolved at
module scope before Pinia exists.

The backdrop (`TetrisBackdrop`) is a 2D canvas, deliberately not WebGL: the page
already runs up to three Three.js contexts and a decorative grid does not
deserve a fourth. Its rules live in `src/utils/tetris.ts` and the ball-pit
physics in `src/utils/ballPit.ts` — both pure, both specced. Keep new simulation
logic in `utils/` and let `src/three/` own only geometry and the frame step.

Two GLBs come out of the same .blend and share one surface table:
`public/models/mainCharakter.glb` is the hero diorama, and
`public/models/main_head_body.glb` is the head-and-shoulders cut that rises from
behind a panel in About and Contact. Neither carries **any texture, and the
character meshes have no UVs**, so their flat colour slots — 27 and 15 — are
given surface behaviour in `src/three/characterSurfaces.ts`, keyed by the
material names the .blend exports. `applyCharacterSurfaces` runs the swap for
both scenes; the names overlap completely, so one table covers them.

The split there is the point: **Blender keeps the colour, the code owns the
light.** Base colours are copied off the
loaded material, and only a slot whose authored colour is wrong for the page
sets `colorHex`. Rename a material in Blender and it falls through to
`FALLBACK_SURFACE` — which is also what catches the desk mat, exported with no
material at all and otherwise rendered in Three's default white.

Four more things about the hero scene are load-bearing:

- **The figure faces −Z in the file**, so `MODEL_YAW` turns it to meet the camera.
- **It is grounded by a painted gradient** in `contactShadow.ts` rather than a
  shadow map — a blurred ellipse sells it and costs no depth pass.
- **The podium lamps stay white**, as the .blend authored them, and glow through
  the real bloom pass in `src/three/bloom.ts`. They are the one exception to the
  rule that the GL side mirrors the palette — a lamp is not a hue. Bloom selects
  by luminance rather than a layer mask: `UnrealBloomPass` runs before tone
  mapping, so anything merely lit caps at 1 and only an `emissiveIntensity`
  pushed past that gets a halo. Raising a slot's emissive above 1 therefore makes
  it glow; that is the knob, not a bloom setting.
- **The figure sways on a fixed path and is dragged, never cursor-tracked.** The
  gesture is shared with the LED sign through `useSceneDrag`, and the return
  spring through `src/utils/spring.ts` — but the two no longer share tuning: the
  hero is a figure being turned rather than a plate being spun, so its spring is
  softer and slower. The drag reaches its limit through `softLimit` rather than
  `clampTo`: resistance grows towards the edge instead of the scene stopping
  dead, which also means a release at the edge hands the spring almost no speed.

`useThreeScene` now takes an optional `render` hook on `SceneHandle`. Only the
hero uses it, to run its composer instead of `renderer.render`; every other scene
is unaffected. The hero's canvas is transparent so the backdrop shows through, so
the bloom chain must keep its alpha — `RenderPass.clearAlpha = 0` is what stops
the stage turning into a black rectangle.

`STRAY_MASCOT_MIN_Y` in `heroCharacter.ts` **currently matches nothing** and is
kept anyway: an earlier export carried a third Clawd floating in mid-air behind
the character's head, which the first drag swung into view. The guard is five
lines and catches that class of export accident the next time.

The peek figure (`src/three/peekCharacter.ts`) is deliberately the plain
opposite of the hero: no podium, no sway, no drag, no bloom — it sits _behind_
the content and must not compete with it. Two things there are load-bearing.
**`01_Head` is one node with the whole head parented under it**, so following
the cursor is a single rotation — but it carries the model's own 180° turn, so
the look is applied as an offset on a saved base quaternion; writing
`rotation.y` faces the head backwards. And **the head is 48 % of that model's
height** (chibi proportions), so `VISIBLE_SHARE` has to be well over half or the
face is cut off at the chin. The figure is scaled against the camera frame, not
to a fixed size.

Each section owns the figure's wrapper and its clipping edge, because the edge
differs: in About it is the terminal (`bg-raised/60`), in Contact the first input
(`bg-panel`) — the form itself has no surface, so cutting at the form's top edge
would leave a body ending in mid-air. The wrapper is `z-0` with the content at
`relative z-10`; a negative z would escape the section, since `SectionFrame` is
only `position: relative`, and land in the backdrop's layer.

Backend conventions (NestJS + TypeORM) are not part of this repo. Should a
backend be added, link `Rules/backend/` per the vault README — do not unpack
`.claude/webdev-conventions.zip`, that archive is a superseded copy.
