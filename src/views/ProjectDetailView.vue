<script setup lang="ts">
import { computed, onBeforeUnmount, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowLeft, ArrowUpRight } from '@respeak/lucide-motion-vue'
import { getProjectBySlug, projects } from '@/data/projects'
import { useIconMotion } from '@/composables/useIconMotion'
import { shortProjectName } from '@/utils/projectName'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import NxrButton from '@/components/ui/NxrButton.vue'
import ProjectMedia from '@/components/ui/ProjectMedia.vue'

/**
 * One project, told the way the home page argues: the name set large, one
 * sentence, the facts in a row, then the screens big and the story beside
 * them. It closes on the next project's name, so the reader can keep going
 * without returning to the list.
 */
const { slug } = defineProps<{ slug: string }>()

const { t } = useI18n()
const { iconMotion } = useIconMotion()

const project = computed(() => getProjectBySlug(slug))

const nextProject = computed(() => {
  const index = projects.findIndex((entry) => entry.slug === slug)
  return projects[(index + 1) % projects.length]!
})

const detailBlocks = computed(() => {
  const detail = project.value?.detail
  if (!detail) return []

  return [
    { key: 'overview', label: t('projects.detail_overview'), body: detail.overview },
    { key: 'problem', label: t('projects.detail_problem'), body: detail.problem },
    { key: 'idea', label: t('projects.detail_idea'), body: detail.idea },
    {
      key: 'implementation',
      label: t('projects.detail_implementation'),
      body: detail.implementation
    }
  ]
})

const PHONE_SCREENS = 3

/**
 * Screens after the first frame. A phone app is shown in groups of three
 * on the accent, the same way the frame shows it; a desktop app one by one.
 */
const restGroups = computed(() => {
  const current = project.value
  if (!current) return []
  if (current.shotOrientation === 'portrait') {
    const rest = current.shots.slice(PHONE_SCREENS)
    return rest.length ? [rest] : []
  }
  return current.shots.slice(1).map((shot) => [shot])
})

/** Three screens sit in one row; two or four in pairs; one alone. */
const restColumns = computed(() => {
  const count = restGroups.value.length
  if (count === 3) return 'md:grid-cols-3'
  return count > 1 ? 'md:grid-cols-2' : ''
})

const BASE_TITLE = 'Jonas Glatz – Developer, AI & Design'

watchEffect(() => {
  const current = project.value
  document.title = current ? `${shortProjectName(current.name)} – Jonas Glatz` : BASE_TITLE
})

onBeforeUnmount(() => {
  document.title = BASE_TITLE
})
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main" class="px-gutter pt-[clamp(6.5rem,14vh,9rem)]">
      <RouterLink
        :to="{ name: 'home', hash: '#projects' }"
        class="group inline-flex items-center gap-2 text-base font-semibold hover:underline hover:decoration-2 hover:underline-offset-4"
      >
        <ArrowLeft v-bind="iconMotion" triggerTarget="parent" class="size-4.5" aria-hidden="true" />
        {{ t('projects.all') }}
      </RouterLink>

      <template v-if="project">
        <header class="mt-10 grid items-end gap-x-10 gap-y-8 lg:grid-cols-12">
          <h1
            class="text-[clamp(3.25rem,10vw,10rem)] leading-[0.86] font-black tracking-[-0.06em] break-words uppercase lg:col-span-8"
          >
            {{ shortProjectName(project.name) }}
          </h1>
          <p class="max-w-[38ch] text-lead font-medium text-pretty lg:col-span-4">
            {{ project.tagline }}
          </p>
        </header>

        <div class="mt-12 grid items-end gap-x-10 gap-y-8 lg:grid-cols-12">
          <dl class="grid grid-cols-2 gap-x-8 gap-y-5 text-base sm:grid-cols-4 lg:col-span-8">
            <div>
              <dt class="text-ink-faint">{{ t('projects.detail_year') }}</dt>
              <dd class="font-semibold">{{ project.year }}</dd>
            </div>
            <div>
              <dt class="text-ink-faint">{{ t('projects.detail_kind') }}</dt>
              <dd class="font-semibold">
                {{
                  project.categories
                    .map((category) => t(`projects.category_${category}`))
                    .join(', ')
                }}
              </dd>
            </div>
            <div>
              <dt class="text-ink-faint">{{ t('projects.detail_status') }}</dt>
              <dd class="font-semibold">{{ t(`projects.status_${project.status}`) }}</dd>
            </div>
            <div>
              <dt class="text-ink-faint">{{ t('projects.detail_code') }}</dt>
              <dd class="font-semibold">
                {{ project.repoUrl ? t('projects.code_public') : t('global.private_repository') }}
              </dd>
            </div>
          </dl>

          <div class="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <NxrButton v-if="project.liveUrl" :href="project.liveUrl">
              {{
                project.liveUrl.includes('/releases')
                  ? t('projects.download')
                  : t('global.open_live')
              }}
              <ArrowUpRight
                v-bind="iconMotion"
                triggerTarget="parent"
                class="size-4.5"
                aria-hidden="true"
              />
            </NxrButton>
            <NxrButton
              v-if="project.repoUrl"
              :href="project.repoUrl"
              :variant="project.liveUrl ? 'plain' : 'primary'"
            >
              {{ t('global.open_repository') }}
              <ArrowUpRight
                v-bind="iconMotion"
                triggerTarget="parent"
                class="size-4.5"
                aria-hidden="true"
              />
            </NxrButton>
          </div>
        </div>

        <div class="mt-12">
          <ProjectMedia :project is-eager />
        </div>

        <section
          v-if="detailBlocks.length"
          :aria-label="t('projects.detail_story')"
          class="mt-[clamp(4rem,8vw,7rem)] flex flex-col gap-10"
        >
          <div
            v-for="(block, index) in detailBlocks"
            :key="block.key"
            v-reveal="index % 2"
            class="grid gap-x-10 gap-y-3 lg:grid-cols-12"
          >
            <h2 class="text-section font-bold lg:col-span-4">{{ block.label }}</h2>
            <p class="max-w-[62ch] text-lead text-pretty lg:col-span-7 lg:col-start-6">
              {{ block.body }}
            </p>
          </div>

          <div v-reveal class="grid gap-x-10 gap-y-3 lg:grid-cols-12">
            <h2 class="text-section font-bold lg:col-span-4">{{ t('projects.detail_stack') }}</h2>
            <p class="text-lead lg:col-span-7 lg:col-start-6">{{ project.stack.join(', ') }}</p>
          </div>
        </section>

        <div
          v-if="restGroups.length"
          class="mt-[clamp(4rem,8vw,7rem)] grid gap-6"
          :class="restColumns"
        >
          <figure v-for="(group, index) in restGroups" :key="group[0]!.src" v-reveal="index % 3">
            <ProjectMedia :project :shots="group" />
            <figcaption class="mt-3 text-base text-ink-muted">
              {{ group.map((shot) => shot.label).join(', ') }}
            </figcaption>
          </figure>
        </div>

        <RouterLink
          :to="{ name: 'project-detail', params: { slug: nextProject.slug } }"
          class="group mt-section mb-[clamp(4rem,8vw,7rem)] block"
        >
          <span class="text-lead font-medium text-ink-muted">{{ t('projects.next') }}</span>
          <span
            class="mt-2 flex items-center gap-4 text-[clamp(2.75rem,8vw,8rem)] leading-[0.9] font-black tracking-[-0.06em] uppercase group-hover:text-link"
          >
            {{ shortProjectName(nextProject.name) }}
            <ArrowUpRight
              v-bind="iconMotion"
              triggerTarget="parent"
              class="size-[0.6em] shrink-0"
              aria-hidden="true"
            />
          </span>
        </RouterLink>
      </template>

      <p v-else class="mt-10 mb-section text-lead">{{ t('projects.not_found') }}</p>
    </main>

    <SiteFooter />
  </div>
</template>
