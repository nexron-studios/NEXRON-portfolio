# nexron-portfolio

Personal portfolio of Jonas Glatz — NEXRON Studios.

Stack: Vue 3 + TypeScript (Composition API, `<script setup>`), Pinia, axios,
vue-i18n, vue-sonner, @vueuse/core, Vitest. One Three.js scene (the chrome
sign) lives in `src/three/`.

Type: Archivo (variable, wght + wdth) for everything, Silkscreen for the one
pixel word in the hero. Both are self-hosted through `@fontsource`. The
canvases (ASCII art, stars, Matrix rain) use the system monospace, no webfont.

Design (redesign of 2026-11-01, branch `feat/redesign`): **dark only**,
near-black ground, off-white ink, two accents with one job each (see
`tokens.css`): blue = clickable, violet = emphasis, never swapped. The hero is
two monument lines fitted to the full width under two ASCII angels; the page
order is hero, Projects (five equal cards in one row on wide screens; no
large lead card), About (text, services and the full tech stack, over the star field),
Journey, Contact over the Matrix rain, footer with social cards.
`.taste-skill/` holds the before/after inspector runs of that redesign.

**English only** (decided 2026-11-01). Content in `src/data/` is plain strings;
vue-i18n stays with one locale (`en.ts`) so interface copy keeps one home. The
mail address is never printed on the page, only used in `mailto:` links.

## What deviates here

The web conventions are loaded globally from `~/.claude/rules/`. These things in
this repo differ from them on purpose:

- **Generic components are `Nxr*` (or plain names) in `src/components/ui/`**,
  not `common/`. There is no component-library CLI in this project.
- **Specs live in `__test__/`** (singular), which is what `vite.config.ts`
  globs for.
- **`typecheck` passes `-p tsconfig.app.json`.** The root `tsconfig.json` only
  holds project references, so a bare `vue-tsc --noEmit` checks nothing and
  exits 0. It did, unnoticed, until 2026-11-01.
- **Stylesheets live in `src/styles/`, not `src/assets/`**, including the copy
  of `Rules/assets/debug.css`.
- **Icons come from `@respeak/lucide-motion-vue`, not `@lucide/vue`.** Every
  icon gets `v-bind="iconMotion"` from `useIconMotion` (the library ignores
  `prefers-reduced-motion`), bound to its control with `triggerTarget="parent"`.
- **Brand marks are local simple-icons paths in `src/components/ui/brand/`**,
  mapped by `brandIcons`. The only non-Lucide icons.
- **Blue means clickable, violet means emphasis.** `dev` (#4c60e6) fills
  buttons, `link` (a lighter step) colours clickable text, arrows, hover and
  focus. `violet` is the role line, highlighted words, the hero dash, cursor
  pixel and pixel-word depth, the phone-app frame, the four tech areas and the
  heads of the Matrix rain. Violet is never clickable; blue never decorates.
  One exception Jonas asked for: Clawd (traced from his TokenScope
  `clawd-static-base.gif`), who climbs out behind the focused contact field,
  is `dev` blue, because it marks focus like the blue
  bar under the field does.
- **Square by default.** Buttons, frames and fields have no radius. Rounded
  are only real interface fragments (screenshots), the footer cards and the
  glass pill. Screenshots are never cropped: `ProjectMedia` sits them whole
  on the frame's ground.
- **The glass pill is plain frost** (backdrop blur, dark tint, rim light),
  the second state of `SiteHeader` that replaces the top bar after 96 px of
  scroll. Both states live in one component on one scroll value, so there is
  never a gap without navigation. Nav clicks on the home page go through
  `useSectionNav` (`scrollIntoView`), because the router ignores a click on
  the hash it is already on. Inspira's Liquid Glass was removed on
  2026-11-01: its SVG refraction smeared text from outside the pill along the
  edge at every setting tried.
- **Monument lines are fitted by CSS, not script.** The hero `h1` is an
  inline-size container; each line is `font-size: calc(100cqi / --nx-ems)`,
  where `--nx-ems` is that line's width in ems, measured once in the browser
  (5.58 and 6.68). Change the words or the face and re-measure. A JS fitter
  was tried and overshot when fonts arrived late. Tracking must sit on the
  line itself in `em`; inherited from a parent it arrives as fixed pixels.
- **`v-reveal` only hides content under `<html class="js">`**, which the
  inline script in `index.html` sets.

There is no theme switch and no stored theme; the old `nexron.theme*` keys in
visitors' storage are simply ignored.

**The ASCII art** (`AsciiArt`): the angels in the hero are set as real
monospaced characters on a canvas grid, from the white-
on-black sources in `src/assets/art/`. The source is blurred (`softness`)
before it is sampled: both sources already are character art or halftone, and
sampling them raw on a second grid beats the two grids into mush (the first
attempt did exactly that). `white` sets the brightness that counts as full;
sparse sources need it low, solid ones (the hero angel) want it at 1. The
pointer is a lens that pushes the glyphs aside and lets a random share near
its centre flicker into violet scramble (a solid violet disc read as a stamp
and was dropped on 2026-11-01). Since 2026-11-01 the hero holds two angels facing each
other across its full height (Jonas's mockup), `angel-left.png` and
`angel.png` (shield, cross-tipped spear), inverted from a black-on-white
image Jonas sent; `figure.png`, the old staff angel, is no longer imported.
They sit after the `h1` in the DOM, so they print over the headline and fill
the hollow "Engineer"; role line and copy come later and stay on top. 5 px
glyphs, almost no softness: at 9 px they read as texture. Their ink is
`ink-faint` at full strength, so the glyphs stay visible on the white letters
too. No blend mode: `difference` turned the violet glyphs green there. Both
sources were thickened by 1 px (max filter) when cut out, and `splitAt`
draws every cell with detail finer than a glyph (a thorn, the spear) as four
half-size glyphs, so the crowns of thorns keep their spikes; a 2 px
thickening merged the body into blobs instead. `AsciiArt` paints the resting
picture once into an offscreen canvas and per frame repaints only the
shimmering cells and the block under the lens: repainting every glyph of the
fine grid cost 50 ms a frame. The file sits at the 500-line limit; pure grid
helpers live in `src/utils/ascii.ts`, canvas and palette reading in
`src/utils/asciiSource.ts`. Every `AsciiArt` and every `DitherArt` shares
one glint (`glintBoost` in `src/utils/dither.ts`, one clock for the page):
on halftones it swells the dots, on ASCII it repaints only the band and
lights the band's core in `ink-muted`, thickening glyphs only a little.
Full white and full thickening were too bright on the angels (Jonas).
The angels themselves run at `strength` 0.5: at 0.8 they pulled the eye
away from the headline. They are ground, the type is the subject. They stay inside the hero and do
not sink on scroll; a field taller than the hero ended in a hard horizontal
cut ("chopped off"). On phones the hero is centred (vertically and in its text) and the two
angels sit behind the headline, positioned against a `max-md:relative`
wrapper around headline and role line, in 3.5 px glyphs; from `md` the
wrapper is static, so they span the whole hero at `opacity-60`. Showing the plain image instead was tried and
rejected: it has to be ASCII. Both sources are Pinterest finds Jonas chose;
their rights are not cleared. About shows no ASCII any more: the Thinker
(`thinker.png`) read as dull and was replaced on 2026-11-01 by a halftone
shrine (`DitherArt`, `shrine.png`: robed figure under a crown of thorns, stars, two
angels, a knight), cut out of a collage mockup Jonas made, with the editor's
guide lines and the nav pill removed. Its parts are found images too; rights
not cleared. The source is thresholded (155 black, 230 white), so the
photographed figure in the middle breaks into black gaps like the cut-outs
beside it; mapped straight it was one big white field. The white thorn
wire (`wire.png`, same collage, copy masked out) lies behind the text on
`lg` screens only. Both carry `is-outlined` (dots on the rim in
`ink-dim`, as on the angels), and a radial pool in `void` sits under the
copy so the text keeps the focus.

**Print textures** (`DitherArt`, since 2026-11-01): the sibling of
`AsciiArt` for texture instead of characters, from Jonas's moodboard of
halftone and ordered dithering. `halftone` sets round dots whose area follows
the light, `bayer` switches square pixels on in the 4 × 4 Bayer order (pure
rules in `src/utils/dither.ts`). Dots grow in once on first sight, then it
holds still. Three uses: a violet halftone sunburst behind the Projects
heading (`sunburst.png`, generated), the halftone thorn chain lying
diagonally across the Journey heading the way the angels lie across the hero
headline (after the h2 so its grey dots print over the white letters, before
the intro so that stays readable), where
`isPushable` gives it the same pointer lens as `AsciiArt` (`chain.png`, cut
from the moodboard and rotated, rights not cleared), two clusters of spiky stars in halftone
around the Journey path, desktop only (`sparkles.png`, one graphic cut from
Jonas's mockup and used twice, pushable like the chain), and a violet Bayer glow rising behind the footer cards
(`glow.png`, generated). The moodboard's orange was translated to violet. The 404 page has a lone knight walking off
towards a castle in Bayer dither (`knight.png`, from an image Jonas sent,
rights not cleared): sky black-pointed so it stays empty, edges faded in the
source so they dissolve into pixels, `white` 0.45 for a bright, detailed
ground. `isWindy` rolls gusts across its plain (`windGust`, about 15 fps,
only while visible, off under reduced motion); the castle stays still. The
404 sets its size directly; `text-monument` no longer exists.

**Scroll motion.** `useScrollVar` (mounted once in `App.vue`) publishes the
scroll position as `--nx-scroll`; scroll-linked moves are plain CSS
`translate: calc(var(--nx-scroll) * …px)` (the hero lines part).
It stays 0 under reduced motion, so nothing else has to check. The
`StarField` is a fixed canvas of ASCII stars in three parallax depths behind
everything. Since 2026-11-01 it animates on every page (Jonas wanted more
motion): stars twinkle out of step, one flares up every 1.5 to 4 s, a shooting
star crosses every 6 to 14 s; the links page additionally drifts. Under reduced
motion it is static and redrawn only on scroll and resize. No section may paint
an opaque ground over it (Jonas wants the stars everywhere). The one
`ScrollMarquee` band (hollow capitals, before Contact) runs sideways with the
scroll; the pixel-face band was removed as ugly. `v-reveal.wipe` unmasks big headings from
below; it watches the parent, because an IntersectionObserver ignores a
target that is clipped away completely. `.nx-grain` lays film grain over the
page.

**The Matrix rain** (`MatrixRain`, behind Contact) is a 2D canvas at 20 fps,
only while on screen; trails come from repainting the ground at low opacity.
Slow on purpose (3 to 8 rows a second) and ASCII only: no katakana, Jonas
does not want Asian characters on the page. Its pure rules (glyph pick, drop
restart) live in `src/utils/matrixRain.ts`.

**Technology marks** live in `src/data/skillIcons.ts` (simple-icons CC0,
devicon MIT, Lucide ISC) and render through `SkillIcon`, keyed by skill name.

**The chrome sign** (`LedSign`, `public/models/nexron_3dledsign.glb`) is the one
3D object left. It is lazy: neither the Three.js chunk nor the model loads
before the stage nears the viewport. Its rim lights are two steps of the accent
(`src/three/palette.ts`). Since 2026-11-01 it renders as live halftone through
`createHalftoneComposer` (`src/three/halftone.ts`: `RenderPass → OutputPass →`
a halftone `ShaderPass`). The grid is fixed to the screen, so the dots swim
over the plate as it turns; dots take the hue they cover and the ground stays
transparent. Three's own `HalftonePass` was not used: it prints CMYK dots on
white paper. The hero figure, peek figure, skill pit, Tetris
backdrop and terminal were removed on 2026-11-01 and live in git history.

## Copy

Everything a visitor reads, in `src/data/` and in `src/i18n/locales/`, follows
one rule decided on 2026-09-16: **no em dash in prose.** No `—` between two
halves of a sentence, no `—` as a dramatic pause. A sentence that seems to
need one is two sentences, or wants a comma or a colon. The dash is the
single strongest tell of generated text, and this site is written by a person.

Write directly and plainly, in short sentences, as Jonas would say it.

Separators are not prose and are exempt: the en dash in `<title>`
(`Jonas Glatz – Developer …`), the `aria-hidden` dash in the hero line
"Software —", and `EMPTY_MARK` in `src/utils/date.ts`. Code comments are not copy either.

The rule is global (`Rules/frontend/i18n.md`, _Writing copy_); this is the
pointer.

Backend conventions (NestJS + TypeORM) are not part of this repo. Should a
backend be added, link `Rules/backend/` per the vault README.
