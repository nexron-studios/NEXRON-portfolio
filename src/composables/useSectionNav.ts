import { useRoute, useRouter } from 'vue-router'

/**
 * Jumping to a section of the home page from anywhere.
 *
 * On the home page the router is skipped: a hash it is already on counts as
 * no navigation, so a second click on the same nav link used to do nothing.
 * Scrolling the element into view works every time, and `scroll-margin-top`
 * on the sections keeps the heading clear of the floating nav.
 *
 * From another route it navigates home with the hash, and the router's
 * `scrollBehavior` takes it from there.
 */
export const useSectionNav = () => {
  const route = useRoute()
  const router = useRouter()

  const goTo = (id: string, event?: MouseEvent): void => {
    if (route.name !== 'home') return
    const target = document.getElementById(id)
    if (!target) return
    event?.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    void router.replace({ hash: id === 'top' ? '' : `#${id}` })
  }

  return { goTo }
}
