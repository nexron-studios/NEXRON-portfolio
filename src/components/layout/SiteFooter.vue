<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowUp, ArrowUpRight } from '@respeak/lucide-motion-vue'
import { identity, socials } from '@/data/socials'
import { brandIcons, isMotionBrand } from '@/components/ui/brand'
import { useIconMotion } from '@/composables/useIconMotion'
import { useSectionNav } from '@/composables/useSectionNav'
import glowArt from '@/assets/art/glow.png'
import DitherArt from '@/components/ui/DitherArt.vue'
import NxrLogo from '@/components/ui/NxrLogo.vue'

/**
 * The close: every place Jonas can be found, as a grid of cards with their
 * marks, then a bar with the NEXRON logo and the small print.
 *
 * The mail card names what the address is for but does not print it; the
 * address only appears once someone clicks.
 */
const { t } = useI18n()
const { iconMotion } = useIconMotion()
const { goTo } = useSectionNav()

const cards = socials.map((social) => ({
  ...social,
  icon: brandIcons[social.brand],
  isMotionIcon: isMotionBrand(social.brand),
  isExternal: social.brand !== 'mail'
}))

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer>
    <section
      aria-labelledby="elsewhere-heading"
      class="relative overflow-hidden px-gutter pt-[clamp(3rem,8vw,7rem)] pb-[clamp(3rem,8vw,7rem)]"
    >
      <!-- Violet light rising from the bottom bar, set in Bayer dither. -->
      <DitherArt
        :src="glowArt"
        mode="bayer"
        :cell="6"
        tone="violet"
        :strength="0.42"
        fit="cover"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-[80%]"
      />

      <h2
        id="elsewhere-heading"
        v-reveal.wipe
        class="relative text-[clamp(2.5rem,5.5vw,5rem)] leading-[0.95] font-black tracking-[-0.05em]"
      >
        {{ t('footer.elsewhere') }}
      </h2>

      <ul class="relative mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="(card, index) in cards" :key="card.id" v-reveal="index % 3">
          <a
            :href="card.href"
            :target="card.isExternal ? '_blank' : undefined"
            rel="noopener noreferrer"
            class="group flex h-full items-center gap-5 rounded-lg bg-panel px-6 py-6 transition-colors duration-(--nx-dur-fast) hover:bg-ink hover:text-void"
          >
            <component
              :is="card.icon"
              v-bind="card.isMotionIcon ? iconMotion : {}"
              class="size-8 shrink-0 transition-colors duration-(--nx-dur-fast) group-hover:text-link"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1">
              <span class="block text-lg leading-tight font-bold">{{ card.label }}</span>
              <span v-if="card.handle" class="block truncate text-base opacity-75">
                {{ card.handle }}
              </span>
              <span class="block text-base opacity-60">{{ card.note }}</span>
            </span>
            <ArrowUpRight
              v-bind="iconMotion"
              triggerTarget="parent"
              class="size-5 shrink-0 text-link transition-colors group-hover:text-link"
              aria-hidden="true"
            />
          </a>
        </li>
      </ul>
    </section>

    <div
      class="flex flex-col gap-6 bg-night px-gutter py-8 text-night-ink sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <NxrLogo :title="identity.brand" class="h-9 w-auto shrink-0" />
        <div class="text-base">
          <p>© {{ currentYear }} {{ identity.brand }}</p>
          <p class="text-night-muted">{{ t('footer.built_with') }}</p>
        </div>
      </div>

      <a
        href="#top"
        class="group inline-flex items-center gap-2 text-base font-semibold transition-colors hover:text-link"
        @click="goTo('top', $event)"
      >
        {{ t('footer.back_to_top') }}
        <ArrowUp v-bind="iconMotion" triggerTarget="parent" class="size-4.5" aria-hidden="true" />
      </a>
    </div>
  </footer>
</template>
