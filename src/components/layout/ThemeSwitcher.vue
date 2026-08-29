<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Moon, Sun } from '@respeak/lucide-motion-vue'
import { themeList } from '@/types/ui.type'
import type { Theme } from '@/types/ui.type'
import { useUiStore } from '@/stores/ui'
import { useIconMotion } from '@/composables/useIconMotion'

const uiStore = useUiStore()
const { t } = useI18n()
const { iconMotion } = useIconMotion()

const themeIcons = { dark: Moon, light: Sun }

const themeLabel = (theme: Theme): string => t(`nav.theme_${theme}`)
</script>

<template>
  <div
    class="flex items-center gap-px overflow-hidden rounded-lg border border-line"
    role="group"
    :aria-label="t('nav.theme')"
  >
    <button
      v-for="theme in themeList"
      :key="theme"
      type="button"
      class="flex size-8 items-center justify-center transition-colors duration-[--nx-dur-fast] sm:h-9 sm:w-10"
      :class="
        uiStore.theme === theme
          ? 'bg-dev text-void'
          : 'text-ink-faint hover:text-ink focus-visible:text-ink'
      "
      :aria-pressed="uiStore.theme === theme"
      :aria-label="themeLabel(theme)"
      @click="uiStore.setTheme(theme)"
    >
      <component :is="themeIcons[theme]" v-bind="iconMotion" class="size-[1.125rem]" aria-hidden="true" />
    </button>
  </div>
</template>
