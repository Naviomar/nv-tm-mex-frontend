<template>
  <v-card variant="flat" rounded="xl" class="modern-log-table elevation-2">
    <v-card-title class="pa-4 bg-grey-lighten-5 d-flex align-center">
      <v-icon color="indigo-darken-2" class="mr-2">mdi-email-multiple-outline</v-icon>
      <span class="text-h6 font-weight-bold">Mail Logs</span>
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

      <template #item.status="{ item }">
        <v-chip
          :color="item.status === 'no_recipient' ? 'error' : 'success'"
          size="small"
          variant="flat"
          class="font-weight-bold text-uppercase"
          :prepend-icon="item.status === 'no_recipient' ? 'mdi-email-off-outline' : 'mdi-email-check-outline'"
        >
          {{ item.status === 'no_recipient' ? 'Sin destinatario' : 'Enviado' }}
        </v-chip>
      </template>

      <template #item.mailable_short="{ item }">
        <div class="d-flex align-center ga-2">
          <v-avatar color="indigo" size="32" rounded="lg">
            <v-icon color="white" size="18">mdi-email-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-medium">{{ item.mailable_short || item.notification_short || '—' }}</div>
            <div class="text-caption text-grey-darken-1">{{ item.mailable_class || item.notification_class || '' }}</div>
          </div>
        </div>
      </template>

      <template #item.subject="{ item }">
        <div class="message-cell">
          <div class="text-body-2 font-weight-medium text-truncate" style="max-width: 380px;">
            {{ item.subject || '(sin asunto)' }}
          </div>
        </div>
      </template>

      <template #item.to="{ item }">
        <div class="text-body-2 text-truncate" style="max-width: 260px;">
          {{ formatAddresses(item.to) }}
        </div>
      </template>

      <template #item.triggered_by="{ item }">
        <span class="text-body-2 font-weight-medium">{{ item.triggered_by?.name ?? 'System' }}</span>
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
            Showing <strong>{{ logs.length }}</strong> of <strong>{{ pagination.total }}</strong> mail logs
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
          <v-icon size="64" color="grey-lighten-1">mdi-email-outline</v-icon>
          <div class="text-h6 text-grey-darken-1 mt-4">No mail logs found</div>
          <div class="text-body-2 text-grey mt-1">Every outgoing email will appear here</div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type { IMailLog, IMailLogAddress } from '~/repository/modules/mailLogs'

const props = defineProps<{
  logs: IMailLog[]
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
  (e: 'row-click', log: IMailLog): void
}>()

const currentPage = computed({
  get: () => props.pagination.currentPage,
  set: (val: number) => emit('page-change', val),
})

const headers = [
  { title: 'Status', key: 'status', width: '150px', sortable: false },
  { title: 'Mailable', key: 'mailable_short', width: '220px', sortable: false },
  { title: 'Subject', key: 'subject', sortable: false },
  { title: 'To', key: 'to', width: '260px', sortable: false },
  { title: 'Triggered by', key: 'triggered_by', width: '160px', sortable: false },
  { title: 'When', key: 'occurred_at', width: '140px', sortable: false },
  { title: '', key: 'actions', width: '60px', sortable: false, align: 'end' as const },
]

const onRowClick = (item: IMailLog) => {
  emit('row-click', item)
}

const formatAddresses = (addresses?: IMailLogAddress[]) => {
  if (!addresses || addresses.length === 0) return '—'
  return addresses.map((a) => a.address).join(', ')
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

.message-cell {
  min-height: 40px;
}
</style>
