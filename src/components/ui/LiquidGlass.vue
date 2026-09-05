<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { HTMLAttributes } from 'vue'

/**
 * Liquid Glass — ported from Inspira UI.
 * https://inspira-ui.com/docs/en/components/visualization/liquid-glass
 *
 * Apple-style refraction: a gradient map is rendered to an SVG data URI sized
 * to the element, then `feDisplacementMap` samples it three times — once per
 * colour channel, each at a slightly different scale — and screens the results
 * back together. The per-channel offset is what produces the chromatic
 * fringing along the edges; a single displacement pass only warps.
 *
 * Kept faithful to upstream. Four deviations, all forced by this project:
 *
 *  1. `cn()` from `@inspira-ui/plugins` is replaced by Vue's own array class
 *     binding — the package is not installed and the plan allows no new
 *     dependencies. Same result apart from tailwind-merge's conflict dedupe.
 *  2. `reactive` is imported explicitly. Upstream relies on Nuxt auto-imports
 *     and its file never imports it, which would throw here.
 *  3. The `<style scoped>` block lives in `main.css` instead, under
 *     `.nx-liquid-*` names. This project forbids scoped styles outright, and
 *     upstream's generic `.filter` class would collide with Tailwind's own
 *     `filter` utility once the styles are global.
 *  4. `displace` gets an explicit default of 0. Upstream declares it without
 *     one, so `stdDeviation` renders as `undefined`; 0 is what that resolves
 *     to anyway.
 *
 * Note: the SVG filter id is fixed, so exactly one instance may be mounted at
 * a time — a second would resolve `url(#displacementFilter)` to the first.
 */
interface Props {
  radius?: number
  border?: number
  lightness?: number
  displace?: number
  blend?: string
  xChannel?: 'R' | 'G' | 'B'
  yChannel?: 'R' | 'G' | 'B'
  alpha?: number
  blur?: number
  rOffset?: number
  gOffset?: number
  bOffset?: number
  scale?: number
  frost?: number
  class?: HTMLAttributes['class']
  containerClass?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  radius: 16,
  border: 0.07,
  lightness: 50,
  displace: 0,
  blend: 'difference',
  xChannel: 'R',
  yChannel: 'B',
  alpha: 0.93,
  blur: 11,
  rOffset: 0,
  gOffset: 10,
  bOffset: 20,
  scale: -180,
  frost: 0.05
})

const liquidGlassRoot = ref<HTMLElement | null>(null)
const dimensions = reactive({
  width: 0,
  height: 0
})

let observer: ResizeObserver | null = null

const baseStyle = computed(() => {
  return {
    '--frost': props.frost,
    'border-radius': `${props.radius}px`
  }
})

// Computed displacement image
const displacementImage = computed(() => {
  const border = Math.min(dimensions.width, dimensions.height) * (props.border * 0.5)
  const yBorder = Math.min(dimensions.width, dimensions.height) * (props.border * 0.5)

  return `
    <svg viewBox="0 0 ${dimensions.width} ${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" fill="black"></rect>
      <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="${props.radius}" fill="url(#red)" />
      <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="${props.radius}" fill="url(#blue)" style="mix-blend-mode: ${props.blend}" />
      <rect
        x="${border}"
        y="${yBorder}"
        width="${dimensions.width - border * 2}"
        height="${dimensions.height - border * 2}"
        rx="${props.radius}"
        fill="hsl(0 0% ${props.lightness}% / ${props.alpha})"
        style="filter:blur(${props.blur}px)"
      />
    </svg>
  `
})

// Data URI for SVG filter
const displacementDataUri = computed(() => {
  const encoded = encodeURIComponent(displacementImage.value)
  return `data:image/svg+xml,${encoded}`
})

onMounted(() => {
  if (!liquidGlassRoot.value) return

  observer = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return

    let width = 0
    let height = 0

    if (entry.borderBoxSize && entry.borderBoxSize?.length) {
      width = entry.borderBoxSize[0]!.inlineSize
      height = entry.borderBoxSize[0]!.blockSize
    } else if (entry.contentRect) {
      width = entry.contentRect.width
      height = entry.contentRect.height
    }

    dimensions.width = width
    dimensions.height = height
  })

  observer.observe(liquidGlassRoot.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="liquidGlassRoot" :style="baseStyle" :class="['nx-liquid-effect', props.containerClass]">
    <div :class="['nx-liquid-slot', props.class]">
      <slot />
    </div>

    <svg class="nx-liquid-filter" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="displacementFilter" color-interpolation-filters="sRGB">
          <feImage
            x="0"
            y="0"
            width="100%"
            height="100%"
            :href="displacementDataUri"
            result="map"
          />
          <feDisplacementMap
            id="redchannel"
            in="SourceGraphic"
            in2="map"
            :xChannelSelector="xChannel"
            :yChannelSelector="yChannel"
            :scale="scale + rOffset"
            result="dispRed"
          />
          <feColorMatrix
            in="dispRed"
            type="matrix"
            values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
            result="red"
          />
          <feDisplacementMap
            id="greenchannel"
            in="SourceGraphic"
            in2="map"
            :xChannelSelector="xChannel"
            :yChannelSelector="yChannel"
            :scale="scale + gOffset"
            result="dispGreen"
          />
          <feColorMatrix
            in="dispGreen"
            type="matrix"
            values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
            result="green"
          />
          <feDisplacementMap
            id="bluechannel"
            in="SourceGraphic"
            in2="map"
            :xChannelSelector="xChannel"
            :yChannelSelector="yChannel"
            :scale="scale + bOffset"
            result="dispBlue"
          />
          <feColorMatrix
            in="dispBlue"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
            result="blue"
          />
          <feBlend in="red" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue" mode="screen" result="output" />
          <feGaussianBlur :stdDeviation="displace" />
        </filter>
      </defs>
    </svg>
  </div>
</template>
