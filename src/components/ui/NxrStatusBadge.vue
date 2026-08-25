<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ProjectStatus } from '@/types/project.type'

const { status } = defineProps<{ status: ProjectStatus }>()

const { t } = useI18n()

const dotClass: Record<ProjectStatus, string> = {
  shipped: 'bg-shipped',
  building: 'bg-building',
  experiment: 'bg-creative'
}
</script>

<template>
  <span class="nx-meta inline-flex items-center gap-2 whitespace-nowrap">
    <span aria-hidden="true" class="h-1.5 w-1.5 shrink-0" :class="dotClass[status]" />
    {{ t(`projects.status_${status}`) }}
  </span>
</template>
