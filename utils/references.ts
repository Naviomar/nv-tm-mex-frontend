// System reference numbers follow [COUNTRY(2)?][SERVICE(2 letters)][YEAR(2)]-[CONSECUTIVE],
// e.g. IM25-2103, EA26-0093, MXIA26-0093. Tracker refs use a client-specific prefix instead
// (e.g. SUB24-3450, LIV25-1002) and don't match that fixed 2-letter service code shape.
const REFERENCE_PATTERN = /^(?:[A-Z]{2})?[A-Z]{2}\d{2}-\d+$/i
const PREFIXED_PATTERN = /^[A-Za-z]+\d{2}-\d+$/
const NUMERIC_ONLY_PATTERN = /^\d+$/

export type ReferenceKind = 'reference' | 'tracker' | 'both'

/**
 * Infers whether a typed value is a system reference #, a tracker ref, or -
 * when it's a bare number with no prefix at all - ambiguous, in which case
 * both filters should be searched.
 */
export const classifyReference = (rawRef: string): ReferenceKind => {
  const ref = rawRef.trim()

  if (REFERENCE_PATTERN.test(ref)) {
    return 'reference'
  }

  if (PREFIXED_PATTERN.test(ref)) {
    return 'tracker'
  }

  if (NUMERIC_ONLY_PATTERN.test(ref)) {
    return 'both'
  }

  return 'reference'
}
