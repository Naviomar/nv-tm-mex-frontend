<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate height="3" class="mb-4" rounded />

    <v-alert v-if="failed" type="error" variant="tonal" class="mb-4">Could not load the database footprint.</v-alert>

    <template v-if="data">
      <v-row class="mb-1">
        <v-col v-for="kpi in kpis" :key="kpi.label" cols="6" md="3">
          <v-card elevation="0" class="tm-panel h-100" rounded="lg">
            <v-card-text class="d-flex align-center ga-3">
              <v-avatar :color="kpi.color" variant="tonal" rounded="lg"><v-icon>{{ kpi.icon }}</v-icon></v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ kpi.value }}</div>
                <div class="text-caption text-medium-emphasis">{{ kpi.label }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="7">
          <DiagnosticsTrendChart
            title="Largest tables"
            subtitle="Data + indexes, MB"
            type="bar"
            horizontal
            stacked
            :categories="tableChart.labels"
            :series="tableChart.series"
            :height="360"
          />
        </v-col>
        <v-col cols="12" md="5">
          <DiagnosticsTrendChart
            title="System logs per day"
            :subtitle="`Last 30 days · kept in the database: ${data.logs.retention_days} days`"
            empty="No logs in the last 30 days."
            type="area"
            :categories="dailyChart.labels"
            :series="dailyChart.series"
            :height="360"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-card elevation="0" class="tm-panel h-100" rounded="lg">
            <v-card-title class="text-subtitle-1 font-weight-bold"><v-icon start>mdi-format-list-bulleted-type</v-icon>What fills the logs</v-card-title>
            <v-divider />
            <v-table density="comfortable">
              <thead><tr><th>Type</th><th class="text-right">Rows</th><th class="text-right">Payload MB</th><th style="width: 30%">Share</th></tr></thead>
              <tbody>
                <tr v-for="t in data.logs.by_type" :key="t.type">
                  <td class="font-weight-medium">{{ t.type }}</td>
                  <td class="text-right">{{ t.rows.toLocaleString() }}</td>
                  <td class="text-right">{{ t.payload_mb }}</td>
                  <td><v-progress-linear :model-value="(t.rows / data.logs.active_rows) * 100" height="6" rounded color="primary" /></td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="0" class="tm-panel h-100" rounded="lg">
            <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
              <v-icon start>mdi-broom</v-icon>Log retention
              <v-spacer />
              <v-chip size="small" label :color="data.logs.prune_scheduled ? 'success' : 'secondary'" variant="tonal">
                {{ data.logs.prune_scheduled ? 'daily prune on' : 'prune off' }}
              </v-chip>
            </v-card-title>
            <v-divider />
            <div class="pa-4">
              <div class="d-flex justify-space-between text-body-2 mb-2">
                <span class="text-medium-emphasis">Kept in the database</span>
                <b>{{ data.logs.retention_days }} days</b>
              </div>
              <div class="d-flex justify-space-between text-body-2 mb-2">
                <span class="text-medium-emphasis">Oldest log</span>
                <b>{{ data.logs.oldest_at ? new Date(data.logs.oldest_at.replace(' ', 'T')).toLocaleDateString() : '—' }}</b>
              </div>
              <div class="d-flex justify-space-between text-body-2 mb-3">
                <span class="text-medium-emphasis">Rows past the retention</span>
                <b :class="data.logs.over_retention_rows ? 'text-warning' : 'text-success'">{{ data.logs.over_retention_rows.toLocaleString() }}</b>
              </div>
              <v-alert v-if="data.logs.over_retention_rows" type="warning" variant="tonal" density="compact">
                Run <code>php artisan logs:prune</code> on the server to see the plan; add <code>--execute</code> to delete.
                History stays in the daily database backups.
              </v-alert>
              <v-alert v-else type="success" variant="tonal" density="compact">Nothing past the retention.</v-alert>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <p class="text-caption text-medium-emphasis mt-3">Updated {{ new Date(data.generated_at).toLocaleString() }} (cached for 5 minutes).</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { IDatabaseFootprint } from '~/repository/modules/diagnostics'

const { $api } = useNuxtApp()
const theme = useTheme()

const loading = ref(false)
const failed = ref(false)
const data = ref<IDatabaseFootprint | null>(null)

const kpis = computed(() => {
  const d = data.value
  if (!d) return []
  const logsMb = d.tables.items.filter((t) => t.name.startsWith('system_logs')).reduce((a, t) => a + t.size_mb, 0)
  return [
    { label: 'Database size', value: `${d.tables.total_mb} MB`, icon: 'mdi-database', color: 'primary' },
    { label: 'System logs size', value: `${logsMb.toFixed(1)} MB`, icon: 'mdi-text-box-multiple-outline', color: logsMb > d.tables.total_mb * 0.5 ? 'warning' : 'info' },
    { label: 'Active log rows', value: d.logs.active_rows.toLocaleString(), icon: 'mdi-pulse', color: 'info' },
    { label: 'Archived log rows', value: d.logs.archive_rows.toLocaleString(), icon: 'mdi-archive-outline', color: d.logs.archive_rows > 0 ? 'warning' : 'success' },
  ]
})

const tableChart = computed(() => {
  const items = data.value?.tables.items.slice(0, 10) ?? []
  const c = theme.current.value.colors
  return {
    labels: items.map((t) => t.name),
    series: [
      { name: 'Data', data: items.map((t) => t.data_mb), color: c.primary },
      { name: 'Indexes', data: items.map((t) => t.index_mb), color: c.info },
    ],
  }
})

const dailyChart = computed(() => ({
  labels: (data.value?.logs.daily ?? []).map((d) => new Date(`${d.day}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })),
  series: [{ name: 'Rows', data: (data.value?.logs.daily ?? []).map((d) => d.rows), color: theme.current.value.colors.primary }],
}))

onMounted(async () => {
  loading.value = true
  try {
    data.value = (await $api.diagnostics.database()) as IDatabaseFootprint
  } catch (e) {
    console.error(e)
    failed.value = true
  } finally {
    loading.value = false
  }
})
</script>
