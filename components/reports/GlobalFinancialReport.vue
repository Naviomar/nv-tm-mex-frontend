<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <!-- Professional Header -->
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-finance</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Global Financial Report</h2>
              <p class="report-subtitle">
                Full financial snapshot across all 4 services: Sea Import/Export & Air Import/Export
              </p>
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
              <v-btn variant="outlined" color="grey" @click="clearFilters" prepend-icon="mdi-filter-off">
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

        <!-- Legend -->
        <v-row class="mt-6" dense>
          <v-col cols="12">
            <div class="legend-title mb-2">
              <v-icon color="primary" size="18" class="mr-1">mdi-palette-outline</v-icon>
              <span>Column groups included in this export</span>
            </div>
          </v-col>
          <v-col cols="12" sm="6" md="4" v-for="group in legendGroups" :key="group.title">
            <v-card variant="tonal" :color="group.color" class="legend-card pa-3" rounded="lg">
              <div class="d-flex align-center mb-1">
                <v-icon size="18" class="mr-2">{{ group.icon }}</v-icon>
                <strong class="text-body-2">{{ group.title }}</strong>
              </div>
              <div class="text-caption legend-desc">{{ group.description }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-alert type="info" variant="tonal" class="mt-6" density="compact">
          <template #prepend>
            <v-icon>mdi-information-outline</v-icon>
          </template>
          <div>
            <strong>Single-sheet financial breakdown:</strong>
            Each reference expands into multiple rows based on the maximum number of buy or sell concepts. Sell concepts (amounts, invoice, collection status) and Buy/Cost concepts (amounts, line/supplier, invoice/PR folio, payment status) are presented side-by-side with the reference's expected and real profit calculations.
          </div>
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

const today = new Date()
const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
const lastDayCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const serviceTypeOptions = [
  { label: 'All (4 services)', value: null },
  { label: 'Maritime (Import + Export)', value: 'sea' },
  { label: 'Air (Import + Export)', value: 'air' },
]

const legendGroups = [
  {
    title: 'Venta & Cobranza',
    icon: 'mdi-cash-multiple',
    color: 'blue',
    description: 'Expected sales, real collections from customers and outstanding balance (por cobrar).',
  },
  {
    title: 'Costo proveedores/líneas',
    icon: 'mdi-truck-outline',
    color: 'indigo',
    description: 'Expected buy-rate cost and what has actually been paid to suppliers and shipping lines.',
  },
  {
    title: 'FF Notes',
    icon: 'mdi-file-swap-outline',
    color: 'purple',
    description: 'Net credit/debit notes with freight forwarders, expected vs. actually paid/collected.',
  },
  {
    title: 'Demoras & Detentions',
    icon: 'mdi-timer-alert-outline',
    color: 'orange',
    description: 'Cost billed by shipping lines for container demurrages/detentions, and its payment status.',
  },
  {
    title: 'Desglose de Conceptos',
    icon: 'mdi-format-list-bulleted-type',
    color: 'deep-purple',
    description: 'Detailed concept-by-concept breakdown of all buy and sell charges, suppliers, FF notes and demurrages.',
  },
  {
    title: 'Profit Esperado',
    icon: 'mdi-chart-line',
    color: 'green',
    description: 'Sales minus all expected costs (billed or not), regardless of what has been paid so far.',
  },
  {
    title: 'Profit Real',
    icon: 'mdi-cash-check',
    color: 'teal',
    description: 'Only money actually collected from customers minus money actually paid out.',
  },
]

const filters = ref<any>({
  fromDate: firstDayLastMonth,
  toDate: lastDayCurrentMonth,
  customer_id: null,
  service_type: null,
})

const applyFilters = async () => {
  try {
    loadingStore.loading = true

    const queryFilters = {
      customer_id: filters.value.customer_id,
      from: formatDate(filters.value.fromDate),
      to: formatDate(filters.value.toDate),
      service_type: filters.value.service_type,
    }

    const response = await $api.reports.getGlobalFinancial({
      query: queryFilters,
    })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte_financiero_global_${formatDate(new Date())}.xlsx`)
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
  filters.value.fromDate = firstDayLastMonth
  filters.value.toDate = lastDayCurrentMonth
  filters.value.customer_id = null
  filters.value.service_type = null
  applyFilters()
}
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
  background: linear-gradient(135deg, #16a34a 0%, #0f766e 100%);
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

.legend-title {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-card {
  height: 100%;
}

.legend-desc {
  opacity: 0.85;
}
</style>
