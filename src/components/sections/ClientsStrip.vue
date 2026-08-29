<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { clients } from '@/data/clients'
import { useLocalizedText } from '@/composables/useLocalizedText'

const { t } = useI18n()
const { localized } = useLocalizedText()

const monogram = (name: string): string => name.slice(0, 2).toUpperCase()
</script>

<template>
  <section v-if="clients.length > 0" :aria-label="t('projects.clients_label')" class="mt-16">
    <p class="nx-meta border-b border-line pb-4">{{ t('projects.clients_label') }}</p>

    <ul class="mt-6 flex flex-wrap gap-3">
      <li
        v-for="client in clients"
        :key="client.id"
        class="nx-panel flex items-center gap-3 px-4 py-3"
      >
        <span
          aria-hidden="true"
          class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-void"
        >
          <img
            v-if="client.logo"
            :src="client.logo"
            alt=""
            class="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <span v-else class="font-mono text-[0.625rem] font-bold">
            {{ monogram(client.name) }}
          </span>
        </span>

        <span>
          <span class="block font-display text-sm font-bold">{{ client.name }}</span>
          <span class="nx-meta block">{{ localized(client.note) }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>
