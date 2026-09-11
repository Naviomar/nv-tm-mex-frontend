<template>
  <v-card variant="flat" rounded="xl" class="modern-log-table elevation-2">
    <v-card-title class="pa-4 bg-grey-lighten-5 d-flex align-center">
      <v-icon color="indigo-darken-2" class="mr-2">mdi-bell-alert-outline</v-icon>
      <span class="text-h6 font-weight-bold">Alerts</span>
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

      <template #item.title="{ item }">
        <div class="d-flex align-center ga-2">
          <v-avatar :color="severityColor(item.severity)" size="32" rounded="lg">
            <v-icon color="white" size="18">{{ item.icon || 'mdi-bell-outline' }}</v-icon>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-medium text-truncate" style="max-width: 320px;">{{ item.title }}</div>
            <div class="text-caption text-grey-darken-1">{{ item.alert_type_code }}</div>
          </div>
        </div>
      </template>

      <template #item.category="{ item }">
        <span class="text-body-2">{{ item.category || '—' }}</span>
      </template>

      <template #item.severity="{ item }">
        <v-chip :color="severityColor(item.severity)" size="small" variant="flat" class="text-uppercase font-weight-bold">
          {{ item.severity }}
        </v-chip>
      </template>

      <template #item.reference="{ item }">
        <span class="text-body-2">{{ item.reference || '—' }}</span>
      </template>

      <template #item.status="{ item }">
        <div class="d-flex ga-1 flex-wrap">
          <v-chip size="x-small" :color="item.resolved_at ? 'success' : 'grey'" variant="tonal">
            {{ item.resolved_at ? 'Resolved' : 'Unresolved' }}
          </v-chip>
          <v-chip size="x-small" color="indigo" variant="tonal">
            {{ item.read_count }}/{{ item.total_recipients }} read
          </v-chip>
          <v-chip v-if="item.dismissed_count > 0" size="x-small" color="grey-darken-1" variant="tonal">
            {{ item.dismissed_count }} dismissed
          </v-chip>
        </div>
      </template>

      <template #item.creator="{ item }">
        <span class="text-body-2">{{ item.creator || 'System' }}</span>
      </template>

      <template #item.created_at="{ item }">
        <div class="text-body-2">
          <div class="font-weight-medium">{{ formatTime(item.created_at) }}</div>
          <div class="text-caption text-grey-darken-1">{{ formatDate(item.created_at) }}</div>
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
            Showing <strong>{{ logs.length }}</strong> of <strong>{{ pagination.total }}</strong> alerts
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
          <v-icon size="64" color="grey-lighten-1">mdi-bell-alert-outline</v-icon>
          <div class="text-h6 text-grey-darken-1 mt-4">No alerts found</div>
          <div class="text-body-2 text-grey mt-1">System-generated alerts will appear here</div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type { IAdminAlert } from '~/repository/modules/alerts'

const props = defineProps<{
  logs: IAdminAlert[]
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
  (e: 'row-click', log: IAdminAlert): void
}>()

const currentPage = computed({
  get: () => props.pagination.currentPage,
  set: (val: number) => emit('page-change', val),
})

const headers = [
  { title: 'Alert', key: 'title', width: '320px', sortable: false },
  { title: 'Category', key: 'category', width: '140px', sortable: false },
  { title: 'Severity', key: 'severity', width: '110px', sortable: false },
  { title: 'Reference', key: 'reference', width: '160px', sortable: false },
  { title: 'Status', key: 'status', width: '220px', sortable: false },
  { title: 'Created by', key: 'creator', width: '140px', sortable: false },
  { title: 'When', key: 'created_at', width: '140px', sortable: false },
  { title: '', key: 'actions', width: '60px', sortable: false, align: 'end' as const },
]

const onRowClick = (item: IAdminAlert) => {
  emit('row-click', item)
}

const severityColor = (severity?: string) => {
  switch (severity) {
    case 'critical': return 'red-darken-2'
    case 'error': return 'error'
    case 'warning': return 'orange-darken-1'
    default: return 'indigo'
  }
}

const formatDate = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City',
    month: 'short', day: 'numeric',
  })
}

const formatTime = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('es-MX', {
    timeZone: 'America/Mexico_City',
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
</style>
