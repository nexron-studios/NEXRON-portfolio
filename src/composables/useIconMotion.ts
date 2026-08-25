import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'

/**
 * Trigger props for an animated icon, switched off under reduced motion.
 *
 * `@respeak/lucide-motion-vue` does not read `prefers-reduced-motion` itself —
 * its README says to handle it in a parent. Passing `false` leaves the icon
 * rendered as a plain static SVG, so nothing disappears when motion is off;
 * it just holds still, which is how the rest of the site behaves.
 *
 * Spread it onto the icon: `<Menu v-bind="iconMotion" />`
 */
export const useIconMotion = () => {
  const uiStore = useUiStore()

  const iconMotion = computed(() => ({
    animateOnHover: !uiStore.prefersReducedMotion
  }))

  return { iconMotion }
}
