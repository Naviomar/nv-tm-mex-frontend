<template>
  <div>
    <DiagnosticsHero :counts="counts" :last-run="lastRun" class="mb-5">
      <template #actions>
        <v-btn v-if="canRun" color="primary" size="large" prepend-icon="mdi-play-circle-outline" :loading="running === '*'" :disabled="!!running" @click="runAll">
          Run all checks
        </v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :disabled="!!running" @click="load">Reload</v-btn>
      </template>
    </DiagnosticsHero>

    <v-progress-linear v-if="loading || running" indeterminate height="3" class="mb-4" rounded />

    <v-row class="mb-1">
      <v-col v-for="g in gauges" :key="g.label" cols="6" md="3">
        <DiagnosticsGauge v-bind="g" />
      </v-col>
    </v-row>

    <v-row class="mb-2">
      <v-col cols="12" md="7">
        <DiagnosticsTrendChart
          title="Health over time"
          subtitle="Last 30 stored runs"
          empty="History fills up as checks are run (or scheduled)."
          type="bar"
          stacked
          :categories="trend.labels"
          :series="trend.series"
        />
      </v-col>
      <v-col cols="12" md="5">
        <DiagnosticsTrendChart
          title="Slowest checks"
          subtitle="Latest run, ms"
          empty="Run the checks to see timings."
          type="bar"
          :horizontal="true"
          :categories="slowest.labels"
          :series="slowest.series"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="category in categories" :key="category" cols="12" md="6" xl="4">
        <v-card elevation="0" class="tm-panel h-100 dc" rounded="lg">
          <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
            <span class="dc-dot" :class="`dc-${categoryStatus(category)}`" />
            <v-icon start :icon="categoryIcon[category] ?? 'mdi-cog-outline'" class="ml-2" />
            {{ categoryLabel[category] ?? category }}
            <v-spacer />
            <v-btn v-if="canRun" size="small" variant="text" icon="mdi-play" :loading="running === category" :disabled="!!running" :title="`Run ${category} checks`" @click="runCategory(category)" />
          </v-card-title>
          <v-divider />
          <div v-for="check in checksIn(category)" :key="check.key" class="dc-row" :class="`dc-row-${resultFor(check)?.status ?? 'none'}`" @click="hasMetrics(check) && (detail = check)">
            <DiagnosticsStatusChip v-if="resultFor(check)" :status="resultFor(check)!.status" class="flex-shrink-0" />
            <v-chip v-else size="small" label variant="outlined" class="flex-shrink-0">not run</v-chip>
            <div class="dc-body">
              <div class="font-weight-medium">
                {{ check.label }}
                <v-chip v-if="check.side_effects === 'scratch'" size="x-small" class="ml-1" title="Writes only to a disposable area">scratch</v-chip>
              </div>
              <div class="text-body-2 text-medium-emphasis">{{ resultFor(check)?.message ?? 'No result yet' }}</div>
            </div>
            <div v-if="resultFor(check)" class="dc-ms">{{ resultFor(check)!.duration_ms }}<small> ms</small></div>
            <v-icon v-if="hasMetrics(check)" size="18" class="text-medium-emphasis">mdi-chevron-right</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog :model-value="!!detail" max-width="760" scrollable @update:model-value="detail = null">
      <v-card v-if="detail" rounded="lg">
        <v-card-title class="d-flex align-center">
          {{ detail.label }}
          <v-spacer />
          <DiagnosticsStatusChip v-if="resultFor(detail)" :status="resultFor(detail)!.status" />
        </v-card-title>
        <v-card-text>
          <p class="mb-3">{{ resultFor(detail)?.message }}</p>
          <v-table density="compact" class="tm-border rounded">
            <tbody>
              <tr v-for="row in metricRows(detail)" :key="row.path">
                <td class="text-medium-emphasis" style="width: 45%">{{ row.path }}</td>
                <td class="font-weight-medium text-break">{{ row.value }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="detail = null">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { IDiagnosticCheck, IDiagnosticReport, IDiagnosticResult } from '~/repository/modules/diagnostics'

type Latest = NonNullable<IDiagnosticCheck['latest']>

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()
const canRun = computed(() => hasPermission('diagnostics-run'))

const loading = ref(false)
const running = ref<string | null>(null)
const checks = ref<IDiagnosticCheck[]>([])
const categories = ref<string[]>([])
const fresh = ref<Record<string, Latest>>({})
const detail = ref<IDiagnosticCheck | null>(null)
const history = ref<any[]>([])
const theme = useTheme()

const categoryLabel: Record<string, string> = {
  database: 'Database', cache: 'Cache & Redis', queue: 'Queues & scheduler', storage: 'Storage',
  runtime: 'Runtime & configuration', mail: 'Mail', pdf: 'PDF generation', external: 'External services',
}
const categoryIcon: Record<string, string> = {
  database: 'mdi-database-outline', cache: 'mdi-memory', queue: 'mdi-timer-sand', storage: 'mdi-harddisk',
  runtime: 'mdi-cog-outline', mail: 'mdi-email-outline', pdf: 'mdi-file-pdf-box', external: 'mdi-web',
}

const checksIn = (category: string) => checks.value.filter((c) => c.category === category)
const resultFor = (check: IDiagnosticCheck): Latest | null => fresh.value[check.key] ?? check.latest
const hasMetrics = (check: IDiagnosticCheck) => !!resultFor(check)?.metrics && Object.keys(resultFor(check)!.metrics!).length > 0

const counts = computed(() => {
  const c = { ok: 0, warn: 0, fail: 0, skip: 0, total: 0 }
  for (const check of checks.value) {
    const r = resultFor(check)
    if (r) {
      c[r.status as 'ok']++
      c.total++
    }
  }
  return c
})

const lastRun = computed(() => {
  const times = checks.value.map((c) => resultFor(c)?.at).filter(Boolean) as string[]
  return times.length ? times.sort().at(-1)! : null
})

const categoryStatus = (category: string) => {
  const statuses = checksIn(category).map((c) => resultFor(c)?.status)
  if (statuses.includes('fail')) return 'fail'
  if (statuses.includes('warn')) return 'warn'
  return statuses.some(Boolean) ? 'ok' : 'none'
}

const metricOf = (key: string) => {
  const c = checks.value.find((x) => x.key === key)
  return c ? resultFor(c)?.metrics ?? null : null
}

const gauges = computed(() => {
  const disk = metricOf('disk-space')?.application
  const temp = metricOf('disk-space')?.temp
  const redis = metricOf('redis-health')
  const queue = metricOf('queue-backlog')
  const pending = queue ? Object.values(queue.queues as Record<string, number>).reduce((a, b) => a + b, 0) : null
  return [
    { label: 'Disk', icon: 'mdi-harddisk', value: disk?.used_pct ?? null, caption: disk ? `${disk.free_gb} GB free` : 'not run' },
    { label: 'Temp disk', icon: 'mdi-folder-clock-outline', value: temp?.used_pct ?? null, caption: temp ? `${temp.free_gb} GB free` : 'not run' },
    { label: 'Redis memory', icon: 'mdi-memory', value: redis?.memory_pct ?? null, caption: redis ? `${redis.used_memory_mb} / ${redis.maxmemory_mb} MB` : 'not run' },
    { label: 'Queue backlog', icon: 'mdi-timer-sand', value: pending === null ? null : Math.min(100, (pending / 5000) * 100), warnAt: 10, failAt: 100, caption: queue ? `${pending} pending · ${queue.failed_jobs} failed` : 'not run' },
  ]
})

const trend = computed(() => {
  const runs = [...history.value].reverse()
  const c = theme.current.value.colors
  return {
    labels: runs.map((r) => new Date(r.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })),
    series: [
      { name: 'Passing', data: runs.map((r) => r.summary?.ok ?? 0), color: c.success },
      { name: 'Warnings', data: runs.map((r) => r.summary?.warn ?? 0), color: c.warning },
      { name: 'Failing', data: runs.map((r) => r.summary?.fail ?? 0), color: c.error },
    ],
  }
})

const slowest = computed(() => {
  const rows = checks.value
    .map((c) => ({ key: c.key, label: c.label, ms: resultFor(c)?.duration_ms ?? null }))
    .filter((r) => r.ms !== null && r.key !== 'queue-roundtrip')
    .sort((a, b) => b.ms! - a.ms!)
    .slice(0, 8)
  return { labels: rows.map((r) => r.label), series: [{ name: 'ms', data: rows.map((r) => r.ms as number), color: theme.current.value.colors.primary }] }
})

const metricRows = (check: IDiagnosticCheck) => {
  const out: { path: string; value: string }[] = []
  const walk = (value: any, path: string) => {
    if (value !== null && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(v, path ? `${path} › ${k}` : k)
    } else {
      out.push({ path, value: String(value) })
    }
  }
  walk(resultFor(check)?.metrics ?? {}, '')
  return out
}

const loadHistory = async () => {
  try {
    const response: any = await $api.diagnostics.runs({ type: 'checks', per_page: 30 })
    history.value = response.data
  } catch (e) {
    console.error(e)
  }
}

const load = async () => {
  loading.value = true
  try {
    const response: any = await $api.diagnostics.overview()
    checks.value = response.checks
    categories.value = response.categories
    fresh.value = {}
    loadHistory()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const apply = (report: IDiagnosticReport) => {
  for (const r of report.results as IDiagnosticResult[]) {
    fresh.value[r.key] = { status: r.status, message: r.message, metrics: r.metrics, duration_ms: r.duration_ms, at: new Date().toISOString() }
  }
}

const runCategory = async (category: string) => {
  running.value = category
  try {
    apply(await $api.diagnostics.run({ category }))
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: `Could not run the ${category} checks` })
  } finally {
    running.value = null
  }
}

// Una petición por categoría: cada una es corta y el progreso se ve en pantalla.
const runAll = async () => {
  running.value = '*'
  try {
    for (const category of categories.value) {
      apply(await $api.diagnostics.run({ category }))
    }
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Could not run all checks' })
  } finally {
    running.value = null
    loadHistory()
  }
}

onMounted(load)
</script>

<style scoped>
.dc-dot { width: 10px; height: 10px; border-radius: 50%; background: rgb(var(--v-theme-secondary)); opacity: 0.5; }
.dc-ok { background: rgb(var(--v-theme-success)); opacity: 1; }
.dc-warn { background: rgb(var(--v-theme-warning)); opacity: 1; }
.dc-fail { background: rgb(var(--v-theme-error)); opacity: 1; }
.dc-row { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-left: 3px solid transparent; cursor: default; }
.dc-row + .dc-row { border-top: 1px solid rgba(var(--v-border-color), 0.08); }
.dc-row:has(.mdi-chevron-right) { cursor: pointer; }
.dc-row:has(.mdi-chevron-right):hover { background: rgba(var(--v-theme-on-surface), 0.04); }
.dc-row-ok { border-left-color: rgb(var(--v-theme-success)); }
.dc-row-warn { border-left-color: rgb(var(--v-theme-warning)); background: rgba(var(--v-theme-warning), 0.05); }
.dc-row-fail { border-left-color: rgb(var(--v-theme-error)); background: rgba(var(--v-theme-error), 0.06); }
.dc-body { flex: 1; min-width: 0; }
.dc-ms { font-variant-numeric: tabular-nums; font-weight: 700; white-space: nowrap; }
.dc-ms small { font-weight: 400; opacity: 0.6; }
</style>
