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
import NxrSceneLoader from '@/components/ui/NxrSceneLoader.vue'
import NxrTerminal from '@/components/ui/NxrTerminal.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()

/** What the terminal commands are allowed to know about the page. */
const terminalContext = {
  projectCount: projects.length,
  skillCount: pitSkills.length,
  email: identity.email
}

// The chunk and the model file arrive one after the other; the same loader
// stands in for both, so the stage never sits empty and then fills in.
const LedSign = defineAsyncComponent({
  loader: () => import('@/components/three/LedSign.vue'),
  loadingComponent: NxrSceneLoader
})
const PeekCharacter = defineAsyncComponent(() => import('@/components/three/PeekCharacter.vue'))

// Same reasoning as the sign below, and the same gate: a decorative WebGL scene
// has no business existing until the block it belongs to is within reach.
const peekStage = ref<HTMLElement | null>(null)
const isPeekNear = ref(false)

const { stop: stopPeekObserver } = useIntersectionObserver(
  peekStage,
  (entries) => {
    if (!entries[0]?.isIntersecting) return
    isPeekNear.value = true
    stopPeekObserver()
  },
  { rootMargin: '400px' }
)

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
        <div ref="peekStage" class="relative lg:col-span-6 lg:col-start-7">
          <!--
            The figure rises out of the terminal's top edge. `overflow-hidden`
            is the edge it climbs out of; the panel below covers the cut. `z-0`
            rather than a negative z on purpose — the section is only
            `position: relative`, so a negative z would escape it and land in
            the same layer as the page backdrop.
          -->
          <!--
            `h-48`, not `h-40`, with `TOP_MARGIN_SHARE` in `three/peekCharacter.ts`
            raised to match: the figure is fitted to this box, and the cap's
            front stands half the model's depth towards the camera, where
            perspective made it cross the top edge at rest. Together the two
            keep the figure the same size and give the head room to look up.
          -->
          <div
            class="pointer-events-none absolute inset-x-0 bottom-full z-0 hidden h-48 overflow-hidden lg:block"
          >
            <PeekCharacter v-if="isPeekNear" />
          </div>

          <NxrTerminal
            class="relative z-10"
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

        <!--
          Shallower than it was (`h-56 sm:h-64 lg:h-72`): the sign is a 3.4:1
          plate fitted by width, so most of a tall box was air above and below
          it, which read as a gap between the mark and its text. The canvas
          overhangs the box by `STAGE_BLEED`, so a tilt still has room.

          Capped at `max-w-56` on a phone: the sign is fitted to the box's
          width, and a full-width box put it edge to edge across the screen,
          twice the size of the brand name it introduces. The box, not a fit
          share in the scene, is the knob — the sign fills whatever it is given.
        -->
        <div
          ref="markStage"
          class="relative mt-2 h-24 w-full max-w-56 sm:h-44 sm:max-w-none lg:h-52"
        >
          <LedSign v-if="isMarkStageNear" />
          <span class="sr-only">{{ t('about.mark_alt') }}</span>
        </div>

        <p class="relative z-10 mt-2 font-display text-xl font-bold tracking-tight">
          {{ identity.brand }}
        </p>
        <p class="relative z-10 mt-3 leading-relaxed text-pretty text-ink-muted">
          {{ localized(studioIntro) }}
        </p>
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
