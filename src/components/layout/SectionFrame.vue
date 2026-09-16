<script setup lang="ts">
/**
 * Wraps every section in the sheet header that gives the site its structure:
 * a mono index, the title, and a hairline rule running out to the edge.
 */
const { id, index, title } = defineProps<{
  id: string
  /** Zero-padded sheet number, e.g. "03". */
  index: string
  title: string
}>()
</script>

<template>
  <!--
    `scroll-mt-26`: the fixed header is `h-20` plus its `mt-4`, so an anchor
    jump with 5 rem of margin parked the title 1 rem under the bar.
    `py-12 md:py-section`: on a phone two adjacent sections put 9 rem of
    nothing between the last chip of one and the title of the next.
    `overflow-x-clip` because two sections carry canvases that overhang their
    box by `STAGE_BLEED` — see `HeroSection` for why `clip` and not `hidden`.
  -->
  <section
    :id
    :aria-labelledby="`${id}-title`"
    class="relative scroll-mt-26 overflow-x-clip py-12 md:py-section"
  >
    <div class="mx-auto w-full max-w-[88rem] px-gutter">
      <header class="flex items-baseline gap-4 md:gap-6">
        <span class="nx-meta shrink-0 text-dev">{{ index }}</span>

        <h2 :id="`${id}-title`" class="shrink-0 font-mono text-meta tracking-[0.16em] uppercase">
          {{ title }}
        </h2>

        <span class="h-px min-w-0 flex-1 bg-line" />
      </header>

      <div class="mt-10 md:mt-16">
        <slot />
      </div>
    </div>
  </section>
</template>
