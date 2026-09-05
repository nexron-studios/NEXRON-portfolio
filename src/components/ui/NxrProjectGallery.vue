<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSwipe } from '@vueuse/core'
import { ChevronLeft, ChevronRight, Expand } from '@respeak/lucide-motion-vue'
import type { ProjectShotProps, ShotOrientation } from '@/types/project.type'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { useIconMotion } from '@/composables/useIconMotion'
import NxrDialog from '@/components/ui/NxrDialog.vue'

/**
 * A project's screens, one at a time, with the rest as a strip underneath.
 *
 * One stage rather than a grid of equal tiles: a dashboard shown at a quarter
 * width is a picture of an interface rather than a readable one, and stepping
 * through screens is how somebody actually looks at an app.
 *
 * The stage has a fixed height, and every shot is `object-contain` inside it.
 * Both of those are what make it a carousel instead of a jumping layout: a
 * stage that resized to each image would shove the page around on every step,
 * and a crop would take away the corner of the interface being looked at.
 * Portrait screens simply leave dark ground either side, which is what a phone
 * screenshot looks like anywhere it is shown honestly.
 */
const { shots, orientation, projectName } = defineProps<{
  shots: ProjectShotProps[]
  orientation: ShotOrientation
  /** Used in the alt text, so a screen reader hears which app it belongs to. */
  projectName: string
}>()

const { t } = useI18n()
const { localized } = useLocalizedText()
const { iconMotion } = useIconMotion()

const stage = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const isEnlarged = ref(false)

const activeShot = computed(() => shots[activeIndex.value] ?? shots[0] ?? null)
const isPortrait = computed(() => orientation === 'portrait')

const altFor = (shot: ProjectShotProps): string => `${projectName} — ${localized(shot.label)}`

/** Wraps, so the last screen steps back to the first rather than dead-ending. */
const step = (delta: number): void => {
  if (shots.length === 0) return
  activeIndex.value = (activeIndex.value + delta + shots.length) % shots.length
}

const { direction, isSwiping } = useSwipe(stage, { threshold: 40 })

// Only on release: reacting while the finger is still down steps several
// screens through one gesture.
watch(isSwiping, (swiping, wasSwiping) => {
  if (swiping || !wasSwiping) return
  if (direction.value === 'left') step(1)
  if (direction.value === 'right') step(-1)
})

/**
 * Pulls the neighbours into the cache as soon as one is shown. The stage swaps
 * a single `src`, so without this every step waits on a fresh request and the
 * frame goes blank for as long as that takes.
 */
watch(
  activeIndex,
  (index) => {
    for (const offset of [-1, 1]) {
      const neighbour = shots[(index + offset + shots.length) % shots.length]
      if (neighbour) new Image().src = neighbour.src
    }
  },
  { immediate: true }
)
</script>

<template>
  <!--
    The arrow keys are handled on the wrapper rather than on a focusable stage:
    the controls inside are real buttons, so the event bubbles up from whichever
    one has focus, and there is no extra tab stop that does nothing on its own.
  -->
  <div
    v-if="activeShot"
    role="group"
    :aria-label="t('projects.gallery_label', { project: projectName })"
    class="flex flex-col gap-3"
    @keydown.left.prevent="step(-1)"
    @keydown.right.prevent="step(1)"
  >
    <div
      ref="stage"
      class="group/stage relative overflow-hidden rounded-lg border border-line bg-void"
      :class="isPortrait ? 'h-[min(64vh,32rem)]' : 'h-[min(56vh,28rem)]'"
    >
      <img
        :key="activeShot.src"
        :src="activeShot.src"
        :alt="altFor(activeShot)"
        class="h-full w-full object-contain"
        decoding="async"
      />

      <!-- Enlarging is the stage's own job, so the whole picture is the target
           rather than a small button parked in a corner of it. -->
      <button
        type="button"
        class="absolute inset-0 cursor-zoom-in"
        :aria-label="t('projects.enlarge', { screen: localized(activeShot.label) })"
        @click="isEnlarged = true"
      >
        <span
          class="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-md border border-line bg-void/80 text-ink-muted opacity-0 transition-opacity duration-[--nx-dur-fast] group-hover/stage:opacity-100"
        >
          <Expand
            v-bind="iconMotion"
            triggerTarget="closest:button"
            class="size-4"
            aria-hidden="true"
          />
        </span>
      </button>

      <template v-if="shots.length > 1">
        <button
          v-for="control in [
            { id: 'previous', delta: -1, icon: ChevronLeft, class: 'left-3' },
            { id: 'next', delta: 1, icon: ChevronRight, class: 'right-3' }
          ]"
          :key="control.id"
          type="button"
          class="absolute top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-void/85 text-ink-muted transition-colors hover:border-dev hover:text-dev"
          :class="control.class"
          :aria-label="t(`projects.${control.id}_screen`)"
          @click="step(control.delta)"
        >
          <component
            :is="control.icon"
            v-bind="iconMotion"
            triggerTarget="parent"
            class="size-4"
            aria-hidden="true"
          />
        </button>
      </template>

      <!-- `pointer-events-none`: it sits over the enlarge surface, and a strip
           of text that swallows the click there would look like a dead zone. -->
      <p
        aria-live="polite"
        class="nx-meta pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-void/80 px-3 py-2 text-ink-muted"
      >
        <span class="truncate">{{ localized(activeShot.label) }}</span>
        <span class="shrink-0 tabular-nums">{{ activeIndex + 1 }}/{{ shots.length }}</span>
      </p>
    </div>

    <!-- The strip doubles as the position indicator: which one is lit is the
         same information a row of dots would carry, with the picture kept. -->
    <ul v-if="shots.length > 1" class="grid grid-cols-4 gap-2 sm:grid-cols-6">
      <li v-for="(shot, index) in shots" :key="shot.src">
        <button
          type="button"
          class="block w-full overflow-hidden rounded-md border bg-void transition-colors"
          :class="index === activeIndex ? 'border-dev' : 'border-line hover:border-line-strong'"
          :aria-current="index === activeIndex ? 'true' : undefined"
          :aria-label="localized(shot.label)"
          @click="activeIndex = index"
        >
          <img
            :src="shot.src"
            alt=""
            class="w-full object-contain transition-opacity"
            :class="[
              isPortrait ? 'aspect-4/5' : 'aspect-16/10',
              index === activeIndex ? 'opacity-100' : 'opacity-55 hover:opacity-90'
            ]"
            loading="lazy"
            decoding="async"
          />
        </button>
      </li>
    </ul>

    <!-- Enlarged, the arrows have to keep working: having to close the dialog
         to reach the next screen is what makes a lightbox annoying. -->
    <NxrDialog
      :open="isEnlarged"
      :title="localized(activeShot.label)"
      :close-label="t('global.close')"
      @close="isEnlarged = false"
    >
      <div
        class="flex items-center gap-3"
        @keydown.left.prevent="step(-1)"
        @keydown.right.prevent="step(1)"
      >
        <button
          v-if="shots.length > 1"
          type="button"
          class="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-dev hover:text-dev"
          :aria-label="t('projects.previous_screen')"
          @click="step(-1)"
        >
          <ChevronLeft
            v-bind="iconMotion"
            triggerTarget="parent"
            class="size-4"
            aria-hidden="true"
          />
        </button>

        <!--
          A fixed box, not a box that fits the picture. The dialog is `w-fit`,
          so an image sized to its own dimensions makes the whole window grow
          and shrink on every step — and the screens of one app are never
          pixel-identical. The box is sized per orientation, so it is generous
          for what it holds and never moves.
        -->
        <div
          class="flex shrink-0 items-center justify-center"
          :class="
            isPortrait
              ? 'h-[min(78vh,44rem)] w-[min(72vw,22rem)]'
              : 'h-[min(72vh,38rem)] w-[min(80vw,60rem)]'
          "
        >
          <img
            :src="activeShot.src"
            :alt="altFor(activeShot)"
            class="max-h-full max-w-full rounded-md object-contain"
          />
        </div>

        <button
          v-if="shots.length > 1"
          type="button"
          class="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-dev hover:text-dev"
          :aria-label="t('projects.next_screen')"
          @click="step(1)"
        >
          <ChevronRight
            v-bind="iconMotion"
            triggerTarget="parent"
            class="size-4"
            aria-hidden="true"
          />
        </button>
      </div>
    </NxrDialog>
  </div>
</template>
