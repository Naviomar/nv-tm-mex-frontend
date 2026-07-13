<template>
  <v-dialog :model-value="show" @update:model-value="emit('update:show', $event)" max-width="900" scrollable>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-3 flex-wrap gap-2">
      <div class="d-flex align-center gap-2">
        <v-icon color="primary">mdi-bell-check-outline</v-icon>
        <span class="text-h6">Notification coverage<template v-if="consigneeName"> — {{ consigneeName }}</template></span>
        <v-chip size="x-small" color="error" variant="tonal" v-if="missingCount > 0">
          {{ missingCount }} missing
        </v-chip>
        <v-chip size="x-small" color="success" variant="tonal" v-else>
          All covered
        </v-chip>
      </div>
      <div class="d-flex align-center gap-3">
        <v-switch
          v-model="onlyMissing"
          label="Only missing"
          density="compact"
          color="error"
          hide-details
          inset
        />
        <v-text-field
          v-model="search"
          density="comfortable"
          variant="outlined"
          placeholder="Search notification..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
          style="max-width: 260px"
        />
      </div>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-0">
      <div v-if="filteredRows.length === 0" class="text-center py-8 text-medium-emphasis">
        <v-icon size="40" class="mb-2 opacity-30">mdi-bell-check-outline</v-icon>
        <p class="text-body-2">No notification types match this filter</p>
      </div>
      <v-table v-else density="compact" class="matrix-table">
        <thead>
          <tr>
            <th width="88">Actions</th>
            <th>Notification</th>
            <th>Status</th>
            <th>Configured email(s)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.id">
            <td>
              <v-btn
                size="x-small"
                variant="tonal"
                icon="mdi-plus"
                color="success"
                @click="openAddForNotification(row)"
              />
            </td>
            <td class="notification-cell">
              <div class="text-body-2 font-weight-medium">{{ formatNotificationName(row.short_name) }}</div>
              <div v-if="row.description" class="text-caption text-medium-emphasis">{{ row.description }}</div>
            </td>
            <td>
              <v-chip v-if="row.configured.length > 0" size="x-small" color="success" variant="tonal">
                {{ row.configured.length }} email(s)
              </v-chip>
              <v-chip v-else size="x-small" color="error" variant="tonal">
                Missing
              </v-chip>
            </td>
            <td>
              <div v-if="row.configured.length === 0" class="text-caption text-medium-emphasis">—</div>
              <div v-else class="d-flex flex-wrap gap-1 py-1">
                <v-chip
                  v-for="(entry, index) in row.configured"
                  :key="`${row.id}-${index}`"
                  size="default"
                  class="email-chip"
                  :color="entry.type === 'CC' ? 'amber-darken-2' : 'primary'"
                  variant="tonal"
                  @click="openEditForEmail(entry.emailData)"
                  v-tooltip="otherNotificationsCount(entry.emailData) > 0
                    ? `Also used in ${otherNotificationsCount(entry.emailData)} other notification(s) — click to manage all`
                    : 'Click to manage this email'"
                >
                  <span class="font-weight-bold mr-1">{{ entry.type }}</span>{{ entry.email }}
                  <v-chip v-if="otherNotificationsCount(entry.emailData) > 0" size="x-small" color="grey" variant="flat" class="ml-1">
                    +{{ otherNotificationsCount(entry.emailData) }}
                  </v-chip>
                </v-chip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    <ConsigneeEmailModal
      v-model:show="showModal"
      :mode="modalMode"
      :email-data="selectedEmail"
      :preselect-notification="preselectNotification"
      :catalogs="catalogs"
      :customer-id="id"
      @refresh="emit('refresh')"
    />
  </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
import { formatNotificationName } from '~/utils/mailNotifications'
import ConsigneeEmailModal from './ConsigneeEmailModal.vue'

const props = defineProps<{
  show: boolean
  emails: any[] | null | undefined
  catalogs: any
  id: string
  consigneeName?: string | null
}>()
const emit = defineEmits(['refresh', 'update:show'])

const search = ref('')
const onlyMissing = ref(false)

const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedEmail = ref<any>(null)
const preselectNotification = ref<{ id: number; short_name: string } | null>(null)

const customerMailNotifications = computed(() =>
  mailNotifications.filter((n: any) => n.is_for_consignee)
)

const matrixRows = computed(() => {
  return [...customerMailNotifications.value]
    .map((noty: any) => {
      const configured = (props.emails || [])
        .flatMap((email: any) =>
          (email.mail_notifications || [])
            .filter((mn: any) => mn.id === noty.id)
            .map((mn: any) => ({ email: email.email, emailData: email, type: mn.pivot?.type || 'TO' }))
        )
      return { id: noty.id, short_name: noty.short_name, description: noty.description, configured }
    })
    .sort((a, b) => a.short_name.localeCompare(b.short_name))
})

const missingCount = computed(() => matrixRows.value.filter((row) => row.configured.length === 0).length)

const filteredRows = computed(() => {
  return matrixRows.value.filter((row) => {
    if (onlyMissing.value && row.configured.length > 0) return false
    if (search.value && !row.short_name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
})

const openAddForNotification = (row: { id: number; short_name: string }) => {
  modalMode.value = 'create'
  selectedEmail.value = null
  preselectNotification.value = { id: row.id, short_name: row.short_name }
  showModal.value = true
}

const otherNotificationsCount = (emailData: any) => {
  const total = (emailData?.mail_notifications || []).length
  return Math.max(total - 1, 0)
}

const openEditForEmail = (emailData: any) => {
  modalMode.value = 'edit'
  selectedEmail.value = emailData
  preselectNotification.value = null
  showModal.value = true
}
</script>
<style scoped>
.matrix-table :deep(thead th) {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.02);
}

.matrix-table :deep(tbody tr:hover td) {
  background: rgba(var(--v-theme-primary), 0.03);
}

.matrix-table :deep(td) {
  vertical-align: top;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

.notification-cell {
  min-width: 220px;
}

.email-chip {
  font-size: 0.95rem !important;
}
</style>
