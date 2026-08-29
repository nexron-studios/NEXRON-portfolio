<script setup lang="ts">
import type { PanelTone } from '@/types/ui.type'

/**
 * The base surface of the design language: hairline border, rounded corners,
 * no shadow.
 */
const {
  label = null,
  tone = 'line',
  isInteractive = false
} = defineProps<{
  /** Mono caption printed across the top edge, like a part number. */
  label?: string | null
  tone?: PanelTone
  isInteractive?: boolean
}>()
</script>

<template>
  <div
    class="nx-panel relative"
    :class="[
      isInteractive && 'transition-colors duration-[--nx-dur] hover:border-line-strong',
      tone === 'dev' && 'border-dev-dim',
      tone === 'creative' && 'border-creative-dim'
    ]"
  >
    <p v-if="label" class="nx-meta border-b border-line px-4 py-2.5">
      {{ label }}
    </p>

    <slot />
  </div>
</template>
