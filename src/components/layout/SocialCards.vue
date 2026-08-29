<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowUpRight } from '@respeak/lucide-motion-vue'
import { socials } from '@/data/socials'
import { brandIcons, isMotionBrand } from '@/components/ui/brand'
import { useIconMotion } from '@/composables/useIconMotion'
import { useLocalizedText } from '@/composables/useLocalizedText'

const { t } = useI18n()
const { localized } = useLocalizedText()
const { iconMotion } = useIconMotion()
</script>

<template>
  <section
    :aria-labelledby="'socials-title'"
    class="mx-auto w-full max-w-[88rem] px-gutter pb-section"
  >
    <div class="mb-8 flex items-baseline gap-4 border-b border-line pb-4">
      <h2 id="socials-title" class="font-display text-section font-bold text-ink">
        {{ t('socials.heading') }}
      </h2>
    </div>

    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="social in socials" :key="social.id">
        <a
          :href="social.href"
          target="_blank"
          rel="me noopener noreferrer"
          class="nx-panel group relative flex h-full items-center gap-4 p-5 transition-colors duration-[--nx-dur-fast] hover:border-line-strong"
        >

          <!--
            Brand marks are simple-icons paths, not Lucide — Lucide has none.
            They animate on the group's hover through a plain CSS transition;
            only the Lucide mark takes the motion runtime.
          -->
          <component
            :is="brandIcons[social.brand]"
            v-bind="isMotionBrand(social.brand) ? iconMotion : {}"
            :trigger-target="isMotionBrand(social.brand) ? 'parent' : undefined"
            class="size-6 shrink-0 text-ink-muted transition-all duration-[--nx-dur] ease-[--ease-out-expo] group-hover:scale-110 group-hover:text-dev"
            aria-hidden="true"
          />

          <span class="min-w-0 flex-1">
            <span class="block truncate font-display text-sm font-bold text-ink">
              {{ social.label }}
            </span>
            <span class="nx-meta block truncate normal-case">{{ social.handle }}</span>
            <span class="nx-meta mt-1 block truncate text-ink-faint">
              {{ localized(social.note) }}
            </span>
          </span>

          <ArrowUpRight
            v-bind="iconMotion"
            trigger-target="parent"
            class="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-dev"
            aria-hidden="true"
          />
        </a>
      </li>
    </ul>
  </section>
</template>
