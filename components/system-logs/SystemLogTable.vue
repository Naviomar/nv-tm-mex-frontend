<template>
  <v-card variant="flat" rounded="xl" class="modern-log-table elevation-2">
    <v-card-title class="pa-4 bg-grey-lighten-5 d-flex align-center">
      <v-icon color="indigo-darken-2" class="mr-2">mdi-format-list-bulleted</v-icon>
      <span class="text-h6 font-weight-bold">Recent Logs</span>
      <v-spacer />
      <v-chip size="small" variant="tonal" color="indigo">
        {{ pagination.total }} entries
      </v-chip>
    </v-card-title>
    
    <v-data-table
      :headers="headers"
      :items="logs"
      :loading="loading"
      density="comfortable"
      :items-per-page="-1"
      hover
      class="log-table-content"
      @click:row="(_: any, { item }: any) => onRowClick(item)"
    >
      <template #loading>
        <v-skeleton-loader type="table-row@5" />
      </template>

      <template #item.level="{ item }">
        <v-chip 
          :color="levelColor(item.level)" 
          size="small" 
          variant="flat" 
          class="font-weight-bold text-uppercase"
          :prepend-icon="levelIcon(item.level)"
        >
          {{ item.level }}
        </v-chip>
      </template>

      <template #item.type="{ item }">
        <div class="d-flex align-center ga-2">
          <v-avatar :color="typeColor(item.type)" size="32" rounded="lg">
            <v-icon :color="'white'" size="18">{{ typeIcon(item.type) }}</v-icon>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-medium">{{ typeLabel(item.type) }}</div>
            <div class="text-caption text-grey-darken-1">{{ item.type }}</div>
          </div>
        </div>
      </template>

      <template #item.message="{ item }">
        <div class="message-cell">
          <div class="text-body-2 font-weight-medium text-truncate" style="max-width: 500px;">
            {{ item.message || item.summary || '—' }}
          </div>
          <div v-if="item.payload?.user_error_message" class="text-caption text-red-darken-2 mt-1">
            <v-icon size="12" class="mr-1">mdi-alert-circle</v-icon>
            {{ item.payload.user_error_message }}
          </div>
        </div>
      </template>

      <template #item.user="{ item }">
        <div class="d-flex align-center ga-2">
          <v-avatar color="teal-lighten-4" size="28">
            <span class="text-caption font-weight-bold text-teal-darken-3">
              {{ getUserInitials(item.user?.name ?? 'SYS') }}
            </span>
          </v-avatar>
          <span class="text-body-2 font-weight-medium">{{ item.user?.name ?? 'System' }}</span>
        </div>
      </template>

      <template #item.occurred_at="{ item }">
        <div class="text-body-2">
          <div class="font-weight-medium">{{ formatTime(item.occurred_at) }}</div>
          <div class="text-caption text-grey-darken-1">{{ formatDate(item.occurred_at) }}</div>
        </div>
      </template>

      <template #item.actions="{ item }">
        <v-btn 
          icon="mdi-chevron-right" 
          size="small" 
          variant="text" 
          color="grey-darken-1"
          @click.stop="onRowClick(item)"
        />
      </template>

      <template #bottom>
        <div class="d-flex align-center justify-space-between pa-4 border-t">
          <div class="text-body-2 text-grey-darken-1">
            Showing <strong>{{ logs.length }}</strong> of <strong>{{ pagination.total }}</strong> logs
          </div>
          <v-pagination
            v-model="currentPage"
            :length="pagination.lastPage"
            :total-visible="6"
            density="comfortable"
            size="small"
            rounded="circle"
            active-color="indigo"
          />
        </div>
      </template>

      <template #no-data>
        <div class="text-center pa-12">
          <v-icon size="64" color="grey-lighten-1">mdi-file-document-outline</v-icon>
          <div class="text-h6 text-grey-darken-1 mt-4">No logs found</div>
          <div class="text-body-2 text-grey mt-1">Logs will appear here in real-time</div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type { ISystemLog } from '~/repository/modules/systemLogs'

const props = defineProps<{
  logs: ISystemLog[]
  loading: boolean
  pagination: {
    currentPage: number
    lastPage: number
    total: number
    perPage: number
  }
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'row-click', log: ISystemLog): void
}>()

const currentPage = computed({
  get: () => props.pagination.currentPage,
  set: (val: number) => emit('page-change', val),
})

const headers = [
  { title: 'Level', key: 'level', width: '120px', sortable: false },
  { title: 'Type', key: 'type', width: '180px', sortable: false },
  { title: 'Message', key: 'message', sortable: false },
  { title: 'User', key: 'user', width: '180px', sortable: false },
  { title: 'When', key: 'occurred_at', width: '140px', sortable: false },
  { title: '', key: 'actions', width: '60px', sortable: false, align: 'end' as const },
]

const onRowClick = (item: ISystemLog) => {
  emit('row-click', item)
}

const levelColor = (level?: string) => {
  const colors: Record<string, string> = {
    debug: 'grey', info: 'blue', warning: 'orange', error: 'red', critical: 'red-darken-3',
  }
  return colors[level ?? ''] ?? 'grey'
}

const levelIcon = (level?: string) => {
  const icons: Record<string, string> = {
    debug: 'mdi-bug', info: 'mdi-information', warning: 'mdi-alert', 
    error: 'mdi-alert-circle', critical: 'mdi-alert-octagon',
  }
  return icons[level ?? ''] ?? 'mdi-circle'
}

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const typeColor = (type?: string) => {
  const colors: Record<string, string> = {
    http_error: 'blue', exception: 'red', job_failed: 'deep-purple',
    job_slow: 'amber', warning: 'orange', critical: 'red-darken-4', system: 'teal',
    model_created: 'green', model_updated: 'indigo', model_deleted: 'red-darken-2',
  }
  return colors[type ?? ''] ?? 'grey'
}

const typeIcon = (type?: string) => {
  const icons: Record<string, string> = {
    http_error: 'mdi-web', exception: 'mdi-bug', job_failed: 'mdi-cog-off',
    job_slow: 'mdi-clock-alert', warning: 'mdi-alert', critical: 'mdi-alert-octagon', system: 'mdi-server',
    model_created: 'mdi-plus-circle', model_updated: 'mdi-pencil-circle', model_deleted: 'mdi-delete-circle',
  }
  return icons[type ?? ''] ?? 'mdi-information'
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
  return new Date(date).toLocaleDateString('es-MX', {
    month: 'short', day: 'numeric',
  })
}

const formatTime = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}
</script>

<style scoped>
.modern-log-table {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.log-table-content :deep(tr) {
  cursor: pointer;
  transition: all 0.2s ease;
}

.log-table-content :deep(tr:hover) {
  background: rgba(63, 81, 181, 0.04) !important;
  transform: translateX(2px);
}

.log-table-content :deep(.v-data-table__td) {
  padding: 12px 16px !important;
}

.message-cell {
  min-height: 40px;
}
</style>
