/**
 * Series filter of a reference catalog (IM26, IM27...): which reference years are listed.
 *
 * Three modes, so the default can stay dynamic:
 *  - auto:   the window of years in use now (see defaultSeriesYears); it moves by itself with the calendar
 *  - custom: the years the user picked
 *  - all:    every year
 * Only the user's explicit choice is saved (per user, like the other UI preferences); "auto" saves nothing
 * about the years, so it keeps following the date.
 */
export type SeriesMode = 'auto' | 'custom' | 'all'

/**
 * Current year and the next one; from January to June the previous year too, because the references of
 * the year that just ended are still in use. In November 2026: 2026, 2027. In March 2027: 2026, 2027, 2028.
 */
export const defaultSeriesYears = (now: Date = new Date()): number[] => {
  const year = now.getFullYear()
  const years = [year, year + 1]
  if (now.getMonth() <= 5) years.unshift(year - 1)
  return years
}

export function useReferenceSeries(key: string, fromYear = 2005) {
  const { readLocal, persist, loadServer } = useUiPreference(`series-filter:${key}`)

  const mode = ref<SeriesMode>('auto')
  const custom = ref<number[]>([])

  const apply = (value: any) => {
    if (value?.mode === 'all') {
      mode.value = 'all'
    } else if (value?.mode === 'custom' && Array.isArray(value.years) && value.years.length) {
      mode.value = 'custom'
      custom.value = value.years.map(Number).filter((y: number) => Number.isFinite(y))
    } else {
      mode.value = 'auto'
    }
  }

  // Local copy first (instant), then the server one, which follows the user across devices
  apply(readLocal())
  onMounted(async () => {
    const server = await loadServer()
    if (server) apply(server)
  })

  const defaults = computed(() => defaultSeriesYears())

  /** Years sent as filter; empty = all years */
  const years = computed<number[]>(() => {
    if (mode.value === 'all') return []
    return mode.value === 'custom' ? [...custom.value].sort((a, b) => a - b) : defaults.value
  })

  /** Series shown as chips: the default window plus anything the user picked outside of it */
  const quickYears = computed(() => [...new Set([...defaults.value, ...years.value])].sort((a, b) => a - b))

  /** Every other series (older ones), newest first, for the "more" menu */
  const olderYears = computed(() => {
    const newest = Math.max(...defaults.value)
    const list: number[] = []
    for (let y = newest; y >= fromYear; y--) if (!quickYears.value.includes(y)) list.push(y)
    return list
  })

  const sameAsDefault = (list: number[]) =>
    list.length === defaults.value.length && defaults.value.every((y) => list.includes(y))

  const save = () => persist(mode.value === 'custom' ? { mode: 'custom', years: custom.value } : { mode: mode.value })

  const select = (list: number[]) => {
    if (!list.length) mode.value = 'all'
    else if (sameAsDefault(list)) mode.value = 'auto'
    else {
      mode.value = 'custom'
      custom.value = list
    }
    save()
  }

  const toggle = (year: number) => {
    const current = new Set(years.value)
    current.has(year) ? current.delete(year) : current.add(year)
    select([...current])
  }

  const showAll = () => select([])
  const reset = () => {
    mode.value = 'auto'
    save()
  }

  return reactive({ mode, years, defaults, quickYears, olderYears, toggle, showAll, reset })
}
