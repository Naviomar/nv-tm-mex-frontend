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
        <v-col cols="12" md="4">
          <v-text-field
            v-model="localFilters.search"
            label="Search in messages"
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
            v-model="localFilters.type"
            :items="typeOptions"
            label="Type"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-shape"
            clearable
            hide-details
          />
        </v-col>
        
        <v-col cols="6" md="2">
          <v-select
            v-model="localFilters.level"
            :items="levelOptions"
            label="Level"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-speedometer"
            clearable
            hide-details
          />
        </v-col>
        
        <v-col cols="6" md="2">
          <v-text-field
            v-model="localFilters.date_from"
            label="From date"
            type="date"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-calendar-start"
            hide-details
          />
        </v-col>
        
        <v-col cols="6" md="2">
          <v-text-field
            v-model="localFilters.date_to"
            label="To date"
            type="date"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-calendar-end"
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

const localFilters = reactive<Record<string, string>>({
  search: '',
  type: '',
  level: '',
  date_from: '',
  date_to: '',
})

const typeOptions = [
  { title: 'HTTP Error', value: 'http_error' },
  { title: 'Exception', value: 'exception' },
  { title: 'Job Failed', value: 'job_failed' },
  { title: 'Job Slow', value: 'job_slow' },
  { title: 'Warning', value: 'warning' },
  { title: 'Critical', value: 'critical' },
  { title: 'System', value: 'system' },
  { title: 'Created', value: 'model_created' },
  { title: 'Updated', value: 'model_updated' },
  { title: 'Deleted', value: 'model_deleted' },
]

const levelOptions = [
  { title: 'Debug', value: 'debug' },
  { title: 'Info', value: 'info' },
  { title: 'Warning', value: 'warning' },
  { title: 'Error', value: 'error' },
  { title: 'Critical', value: 'critical' },
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
</script>

<style scoped>
.filter-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
