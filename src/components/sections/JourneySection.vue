<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { experience } from '@/data/experience'
import { useUiStore } from '@/stores/ui'
import { formatMonthRange } from '@/utils/date'
import { pathProgress } from '@/utils/pathProgress'
import chainArt from '@/assets/art/chain.png'
import sparklesArt from '@/assets/art/sparkles.png'
import DitherArt from '@/components/ui/DitherArt.vue'

/**
 * The path so far, newest first, as a connected timeline: one line runs
 * through every station, each station is its round logo sitting on that
 * line, and the line fills in violet as the reader scrolls down it, with a
 * glowing tip. A station lights up (colour, full size, full text) the moment
 * the fill reaches it, so the path is walked rather than listed. Stations
 * still running carry a violet ring that breathes.
 *
 * Kept compact: six stations fit in about one and a half screens.
 */
const { t } = useI18n()
const uiStore = useUiStore()

const track = ref<HTMLElement | null>(null)
const stations = ref<HTMLElement[]>([])
const { top, height } = useElementBounding(track)
const { height: viewportHeight } = useWindowSize()

/** The fill follows a reading line a little above the middle of the screen. */
const READING_LINE = 0.6
/** Half a node: the line runs from the first node's centre to the last one's. */
const NODE_HALF_PX = 24

const progress = computed(() =>
  uiStore.prefersReducedMotion
    ? 1
    : pathProgress(top.value, height.value, viewportHeight.value * READING_LINE)
)

const fillPx = computed(() => progress.value * Math.max(0, height.value - NODE_HALF_PX * 2))

/** A station is lit once the fill has reached its node's centre. */
const isLit = (index: number): boolean => {
  if (progress.value >= 1) return true
  const station = stations.value[index]
  if (!station) return false
  return station.offsetTop <= fillPx.value + 1
}

const monogram = (organization: string): string =>
  organization
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
</script>

<template>
  <section
    id="journey"
    aria-labelledby="journey-heading"
    class="relative overflow-x-clip px-gutter pt-[clamp(3rem,9vw,8rem)]"
  >
    <!-- Two clusters of spiky stars in halftone, one beside the first
         stations, one under the heading, so the sky of the page gathers
         around the path. Desktop only: on a phone they would sit on the text. -->
    <DitherArt
      :src="sparklesArt"
      :cell="3"
      :strength="0.65"
      is-pushable
      class="pointer-events-none absolute top-[clamp(14rem,19vw,20rem)] right-[6%] hidden aspect-[224/310] w-[clamp(9rem,11vw,13rem)] [--color-ink:var(--color-ink-muted)] lg:block"
    />
    <DitherArt
      :src="sparklesArt"
      :cell="3"
      :strength="0.65"
      is-pushable
      class="pointer-events-none absolute top-[clamp(36rem,36vw,44rem)] left-[18%] hidden aspect-[224/310] w-[clamp(8rem,10vw,11.5rem)] [--color-ink:var(--color-ink-muted)] lg:block"
    />

    <div class="grid gap-x-10 gap-y-10 lg:grid-cols-12">
      <div class="lg:col-span-4">
        <div class="relative lg:sticky lg:top-28">
          <h2
            id="journey-heading"
            v-reveal.wipe
            class="relative text-[clamp(3rem,4.6vw,5rem)] leading-[0.86] font-black tracking-[-0.055em] uppercase"
          >
            {{ t('journey.title') }}<span class="text-violet">.</span>
          </h2>
          <!-- The thorn chain in halftone lies across the heading the way the
               angels lie across the hero headline: it comes after the h2, so
               its light grey dots print faintly over the white letters (a
               lighter grey shows less on white and as much on black), and
               before the intro, which stays on top and readable. It gives way
               to the pointer like the angels, and a glint runs along it every
               few seconds: a journey is stations linked one
               to the next. It runs out past the column; the section clips it. -->
          <DitherArt
            :src="chainArt"
            :cell="4.5"
            :strength="0.75"
            class="pointer-events-none absolute top-1/2 -left-6 aspect-[449/267] w-[min(115%,40rem)] -translate-y-1/2 [--color-ink:var(--color-ink-muted)] lg:w-[min(135%,42rem)]"
          />
          <p v-reveal="1" class="relative mt-6 max-w-[30ch] text-lead text-pretty text-ink">
            {{ t('journey.intro') }}
          </p>
        </div>
      </div>

      <ol ref="track" class="relative lg:col-span-8">
        <!-- The line: a quiet track, the violet fill that walks down it, and
             a glowing tip at the end of the fill. -->
        <span
          aria-hidden="true"
          class="absolute top-6 bottom-6 left-[calc(1.5rem-1px)] w-0.5 bg-raised"
        />
        <span
          aria-hidden="true"
          class="absolute top-6 bottom-6 left-[calc(1.5rem-1px)] w-0.5 origin-top bg-violet"
          :style="{ transform: `scaleY(${progress.toFixed(4)})` }"
        />
        <span
          v-if="progress > 0 && progress < 1"
          aria-hidden="true"
          class="absolute top-6 left-6 z-20 -mt-1.25 -ml-1.25 size-2.5 rounded-full bg-violet shadow-[0_0_0.75rem_0.2rem_var(--color-violet)]"
          :style="{ transform: `translateY(${fillPx.toFixed(1)}px)` }"
        />

        <li
          v-for="(entry, index) in experience"
          :key="entry.id"
          ref="stations"
          v-reveal="index % 2"
          class="relative grid grid-cols-[3rem_1fr] gap-x-5 pb-[clamp(1.75rem,3vw,2.5rem)] last:pb-0 sm:gap-x-7"
        >
          <!-- The node. Its ring in the page ground cuts the line, so the
               line reads as running between stations, not through logos.
               Unlit it waits small and grey; the fill pops it. -->
          <span
            class="relative z-10 flex size-12 items-center justify-center overflow-hidden rounded-full ring-[0.3125rem] ring-void transition-[scale,filter,box-shadow] duration-(--nx-dur-slow) ease-(--ease-out-expo)"
            :class="[
              entry.logo && !entry.isLogoFullBleed ? 'bg-white' : 'bg-raised',
              isLit(index)
                ? 'scale-100 shadow-[0_0_1.5rem_-0.25rem_var(--color-violet)]'
                : 'scale-80 brightness-60 grayscale'
            ]"
          >
            <img
              v-if="entry.logo"
              :src="entry.logo"
              alt=""
              loading="lazy"
              class="size-full"
              :class="entry.isLogoFullBleed ? 'object-cover' : 'object-contain p-2'"
            />
            <span v-else aria-hidden="true" class="text-base font-black">
              {{ monogram(entry.organization) }}
            </span>
          </span>
          <span
            v-if="entry.isOngoing"
            aria-hidden="true"
            class="nx-node-pulse absolute top-0 left-0 z-20 size-12 rounded-full ring-2 ring-violet"
          />

          <div
            class="transition-[opacity,translate] duration-(--nx-dur-slow) ease-(--ease-out-expo)"
            :class="isLit(index) ? 'opacity-100' : 'translate-x-2 opacity-45'"
          >
            <p class="text-sm font-semibold text-ink-faint tabular-nums">
              {{
                formatMonthRange(
                  entry.startedAt,
                  entry.endedAt,
                  entry.isOngoing,
                  t('journey.ongoing')
                )
              }}
              · {{ t(`journey.kind_${entry.kind}`)
              }}<template v-if="entry.location"> · {{ entry.location }}</template>
            </p>
            <h3
              class="mt-1 text-[clamp(1.375rem,2vw,1.875rem)] leading-[1.05] font-black tracking-[-0.035em]"
            >
              <a
                v-if="entry.href"
                :href="entry.href"
                target="_blank"
                rel="noopener noreferrer"
                class="transition-colors duration-(--nx-dur-fast) hover:text-link"
              >
                {{ entry.organization }}
              </a>
              <template v-else>{{ entry.organization }}</template>
            </h3>
            <p v-if="entry.role" class="mt-1 text-base font-semibold text-violet">
              {{ entry.role }}
            </p>
            <p class="mt-2 max-w-[62ch] text-base leading-relaxed text-pretty text-ink-muted">
              {{ entry.summary }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
