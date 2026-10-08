<template>
  <div>
    <div class="d-flex align-center flex-wrap ga-3 mb-4">
      <v-btn v-if="canRun" color="primary" prepend-icon="mdi-speedometer" :loading="running" @click="run">Run probes</v-btn>
      <span class="text-body-2 text-medium-emphasis">
        Runs real read-only requests as you and measures time, queries, memory and size against each budget.
      </span>
    </div>

    <v-card elevation="0" class="tm-panel">
      <v-table density="comfortable">
        <thead>
          <tr>
            <th>Probe</th>
            <th>Status</th>
            <th v-for="metric in metrics" :key="metric.key" class="text-right">{{ metric.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="probe in probes" :key="probe.key">
            <td>
              <div class="font-weight-medium">{{ probe.label }}</div>
              <div class="text-caption text-medium-emphasis">{{ probe.key }}</div>
            </td>
            <td>
              <DiagnosticsStatusChip v-if="results[probe.key]" :status="results[probe.key].status" />
              <span v-else class="text-medium-emphasis">—</span>
            </td>
            <td v-for="metric in metrics" :key="metric.key" class="text-right">
              <template v-if="results[probe.key]?.metrics?.[metric.key] !== undefined">
                <span :class="ratioClass(results[probe.key].metrics.ratios?.[metric.key])">{{ results[probe.key].metrics[metric.key] }}</span>
                <span class="text-caption text-medium-emphasis"> / {{ probe.budget[metric.key as 'time_ms'] }}</span>
              </template>
              <span v-else class="text-caption text-medium-emphasis">budget {{ probe.budget[metric.key as 'time_ms'] }}</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
    <p v-if="results && Object.values(results).some((r) => r.status === 'skip')" class="text-caption text-medium-emphasis mt-3">
      "skip": your user has no access to that endpoint, so it could not be measured.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { IDiagnosticResult, IProbe } from '~/repository/modules/diagnostics'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()
const canRun = computed(() => hasPermission('diagnostics-run'))

const probes = ref<IProbe[]>([])
const results = ref<Record<string, IDiagnosticResult>>({})
const running = ref(false)

const metrics = [
  { key: 'time_ms', label: 'ms' },
  { key: 'queries', label: 'queries' },
  { key: 'memory_mb', label: 'MB' },
  { key: 'size_kb', label: 'KB' },
]

const ratioClass = (ratio?: number) => (ratio === undefined ? '' : ratio > 2 ? 'text-error font-weight-bold' : ratio > 1 ? 'text-warning font-weight-bold' : 'text-success')

// Una petición por sonda: cada medición corre en un worker limpio y ninguna acumula memoria de otra.
const run = async () => {
  running.value = true
  results.value = {}
  try {
    for (const probe of probes.value) {
      const report: any = await $api.diagnostics.runProbes({ keys: [probe.key] })
      for (const r of report.results as IDiagnosticResult[]) results.value[r.key] = r
    }
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Could not run the probes' })
  } finally {
    running.value = false
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
