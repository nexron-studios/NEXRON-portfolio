<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import type { TerminalLineProps } from '@/types/terminal.type'
import { runCommand, type TerminalContextProps } from '@/utils/terminalCommands'

/** Pause after a command is typed out, before its output appears. */
const COMMAND_SETTLE_MS = 260
/** Delay between two output lines of the same command. */
const OUTPUT_LINE_MS = 110

/**
 * Shell transcript that types itself, then hands over.
 *
 * The intro plays once — it says what the section is about faster than a
 * paragraph would — and then the prompt becomes a real input. Anyone who tries
 * typing gets an answer instead of a dead decoration; `utils/terminalCommands`
 * owns what those answers are.
 *
 * Deliberately not translated: a prompt is a prompt in either language.
 */
const {
  lines,
  context,
  typeSpeed = 42,
  linePause = 620
} = defineProps<{
  lines: TerminalLineProps[]
  context: TerminalContextProps
  typeSpeed?: number
  linePause?: number
}>()

const uiStore = useUiStore()
const { t } = useI18n()

const entries = ref<TerminalLineProps[]>([])
const isTyping = ref(true)
const draft = ref('')
const history = ref<string[]>([])
const historyIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)

let timer: ReturnType<typeof setTimeout> | null = null
let isCancelled = false

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    timer = setTimeout(resolve, ms)
  })

const scrollToEnd = async (): Promise<void> => {
  await nextTick()
  const element = scrollRef.value
  if (element) element.scrollTop = element.scrollHeight
}

/** Everything at once — the reduced-motion equivalent of the finished run. */
const renderStatic = (): void => {
  entries.value = lines.map((line) => ({ command: line.command, output: [...line.output] }))
  isTyping.value = false
}

const playIntro = async (): Promise<void> => {
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

  // The intro plays once and stops. It used to loop forever, which meant the
  // section was never still — and there is now a prompt worth handing over to.
  isTyping.value = false
  void scrollToEnd()
}

const focusInput = (): void => {
  inputRef.value?.focus()
}

const submit = (): void => {
  const input = draft.value
  const { output, action } = runCommand(input, context)

  if (action === 'clear') {
    entries.value = []
  } else {
    entries.value.push({ command: input, output })
  }

  if (input.trim() !== '') {
    history.value.push(input)
  }
  historyIndex.value = -1
  draft.value = ''
  void scrollToEnd()
}

/** Arrow up/down walks back through what was typed, like a real shell. */
const recall = (direction: -1 | 1): void => {
  if (history.value.length === 0) return

  const next =
    historyIndex.value === -1 && direction === -1
      ? history.value.length - 1
      : historyIndex.value + direction

  if (next < 0) return

  if (next >= history.value.length) {
    historyIndex.value = -1
    draft.value = ''
    return
  }

  historyIndex.value = next
  draft.value = history.value[next] ?? ''
}

onMounted(() => {
  if (uiStore.prefersReducedMotion) {
    renderStatic()
    return
  }
  void playIntro()
})

onBeforeUnmount(() => {
  isCancelled = true
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <!--
    Clicking anywhere on the panel focuses the prompt, the way a terminal
    window behaves. The click target is the wrapper rather than the input so
    the whole surface is usable; keyboard users reach the input by tabbing.
  -->
  <div
    class="nx-panel relative bg-raised/60 font-mono text-sm"
    @click="focusInput"
  >
    <!-- Title bar reads as a part label, not as a fake OS window -->
    <div class="flex items-center gap-2 border-b border-line px-4 py-2.5">
      <span class="size-1.5 rounded-full bg-shipped" />
      <span class="nx-meta">nexron@studio ~ %</span>
      <span class="nx-meta ml-auto normal-case">{{ t('about.terminal_hint') }}</span>
    </div>

    <!-- Fixed height so the panel never grows while typing — a reflow on every
         keystroke would push the page around. -->
    <div ref="scrollRef" class="nx-hide-scrollbar h-80 overflow-y-auto p-4">
      <div aria-live="polite">
        <div v-for="(entry, index) in entries" :key="index" class="mb-3 last:mb-0">
          <p class="flex gap-2">
            <span aria-hidden="true" class="text-dev">$</span>
            <span class="text-ink">{{ entry.command }}</span>
          </p>
          <p
            v-for="(output, outputIndex) in entry.output"
            :key="outputIndex"
            class="pl-4 whitespace-pre-wrap text-ink-muted"
          >
            {{ output }}
          </p>
        </div>
      </div>

      <span
        v-if="isTyping"
        aria-hidden="true"
        class="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-dev"
      />

      <!-- The live prompt appears only once the intro has finished playing,
           so the two are never typing over each other. -->
      <p v-else class="flex items-baseline gap-2">
        <span aria-hidden="true" class="text-dev">$</span>
        <label class="sr-only" for="nx-terminal-input">{{ t('about.terminal_label') }}</label>
        <input
          id="nx-terminal-input"
          ref="inputRef"
          v-model="draft"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          class="min-w-0 flex-1 bg-transparent text-ink caret-dev outline-none"
          @keydown.enter.prevent="submit"
          @keydown.up.prevent="recall(-1)"
          @keydown.down.prevent="recall(1)"
        />
      </p>
    </div>
  </div>
</template>
