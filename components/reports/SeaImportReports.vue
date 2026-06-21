<template>
  <div class="sea-import-reports">
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
          <v-col cols="6" md="2">
            <v-checkbox v-model="includeProfit" label="Include Profit" color="primary" density="comfortable" hide-details :disabled="loading" />
          </v-col>
          <v-col cols="6" md="3">
            <div class="d-flex align-center gap-2">
              <v-checkbox v-model="includeEnTransito" label="En Transito" color="warning" density="comfortable" hide-details :disabled="loading" />
              <v-btn
                color="primary"
                variant="elevated"
                :loading="loading"
                :disabled="selectedYears.length === 0"
                @click="loadAll()"
              >
                <v-icon start>mdi-chart-line</v-icon>
                Generate
              </v-btn>
            </div>
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

      <v-row>
        <v-col cols="12">
          <ClientChart :items="clientItems" :loading="loadingBreakdowns" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6">
          <CategoryBarChart
            title="TEUs by Shipping Line"
            icon="mdi-ship"
            color="#6366f1"
            :items="lineItems"
            :show-references="false"
            :loading="loadingBreakdowns"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <CategoryBarChart
            title="Loading Ports"
            icon="mdi-anchor"
            color="#0ea5e9"
            :items="loadingPortItems"
            :loading="loadingBreakdowns"
            :top-n="15"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6">
          <CategoryBarChart
            title="Discharge Ports"
            icon="mdi-anchor"
            color="#22c55e"
            :items="dischargePortItems"
            :loading="loadingBreakdowns"
            :top-n="15"
          />
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const selectedYears = ref<number[]>([])
const selectedEjecutivo = ref<number | null>(null)
const includeProfit = ref(true)
const includeEnTransito = ref(false)

const ejecutivos = ref<any[]>([])
const chartData = ref<any[]>([])
const clientItems = ref<any[]>([])
const lineItems = ref<any[]>([])
const loadingPortItems = ref<any[]>([])
const dischargePortItems = ref<any[]>([])

const loading = ref(false)
const loadingBreakdowns = ref(false)

const hasData = computed(() => chartData.value.length > 0)

const availableYears = computed(() => {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = 2010; y <= current; y++) years.push(y)
  return years.reverse()
})

const baseParams = () => {
  const params: any = { years: selectedYears.value }
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
    clientItems.value = (clients?.data ?? []).map((c: any) => ({ name: c.client_name, teus: Number(c.total_teus) || 0 }))
    lineItems.value = (lines?.data ?? []).map((l: any) => ({ name: l.line_name, teus: Number(l.total_teus) || 0, references: Number(l.references) || 0 }))
    loadingPortItems.value = (loadingPorts?.data ?? []).map((p: any) => ({ name: p.port_name, teus: Number(p.total_teus) || 0, references: Number(p.references) || 0 }))
    dischargePortItems.value = (dischargePorts?.data ?? []).map((p: any) => ({ name: p.port_name, teus: Number(p.total_teus) || 0, references: Number(p.references) || 0 }))
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
