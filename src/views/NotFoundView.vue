<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import knightArt from '@/assets/art/knight.png'
import DitherArt from '@/components/ui/DitherArt.vue'
import NxrButton from '@/components/ui/NxrButton.vue'
import NxrLogo from '@/components/ui/NxrLogo.vue'

const { t } = useI18n()
</script>

<template>
  <main
    class="relative flex min-h-svh flex-col justify-between overflow-hidden px-gutter pt-8 pb-10"
  >
    <!-- A lone knight walking off towards a far castle: whoever lands here
         has wandered off the path too. Set in Bayer dither like the footer
         glow, and it gives way to the pointer like the chain in Journey. Its
         edges fade out in the source itself, so they dissolve into single
         pixels. Wind rolls across the plain around the knight while the
         castle stands still. On phones it sits faint behind the text. -->
    <DitherArt
      :src="knightArt"
      mode="bayer"
      :cell="3.5"
      :strength="1"
      :white="0.45"
      is-windy
      class="pointer-events-none absolute -top-[12%] right-0 h-[124%] w-full opacity-35 md:w-[62%] md:opacity-100"
    />

    <NxrLogo title="NEXRON Studios" class="relative h-7 w-auto" />

    <div class="relative">
      <h1 class="text-[clamp(6rem,20vw,16rem)] leading-[0.84] font-black tracking-[-0.055em]">
        404
      </h1>
      <p class="mt-6 max-w-[36ch] text-lead font-medium">{{ t('global.not_found') }}</p>
      <div class="mt-8">
        <NxrButton href="/">{{ t('global.home') }}</NxrButton>
      </div>
    </div>
  </main>
</template>
