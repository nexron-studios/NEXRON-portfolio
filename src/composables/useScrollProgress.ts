import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'

/**
 * Publishes the scroll position once per frame as `--nx-scroll` on the root
 * element, so parallax layers can be driven from CSS instead of each of them
 * registering its own scroll listener.
 *
 * When reduced motion is requested the property is pinned to 0 and the
 * listener never runs.
 */
export const useScrollProgress = () => {
  const uiStore = useUiStore()
  const progress = ref(0)

  let frame = 0

  const publish = (): void => {
    frame = 0

    const max = document.documentElement.scrollHeight - window.innerHeight
    const value = max > 0 ? window.scrollY / max : 0

    progress.value = value
    document.documentElement.style.setProperty('--nx-scroll', String(window.scrollY))
    document.documentElement.style.setProperty('--nx-progress', value.toFixed(4))
  }

  /**
   * Hand-rolled rAF coalescing rather than `useRafFn`: this writes a CSS
   * custom property, so a scroll burst should collapse into one write per
   * frame and cost nothing at all while the page is still.
   */
  const handleScroll = (): void => {
    if (uiStore.prefersReducedMotion || frame !== 0) return
    frame = requestAnimationFrame(publish)
  }

  useEventListener(window, 'scroll', handleScroll, { passive: true })

  onMounted(() => {
    if (uiStore.prefersReducedMotion) {
      document.documentElement.style.setProperty('--nx-scroll', '0')
      document.documentElement.style.setProperty('--nx-progress', '0')
      return
    }

    publish()
  })

  onBeforeUnmount(() => {
    if (frame !== 0) cancelAnimationFrame(frame)
  })

  return { progress }
}
