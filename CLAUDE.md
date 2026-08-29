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
  chambers without a fifth hue being introduced. Status green and amber are the
  only exception, because a status colour is not a brand colour.
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

Backend conventions (NestJS + TypeORM) are not part of this repo. Should a
backend be added, link `Rules/backend/` per the vault README — do not unpack
`.claude/webdev-conventions.zip`, that archive is a superseded copy.
