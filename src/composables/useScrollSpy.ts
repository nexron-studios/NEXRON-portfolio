import { onMounted, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'

/** A band across the middle of the viewport, not the top edge. */
const SPY_ROOT_MARGIN = '-45% 0px -45% 0px'
const SPY_THRESHOLDS = [0, 0.25, 0.5, 1]

/**
 * Marks whichever registered section currently owns the viewport.
 *
 * The band means the highlight changes when a section actually dominates the
 * view, instead of the moment its first pixel appears.
 */
export const useScrollSpy = (ids: string[]) => {
  const uiStore = useUiStore()

  const targets = ref<HTMLElement[]>([])

  const handleIntersect = (entries: IntersectionObserverEntry[]): void => {
    const winner = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

    if (!winner) return

    uiStore.setActiveSection(winner.target.id)
  }

  useIntersectionObserver(targets, handleIntersect, {
    rootMargin: SPY_ROOT_MARGIN,
    threshold: SPY_THRESHOLDS
  })

  // The sections are rendered by the same view that calls this, so they only
  // exist in the DOM once it has mounted.
  onMounted(() => {
    targets.value = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
  })
}
