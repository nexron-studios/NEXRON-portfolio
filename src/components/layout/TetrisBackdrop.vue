<script setup lang="ts">
import { ref } from 'vue'
import { useTetrisField } from '@/composables/useTetrisField'

/**
 * The sheet everything is drawn on: a Tetris field that plays itself, pulled
 * far back behind the content, over a very shallow light falloff.
 *
 * It replaced the blueprint grid because it does the same job — give the page
 * a ground with a rhythm to it — while being the one piece of the site that
 * moves on its own. Kept deliberately dim: `--nx-backdrop-opacity` is the
 * single dial, and the whole thing is inert under reduced motion.
 */
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

useTetrisField({ canvas, container })
</script>

<template>
  <div
    ref="container"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    <canvas ref="canvas" class="absolute inset-0 h-full w-full" />

    <!-- Light falloff — the one gradient in the whole design -->
    <div
      class="absolute inset-0"
      style="
        background:
          radial-gradient(
            120% 70% at 70% -10%,
            color-mix(in oklab, var(--color-dev) 6%, transparent),
            transparent 60%
          ),
          radial-gradient(
            90% 60% at 10% 110%,
            color-mix(in oklab, var(--color-creative) 5%, transparent),
            transparent 60%
          );
      "
    />

    <!-- Vignette keeps the field from reaching the edges at full strength -->
    <div
      class="absolute inset-0"
      style="background: radial-gradient(130% 90% at 50% 40%, transparent 40%, var(--color-void))"
    />
  </div>
</template>
