<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { Earth } from '@respeak/lucide-motion-vue'
import { identity, socials } from '@/data/socials'
import { brandIcons, isMotionBrand } from '@/components/ui/brand'
import { useLocalizedText } from '@/composables/useLocalizedText'
import { useUiStore } from '@/stores/ui'
import TetrisBackdrop from '@/components/layout/TetrisBackdrop.vue'
import ThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import NxrLinkCard from '@/components/ui/NxrLinkCard.vue'
import NxrLogo from '@/components/ui/NxrLogo.vue'

/**
 * The page behind the NFC tag: personal links and socials, as one column of
 * thumb-sized rows.
 *
 * Chrome-free on purpose — `App.vue` carries no header or footer, so a view
 * simply does not import them (`ProjectDetailView` does the same). That also
 * means the theme and language switchers have to be placed here, since their
 * usual home is the header.
 *
 * No WebGL. The backdrop is the 2D canvas the rest of the site uses, because
 * this page is opened from a tag on mobile data and a Three.js chunk is the
 * wrong thing to make someone wait for.
 */
const { t } = useI18n()
const { localized } = useLocalizedText()
const uiStore = useUiStore()

/**
 * Stagger between rows. Zero under reduced motion: `main.css` collapses the
 * *duration* of every transition but not its delay, so a delay left in place
 * would hold each row invisible and then pop it in.
 */
const STAGGER_MS = 40

const staggerDelay = (index: number): string =>
  uiStore.prefersReducedMotion ? '0ms' : `${index * STAGGER_MS}ms`

const socialRows = computed(() =>
  socials.map((social) => ({
    key: social.id,
    icon: brandIcons[social.brand],
    isMotionIcon: isMotionBrand(social.brand),
    label: social.label,
    handle: social.handle ?? '',
    note: localized(social.note),
    href: social.href
  }))
)

const BASE_TITLE = 'Jonas Glatz – Developer, AI & Design'

watchEffect(() => {
  document.title = `${t('links.title')} – ${identity.name}`
})

/**
 * The route is unlisted, which only holds if a crawler agrees. `index.html`
 * carries every meta tag statically and there is no head management here, so
 * the tag is hung and removed by hand for the lifetime of this view.
 */
let robotsMeta: HTMLMetaElement | null = null

onMounted(() => {
  robotsMeta = document.createElement('meta')
  robotsMeta.name = 'robots'
  robotsMeta.content = 'noindex, nofollow'
  document.head.appendChild(robotsMeta)
})

onBeforeUnmount(() => {
  document.title = BASE_TITLE
  robotsMeta?.remove()
  robotsMeta = null
})
</script>

<template>
  <!--
    `pb` carries the phone's home-bar inset: the last row is a link, and on iOS
    the gesture area would otherwise sit on top of it.
  -->
  <div
    class="relative min-h-svh pb-[calc(3rem+env(safe-area-inset-bottom,0px))]"
    :style="{ paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))' }"
  >
    <TetrisBackdrop />

    <div class="relative z-10 mx-auto w-full max-w-[34rem] px-gutter">
      <header class="text-center">
        <NxrLogo :title="identity.brand" class="mx-auto h-7 w-auto text-ink" />

        <h1 class="mt-8 font-display text-3xl font-bold text-balance text-ink">
          {{ identity.name }}
        </h1>

        <p class="mt-3 font-mono text-sm tracking-wide text-dev">
          {{ localized(identity.role) }}
        </p>

        <p class="nx-meta mt-4">{{ identity.location }}</p>
      </header>

      <section aria-labelledby="links-socials" class="mt-12">
        <h2 id="links-socials" class="nx-meta border-b border-line pb-3 text-dev">
          {{ t('links.title') }}
        </h2>

        <TransitionGroup tag="ul" name="rise" appear class="mt-4 grid grid-cols-1 gap-3">
          <li key="website">
            <NxrLinkCard
              :icon="Earth"
              is-motion-icon
              :label="t('links.website')"
              :note="t('links.website_note')"
              :to="{ name: 'home' }"
            />
          </li>
          <li
            v-for="(row, index) in socialRows"
            :key="row.key"
            :style="{ transitionDelay: staggerDelay(index) }"
          >
            <NxrLinkCard
              :icon="row.icon"
              :is-motion-icon="row.isMotionIcon"
              :label="row.label"
              :handle="row.handle"
              :note="row.note"
              :href="row.href"
            />
          </li>
        </TransitionGroup>
      </section>

      <div class="mt-10 flex items-center justify-center gap-3">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </div>
  </div>
</template>
