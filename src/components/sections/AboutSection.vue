<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { TerminalLineProps } from '@/types/terminal.type'
import NxrTerminal from '@/components/ui/NxrTerminal.vue'

const { t } = useI18n()

const terminalLines: TerminalLineProps[] = [
  { command: 'whoami', output: ['Jonas Glatz'] },
  { command: 'current-focus', output: ['AI · Software · 3D'] },
  {
    command: 'cat philosophy.json',
    output: ['{', '  "mode": "building",', '  "method": "learn by doing"', '}']
  },
  { command: 'coffee --status', output: ['running'] }
]
</script>

<template>
  <div class="grid gap-12 lg:grid-cols-12 lg:gap-10">
    <div class="lg:col-span-6 xl:col-span-5">
      <h3 class="font-display text-section font-bold text-balance">
        {{ t('about.heading') }}
      </h3>

      <div class="mt-8 flex max-w-xl flex-col gap-5 text-lg leading-relaxed text-ink-muted">
        <p class="text-pretty">{{ t('about.body_1') }}</p>
        <p class="text-pretty">{{ t('about.body_2') }}</p>
        <p class="text-pretty">{{ t('about.body_3') }}</p>
      </div>
    </div>

    <!-- Offset into the last five columns rather than filling the row —
         the empty column is what keeps the layout from reading as a slab. -->
    <div class="lg:col-span-5 lg:col-start-8">
      <NxrTerminal :lines="terminalLines" />
    </div>
  </div>
</template>
