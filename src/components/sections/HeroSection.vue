<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight } from '@respeak/lucide-motion-vue'
import { identity, socials } from '@/data/socials'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { useIconMotion } from '@/composables/useIconMotion'
import NxrButton from '@/components/ui/NxrButton.vue'
import NxrCornerTicks from '@/components/ui/NxrCornerTicks.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()
const { iconMotion } = useIconMotion()

// three lives in its own chunk — the hero text paints without waiting for it.
const HeroScene = defineAsyncComponent(() => import('@/components/three/HeroScene.vue'))

/** The website link is the page itself — listing it here would be circular. */
const externalSocials = socials.filter((entry) => entry.id !== 'website')
</script>

<template>
  <section id="index" class="relative flex min-h-svh items-center pt-16 pb-10">
    <div class="mx-auto grid w-full max-w-[88rem] gap-8 px-gutter lg:grid-cols-12">
      <!-- Identity block, offset off-centre against the 12-column grid -->
      <div class="lg:col-span-7 lg:pt-8 xl:col-span-6">
        <p class="nx-meta flex items-center gap-3">
          <span class="text-dev">01</span>
          <span class="h-px w-8 bg-line-strong" />
          <span>{{ identity.brand }}</span>
        </p>

        <h1 class="mt-6 font-display text-display font-bold text-balance lg:mt-8">
          {{ identity.name }}
        </h1>

        <p class="mt-4 font-mono text-sm tracking-wide text-dev lg:mt-6">
          {{ localized(identity.role) }}
        </p>

        <p class="mt-4 max-w-lg text-lg leading-relaxed text-ink-muted text-pretty lg:mt-6">
          {{ localized(identity.tagline) }}
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3 lg:mt-10">
          <NxrButton href="#projects">{{ t('hero.explore_projects') }}</NxrButton>
          <NxrButton href="#about" variant="ghost">{{ t('hero.about_me') }}</NxrButton>
        </div>

        <!-- Spec strip: the two facts a visitor actually wants up front -->
        <dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-5 lg:mt-12 lg:pt-6">
          <div>
            <dt class="nx-meta">{{ t('hero.status') }}</dt>
            <dd class="mt-1.5 flex items-center gap-2 font-mono text-sm text-ink">
              <span class="relative flex h-1.5 w-1.5">
                <span
                  class="absolute inline-flex h-full w-full animate-ping bg-building opacity-60"
                />
                <span class="relative inline-flex h-1.5 w-1.5 bg-building" />
              </span>
              {{ t('hero.status_building') }}
            </dd>
          </div>

          <div>
            <dt class="nx-meta">{{ t('hero.location') }}</dt>
            <dd class="mt-1.5 font-mono text-sm text-ink">{{ identity.location }}</dd>
          </div>

          <div>
            <dt class="nx-meta sr-only">{{ t('hero.links_label') }}</dt>
            <dd class="mt-1.5 flex items-center gap-4">
              <a
                v-for="social in externalSocials"
                :key="social.id"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex items-center gap-1 font-mono text-sm text-ink-muted underline-offset-4 transition-colors hover:text-dev"
              >
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
        <div class="relative h-[36svh] min-h-56 w-full lg:h-[clamp(30rem,68vh,44rem)]">
          <NxrCornerTicks tone="dev" />
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
