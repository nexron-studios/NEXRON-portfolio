<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { usePreferredReducedMotion } from '@vueuse/core'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import { useUiStore } from '@/stores/ui'
import { useScrollVar } from '@/composables/useScrollVar'
import StarField from '@/components/layout/StarField.vue'

const uiStore = useUiStore()
const route = useRoute()

/**
 * The motion preference is read once, here, and pushed into the store — every
 * animated component reads the store flag rather than the media query, so the
 * whole site can be calmed down from one place.
 */
const preferredMotion = usePreferredReducedMotion()

watchEffect(() => {
  uiStore.setPrefersReducedMotion(preferredMotion.value === 'reduce')
})

// `--nx-scroll` for every scroll-linked move in CSS.
useScrollVar()
</script>

<template>
  <StarField :is-drifting="route.meta.isStarDrift === true" />
  <div aria-hidden="true" class="nx-grain" />

  <RouterView v-slot="{ Component }">
    <Transition name="route" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <Toaster
    position="bottom-right"
    :toast-options="{
      style: {
        background: 'var(--color-ink)',
        border: 'none',
        borderRadius: '0',
        color: 'var(--color-void)',
        fontFamily: 'var(--font-display)',
        fontSize: '1rem'
      }
    }"
  />
</template>
