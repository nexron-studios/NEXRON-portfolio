<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { experience } from '@/data/experience'
import type { ExperienceProps } from '@/types/experience.type'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { formatMonthRange } from '@/utils/date'
import { hashSeed } from '@/utils/blueprint'

const { t } = useI18n()
const { localized } = useLocalizedText()

const formatRange = (entry: ExperienceProps): string =>
  formatMonthRange(entry.startedAt, entry.endedAt, entry.isOngoing, t('journey.ongoing'))

/**
 * Initials for the logo disc, so an entry never waits on a trademark file to
 * render. Two letters from the first two words, or the first two letters of a
 * single-word name.
 */
const monogram = (organization: string): string => {
  const words = organization.split(/[\s-]+/).filter(Boolean)

  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
  }

  return organization.slice(0, 2).toUpperCase()
}

/** Ongoing entries glow; the rest sit quiet. Keeps the eye on "now". */
const isLive = (entry: ExperienceProps): boolean => entry.isOngoing

/** Deterministic tilt so the discs are not all identical, but never move. */
const discRotation = (id: string): string => `${(hashSeed(id) % 9) - 4}deg`
</script>

<template>
  <ol class="relative flex flex-col">
    <!-- Datum line the entries hang off, like a dimension on a drawing -->
    <span
      aria-hidden="true"
      class="absolute top-6 bottom-6 left-6 w-px bg-line-strong md:left-[calc(9rem+1.5rem)]"
    />

    <li
      v-for="entry in experience"
      :key="entry.id"
      class="group relative pb-12 pl-16 last:pb-0 md:pl-[calc(9rem+4rem)]"
    >
      <!-- Date column sits outside the line on desktop. -->
      <span class="nx-meta absolute top-3 left-0 hidden w-32 text-right md:block">
        {{ formatRange(entry) }}
      </span>

      <!--
        The node is the organisation's logo when there is one, and its
        monogram when there is not — the disc is the same size either way, so
        adding a file later changes the picture, not the layout.
      -->
      <span
        aria-hidden="true"
        class="absolute top-0 left-0 flex size-12 items-center justify-center overflow-hidden rounded-full border transition-all duration-[--nx-dur] ease-[--ease-out-expo] group-hover:scale-110 md:left-[9rem]"
        :class="[
          isLive(entry)
            ? 'border-dev text-dev shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-dev)_14%,transparent),0_0_22px_-2px_var(--color-dev)]'
            : 'border-line-strong text-ink-faint group-hover:border-dev group-hover:text-dev',
          // A transparent mark sits on white whatever the theme, or it vanishes
          // into the panel colour. A full-bleed logo brings its own ground and
          // needs none, and the monogram keeps the panel — it is drawn in ink.
          entry.logo && !entry.isLogoFullBleed ? 'bg-white' : isLive(entry) ? 'bg-void' : 'bg-panel'
        ]"
        :style="{ transform: `rotate(${discRotation(entry.id)})` }"
      >
        <!--
          A full-bleed logo is cropped to fill the disc; a transparent wordmark
          is fitted inside it, because cropping one to a circle cuts the name
          in half.
        -->
        <img
          v-if="entry.logo"
          :src="entry.logo"
          alt=""
          class="size-full"
          :class="entry.isLogoFullBleed ? 'object-cover' : 'object-contain p-1.5'"
          loading="lazy"
          decoding="async"
        />
        <span v-else class="font-mono text-sm font-bold tracking-tight">
          {{ monogram(entry.organization) }}
        </span>
      </span>

      <p class="nx-meta md:hidden">{{ formatRange(entry) }}</p>

      <div class="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:mt-2">
        <h3 class="font-display text-xl font-bold tracking-tight">
          <a
            v-if="entry.href"
            :href="entry.href"
            target="_blank"
            rel="noopener noreferrer"
            class="underline-offset-4 transition-colors hover:text-dev hover:underline"
          >
            {{ entry.organization }}
          </a>
          <template v-else>{{ entry.organization }}</template>
        </h3>
        <span class="nx-meta">{{ t(`journey.kind_${entry.kind}`) }}</span>
        <span v-if="entry.location" class="nx-meta">{{ entry.location }}</span>
      </div>

      <p v-if="entry.role" class="mt-2 font-mono text-sm text-dev">{{ localized(entry.role) }}</p>

      <p
        v-if="localized(entry.summary)"
        class="mt-3 max-w-2xl leading-relaxed text-pretty text-ink-muted"
      >
        {{ localized(entry.summary) }}
      </p>
    </li>
  </ol>
</template>
