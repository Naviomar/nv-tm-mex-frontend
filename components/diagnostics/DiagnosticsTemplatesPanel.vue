<template>
  <div>
    <div class="d-flex align-center flex-wrap ga-3 mb-4">
      <v-text-field
        v-model="reference"
        label="Render with reference (optional)"
        placeholder="IM26-0677"
        density="compact"
        hide-details
        clearable
        style="max-width: 280px"
        @keyup.enter="load"
      />
      <v-btn color="primary" prepend-icon="mdi-clipboard-check-outline" :loading="loading" @click="load">Audit templates</v-btn>
      <v-spacer />
      <template v-if="summary">
        <DiagnosticsStatusChip status="ok" :label="`${summary.ok} ok`" />
        <DiagnosticsStatusChip status="warn" :label="`${summary.warn} warn`" />
        <DiagnosticsStatusChip status="fail" :label="`${summary.fail} fail`" />
      </template>
    </div>

    <v-alert type="info" variant="tonal" density="compact" class="mb-4">
      Shows, for each managed email template, the version that is live today, drafts waiting to be published, line-specific overrides,
      tokens that would be sent empty, and whether it renders. Read-only.
    </v-alert>

    <v-card elevation="0" class="tm-panel">
      <v-data-table
        :headers="headers"
        :items="templates"
        :loading="loading"
        item-value="key"
        density="comfortable"
        :items-per-page="25"
        show-expand
        v-model:expanded="expanded"
      >
        <template #item.status="{ item }"><DiagnosticsStatusChip :status="item.status" /></template>
        <template #item.name="{ item }">
          <div class="font-weight-medium">{{ item.name }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.key }}<v-chip v-if="!item.is_active" size="x-small" class="ml-1">inactive</v-chip></div>
        </template>
        <template #item.effective_version="{ item }">
          <span v-if="item.effective_version">v{{ item.effective_version.version_number }}</span>
          <v-chip v-else size="x-small" color="error" variant="tonal" label>none</v-chip>
        </template>
        <template #item.drafts="{ item }">
          <v-chip v-if="item.drafts.length" size="x-small" color="warning" variant="tonal" label>
            {{ item.drafts.map((d: any) => 'v' + d.version_number).join(', ') }}
          </v-chip>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #item.line_overrides="{ item }">{{ item.line_overrides.length || '—' }}</template>
        <template #item.render="{ item }">
          <template v-if="item.render">
            <v-icon :color="item.render.status === 'ok' ? 'success' : 'error'" size="18">
              {{ item.render.status === 'ok' ? 'mdi-check' : 'mdi-close' }}
            </v-icon>
            <span class="text-caption ml-1">{{ item.render.ms }} ms</span>
          </template>
          <span v-else class="text-medium-emphasis">—</span>
        </template>
        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="tm-muted pa-4">
              <div v-if="item.issues.length" class="mb-3">
                <v-alert
                  v-for="(issue, i) in item.issues"
                  :key="i"
                  :type="issue.level === 'fail' ? 'error' : 'warning'"
                  variant="tonal"
                  density="compact"
                  class="mb-2"
                >
                  <span class="font-weight-bold mr-1">{{ issue.code }}</span>{{ issue.message }}
                </v-alert>
              </div>
              <p v-else class="text-medium-emphasis mb-3">No issues found.</p>
              <div class="text-caption text-medium-emphasis mb-2">Mailable: {{ item.mailable_class ?? 'n/a' }}</div>
              <v-btn
                v-for="scenario in item.scenarios"
                :key="scenario"
                size="small"
                variant="tonal"
                prepend-icon="mdi-email-fast-outline"
                class="mr-2"
                @click="$emit('test-scenario', scenario)"
              >
                Test "{{ scenario }}"
              </v-btn>
              <span v-if="!item.scenarios.length" class="text-caption text-medium-emphasis">No test scenario is registered for this template yet.</span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { ITemplateAuditEntry } from '~/repository/modules/diagnostics'

defineEmits<{ 'test-scenario': [string] }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const loading = ref(false)
const reference = ref('')
const templates = ref<ITemplateAuditEntry[]>([])
const summary = ref<{ ok: number; warn: number; fail: number } | null>(null)
const expanded = ref<string[]>([])

const headers = [
  { title: 'Status', key: 'status', sortable: true, width: 110 },
  { title: 'Template', key: 'name', sortable: true },
  { title: 'Module', key: 'module', sortable: true },
  { title: 'Live version', key: 'effective_version', sortable: false },
  { title: 'Unpublished drafts', key: 'drafts', sortable: false },
  { title: 'Line overrides', key: 'line_overrides', sortable: false },
  { title: 'Renders', key: 'render', sortable: false },
  { title: '', key: 'data-table-expand' },
]

const load = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (reference.value) params.reference = reference.value
    const response: any = await $api.diagnostics.templates(params)
    templates.value = response.templates
    summary.value = response.summary
    expanded.value = response.templates.filter((t: ITemplateAuditEntry) => t.status === 'fail').map((t: ITemplateAuditEntry) => t.key)
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message ?? 'Could not audit the templates' })
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
