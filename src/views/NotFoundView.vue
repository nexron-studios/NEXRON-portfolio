<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from '@respeak/lucide-motion-vue'
import { useIconMotion } from '@/composables/useIconMotion'

const { t } = useI18n()
const { iconMotion } = useIconMotion()
</script>

<template>
  <main class="grid min-h-screen place-items-center px-6">
    <div class="w-full max-w-md">
      <p class="nx-meta">error / 404</p>
      <p class="mt-4 font-mono text-sm text-ink-muted">{{ t('projects.not_found') }}</p>
      <RouterLink
        to="/"
        class="group mt-8 inline-flex items-center gap-2 font-mono text-sm text-dev"
      >
        <ArrowLeft
          v-bind="iconMotion"
          triggerTarget="parent"
          class="size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span class="group-hover:underline">{{ t('global.back') }}</span>
      </RouterLink>
    </div>
  </main>
</template>
