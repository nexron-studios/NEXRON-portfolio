<script setup lang="ts">
import { onMounted, watchEffect } from 'vue'
import { RouterView } from 'vue-router'
import { usePreferredReducedMotion } from '@vueuse/core'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import { useUiStore } from '@/stores/ui'
import LiquidGlassFilter from '@/components/layout/LiquidGlassFilter.vue'

const uiStore = useUiStore()

/**
 * The motion preference is read once, here, and pushed into the store — every
 * animated component reads the store flag rather than the media query, so the
 * whole site can be calmed down from one place.
 */
const preferredMotion = usePreferredReducedMotion()

watchEffect(() => {
  uiStore.setPrefersReducedMotion(preferredMotion.value === 'reduce')
})

// The store resolved both of these before the app mounted; this is where they
// reach the document.
onMounted(() => {
  document.documentElement.lang = uiStore.locale
  uiStore.setTheme(uiStore.theme)
})
</script>

<template>
  <LiquidGlassFilter />

  <RouterView v-slot="{ Component }">
    <Transition name="route" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <Toaster
    position="bottom-right"
    :toast-options="{
      style: {
        background: 'var(--color-panel)',
        border: '1px solid var(--color-line-strong)',
        borderRadius: '0',
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem'
      }
    }"
  />
</template>
