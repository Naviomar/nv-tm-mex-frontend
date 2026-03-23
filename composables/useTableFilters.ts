/**
 * Composable for persisting table filters and pagination state in URL query params.
 * This allows users to navigate back to a catalog and maintain their search state.
 */
export function useTableFilters<T extends Record<string, any>>(
  initialFilters: T,
  options: {
    /** Key prefix for sessionStorage (optional backup) */
    storageKey?: string
    /** Fields that should be stored as arrays (e.g., 'referencias') */
    arrayFields?: string[]
    /** Enable per_page functionality */
    enablePerPage?: boolean
    /** Default per_page value */
    defaultPerPage?: number
  } = {}
) {
  const route = useRoute()
  const router = useRouter()

  const { storageKey, arrayFields = [], enablePerPage = false, defaultPerPage = 10 } = options

  // Create reactive filters
  const filters = ref<T>({ ...initialFilters }) as Ref<T>
  const currentPage = ref(1)
  const perPage = ref(defaultPerPage)

  /**
   * Parse value from URL query param to appropriate type
   */
  const parseQueryValue = (key: string, value: string | string[] | undefined): any => {
    if (value === undefined || value === null || value === '') {
      return arrayFields.includes(key) ? [] : initialFilters[key]
    }

    // Handle array fields
    if (arrayFields.includes(key)) {
      if (Array.isArray(value)) {
        return value
      }
      return value.split(',').filter((v) => v !== '')
    }

    // Handle null values
    if (value === 'null') {
      return null
    }

    // Handle numeric values
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value)
    }

    return value
  }

  /**
   * Serialize filter value for URL
   */
  const serializeValue = (key: string, value: any): string | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(',') : undefined
    }

    return String(value)
  }

  /**
   * Load filters from URL query params
   */
  const loadFromUrl = () => {
    const query = route.query

    // Load page
    if (query.page) {
      currentPage.value = Number(query.page) || 1
    }

    // Load per_page if enabled
    if (enablePerPage && query.limit) {
      const perPageValue = Number(query.limit)
      if (!isNaN(perPageValue) && perPageValue > 0) {
        perPage.value = perPageValue
      }
    }

    // Load filters
    const newFilters = { ...initialFilters }
    for (const key of Object.keys(initialFilters)) {
      const queryKey = key
      if (query[queryKey] !== undefined) {
        ;(newFilters as any)[key] = parseQueryValue(key, query[queryKey] as string)
      }
    }

    filters.value = newFilters as T
  }

  /**
   * Sync current filters and page to URL
   */
  const syncToUrl = async () => {
    const query: Record<string, string | undefined> = {}

    // Add page if not 1
    if (currentPage.value > 1) {
      query.page = String(currentPage.value)
    }

    // Add per_page if enabled and not default
    if (enablePerPage && perPage.value !== defaultPerPage) {
      query.limit = String(perPage.value)
    }

    // Add non-default filter values
    for (const [key, value] of Object.entries(filters.value)) {
      const serialized = serializeValue(key, value)
      const initialValue = serializeValue(key, initialFilters[key])

      if (serialized !== initialValue) {
        query[key] = serialized
      }
    }

    // Update URL without navigation (replace to avoid adding to history)
    await router.replace({
      path: route.path,
      query: query as any,
    })

    // Also save to sessionStorage as backup
    if (storageKey) {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            filters: filters.value,
            page: currentPage.value,
            perPage: perPage.value,
            timestamp: Date.now(),
          })
        )
      } catch (e) {
        // Ignore storage errors
      }
    }
  }

  /**
   * Reset filters to initial values and sync to URL
   */
  const resetFilters = async () => {
    filters.value = { ...initialFilters } as T
    currentPage.value = 1
    perPage.value = defaultPerPage
    await syncToUrl()
  }

  /**
   * Set page and sync to URL
   */
  const setPage = async (page: number) => {
    currentPage.value = page
    await syncToUrl()
  }

  /**
   * Get the current URL with filters for use in back navigation
   */
  const getFilteredUrl = (basePath: string): string => {
    const query = new URLSearchParams()

    if (currentPage.value > 1) {
      query.set('page', String(currentPage.value))
    }

    if (enablePerPage && perPage.value !== defaultPerPage) {
      query.set('limit', String(perPage.value))
    }

    for (const [key, value] of Object.entries(filters.value)) {
      const serialized = serializeValue(key, value)
      const initialValue = serializeValue(key, initialFilters[key])

      if (serialized !== undefined && serialized !== initialValue) {
        query.set(key, serialized)
      }
    }

    const queryString = query.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  /**
   * Check if there are any active filters (different from initial)
   */
  const hasActiveFilters = computed(() => {
    for (const [key, value] of Object.entries(filters.value)) {
      const serialized = serializeValue(key, value)
      const initialValue = serializeValue(key, initialFilters[key])
      if (serialized !== initialValue) {
        return true
      }
    }
    return (
      currentPage.value > 1 ||
      (enablePerPage && perPage.value !== defaultPerPage)
    )
  })

  // Load from URL on mount
  onMounted(() => {
    loadFromUrl()
  })

  return {
    filters,
    currentPage,
    perPage,
    syncToUrl,
    resetFilters,
    setPage,
    getFilteredUrl,
    hasActiveFilters,
    loadFromUrl,
  }
}
