<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { ArrowUpRight } from '@respeak/lucide-motion-vue'
import { useIconMotion } from '@/composables/useIconMotion'

/**
 * One tappable row: mark, label, optional handle and note, trailing arrow.
 *
 * The social grid above the footer and the `/links` page render the same card,
 * so the markup lives here rather than twice — three elements deep of identical
 * utility classes is a component, not a CSS class (`styling.md`).
 *
 * It resolves to an `<a>` for an external target and a `<RouterLink>` for an
 * internal one. That is the whole reason the two callers cannot just share a
 * string of classes: `/links` links to routes as well as to the web.
 */
const {
  icon,
  label,
  handle = '',
  note = '',
  href = '',
  to = undefined,
  isMotionIcon = false
} = defineProps<{
  /** The mark on the left — a brand path, or a Lucide icon. */
  icon: Component
  label: string
  /** Second line, in mono. The handle or a short qualifier, never the URL. */
  handle?: string
  /** Third line: what the destination actually is. */
  note?: string
  /** External target. Mutually exclusive with `to`. */
  href?: string
  /** Internal target. Mutually exclusive with `href`. */
  to?: RouteLocationRaw
  /**
   * Whether the mark takes the motion runtime. Only Lucide icons do; the
   * simple-icons paths animate through the CSS transition below.
   */
  isMotionIcon?: boolean
}>()

const { iconMotion } = useIconMotion()
</script>

<template>
  <!--
    `min-h-14` is the 44 px touch target from `interaction-a11y.md`, and
    `touch-action: manipulation` kills the double-tap delay — this card is the
    primary control on a page opened from an NFC tag.
  -->
  <component
    :is="to ? 'RouterLink' : 'a'"
    :to="to"
    :href="to ? undefined : href"
    :target="to ? undefined : '_blank'"
    :rel="to ? undefined : 'me noopener noreferrer'"
    class="nx-panel group relative flex h-full min-h-14 touch-manipulation items-center gap-4 p-5 transition-colors duration-[--nx-dur-fast] hover:border-line-strong"
  >
    <component
      :is="icon"
      v-bind="isMotionIcon ? iconMotion : {}"
      :trigger-target="isMotionIcon ? 'parent' : undefined"
      class="size-6 shrink-0 text-ink-muted transition-all duration-[--nx-dur] ease-[--ease-out-expo] group-hover:scale-110 group-hover:text-dev"
      aria-hidden="true"
    />

    <span class="min-w-0 flex-1">
      <span class="block truncate font-display text-sm font-bold text-ink">
        {{ label }}
      </span>
      <span v-if="handle" class="nx-meta block truncate normal-case">
        {{ handle }}
      </span>
      <!--
        Two lines rather than `truncate`: a social note is short enough either
        way, but a project tagline cut to "Fitness-Tracki…" on a phone tells the
        reader nothing, and this card is the whole page on `/links`.

        No `block` next to `line-clamp-2` — the clamp works by switching the
        element to `-webkit-box`, and `block` wins on `display`, which lets the
        text run to six lines instead of two.
      -->
      <span v-if="note" class="nx-meta mt-1 line-clamp-2 text-ink-faint">
        {{ note }}
      </span>
    </span>

    <ArrowUpRight
      v-bind="iconMotion"
      trigger-target="parent"
      class="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-dev"
      aria-hidden="true"
    />
  </component>
</template>
