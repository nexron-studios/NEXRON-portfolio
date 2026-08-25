<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectCategory } from '@/types/project.type'

/**
 * Stand-in artwork for projects that have no screenshot yet.
 *
 * Rather than a grey box or a broken image, each project gets a small
 * technical drawing derived from its own slug — deterministic, so a project
 * always looks the same, and distinct, so the grid does not read as repeated
 * placeholders. Replace by setting `image` on the project.
 */
const { seed, category } = defineProps<{
  seed: string
  category: ProjectCategory
}>()

/** Cheap deterministic hash — only needs to be stable, not uniform. */
const hash = computed(() => {
  let value = 0
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) % 100_000
  }
  return value
})

const random = (offset: number, min: number, max: number): number => {
  const value = Math.sin(hash.value * (offset + 1) * 12.9898) * 43_758.5453
  return min + (value - Math.floor(value)) * (max - min)
}

const isCreative = computed(() => category === '3d')
const stroke = computed(() => (isCreative.value ? 'var(--color-creative)' : 'var(--color-dev)'))

const rings = computed(() =>
  Array.from({ length: 3 }, (_, index) => ({
    cx: random(index * 3 + 1, 60, 240),
    cy: random(index * 3 + 2, 40, 120),
    r: random(index * 3 + 3, 14, 46)
  }))
)

const bars = computed(() =>
  Array.from({ length: 5 }, (_, index) => ({
    x: 24 + index * 20,
    height: random(index + 11, 10, 54)
  }))
)
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
        :y="140 - bar.height"
        width="9"
        :height="bar.height"
      />
    </g>

    <!-- Datum lines -->
    <g stroke="var(--color-line-strong)" stroke-width="1" vector-effect="non-scaling-stroke">
      <line x1="0" y1="140" x2="300" y2="140" vector-effect="non-scaling-stroke" />
      <line x1="24" y1="0" x2="24" y2="160" stroke-dasharray="2 4" vector-effect="non-scaling-stroke" />
    </g>
  </svg>
</template>
