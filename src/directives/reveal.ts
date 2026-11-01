import type { Directive } from 'vue'

/**
 * `v-reveal` / `v-reveal="2"` / `v-reveal.wipe`: the element rises in once, the first time it
 * enters the viewport. The value is its place in the section's stagger, so
 * the heading, the text and the picture arrive one after another.
 *
 * Only adds a class; the motion itself lives on `.nx-reveal` in `main.css`,
 * which hides nothing unless `<html>` carries `js`. A page whose script
 * fails therefore shows everything, it just does not move.
 */
const STAGGER_MS = 80

let observer: IntersectionObserver | null = null

/**
 * What is watched → what it reveals. Usually the element itself. A wipe is
 * clipped away completely until it runs, and an IntersectionObserver counts
 * only the visible part of its target, so a wiped element would never be
 * seen entering; it is watched through its parent instead.
 */
const revealsByWatched = new Map<Element, Set<HTMLElement>>()

const getObserver = (): IntersectionObserver => {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        for (const target of revealsByWatched.get(entry.target) ?? []) target.classList.add('is-in')
        revealsByWatched.delete(entry.target)
        observer?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px', threshold: 0.01 }
  )
  return observer
}

export const vReveal: Directive<HTMLElement, number | undefined, 'wipe'> = {
  mounted(element, binding) {
    element.classList.add('nx-reveal')
    if (binding.modifiers.wipe) element.classList.add('nx-wipe')
    element.style.setProperty('--nx-delay', `${(binding.value ?? 0) * STAGGER_MS}ms`)

    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('is-in')
      return
    }
    const watched = binding.modifiers.wipe ? (element.parentElement ?? element) : element
    const targets = revealsByWatched.get(watched) ?? new Set<HTMLElement>()
    targets.add(element)
    revealsByWatched.set(watched, targets)
    getObserver().observe(watched)
  },
  unmounted(element) {
    for (const [watched, targets] of revealsByWatched) {
      if (!targets.delete(element) || targets.size > 0) continue
      revealsByWatched.delete(watched)
      observer?.unobserve(watched)
    }
  }
}
