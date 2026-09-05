<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectCategory } from '@/types/project.type'
import { BLUEPRINT_BAR_BASELINE_Y, buildBars, buildRings, hashSeed } from '@/utils/blueprint'

/**
 * Stand-in artwork for projects that have no screenshot yet.
 *
 * Rather than a grey box or a broken image, each project gets a small
 * technical drawing derived from its own slug — deterministic, so a project
 * always looks the same, and distinct, so the grid does not read as repeated
 * placeholders. Replace by setting `image` on the project.
 *
 * The geometry itself lives in `utils/blueprint.ts`, which is where its specs
 * point; this component only draws what that returns.
 */
const { seed, category } = defineProps<{
  seed: string
  category: ProjectCategory
}>()

const hash = computed(() => hashSeed(seed))

const isCreative = computed(() => category === '3d')
const stroke = computed(() => (isCreative.value ? 'var(--color-creative)' : 'var(--color-dev)'))

const rings = computed(() => buildRings(hash.value))
const bars = computed(() => buildBars(hash.value))
</script>

<template>
  <svg
    viewBox="0 0 300 160"
    preserveAspectRatio="xMidYMid slice"
    class="h-full w-full"
    role="presentation"
    aria-hidden="true"
  >
    <defs>
      <pattern :id="`grid-${seed}`" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--color-line)" stroke-width="0.5" />
      </pattern>
    </defs>

    <rect width="300" height="160" fill="var(--color-void)" />
    <rect width="300" height="160" :fill="`url(#grid-${seed})`" />

    <!-- Construction geometry: circles and a bar plot, the two shapes every
         technical drawing seems to end up containing -->
    <!-- non-scaling-stroke keeps every line a true hairline regardless of how
         far the viewBox is blown up — without it the same drawing reads as
         crude on the detail page and fine on a card. -->
    <g :stroke opacity="0.5" fill="none" stroke-width="1" vector-effect="non-scaling-stroke">
      <circle
        v-for="(ring, index) in rings"
        :key="index"
        :cx="ring.cx"
        :cy="ring.cy"
        :r="ring.r"
        vector-effect="non-scaling-stroke"
      />
    </g>

    <g :fill="stroke" opacity="0.22">
      <rect
        v-for="(bar, index) in bars"
        :key="index"
        :x="bar.x"
        :y="BLUEPRINT_BAR_BASELINE_Y - bar.height"
        width="9"
        :height="bar.height"
      />
    </g>

    <!-- Datum lines -->
    <g stroke="var(--color-line-strong)" stroke-width="1" vector-effect="non-scaling-stroke">
      <line x1="0" y1="140" x2="300" y2="140" vector-effect="non-scaling-stroke" />
      <line
        x1="24"
        y1="0"
        x2="24"
        y2="160"
        stroke-dasharray="2 4"
        vector-effect="non-scaling-stroke"
      />
    </g>
  </svg>
</template>
