<script setup lang="ts">
/**
 * Cut-corner action. Renders as an anchor when `href` is given, otherwise as
 * a button — so a link stays a link and keeps its native behaviour.
 */
const {
  variant = 'primary',
  href = null,
  type = 'button',
  isDisabled = false
} = defineProps<{
  variant?: 'primary' | 'ghost'
  href?: string | null
  type?: 'button' | 'submit'
  isDisabled?: boolean
}>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href ?? undefined"
    :type="href ? undefined : type"
    :disabled="href ? undefined : isDisabled"
    :aria-disabled="isDisabled ? 'true' : undefined"
    class="group relative inline-flex items-center justify-center gap-2.5 px-5 py-3 font-mono text-meta tracking-[0.16em] uppercase transition-all duration-[--nx-dur-fast] disabled:pointer-events-none disabled:opacity-40"
    :class="
      variant === 'primary'
        ? 'bg-dev text-void hover:bg-white'
        : 'border border-line text-ink-muted hover:border-dev hover:text-dev'
    "
    :style="{
      clipPath:
        'polygon(var(--nx-cut) 0, 100% 0, 100% calc(100% - var(--nx-cut)), calc(100% - var(--nx-cut)) 100%, 0 100%, 0 var(--nx-cut))'
    }"
  >
    <slot />
  </component>
</template>
