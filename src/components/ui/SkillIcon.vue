<script setup lang="ts">
import { computed } from 'vue'
import { skillIcons } from '@/data/skillIcons'

/**
 * A technology's mark from `data/skillIcons.ts`, in `currentColor`.
 *
 * Three kinds: filled brand shapes (simple-icons, devicon), Lucide outlines
 * for techniques that have no logo (RAG, chatbots), and a two-letter
 * monogram where neither exists. A name with no entry renders nothing, so a
 * new skill shows as text until it gets a mark.
 */
const { name } = defineProps<{ name: string }>()

const icon = computed(() => skillIcons[name] ?? null)

const pathList = computed(() => {
  const current = icon.value
  if (!current || current.mode === 'text') return []
  return typeof current.d === 'string' ? [current.d] : [...current.d]
})

const viewBox = computed(() => {
  const current = icon.value
  const side = current && current.mode !== 'text' ? (current.viewBox ?? 24) : 24
  return `0 0 ${side} ${side}`
})
</script>

<template>
  <span
    v-if="icon?.mode === 'text'"
    aria-hidden="true"
    class="inline-flex items-center justify-center text-[0.7em] leading-none font-black tracking-[-0.04em]"
  >
    {{ icon.label }}
  </span>
  <svg
    v-else-if="icon"
    :viewBox
    aria-hidden="true"
    :fill="icon.mode === 'fill' ? 'currentColor' : 'none'"
    :stroke="icon.mode === 'stroke' ? 'currentColor' : 'none'"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path v-for="(path, index) in pathList" :key="index" :d="path" />
  </svg>
</template>
