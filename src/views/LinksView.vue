<script setup lang="ts">
import { onBeforeUnmount, onMounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowRight, ArrowUpRight } from '@respeak/lucide-motion-vue'
import { projects } from '@/data/projects'
import { identity, socials } from '@/data/socials'
import { brandIcons, isMotionBrand } from '@/components/ui/brand'
import { useIconMotion } from '@/composables/useIconMotion'
import { shortProjectName } from '@/utils/projectName'
import NxrLogo from '@/components/ui/NxrLogo.vue'
import ProjectMedia from '@/components/ui/ProjectMedia.vue'

/**
 * The page behind the NFC tag, built for the ten seconds after someone taps
 * a phone against it: who this is, the two things they most likely want
 * (the website, a message), every account, then the newest work.
 *
 * Opened on a phone on mobile data, so it carries nothing heavy (three small
 * screenshots, lazy); and it sets its own `noindex`, because the route is
 * unlisted and a crawler has to agree.
 */
const { t } = useI18n()
const { iconMotion } = useIconMotion()

const LATEST_PROJECTS = 3

const latestProjects = projects.slice(0, LATEST_PROJECTS)

const mail = socials.find((social) => social.brand === 'mail')

const socialTiles = socials
  .filter((social) => social.brand !== 'mail')
  .map((social) => ({
    ...social,
    icon: brandIcons[social.brand],
    isMotionIcon: isMotionBrand(social.brand)
  }))

const BASE_TITLE = 'Jonas Glatz – Developer, AI & Design'

watchEffect(() => {
  document.title = `${t('links.title')} – ${identity.name}`
})

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
  <!-- The padding carries the phone's safe areas: the last row is a link,
       and on iOS the home bar would otherwise sit on it. -->
  <main
    class="mx-auto flex min-h-svh w-full max-w-[34rem] flex-col px-gutter pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]"
  >
    <NxrLogo :title="identity.brand" class="h-7 w-auto self-center" />

    <h1
      v-reveal.wipe
      class="mt-12 text-center text-[clamp(3rem,15vw,4.75rem)] leading-[0.88] font-black tracking-[-0.06em] uppercase"
    >
      {{ identity.name }}<span class="nx-cursor text-violet">.</span>
    </h1>
    <p v-reveal="1" class="mt-4 text-center text-lead font-semibold text-violet">
      {{ identity.role }}
    </p>
    <p
      v-reveal="2"
      class="mx-auto mt-3 max-w-[36ch] text-center text-base text-balance text-ink-muted"
    >
      {{ t('links.intro') }}
    </p>

    <!-- The two things most people came for. -->
    <div v-reveal="3" class="mt-8 grid grid-cols-2 gap-2">
      <RouterLink
        :to="{ name: 'home' }"
        class="group flex min-h-14 touch-manipulation items-center justify-between gap-3 bg-dev px-4 font-bold text-on-dev"
      >
        {{ t('links.website') }}
        <ArrowRight v-bind="iconMotion" triggerTarget="parent" class="size-5" aria-hidden="true" />
      </RouterLink>
      <a
        v-if="mail"
        :href="mail.href"
        class="group flex min-h-14 touch-manipulation items-center justify-between gap-3 bg-ink px-4 font-bold text-void"
      >
        {{ t('links.write') }}
        <ArrowUpRight
          v-bind="iconMotion"
          triggerTarget="parent"
          class="size-5"
          aria-hidden="true"
        />
      </a>
    </div>

    <h2 v-reveal class="mt-12 text-sm font-semibold tracking-[0.06em] text-ink-faint uppercase">
      {{ t('links.elsewhere') }}
    </h2>
    <ul class="mt-3 grid grid-cols-2 gap-2">
      <li
        v-for="(tile, index) in socialTiles"
        :key="tile.id"
        v-reveal="index % 2"
        :class="{ 'col-span-2': index === socialTiles.length - 1 && socialTiles.length % 2 === 1 }"
      >
        <a
          :href="tile.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex h-full min-h-20 touch-manipulation flex-col justify-between gap-3 bg-panel p-4 transition-colors duration-(--nx-dur-fast) hover:bg-ink hover:text-void"
        >
          <component
            :is="tile.icon"
            v-bind="tile.isMotionIcon ? iconMotion : {}"
            class="size-6"
            aria-hidden="true"
          />
          <span>
            <span class="block font-bold">{{ tile.label }}</span>
            <span class="block truncate text-sm opacity-70">{{ tile.handle ?? tile.note }}</span>
          </span>
        </a>
      </li>
    </ul>

    <h2 v-reveal class="mt-12 text-sm font-semibold tracking-[0.06em] text-ink-faint uppercase">
      {{ t('links.latest') }}
    </h2>
    <ul class="mt-3 flex flex-col gap-2">
      <li v-for="(project, index) in latestProjects" :key="project.slug" v-reveal="index">
        <RouterLink
          :to="{ name: 'project-detail', params: { slug: project.slug } }"
          class="group flex touch-manipulation items-center gap-4 bg-panel p-2 pr-4 transition-colors duration-(--nx-dur-fast) hover:bg-raised"
        >
          <div class="w-24 shrink-0"><ProjectMedia :project /></div>
          <span class="min-w-0 flex-1">
            <span class="block font-bold uppercase transition-colors group-hover:text-link">
              {{ shortProjectName(project.name) }}
            </span>
            <span class="line-clamp-2 text-sm text-ink-muted">{{ project.tagline }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>

    <p class="mt-auto pt-12 text-sm text-ink-faint">
      {{ identity.brand }} · {{ identity.location }}
    </p>
  </main>
</template>
