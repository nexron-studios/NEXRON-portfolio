<script setup lang="ts">
/**
 * The one action of a screen. Square, flat, filled with the accent; the
 * `plain` variant is an ink outline-free text action for the second choice.
 *
 * Renders as an anchor when `href` is given, otherwise as a button, so a
 * link stays a link and keeps its native behaviour.
 */
const {
  variant = 'primary',
  href = null,
  type = 'button',
  isDisabled = false
} = defineProps<{
  variant?: 'primary' | 'plain'
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
    class="group inline-flex min-h-12 items-center justify-center gap-3 px-6 text-base font-semibold tracking-[-0.01em] transition-[background-color,color,transform] duration-(--nx-dur-fast) active:translate-y-px disabled:pointer-events-none disabled:opacity-40"
    :class="
      variant === 'primary'
        ? 'bg-dev text-on-dev hover:bg-ink hover:text-void'
        : 'bg-raised text-ink hover:bg-ink hover:text-void'
    "
  >
    <slot />
  </component>
</template>
