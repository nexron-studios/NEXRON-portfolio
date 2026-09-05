<script setup lang="ts">
import { useI18n } from 'vue-i18n'
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

    <div class="lg:col-span-6 lg:col-start-7">
      <form novalidate class="flex flex-col gap-5" @submit.prevent="submit">
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
