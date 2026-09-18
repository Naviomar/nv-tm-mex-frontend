import { ref, computed, type Ref } from 'vue'

/**
 * Autocompletes with large list filtering,
 * debouncing, and automatic infinite scroll.
 * 
 * @param rawItemsRef Ref holding the complete catalog array
 * @param getSelectedId Callback returning the current selected value ID (or IDs for multi-select)
 * @param keyName The key inside item objects used for name searching (defaults to 'name')
 */
export function useAutocompleteFilter<T extends Record<string, any>>(
  rawItemsRef: Ref<T[]>,
  getSelectedId: () => string | number | Array<string | number> | null | undefined,
  keyName: keyof T = 'name' as keyof T
) {
  const search = ref('')
  const debouncedSearch = ref('')
  const limit = ref(100)
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined

  const onSearch = (value: string | null) => {
    search.value = value || ''
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedSearch.value = value || ''
      limit.value = 100 // Reset limit on search query change
    }, 300)
  }

  const filteredAll = computed(() => {
    const query = debouncedSearch.value.toLowerCase().trim()
    let results = rawItemsRef.value
    if (query) {
      results = results.filter(item => {
        const value = item[keyName]
        return value && String(value).toLowerCase().includes(query)
      })
    }
    return results
  })

  const hasMore = computed(() => {
    return filteredAll.value.length > limit.value
  })

  const loadMore = () => {
    limit.value += 100
  }

  const onIntersect = (isIntersecting: boolean) => {
    if (isIntersecting && hasMore.value) {
      loadMore()
    }
  }

  const filteredItems = computed(() => {
    const results = filteredAll.value
    const selected = getSelectedId()
    const selectedIds = Array.isArray(selected) ? selected : selected != null ? [selected] : []

    const sliced = results.slice(0, limit.value)

    // Ensure selected items are present in the list
    const missing = selectedIds
      .map(id => rawItemsRef.value.find(item => item.id === id))
      .filter((item): item is T => !!item && !sliced.some(s => s.id === item.id))
    if (missing.length) {
      sliced.unshift(...missing)
    }

    return sliced
  })

  return {
    onSearch,
    filteredItems,
    hasMore,
    onIntersect,
  }
}
