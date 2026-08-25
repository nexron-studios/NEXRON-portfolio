<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowUpRight } from '@respeak/lucide-motion-vue'
import type { ProjectProps } from '@/types/project.type'
import { useTilt } from '@/composables/useTilt'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { useIconMotion } from '@/composables/useIconMotion'
import NxrBlueprintVisual from '@/components/ui/NxrBlueprintVisual.vue'
import NxrCornerTicks from '@/components/ui/NxrCornerTicks.vue'
import NxrStatusBadge from '@/components/ui/NxrStatusBadge.vue'

const { project } = defineProps<{ project: ProjectProps }>()

const { t } = useI18n()
const { localized } = useLocalizedText()
const { iconMotion } = useIconMotion()
const card = ref<HTMLElement | null>(null)

useTilt(card, { maxAngle: 3.5 })

const primaryCategory = computed(() => project.categories[0] ?? 'web')
/** Long stacks turn the card into a tag cloud — the rest lives in the detail view. */
const visibleStack = computed(() => project.stack.slice(0, 5))
const hiddenStackCount = computed(() => Math.max(project.stack.length - visibleStack.value.length, 0))
</script>

<template>
  <article
    ref="card"
    class="nx-panel group relative flex flex-col transition-colors duration-[--nx-dur] hover:border-line-strong"
    style="
      transform: perspective(900px) rotateX(var(--nx-tilt-x, 0deg)) rotateY(var(--nx-tilt-y, 0deg));
      transform-style: preserve-3d;
      transition:
        transform var(--nx-dur) var(--ease-out-expo),
        border-color var(--nx-dur);
    "
  >
    <NxrCornerTicks />

    <!-- Pointer-tracked highlight: the card reacts to where the cursor is,
         not merely to the fact that it is somewhere on it. -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[--nx-dur] group-hover:opacity-100"
      style="
        background: radial-gradient(
          22rem circle at var(--nx-px, 50%) var(--nx-py, 50%),
          rgb(46 232 255 / 0.06),
          transparent 70%
        );
      "
    />

    <header class="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
      <h3 class="font-mono text-sm text-ink">
        <RouterLink
          :to="`/projects/${project.slug}`"
          class="after:absolute after:inset-0 after:content-[''] hover:text-dev"
        >
          {{ project.name }}
        </RouterLink>
      </h3>
      <NxrStatusBadge :status="project.status" />
    </header>

    <div class="relative aspect-[300/160] overflow-hidden border-b border-line">
      <img
        v-if="project.image"
        :src="project.image"
        :alt="project.name"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover"
      />
      <NxrBlueprintVisual v-else :seed="project.slug" :category="primaryCategory" />
    </div>

    <div class="flex flex-1 flex-col gap-4 p-4">
      <p class="text-sm leading-relaxed text-ink-muted text-pretty">
        {{ localized(project.tagline) }}
      </p>

      <ul class="mt-auto flex flex-wrap gap-1.5">
        <li
          v-for="tech in visibleStack"
          :key="tech"
          class="border border-line px-2 py-1 font-mono text-[0.625rem] tracking-wider text-ink-faint"
        >
          {{ tech }}
        </li>
        <li
          v-if="hiddenStackCount > 0"
          class="px-2 py-1 font-mono text-[0.625rem] tracking-wider text-ink-faint/70"
        >
          +{{ hiddenStackCount }}
        </li>
      </ul>
    </div>

    <footer class="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
      <span class="nx-meta">
        {{ project.year }} · {{ t(`projects.category_${primaryCategory}`) }}
      </span>

      <!-- z-10 lifts this above the stretched title link so it stays its own
           target instead of being swallowed by the card-wide click area. -->
      <a
        v-if="project.repoUrl"
        :href="project.repoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="nx-meta relative z-10 inline-flex items-center gap-1.5 text-ink-faint transition-colors hover:text-dev"
      >
        {{ t('global.open_repository') }}
        <ArrowUpRight
          v-bind="iconMotion"
          triggerTarget="parent"
          class="size-3.5 shrink-0"
          aria-hidden="true"
        />
      </a>
      <span v-else class="nx-meta flex items-center gap-1.5 text-ink-faint/70">
        <span aria-hidden="true" class="h-1 w-1 bg-ink-faint/70" />
        {{ t('global.private_repository') }}
      </span>
    </footer>
  </article>
</template>
