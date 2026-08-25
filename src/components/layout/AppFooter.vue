<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowUpRight } from '@respeak/lucide-motion-vue'
import { identity, socials } from '@/data/socials'
import { useIconMotion } from '@/composables/useIconMotion'

const { t } = useI18n()
const { iconMotion } = useIconMotion()

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line">
    <div
      class="mx-auto flex w-full max-w-[88rem] flex-col gap-6 px-gutter py-10 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-col gap-1.5">
        <p class="nx-meta">© {{ currentYear }} {{ identity.brand }}</p>
        <p class="nx-meta">{{ t('footer.built_with') }}</p>
      </div>

      <ul class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <li v-for="social in socials" :key="social.id">
          <a
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-baseline gap-2 font-mono text-meta tracking-[0.16em] uppercase text-ink-faint transition-colors hover:text-dev"
          >
            {{ social.label }}
            <span class="text-ink-faint/60 normal-case group-hover:text-dev/70">
              {{ social.handle }}
            </span>
            <ArrowUpRight
              v-bind="iconMotion"
              triggerTarget="parent"
              class="size-3.5 shrink-0 self-center"
              aria-hidden="true"
            />
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>
