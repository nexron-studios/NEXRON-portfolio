<script setup lang="ts">
import type { PanelTone } from '@/types/ui.type'
import NxrCornerTicks from '@/components/ui/NxrCornerTicks.vue'

/**
 * The base surface of the design language: hairline border, chamfered
 * corners, no shadow, no radius.
 */
const {
  label = null,
  tone = 'line',
  isInteractive = false,
  hasTicks = true
} = defineProps<{
  /** Mono caption printed across the top edge, like a part number. */
  label?: string | null
  tone?: PanelTone
  isInteractive?: boolean
  hasTicks?: boolean
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
    <NxrCornerTicks v-if="hasTicks" :tone />

    <p v-if="label" class="nx-meta border-b border-line px-4 py-2.5">
      {{ label }}
    </p>

    <slot />
  </div>
</template>
