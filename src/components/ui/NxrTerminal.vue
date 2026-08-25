<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import type { TerminalLineProps } from '@/types/terminal.type'

/** Pause after a command is typed out, before its output appears. */
const COMMAND_SETTLE_MS = 260
/** Delay between two output lines of the same command. */
const OUTPUT_LINE_MS = 110
/** How long the finished transcript stands before the loop restarts. */
const TRANSCRIPT_HOLD_MS = 6000

/**
 * Typed shell transcript.
 *
 * Deliberately not translated: a prompt is a prompt in either language, and
 * localising `$ whoami` would read as a joke explained.
 */
const {
  lines,
  typeSpeed = 42,
  linePause = 850
} = defineProps<{
  lines: TerminalLineProps[]
  typeSpeed?: number
  linePause?: number
}>()

const uiStore = useUiStore()
const entries = ref<TerminalLineProps[]>([])
const isTyping = ref(true)

let timer: ReturnType<typeof setTimeout> | null = null
let isCancelled = false

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    timer = setTimeout(resolve, ms)
  })

/** Everything at once — the reduced-motion equivalent of the finished run. */
const renderStatic = (): void => {
  entries.value = lines.map((line) => ({ command: line.command, output: [...line.output] }))
  isTyping.value = false
}

const run = async (): Promise<void> => {
  while (!isCancelled) {
    entries.value = []
    isTyping.value = true

    for (const line of lines) {
      const entry: TerminalLineProps = { command: '', output: [] }
      entries.value.push(entry)

      for (const char of line.command) {
        if (isCancelled) return
        entry.command += char
        await sleep(typeSpeed)
      }

      await sleep(COMMAND_SETTLE_MS)

      for (const output of line.output) {
        if (isCancelled) return
        entry.output.push(output)
        await sleep(OUTPUT_LINE_MS)
      }

      await sleep(linePause)
    }

    isTyping.value = false
    // Hold the completed transcript before starting over, so the section is
    // readable rather than permanently in motion.
    await sleep(TRANSCRIPT_HOLD_MS)
  }
}

onMounted(() => {
  if (uiStore.prefersReducedMotion) {
    renderStatic()
    return
  }
  void run()
})

onBeforeUnmount(() => {
  isCancelled = true
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="nx-panel relative bg-raised/60 font-mono text-sm">
    <!-- Title bar reads as a part label, not as a fake OS window -->
    <div class="flex items-center gap-2 border-b border-line px-4 py-2.5">
      <span class="h-1.5 w-1.5 bg-shipped" />
      <span class="nx-meta">nexron@studio ~ %</span>
    </div>

    <!-- Sized for the finished transcript so the panel never grows while
         typing — a reflow on every keystroke would push the page around. -->
    <div class="min-h-80 p-4" aria-live="off">
      <div v-for="(entry, index) in entries" :key="index" class="mb-3 last:mb-0">
        <p class="flex gap-2">
          <span aria-hidden="true" class="text-dev">$</span>
          <span class="text-ink">{{ entry.command }}</span>
        </p>
        <p v-for="(output, outputIndex) in entry.output" :key="outputIndex" class="pl-4 text-ink-muted">
          {{ output }}
        </p>
      </div>

      <span
        v-if="isTyping"
        aria-hidden="true"
        class="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-dev"
      />
    </div>
  </div>
</template>
