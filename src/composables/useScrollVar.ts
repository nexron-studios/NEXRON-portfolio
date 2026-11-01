import { onBeforeUnmount, onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'

/**
 * Publishes the page's scroll position as `--nx-scroll` (unitless px) on the
 * root element, once per frame at most. Scroll-linked moves are then plain
 * CSS: `translate: calc(var(--nx-scroll) * -0.3px) 0`.
 *
 * Under reduced motion the variable stays 0, so every move that reads it
 * holds still without each component having to check.
 *
 * Mount once, in `App.vue`.
 */
export const useScrollVar = () => {
  const uiStore = useUiStore()
  let frame = 0

  const publish = (): void => {
    frame = 0
    const value = uiStore.prefersReducedMotion ? 0 : window.scrollY
    document.documentElement.style.setProperty('--nx-scroll', value.toFixed(1))
  }

  const handleScroll = (): void => {
    if (!frame) frame = requestAnimationFrame(publish)
  }

  onMounted(() => {
    publish()
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
    if (frame) cancelAnimationFrame(frame)
  })
}
