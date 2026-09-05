<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMediaQuery } from '@vueuse/core'
import { Boxes, ChevronDown } from '@respeak/lucide-motion-vue'
import { skillGroups } from '@/data/skills'
import type { SkillDomain } from '@/types/skill.type'
import { groupByDomain } from '@/utils/skillGrouping'
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

/**
 * The written list, arranged as the four chambers above it. Static data, so it
 * is computed once rather than per render.
 */
const domainSections = groupByDomain(skillGroups)

const domainClass: Record<SkillDomain, string> = {
  dev: 'text-dev',
  ai: 'text-ai',
  creative: 'text-creative',
  infra: 'text-infra'
}
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
    <details :open="!canHover" class="group mt-8">
      <summary
        class="nx-meta flex cursor-pointer list-none items-center gap-2.5 text-ink transition-colors marker:content-none hover:text-dev"
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

      <!--
        One block per chamber, in chamber order and under the chamber's own
        name: the list is the pit spelled out, not a second inventory sorted
        differently.
      -->
      <div class="mt-8 flex flex-col gap-10">
        <section v-for="section in domainSections" :key="section.domain">
          <h3 class="nx-meta flex items-center gap-3" :class="domainClass[section.domain]">
            <span class="size-1.5 shrink-0 bg-current" aria-hidden="true" />
            <span>{{ t(`stack.domain_${section.domain}`) }}</span>
          </h3>

          <div class="mt-5 flex flex-col gap-5">
            <div
              v-for="group in section.groups"
              :key="group.id"
              class="grid gap-3 md:grid-cols-12 md:gap-8"
            >
              <h4 class="nx-meta text-ink-muted md:col-span-3">{{ localized(group.label) }}</h4>

              <ul class="flex flex-wrap gap-2 md:col-span-9">
                <li v-for="skill in group.skills" :key="skill.name">
                  <NxrSkillChip :skill :domain="group.domain" />
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </details>
  </div>
</template>
