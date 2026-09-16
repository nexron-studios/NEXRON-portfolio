<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { socials } from '@/data/socials'
import { brandIcons, isMotionBrand } from '@/components/ui/brand'
import { useLocalizedText } from '@/composables/useLocalizedText'
import NxrLinkCard from '@/components/ui/NxrLinkCard.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()
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
        <NxrLinkCard
          :icon="brandIcons[social.brand]"
          :is-motion-icon="isMotionBrand(social.brand)"
          :label="social.label"
          :handle="social.handle"
          :note="localized(social.note)"
          :href="social.href"
        />
      </li>
    </ul>
  </section>
</template>
