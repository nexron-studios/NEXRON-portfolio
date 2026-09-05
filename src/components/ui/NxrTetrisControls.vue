<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowBigDownDash,
  Pause,
  RotateCw
} from '@respeak/lucide-motion-vue'
import { useIconMotion } from '@/composables/useIconMotion'

/**
 * How the game is played, as one compact card.
 *
 * The same card is the touch control: on a pointer device an entry reads as
 * "this key does that", and on a touch screen tapping it does the thing. It
 * used to be two blocks — a row of buttons for phones and a sentence of key
 * hints for everything else — which said the same thing twice and took the
 * height of both.
 */
const emit = defineEmits<{
  move: [direction: number]
  rotate: []
  softDrop: []
  hardDrop: []
  togglePause: []
}>()

const { t } = useI18n()
const { iconMotion } = useIconMotion()

/** `key` names both bindings where there are two — nobody guesses WASD. */
const controls = [
  {
    id: 'left',
    icon: ArrowLeft,
    key: '← A',
    label: 'tetris.move_left',
    run: () => emit('move', -1)
  },
  {
    id: 'right',
    icon: ArrowRight,
    key: '→ D',
    label: 'tetris.move_right',
    run: () => emit('move', 1)
  },
  { id: 'rotate', icon: RotateCw, key: '↑ W', label: 'tetris.rotate', run: () => emit('rotate') },
  {
    id: 'soft',
    icon: ArrowDown,
    key: '↓ S',
    label: 'tetris.soft_drop',
    run: () => emit('softDrop')
  },
  {
    id: 'hard',
    icon: ArrowBigDownDash,
    key: '␣',
    label: 'tetris.hard_drop',
    run: () => emit('hardDrop')
  },
  { id: 'pause', icon: Pause, key: 'P', label: 'tetris.pause', run: () => emit('togglePause') }
]
</script>

<template>
  <ul class="grid grid-cols-3 gap-1.5">
    <li v-for="control in controls" :key="control.id">
      <!--
        A real button even where it reads as a hint: the same action is on the
        keyboard, and a hint nobody can press on a phone is a control that does
        not exist there.
      -->
      <button
        type="button"
        class="group/control flex h-11 w-full touch-manipulation items-center justify-center gap-1.5 rounded-md border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink active:bg-raised"
        :aria-label="t(control.label)"
        @click="control.run()"
      >
        <component
          :is="control.icon"
          v-bind="iconMotion"
          triggerTarget="parent"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        <span class="font-mono text-[0.625rem] tracking-[0.12em] text-ink-faint">
          {{ control.key }}
        </span>
      </button>
    </li>
  </ul>
</template>
