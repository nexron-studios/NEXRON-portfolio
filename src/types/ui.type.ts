/**
 * The accent a panel, tick or chip is drawn in. `line` is the neutral
 * hairline; `dev` and `creative` are the two signal colours that classify
 * everything on the page.
 */
export const panelToneList = ['line', 'dev', 'creative'] as const
export type PanelTone = (typeof panelToneList)[number]

/**
 * Colour scheme. Resolved by `utils/theme.ts` and owned by the ui store, which
 * stamps it on `<html data-theme>`; the Three.js scenes read it from there
 * because they cannot read a CSS custom property.
 */
export const themeList = ['dark', 'light'] as const
export type Theme = (typeof themeList)[number]
