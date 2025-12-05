<template>
  <div class="flex items-center gap-2 mb-4">
    <v-btn :to="backUrl" color="slate" size="small" variant="outlined">
      <v-icon>mdi-arrow-left</v-icon> Back
    </v-btn>
    <v-btn
      v-if="hasFilters"
      :to="fallbackUrl"
      color="warning"
      size="small"
      variant="text"
      title="Clear filters and go back to first page"
    >
      <v-icon size="small">mdi-filter-remove</v-icon> Clear filters
    </v-btn>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fallbackUrl: string
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  storageKey: undefined,
})

const route = useRoute()

/**
 * Get the back URL from either:
 * 1. The referrer query param (if present)
 * 2. SessionStorage (if storageKey provided)
 * 3. The fallback URL
 */
const backUrl = computed(() => {
  // Check if we have a referrer in query params
  if (route.query.from) {
    return route.query.from as string
  }

  // Try to get from sessionStorage based on the catalog type
  const catalogKey = getCatalogStorageKey()
  if (catalogKey) {
    try {
      const stored = sessionStorage.getItem(catalogKey)
      if (stored) {
        const data = JSON.parse(stored)
        // Check if data is not too old (1 hour max)
        if (data.timestamp && Date.now() - data.timestamp < 3600000) {
          return buildUrlFromStoredFilters(data)
        }
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  return props.fallbackUrl
})

/**
 * Check if there are active filters
 */
const hasFilters = computed(() => {
  return backUrl.value !== props.fallbackUrl
})

/**
 * Determine the storage key based on the current route
 */
const getCatalogStorageKey = (): string | null => {
  const path = route.path

  // Map routes to their filter storage keys
  const routeStorageMap: Record<string, string> = {
    '/maritime/import': 'maritime-import-filters',
    '/maritime/export': 'maritime-export-filters',
    '/air/import': 'air-import-filters',
    '/air/export': 'air-export-filters',
    '/configuration/customers': 'customers-filters',
    '/configuration/freight-forwarders': 'freight-forwarders-filters',
    '/configuration/charges': 'charges-filters',
    '/invoices/sea-import': 'sea-import-invoices-filters',
    '/invoices/sea-export': 'sea-export-invoices-filters',
    '/invoices/air-import': 'air-import-invoices-filters',
    '/invoices/air-export': 'air-export-invoices-filters',
  }

  // Find matching storage key based on route prefix
  for (const [routePrefix, key] of Object.entries(routeStorageMap)) {
    if (path.startsWith(routePrefix)) {
      return key
    }
  }

  return props.storageKey || null
}

/**
 * Build URL from stored filter data
 */
const buildUrlFromStoredFilters = (data: { filters: Record<string, any>; page: number }): string => {
  const query = new URLSearchParams()

  if (data.page > 1) {
    query.set('page', String(data.page))
  }

  for (const [key, value] of Object.entries(data.filters || {})) {
    if (value === null || value === undefined || value === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    if (key === 'referencia') continue // Skip temporary input field

    const serialized = Array.isArray(value) ? value.join(',') : String(value)
    query.set(key, serialized)
  }

  const queryString = query.toString()
  return queryString ? `${props.fallbackUrl}?${queryString}` : props.fallbackUrl
}
</script>
