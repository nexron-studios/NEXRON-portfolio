<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { I18nT, useI18n } from 'vue-i18n'
import { useIntersectionObserver } from '@vueuse/core'
import type { TerminalLineProps } from '@/types/terminal.type'
import type { SkillDomain } from '@/types/skill.type'
import { services, studioIntro } from '@/data/studio'
import { STUDY_HREF } from '@/data/experience'
import { identity } from '@/data/socials'
import { projects } from '@/data/projects'
import { pitSkills } from '@/data/skills'
import { useLocalizedText } from '@/composables/useLocalizedText'
import NxrDialog from '@/components/ui/NxrDialog.vue'
import NxrTerminal from '@/components/ui/NxrTerminal.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()

/** What the terminal commands are allowed to know about the page. */
const terminalContext = {
  projectCount: projects.length,
  skillCount: pitSkills.length,
  email: identity.email
}

const LedSign = defineAsyncComponent(() => import('@/components/three/LedSign.vue'))

// The sign's model file is four megabytes. It is decoration over copy that
// stands on its own, so neither the chunk nor the model is fetched until the
// block is within reach of the viewport.
const markStage = ref<HTMLElement | null>(null)
const isMarkStageNear = ref(false)

const { stop: stopMarkObserver } = useIntersectionObserver(
  markStage,
  (entries) => {
    if (!entries[0]?.isIntersecting) return
    isMarkStageNear.value = true
    stopMarkObserver()
  },
  { rootMargin: '400px' }
)

// Lazy for the same reason as the 3D mark: most visitors never type `tetris`,
// and a game nobody opened has no business in the first payload.
const NxrTetrisGame = defineAsyncComponent(() => import('@/components/ui/NxrTetrisGame.vue'))

const isTetrisOpen = ref(false)

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
  { command: 'current-focus', output: ['AI · Software · 3D & Design'] },
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
      The first sentence carries the weight; the rest sits in a narrow column
      beside the terminal, short enough to take in at a glance. A measurement
      strip used to break the two apart, but it repeated the role, the location
      and the start of the degree — all three already stated in the hero.
    -->
    <div>
      <h3 class="max-w-3xl font-display text-section font-bold text-balance">
        {{ t('about.heading') }}
        <span class="text-dev">{{ t('about.lead') }}</span>
      </h3>

      <div class="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div class="flex flex-col gap-5 leading-relaxed text-ink-muted lg:col-span-6 xl:col-span-5">
          <!-- `I18nT` rather than a stitched-together sentence: the degree is a
               link, and the clause it sits in lands in a different place in
               German than in English. -->
          <I18nT keypath="about.body_1" tag="p" class="text-pretty" scope="global">
            <template #study>
              <a
                :href="STUDY_HREF"
                target="_blank"
                rel="noopener noreferrer"
                class="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-dev hover:decoration-dev"
              >
                {{ t('about.study_link') }}
              </a>
            </template>
          </I18nT>
          <p class="text-pretty">{{ t('about.body_2') }}</p>
          <p class="text-pretty">{{ t('about.body_3') }}</p>
        </div>

        <!-- Offset into the last columns rather than filling the row — the
             empty column is what keeps the layout from reading as a slab. -->
        <div class="lg:col-span-6 lg:col-start-7">
          <NxrTerminal
            :lines="terminalLines"
            :context="terminalContext"
            @action="isTetrisOpen = true"
          />

          <NxrDialog
            :open="isTetrisOpen"
            :title="t('tetris.title')"
            :close-label="t('tetris.close')"
            @close="isTetrisOpen = false"
          >
            <NxrTetrisGame />
          </NxrDialog>
        </div>
      </div>
    </div>

    <!-- The trade itself: the mark, then what it actually does -->
    <div class="grid gap-12 border-t border-line pt-12 lg:grid-cols-12 lg:gap-10">
      <div class="lg:col-span-4">
        <p class="nx-meta">{{ t('about.studio_label') }}</p>

        <div ref="markStage" class="relative mt-6 h-56 w-full sm:h-64 lg:h-72">
          <LedSign v-if="isMarkStageNear" />
          <span class="sr-only">{{ t('about.mark_alt') }}</span>
        </div>

        <p class="mt-6 font-display text-xl font-bold tracking-tight">{{ identity.brand }}</p>
        <p class="mt-3 leading-relaxed text-pretty text-ink-muted">{{ localized(studioIntro) }}</p>
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
            <p class="mt-4 leading-relaxed text-pretty text-ink-muted">
              {{ localized(service.summary) }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
