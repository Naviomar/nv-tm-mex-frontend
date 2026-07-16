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
            label="Search subject / recipient"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            placeholder="Type to search..."
            @keyup.enter="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="localFilters.mailable_class"
            label="Mailable / Notification class"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            clearable
            hide-details
            placeholder="App\Mail\Mexico\..."
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            v-model="localFilters.has_recipient"
            :items="hasRecipientOptions"
            label="Has recipient"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-account-check-outline"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="6" md="1.5">
          <v-text-field
            v-model="localFilters.date_from"
            label="From"
            type="date"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>

        <v-col cols="6" md="1.5">
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

const localFilters = reactive<Record<string, string>>({
  search: '',
  mailable_class: '',
  has_recipient: '',
  date_from: '',
  date_to: '',
})

const hasRecipientOptions = [
  { title: 'Sí', value: '1' },
  { title: 'No (sin destinatario)', value: '0' },
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
