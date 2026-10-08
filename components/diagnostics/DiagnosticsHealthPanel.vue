<template>
  <div>
    <div class="d-flex align-center flex-wrap ga-3 mb-4">
      <v-btn
        v-if="canRun"
        color="primary"
        prepend-icon="mdi-play-circle-outline"
        :loading="running === '*'"
        :disabled="!!running"
        @click="runAll"
      >
        Run all checks
      </v-btn>
      <v-btn variant="text" prepend-icon="mdi-refresh" :disabled="!!running" @click="load">Reload</v-btn>
      <v-spacer />
      <template v-if="counts.total">
        <DiagnosticsStatusChip status="ok" :label="`${counts.ok} ok`" />
        <DiagnosticsStatusChip status="warn" :label="`${counts.warn} warn`" />
        <DiagnosticsStatusChip status="fail" :label="`${counts.fail} fail`" />
        <DiagnosticsStatusChip status="skip" :label="`${counts.skip} skip`" />
      </template>
    </div>

    <v-progress-linear v-if="loading" indeterminate class="mb-4" />

    <v-row>
      <v-col v-for="category in categories" :key="category" cols="12" md="6" xl="4">
        <v-card elevation="0" class="tm-panel h-100">
          <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
            <v-icon start :icon="categoryIcon[category] ?? 'mdi-cog-outline'" />
            {{ categoryLabel[category] ?? category }}
            <v-spacer />
            <v-btn
              v-if="canRun"
              size="small"
              variant="text"
              icon="mdi-play"
              :loading="running === category"
              :disabled="!!running"
              :title="`Run ${category} checks`"
              @click="runCategory(category)"
            />
          </v-card-title>
          <v-divider />
          <v-list density="compact" lines="three" class="py-0">
            <v-list-item v-for="check in checksIn(category)" :key="check.key" class="py-2">
              <template #prepend>
                <DiagnosticsStatusChip v-if="resultFor(check)" :status="resultFor(check)!.status" class="mr-3" />
                <v-chip v-else size="small" label variant="outlined" class="mr-3">not run</v-chip>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ check.label }}
                <v-chip v-if="check.side_effects === 'scratch'" size="x-small" class="ml-1" title="Writes only to a disposable area">scratch</v-chip>
              </v-list-item-title>
              <v-list-item-subtitle class="text-wrap">{{ resultFor(check)?.message ?? 'No result yet' }}</v-list-item-subtitle>
              <v-list-item-subtitle v-if="resultFor(check)" class="text-caption">
                {{ resultFor(check)!.duration_ms }} ms<span v-if="resultFor(check)!.at"> · {{ formatWhen(resultFor(check)!.at!) }}</span>
              </v-list-item-subtitle>
              <template v-if="hasMetrics(check)" #append>
                <v-btn size="x-small" variant="text" icon="mdi-code-json" title="Details" @click="detail = check" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog :model-value="!!detail" max-width="760" @update:model-value="detail = null">
      <v-card v-if="detail">
        <v-card-title class="d-flex align-center">
          {{ detail.label }}
          <v-spacer />
          <DiagnosticsStatusChip v-if="resultFor(detail)" :status="resultFor(detail)!.status" />
        </v-card-title>
        <v-card-text>
          <p class="mb-3">{{ resultFor(detail)?.message }}</p>
          <pre class="tm-muted pa-3 rounded text-caption" style="max-height: 420px; overflow: auto">{{ JSON.stringify(resultFor(detail)?.metrics, null, 2) }}</pre>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="detail = null">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
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

const formatWhen = (iso: string) => new Date(iso).toLocaleString()

const load = async () => {
  loading.value = true
  try {
    const response: any = await $api.diagnostics.overview()
    checks.value = response.checks
    categories.value = response.categories
    fresh.value = {}
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
  }
}

onMounted(load)
</script>
