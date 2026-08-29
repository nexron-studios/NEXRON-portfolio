<script setup lang="ts">
/**
 * The displacement filter behind `.nx-glass`.
 *
 * A filter has to exist as a real SVG node in the document before CSS can
 * reference it by id, so this renders once from `App.vue` and never again.
 * It draws nothing itself — it is a definition, not a graphic.
 *
 * `feTurbulence` generates a smooth noise field and `feDisplacementMap` uses
 * it to push the backdrop pixels around, which is what reads as refraction
 * through an uneven pane. `baseFrequency` is deliberately low: higher values
 * turn the distortion into frosted static instead of glass.
 *
 * Only Chromium currently applies `backdrop-filter: url()`. Elsewhere this
 * node is inert and the plain blur in `main.css` carries the effect.
 */
</script>

<template>
  <svg aria-hidden="true" focusable="false" class="pointer-events-none absolute size-0">
    <defs>
      <filter id="nx-liquid" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.012"
          numOctaves="2"
          seed="17"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="18"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
</template>
