import type { Component } from 'vue'
// The set has no plain `Mail`; `AtSign` is the closer mark for an address anyway.
import { AtSign } from '@respeak/lucide-motion-vue'
import type { Brand } from '@/data/socials'
import BrandGithub from '@/components/ui/brand/BrandGithub.vue'
import BrandInstagram from '@/components/ui/brand/BrandInstagram.vue'
import BrandLinkedin from '@/components/ui/brand/BrandLinkedin.vue'
import BrandSpotify from '@/components/ui/brand/BrandSpotify.vue'

/**
 * Brand mark per social account.
 *
 * Lucide carries no brand marks, so GitHub, LinkedIn, Instagram and Spotify
 * are local simple-icons paths (CC0) — the one place a non-Lucide icon is
 * allowed. Mail is a real UI concept and stays on the animated Lucide icon.
 */
export const brandIcons: Record<Brand, Component> = {
  github: BrandGithub,
  linkedin: BrandLinkedin,
  instagram: BrandInstagram,
  spotify: BrandSpotify,
  mail: AtSign
}

/** Only the Lucide entry takes `v-bind="iconMotion"`; the paths are static. */
export const isMotionBrand = (brand: Brand): boolean => brand === 'mail'
