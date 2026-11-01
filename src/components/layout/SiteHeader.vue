<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { onKeyStroke, useScrollLock, useWindowScroll } from '@vueuse/core'
import { Menu, X } from '@respeak/lucide-motion-vue'
import { navSections } from '@/data/sections'
import { menuSocialIds, socialsById } from '@/data/socials'
import { brandIcons, isMotionBrand } from '@/components/ui/brand'
import { useIconMotion } from '@/composables/useIconMotion'
import { useSectionNav } from '@/composables/useSectionNav'
import NxrLogo from '@/components/ui/NxrLogo.vue'

/**
 * The site's one header, in two states.
 *
 * At the top of the page it is a plain bar that belongs to the hero: the
 * NEXRON logo and four words. Once the page has moved a
 * little, that bar fades out and the same links drop in as a frosted glass
 * pill at the top centre, which stays. Both states live here, driven by one
 * scroll value, so there is never a stretch with no navigation and never two
 * at once (the old split between a header and a separate glass nav left a
 * gap of most of a screen between them).
 *
 * Below `md` the bar keeps the logo and a menu button, and the pill shrinks
 * to the logo, the menu button and nothing else.
 *
 * The pill is frosted glass: a backdrop blur, a dark tint and a hairline of
 * light at the rim. It used to be Inspira's Liquid Glass, whose SVG
 * refraction pulled text from just outside the pill into a bright smear along
 * its edge, at every setting tried. Plain frost has no such edge and looks
 * the same in every browser.
 */
const { t } = useI18n()
const { iconMotion } = useIconMotion()
const { goTo } = useSectionNav()

const { y } = useWindowScroll()

const PILL_AFTER_PX = 96

const isPill = computed(() => y.value > PILL_AFTER_PX)

const isMenuOpen = ref(false)
const isLocked = useScrollLock(typeof document === 'undefined' ? null : document.body)

watch(isMenuOpen, (isOpen) => {
  isLocked.value = isOpen
})

onKeyStroke('Escape', () => {
  isMenuOpen.value = false
})

const links = computed(() =>
  navSections.map((section) => ({
    id: section.id,
    label: t(section.labelKey),
    to: { name: 'home', hash: `#${section.id}` }
  }))
)

const menuSocials = socialsById(menuSocialIds).map((social) => ({
  ...social,
  icon: brandIcons[social.brand],
  isMotionIcon: isMotionBrand(social.brand)
}))

const handleNav = (id: string, event: MouseEvent): void => {
  isMenuOpen.value = false
  goTo(id, event)
}
</script>

<template>
  <header>
    <!-- State one: the bar at the top of the page. -->
    <div
      class="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-6 px-gutter pt-5 transition-[opacity,transform] duration-(--nx-dur) ease-(--ease-out-expo)"
      :class="isPill ? 'pointer-events-none -translate-y-3 opacity-0' : 'opacity-100'"
      :inert="isPill"
    >
      <RouterLink
        :to="{ name: 'home', hash: '#top' }"
        class="text-ink transition-colors duration-(--nx-dur-fast) hover:text-link"
        :aria-label="t('nav.home')"
        @click="goTo('top', $event)"
      >
        <NxrLogo class="h-7 w-auto sm:h-8" />
      </RouterLink>

      <nav :aria-label="t('nav.label')" class="hidden md:block">
        <ul class="flex items-center gap-7 text-base font-medium">
          <li v-for="link in links" :key="link.id">
            <RouterLink
              :to="link.to"
              class="transition-colors duration-(--nx-dur-fast) hover:text-link"
              @click="handleNav(link.id, $event)"
            >
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex size-10 items-center justify-center md:hidden"
          :aria-label="t('nav.menu')"
          :aria-expanded="isMenuOpen"
          aria-controls="site-menu"
          @click="isMenuOpen = true"
        >
          <Menu v-bind="iconMotion" triggerTarget="parent" class="size-6" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- State two: the glass pill, once the page has moved. -->
    <Transition name="drop">
      <div
        v-if="isPill"
        class="fixed top-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-void/55 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1),inset_0_1px_0_rgb(255_255_255/0.14),0_12px_32px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl backdrop-saturate-150"
      >
        <nav :aria-label="t('nav.label')" class="flex h-14 items-center gap-1 px-2.5">
          <RouterLink
            :to="{ name: 'home', hash: '#top' }"
            class="flex h-10 items-center rounded-full px-3 text-ink transition-colors duration-(--nx-dur-fast) hover:text-link"
            :aria-label="t('nav.home')"
            @click="goTo('top', $event)"
          >
            <NxrLogo class="h-5 w-auto" />
          </RouterLink>

          <RouterLink
            v-for="link in links"
            :key="link.id"
            :to="link.to"
            class="hidden h-10 items-center rounded-full px-3.5 text-[0.9375rem] font-medium whitespace-nowrap text-ink transition-colors duration-(--nx-dur-fast) hover:bg-ink hover:text-void md:flex"
            @click="handleNav(link.id, $event)"
          >
            {{ link.label }}
          </RouterLink>

          <button
            type="button"
            class="flex size-10 items-center justify-center rounded-full bg-ink text-void md:hidden"
            :aria-label="t('nav.menu')"
            :aria-expanded="isMenuOpen"
            aria-controls="site-menu"
            @click="isMenuOpen = true"
          >
            <Menu v-bind="iconMotion" triggerTarget="parent" class="size-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </Transition>

    <!-- Phone menu: a full sheet on the page's own dark ground, frosted so
         the stars show faintly through. A white sheet glared on phones. -->
    <Transition name="fade">
      <div
        v-if="isMenuOpen"
        id="site-menu"
        role="dialog"
        aria-modal="true"
        :aria-label="t('nav.menu')"
        class="fixed inset-0 z-50 flex flex-col bg-void/92 px-gutter pt-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] text-ink backdrop-blur-xl"
      >
        <div class="flex items-center justify-between">
          <NxrLogo class="h-7 w-auto" />
          <button
            type="button"
            class="flex size-10 items-center justify-center"
            :aria-label="t('nav.close')"
            @click="isMenuOpen = false"
          >
            <X class="size-6" aria-hidden="true" />
          </button>
        </div>

        <nav :aria-label="t('nav.label')" class="mt-16">
          <ul class="flex flex-col gap-2">
            <li v-for="link in links" :key="link.id">
              <RouterLink
                :to="link.to"
                class="block text-[clamp(2.75rem,13vw,4.5rem)] leading-[1] font-black tracking-[-0.05em] active:text-link"
                @click="handleNav(link.id, $event)"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div
          class="mt-auto flex flex-wrap items-center gap-x-6 gap-y-4 text-base font-medium text-ink-muted"
        >
          <a
            v-for="social in menuSocials"
            :key="social.id"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 transition-colors duration-(--nx-dur-fast) active:text-link"
          >
            <component
              :is="social.icon"
              v-bind="social.isMotionIcon ? iconMotion : {}"
              class="size-5"
              aria-hidden="true"
            />
            {{ social.label }}
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>
