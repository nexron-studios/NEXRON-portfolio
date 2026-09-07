<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIntersectionObserver } from '@vueuse/core'
import { ArrowUpRight, LoaderCircle, Send } from '@respeak/lucide-motion-vue'
import { identity } from '@/data/socials'
import { useContactForm } from '@/composables/useContactForm'
import { useIconMotion } from '@/composables/useIconMotion'
import ContactFormField from '@/components/sections/ContactFormField.vue'
import NxrButton from '@/components/ui/NxrButton.vue'

const MESSAGE_ROWS = 5

const { t } = useI18n()
const { iconMotion } = useIconMotion()

const { values, errors, isSubmitting, isConfigured, handleBlur, revalidate, submit } =
  useContactForm()

const PeekCharacter = defineAsyncComponent(() => import('@/components/three/PeekCharacter.vue'))

// Decoration behind the form, so neither the chunk nor the model is fetched
// until the block is within reach of the viewport — same gate as the LED sign.
const peekStage = ref<HTMLElement | null>(null)
const isPeekNear = ref(false)

const { stop: stopPeekObserver } = useIntersectionObserver(
  peekStage,
  (entries) => {
    if (!entries[0]?.isIntersecting) return
    isPeekNear.value = true
    stopPeekObserver()
  },
  { rootMargin: '400px' }
)
</script>

<template>
  <div class="grid gap-12 lg:grid-cols-12 lg:gap-10">
    <div class="lg:col-span-5">
      <h3 class="font-display text-section font-bold text-balance">
        {{ t('contact.heading') }}<br />
        <span class="text-dev">{{ t('contact.heading_accent') }}</span>
      </h3>

      <p class="mt-6 max-w-md leading-relaxed text-pretty text-ink-muted">
        {{ t('contact.intro') }}
      </p>
    </div>

    <div ref="peekStage" class="relative lg:col-span-6 lg:col-start-7">
      <!--
        The clipping edge is pulled down past the first label, because the label
        has no surface of its own — only the input below it does (`bg-panel`).
        Cutting at the form's top edge would leave the figure ending in mid-air.
      -->
      <div
        class="pointer-events-none absolute inset-x-0 bottom-[calc(100%-3rem)] z-0 hidden h-40 overflow-hidden lg:block"
      >
        <PeekCharacter v-if="isPeekNear" />
      </div>

      <form novalidate class="relative z-10 flex flex-col gap-5" @submit.prevent="submit">
        <ContactFormField
          v-model="values.name"
          field="name"
          :label="t('contact.name')"
          :error="errors.name"
          autocomplete="name"
          @blur="handleBlur('name')"
          @input="revalidate('name')"
        />

        <ContactFormField
          v-model="values.email"
          field="email"
          type="email"
          :label="t('contact.email')"
          :error="errors.email"
          autocomplete="email"
          @blur="handleBlur('email')"
          @input="revalidate('email')"
        />

        <ContactFormField
          v-model="values.message"
          field="message"
          :label="t('contact.message')"
          :error="errors.message"
          :rows="MESSAGE_ROWS"
          @blur="handleBlur('message')"
          @input="revalidate('message')"
        />

        <!--
          With no endpoint configured the form would silently do nothing, so
          it says so and points at the links instead of pretending to send.
        -->
        <p
          v-if="!isConfigured"
          class="nx-meta flex items-center gap-2 border border-dashed border-line-strong px-3 py-2.5 text-ink-faint"
        >
          <span aria-hidden="true" class="h-1 w-1 bg-building" />
          {{ t('contact.not_configured') }}
        </p>

        <div class="mt-2">
          <NxrButton type="submit" :is-disabled="isSubmitting || !isConfigured">
            <LoaderCircle
              v-if="isSubmitting"
              class="size-4 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <Send
              v-else
              v-bind="iconMotion"
              triggerTarget="closest:button"
              clip
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            {{ isSubmitting ? t('contact.sending') : t('contact.send') }}
          </NxrButton>
        </div>

        <p aria-live="polite" class="sr-only">
          {{ isSubmitting ? t('contact.sending') : '' }}
        </p>
      </form>
    </div>
  </div>
</template>
