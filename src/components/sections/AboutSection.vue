<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TerminalLineProps } from '@/types/terminal.type'
import type { SkillDomain } from '@/types/skill.type'
import { services, studioIntro } from '@/data/studio'
import { identity } from '@/data/socials'
import { projects } from '@/data/projects'
import { pitSkills } from '@/data/skills'
import { useLocalizedText } from '@/composables/useLocalizedText'
import NxrTerminal from '@/components/ui/NxrTerminal.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()

/** What the terminal commands are allowed to know about the page. */
const terminalContext = {
  projectCount: projects.length,
  skillCount: pitSkills.length,
  email: identity.email
}

const facts = computed(() => [
  { label: t('about.fact_focus'), value: localized(identity.role) },
  { label: t('about.fact_since'), value: '2023' },
  { label: t('about.fact_location'), value: identity.location }
])

const ChromeMark = defineAsyncComponent(() => import('@/components/three/ChromeMark.vue'))

const domainClass: Record<SkillDomain, string> = {
  dev: 'text-dev',
  ai: 'text-ai',
  creative: 'text-creative',
  infra: 'text-infra'
}

// Deliberately untranslated: a shell prompt is a shell prompt in either
// language.
const terminalLines: TerminalLineProps[] = [
  { command: 'whoami', output: ['Jonas Glatz'] },
  { command: 'current-focus', output: ['AI · Software · 3D'] },
  {
    command: 'cat philosophy.json',
    output: ['{', '  "mode": "building",', '  "method": "learn by doing"', '}']
  },
  { command: 'coffee --status', output: ['running'] }
]
</script>

<template>
  <div class="flex flex-col gap-20">
    <!--
      The intro used to be a heading over three equal paragraphs, which read as
      one grey slab. Now the first sentence carries the weight, a measurement
      strip breaks the column, and the rest sits in two narrow columns that the
      eye can take in at a glance.
    -->
    <div>
      <h3 class="max-w-3xl font-display text-section font-bold text-balance">
        {{ t('about.heading') }}
        <span class="text-dev">{{ t('about.lead') }}</span>
      </h3>

      <dl class="mt-10 flex flex-wrap gap-x-12 gap-y-5 border-y border-line py-5">
        <div v-for="fact in facts" :key="fact.label">
          <dt class="nx-meta">{{ fact.label }}</dt>
          <dd class="mt-1.5 font-mono text-sm text-ink">{{ fact.value }}</dd>
        </div>
      </dl>

      <div class="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div class="flex flex-col gap-5 leading-relaxed text-ink-muted lg:col-span-6 xl:col-span-5">
          <p class="text-pretty">{{ t('about.body_1') }}</p>
          <p class="text-pretty">{{ t('about.body_2') }}</p>
          <p class="text-pretty">{{ t('about.body_3') }}</p>
        </div>

        <!-- Offset into the last columns rather than filling the row — the
             empty column is what keeps the layout from reading as a slab. -->
        <div class="lg:col-span-6 lg:col-start-7">
          <NxrTerminal :lines="terminalLines" :context="terminalContext" />
        </div>
      </div>
    </div>

    <!-- The trade itself: the mark, then what it actually does -->
    <div class="grid gap-12 border-t border-line pt-12 lg:grid-cols-12 lg:gap-10">
      <div class="lg:col-span-4">
        <p class="nx-meta">{{ t('about.studio_label') }}</p>

        <div class="relative mt-6 h-56 w-full sm:h-64 lg:h-72">
          <ChromeMark />
          <span class="sr-only">{{ t('about.mark_alt') }}</span>
        </div>

        <p class="mt-6 font-display text-xl font-bold tracking-tight">{{ identity.brand }}</p>
        <p class="mt-3 leading-relaxed text-ink-muted text-pretty">{{ localized(studioIntro) }}</p>
      </div>

      <div class="lg:col-span-8 lg:col-start-5">
        <p class="nx-meta">{{ t('about.services_label') }}</p>

        <ul class="mt-6 grid gap-3 sm:grid-cols-2">
          <li
            v-for="service in services"
            :key="service.id"
            class="nx-panel relative p-5 transition-colors duration-[--nx-dur-fast] hover:border-line-strong sm:min-h-44 sm:p-7"
          >

            <h4 class="nx-meta" :class="domainClass[service.domain]">
              {{ localized(service.label) }}
            </h4>
            <p class="mt-4 leading-relaxed text-ink-muted text-pretty">
              {{ localized(service.summary) }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
