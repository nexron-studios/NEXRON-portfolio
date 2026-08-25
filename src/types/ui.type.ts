/**
 * The accent a panel, tick or chip is drawn in. `line` is the neutral
 * hairline; `dev` and `creative` are the two signal colours that classify
 * everything on the page.
 */
export const panelToneList = ['line', 'dev', 'creative'] as const
export type PanelTone = (typeof panelToneList)[number]
