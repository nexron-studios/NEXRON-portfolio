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
import NxrStatusBadge from '@/components/ui/NxrStatusBadge.vue'

const { project } = defineProps<{ project: ProjectProps }>()

const { t } = useI18n()
const { localized } = useLocalizedText()
const { iconMotion } = useIconMotion()
const card = ref<HTMLElement | null>(null)

// Steeper than the old 3.5°: with the holo sheen on top the card is meant to
// read as a foil card being turned in the hand, and a barely-there tilt made
// the sweep look like a bug rather than a reflection.
useTilt(card, { maxAngle: 8 })

const primaryCategory = computed(() => project.categories[0] ?? 'web')
/** The first screen stands for the project; the rest live in the detail view. */
const coverShot = computed(() => project.shots[0] ?? null)
/** Long stacks turn the card into a tag cloud — the rest lives in the detail view. */
const visibleStack = computed(() => project.stack.slice(0, 5))
const hiddenStackCount = computed(() =>
  Math.max(project.stack.length - visibleStack.value.length, 0)
)
</script>

<template>
  <!--
    `nx-holo` adds the foil sheen and the scale pattern as two pseudo-elements,
    both driven by the same `--nx-px` / `--nx-py` that `useTilt` writes here.
    It is a component class rather than utilities because pseudo-elements and
    `mix-blend-mode` have no utility form — see `main.css`.
  -->
  <article
    ref="card"
    class="nx-panel nx-holo group relative flex flex-col overflow-hidden transition-colors duration-[--nx-dur] hover:border-line-strong"
    style="
      transform: perspective(900px) rotateX(var(--nx-tilt-x, 0deg)) rotateY(var(--nx-tilt-y, 0deg));
      transform-style: preserve-3d;
      transition:
        transform var(--nx-dur) var(--ease-out-expo),
        border-color var(--nx-dur);
    "
  >
    <!-- Pointer-tracked highlight: the card reacts to where the cursor is,
         not merely to the fact that it is somewhere on it. -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[--nx-dur] group-hover:opacity-100"
      style="
        background: radial-gradient(
          22rem circle at var(--nx-px, 50%) var(--nx-py, 50%),
          color-mix(in oklab, var(--color-dev) 8%, transparent),
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

    <!--
      The box stays the same on every card, whatever shape the screens are —
      a grid of cards that each set their own height reads as broken. What
      changes is the fit: a wide screen fills it, a phone is set inside it on
      the dark ground rather than being cropped to a letterbox slice.
    -->
    <div class="relative aspect-[300/160] overflow-hidden border-b border-line bg-void">
      <img
        v-if="coverShot"
        :src="coverShot.src"
        :alt="`${project.name} — ${localized(coverShot.label)}`"
        loading="lazy"
        decoding="async"
        class="h-full w-full"
        :class="project.shotOrientation === 'portrait' ? 'object-contain p-2' : 'object-cover'"
      />
      <NxrBlueprintVisual v-else :seed="project.slug" :category="primaryCategory" />
    </div>

    <div class="flex flex-1 flex-col gap-4 p-4">
      <p class="text-sm leading-relaxed text-pretty text-ink-muted">
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
