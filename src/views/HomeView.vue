<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BlueprintBackdrop from '@/components/layout/BlueprintBackdrop.vue'
import SectionFrame from '@/components/layout/SectionFrame.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import JourneySection from '@/components/sections/JourneySection.vue'
import LabSection from '@/components/sections/LabSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import StackSection from '@/components/sections/StackSection.vue'
import { sectionIds } from '@/data/sections'
import { useScrollSpy } from '@/composables/useScrollSpy'

const { t } = useI18n()

useScrollSpy(sectionIds)
</script>

<template>
  <div class="relative">
    <BlueprintBackdrop />

    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:bg-dev focus:px-4 focus:py-2 focus:font-mono focus:text-meta focus:text-void"
    >
      {{ t('global.skip_to_content') }}
    </a>

    <AppHeader />

    <main id="main">
      <HeroSection />

      <SectionFrame id="about" index="02" :title="t('nav.about')">
        <AboutSection />
      </SectionFrame>

      <SectionFrame id="projects" index="03" :title="t('nav.projects')">
        <ProjectsSection />
      </SectionFrame>

      <SectionFrame id="journey" index="04" :title="t('nav.journey')">
        <JourneySection />
      </SectionFrame>

      <SectionFrame id="stack" index="05" :title="t('nav.stack')">
        <StackSection />
      </SectionFrame>

      <SectionFrame id="lab" index="06" :title="t('nav.lab')">
        <LabSection />
      </SectionFrame>

      <SectionFrame id="contact" index="07" :title="t('nav.contact')">
        <ContactSection />
      </SectionFrame>
    </main>

    <AppFooter />
  </div>
</template>
