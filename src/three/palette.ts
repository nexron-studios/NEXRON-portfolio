import type { SkillDomain } from '@/types/skill.type'
import type { Theme } from '@/types/ui.type'

/**
 * The signal colours as Three.js hex literals.
 *
 * They mirror `--color-dev` / `--color-creative` / `--color-ai` /
 * `--color-infra` in `src/styles/tokens.css`, per theme. WebGL cannot read a
 * CSS custom property, so the values exist twice — but only twice, and this is
 * the one place the GL side keeps them. Change a colour in `tokens.css` and
 * this file has to follow in the same commit.
 */
export const DEV_HEX = 0x8b5cf6
export const CREATIVE_HEX = 0xe879f9

const DOMAIN_HEX_DARK: Record<SkillDomain, number> = {
  dev: DEV_HEX,
  ai: 0xa855f7,
  creative: CREATIVE_HEX,
  infra: 0x5b21b6
}

const DOMAIN_HEX_LIGHT: Record<SkillDomain, number> = {
  dev: 0x6d28d9,
  ai: 0x9333ea,
  creative: 0xa21caf,
  infra: 0x3b1a78
}

/** Page ground per theme — scenes clear to this so they sit flush with the page. */
const VOID_HEX: Record<Theme, number> = {
  dark: 0x08060f,
  light: 0xf7f5fb
}

export const getDomainHex = (domain: SkillDomain, theme: Theme): number =>
  theme === 'light' ? DOMAIN_HEX_LIGHT[domain] : DOMAIN_HEX_DARK[domain]

export const getVoidHex = (theme: Theme): number => VOID_HEX[theme]

/**
 * Kept for the scenes that only ever need the two original signal colours.
 * New code should reach for `getDomainHex` so it follows the theme.
 */
export const DOMAIN_HEX = DOMAIN_HEX_DARK
