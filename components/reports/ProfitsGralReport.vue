<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <!-- Professional Header -->
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-chart-donut-variant</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Profits General</h2>
              <p class="report-subtitle">General profit report with demurrage, payment tracking, and line payment data</p>
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
              <span class="data-label">Data:</span>
              <v-chip-group>
                <v-chip
                  :color="useLegacyData ? 'primary' : 'grey-lighten-1'"
                  :variant="useLegacyData ? 'elevated' : 'outlined'"
                  @click="useLegacyData = !useLegacyData"
                  class="cursor-pointer data-chip"
                  :class="{ 'chip-active': useLegacyData }"
                >
                  <v-icon start size="small">mdi-database</v-icon>
                  Legacy
                </v-chip>
                <v-chip
                  :color="useNewData ? 'success' : 'grey-lighten-1'"
                  :variant="useNewData ? 'elevated' : 'outlined'"
                  @click="useNewData = !useNewData"
                  class="cursor-pointer data-chip"
                  :class="{ 'chip-active': useNewData }"
                >
                  <v-icon start size="small">mdi-server</v-icon>
                  New
                </v-chip>
              </v-chip-group>
            </div>

            <v-spacer />

            <div class="data-source-selector">
              <span class="data-label">Line Payments:</span>
              <v-switch
                v-model="pagoLinea"
                color="primary"
                hide-details
                density="compact"
                inset
              />
            </div>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-date-picker
                v-model="filters.fromDate"
                label="From Date"
                density="compact"
                hide-details
                :max="filters.toDate"
                :first-day-of-week="1"
                locale="es"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-date-picker
                v-model="filters.toDate"
                label="To Date"
                density="compact"
                hide-details
                :min="filters.fromDate"
                :first-day-of-week="1"
                locale="es"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.voyage_id"
                :items="voyages"
                item-title="name"
                item-value="id"
                label="Vsl / Voyage"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-ferry"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="6">
              <ACustomerSearch
                v-model="filters.consignee_id"
                :hide-details="true"
                density="compact"
                variant="outlined"
                label="Consignee"
              />
            </v-col>

            <v-col cols="12" md="6">
              <AFreightForwarderSearch
                v-model="filters.ff_id"
                :hide-details="true"
                density="compact"
                variant="outlined"
                label="Freight Forwarder"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.line_id"
                :items="lines"
                item-title="name"
                item-value="id"
                label="Line"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-ferry"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.executive_id"
                :items="executives"
                item-title="name"
                item-value="id"
                label="Executive"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-account-tie"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.release"
                :items="releaseOptions"
                item-title="title"
                item-value="value"
                label="Release Status"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-check-circle"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.transportType"
                :items="transportTypes"
                item-title="title"
                item-value="value"
                label="Transport Type"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-truck"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.originPort_id"
                :items="ports"
                item-title="name"
                item-value="id"
                label="Origin"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-map-marker-outline"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.loadingPort_id"
                :items="ports"
                item-title="name"
                item-value="id"
                label="Loading"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-anchor"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.dischargePort_id"
                :items="ports"
                item-title="name"
                item-value="id"
                label="Discharge"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-anchor"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.destinationPort_id"
                :items="ports"
                item-title="name"
                item-value="id"
                label="Destination"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-map-marker-outline"
                auto-select-first
              />
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-end gap-2">
              <v-btn
                variant="outlined"
                color="grey"
                @click="clearFilters"
                prepend-icon="mdi-filter-off"
              >
                Clear Filters
              </v-btn>
              <v-btn
                color="primary"
                @click="applyFilters"
                prepend-icon="mdi-download"
                :loading="loadingStore.loading"
              >
                Generate Report
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <v-alert
          type="info"
          variant="tonal"
          class="mt-6"
          density="compact"
        >
          <template #prepend>
            <v-icon>mdi-information-outline</v-icon>
          </template>
          This report generates an Excel file with profit calculations including general profit, cargo profit, demurrage profit, payment tracking, and line payment data from legacy and/or new system databases.
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

function formatDate(date: Date | string) {
  if (typeof date === 'string') return date.slice(0, 10)
  return date.toISOString().slice(0, 10)
}

const today = new Date()
const fromDate = new Date(today)
fromDate.setMonth(fromDate.getMonth() - 1)
const toDate = new Date(today)

const useLegacyData = ref(true)
const useNewData = ref(false)
const pagoLinea = ref(false)

const releaseOptions = [
  { title: 'Released', value: '1' },
  { title: 'Not Released', value: '0' },
]

const transportTypes = [
  { title: 'RAIL', value: 'RAIL' },
  { title: 'TRUCK', value: 'TRUCK' },
  { title: 'RAIL TRUCK', value: 'RAILTRUCK' },
]

const filters = ref<any>({
  fromDate: fromDate,
  toDate: toDate,
  voyage_id: null,
  consignee_id: null,
  ff_id: null,
  line_id: null,
  executive_id: null,
  release: null,
  transportType: null,
  originPort_id: null,
  loadingPort_id: null,
  dischargePort_id: null,
  destinationPort_id: null,
})

const voyages = ref<any[]>([])
const lines = ref<any[]>([])
const executives = ref<any[]>([])
const ports = ref<any[]>([])

const applyFilters = async () => {
  try {
    loadingStore.loading = true

    const queryFilters = {
      useLegacy: useLegacyData.value,
      useNew: useNewData.value,
      filters: {
        dateRange: [
          formatDate(filters.value.fromDate),
          formatDate(filters.value.toDate),
        ],
        voyage: filters.value.voyage_id,
        consignee: filters.value.consignee_id,
        ff: filters.value.ff_id,
        line: filters.value.line_id,
        executive: filters.value.executive_id,
        release: filters.value.release,
        transportType: filters.value.transportType,
        originPort: filters.value.originPort_id,
        loadingPort: filters.value.loadingPort_id,
        dischargePort: filters.value.dischargePort_id,
        destinationPort: filters.value.destinationPort_id,
        pagoLinea: pagoLinea.value,
      },
    }

    const response = await $api.profitsGral.exportExcel(queryFilters)

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `profits_gral_${formatDate(new Date())}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e: any) {
    console.error(e)
    if (e?.response?.status === 403) {
      snackbar.add({
        text: 'You do not have permission to generate this report.',
        type: 'error',
      })
    } else {
      snackbar.add({
        text: 'An error occurred while generating the report.',
        type: 'error',
      })
    }
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

const clearFilters = () => {
  filters.value.fromDate = fromDate
  filters.value.toDate = toDate
  filters.value.voyage_id = null
  filters.value.consignee_id = null
  filters.value.ff_id = null
  filters.value.line_id = null
  filters.value.executive_id = null
  filters.value.release = null
  filters.value.transportType = null
  filters.value.originPort_id = null
  filters.value.loadingPort_id = null
  filters.value.dischargePort_id = null
  filters.value.destinationPort_id = null
}

onMounted(async () => {
  try {
    const catalogsData = await $api.profitsGral.getCatalogs()
    const catalogs = catalogsData.data || catalogsData
    voyages.value = catalogs.voyages || []
    lines.value = catalogs.lines || []
    executives.value = catalogs.executives || []
    ports.value = catalogs.ports || []
  } catch (error) {
    console.error('Error loading catalog data:', error)
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
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
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

.data-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.data-chip {
  transition: all 0.2s ease;
}

.data-chip.chip-active {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.data-chip:hover {
  transform: scale(1.02);
}
</style>
