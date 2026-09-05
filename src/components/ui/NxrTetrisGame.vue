<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Layers, Star, TrendingUp, Zap } from '@respeak/lucide-motion-vue'
import type { TetrominoName } from '@/utils/tetris'
import { useIconMotion } from '@/composables/useIconMotion'
import { COLUMNS, ROWS, useTetrisGame, type TetrisEventProps } from '@/composables/useTetrisGame'
import { useTetrisBoard } from '@/composables/useTetrisBoard'
import { useTetrisSound } from '@/composables/useTetrisSound'
import NxrButton from '@/components/ui/NxrButton.vue'
import NxrTetrisControls from '@/components/ui/NxrTetrisControls.vue'
import NxrTetrisSettings from '@/components/ui/NxrTetrisSettings.vue'

/**
 * The game: a canvas, the numbers over it, and the controls under it.
 *
 * Everything this file does is wiring. The rules are in `utils/tetris.ts` and
 * `utils/tetrisRules.ts`, the state in `useTetrisGame`, the drawing in
 * `useTetrisBoard`, the noise in `useTetrisSound` — one event stream connects
 * the three, so none of them knows the others exist.
 *
 * The seven tetrominoes take seven tokens the palette already has; no new hue
 * is introduced for a game. `useTetrisBoard` owns that mapping now, because it
 * is the thing painting them.
 */
const { t } = useI18n()
const { iconMotion } = useIconMotion()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const sound = useTetrisSound()

const handleEvent = (event: TetrisEventProps): void => {
  sound.playEvent(event.type, event.rows.length)
  if (event.type === 'clear') board.celebrateClear(event.rows, event.snapshot)
}

const {
  cells,
  preview,
  score,
  bestScore,
  lines,
  level,
  isPaused,
  isGameOver,
  start,
  move,
  rotate,
  softDrop,
  hardDrop,
  togglePause
} = useTetrisGame({ onEvent: handleEvent })

const board = useTetrisBoard({
  canvas,
  container,
  cells,
  columns: COLUMNS,
  rows: ROWS
})

/** Same seven tokens the board paints with — here for the preview chips. */
const previewClass: Record<TetrominoName, string> = {
  I: 'text-piece-i',
  O: 'text-piece-o',
  T: 'text-piece-t',
  S: 'text-piece-s',
  Z: 'text-piece-z',
  J: 'text-piece-j',
  L: 'text-piece-l'
}

const stats = [
  { key: 'score', icon: Zap, label: 'tetris.score', value: score },
  { key: 'best', icon: Star, label: 'tetris.best', value: bestScore },
  { key: 'level', icon: TrendingUp, label: 'tetris.level', value: level },
  { key: 'lines', icon: Layers, label: 'tetris.lines', value: lines }
]

onMounted(start)
</script>

<template>
  <!-- The game states its own width; the dialog only caps it — see NxrDialog. -->
  <div class="flex w-[min(86vw,19rem)] flex-col gap-4">
    <div class="flex items-start gap-3">
      <!-- The icons are the group's own hover target, so pointing anywhere at
           a stat plays it rather than only hitting the glyph. -->
      <dl class="grid flex-1 grid-cols-2 gap-x-4 gap-y-2">
        <div v-for="stat in stats" :key="stat.key" class="group/stat min-w-0">
          <dt class="nx-meta flex items-center gap-1.5">
            <component
              :is="stat.icon"
              v-bind="iconMotion"
              triggerTarget="parent"
              class="size-3 shrink-0 text-dev"
              aria-hidden="true"
            />
            <span class="truncate">{{ t(stat.label) }}</span>
          </dt>
          <dd class="mt-0.5 font-mono text-base text-ink tabular-nums">{{ stat.value }}</dd>
        </div>
      </dl>

      <NxrTetrisSettings
        v-model:volume="sound.volume.value"
        :is-muted="sound.isMuted.value"
        @toggle-muted="sound.toggleMuted"
      />
    </div>

    <!--
      The well keeps a 1:2 aspect so its cells stay square, and its height is
      capped against the viewport so a laptop in landscape does not push the
      controls off the bottom of the screen.
    -->
    <div
      ref="container"
      class="relative mx-auto aspect-1/2 h-[min(58vh,26rem)] overflow-hidden rounded-lg border border-line"
    >
      <canvas ref="canvas" class="h-full w-full" aria-hidden="true" />

      <!-- What is coming, over the empty rows at the top of the well rather
           than in a column of its own beside it. -->
      <div class="pointer-events-none absolute top-1.5 right-1.5 flex items-center gap-1">
        <span class="sr-only">{{ t('tetris.next') }}</span>
        <span
          v-for="(name, index) in preview"
          :key="`${name}-${index}`"
          class="flex size-5 items-center justify-center rounded-sm border border-line bg-void/80 font-mono text-[0.625rem]"
          :class="[previewClass[name], index === 0 ? 'opacity-100' : 'opacity-55']"
        >
          {{ name }}
        </span>
      </div>

      <!-- Pause and game over sit over the well rather than replacing it, so
           the stack you built stays visible while you read the number. -->
      <div
        v-if="isPaused || isGameOver"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-void/85 p-4 text-center"
      >
        <p class="font-display text-xl font-bold">
          {{ isGameOver ? t('tetris.game_over') : t('tetris.paused') }}
        </p>
        <p v-if="isGameOver" class="font-mono text-sm text-ink-muted">
          {{ t('tetris.final_score', { score }) }}
        </p>
        <NxrButton v-if="isGameOver" @click="start">{{ t('tetris.restart') }}</NxrButton>
      </div>
    </div>

    <NxrTetrisControls
      @move="move"
      @rotate="rotate"
      @soft-drop="softDrop"
      @hard-drop="hardDrop"
      @toggle-pause="togglePause"
    />
  </div>
</template>
