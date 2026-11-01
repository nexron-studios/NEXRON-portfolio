<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowUpRight } from '@respeak/lucide-motion-vue'
import { projects } from '@/data/projects'
import { useIconMotion } from '@/composables/useIconMotion'
import { shortProjectName } from '@/utils/projectName'
import sunburstArt from '@/assets/art/sunburst.png'
import DitherArt from '@/components/ui/DitherArt.vue'
import ProjectMedia from '@/components/ui/ProjectMedia.vue'

/**
 * The work as one row of equal cards on wide screens (five projects, five
 * columns), so the section is about a screen tall at most. Every card is one
 * link to the project's page.
 *
 * No card is large: the bento with the newest project large put a small
 * private project (Weltenbummler) in the lead and was still too big.
 */
const { t } = useI18n()
const { iconMotion } = useIconMotion()

const categoryLine = (index: number): string =>
  projects[index]!.categories.map((category) => t(`projects.category_${category}`)).join(', ')
</script>

<template>
  <section id="projects" aria-labelledby="projects-heading" class="relative px-gutter pt-section">
    <!-- A halftone sunburst in violet behind the heading, fading out before
         the cards, like a print poster's light. -->
    <DitherArt
      :src="sunburstArt"
      :cell="9"
      tone="violet"
      :strength="0.45"
      fit="cover"
      class="pointer-events-none absolute top-0 left-0 h-[clamp(16rem,30vw,27rem)] w-full [mask-image:radial-gradient(ellipse_75%_50%_at_22%_50%,black_35%,transparent)] md:w-[75%]"
    />

    <div class="relative grid items-end gap-x-8 gap-y-6 md:grid-cols-12">
      <h2
        id="projects-heading"
        v-reveal.wipe
        class="text-[clamp(3rem,4.6vw,5rem)] leading-[0.86] font-black tracking-[-0.055em] uppercase md:col-span-6"
      >
        {{ t('projects.title') }}<span class="text-violet">.</span>
      </h2>
      <p
        v-reveal="1"
        class="max-w-[44ch] text-lead text-pretty md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8"
      >
        {{ t('projects.intro') }}
      </p>
    </div>

    <ul
      class="relative mt-[clamp(2.5rem,5vw,4rem)] grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      <li v-for="(project, index) in projects" :key="project.slug" v-reveal="index % 3">
        <RouterLink
          :to="{ name: 'project-detail', params: { slug: project.slug } }"
          class="group block"
        >
          <div class="overflow-hidden">
            <ProjectMedia
              :project
              class="transition-transform duration-(--nx-dur-slow) ease-(--ease-out-expo) group-hover:scale-[1.03]"
            />
          </div>

          <div class="mt-3 flex items-baseline justify-between gap-4">
            <h3
              class="text-lg font-bold tracking-[-0.03em] uppercase transition-colors duration-(--nx-dur-fast) group-hover:text-link"
            >
              {{ shortProjectName(project.name) }}
            </h3>
            <span class="flex shrink-0 items-center gap-2 text-base font-medium tabular-nums">
              {{ project.year }}
              <ArrowUpRight
                v-bind="iconMotion"
                triggerTarget="parent"
                class="size-4.5 text-link"
                aria-hidden="true"
              />
            </span>
          </div>
          <p class="mt-1.5 line-clamp-2 text-sm text-pretty text-ink-muted">
            {{ project.tagline }}
          </p>
          <p class="mt-1.5 text-sm font-medium text-ink-faint">{{ categoryLine(index) }}</p>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
