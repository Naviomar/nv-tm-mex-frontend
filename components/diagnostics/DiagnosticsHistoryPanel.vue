<template>
  <div>
    <div class="d-flex align-center ga-3 mb-4">
      <v-select v-model="type" :items="types" label="Type" density="compact" hide-details clearable style="max-width: 220px" @update:model-value="load" />
      <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="load">Reload</v-btn>
    </div>

    <DiagnosticsTrendChart
      class="mb-5"
      title="Runs over time"
      subtitle="Outcome of each stored run"
      empty="No runs stored yet."
      type="bar"
      stacked
      :categories="chart.labels"
      :series="chart.series"
      :height="200"
    />

    <v-card elevation="0" class="tm-panel" rounded="lg">
      <v-data-table :headers="headers" :items="runs" :loading="loading" density="comfortable" :items-per-page="20" @click:row="(_: any, { item }: any) => open(item.id)">
        <template #item.status="{ item }">
          <DiagnosticsStatusChip :status="overall(item)" />
        </template>
        <template #item.created_at="{ item }">{{ new Date(item.created_at).toLocaleString() }}</template>
        <template #item.summary="{ item }">
          <span v-if="item.summary?.fail !== undefined" class="text-caption">
            {{ item.summary.ok }} ok · {{ item.summary.warn }} warn · {{ item.summary.fail }} fail
          </span>
          <span v-else class="text-caption">{{ item.label ?? 'Click for details' }}</span>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog :model-value="!!selected" max-width="900" @update:model-value="selected = null">
      <v-card v-if="selected">
        <v-card-title>Run #{{ selected.id }} · {{ selected.type }}</v-card-title>
        <v-card-text>
          <v-table v-if="selected.results?.length" density="compact">
            <thead><tr><th>Status</th><th>Check</th><th>Message</th><th class="text-right">ms</th></tr></thead>
            <tbody>
              <tr v-for="r in selected.results" :key="r.id">
                <td><DiagnosticsStatusChip :status="r.status" /></td>
                <td>{{ r.check_key }}</td>
                <td class="text-wrap">{{ r.message }}</td>
                <td class="text-right">{{ r.duration_ms }}</td>
              </tr>
            </tbody>
          </v-table>
          <pre v-else class="tm-muted pa-3 rounded text-caption" style="max-height: 420px; overflow: auto">{{ JSON.stringify(selected.summary, null, 2) }}</pre>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="selected = null">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
const { $api } = useNuxtApp()

const loading = ref(false)
const runs = ref<any[]>([])
const type = ref<string | null>(null)
const selected = ref<any | null>(null)
const types = [
  { title: 'Health checks', value: 'checks' },
  { title: 'Mail tests', value: 'mail' },
  { title: 'Performance probes', value: 'probes' },
]

const headers = [
  { title: 'Status', key: 'status', sortable: false, width: 110 },
  { title: 'Type', key: 'type' },
  { title: 'Trigger', key: 'trigger' },
  { title: 'Result', key: 'summary', sortable: false },
  { title: 'When', key: 'created_at' },
]

const theme = useTheme()
const chart = computed(() => {
  const rows = [...runs.value].reverse()
  const c = theme.current.value.colors
  const count = (r: any, s: string) => (overall(r) === s ? 1 : 0)
  return {
    labels: rows.map((r) => new Date(r.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })),
    series: [
      { name: 'OK', data: rows.map((r) => count(r, 'ok')), color: c.success },
      { name: 'Warning', data: rows.map((r) => count(r, 'warn')), color: c.warning },
      { name: 'Failed', data: rows.map((r) => count(r, 'fail')), color: c.error },
    ],
  }
})

const overall = (run: any) => run.summary?.overall ?? run.summary?.status ?? (run.status === 'failed' ? 'fail' : 'ok')

const load = async () => {
  loading.value = true
  try {
    const response: any = await $api.diagnostics.runs(type.value ? { type: type.value } : undefined)
    runs.value = response.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const open = async (id: number) => {
  try {
    selected.value = await $api.diagnostics.showRun(id)
  } catch (e) {
    console.error(e)
  }
}

onMounted(load)
</script>
