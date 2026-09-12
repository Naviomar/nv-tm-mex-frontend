<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <!-- Header -->
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-container-cargo-ports</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Contenedores por Cliente y Proveedor</h2>
              <p class="report-subtitle">
                Contenedores que cada cliente va a recibir, agrupados por proveedor (shipper), por mes
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

          <!-- Data Sources Toggles -->
          <div class="d-flex align-center gap-4 mb-6">
            <div class="data-source-selector">
              <span class="mr-2 text-subtitle-2 text-medium-emphasis">Data Source:</span>
              <v-chip
                :color="useLegacyData ? 'primary' : 'default'"
                :variant="useLegacyData ? 'flat' : 'outlined'"
                size="small"
                filter
                class="mr-2"
                @click="useLegacyData = !useLegacyData"
              >
                <v-icon start size="small">mdi-database</v-icon>
                Legacy (TM1)
              </v-chip>
              <v-chip
                :color="useNewData ? 'success' : 'default'"
                :variant="useNewData ? 'flat' : 'outlined'"
                size="small"
                filter
                @click="useNewData = !useNewData"
              >
                <v-icon start size="small">mdi-server</v-icon>
                New (TM2)
              </v-chip>
            </div>
          </div>

          <EtaModeSelector v-model="filters.etaMode" />

          <v-row>
            <!-- Report Type (Yearly vs Monthly) -->
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.report_type"
                :items="[
                  { title: 'Monthly Distribution (By Month)', value: 'monthly' },
                  { title: 'Yearly Comparative (Annual)', value: 'yearly' },
                ]"
                item-title="title"
                item-value="value"
                label="Report Type"
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-chart-multiple"
              />
            </v-col>

            <!-- Executive Dropdown -->
            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="filters.ejecutivo_id"
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

            <!-- Consignee -->
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.client_id"
                :items="filteredConsignees"
                @update:search="onConsigneeSearch"
                item-title="name"
                item-value="id"
                label="Consignee (Cliente)"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-domain"
                auto-select-first
              >
                <template #no-data>
                  <div v-if="loadingConsignees" class="d-flex align-center justify-center py-3 text-caption text-grey gap-2">
                    <v-progress-circular indeterminate size="16" width="2" color="primary" class="mr-2" />
                    <span>Loading consignees...</span>
                  </div>
                  <div v-else class="text-center py-2 text-caption text-grey">
                    No data available
                  </div>
                </template>
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

            <!-- Shipper (proveedor) text filter -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="filters.shipper_name"
                label="Proveedor (Shipper) — texto"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-truck-fast"
                placeholder="Nombre del proveedor / embarcador"
              />
            </v-col>

            <!-- Yearly Range Inputs -->
            <template v-if="filters.report_type === 'yearly'">
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.start_year"
                  :items="availableYears"
                  label="Start Year"
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-calendar-range"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.end_year"
                  :items="availableYears"
                  label="End Year"
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-calendar-range"
                />
              </v-col>
            </template>

            <!-- Monthly Year Target Input -->
            <template v-else>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.year"
                  :items="availableYears"
                  label="Target Year"
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
            </template>
          </v-row>

          <v-row class="mt-6">
            <v-col cols="12" class="d-flex justify-end gap-2">
              <v-btn variant="outlined" color="grey" prepend-icon="mdi-filter-off" @click="clearFilters">
                Clear Filters
              </v-btn>
              <v-btn
                color="primary"
                prepend-icon="mdi-download"
                :loading="loadingStore.loading"
                :disabled="!useLegacyData && !useNewData"
                @click="applyFilters"
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
          Este reporte descarga un Excel con dos hojas:
          <ul class="pl-4 mt-1">
            <li>
              <strong>Resumen:</strong> contenedores por cliente y proveedor (shipper), distribuidos por mes (basado en ETA).
              Las referencias sin ETA aparecen en la columna ADICIONALES.
            </li>
            <li>
              <strong>Detalle:</strong> una fila por referencia con cliente, proveedor, ejecutivo, referencia, ETA,
              conteo de contenedores y TEUs.
            </li>
            <li>
              Incluye datos de TM1 (Legacy) y TM2 (New) según las fuentes seleccionadas.
            </li>
          </ul>
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { CatalogOption, ContainersByClientShipperFilters } from '~/typings/reports/reports'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const useLegacyData = ref(true)
const useNewData = ref(true)

const currentYear = new Date().getFullYear()

const filters = ref<ContainersByClientShipperFilters>({
  report_type: 'monthly',
  start_year: 2017,
  end_year: currentYear,
  year: currentYear,
  ejecutivo_id: null,
  client_id: null,
  shipper_name: '',
  etaMode: 'ambos',
})

const loadingConsignees = ref(true)
const executives = ref<CatalogOption[]>([])
const consignees = ref<CatalogOption[]>([])

const {
  onSearch: onConsigneeSearch,
  filteredItems: filteredConsignees,
  hasMore: hasMoreConsignees,
  onIntersect: onConsigneeIntersect,
} = useAutocompleteFilter(consignees, () => filters.value.client_id)

const availableYears = computed(() => {
  const years = []
  for (let y = 2010; y <= currentYear + 1; y++) {
    years.push(y)
  }
  return years.reverse()
})

const applyFilters = async () => {
  try {
    loadingStore.loading = true

    const queryFilters = {
      useLegacy: useLegacyData.value,
      useNew: useNewData.value,
      filters: {
        report_type: filters.value.report_type,
        start_year: filters.value.start_year,
        end_year: filters.value.end_year,
        year: filters.value.year,
        ejecutivo_id: filters.value.ejecutivo_id,
        client_id: filters.value.client_id,
        shipper_name: filters.value.shipper_name,
        baseEtaSinEta: filters.value.etaMode === 'ambos',
        onlyWithoutEta: filters.value.etaMode === 'sin_eta',
      },
    }

    const response = await $api.reports.exportContainersByClientShipperExcel(queryFilters)

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const downloadName =
      filters.value.report_type === 'yearly'
        ? `contenedores_por_cliente_proveedor_${filters.value.start_year}_${filters.value.end_year}.xlsx`
        : `contenedores_por_cliente_proveedor_${filters.value.year}.xlsx`

    link.setAttribute('download', downloadName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    snackbar.add({
      text: 'Report generated successfully!',
      type: 'success',
    })
  } catch (e: unknown) {
    console.error(e)
    const err = e as { response?: { status?: number } }
    if (err?.response?.status === 403) {
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
    loadingStore.loading = false
  }
}

const clearFilters = () => {
  filters.value.report_type = 'monthly'
  filters.value.start_year = 2017
  filters.value.end_year = currentYear
  filters.value.year = currentYear
  filters.value.ejecutivo_id = null
  filters.value.client_id = null
  filters.value.shipper_name = ''
  filters.value.etaMode = 'ambos'
  useLegacyData.value = true
  useNewData.value = true
}

onMounted(async () => {
  try {
    loadingConsignees.value = true
    const res = await $api.reports.getContainersByClientShipperCatalogs()
    const catalogs = res?.data || res || {}
    executives.value = catalogs.executives || []
    consignees.value = catalogs.consignees || []
  } catch (error) {
    console.error('Error loading catalogs:', error)
  } finally {
    loadingConsignees.value = false
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
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  position: relative;
  overflow: hidden;
}

.header-content {
  padding: 24px;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.report-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  margin: 4px 0 0 0;
}

.filters-section {
  display: flex;
  flex-direction: column;
}

.filters-title {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.data-source-selector {
  display: flex;
  align-items: center;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}
</style>
