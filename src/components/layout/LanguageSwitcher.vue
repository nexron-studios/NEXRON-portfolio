<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { localeList } from '@/types/i18n.type'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const { t } = useI18n()
</script>

<template>
  <div
    class="flex items-center gap-px border border-line"
    role="group"
    :aria-label="t('nav.language')"
  >
    <button
      v-for="locale in localeList"
      :key="locale"
      type="button"
      class="px-2 py-1 font-mono text-meta tracking-[0.16em] uppercase transition-colors duration-[--nx-dur-fast]"
      :class="
        uiStore.locale === locale
          ? 'bg-dev text-void'
          : 'text-ink-faint hover:text-ink focus-visible:text-ink'
      "
      :aria-pressed="uiStore.locale === locale"
      @click="uiStore.setLocale(locale)"
    >
      {{ locale }}
    </button>
  </div>
</template>
