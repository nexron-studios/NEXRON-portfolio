<script setup lang="ts">
import { computed, defineAsyncComponent, ref, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { labEntries } from '@/data/lab'
import { useLocalizedText } from '@/composables/useLocalizedText'
import NxrCornerTicks from '@/components/ui/NxrCornerTicks.vue'

const { t } = useI18n()
const { localized } = useLocalizedText()

/**
 * Only the selected module is mounted, so the Lab costs exactly one WebGL
 * context no matter how many experiments end up living here.
 */
const moduleComponents: Record<string, Component> = {
  'voxel-forge': defineAsyncComponent(() => import('@/components/three/VoxelForge.vue')),
  'grid-field': defineAsyncComponent(() => import('@/components/three/ParticleField.vue')),
  'signal-noise': defineAsyncComponent(() => import('@/components/three/SignalNoise.vue'))
}

const modules = computed(() => labEntries.filter((entry) => entry.kind === 'module'))
const notes = computed(() => labEntries.filter((entry) => entry.kind === 'note'))

const activeId = ref(modules.value[0]?.id ?? '')
const activeModule = computed(() => modules.value.find((entry) => entry.id === activeId.value))
const activeComponent = computed(() => moduleComponents[activeId.value])
</script>

<template>
  <div>
    <p class="max-w-xl text-lg leading-relaxed text-ink-muted text-pretty">
      {{ t('lab.intro') }}
    </p>

    <div class="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-8">
      <!-- Bench selector -->
      <div class="flex flex-col lg:col-span-4">
        <ul class="flex flex-col" role="tablist">
          <li v-for="entry in modules" :key="entry.id">
            <button
              type="button"
              role="tab"
              :aria-selected="activeId === entry.id"
              aria-controls="lab-viewport"
              class="w-full border-b border-line py-4 text-left transition-colors duration-[--nx-dur-fast]"
              @click="activeId = entry.id"
            >
              <span class="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  class="h-1.5 w-1.5 shrink-0 transition-colors"
                  :class="activeId === entry.id ? 'bg-dev' : 'bg-line-strong'"
                />
                <span
                  class="font-mono text-sm transition-colors"
                  :class="activeId === entry.id ? 'text-dev' : 'text-ink-muted'"
                >
                  {{ localized(entry.title) }}
                </span>
              </span>

              <span class="mt-2 flex flex-wrap gap-1.5 pl-[1.125rem]">
                <span
                  v-for="tag in entry.tags"
                  :key="tag"
                  class="nx-meta border border-line px-1.5 py-0.5"
                >
                  {{ tag }}
                </span>
              </span>
            </button>
          </li>
        </ul>

        <p
          v-if="activeModule"
          class="mt-6 text-sm leading-relaxed text-ink-muted text-pretty"
        >
          {{ localized(activeModule.description) }}
        </p>
      </div>

      <!-- Viewport -->
      <div class="lg:col-span-8">
        <div
          id="lab-viewport"
          role="tabpanel"
          class="relative h-[24rem] w-full border border-line sm:h-[28rem]"
        >
          <NxrCornerTicks tone="dev" />
          <component :is="activeComponent" :key="activeId" />
        </div>
      </div>
    </div>

    <!--
      Areas that have been worked on but have no runnable demo. They stay as
      text rather than being dressed up as modules — nothing here should look
      more finished than it is.
    -->
    <ul class="mt-12 grid gap-px border-t border-line sm:grid-cols-2">
      <li v-for="entry in notes" :key="entry.id" class="border-b border-line py-5 sm:pr-8">
        <h3 class="font-mono text-sm text-ink">{{ localized(entry.title) }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
          {{ localized(entry.description) }}
        </p>
        <ul class="mt-3 flex flex-wrap gap-1.5">
          <li
            v-for="tag in entry.tags"
            :key="tag"
            class="nx-meta border border-line px-1.5 py-0.5"
          >
            {{ tag }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
