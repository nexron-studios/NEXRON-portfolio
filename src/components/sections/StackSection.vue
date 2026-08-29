<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMediaQuery } from '@vueuse/core'
import { Boxes, ChevronDown } from '@respeak/lucide-motion-vue'
import { skillGroups } from '@/data/skills'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { useIconMotion } from '@/composables/useIconMotion'
import NxrSkillChip from '@/components/ui/NxrSkillChip.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()
const { iconMotion } = useIconMotion()

const SkillPit = defineAsyncComponent(() => import('@/components/three/SkillPit.vue'))

/**
 * The pit carries the tech stack visually. On touch the full text list starts
 * open, since compact devices should not hide information behind hover.
 */
const canHover = useMediaQuery('(hover: hover)')

</script>

<template>
  <div>
    <!-- The pit first: it says "these are the tools" faster than a list can -->
    <div class="relative h-[19rem] w-full overflow-hidden rounded-xl sm:h-[22rem]">
      <SkillPit />
    </div>

    <!--
      Native <details>: keyboard support, screen-reader semantics and the open
      state all come for free, and it keeps the full stack in the document for
      anyone reading without a pointer.
    -->
    <details :open="!canHover" class="group mt-8 border-t border-line pt-6">
      <summary
        class="nx-meta flex cursor-pointer list-none items-center gap-2.5 text-ink transition-colors hover:text-dev marker:content-none"
      >
        <Boxes class="size-4 shrink-0" aria-hidden="true" />
        {{ t('stack.show_all') }}
        <ChevronDown
          v-bind="iconMotion"
          triggerTarget="parent"
          class="size-3.5 shrink-0 transition-transform duration-[--nx-dur] group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div class="mt-8 flex flex-col gap-8">
        <section
          v-for="group in skillGroups"
          :key="group.id"
          class="grid gap-4 border-t border-line pt-6 first:border-t-0 first:pt-0 md:grid-cols-12 md:gap-8"
        >
          <h3 class="nx-meta flex items-center gap-3 text-ink-muted md:col-span-3">
            <span class="size-1.5 shrink-0 bg-ink" aria-hidden="true" />
            <span>{{ localized(group.label) }}</span>
          </h3>

          <ul class="flex flex-wrap gap-2 md:col-span-9">
            <li v-for="skill in group.skills" :key="skill.name">
              <NxrSkillChip :skill :domain="group.domain" />
            </li>
          </ul>
        </section>
      </div>
    </details>
  </div>
</template>
