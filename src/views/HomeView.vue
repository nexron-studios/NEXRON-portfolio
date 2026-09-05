<script setup lang="ts">
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import SocialCards from '@/components/layout/SocialCards.vue'
import TetrisBackdrop from '@/components/layout/TetrisBackdrop.vue'
import SectionFrame from '@/components/layout/SectionFrame.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import JourneySection from '@/components/sections/JourneySection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import StackSection from '@/components/sections/StackSection.vue'
import { framedSections, sectionIds } from '@/data/sections'
import { useScrollProgress } from '@/composables/useScrollProgress'
import { useScrollSpy } from '@/composables/useScrollSpy'

/**
 * Order, anchors and sheet numbers all come from `src/data/sections.ts`; this
 * only says which component belongs to which id. Reordering the page is a
 * one-line change in the register, and the numbers cannot drift.
 */
const sectionComponents: Record<string, Component> = {
  about: AboutSection,
  journey: JourneySection,
  stack: StackSection,
  projects: ProjectsSection,
  contact: ContactSection
}

const { t } = useI18n()

useScrollSpy(sectionIds)

// Publishes `--nx-progress` on the root element. Nothing else writes it, so
// without this call the reading rule along the header's lower edge sits at
// `scaleX(0)` for the life of the page.
useScrollProgress()
</script>

<template>
  <div class="relative">
    <TetrisBackdrop />

    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:bg-dev focus:px-4 focus:py-2 focus:font-mono focus:text-meta focus:text-void"
    >
      {{ t('global.skip_to_content') }}
    </a>

    <AppHeader />

    <main id="main">
      <HeroSection />

      <SectionFrame
        v-for="section in framedSections"
        :id="section.id"
        :key="section.id"
        :index="section.index"
        :title="t(section.labelKey)"
      >
        <component :is="sectionComponents[section.id]" />
      </SectionFrame>
    </main>

    <SocialCards />

    <AppFooter />
  </div>
</template>
