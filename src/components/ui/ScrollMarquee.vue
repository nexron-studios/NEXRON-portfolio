<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntersectionObserver, useResizeObserver } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'
import { wrapOffset } from '@/utils/marquee'

/**
 * A band of big words that runs sideways with the scroll: scroll down and it
 * travels one way, scroll back and it comes back, with a slow drift of its
 * own on top so it never quite stops. Between two sections it turns the
 * vertical scroll into a sideways one, which is the whole effect.
 *
 * The words repeat enough times to cover the screen twice; the offset wraps
 * at one repetition's width, so the band is endless. Decoration: the words
 * are read once by screen readers, the copies are hidden.
 */
const { items, direction = 1 } = defineProps<{
  items: string[]
  /** 1 runs left on scroll down, -1 runs right. */
  direction?: 1 | -1
}>()

const uiStore = useUiStore()

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)

const COPIES = 4
const SCROLL_SPEED = 0.55
const DRIFT_PX_PER_S = 28

const line = computed(() => items.join('  ✦  ') + '  ✦  ')

const offset = ref(0)
let unitWidth = 0
let frame = 0
let isOnScreen = false
let startTime = 0

const tick = (now: number): void => {
  frame = 0
  if (!isOnScreen || uiStore.prefersReducedMotion) return
  if (!startTime) startTime = now
  const travel = window.scrollY * SCROLL_SPEED + ((now - startTime) / 1000) * DRIFT_PX_PER_S
  offset.value = wrapOffset(travel * direction, unitWidth)
  frame = requestAnimationFrame(tick)
}

useIntersectionObserver(
  root,
  (entries) => {
    isOnScreen = Boolean(entries[0]?.isIntersecting)
    if (isOnScreen && !frame) frame = requestAnimationFrame(tick)
  },
  { rootMargin: '200px 0px' }
)

/** One repetition's width: the track holds `COPIES` identical ones. */
const measure = (): void => {
  unitWidth = (track.value?.scrollWidth ?? 0) / COPIES
}

useResizeObserver(track, measure)

onMounted(() => {
  measure()
  void document.fonts?.ready.then(measure)
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="root" class="overflow-hidden py-[clamp(1.5rem,3vw,2.5rem)]">
    <p class="sr-only">{{ items.join(', ') }}</p>
    <div
      ref="track"
      aria-hidden="true"
      class="flex w-max whitespace-nowrap will-change-transform"
      :style="{ transform: `translate3d(${(-offset).toFixed(1)}px, 0, 0)` }"
    >
      <span
        v-for="copy in COPIES"
        :key="copy"
        class="nx-outline-word shrink-0 pr-[0.35em] text-[clamp(3rem,9vw,9rem)] leading-[1] font-black tracking-[-0.04em] uppercase"
      >
        {{ line }}
      </span>
    </div>
  </div>
</template>
