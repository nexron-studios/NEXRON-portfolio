const STUDIO_PREFIX = /^NEXRON[-\s]/i

/**
 * The name as the work list sets it: without the studio prefix. Every repo is
 * called `NEXRON-something`, and at poster size five lines starting with the
 * same seven letters read as one word repeated.
 */
export const shortProjectName = (name: string): string => name.replace(STUDIO_PREFIX, '')
