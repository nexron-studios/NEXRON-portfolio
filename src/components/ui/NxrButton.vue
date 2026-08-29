<script setup lang="ts">
/**
 * The standard action. Renders as an anchor when `href` is given, otherwise as
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
    class="group relative inline-flex items-center justify-center gap-2.5 rounded-md px-5 py-3 font-mono text-meta tracking-[0.16em] uppercase transition-all duration-[--nx-dur-fast] disabled:pointer-events-none disabled:opacity-40"
    :class="
      variant === 'primary'
        ? 'bg-dev text-white shadow-[0_6px_20px_-8px_var(--color-dev)] hover:bg-creative hover:shadow-[0_8px_26px_-8px_var(--color-creative)]'
        : 'border border-line text-ink-muted hover:border-dev hover:text-dev'
    "
  >
    <slot />
  </component>
</template>
