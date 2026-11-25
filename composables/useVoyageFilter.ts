import { ref, computed, type Ref } from 'vue'

export interface VoyageOption {
  id: string | number
  name: string
  vessel?: string
  voyage?: string
  eta?: string | null
}

const MONTHS: string[][] = [
  ['ene', 'enero', 'jan', 'january'],
  ['feb', 'febrero', 'february'],
  ['mar', 'marzo', 'march'],
  ['abr', 'abril', 'apr', 'april'],
  ['may', 'mayo'],
  ['jun', 'junio', 'june'],
  ['jul', 'julio', 'july'],
  ['ago', 'agosto', 'aug', 'august'],
  ['sep', 'sept', 'septiembre', 'september'],
  ['oct', 'octubre', 'october'],
  ['nov', 'noviembre', 'november'],
  ['dic', 'diciembre', 'dec', 'december'],
]

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const compact = (value: string) => value.replace(/[^a-z0-9]/g, '')

// Every spelling of the ETA a user could reasonably type (ISO, dd/mm/yyyy,
// dd-mm-yy, compact digits, month names), joined into one searchable string.
const etaVariants = (eta?: string | null): string => {
  const m = eta?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  const [, y, mo, d] = m
  const yy = y.slice(2)
  const dn = String(Number(d))
  const mn = String(Number(mo))
  const months = MONTHS[Number(mo) - 1] ?? []
  return [
    `${y}-${mo}-${d}`, `${d}/${mo}/${y}`, `${d}-${mo}-${y}`, `${d}.${mo}.${y}`,
    `${d}/${mo}/${yy}`, `${d}-${mo}-${yy}`, `${dn}/${mn}/${y}`, `${dn}-${mn}-${y}`,
    `${mo}/${y}`, `${mo}-${y}`, `${y}/${mo}/${d}`,
    `${d}${mo}${y}`, `${y}${mo}${d}`, `${d}${mo}${yy}`,
    ...months.flatMap(name => [`${d} ${name} ${y}`, `${dn} ${name} ${y}`, `${name} ${y}`, `${name} ${d}`, `${name} ${dn}`]),
  ].join(' ')
}

const buildHaystack = (item: VoyageOption) => {
  const text = normalize(`${item.vessel ?? ''} ${item.voyage ?? ''} ${item.name ?? ''}`)
  const compactText = compact(text)
  const eta = etaVariants(item.eta)
  return { text: `${text} ${eta}`, compactText: `${compactText} ${compact(eta)}` }
}

/**
 * Vessel / voyage autocomplete search. Tolerant matching: every typed word must
 * match the vessel, the voyage code (with or without dashes/spaces) or the ETA
 * in any common date format. Results keep the catalog order (ETA descending).
 */
export function useVoyageFilter(rawItemsRef: Ref<VoyageOption[]>, getSelectedId: () => string | number | null | undefined) {
  const debouncedSearch = ref('')
  const limit = ref(100)
  let timeout: ReturnType<typeof setTimeout> | undefined

  const onSearch = (value: string | null) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedSearch.value = value || ''
      limit.value = 100
    }, 200)
  }

  const indexed = computed(() => {
    const items = [...rawItemsRef.value].sort((a, b) => (b.eta ?? '').localeCompare(a.eta ?? ''))
    return items.map(item => ({ item, ...buildHaystack(item) }))
  })

  const filteredAll = computed(() => {
    const tokens = normalize(debouncedSearch.value).split(/\s+/).filter(Boolean)
    if (!tokens.length) return indexed.value.map(entry => entry.item)
    return indexed.value
      .filter(entry => tokens.every(token => {
        const flat = compact(token)
        return entry.text.includes(token) || (flat.length > 0 && entry.compactText.includes(flat))
      }))
      .map(entry => entry.item)
  })

  const hasMore = computed(() => filteredAll.value.length > limit.value)

  const onIntersect = (isIntersecting: boolean) => {
    if (isIntersecting && hasMore.value) limit.value += 100
  }

  const filteredItems = computed(() => {
    const sliced = filteredAll.value.slice(0, limit.value)
    const selected = getSelectedId()
    if (selected != null && !sliced.some(item => item.id === selected)) {
      const current = rawItemsRef.value.find(item => item.id === selected)
      if (current) sliced.unshift(current)
    }
    return sliced
  })

  return { onSearch, filteredItems, hasMore, onIntersect }
}
