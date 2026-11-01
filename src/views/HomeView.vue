<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import JourneySection from '@/components/sections/JourneySection.vue'
import WorkSection from '@/components/sections/WorkSection.vue'
import ScrollMarquee from '@/components/ui/ScrollMarquee.vue'

/**
 * The page, in the order of its argument (see `data/sections.ts`): the claim,
 * the work that proves it, who is behind it, the path that led here, and how
 * to reach him.
 */
const { t } = useI18n()
</script>

<template>
  <div>
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:bg-dev focus:px-4 focus:py-2 focus:text-on-dev"
    >
      {{ t('global.skip_to_content') }}
    </a>

    <SiteHeader />

    <main id="main">
      <HeroSection />
      <WorkSection />
      <AboutSection />
      <JourneySection />
      <ScrollMarquee
        :items="t('home.band_build').split(' / ')"
        :direction="-1"
        class="mt-[clamp(4rem,7vw,7rem)]"
      />
      <ContactSection />
    </main>

    <SiteFooter />
  </div>
</template>
