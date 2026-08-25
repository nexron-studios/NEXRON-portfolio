<script setup lang="ts">
import { computed } from 'vue'
import type { ContactField } from '@/composables/useContactForm'

/**
 * One labelled field of the contact form, including its error line and the
 * `aria-describedby` wiring between the two. Exists so the three fields share
 * one definition of what a field looks like rather than three copies of the
 * same utility string.
 */
const {
  field,
  label,
  error = null,
  type = 'text',
  autocomplete = undefined,
  rows = null
} = defineProps<{
  field: ContactField
  label: string
  /** Validation message, or null while the field is fine. */
  error?: string | null
  type?: 'text' | 'email'
  autocomplete?: string
  /** Renders a textarea with this many rows instead of an input. */
  rows?: number | null
}>()

const emit = defineEmits<{
  blur: []
  input: []
}>()

const value = defineModel<string>({ required: true })

const fieldId = computed(() => `contact-${field}`)
const errorId = computed(() => `${fieldId.value}-error`)

const controlClass = computed(() => [
  'mt-2 w-full border bg-panel px-3.5 py-3 font-mono text-sm text-ink transition-colors',
  'placeholder:text-ink-faint/60 focus:outline-none',
  error ? 'border-building' : 'border-line focus:border-dev'
])
</script>

<template>
  <div>
    <label :for="fieldId" class="nx-meta block">{{ label }}</label>

    <textarea
      v-if="rows"
      :id="fieldId"
      v-model="value"
      :name="field"
      :rows
      class="resize-y"
      :class="controlClass"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      @blur="emit('blur')"
      @input="emit('input')"
    />

    <input
      v-else
      :id="fieldId"
      v-model="value"
      :type
      :name="field"
      :autocomplete
      :class="controlClass"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      @blur="emit('blur')"
      @input="emit('input')"
    />

    <p v-if="error" :id="errorId" class="nx-meta mt-2 text-building">
      {{ error }}
    </p>
  </div>
</template>
