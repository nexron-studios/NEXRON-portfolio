<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { projects } from '@/data/projects'
import { projectCategoryList, type ProjectCategory } from '@/types/project.type'
import ProjectCard from '@/components/ui/ProjectCard.vue'
import ClientsStrip from '@/components/sections/ClientsStrip.vue'

/**
 * The client strip is built and wired but not shown yet — `src/data/clients.ts`
 * is empty on purpose. Flip this once there are names to put there.
 */
const IS_CLIENTS_VISIBLE = false

const { t } = useI18n()

const activeCategory = ref<ProjectCategory | null>(null)

/** Only offer filters that would actually return something. */
const availableCategories = computed(() =>
  projectCategoryList.filter((category) =>
    projects.some((project) => project.categories.includes(category))
  )
)

const visibleProjects = computed(() => {
  const category = activeCategory.value
  if (!category) return projects
  return projects.filter((project) => project.categories.includes(category))
})

const setCategory = (category: ProjectCategory | null): void => {
  activeCategory.value = category
}
</script>

<template>
  <div>
    <div
      class="flex flex-wrap items-center gap-1.5"
      role="group"
      :aria-label="t('projects.filter_label')"
    >
      <button
        type="button"
        class="border px-3 py-1.5 font-mono text-meta tracking-[0.16em] uppercase transition-colors duration-[--nx-dur-fast]"
        :class="
          activeCategory === null
            ? 'border-dev bg-dev/10 text-dev'
            : 'border-line text-ink-faint hover:border-line-strong hover:text-ink-muted'
        "
        :aria-pressed="activeCategory === null"
        @click="setCategory(null)"
      >
        {{ t('projects.filter_all') }}
      </button>

      <button
        v-for="category in availableCategories"
        :key="category"
        type="button"
        class="border px-3 py-1.5 font-mono text-meta tracking-[0.16em] uppercase transition-colors duration-[--nx-dur-fast]"
        :class="
          activeCategory === category
            ? 'border-dev bg-dev/10 text-dev'
            : 'border-line text-ink-faint hover:border-line-strong hover:text-ink-muted'
        "
        :aria-pressed="activeCategory === category"
        @click="setCategory(category)"
      >
        {{ t(`projects.category_${category}`) }}
      </button>
    </div>

    <TransitionGroup
      tag="div"
      name="rise"
      class="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      role="list"
    >
      <ProjectCard
        v-for="project in visibleProjects"
        :key="project.slug"
        :project
        role="listitem"
      />
    </TransitionGroup>

    <p v-if="visibleProjects.length === 0" class="nx-meta mt-10">
      {{ t('projects.empty') }}
    </p>

    <ClientsStrip v-if="IS_CLIENTS_VISIBLE" />
  </div>
</template>
