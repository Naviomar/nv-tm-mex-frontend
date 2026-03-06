<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <!-- Professional Header -->
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-currency-usd</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Cobranza Report</h2>
              <p class="report-subtitle">Collection tracking for maritime and air references</p>
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
          
          <v-row>
            <v-col cols="12" md="3">
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

            <v-col cols="12" md="3">
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

            <v-col cols="12" md="3">
              <ACustomerSearch 
                v-model="filters.customer_id" 
                :hide-details="true"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.service_type"
                :items="serviceTypeOptions"
                item-title="label"
                item-value="value"
                label="Service Type"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-map-marker-path"
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
          This report includes collection data from all maritime and air import/export references.
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

// Today
const today = new Date()
// First day of last month
const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
// Last day of current month
const lastDayCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

// Service type options
const serviceTypeOptions = [
  { label: 'Todos', value: null },
  { label: 'Marítimo', value: 'sea' },
  { label: 'Aéreo', value: 'air' },
]

// Initialize the filters with the date range
const filters = ref<any>({
  fromDate: firstDayLastMonth,
  toDate: lastDayCurrentMonth,
  customer_id: null,
  service_type: null,
})

// Function to apply filters and fetch data
const applyFilters = async () => {
  try {
    loadingStore.loading = true

    // Prepare the query filters
    const queryFilters = {
      customer_id: filters.value.customer_id,
      from: formatDate(filters.value.fromDate),
      to: formatDate(filters.value.toDate),
      service_type: filters.value.service_type,
    }

    // Send request to the API
    const response = await $api.reports.getCobranza({
      query: queryFilters,
    })

    // Download the Excel report
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `cobranza_report_${formatDate(new Date())}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e: any) {
    console.error(e)
    // if status code 403 show snackbar about permissions
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

// Clear the filters
const clearFilters = () => {
  filters.value.fromDate = firstDayLastMonth
  filters.value.toDate = lastDayCurrentMonth
  filters.value.customer_id = null
  filters.value.service_type = null
  applyFilters() // Optionally, refetch the report without filters
}
</script>

<style scoped>
.report-container {
  width: 100%;
}

.report-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.report-header {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
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
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
</style>
