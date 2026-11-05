<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProjectProps, ProjectShotProps } from '@/types/project.type'

/**
 * A project's picture in one fixed landscape frame, whatever shape its app is.
 *
 * Desktop and web screens sit in the frame whole, at their own aspect ratio,
 * on its ground like a print on a mat. Cropping them to fill the frame cut off
 * the app's edges (TokenScope lost its own logo). Phone screens stand up to
 * three side by side on a field of violet. Every project then has the same
 * 16:10 outline in the list, and Tracki no longer breaks the row.
 *
 * `shots` picks which screens to show; the default is the first one (or the
 * first three for a phone app).
 */
const {
  project,
  shots = null,
  isEager = false
} = defineProps<{
  project: ProjectProps
  shots?: ProjectShotProps[] | null
  isEager?: boolean
}>()

const PHONE_SCREENS = 3
/** Inner shape of the frame. A wider picture fills its width, any other its height. */
const FRAME_ASPECT = 16 / 10

const shotImage = ref<HTMLImageElement | null>(null)
const isShotWide = ref(true)

/**
 * `max-w-full` alone never grows a picture past its own pixels, so on a large
 * screen a small shot sat shrunken in the middle of its frame.
 */
const handleShotLoad = (): void => {
  if (!shotImage.value) return
  isShotWide.value = shotImage.value.naturalWidth / shotImage.value.naturalHeight >= FRAME_ASPECT
}

const isPortrait = computed(() => project.shotOrientation === 'portrait')

const visibleShots = computed(() => {
  if (shots) return shots
  return project.shots.slice(0, isPortrait.value ? PHONE_SCREENS : 1)
})
</script>

<template>
  <div
    class="relative aspect-[16/10] w-full overflow-hidden"
    :class="isPortrait ? 'bg-violet' : 'bg-raised'"
  >
    <div
      v-if="isPortrait"
      class="absolute inset-0 flex items-center justify-center gap-[4%] px-[6%]"
    >
      <img
        v-for="(shot, index) in visibleShots"
        :key="shot.src"
        :src="shot.src"
        :alt="shot.label"
        :loading="isEager ? 'eager' : 'lazy'"
        decoding="async"
        class="h-[84%] w-auto rounded-[clamp(0.5rem,1.4vw,1.25rem)] object-cover"
        :class="index === 1 ? 'translate-y-[-4%]' : 'translate-y-[4%]'"
      />
    </div>

    <!-- The whole screen, never cropped: it sits on the frame's ground like
         a print on a mat, at its own aspect ratio. -->
    <div v-else-if="visibleShots[0]" class="absolute inset-[5%] flex items-center justify-center">
      <img
        ref="shotImage"
        :src="visibleShots[0].src"
        :alt="visibleShots[0].label"
        :loading="isEager ? 'eager' : 'lazy'"
        decoding="async"
        class="max-h-full max-w-full rounded-[clamp(0.25rem,0.6vw,0.625rem)] object-contain shadow-[0_1.5rem_3rem_-1.5rem_rgb(0_0_0/0.45)]"
        :class="isShotWide ? 'w-full' : 'h-full'"
        @load="handleShotLoad"
      />
    </div>
  </div>
</template>
