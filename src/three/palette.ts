import type { SkillDomain } from '@/types/skill.type'

/**
 * The two signal colours as Three.js hex literals.
 *
 * They mirror `--color-dev` / `--color-creative` in `src/styles/tokens.css`.
 * WebGL cannot read a CSS custom property, so the values exist twice — but
 * only twice, and this is the one place the GL side keeps them.
 */
export const DEV_HEX = 0x2ee8ff
export const CREATIVE_HEX = 0x9a86f5

export const DOMAIN_HEX: Record<SkillDomain, number> = {
  dev: DEV_HEX,
  creative: CREATIVE_HEX
}
