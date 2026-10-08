<template>
  <div>
    <v-card elevation="0" class="tm-panel mb-5" rounded="lg">
      <v-card-text class="d-flex align-center flex-wrap ga-3">
        <v-avatar color="primary" variant="tonal" rounded="lg"><v-icon>mdi-speedometer</v-icon></v-avatar>
        <div class="flex-grow-1">
          <div class="font-weight-bold">Performance probes</div>
          <div class="text-body-2 text-medium-emphasis">
            Real read-only requests made as you, measured against a budget for time, queries, memory and size.
          </div>
        </div>
        <v-btn v-if="canRun" color="primary" size="large" prepend-icon="mdi-play-circle-outline" :loading="running" @click="run">Run probes</v-btn>
      </v-card-text>
      <v-progress-linear v-if="running" :model-value="(done / Math.max(probes.length, 1)) * 100" height="3" />
    </v-card>

    <DiagnosticsTrendChart
      v-if="Object.keys(results).length"
      class="mb-5"
      title="Budget usage by probe"
      subtitle="100% = at budget; above it the probe is over"
      type="bar"
      :categories="chart.labels"
      :series="chart.series"
      y-title="% of budget"
      :height="240"
    />

    <v-row>
      <v-col v-for="probe in probes" :key="probe.key" cols="12" md="6" xl="4">
        <v-card elevation="0" class="tm-panel h-100" rounded="lg">
          <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
            <div>
              {{ probe.label }}
              <div class="text-caption text-medium-emphasis font-weight-regular">{{ probe.key }}</div>
            </div>
            <v-spacer />
            <DiagnosticsStatusChip v-if="results[probe.key]" :status="results[probe.key].status" />
            <v-progress-circular v-else-if="running && current === probe.key" indeterminate size="20" width="2" />
          </v-card-title>
          <v-card-text>
            <div v-for="metric in metrics" :key="metric.key" class="mb-3">
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span class="text-medium-emphasis">{{ metric.label }}</span>
                <span v-if="results[probe.key]?.metrics?.[metric.key] !== undefined">
                  <b :class="ratioClass(results[probe.key].metrics.ratios?.[metric.key])">{{ results[probe.key].metrics[metric.key] }}</b>
                  <span class="text-medium-emphasis"> / {{ budgetOf(probe, metric.key) }}</span>
                </span>
                <span v-else class="text-medium-emphasis">budget {{ budgetOf(probe, metric.key) }}</span>
              </div>
              <v-progress-linear
                :model-value="Math.min(100, (results[probe.key]?.metrics?.ratios?.[metric.key] ?? 0) * 100)"
                :color="ratioColor(results[probe.key]?.metrics?.ratios?.[metric.key])"
                height="6"
                rounded
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <p v-if="Object.values(results).some((r) => r.status === 'skip')" class="text-caption text-medium-emphasis mt-3">
      "skip": your user has no access to that endpoint, so it could not be measured.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { IDiagnosticResult, IProbe } from '~/repository/modules/diagnostics'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()
const canRun = computed(() => hasPermission('diagnostics-run'))

const probes = ref<IProbe[]>([])
const results = ref<Record<string, IDiagnosticResult>>({})
const running = ref(false)
const done = ref(0)
const current = ref<string | null>(null)
const theme = useTheme()

const metrics = [
  { key: 'time_ms', label: 'ms' },
  { key: 'queries', label: 'queries' },
  { key: 'memory_mb', label: 'MB' },
  { key: 'size_kb', label: 'KB' },
]

const budgetOf = (probe: IProbe, key: string) => (probe.budget as Record<string, number>)[key]
const ratioColor = (ratio?: number) => (ratio === undefined ? 'secondary' : ratio > 2 ? 'error' : ratio > 1 ? 'warning' : 'success')

const chart = computed(() => {
  const c = theme.current.value.colors
  const rows = probes.value.filter((p) => results.value[p.key]?.metrics?.ratios)
  const pct = (key: string) => rows.map((p) => Math.round((results.value[p.key].metrics.ratios[key] ?? 0) * 100))
  return {
    labels: rows.map((p) => p.label),
    series: [
      { name: 'Time', data: pct('time_ms'), color: c.primary },
      { name: 'Queries', data: pct('queries'), color: c.info },
      { name: 'Memory', data: pct('memory_mb'), color: c.warning },
      { name: 'Size', data: pct('size_kb'), color: c.success },
    ],
  }
})

const ratioClass = (ratio?: number) => (ratio === undefined ? '' : ratio > 2 ? 'text-error font-weight-bold' : ratio > 1 ? 'text-warning font-weight-bold' : 'text-success')

// Una petición por sonda: cada medición corre en un worker limpio y ninguna acumula memoria de otra.
const run = async () => {
  running.value = true
  results.value = {}
  done.value = 0
  try {
    for (const probe of probes.value) {
      current.value = probe.key
      const report: any = await $api.diagnostics.runProbes({ keys: [probe.key] })
      for (const r of report.results as IDiagnosticResult[]) results.value[r.key] = r
      done.value++
    }
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Could not run the probes' })
  } finally {
    running.value = false
    current.value = null
  }
}

onMounted(async () => {
  try {
    probes.value = ((await $api.diagnostics.probes()) as any).probes
  } catch (e) {
    console.error(e)
  }
})
</script>
