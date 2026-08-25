const EMPTY_MARK = '—'

/** `YYYY-MM` → `MM.YYYY`. Null stays null so the caller can show a gap. */
export const formatMonth = (value: string | null): string | null => {
  if (!value) return null

  const [year, month] = value.split('-')
  if (!year || !month) return null

  return `${month}.${year}`
}

/**
 * Renders a timeline range. `ongoingLabel` is passed in rather than looked up,
 * which keeps this free of i18n and directly testable.
 */
export const formatMonthRange = (
  startedAt: string | null,
  endedAt: string | null,
  isOngoing: boolean,
  ongoingLabel: string
): string => {
  const from = formatMonth(startedAt)
  const to = isOngoing ? ongoingLabel : formatMonth(endedAt)

  if (!from && !to) return EMPTY_MARK
  return `${from ?? EMPTY_MARK} → ${to ?? EMPTY_MARK}`
}
