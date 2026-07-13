<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <!-- Header -->
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-file-document-check</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Releases & Revalidations</h2>
              <p class="report-subtitle">
                Modernized reports for monitoring container releases and documentation milestones
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <v-card-text class="pa-6">
        <div class="filters-section">
          <!-- Report Type Selector -->
          <div class="report-type-selector mb-6">
            <div class="filters-title mb-3">
              <v-icon color="primary" size="20" class="mr-2">mdi-chart-multiple</v-icon>
              <span>Report Variant</span>
            </div>
            <v-btn-toggle
              v-model="reportType"
              mandatory
              color="primary"
              variant="outlined"
              class="d-flex flex-wrap w-100 btn-group-custom"
            >
              <v-btn value="general" class="flex-grow-1 text-none py-2 h-auto">
                <v-icon start>mdi-file-chart-outline</v-icon>
                Release General
              </v-btn>
              <v-btn value="documents" class="flex-grow-1 text-none py-2 h-auto">
                <v-icon start>mdi-folder-text-outline</v-icon>
                Document Types
              </v-btn>
              <v-btn value="release_port" class="flex-grow-1 text-none py-2 h-auto">
                <v-icon start>mdi-anchor</v-icon>
                Report Release
              </v-btn>
              <v-btn value="no_release_port" class="flex-grow-1 text-none py-2 h-auto">
                <v-icon start>mdi-alert-circle-outline</v-icon>
                Report No Release
              </v-btn>
            </v-btn-toggle>
          </div>

          <v-divider class="mb-6"></v-divider>

          <div class="filters-title mb-4">
            <v-icon color="primary" size="20" class="mr-2">mdi-filter-outline</v-icon>
            <span>Filters</span>
          </div>

          <div class="d-flex align-center gap-4 mb-4">
            <div class="data-source-selector">
              <v-chip
                :color="useLegacyData ? 'primary' : 'default'"
                :variant="useLegacyData ? 'flat' : 'outlined'"
                size="small"
                filter
                @click="useLegacyData = !useLegacyData"
                class="hover-elevation"
              >
                <v-icon start size="small">mdi-database</v-icon>
                Legacy
              </v-chip>
              <v-chip
                :color="useNewData ? 'success' : 'default'"
                :variant="useNewData ? 'flat' : 'outlined'"
                size="small"
                filter
                @click="useNewData = !useNewData"
                class="hover-elevation"
              >
                <v-icon start size="small">mdi-server</v-icon>
                New
              </v-chip>
            </div>
          </div>

          <v-row>
            <!-- Conditional date type selector for General Report -->
            <v-col v-if="reportType === 'general'" cols="12" md="6">
              <v-select
                v-model="filters.dateType"
                :items="[
                  { title: 'ETA Date Range', value: 'eta' },
                  { title: 'Release Date Range', value: 'release' },
                ]"
                item-title="title"
                item-value="value"
                label="Date Range Base"
                density="compact"
                hide-details
                variant="outlined"
                prepend-inner-icon="mdi-calendar-range"
              />
            </v-col>

            <!-- Conditional Status for General Report -->
            <v-col v-if="reportType === 'general'" cols="12" md="6">
              <v-select
                v-model="filters.status"
                :items="[
                  { title: 'All', value: 'all' },
                  { title: 'Released Only', value: 'R' },
                  { title: 'Pending Only', value: 'P' },
                ]"
                item-title="title"
                item-value="value"
                label="Release Status"
                density="compact"
                hide-details
                variant="outlined"
                prepend-inner-icon="mdi-check-all"
              />
            </v-col>

            <!-- Conditional releaseToday check for Port reports -->
            <v-col v-if="showReleaseTodayOption" cols="12">
              <v-switch
                v-model="filters.releaseToday"
                color="primary"
                density="compact"
                hide-details
                label="Filter by specific Release Date (ignores ETA date range)"
              />
            </v-col>

            <!-- Conditional specific release date for Port reports -->
            <v-col v-if="showReleaseTodayOption && filters.releaseToday" cols="12" md="6">
              <v-date-picker
                v-model="filters.releaseDateHoy"
                label="Release Date"
                density="compact"
                hide-details
                locale="en"
                variant="outlined"
              />
            </v-col>

            <!-- Standard date inputs (hidden if releaseToday is active) -->
            <template v-if="!showReleaseTodayOption || !filters.releaseToday">
              <v-col cols="12" md="6">
                <v-date-picker
                  v-model="filters.fromDate"
                  :label="dateLabelFrom"
                  density="compact"
                  hide-details
                  :max="filters.toDate"
                  :first-day-of-week="1"
                  locale="en"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-date-picker
                  v-model="filters.toDate"
                  :label="dateLabelTo"
                  density="compact"
                  hide-details
                  :min="filters.fromDate"
                  :first-day-of-week="1"
                  locale="en"
                  variant="outlined"
                />
              </v-col>
            </template>

            <!-- Consignee Autocomplete (All reports) -->
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.consignee_id"
                :items="filteredConsignees"
                @update:search="onConsigneeSearch"
                item-title="name"
                item-value="id"
                label="Consignee"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-account"
                auto-select-first
              >
                <template #append-item>
                  <div
                    v-if="hasMoreConsignees"
                    v-intersect="onConsigneeIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <!-- Consignee Group Autocomplete (General & Port reports) -->
            <v-col v-if="showConsigneeGroup" cols="12" md="6">
              <v-autocomplete
                v-model="filters.consignee_group_id"
                :items="filteredConsigneeGroups"
                @update:search="onConsigneeGroupSearch"
                item-title="name"
                item-value="id"
                label="Consignee Group"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-account-group"
                auto-select-first
              >
                <template #append-item>
                  <div
                    v-if="hasMoreConsigneeGroups"
                    v-intersect="onConsigneeGroupIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <!-- Executive Autocomplete (Documents & Port reports) -->
            <v-col v-if="showExecutive" cols="12" md="6">
              <v-autocomplete
                v-model="filters.executive_id"
                :items="filteredExecutives"
                @update:search="onExecutiveSearch"
                item-title="name"
                item-value="id"
                label="Executive"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-account-star"
                auto-select-first
              >
                <template #append-item>
                  <div
                    v-if="hasMoreExecutives"
                    v-intersect="onExecutiveIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <!-- Port (POD) Autocomplete (Port reports only) -->
            <v-col v-if="showPort" cols="12" md="6">
              <v-autocomplete
                v-model="filters.port_id"
                :items="filteredPorts"
                @update:search="onPortSearch"
                item-title="name"
                item-value="id"
                label="Port of Discharge"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-anchor"
                auto-select-first
              >
                <template #append-item>
                  <div
                    v-if="hasMorePorts"
                    v-intersect="onPortIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <!-- Vessel/Voyage Autocomplete (Port reports only) -->
            <v-col v-if="showVoyage" cols="12" md="6">
              <v-autocomplete
                v-model="filters.voyage_id"
                :items="filteredVoyages"
                @update:search="onVoyageSearch"
                item-title="name"
                item-value="id"
                label="Vessel / Voyage"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-ferry"
                auto-select-first
              >
                <template #append-item>
                  <div
                    v-if="hasMoreVoyages"
                    v-intersect="onVoyageIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>

          <v-row class="mt-6">
            <v-col cols="12" class="d-flex justify-end gap-2">
              <v-btn variant="outlined" color="grey" @click="clearFilters" prepend-icon="mdi-filter-off">
                Clear Filters
              </v-btn>
              <v-btn
                color="primary"
                @click="applyFilters"
                prepend-icon="mdi-download"
                :loading="loadingStore.loading"
                class="elevation-2"
              >
                Generate Report
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <v-alert type="info" variant="tonal" class="mt-6" density="compact">
          <template #prepend>
            <v-icon>mdi-information-outline</v-icon>
          </template>
          This module compiles release metrics, revalidation dates, and house/master BL status for maritime import
          references.
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

// Helper to format date
function formatDate(date: Date | string | null) {
  if (!date) return ''
  if (typeof date === 'string') return date.slice(0, 10)
  return date.toISOString().slice(0, 10)
}

const today = new Date()
const fromDate = new Date(today)
fromDate.setMonth(fromDate.getMonth() - 1)
const toDate = new Date(today)

const reportType = ref<'general' | 'documents' | 'release_port' | 'no_release_port'>('general')
const useLegacyData = ref(true)
const useNewData = ref(true)

const filters = ref<any>({
  fromDate: fromDate,
  toDate: toDate,
  dateType: 'eta',
  status: 'all',
  consignee_id: null,
  consignee_group_id: null,
  executive_id: null,
  port_id: null,
  voyage_id: null,
  releaseToday: false,
  releaseDateHoy: today,
})

// Catalog reactive lists
const voyages = ref<any[]>([])
const ports = ref<any[]>([])
const consignees = ref<any[]>([])
const consigneeGroups = ref<any[]>([])
const executives = ref<any[]>([])

// Autocomplete Filters
const {
  onSearch: onVoyageSearch,
  filteredItems: filteredVoyages,
  hasMore: hasMoreVoyages,
  onIntersect: onVoyageIntersect,
} = useAutocompleteFilter(voyages, () => filters.value.voyage_id)
const {
  onSearch: onConsigneeSearch,
  filteredItems: filteredConsignees,
  hasMore: hasMoreConsignees,
  onIntersect: onConsigneeIntersect,
} = useAutocompleteFilter(consignees, () => filters.value.consignee_id)
const {
  onSearch: onConsigneeGroupSearch,
  filteredItems: filteredConsigneeGroups,
  hasMore: hasMoreConsigneeGroups,
  onIntersect: onConsigneeGroupIntersect,
} = useAutocompleteFilter(consigneeGroups, () => filters.value.consignee_group_id)
const {
  onSearch: onExecutiveSearch,
  filteredItems: filteredExecutives,
  hasMore: hasMoreExecutives,
  onIntersect: onExecutiveIntersect,
} = useAutocompleteFilter(executives, () => filters.value.executive_id)
const {
  onSearch: onPortSearch,
  filteredItems: filteredPorts,
  hasMore: hasMorePorts,
  onIntersect: onPortIntersect,
} = useAutocompleteFilter(ports, () => filters.value.port_id)

// Dynamic Visibilities
const showReleaseTodayOption = computed(() => ['release_port', 'no_release_port'].includes(reportType.value))
const showConsigneeGroup = computed(() => ['general', 'release_port', 'no_release_port'].includes(reportType.value))
const showExecutive = computed(() => ['documents', 'release_port', 'no_release_port'].includes(reportType.value))
const showPort = computed(() => ['release_port', 'no_release_port'].includes(reportType.value))
const showVoyage = computed(() => ['release_port', 'no_release_port'].includes(reportType.value))

const dateLabelFrom = computed(() => {
  if (reportType.value === 'general' && filters.value.dateType === 'release') {
    return 'Date From (Release)'
  }
  return 'Date From (ETA)'
})

const dateLabelTo = computed(() => {
  if (reportType.value === 'general' && filters.value.dateType === 'release') {
    return 'Date To (Release)'
  }
  return 'Date To (ETA)'
})

const clearFilters = () => {
  filters.value.fromDate = fromDate
  filters.value.toDate = toDate
  filters.value.dateType = 'eta'
  filters.value.status = 'all'
  filters.value.consignee_id = null
  filters.value.consignee_group_id = null
  filters.value.executive_id = null
  filters.value.port_id = null
  filters.value.voyage_id = null
  filters.value.releaseToday = false
  filters.value.releaseDateHoy = today
}

const applyFilters = async () => {
  if (!useLegacyData.value && !useNewData.value) {
    snackbar.add({
      text: 'At least one data source must be selected (Legacy or New).',
      type: 'warning',
    })
    return
  }

  try {
    loadingStore.loading = true

    const queryFilters = {
      type: reportType.value,
      useLegacy: useLegacyData.value,
      useNew: useNewData.value,
      filters: {
        dateRange: [formatDate(filters.value.fromDate), formatDate(filters.value.toDate)],
        dateType: filters.value.dateType,
        status: filters.value.status,
        consignee: filters.value.consignee_id,
        consignee_group: filters.value.consignee_group_id,
        executive: filters.value.executive_id,
        port: filters.value.port_id,
        voyage: filters.value.voyage_id,
        releaseToday: filters.value.releaseToday,
        releaseDateHoy: formatDate(filters.value.releaseDateHoy),
      },
    }

    const response = await $api.releaseReports.exportExcel(queryFilters)

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `TM_releases_${reportType.value}_${formatDate(new Date())}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    snackbar.add({
      text: 'Report generated successfully.',
      type: 'success',
    })
  } catch (error) {
    console.error('Error generating releases report:', error)
    snackbar.add({
      text: 'An error occurred while generating the report.',
      type: 'error',
    })
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

onMounted(async () => {
  try {
    const response = await $api.releaseReports.getCatalogs()
    const data = response.data || {}

    voyages.value = data.voyages || []
    ports.value = data.ports || []
    consignees.value = data.consignees || []
    consigneeGroups.value = data.consigneeGroups || []
    executives.value = data.executives || []
  } catch (error) {
    console.error('Error loading catalogs for releases reports:', error)
  }
})
</script>

<style scoped>
.report-container {
  width: 100%;
}

.report-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
}

.report-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
  position: relative;
  overflow: hidden;
}

.report-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 40%;
  height: 200%;
  background: rgba(255, 255, 255, 0.03);
  transform: rotate(-15deg);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 20px 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  color: white;
}

.report-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.report-subtitle {
  font-size: 0.875rem;
  margin: 4px 0 0 0;
  opacity: 0.9;
}

.filters-section {
  background: rgb(var(--v-theme-surface));
  padding: 24px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.filters-title {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-group-custom .v-btn {
  border-color: rgba(var(--v-border-color), 0.2);
  transition: all 0.2s ease-in-out;
}

.btn-group-custom .v-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.gap-4 {
  gap: 16px;
}

.gap-2 {
  gap: 8px;
}

.data-source-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hover-elevation {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.hover-elevation:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}
</style>
