<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { AtSign, LoaderCircle, Send } from '@respeak/lucide-motion-vue'
import { identity } from '@/data/socials'
import { useContactForm } from '@/composables/useContactForm'
import { useIconMotion } from '@/composables/useIconMotion'
import ContactFormField from '@/components/sections/ContactFormField.vue'
import MatrixRain from '@/components/ui/MatrixRain.vue'
import NxrButton from '@/components/ui/NxrButton.vue'

/**
 * The close of the argument: one sentence, the form, and a mail link that
 * does not print the address (it only appears once someone clicks). The
 * other places Jonas can be found are the cards in the footer. Behind it all
 * the Matrix rain, faint.
 */
const MESSAGE_ROWS = 5

const { t } = useI18n()
const { iconMotion } = useIconMotion()
const { values, errors, isSubmitting, isConfigured, handleBlur, revalidate, submit } =
  useContactForm()
</script>

<template>
  <section
    id="contact"
    aria-labelledby="contact-heading"
    class="relative overflow-hidden px-gutter py-[clamp(3rem,10vw,9rem)] md:mt-section"
  >
    <!-- The rain is the ground of this section, faded out at both edges so
         it starts and ends in the page instead of in a hard line. -->
    <MatrixRain
      class="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] opacity-35"
    />

    <div class="relative grid gap-x-10 gap-y-14 lg:grid-cols-12">
      <div class="lg:col-span-6">
        <h2 id="contact-heading" v-reveal class="text-section font-bold">
          {{ t('contact.title') }}
        </h2>
        <p
          v-reveal.wipe="1"
          class="mt-6 max-w-[14ch] text-[clamp(2.5rem,5vw,4.75rem)] leading-[0.92] font-black tracking-[-0.05em] text-balance"
        >
          {{ t('contact.heading') }}
        </p>
        <p v-reveal="2" class="mt-6 max-w-[40ch] text-lead font-medium text-pretty">
          {{ t('contact.intro') }}
        </p>

        <a
          v-reveal="3"
          :href="`mailto:${identity.email}`"
          class="group mt-10 inline-flex items-center gap-3 text-lead font-bold text-link transition-colors duration-(--nx-dur-fast) hover:text-link"
        >
          <AtSign v-bind="iconMotion" triggerTarget="parent" class="size-6" aria-hidden="true" />
          <span class="underline decoration-2 underline-offset-4">{{
            t('contact.write_mail')
          }}</span>
        </a>
      </div>

      <form
        v-reveal="2"
        novalidate
        class="flex flex-col gap-6 lg:col-span-5 lg:col-start-8"
        @submit.prevent="submit"
      >
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

        <!-- With no endpoint the form would silently do nothing, so it says
             so and points at the address instead of pretending to send. -->
        <p v-if="!isConfigured" class="text-base text-ink-muted">
          {{ t('contact.not_configured') }}
        </p>

        <div>
          <NxrButton type="submit" :is-disabled="isSubmitting || !isConfigured">
            {{ isSubmitting ? t('contact.sending') : t('contact.send') }}
            <LoaderCircle v-if="isSubmitting" class="size-4.5 animate-spin" aria-hidden="true" />
            <Send
              v-else
              v-bind="iconMotion"
              triggerTarget="closest:button"
              clip
              class="size-4.5"
              aria-hidden="true"
            />
          </NxrButton>
        </div>

        <p aria-live="polite" class="sr-only">
          {{ isSubmitting ? t('contact.sending') : '' }}
        </p>
      </form>
    </div>
  </section>
</template>
