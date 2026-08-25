<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { experience } from '@/data/experience'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { formatMonthRange } from '@/utils/date'

const { t } = useI18n()
const { localized } = useLocalizedText()

const formatRange = (start: string | null, end: string | null, isOngoing: boolean): string =>
  formatMonthRange(start, end, isOngoing, t('journey.ongoing'))
</script>

<template>
  <ol class="relative flex flex-col">
    <!-- Datum line the entries hang off, like a dimension on a drawing -->
    <span
      aria-hidden="true"
      class="absolute top-2 bottom-2 left-[7px] w-px bg-line-strong md:left-[calc(9rem+7px)]"
    />

    <li
      v-for="entry in experience"
      :key="entry.id"
      class="group relative pb-12 pl-8 last:pb-0 md:pl-[calc(9rem+2rem)]"
    >
      <!-- Date column sits outside the line on desktop. Stops one gutter
           short of the node so long ranges never collide with it. -->
      <span
        class="nx-meta absolute top-0 left-8 hidden w-32 text-right md:left-0 md:block"
        :class="entry.isVerified ? 'text-ink-faint' : 'text-ink-faint/50'"
      >
        {{ formatRange(entry.startedAt, entry.endedAt, entry.isOngoing) }}
      </span>

      <!-- Node -->
      <span
        aria-hidden="true"
        class="absolute top-1 left-0 h-[15px] w-[15px] border transition-colors md:left-[9rem]"
        :class="
          entry.isVerified
            ? 'border-dev bg-void group-hover:bg-dev'
            : 'border-dashed border-ink-faint bg-void'
        "
      />

      <p class="nx-meta md:hidden">
        {{ formatRange(entry.startedAt, entry.endedAt, entry.isOngoing) }}
      </p>

      <div class="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:mt-0">
        <h3 class="font-display text-xl font-bold tracking-tight">{{ entry.organization }}</h3>
        <span class="nx-meta">{{ t(`journey.kind_${entry.kind}`) }}</span>
        <span v-if="entry.location" class="nx-meta">{{ entry.location }}</span>
      </div>

      <p v-if="entry.role" class="mt-2 font-mono text-sm text-dev">
        {{ localized(entry.role) }}
      </p>

      <p v-if="entry.summary" class="mt-3 max-w-2xl leading-relaxed text-ink-muted text-pretty">
        {{ localized(entry.summary) }}
      </p>

      <!--
        Unverified entries say so instead of being padded out with a
        plausible-sounding title. LinkedIn could not be read automatically,
        so these are gaps waiting on Jonas, not omissions.
      -->
      <p
        v-if="!entry.isVerified"
        class="mt-3 inline-flex items-center gap-2 border border-dashed border-line-strong px-3 py-1.5 font-mono text-meta tracking-[0.16em] uppercase text-ink-faint"
      >
        <span aria-hidden="true" class="h-1 w-1 bg-building" />
        {{ t('journey.unverified_hint') }}
      </p>

      <ul v-if="entry.technologies.length > 0" class="mt-4 flex flex-wrap gap-1.5">
        <li
          v-for="tech in entry.technologies"
          :key="tech"
          class="border border-line px-2 py-1 font-mono text-[0.625rem] tracking-wider text-ink-faint"
        >
          {{ tech }}
        </li>
      </ul>
    </li>
  </ol>
</template>
