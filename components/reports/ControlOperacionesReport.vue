<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <!-- Header -->
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-anchor</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Operations Control</h2>
              <p class="report-subtitle">Operational report for maritime imports with intermodal and inland tracking</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <v-card-text class="pa-6">
        <div class="filters-section">
          <div class="filters-title mb-4">
            <v-icon color="primary" size="20" class="mr-2">mdi-filter-outline</v-icon>
            <span>Report Filters</span>
          </div>

          <div class="d-flex align-center gap-4 mb-4">
            <div class="data-source-selector">
              <v-chip
                :color="useLegacyData ? 'primary' : 'default'"
                :variant="useLegacyData ? 'flat' : 'outlined'"
                size="small"
                filter
                @click="useLegacyData = !useLegacyData"
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
              >
                <v-icon start size="small">mdi-server</v-icon>
                New
              </v-chip>
            </div>
          </div>

          <v-switch
            v-model="filters.baseEtaSinEta"
            color="primary"
            density="compact"
            hide-details
            class="mb-4"
            label="Include refs. without ETA (uses registration date as base when there is no ETA)"
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-date-picker
                v-model="filters.fromDate"
                label="Date From (ETA)"
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
                label="Date To (ETA)"
                density="compact"
                hide-details
                :min="filters.fromDate"
                :first-day-of-week="1"
                locale="en"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
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

            <v-col cols="12" md="6">
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

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.line_id"
                :items="filteredLines"
                @update:search="onLineSearch"
                item-title="name"
                item-value="id"
                label="Shipping Line"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-ferry"
                auto-select-first
              >
                <template #append-item>
                  <div
                    v-if="hasMoreLines"
                    v-intersect="onLineIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.dischargePort_id"
                :items="filteredDischargePorts"
                @update:search="onDischargePortSearch"
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
                    v-if="hasMoreDischargePorts"
                    v-intersect="onDischargePortIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.destinationPort_id"
                :items="filteredDestinationPorts"
                @update:search="onDestinationPortSearch"
                item-title="name"
                item-value="id"
                label="Port of Destination"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-map-marker-outline"
                auto-select-first
              >
                <template #append-item>
                  <div
                    v-if="hasMoreDestinationPorts"
                    v-intersect="onDestinationPortIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.ff_id"
                :items="filteredFreightForwarders"
                @update:search="onFfSearch"
                item-title="name"
                item-value="id"
                label="Freight Forwarder (FF)"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-truck-fast"
                auto-select-first
              >
                <template #append-item>
                  <div
                    v-if="hasMoreFreightForwarders"
                    v-intersect="onFfIntersect"
                    class="text-center py-2 text-caption text-grey"
                  >
                    Loading more...
                  </div>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-end gap-2">
              <v-btn variant="outlined" color="grey" @click="clearFilters" prepend-icon="mdi-filter-off">
                Clear Filters
              </v-btn>
              <v-btn color="primary" @click="applyFilters" prepend-icon="mdi-download" :loading="loadingStore.loading">
                Generate Report
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <v-alert type="info" variant="tonal" class="mt-6" density="compact">
          <template #prepend>
            <v-icon>mdi-information-outline</v-icon>
          </template>
          This report generates an Excel file containing consolidated operational information for containers and
          transport milestones of maritime imports.
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date | string) {
  if (typeof date === 'string') return date.slice(0, 10)
  return date.toISOString().slice(0, 10)
}

// Date Initialization (default 1 month range)
const today = new Date()
const fromDate = new Date(today)
fromDate.setMonth(fromDate.getMonth() - 1)
const toDate = new Date(today)

// Data Source states
const useLegacyData = ref(true)
const useNewData = ref(true)

// Filters
const filters = ref<any>({
  fromDate: fromDate,
  toDate: toDate,
  voyage_id: null,
  consignee_id: null,
  consignee_group_id: null,
  line_id: null,
  dischargePort_id: null,
  destinationPort_id: null,
  ff_id: null,
  baseEtaSinEta: false,
})

// Catalog reactive bindings
const voyages = ref<any[]>([])
const lines = ref<any[]>([])
const ports = ref<any[]>([])
const consignees = ref<any[]>([])
const freightForwarders = ref<any[]>([])
const consigneeGroups = ref<any[]>([])


const { onSearch: onVoyageSearch, filteredItems: filteredVoyages, hasMore: hasMoreVoyages, onIntersect: onVoyageIntersect } = useAutocompleteFilter(voyages, () => filters.value.voyage_id)
const { onSearch: onConsigneeSearch, filteredItems: filteredConsignees, hasMore: hasMoreConsignees, onIntersect: onConsigneeIntersect } = useAutocompleteFilter(consignees, () => filters.value.consignee_id)
const { onSearch: onConsigneeGroupSearch, filteredItems: filteredConsigneeGroups, hasMore: hasMoreConsigneeGroups, onIntersect: onConsigneeGroupIntersect } = useAutocompleteFilter(consigneeGroups, () => filters.value.consignee_group_id)
const { onSearch: onLineSearch, filteredItems: filteredLines, hasMore: hasMoreLines, onIntersect: onLineIntersect } = useAutocompleteFilter(lines, () => filters.value.line_id)
const { onSearch: onDischargePortSearch, filteredItems: filteredDischargePorts, hasMore: hasMoreDischargePorts, onIntersect: onDischargePortIntersect } = useAutocompleteFilter(ports, () => filters.value.dischargePort_id)
const { onSearch: onDestinationPortSearch, filteredItems: filteredDestinationPorts, hasMore: hasMoreDestinationPorts, onIntersect: onDestinationPortIntersect } = useAutocompleteFilter(ports, () => filters.value.destinationPort_id)
const { onSearch: onFfSearch, filteredItems: filteredFreightForwarders, hasMore: hasMoreFreightForwarders, onIntersect: onFfIntersect } = useAutocompleteFilter(freightForwarders, () => filters.value.ff_id)

// Clear filters handler
const clearFilters = () => {
  filters.value.fromDate = fromDate
  filters.value.toDate = toDate
  filters.value.voyage_id = null
  filters.value.consignee_id = null
  filters.value.consignee_group_id = null
  filters.value.line_id = null
  filters.value.dischargePort_id = null
  filters.value.destinationPort_id = null
  filters.value.ff_id = null
  filters.value.baseEtaSinEta = false
  filters.value.fromDate = fromDate
  filters.value.toDate = toDate
}

// Generate Excel Report handler
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
      useLegacy: useLegacyData.value,
      useNew: useNewData.value,
      filters: {
        dateRange: [formatDate(filters.value.fromDate), formatDate(filters.value.toDate)],
        voyage: filters.value.voyage_id,
        consignee: filters.value.consignee_id,
        consignee_group: filters.value.consignee_group_id,
        line: filters.value.line_id,
        dischargePort: filters.value.dischargePort_id,
        destinationPort: filters.value.destinationPort_id,
        ff: filters.value.ff_id,
        baseEtaSinEta: filters.value.baseEtaSinEta,
      },
    }

    const response = await $api.controlOperaciones.exportExcel(queryFilters)

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `TM_controlOps_${formatDate(new Date())}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    snackbar.add({
      text: 'Report generated and downloaded successfully.',
      type: 'success',
    })
  } catch (error) {
    console.error('Error exporting Control Operaciones report:', error)
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

// Load Catalogs on Mounted
onMounted(async () => {
  try {
    const response = await $api.controlOperaciones.getCatalogs()
    const data = response.data || {}

    voyages.value = data.voyages || []
    lines.value = data.lines || []
    ports.value = data.ports || []
    consignees.value = data.consignees || []
    freightForwarders.value = data.freightForwarders || []
    consigneeGroups.value = data.consigneeGroups || []
  } catch (error) {
    console.error('Error loading catalogs for Control Operaciones:', error)
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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
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
  background: rgba(255, 255, 255, 0.05);
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
  padding: 20px;
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
</style>
