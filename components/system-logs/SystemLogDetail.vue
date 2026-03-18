<template>
  <v-dialog v-model="dialogVisible" max-width="850" scrollable>
    <v-card rounded="xl">
      <v-card-title class="bg-indigo-darken-2 text-white d-flex align-center ga-2 pa-4">
        <v-icon>mdi-text-box-search-outline</v-icon>
        Log Detail
        <v-spacer />
        <v-chip :color="typeColor(log?.type)" size="small" variant="flat" class="font-weight-bold mr-2">
          {{ typeLabel(log?.type) }}
        </v-chip>
        <v-chip :color="levelColor(log?.level)" size="small" variant="flat" class="font-weight-bold">
          {{ log?.level?.toUpperCase() }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-4" v-if="log">
        <v-row dense>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Type</div>
            <div class="font-weight-medium">{{ log.type }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Level</div>
            <v-chip :color="levelColor(log.level)" size="x-small" variant="flat">{{ log.level }}</v-chip>
          </v-col>
          <v-col cols="12">
            <div class="text-caption text-grey-darken-1">Message</div>
            <div class="font-weight-medium text-body-2" style="word-break: break-word;">{{ log.message }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">User</div>
            <div class="font-weight-medium">{{ log.user?.name ?? 'System' }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Occurred At</div>
            <div class="font-weight-medium">{{ formatDate(log.occurred_at) }}</div>
          </v-col>

          <!-- Model info for CRUD logs -->
          <template v-if="isModelLog">
            <v-col cols="6">
              <div class="text-caption text-grey-darken-1">Model</div>
              <v-chip size="small" variant="tonal" :color="typeColor(log.type)">
                {{ log.payload?.model_short }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey-darken-1">Record ID</div>
              <div class="font-weight-bold text-h6">{{ log.payload?.model_id }}</div>
            </v-col>
          </template>

          <!-- DIFF VIEW for model_updated -->
          <v-col cols="12" v-if="log.type === 'model_updated' && log.payload?.old && log.payload?.new">
            <div class="text-caption text-grey-darken-1 mb-2">Changes (Before → After)</div>
            <v-table density="compact" class="diff-table rounded-lg">
              <thead>
                <tr class="bg-grey-lighten-4">
                  <th class="text-left" style="width: 25%;">Field</th>
                  <th class="text-left" style="width: 37%;">
                    <v-icon size="14" color="red-darken-1" class="mr-1">mdi-minus-circle</v-icon>
                    Before
                  </th>
                  <th class="text-left" style="width: 37%;">
                    <v-icon size="14" color="green-darken-1" class="mr-1">mdi-plus-circle</v-icon>
                    After
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="field in changedFields" :key="field">
                  <td class="font-weight-bold text-body-2">{{ field }}</td>
                  <td class="diff-old text-body-2">{{ formatValue(log.payload.old[field]) }}</td>
                  <td class="diff-new text-body-2">{{ formatValue(log.payload.new[field]) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>

          <!-- Attributes for model_created -->
          <v-col cols="12" v-if="log.type === 'model_created' && log.payload?.attributes">
            <div class="text-caption text-grey-darken-1 mb-2">Created Attributes</div>
            <v-sheet color="green-lighten-5" rounded="lg" class="pa-3" style="max-height: 300px; overflow-y: auto;">
              <v-table density="compact" class="bg-transparent">
                <tbody>
                  <tr v-for="(val, key) in log.payload.attributes" :key="key">
                    <td class="font-weight-bold text-body-2" style="width: 35%;">{{ key }}</td>
                    <td class="text-body-2">{{ formatValue(val) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-sheet>
          </v-col>

          <!-- Attributes for model_deleted -->
          <v-col cols="12" v-if="log.type === 'model_deleted' && log.payload?.attributes">
            <div class="text-caption text-grey-darken-1 mb-2">Deleted Record Data</div>
            <v-sheet color="red-lighten-5" rounded="lg" class="pa-3" style="max-height: 300px; overflow-y: auto;">
              <v-table density="compact" class="bg-transparent">
                <tbody>
                  <tr v-for="(val, key) in log.payload.attributes" :key="key">
                    <td class="font-weight-bold text-body-2" style="width: 35%;">{{ key }}</td>
                    <td class="text-body-2">{{ formatValue(val) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-sheet>
          </v-col>

          <!-- Technical fields (developer only, non-CRUD) -->
          <template v-if="log.ip_address !== undefined && !isModelLog">
            <v-col cols="6">
              <div class="text-caption text-grey-darken-1">IP Address</div>
              <div class="font-weight-medium text-body-2">{{ log.ip_address ?? '—' }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey-darken-1">Request ID</div>
              <div class="font-weight-medium text-body-2" style="font-size: 11px;">{{ log.request_id ?? '—' }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey-darken-1">Job ID</div>
              <div class="font-weight-medium text-body-2">{{ log.job_id ?? '—' }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey-darken-1">Queue</div>
              <div class="font-weight-medium text-body-2">{{ log.queue ?? '—' }}</div>
            </v-col>
            <v-col cols="12" v-if="log.user_agent">
              <div class="text-caption text-grey-darken-1">User Agent</div>
              <div class="text-body-2" style="font-size: 11px; word-break: break-all;">{{ log.user_agent }}</div>
            </v-col>
          </template>

          <!-- Raw Payload (developer only, non-CRUD) -->
          <v-col cols="12" v-if="log.payload && !isModelLog && Object.keys(log.payload).length > 0">
            <div class="text-caption text-grey-darken-1 mb-1">Payload</div>
            <v-sheet color="grey-lighten-4" rounded="lg" class="pa-3" style="max-height: 300px; overflow-y: auto;">
              <pre class="text-body-2" style="white-space: pre-wrap; font-size: 11px; font-family: 'Fira Code', monospace;">{{ JSON.stringify(log.payload, null, 2) }}</pre>
            </v-sheet>
          </v-col>

          <!-- Summary (manager role) -->
          <v-col cols="12" v-if="log.summary">
            <div class="text-caption text-grey-darken-1">Summary</div>
            <div class="font-weight-medium">{{ log.summary }}</div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text v-else class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
      </v-card-text>

      <v-card-actions class="pa-3">
        <v-spacer />
        <v-btn variant="text" @click="dialogVisible = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { ISystemLog } from '~/repository/modules/systemLogs'

const dialogVisible = defineModel<boolean>({ default: false })

const props = defineProps<{
  log: ISystemLog | null
}>()

const isModelLog = computed(() => {
  return ['model_created', 'model_updated', 'model_deleted'].includes(props.log?.type ?? '')
})

const changedFields = computed(() => {
  if (!props.log?.payload?.changed_fields) return []
  return props.log.payload.changed_fields as string[]
})

const levelColor = (level?: string) => {
  const colors: Record<string, string> = {
    debug: 'grey', info: 'blue', warning: 'orange', error: 'red', critical: 'red-darken-3',
  }
  return colors[level ?? ''] ?? 'grey'
}

const typeColor = (type?: string) => {
  const colors: Record<string, string> = {
    http_error: 'blue', exception: 'red', job_failed: 'deep-purple',
    job_slow: 'amber', warning: 'orange', critical: 'red-darken-4', system: 'teal',
    model_created: 'green', model_updated: 'indigo', model_deleted: 'red-darken-2',
  }
  return colors[type ?? ''] ?? 'grey'
}

const typeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    http_error: 'HTTP', exception: 'Exception', job_failed: 'Job Fail',
    job_slow: 'Job Slow', warning: 'Warning', critical: 'Critical', system: 'System',
    model_created: 'Created', model_updated: 'Updated', model_deleted: 'Deleted',
  }
  return labels[type ?? ''] ?? type ?? '—'
}

const formatDate = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const formatValue = (val: any): string => {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
</script>

<style scoped>
.diff-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.diff-old {
  background-color: rgba(244, 67, 54, 0.06);
  color: #c62828;
}

.diff-new {
  background-color: rgba(76, 175, 80, 0.06);
  color: #2e7d32;
}
</style>
