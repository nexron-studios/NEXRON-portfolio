<script setup lang="ts">
import type { PanelTone } from '@/types/ui.type'

/**
 * Registration marks at the four corners of a panel — the detail that makes
 * a box read as a drawn part rather than as a card. Purely decorative.
 */
const { tone = 'line' } = defineProps<{ tone?: PanelTone }>()

const toneClass: Record<PanelTone, string> = {
  line: 'border-line-strong',
  dev: 'border-dev',
  creative: 'border-creative'
}
</script>

<template>
  <span aria-hidden="true" class="pointer-events-none absolute inset-0 z-10">
    <span
      class="absolute top-0 left-0 border-t border-l transition-colors"
      :class="toneClass[tone]"
      :style="{ width: 'var(--nx-tick)', height: 'var(--nx-tick)' }"
    />
    <span
      class="absolute top-0 right-0 border-t border-r transition-colors"
      :class="toneClass[tone]"
      :style="{ width: 'var(--nx-tick)', height: 'var(--nx-tick)' }"
    />
    <span
      class="absolute bottom-0 left-0 border-b border-l transition-colors"
      :class="toneClass[tone]"
      :style="{ width: 'var(--nx-tick)', height: 'var(--nx-tick)' }"
    />
    <span
      class="absolute right-0 bottom-0 border-r border-b transition-colors"
      :class="toneClass[tone]"
      :style="{ width: 'var(--nx-tick)', height: 'var(--nx-tick)' }"
    />
  </span>
</template>
