<script setup lang="ts">
import type { SkillDomain, SkillProps } from '@/types/skill.type'

const { skill, domain } = defineProps<{
  skill: SkillProps
  domain: SkillDomain
}>()

/** The one tool that earns a literal 3D easter egg. */
const hasCube = skill.name === 'Blender'

/** Half the cube's edge — each face is pushed out by this much. */
const CUBE_FACE_OFFSET = '6px'

const cubeFaceTransforms = [
  `translateZ(${CUBE_FACE_OFFSET})`,
  `rotateY(180deg) translateZ(${CUBE_FACE_OFFSET})`,
  `rotateY(90deg) translateZ(${CUBE_FACE_OFFSET})`,
  `rotateY(-90deg) translateZ(${CUBE_FACE_OFFSET})`,
  `rotateX(90deg) translateZ(${CUBE_FACE_OFFSET})`,
  `rotateX(-90deg) translateZ(${CUBE_FACE_OFFSET})`
]
</script>

<template>
  <span
    class="group relative inline-flex items-center gap-2 border px-2.5 py-1.5 font-mono text-xs transition-colors duration-[--nx-dur-fast]"
    :class="[
      skill.isCore ? 'border-line-strong text-ink-muted' : 'border-line text-ink-faint',
      domain === 'creative' ? 'hover:border-creative hover:text-creative' : 'hover:border-dev hover:text-dev'
    ]"
  >
    <span
      v-if="hasCube"
      aria-hidden="true"
      class="inline-block size-3 [perspective:60px]"
    >
      <span class="nx-cube relative block size-3 [transform-style:preserve-3d]">
        <span
          v-for="(transform, index) in cubeFaceTransforms"
          :key="index"
          class="absolute inset-0 border border-current opacity-55"
          :style="{ transform }"
        />
      </span>
    </span>

    {{ skill.name }}

    <!--
      Flavour text, not information — it is aria-hidden and never the only
      place something is said, so nothing is lost without a hovering pointer.
    -->
    <span
      v-if="skill.quip"
      aria-hidden="true"
      class="pointer-events-none absolute bottom-full left-0 mb-1.5 hidden whitespace-nowrap border border-dev/40 bg-void px-2 py-1 text-[0.625rem] text-dev opacity-0 transition-opacity duration-[--nx-dur] group-hover:opacity-100 md:block"
    >
      {{ skill.quip }}
    </span>
  </span>
</template>
