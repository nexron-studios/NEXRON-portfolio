<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LoaderCircle } from '@respeak/lucide-motion-vue'

/**
 * The placeholder a 3D stage shows while its model is still on the wire.
 *
 * Covers the stage box it is dropped into, so the same mark stands in for a
 * chunk that has not arrived and a model that has not — the visitor sees one
 * thing, not two.
 */
const { t } = useI18n()
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 grid place-items-center"
    role="status"
    aria-live="polite"
  >
    <span class="nx-meta flex items-center gap-2 text-ink-faint">
      <LoaderCircle class="size-4 shrink-0 animate-spin" aria-hidden="true" />
      {{ t('global.loading') }}
    </span>
  </div>
</template>
