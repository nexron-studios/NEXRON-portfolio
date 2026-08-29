<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { identity } from '@/data/socials'
import NxrLogo from '@/components/ui/NxrLogo.vue'

/**
 * Deliberately thin. The social links used to be repeated here, but they now
 * have their own card grid directly above — listing all six twice in a row
 * made the bottom of the page read as a sitemap.
 */
const { t } = useI18n()

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line">
    <div
      class="mx-auto flex w-full max-w-[88rem] flex-col gap-6 px-gutter py-10 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <NxrLogo :title="identity.brand" class="h-8 w-auto shrink-0 text-ink-muted" />

        <div class="flex flex-col gap-1.5">
          <p class="nx-meta">© {{ currentYear }} {{ identity.brand }}</p>
          <p class="nx-meta">{{ t('footer.built_with') }}</p>
        </div>
      </div>

      <!--
        TO ADD — Impressum and Datenschutz.
        The sketch calls for both, and a German business site legally needs
        them, but neither can be stubbed: an Impressum carries a real name and
        address and a privacy notice describes what the site actually does with
        data. Add `src/views/ImprintView.vue` / `PrivacyView.vue`, register the
        routes, then link them here with `footer.imprint` / `footer.privacy`.
      -->
    </div>
  </footer>
</template>
