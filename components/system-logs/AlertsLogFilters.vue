<template>
  <v-card variant="flat" rounded="xl" class="filter-card mb-4 elevation-1">
    <v-card-title class="pa-4 bg-grey-lighten-5 d-flex align-center">
      <v-icon color="indigo-darken-2" class="mr-2">mdi-filter-variant</v-icon>
      <span class="text-h6 font-weight-bold">Filters</span>
      <v-spacer />
      <v-chip v-if="hasActiveFilters" color="indigo" size="small" variant="flat">
        {{ activeFilterCount }} active
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <v-row dense align="center">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="localFilters.search"
            label="Search title / message / reference"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            placeholder="Type to search..."
            @keyup.enter="applyFilters"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            v-model="localFilters.category"
            :items="categoryOptions"
            item-title="name"
            item-value="code"
            label="Category"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-shape-outline"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            v-model="localFilters.severity"
            :items="severityOptions"
            label="Severity"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-alert-outline"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            v-model="localFilters.resolved_status"
            :items="resolvedOptions"
            label="Resolved"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-check-circle-outline"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            v-model="localFilters.read_status"
            :items="readOptions"
            label="Read"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-email-open-outline"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            v-model="localFilters.dismissed_status"
            :items="dismissedOptions"
            label="Dismissed"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-close-circle-outline"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            v-model="localFilters.date_from"
            label="From"
            type="date"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            v-model="localFilters.date_to"
            label="To"
            type="date"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>

      <v-row dense class="mt-3">
        <v-col cols="12" class="d-flex justify-end ga-2">
          <v-btn
            prepend-icon="mdi-filter-remove"
            variant="outlined"
            color="grey-darken-1"
            @click="resetFilters"
          >
            Clear All
          </v-btn>
          <v-btn
            prepend-icon="mdi-filter-check"
            variant="flat"
            color="indigo"
            @click="applyFilters"
          >
            Apply Filters
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'apply', filters: Record<string, string>): void
  (e: 'clear'): void
}>()

const api = useApiFactory()

const localFilters = reactive<Record<string, string>>({
  search: '',
  category: '',
  severity: '',
  resolved_status: '',
  read_status: '',
  dismissed_status: '',
  date_from: '',
  date_to: '',
})

const categoryOptions = ref<{ name: string; code: string }[]>([])

const severityOptions = [
  { title: 'Info', value: 'info' },
  { title: 'Warning', value: 'warning' },
  { title: 'Error', value: 'error' },
  { title: 'Critical', value: 'critical' },
]

const resolvedOptions = [
  { title: 'Resolved', value: 'resolved' },
  { title: 'Unresolved', value: 'unresolved' },
]

const readOptions = [
  { title: 'Read', value: 'read' },
  { title: 'Unread', value: 'unread' },
]

const dismissedOptions = [
  { title: 'Dismissed', value: 'dismissed' },
  { title: 'Not dismissed', value: 'not_dismissed' },
]

const applyFilters = () => {
  const clean: Record<string, string> = {}
  Object.entries(localFilters).forEach(([k, v]) => {
    if (v) clean[k] = v
  })
  emit('apply', clean)
}

const resetFilters = () => {
  Object.keys(localFilters).forEach((k) => (localFilters[k] = ''))
  emit('clear')
}

const hasActiveFilters = computed(() => {
  return Object.values(localFilters).some((v) => v !== '')
})

const activeFilterCount = computed(() => {
  return Object.values(localFilters).filter((v) => v !== '').length
})

onMounted(async () => {
  try {
    const res = await api.alerts.getAllCategories()
    categoryOptions.value = res?.data ?? res ?? []
  } catch (e) {
    console.error('[AlertsLogFilters] Failed to fetch categories:', e)
  }
})
</script>

<style scoped>
.filter-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
