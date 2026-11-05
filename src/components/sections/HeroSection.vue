<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { I18nT, useI18n } from 'vue-i18n'
import { ArrowDown } from '@respeak/lucide-motion-vue'
import angelArt from '@/assets/art/angel.png'
import angelLeftArt from '@/assets/art/angel-left.png'
import { identity, socialsById, heroSocialIds } from '@/data/socials'
import { brandIcons, isMotionBrand } from '@/components/ui/brand'
import { useIconMotion } from '@/composables/useIconMotion'
import { useSectionNav } from '@/composables/useSectionNav'
import { COMPACT_BREAKPOINT } from '@/composables/useThreeScene'
import AsciiArt from '@/components/ui/AsciiArt.vue'
import NxrButton from '@/components/ui/NxrButton.vue'

/**
 * The first screen. Two lines of type do all the work: "Software —" in
 * Archivo Black with the dash in the accent, "Engineer" in an outlined pixel
 * face with violet depth, closed by a blue pixel that blinks like a cursor.
 * Under them the role in violet, then one sentence, the action and the
 * links. (A block of four facts used to sit beside them; it only repeated
 * what the sentence, the role and the page below already say.)
 *
 * Both lines span the full width up to 20:9, by CSS alone: the `h1` is an
 * inline-size container and each line's font size is the container width
 * divided by how many ems that line is wide (`--nx-ems`, measured once in
 * the browser). No script measures anything, so nothing can overshoot when a
 * font arrives late.
 *
 * Over it, two angels set in ASCII face each other across the whole hero,
 * halos of thorns, the right one with shield and cross-tipped spear; the
 * pointer is a lens on them that pushes the glyphs aside.
 */
const { t } = useI18n()
const { iconMotion } = useIconMotion()
const { goTo } = useSectionNav()
const isWide = useMediaQuery(`(min-width: ${COMPACT_BREAKPOINT}px)`)

/** Glyph size of the angels: finer on phones, where each is only half the width. */
const ANGEL_GLYPH_PX = 5
const ANGEL_GLYPH_COMPACT_PX = 3.5

const heroSocials = socialsById(heroSocialIds).map((social) => ({
  ...social,
  icon: brandIcons[social.brand],
  isMotionIcon: isMotionBrand(social.brand)
}))
</script>

<template>
  <!-- The headline's height follows the width, so a window wider than 16:9
       (4K with browser bars) has no room left for the links. From md the top
       padding gives way first: 26.2vw is the headline, 21.5rem everything
       below it. -->
  <section
    id="top"
    class="relative flex min-h-svh flex-col justify-center overflow-hidden px-gutter pt-[clamp(6rem,14vh,9rem)] pb-[clamp(1.5rem,4vh,2.5rem)] md:justify-start md:pt-[clamp(6rem,min(14vh,100svh-26.2vw-21.5rem),9rem)]"
  >
    <!-- On phones this block is the angels' box, so they sit behind the
         headline wherever the centred layout puts it; from md it is static
         and they span the whole hero. -->
    <div class="max-md:relative">
      <!-- Past the ultrawide brake on rem (20:9) even the row does not fit under
           full-width lines, so only there the lines stop short: 0.262 is their
           height per width, 19.5rem the rest of the hero. -->
      <h1
        class="nx-monument relative font-black select-none md:[@media(min-aspect-ratio:20/9)]:max-w-[calc((100svh-19.5rem)/0.262)]"
      >
        <span class="sr-only">{{ identity.name }}, </span>

        <span
          class="nx-hero-line nx-fit nx-first nx-drift-left block pr-[0.07em] whitespace-nowrap"
          style="--nx-ems: 5.58"
        >
          Software <span aria-hidden="true" class="text-violet">—</span>
        </span>

        <span
          class="nx-hero-line nx-fit nx-pixel-word nx-drift-right -mt-[0.02em] flex items-end leading-[0.82] whitespace-nowrap"
          style="--nx-line: 1; --nx-ems: 6.68"
        >
          Engineer
          <span
            aria-hidden="true"
            class="nx-cursor mb-[0.1em] ml-[0.12em] inline-block size-[0.2em] shrink-0 rounded-[0.04em] bg-violet"
          />
        </span>
      </h1>

      <!-- The two angels face each other across the whole hero, as large as
         it is tall; on phones, side by side behind the headline. They come
         after the headline, so they print over it and show inside the
         hollow "Engineer". No blend mode: `difference` turned every violet
         glyph green on the white letters. The role line and the copy come
         later and stay on top, readable. -->
      <AsciiArt
        :src="angelLeftArt"
        :font-size="isWide ? ANGEL_GLYPH_PX : ANGEL_GLYPH_COMPACT_PX"
        :softness="0.3"
        :strength="0.85"
        :white="0.8"
        :split-at="0.45"
        is-outlined
        class="pointer-events-none absolute -top-[95%] -left-[24%] h-[290%] w-[88%] opacity-90 [--color-ink:var(--color-ink-faint)] md:top-[9%] md:left-[2%] md:h-[82%] md:w-[44%] md:opacity-60"
      />
      <AsciiArt
        :src="angelArt"
        :font-size="isWide ? ANGEL_GLYPH_PX : ANGEL_GLYPH_COMPACT_PX"
        :softness="0.3"
        :strength="0.85"
        :white="0.8"
        :split-at="0.45"
        is-outlined
        class="pointer-events-none absolute -top-[105%] -right-[24%] h-[310%] w-[88%] opacity-90 [--color-ink:var(--color-ink-faint)] md:top-[2%] md:right-[1%] md:h-[88%] md:w-[47%] md:opacity-60"
      />

      <p
        v-reveal="1"
        class="relative mt-6 text-center text-lead font-semibold text-violet md:text-left"
      >
        {{ identity.role }}
      </p>
    </div>

    <div class="relative pt-12 text-center md:mt-auto md:pt-6 md:text-left">
      <!-- Stacked while the free height holds it. Below that the min-width
           goes negative, counts as 0, and the three parts share one row: the
           same sum as the top padding, 27.5rem being its 21.5rem plus the
           6rem floor. -->
      <div
        class="mx-auto max-w-xl md:mx-0 md:flex md:max-w-none md:flex-wrap md:items-end md:gap-x-12 md:gap-y-8 md:*:min-w-[min(100%,(100svh-26.2vw-27.5rem)*999)]"
      >
        <div>
          <!-- The three parts that say who and what are set apart: the name
               in full weight, the studio in blue, the work in violet. -->
          <I18nT
            v-reveal="2"
            keypath="hero.intro"
            tag="p"
            scope="global"
            class="mx-auto max-w-[38ch] text-lead font-medium text-pretty md:mx-0"
          >
            <template #name>
              <strong class="font-black">{{ identity.name }}</strong>
            </template>
            <template #studio>
              <strong class="font-bold text-violet">{{ identity.brand }}</strong>
            </template>
            <template #work>
              <strong class="font-bold text-violet">{{ t('hero.intro_work') }}</strong>
            </template>
          </I18nT>
        </div>

        <div
          v-reveal="3"
          class="mt-8 flex flex-wrap items-center justify-center gap-3 md:mt-0 md:justify-start"
        >
          <NxrButton href="#projects" @click="goTo('projects', $event)">
            {{ t('hero.cta') }}
            <ArrowDown
              v-bind="iconMotion"
              triggerTarget="parent"
              class="size-4.5"
              aria-hidden="true"
            />
          </NxrButton>
          <NxrButton href="#contact" variant="plain" @click="goTo('contact', $event)">
            {{ t('hero.contact') }}
          </NxrButton>
        </div>

        <ul
          v-reveal="4"
          class="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-base font-semibold md:mt-0 md:justify-start"
        >
          <li v-for="social in heroSocials" :key="social.id">
            <a
              :href="social.href"
              :target="social.brand === 'mail' ? undefined : '_blank'"
              rel="noopener noreferrer"
              class="group flex items-center gap-2 transition-colors duration-(--nx-dur-fast) hover:text-link"
            >
              <component
                :is="social.icon"
                v-bind="social.isMotionIcon ? iconMotion : {}"
                class="size-5"
                aria-hidden="true"
              />
              {{ social.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nx-monument {
  container-type: inline-size;
}

/*
 * On scroll the two lines part, "Software —" to the left and "Engineer" to
 * the right. `translate`, not
 * `transform`: the entrance animation owns `transform`. `--nx-scroll` is 0
 * under reduced motion, so these hold still there.
 */
.nx-drift-left {
  translate: calc(var(--nx-scroll, 0) * -0.35px) 0;
}

.nx-drift-right {
  translate: calc(var(--nx-scroll, 0) * 0.35px) 0;
}

/* Font size from the container width. */
.nx-fit {
  font-size: calc(100cqi / var(--nx-ems));
}

/* Tracking in `em` on the line itself, so it scales with the line; set on
   the `h1` it would be inherited as a fixed pixel value. */
.nx-first {
  line-height: 0.84;
  letter-spacing: -0.055em;
}

/*
 * The two lines rise out of their own baseline on load, one after the other.
 * `clip-path` keeps the travel inside the line box, so the letters appear to
 * come up through the floor rather than fade in from nowhere.
 */
.nx-hero-line {
  animation: nx-line-up 1100ms var(--ease-out-expo) both;
  animation-delay: calc(var(--nx-line, 0) * 140ms + 80ms);
}

@keyframes nx-line-up {
  from {
    transform: translateY(0.35em);
    clip-path: inset(0 0 100% 0);
  }
  to {
    transform: none;
    clip-path: inset(-0.2em -0.3em -0.3em -0.2em);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nx-hero-line {
    animation: none;
  }
}
</style>
