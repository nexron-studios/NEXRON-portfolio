<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScrollLock, useWindowScroll } from '@vueuse/core'
import { Menu, X } from '@respeak/lucide-motion-vue'
import { sections } from '@/data/sections'
import { identity } from '@/data/socials'
import { useUiStore } from '@/stores/ui'
import { useIconMotion } from '@/composables/useIconMotion'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'
import NxrLogo from '@/components/ui/NxrLogo.vue'
import LiquidGlass from '@/components/ui/LiquidGlass.vue'

/** Past this the bar settles closer to the edge and the glass gains contrast. */
const SCROLLED_AFTER_PX = 24

const uiStore = useUiStore()
const { t } = useI18n()
const { iconMotion } = useIconMotion()
const { y: scrollY } = useWindowScroll()

// The mobile panel covers the page, so the page must not scroll behind it.
// `useScrollLock` releases the body again on unmount, which a plain style
// assignment did not — navigating away with the menu open left it locked.
const isBodyLocked = useScrollLock(document.body)

const isScrolled = computed(() => scrollY.value > SCROLLED_AFTER_PX)

const closeMenu = (): void => {
  uiStore.setMenuOpen(false)
}

watch(
  () => uiStore.isMenuOpen,
  (isOpen) => {
    isBodyLocked.value = isOpen
  }
)
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 px-gutter transition-all duration-[--nx-dur]">
    <!--
      Inspira UI's Liquid Glass. `containerClass` has to re-declare `relative`:
      the component's own class sets `position: fixed`, which is right for the
      floating panel it ships as a demo but would tear the bar out of this
      already-fixed header.
    -->
    <LiquidGlass
      :radius="18"
      :frost="isScrolled ? 0.12 : 0.06"
      :container-class="[
        'relative mx-auto w-full max-w-[88rem] transition-all duration-[--nx-dur] ease-[--ease-out-expo]',
        isScrolled ? 'mt-2' : 'mt-4'
      ]"
    >
      <!--
        The height stays put. An earlier version shrank the bar from 5rem to 4rem
        on scroll, which retypesets the logo and the nav mid-motion and reads as
        the header flinching. Contrast carries the state change instead: the
        glass frosts over so the content underneath stops competing.
      -->
      <div class="flex h-20 w-full items-center gap-2 px-3 sm:gap-6 sm:px-6">
        <!-- Title block: the mark, then who is behind it -->
        <a href="#index" class="group flex shrink-0 items-center gap-2 sm:gap-3" @click="closeMenu">
          <NxrLogo
            :title="identity.brand"
            class="h-5 w-auto shrink-0 text-ink transition-colors group-hover:text-dev sm:h-7"
          />
          <span aria-hidden="true" class="hidden text-ink-faint sm:inline">–</span>

          <span
            class="nx-meta hidden text-ink-muted transition-colors group-hover:text-dev sm:inline"
          >
            {{ identity.name }}
          </span>
        </a>

        <nav class="ml-auto hidden md:block" :aria-label="t('nav.index')">
          <ul class="flex items-center gap-1">
            <li v-for="section in sections" :key="section.id">
              <a
                :href="`#${section.id}`"
                class="group flex items-baseline gap-1.5 px-2.5 py-1.5 font-mono text-meta tracking-[0.16em] uppercase transition-colors duration-[--nx-dur-fast]"
                :class="
                  uiStore.activeSection === section.id
                    ? 'text-dev'
                    : 'text-ink-muted hover:text-ink'
                "
                :aria-current="uiStore.activeSection === section.id ? 'true' : undefined"
              >
                <span
                  class="transition-opacity"
                  :class="uiStore.activeSection === section.id ? 'opacity-100' : 'opacity-60'"
                >
                  {{ section.index }}
                </span>
                <span>{{ t(section.labelKey) }}</span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="ml-auto flex items-center gap-2 md:ml-0 md:gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />

          <button
            type="button"
            class="flex size-7 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink sm:h-8 sm:w-9 md:hidden"
            :aria-label="uiStore.isMenuOpen ? t('nav.menu_close') : t('nav.menu_open')"
            :aria-expanded="uiStore.isMenuOpen"
            aria-controls="mobile-nav"
            @click="uiStore.setMenuOpen(!uiStore.isMenuOpen)"
          >
            <X v-if="uiStore.isMenuOpen" v-bind="iconMotion" class="size-4" aria-hidden="true" />
            <Menu v-else v-bind="iconMotion" class="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Reading position as a measuring rule along the header's edge -->
      <div
        aria-hidden="true"
        class="h-px origin-left bg-dev"
        style="transform: scaleX(var(--nx-progress, 0))"
      />
    </LiquidGlass>

    <Transition name="fade">
      <div
        v-if="uiStore.isMenuOpen"
        id="mobile-nav"
        class="nx-glass fixed inset-x-gutter top-20 bottom-4 md:hidden"
      >
        <nav class="px-6 py-8" :aria-label="t('nav.index')">
          <ul class="flex flex-col">
            <li v-for="section in sections" :key="section.id">
              <a
                :href="`#${section.id}`"
                class="flex items-baseline gap-4 border-b border-line py-4"
                @click="closeMenu"
              >
                <span class="nx-meta text-dev">{{ section.index }}</span>
                <span class="font-display text-2xl tracking-tight">{{ t(section.labelKey) }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </Transition>
  </header>
</template>
