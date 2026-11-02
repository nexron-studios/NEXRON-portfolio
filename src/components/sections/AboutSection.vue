<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useI18n, I18nT } from 'vue-i18n'
import { useIntersectionObserver } from '@vueuse/core'
import { Box, Brain, Code, Cpu } from '@respeak/lucide-motion-vue'
import fadeArt from '@/assets/art/fade.png'
import kneelingKnightArt from '@/assets/art/knight-kneeling.png'
import shrineArt from '@/assets/art/shrine.png'
import wireArt from '@/assets/art/wire.png'
import { STUDY_HREF } from '@/data/experience'
import { skillGroups } from '@/data/skills'
import { identity } from '@/data/socials'
import { services, studioIntro } from '@/data/studio'
import { groupByDomain } from '@/utils/skillGrouping'
import { useIconMotion } from '@/composables/useIconMotion'
import DitherArt from '@/components/ui/DitherArt.vue'
import SkillIcon from '@/components/ui/SkillIcon.vue'
import type { SkillDomain } from '@/types/skill.type'

/**
 * Who is behind the work: the text in the left columns, Rodin's Thinker in
 * ASCII filling the right, then the trade (NEXRON Studios) with what it offers as
 * four big words with their marks, and every technology across the four
 * areas, each with its logo.
 *
 * No ground of its own: the star field runs behind this section like behind
 * the rest of the page (it used to be a black poster that hid the stars).
 */
const { t } = useI18n()
const { iconMotion } = useIconMotion()

const serviceIcons: Record<SkillDomain, typeof Code> = {
  dev: Code,
  infra: Cpu,
  ai: Brain,
  creative: Box
}

/** The four areas are labels, not controls, so they take the violet. */
const domainTone: Record<SkillDomain, string> = {
  dev: 'text-violet',
  infra: 'text-violet',
  ai: 'text-violet',
  creative: 'text-violet'
}

const domainSections = groupByDomain(skillGroups)
/**
 * The chrome NEXRON sign, the one 3D object left on the site. Three.js is
 * the heaviest chunk there is, so neither it nor the model is fetched until
 * the stage is within reach of the viewport.
 */
const LedSign = defineAsyncComponent(() => import('@/components/three/LedSign.vue'))

const signStage = ref<HTMLElement | null>(null)
const isSignNear = ref(false)

const { stop: stopSignObserver } = useIntersectionObserver(
  signStage,
  (entries) => {
    if (!entries[0]?.isIntersecting) return
    isSignNear.value = true
    stopSignObserver()
  },
  { rootMargin: '400px' }
)
</script>

<template>
  <section
    id="about"
    aria-labelledby="about-heading"
    class="mt-section overflow-x-clip pb-[clamp(3rem,9vw,9rem)]"
  >
    <!--
      The poster: the Thinker in ASCII fills the right half from the top of
      the section to the bottom of the text; the greeting is set at poster
      size over the left half, its full stop blinking like a cursor. On a
      phone the Thinker follows the text instead of sitting beside it.
    -->
    <div
      class="relative flex flex-col px-gutter pt-[clamp(2rem,9vw,8rem)] lg:block lg:min-h-[54rem]"
    >
      <!-- A shrine in halftone, from Jonas' collage: the robed figure with
           the raised hand under a crown of thorns, two angels and a knight
           beside it, four-pointed stars around them. It replaced Rodin's Thinker, which read as dull. The
           source is thresholded, so the photographed figure in the middle
           breaks into black gaps like the cut-out figures beside it. The
           top fades in a little and the bottom out, so the picture neither
           starts nor ends in a hard cut. -->
      <div
        class="pointer-events-none relative order-last mt-12 aspect-[1179/956] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:aspect-auto lg:w-[56%]"
      >
        <DitherArt
          :src="shrineArt"
          :cell="4"
          :strength="0.85"
          is-outlined
          class="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_62%,transparent)]"
        />
        <!-- A knight kneeling at the shrine's foot, from Jonas' mockup, in
             the shrine's halftone. The cut-out was grain, which the dots
             averaged into one grey field, so its source is blurred to tones
             and darkened in the mids. Its alpha is his silhouette: a void
             shape in it hides the shrine, or its dots would show through
             his dark armour. -->
        <div
          class="absolute bottom-0 left-[2%] aspect-[342/464] w-[30%] [mask-image:linear-gradient(to_bottom,black_88%,transparent)]"
        >
          <span
            aria-hidden="true"
            class="absolute inset-0 bg-void [mask-size:100%_100%]"
            :style="{ maskImage: `url(${kneelingKnightArt})` }"
          />
          <DitherArt
            :src="kneelingKnightArt"
            :cell="3"
            :strength="0.85"
            is-outlined
            class="absolute inset-0"
          />
        </div>
      </div>

      <!-- The white thorn wire from the same collage, behind the copy on
           wide screens; the copy comes later and stays on top. -->
      <DitherArt
        :src="wireArt"
        :cell="4"
        :strength="0.85"
        is-outlined
        class="pointer-events-none absolute top-[18%] left-[14%] hidden aspect-[610/765] w-[31%] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] lg:block"
      />

      <!-- A soft dark pool under the copy, so the wire and the shrine step
           back where the text sits and the eye lands on the words first. -->
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 left-0 hidden w-[64%] bg-[radial-gradient(ellipse_58%_46%_at_28%_42%,var(--color-void)_45%,transparent)] lg:block"
      />

      <div class="relative lg:w-[50%]">
        <h2
          id="about-heading"
          v-reveal.wipe
          class="text-[clamp(3.25rem,8.6vw,9.5rem)] leading-[0.84] font-black tracking-[-0.055em] uppercase"
        >
          {{ t('about.heading_top') }}<br />{{ t('about.heading_name')
          }}<span class="nx-cursor text-violet">.</span>
        </h2>

        <p
          v-reveal="1"
          class="mt-10 max-w-[30ch] text-[clamp(1.25rem,1.9vw,1.875rem)] leading-[1.25] font-semibold text-pretty"
        >
          <!-- The three things he does, in violet: emphasis, not links. -->
          <I18nT keypath="about.lead" tag="span" scope="global">
            <template #software>
              <span class="text-violet">{{ t('about.lead_software') }}</span>
            </template>
            <template #models>
              <span class="text-violet">{{ t('about.lead_models') }}</span>
            </template>
            <template #design>
              <span class="text-violet">{{ t('about.lead_design') }}</span>
            </template>
          </I18nT>
        </p>

        <div v-reveal="2" class="mt-8 flex max-w-[52ch] flex-col gap-4 text-pretty text-ink-muted">
          <!-- `I18nT`: the degree inside the sentence is a link. -->
          <I18nT keypath="about.body_1" tag="p" scope="global">
            <template #study>
              <a
                :href="STUDY_HREF"
                target="_blank"
                rel="noopener noreferrer"
                class="nx-link text-ink"
              >
                {{ t('about.study_link') }}
              </a>
            </template>
            <template #thesis>
              <strong class="font-semibold text-violet">{{ t('about.thesis_topic') }}</strong>
            </template>
          </I18nT>
          <I18nT keypath="about.body_3" tag="p" scope="global">
            <template #seam>
              <strong class="font-semibold text-violet">{{ t('about.seam') }}</strong>
            </template>
          </I18nT>
        </div>
      </div>
    </div>

    <!-- The studio: the chrome sign and what the trade is, side by side. -->
    <div
      class="mt-[clamp(4rem,8vw,7rem)] grid items-center gap-x-10 gap-y-6 px-gutter lg:grid-cols-12"
    >
      <!-- The canvas overhangs this box on every side (`LedSign` bleeds
           by 20 %), so a tilted sign still has room. -->
      <div ref="signStage" v-reveal class="relative mx-[8%] h-36 sm:h-44 lg:col-span-5 lg:mx-[6%]">
        <LedSign v-if="isSignNear" />
        <span class="sr-only">{{ t('about.sign_alt') }}</span>
      </div>
      <div v-reveal="1" class="lg:col-span-6 lg:col-start-7">
        <h3 class="text-section font-bold">{{ identity.brand }}</h3>
        <p class="mt-4 max-w-[56ch] text-lead text-pretty text-ink-muted">
          {{ studioIntro }}
        </p>
      </div>
    </div>

    <div class="mt-[clamp(5rem,10vw,9rem)] px-gutter">
      <h3 v-reveal class="text-section font-bold">{{ t('about.services_label') }}</h3>

      <!-- An index of four rows between hairlines, each word set on a violet
           halftone that runs out to the right, like a marker in print. It
           comes up with hover, the word steps aside. -->
      <ul class="mt-10 flex flex-col border-b border-ink/10">
        <li
          v-for="(service, index) in services"
          :key="service.id"
          v-reveal="index % 2"
          class="group/row relative grid items-center gap-x-10 gap-y-3 border-t border-ink/10 py-[clamp(1.5rem,2.6vw,2.25rem)] lg:grid-cols-12"
        >
          <DitherArt
            :src="fadeArt"
            :cell="7"
            tone="violet"
            :strength="0.5"
            fit="cover"
            class="pointer-events-none absolute inset-y-0 left-0 w-full opacity-60 transition-opacity duration-(--nx-dur-fast) ease-out group-hover/row:opacity-100 lg:w-[62%]"
          />
          <!-- The number sits in the row's top left corner, clear of the word. -->
          <span
            class="absolute top-3 left-3 text-sm font-bold text-ink-muted tabular-nums"
            aria-hidden="true"
          >
            0{{ index + 1 }}
          </span>
          <span
            class="group relative flex items-center gap-[0.3em] text-[clamp(2.25rem,5.4vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.05em] transition-transform duration-(--nx-dur-fast) ease-out group-hover/row:translate-x-3 lg:col-span-7"
          >
            <component
              :is="serviceIcons[service.domain]"
              v-bind="iconMotion"
              triggerTarget="parent"
              class="size-[0.7em] shrink-0"
              :class="domainTone[service.domain]"
              aria-hidden="true"
            />
            {{ service.label }}
          </span>
          <p class="relative max-w-[52ch] text-pretty text-ink-muted lg:col-span-5">
            {{ service.summary }}
          </p>
        </li>
      </ul>
    </div>

    <!-- The stack: four areas as numbered columns over a faint violet glow,
         every tool a chip with its mark that lifts and lights up on hover. -->
    <div class="relative mt-[clamp(5rem,10vw,9rem)] px-gutter">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 -inset-y-24 bg-[radial-gradient(ellipse_55%_45%_at_50%_55%,color-mix(in_oklab,var(--color-violet)_13%,transparent),transparent)]"
      />

      <div class="relative">
        <h3 v-reveal class="text-section font-bold">{{ t('about.tools_label') }}</h3>

        <div class="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          <section
            v-for="(section, index) in domainSections"
            :key="section.domain"
            v-reveal="index"
            class="border-t-2 border-violet/60 pt-5"
          >
            <div class="flex items-baseline justify-between gap-4">
              <h4 class="text-lead font-bold" :class="domainTone[section.domain]">
                {{ t(`about.domain_${section.domain}`) }}
              </h4>
              <span class="text-sm font-semibold text-ink-faint tabular-nums" aria-hidden="true">
                0{{ index + 1 }}
              </span>
            </div>

            <div v-for="group in section.groups" :key="group.id" class="mt-6">
              <h5 class="text-sm font-semibold tracking-[0.06em] text-ink-faint uppercase">
                {{ group.label }}
              </h5>
              <ul class="mt-3 flex flex-wrap gap-2">
                <!-- The reveal owns the item's transition, the hover the chip's. -->
                <li
                  v-for="(skill, skillIndex) in group.skills"
                  :key="skill.name"
                  v-reveal="Math.min(skillIndex, 8)"
                >
                  <span
                    class="group/chip flex items-center gap-2 rounded-md bg-ink/8 px-3 py-1.5 text-base font-medium ring-1 ring-ink/10 transition-[background-color,translate] duration-(--nx-dur-fast) ease-out hover:-translate-y-0.5 hover:bg-ink/14"
                  >
                    <SkillIcon
                      :name="skill.name"
                      class="size-4 shrink-0 transition-colors duration-(--nx-dur-fast) group-hover/chip:text-violet"
                    />
                    {{ skill.name }}
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>
