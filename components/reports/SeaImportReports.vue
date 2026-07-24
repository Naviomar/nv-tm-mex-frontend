<template>
  <div class="sea-import-reports">
    <!-- Header -->
    <v-card elevation="0" class="report-card mb-6">
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-chart-line</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Comparative Analytics</h2>
              <p class="report-subtitle">Compare import metrics across different years</p>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Filters -->
    <v-card class="filters-card mb-6" elevation="0">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedYears"
              :items="availableYears"
              label="Years to compare"
              multiple
              chips
              closable-chips
              variant="outlined"
              color="primary"
              density="comfortable"
              hide-details
              :disabled="loading"
            >
              <template #prepend-inner>
                <v-icon color="primary">mdi-calendar-range</v-icon>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedEjecutivo"
              :items="ejecutivos"
              item-title="name"
              item-value="id"
              label="Filter by Ejecutivo"
              variant="outlined"
              color="primary"
              density="comfortable"
              hide-details
              clearable
              :disabled="loading"
            >
              <template #prepend-inner>
                <v-icon color="primary">mdi-account-tie</v-icon>
              </template>
            </v-select>
          </v-col>
          <v-col cols="6" md="3">
            <div class="d-flex align-center gap-2">
              <v-checkbox v-if="canSeeProfit" v-model="includeProfit" label="Include Profit" color="primary" density="comfortable" hide-details :disabled="loading" />
              <v-checkbox v-model="includeEnTransito" label="In Transit" color="warning" density="comfortable" hide-details :disabled="loading" />
            </div>
          </v-col>
          <v-col cols="6" md="2" class="text-right">
            <v-btn
              color="primary"
              variant="elevated"
              :loading="loading"
              :disabled="selectedYears.length === 0 || (!useLegacyData && !useNewData)"
              @click="loadAll()"
            >
              <v-icon start>mdi-chart-line</v-icon>
              Generate
            </v-btn>
          </v-col>
        </v-row>
        <v-row align="center" class="mt-2">
          <v-col cols="12" class="d-flex align-center gap-3">
            <span class="text-subtitle-2 text-medium-emphasis">Data Source:</span>
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
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Empty state -->
    <div v-if="!hasData && !loading" class="text-center py-12">
      <v-icon size="64" color="grey-lighten-1">mdi-chart-bar-stacked</v-icon>
      <div class="text-h6 mt-4 text-grey-darken-1">No Data Available</div>
      <div class="text-body-2 text-grey">Select years and click Generate to view the analysis</div>
    </div>

    <!-- Loading -->
    <div v-else-if="loading && !hasData" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" width="6" />
      <div class="text-h6 mt-4 text-grey-darken-1">Generating reports…</div>
    </div>

    <!-- Content -->
    <template v-if="hasData">
      <ComparativeBarChart
        :chart-data="chartData"
        :selected-years="selectedYears"
        :include-profit="includeProfit"
        :include-en-transito="includeEnTransito"
        :loading="loading"
        class="mb-6"
      />

      <!-- Client: last-year donut + year-comparison bar -->
      <v-row>
        <v-col cols="12">
          <ClientChart :items="clientItemsLastYear" :year="maxYear" :loading="loadingBreakdowns" />
        </v-col>
      </v-row>
      <v-row v-if="selectedYears.length > 1">
        <v-col cols="12">
          <CategoryYearCompareChart
            title="References by Client — Year Comparison"
            icon="mdi-account-group"
            color="#3b82f6"
            :items="clientRows"
            :years="selectedYears"
            :loading="loadingBreakdowns"
            export-file-name="clients-year-comparison"
          />
        </v-col>
      </v-row>

      <!-- Line: last-year bar + year-comparison bar -->
      <v-row>
        <v-col cols="12" lg="6">
          <CategoryBarChart
            :title="maxYear ? `TEUs by Shipping Line — ${maxYear}` : 'TEUs by Shipping Line'"
            icon="mdi-ship"
            color="#6366f1"
            :items="lineItemsLastYear"
            :show-references="false"
            :loading="loadingBreakdowns"
            export-file-name="lines-by-teus"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <CategoryYearCompareChart
            v-if="selectedYears.length > 1"
            title="TEUs by Shipping Line — Year Comparison"
            icon="mdi-ship"
            color="#6366f1"
            :items="lineRows"
            :years="selectedYears"
            :loading="loadingBreakdowns"
            export-file-name="lines-year-comparison"
          />
        </v-col>
      </v-row>

      <!-- Loading ports: last-year bar + year-comparison bar -->
      <v-row>
        <v-col cols="12" lg="6">
          <CategoryBarChart
            :title="maxYear ? `Loading Ports — ${maxYear}` : 'Loading Ports'"
            icon="mdi-anchor"
            color="#0ea5e9"
            :items="loadingPortItemsLastYear"
            :loading="loadingBreakdowns"
            :top-n="15"
            export-file-name="loading-ports"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <CategoryYearCompareChart
            v-if="selectedYears.length > 1"
            title="Loading Ports — Year Comparison"
            icon="mdi-anchor"
            color="#0ea5e9"
            :items="loadingPortRows"
            :years="selectedYears"
            :loading="loadingBreakdowns"
            :top-n="10"
            export-file-name="loading-ports-year-comparison"
          />
        </v-col>
      </v-row>

      <!-- Discharge ports: last-year bar + year-comparison bar -->
      <v-row>
        <v-col cols="12" lg="6">
          <CategoryBarChart
            :title="maxYear ? `Discharge Ports — ${maxYear}` : 'Discharge Ports'"
            icon="mdi-anchor"
            color="#22c55e"
            :items="dischargePortItemsLastYear"
            :loading="loadingBreakdowns"
            :top-n="15"
            export-file-name="discharge-ports"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <CategoryYearCompareChart
            v-if="selectedYears.length > 1"
            title="Discharge Ports — Year Comparison"
            icon="mdi-anchor"
            color="#22c55e"
            :items="dischargePortRows"
            :years="selectedYears"
            :loading="loadingBreakdowns"
            :top-n="10"
            export-file-name="discharge-ports-year-comparison"
          />
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { permissions } from '~/utils/data/system'
import { useCheckUser } from '~/composables/useCheckUser'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()

const canSeeProfit = computed(() => hasPermission(permissions.SeaImportProfit))

const selectedYears = ref<number[]>([])
const selectedEjecutivo = ref<number | null>(null)
const includeProfit = ref(true)
const includeEnTransito = ref(false)
const useLegacyData = ref(true)
const useNewData = ref(true)

watch(canSeeProfit, (val) => {
  if (!val) includeProfit.value = false
}, { immediate: true })

const ejecutivos = ref<any[]>([])
const chartData = ref<any[]>([])

// Raw per-year breakdown rows, as returned by the backend: {year, name, teus, references?}.
const clientRows = ref<any[]>([])
const lineRows = ref<any[]>([])
const loadingPortRows = ref<any[]>([])
const dischargePortRows = ref<any[]>([])

const loading = ref(false)
const loadingBreakdowns = ref(false)

const hasData = computed(() => chartData.value.length > 0)

const maxYear = computed(() => selectedYears.value.length ? Math.max(...selectedYears.value) : null)

// "Primary" chart data: the last selected year only.
const clientItemsLastYear = computed(() => clientRows.value.filter(r => r.year === maxYear.value))
const lineItemsLastYear = computed(() => lineRows.value.filter(r => r.year === maxYear.value))
const loadingPortItemsLastYear = computed(() => loadingPortRows.value.filter(r => r.year === maxYear.value))
const dischargePortItemsLastYear = computed(() => dischargePortRows.value.filter(r => r.year === maxYear.value))

const availableYears = computed(() => {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = 2010; y <= current; y++) years.push(y)
  return years.reverse()
})

const baseParams = () => {
  const params: any = {
    years: selectedYears.value,
    useLegacy: useLegacyData.value,
    useNew: useNewData.value,
  }
  if (selectedEjecutivo.value) params.ejecutivo_id = selectedEjecutivo.value
  return params
}

const loadAll = async () => {
  if (selectedYears.value.length === 0) return
  loading.value = true
  try {
    // Always fetch the full dataset (profit + en transito) so the checkboxes can
    // toggle visibility instantly without re-querying.
    const response = await $api.reports.getYearlyComparative({
      ...baseParams(),
      includeProfit: true,
      includeWithoutEta: true,
    })
    chartData.value = Array.isArray(response?.data) ? response.data : []
    await loadBreakdowns()
  } catch (error) {
    console.error('Error loading reports:', error)
    snackbar.add({ type: 'error', text: 'Failed to load reports' })
    chartData.value = []
  } finally {
    loading.value = false
  }
}

const loadBreakdowns = async () => {
  loadingBreakdowns.value = true
  try {
    const [clients, lines, loadingPorts, dischargePorts] = await Promise.all([
      $api.reports.getReferencesByClient(baseParams()),
      $api.reports.getReferencesByLine(baseParams()),
      $api.reports.getReferencesByLoadingPort(baseParams()),
      $api.reports.getReferencesByDischargePort(baseParams()),
    ])
    clientRows.value = (clients?.data ?? []).map((c: any) => ({ year: c.year, name: c.client_name, teus: Number(c.total_teus) || 0 }))
    lineRows.value = (lines?.data ?? []).map((l: any) => ({ year: l.year, name: l.line_name, teus: Number(l.total_teus) || 0, references: Number(l.references) || 0 }))
    loadingPortRows.value = (loadingPorts?.data ?? []).map((p: any) => ({ year: p.year, name: p.port_name, teus: Number(p.total_teus) || 0, references: Number(p.references) || 0 }))
    dischargePortRows.value = (dischargePorts?.data ?? []).map((p: any) => ({ year: p.year, name: p.port_name, teus: Number(p.total_teus) || 0, references: Number(p.references) || 0 }))
  } catch (error) {
    console.error('Error loading breakdowns:', error)
    snackbar.add({ type: 'error', text: 'Failed to load breakdown charts' })
  } finally {
    loadingBreakdowns.value = false
  }
}

const loadEjecutivos = async () => {
  try {
    const { data } = await $api.reports.getEjecutivos()
    ejecutivos.value = data || []
  } catch (error) {
    console.error('Error loading ejecutivos:', error)
  }
}

onMounted(loadEjecutivos)
</script>

<style scoped>
.report-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
}

.report-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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

.filters-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.04) 0%,
    rgba(var(--v-theme-surface), 0) 60%
  );
  position: relative;
  overflow: hidden;
}
.filters-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.3));
}
.sea-import-reports :deep(.v-row) {
  scroll-margin-top: 80px;
}
</style>
