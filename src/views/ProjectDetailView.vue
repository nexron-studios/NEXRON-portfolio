<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowLeft, ArrowUpRight } from '@respeak/lucide-motion-vue'
import { getProjectBySlug } from '@/data/projects'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { useIconMotion } from '@/composables/useIconMotion'
import AppFooter from '@/components/layout/AppFooter.vue'
import BlueprintBackdrop from '@/components/layout/BlueprintBackdrop.vue'
import NxrBlueprintVisual from '@/components/ui/NxrBlueprintVisual.vue'
import NxrCornerTicks from '@/components/ui/NxrCornerTicks.vue'
import NxrStatusBadge from '@/components/ui/NxrStatusBadge.vue'

const { slug } = defineProps<{ slug: string }>()

const { t } = useI18n()
const { localized } = useLocalizedText()
const { iconMotion } = useIconMotion()

const project = computed(() => getProjectBySlug(slug))

const detailBlocks = computed(() => {
  const detail = project.value?.detail
  if (!detail) return []

  return [
    { key: 'overview', label: t('projects.detail_overview'), body: localized(detail.overview) },
    { key: 'problem', label: t('projects.detail_problem'), body: localized(detail.problem) },
    { key: 'idea', label: t('projects.detail_idea'), body: localized(detail.idea) },
    {
      key: 'implementation',
      label: t('projects.detail_implementation'),
      body: localized(detail.implementation)
    }
  ]
})

/** Empty until Jonas fills them in — the section hides rather than showing a stub. */
const challenges = computed(() => project.value?.detail?.challenges.map(localized) ?? [])
const learnings = computed(() => project.value?.detail?.learnings.map(localized) ?? [])

const BASE_TITLE = 'Jonas Glatz – Developer, AI & Creative Technology'

watchEffect(() => {
  const current = project.value
  document.title = current ? `${current.name} – Jonas Glatz` : BASE_TITLE
})

onMounted(() => {
  window.scrollTo({ top: 0 })
})

onBeforeUnmount(() => {
  document.title = BASE_TITLE
})
</script>

<template>
  <div class="relative min-h-screen">
    <BlueprintBackdrop />

    <div class="mx-auto w-full max-w-[68rem] px-gutter py-16">
      <RouterLink
        to="/#projects"
        class="nx-meta group inline-flex items-center gap-2 text-ink-faint transition-colors hover:text-dev"
      >
        <ArrowLeft
          v-bind="iconMotion"
          triggerTarget="parent"
          class="size-3.5 shrink-0"
          aria-hidden="true"
        />
        {{ t('global.back') }}
      </RouterLink>

      <template v-if="project">
        <header class="mt-10 border-b border-line pb-8">
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
            <NxrStatusBadge :status="project.status" />
            <span class="nx-meta">{{ project.year }}</span>
            <span class="nx-meta">
              {{ project.categories.map((category) => t(`projects.category_${category}`)).join(' · ') }}
            </span>
          </div>

          <h1 class="mt-5 font-display text-section font-bold text-balance">
            {{ project.name }}
          </h1>

          <p class="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted text-pretty">
            {{ localized(project.tagline) }}
          </p>

          <div class="mt-7 flex flex-wrap items-center gap-3">
            <a
              v-if="project.repoUrl"
              :href="project.repoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="nx-meta inline-flex items-center gap-2 border border-line px-4 py-2.5 text-ink-muted transition-colors hover:border-dev hover:text-dev"
            >
              {{ t('global.open_repository') }}
              <ArrowUpRight
                v-bind="iconMotion"
                triggerTarget="parent"
                class="size-3.5 shrink-0"
                aria-hidden="true"
              />
            </a>
            <a
              v-if="project.liveUrl"
              :href="project.liveUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="nx-meta inline-flex items-center gap-2 border border-dev bg-dev/10 px-4 py-2.5 text-dev"
            >
              {{ t('global.open_live') }}
              <ArrowUpRight
                v-bind="iconMotion"
                triggerTarget="parent"
                class="size-3.5 shrink-0"
                aria-hidden="true"
              />
            </a>
            <span
              v-if="!project.repoUrl"
              class="nx-meta flex items-center gap-2 border border-line px-4 py-2.5 text-ink-faint"
            >
              <span aria-hidden="true" class="h-1 w-1 bg-ink-faint" />
              {{ t('global.private_repository') }}
            </span>
          </div>
        </header>

        <div class="relative mt-10 aspect-[21/9] max-h-80 overflow-hidden border border-line">
          <NxrCornerTicks />
          <img
            v-if="project.image"
            :src="project.image"
            :alt="project.name"
            class="h-full w-full object-cover"
          />
          <NxrBlueprintVisual
            v-else
            :seed="project.slug"
            :category="project.categories[0] ?? 'web'"
          />
        </div>

        <div class="mt-14 grid gap-12 lg:grid-cols-12">
          <div class="flex flex-col gap-10 lg:col-span-8">
            <section v-for="block in detailBlocks" :key="block.key">
              <h2 class="nx-meta flex items-center gap-4 text-dev">
                {{ block.label }}
                <span class="h-px flex-1 bg-line" />
              </h2>
              <p class="mt-4 text-lg leading-relaxed text-ink-muted text-pretty">
                {{ block.body }}
              </p>
            </section>

            <section v-if="challenges.length > 0">
              <h2 class="nx-meta flex items-center gap-4 text-dev">
                {{ t('projects.detail_challenges') }}
                <span class="h-px flex-1 bg-line" />
              </h2>
              <ul class="mt-4 flex flex-col gap-3">
                <li
                  v-for="(entry, index) in challenges"
                  :key="index"
                  class="border-l border-line pl-4 text-ink-muted"
                >
                  {{ entry }}
                </li>
              </ul>
            </section>

            <section v-if="learnings.length > 0">
              <h2 class="nx-meta flex items-center gap-4 text-dev">
                {{ t('projects.detail_learnings') }}
                <span class="h-px flex-1 bg-line" />
              </h2>
              <ul class="mt-4 flex flex-col gap-3">
                <li
                  v-for="(entry, index) in learnings"
                  :key="index"
                  class="border-l border-line pl-4 text-ink-muted"
                >
                  {{ entry }}
                </li>
              </ul>
            </section>
          </div>

          <aside class="lg:col-span-4">
            <h2 class="nx-meta text-dev">{{ t('projects.detail_stack') }}</h2>
            <ul class="mt-4 flex flex-col">
              <li
                v-for="tech in project.stack"
                :key="tech"
                class="border-b border-line py-2.5 font-mono text-sm text-ink-muted"
              >
                {{ tech }}
              </li>
            </ul>
          </aside>
        </div>
      </template>

      <p v-else class="mt-16 font-mono text-sm text-ink-muted">
        {{ t('projects.not_found') }}
      </p>
    </div>

    <AppFooter />
  </div>
</template>
