<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { skillGroups } from '@/data/skills'
import { useLocalizedText } from '@/composables/useLocalizedText'
import NxrCornerTicks from '@/components/ui/NxrCornerTicks.vue'
import NxrSkillChip from '@/components/ui/NxrSkillChip.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()

const InteractiveOrbs = defineAsyncComponent(
  () => import('@/components/three/InteractiveOrbs.vue')
)
</script>

<template>
  <div>
    <!-- The field first: it says "these are the tools" faster than a list can -->
    <div class="relative h-[22rem] w-full sm:h-[26rem]">
      <NxrCornerTicks />
      <InteractiveOrbs />

      <p class="nx-meta pointer-events-none absolute bottom-3 left-3 hidden md:block">
        {{ t('stack.orbs_hint') }}
      </p>
    </div>

    <div class="mt-14 flex flex-col gap-8">
      <section
        v-for="group in skillGroups"
        :key="group.id"
        class="grid gap-4 border-t border-line pt-6 md:grid-cols-12 md:gap-8"
      >
        <h3
          class="nx-meta md:col-span-3"
          :class="group.domain === 'creative' ? 'text-creative' : 'text-dev'"
        >
          {{ localized(group.label) }}
        </h3>

        <ul class="flex flex-wrap gap-2 md:col-span-9">
          <li v-for="skill in group.skills" :key="skill.name">
            <NxrSkillChip :skill :domain="group.domain" />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
