<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScrollLock } from '@vueuse/core'
import { Menu, X } from '@respeak/lucide-motion-vue'
import { sections } from '@/data/sections'
import { identity } from '@/data/socials'
import { useUiStore } from '@/stores/ui'
import { useIconMotion } from '@/composables/useIconMotion'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'

const uiStore = useUiStore()
const { t } = useI18n()
const { iconMotion } = useIconMotion()

// The mobile panel covers the page, so the page must not scroll behind it.
// `useScrollLock` releases the body again on unmount, which a plain style
// assignment did not — navigating away with the menu open left it locked.
const isBodyLocked = useScrollLock(document.body)

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
  <header class="fixed inset-x-0 top-0 z-50 border-b border-line bg-void">
    <div class="mx-auto flex h-16 w-full max-w-[88rem] items-center gap-6 px-gutter">
      <!-- Title block, like the corner stamp on a drawing -->
      <a href="#index" class="group flex shrink-0 items-baseline gap-2.5" @click="closeMenu">
        <span class="font-display text-sm font-bold tracking-tight">{{ identity.name }}</span>
        <span class="nx-meta hidden transition-colors group-hover:text-dev sm:inline">
          {{ identity.brand }}
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
                  : 'text-ink-faint hover:text-ink-muted'
              "
              :aria-current="uiStore.activeSection === section.id ? 'true' : undefined"
            >
              <span
                class="transition-opacity"
                :class="uiStore.activeSection === section.id ? 'opacity-100' : 'opacity-40'"
              >
                {{ section.index }}
              </span>
              <span>{{ t(section.labelKey) }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="ml-auto flex items-center gap-3 md:ml-0">
        <LanguageSwitcher />

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink md:hidden"
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

    <Transition name="fade">
      <div
        v-if="uiStore.isMenuOpen"
        id="mobile-nav"
        class="fixed inset-x-0 top-16 bottom-0 border-t border-line bg-void md:hidden"
      >
        <nav class="px-gutter py-8" :aria-label="t('nav.index')">
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
