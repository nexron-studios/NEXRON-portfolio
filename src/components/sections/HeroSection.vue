<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight } from '@respeak/lucide-motion-vue'
import { identity, socials } from '@/data/socials'
import { brandIcons, isMotionBrand } from '@/components/ui/brand'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { useIconMotion } from '@/composables/useIconMotion'
import NxrButton from '@/components/ui/NxrButton.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()
const { iconMotion } = useIconMotion()

// three lives in its own chunk — the hero text paints without waiting for it.
const HeroScene = defineAsyncComponent(() => import('@/components/three/HeroScene.vue'))

/**
 * Only the three that belong above the fold. The full set — both Instagram
 * accounts, Spotify — gets its own card grid above the footer, and repeating
 * all six here would turn the spec strip into a link dump.
 */
const HERO_SOCIAL_IDS = ['github', 'linkedin', 'mail']

const heroSocials = socials.filter((entry) => HERO_SOCIAL_IDS.includes(entry.id))
</script>

<template>
  <section id="index" class="relative flex min-h-svh items-center pt-32 pb-10 sm:pt-28 lg:pt-16">
    <div class="mx-auto grid w-full max-w-[88rem] gap-8 px-gutter lg:grid-cols-12">
      <!-- Identity block, offset off-centre against the 12-column grid -->
      <div class="lg:col-span-7 lg:pt-8 xl:col-span-6">
        <!-- Says what this is before the name does: a founder portfolio, not
             a CV page. -->
        <p class="nx-meta flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span class="text-dev">01</span>
          <span class="h-px w-8 bg-line-strong" />
          <span class="text-dev">{{ t('hero.kicker') }}</span>
          <span aria-hidden="true" class="text-ink-faint">·</span>
          <!-- `text-ink` rather than `.nx-meta`'s faint default: this is the one
               name on the line that has to survive being read at a glance, and
               next to the violet kicker the faint tone lost it. -->
          <span class="text-ink">{{ identity.brand }}</span>
        </p>

        <h1 class="mt-6 font-display text-display font-bold text-balance lg:mt-8">
          {{ identity.name }}
        </h1>

        <p class="mt-4 font-mono text-sm tracking-wide text-dev lg:mt-6">
          {{ localized(identity.role) }}
        </p>

        <p class="mt-4 max-w-lg text-lg leading-relaxed text-pretty text-ink-muted lg:mt-6">
          {{ localized(identity.tagline) }}
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3 lg:mt-10">
          <NxrButton href="#projects">{{ t('hero.explore_projects') }}</NxrButton>
          <NxrButton href="#about" variant="ghost">{{ t('hero.about_me') }}</NxrButton>
        </div>

        <!-- Compact location and contact strip -->
        <dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-5 lg:mt-12 lg:pt-6">
          <div>
            <dt class="nx-meta">{{ t('hero.location') }}</dt>
            <dd class="mt-1.5 font-mono text-sm text-ink">{{ identity.location }}</dd>
          </div>

          <div>
            <dt class="nx-meta sr-only">{{ t('hero.links_label') }}</dt>
            <dd class="mt-1.5 flex items-center gap-4">
              <a
                v-for="social in heroSocials"
                :key="social.id"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex items-center gap-1 font-mono text-sm text-ink-muted underline-offset-4 transition-colors hover:text-dev"
              >
                <component
                  :is="brandIcons[social.brand]"
                  v-bind="isMotionBrand(social.brand) ? iconMotion : {}"
                  :trigger-target="isMotionBrand(social.brand) ? 'parent' : undefined"
                  class="mr-0.5 size-4 shrink-0 transition-transform duration-[--nx-dur] ease-[--ease-out-expo] group-hover:scale-110"
                  aria-hidden="true"
                />
                <span class="group-hover:underline">{{ social.label }}</span>
                <ArrowUpRight
                  v-bind="iconMotion"
                  triggerTarget="parent"
                  class="size-3.5 shrink-0"
                  aria-hidden="true"
                />
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <!-- Stage -->
      <div class="relative lg:col-span-5 xl:col-span-6">
        <!-- Sized in svh so the figure is never cropped by mobile browser
             chrome the way a vh-based stage would be. -->
        <div class="relative h-64 w-full sm:h-[36svh] sm:min-h-56 lg:h-[clamp(30rem,68vh,44rem)]">
          <Suspense>
            <HeroScene />
            <template #fallback>
              <div class="grid h-full w-full place-items-center">
                <span class="nx-meta animate-pulse">{{ t('global.loading') }}</span>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>

    <!-- Scroll cue sits on the sheet edge, not floating in the middle -->
    <a
      href="#about"
      class="nx-meta absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-ink-faint transition-colors hover:text-dev md:flex"
    >
      {{ t('hero.scroll_hint') }}
      <span aria-hidden="true" class="h-6 w-px bg-line-strong" />
    </a>
  </section>
</template>
