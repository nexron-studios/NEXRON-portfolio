<script setup lang="ts">
import { useScrollProgress } from '@/composables/useScrollProgress'

/**
 * The sheet everything is drawn on: two superimposed line grids plus a very
 * shallow light falloff at the top. Fixed to the viewport and drifting a
 * fraction of the scroll distance, which reads as depth without ever
 * competing with the content.
 */
useScrollProgress()
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <!-- Coarse grid, drifts slowest -->
    <div
      class="nx-blueprint absolute -inset-x-8 -top-8 h-[130%]"
      style="
        transform: translate3d(0, calc(var(--nx-scroll, 0) * -0.03px * var(--nx-parallax)), 0);
        will-change: transform;
      "
    />

    <!-- Fine grid, drifts a touch faster so the two never lock together -->
    <div
      class="nx-blueprint absolute -inset-x-8 -top-8 h-[130%]"
      style="
        --nx-grid-cell: 14px;
        --nx-grid-opacity: 0.25;
        transform: translate3d(0, calc(var(--nx-scroll, 0) * -0.06px * var(--nx-parallax)), 0);
        will-change: transform;
      "
    />

    <!-- Light falloff — the one gradient in the whole design -->
    <div
      class="absolute inset-0"
      style="
        background:
          radial-gradient(120% 70% at 70% -10%, rgb(46 232 255 / 0.05), transparent 60%),
          radial-gradient(90% 60% at 10% 110%, rgb(154 134 245 / 0.04), transparent 60%);
      "
    />

    <!-- Vignette keeps the grid from reaching the edges at full strength -->
    <div
      class="absolute inset-0"
      style="background: radial-gradient(130% 90% at 50% 40%, transparent 40%, var(--color-void))"
    />
  </div>
</template>
