<script setup lang="ts">
import { computed } from 'vue'
import type { ContactField } from '@/composables/useContactForm'

/**
 * One labelled field of the contact form, including its error line and the
 * `aria-describedby` wiring between the two. Exists so the three fields share
 * one definition of what a field looks like rather than three copies of the
 * same utility string.
 *
 * Clawd, the Claude Code mascot (traced pixel for pixel from Jonas' own
 * `clawd-static-base.gif` in the TokenScope project), waits in the site's
 * blue behind the field's top edge, far right, and climbs up while the field
 * has focus. Focus moving to another field drops it here and raises the one
 * there; pure CSS (`focus-within`), so nothing tracks the active field.
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

// A tone step, not an outline: the field is a lighter plate on the ground,
// and focus or an error draws a solid bar under it.
const controlClass = computed(() => [
  'w-full bg-panel px-4 py-3.5 text-base text-ink transition-[box-shadow] duration-(--nx-dur-fast)',
  'placeholder:text-ink-faint focus:outline-none',
  error
    ? 'shadow-[inset_0_-3px_0_var(--color-ink)]'
    : 'focus:shadow-[inset_0_-3px_0_var(--color-dev)]'
])
</script>

<template>
  <div class="group/field">
    <label :for="fieldId" class="block text-base font-semibold">{{ label }}</label>

    <div class="relative mt-2">
      <span
        aria-hidden="true"
        class="pointer-events-none absolute right-4 bottom-full overflow-hidden"
      >
        <svg
          viewBox="0 0 15 9"
          shape-rendering="crispEdges"
          class="block h-6 w-auto translate-y-full text-dev transition-transform duration-(--nx-dur) ease-(--ease-out-expo) group-focus-within/field:translate-y-0"
        >
          <g fill="currentColor">
            <rect x="2" y="0" width="11" height="7" />
            <rect x="0" y="3" width="2" height="2" />
            <rect x="13" y="3" width="2" height="2" />
            <rect x="3" y="7" width="1" height="2" />
            <rect x="5" y="7" width="1" height="2" />
            <rect x="9" y="7" width="1" height="2" />
            <rect x="11" y="7" width="1" height="2" />
          </g>
          <g class="fill-void">
            <rect x="4" y="2" width="1" height="2" />
            <rect x="10" y="2" width="1" height="2" />
          </g>
        </svg>
      </span>

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
    </div>

    <p v-if="error" :id="errorId" class="mt-2 text-base font-medium text-ink">
      {{ error }}
    </p>
  </div>
</template>
