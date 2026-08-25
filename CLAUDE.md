# nexron-portfolio

Personal portfolio of Jonas Glatz — NEXRON Studios.

Stack: Vue 3 + TypeScript (Composition API, `<script setup>`), Pinia, axios,
vue-i18n, vue-sonner, @vueuse/core, Vitest. Three.js scenes live in `src/three/`,
their shaders in `src/shaders/`.

## What deviates here

The web conventions are loaded globally from `~/.claude/rules/`. Four things in
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
  Lucide has no brand marks — GitHub and LinkedIn stay text labels.

Everything localStorage-shaped goes through VueUse or Pinia — except the locale
in `src/i18n/index.ts`, which is resolved at module scope before Pinia exists.

Backend conventions (NestJS + TypeORM) are not part of this repo. Should a
backend be added, link `Rules/backend/` per the vault README — do not unpack
`.claude/webdev-conventions.zip`, that archive is a superseded copy.
