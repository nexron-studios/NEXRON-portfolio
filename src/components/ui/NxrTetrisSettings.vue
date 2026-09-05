<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onClickOutside } from '@vueuse/core'
import { Settings, Volume2, VolumeOff } from '@respeak/lucide-motion-vue'
import { useIconMotion } from '@/composables/useIconMotion'

/**
 * The gear: mute and volume, and nothing else.
 *
 * The panel is a plain popover rather than a second dialog — a modal inside a
 * modal takes the focus trap with it, and there is no decision here worth
 * interrupting the game for.
 */
const { isMuted } = defineProps<{
  isMuted: boolean
}>()

const emit = defineEmits<{
  toggleMuted: []
}>()

/** 0–1. The slider writes it straight back. */
const volume = defineModel<number>('volume', { required: true })

const { t } = useI18n()
const { iconMotion } = useIconMotion()

const isOpen = ref(false)
const panel = ref<HTMLElement | null>(null)

onClickOutside(panel, () => {
  isOpen.value = false
})
</script>

<template>
  <div ref="panel" class="relative">
    <button
      type="button"
      class="group/gear flex size-7 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
      :aria-label="t('tetris.settings')"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <Settings v-bind="iconMotion" triggerTarget="parent" class="size-4" aria-hidden="true" />
    </button>

    <Transition name="fade">
      <div
        v-if="isOpen"
        class="nx-glass absolute top-9 right-0 z-10 flex w-56 flex-col gap-3 rounded-lg p-3"
      >
        <button
          type="button"
          class="group/mute flex items-center gap-2 rounded-md border border-line px-2.5 py-2 text-left transition-colors hover:border-line-strong"
          :aria-pressed="!isMuted"
          @click="emit('toggleMuted')"
        >
          <component
            :is="isMuted ? VolumeOff : Volume2"
            v-bind="iconMotion"
            triggerTarget="parent"
            class="size-4 shrink-0"
            :class="isMuted ? 'text-ink-faint' : 'text-dev'"
            aria-hidden="true"
          />
          <span class="nx-meta text-ink">
            {{ isMuted ? t('tetris.sound_off') : t('tetris.sound_on') }}
          </span>
        </button>

        <label class="flex flex-col gap-2">
          <span class="nx-meta">{{ t('tetris.volume') }}</span>
          <input
            v-model.number="volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            class="h-1 w-full cursor-pointer appearance-none rounded-full bg-raised accent-dev disabled:opacity-40"
            :disabled="isMuted"
          />
        </label>
      </div>
    </Transition>
  </div>
</template>
