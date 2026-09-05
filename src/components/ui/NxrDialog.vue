<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { X } from '@respeak/lucide-motion-vue'
import { useIconMotion } from '@/composables/useIconMotion'

/**
 * A modal on the native `<dialog>` element.
 *
 * `showModal()` brings the focus trap, Escape, the inert background and the
 * top layer with it — all of which a hand-built overlay gets wrong the first
 * time and only half-right the second. It also returns focus to whatever
 * opened the dialog, so the caller does not have to remember the trigger.
 *
 * The backdrop is styled through Tailwind's `backdrop:` variant rather than a
 * rule in `main.css`: `::backdrop` has a utility form, so `styling.md` keeps
 * it in the template with everything else the element does.
 *
 * The dialog does not set a width. How wide a thing wants to be is a property
 * of that thing, not of the frame around it — the slotted content says so, and
 * this only stops it from growing past the viewport.
 *
 * `w-fit` and not `w-auto`: the UA lays a modal out with `inset: 0` and
 * `margin: auto`, and `width: auto` against opposing insets resolves to the
 * full viewport width. It looks like the content is being ignored; it is the
 * box model doing exactly what it is told.
 */
const { open, title } = defineProps<{
  open: boolean
  /** Title bar text, and the dialog's accessible name. */
  title: string
  /** Accessible label for the close button. */
  closeLabel: string
}>()

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)
const { iconMotion } = useIconMotion()

const close = (): void => {
  emit('close')
}

/**
 * Escape and the UA's own close path both fire `close` on the element. Only
 * report it upwards while the parent still thinks the dialog is open — closing
 * it from the watcher below would otherwise echo straight back.
 */
const handleNativeClose = (): void => {
  if (open) close()
}

watch(
  () => open,
  (isOpen) => {
    const dialog = dialogRef.value
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }
)

onBeforeUnmount(() => {
  dialogRef.value?.close()
})
</script>

<template>
  <!-- Clicking the backdrop hits the dialog element itself, not a child, so
       `.self` is what separates "outside" from "inside" here. -->
  <dialog
    ref="dialogRef"
    class="nx-panel m-auto w-fit max-w-[94vw] overflow-visible bg-panel p-0 text-ink backdrop:bg-void/80 backdrop:backdrop-blur-sm"
    :aria-label="title"
    @close="handleNativeClose"
    @click.self="close"
  >
    <div class="flex items-center gap-3 border-b border-line px-4 py-2.5">
      <span class="nx-meta">{{ title }}</span>

      <button
        type="button"
        class="ml-auto flex size-7 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
        :aria-label="closeLabel"
        @click="close"
      >
        <X v-bind="iconMotion" class="size-4" aria-hidden="true" />
      </button>
    </div>

    <div class="p-4 sm:p-6">
      <slot v-if="open" />
    </div>
  </dialog>
</template>
